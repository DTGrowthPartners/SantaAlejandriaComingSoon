import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { verifyBoldSignature } from "@/lib/bold";
import { totalDue, isActiveStatus } from "@/lib/domain";
import { findConflicts } from "@/lib/reservations";
import { notifyPaymentReceived } from "@/lib/notify";

/** true si el error es una violación de constraint único (P2002) de Prisma. */
function isUniqueViolation(e: unknown): boolean {
  return e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002";
}

type BoldEvent = {
  id: string;
  type: "SALE_APPROVED" | "SALE_REJECTED" | "VOID_APPROVED" | "VOID_REJECTED" | string;
  subject: string;
  data: {
    payment_id: string;
    amount?: { total?: number; currency?: string };
    metadata?: { reference?: string | null };
    payer_email?: string | null;
    payment_method?: string | null;
  };
};

/** Ping de verificación (algunas plataformas hacen GET al registrar). */
export function boldWebhookGet() {
  return NextResponse.json({ ok: true, webhook: "bold" });
}

/**
 * Handler compartido del webhook de Bold. Se expone en dos rutas
 * (/api/webhooks/bold y /api/bold-webhook) por si Bold usa cualquiera.
 * Debe responder 200 en <2s; Bold reintenta hasta 5 veces si no.
 */
export async function handleBoldWebhook(req: NextRequest): Promise<NextResponse> {
  const rawBody = await req.text();

  const signature = req.headers.get("x-bold-signature");
  const valid = await verifyBoldSignature(rawBody, signature);
  if (!valid) {
    console.warn(`[bold-webhook] firma inválida (sig=${signature?.slice(0, 12) ?? "null"}…)`);
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  let event: BoldEvent;
  try {
    event = JSON.parse(rawBody) as BoldEvent;
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const paymentId = event.data?.payment_id ?? event.subject;
  const reference = event.data?.metadata?.reference ?? "";
  const amount = Math.round(event.data?.amount?.total ?? 0);

  console.log(`[bold-webhook] ${event.type} ref=${reference} pay=${paymentId} amount=${amount}`);

  if (paymentId) {
    const dup = await prisma.payment.findFirst({
      where: { providerPaymentId: paymentId, status: "APPROVED" },
    });
    if (dup) return NextResponse.json({ ok: true, duplicate: true });
  }

  const match = /^RSV-(\d+)$/.exec(reference);
  const reservation = match
    ? await prisma.reservation.findUnique({ where: { number: parseInt(match[1], 10) } })
    : null;

  if (!reservation) {
    console.warn(`[bold-webhook] evento ${event.type} sin reserva (ref=${reference})`);
    return NextResponse.json({ ok: true, unmatched: true });
  }

  if (event.type === "SALE_APPROVED") {
    // Si la reserva estaba inactiva (hold vencido → EXPIRED, o cancelada) y el
    // pago llega tarde, solo se puede reactivar si el cuarto sigue libre. Si ya
    // fue reasignado a otra reserva, NO reactivamos (evita sobreventa): se
    // registra el pago y se marca para que recepción reubique al huésped.
    const wasInactive = !isActiveStatus(reservation.reservationStatus);
    let reassignNeeded = false;
    if (wasInactive) {
      const conflicts = await findConflicts({
        hotelId: reservation.hotelId,
        roomId: reservation.roomId,
        checkIn: reservation.checkIn,
        checkOut: reservation.checkOut,
        excludeId: reservation.id,
      });
      reassignNeeded = conflicts.length > 0;
    }

    const newPaid = reservation.paidAmount + amount;
    const due = totalDue(reservation.totalAmount, reservation.applyIva);
    const balance = Math.max(0, due - newPaid);

    let reservationStatus = reservation.reservationStatus;
    if (!reassignNeeded) {
      if (reservation.totalAmount > 0 && newPaid >= due) reservationStatus = "PAID";
      else if (newPaid > 0) reservationStatus = "DEPOSIT_PAID";
    }

    try {
      await prisma.$transaction([
        prisma.payment.create({
          data: {
            reservationId: reservation.id,
            provider: "bold",
            providerPaymentId: paymentId,
            providerReference: reference,
            amount,
            status: "APPROVED",
            method: event.data?.payment_method ?? "bold",
            paidAt: new Date(),
            rawPayload: JSON.parse(rawBody),
          },
        }),
        prisma.reservation.update({
          where: { id: reservation.id },
          data: {
            paidAmount: newPaid,
            balanceAmount: balance,
            paymentStatus: "APPROVED",
            reservationStatus,
            holdExpiresAt: null, // pagado → ya no es un hold que expira
            ...(reassignNeeded
              ? { notes: `${reservation.notes ?? ""} · ⚠️ PAGO TARDÍO: el cuarto ya fue reasignado, requiere reubicación`.trim() }
              : {}),
            history: {
              create: {
                action: reassignNeeded ? "payment_needs_reassign" : "payment",
                newData: { provider: "bold", paymentId, amount, newPaid, balance, event: event.type, reassignNeeded },
                userName: "Bold",
              },
            },
          },
        }),
      ]);
    } catch (e) {
      // Reintento de Bold con el mismo payment_id → el constraint único lo bloquea.
      // Es idempotente: el pago ya quedó registrado, respondemos 200 sin duplicar.
      if (isUniqueViolation(e)) return NextResponse.json({ ok: true, duplicate: true });
      throw e;
    }
    revalidatePath("/dashboard/forecast");
    revalidatePath("/dashboard/payments");
    await notifyPaymentReceived({
      hotelId: reservation.hotelId,
      number: reservation.number,
      guestName: reservation.guestName,
      amount,
    });
  } else if (event.type === "SALE_REJECTED") {
    await prisma.reservation.update({
      where: { id: reservation.id },
      data: {
        paymentStatus: "REJECTED",
        history: {
          create: {
            action: "payment_rejected",
            newData: { provider: "bold", paymentId, amount, event: event.type },
            userName: "Bold",
          },
        },
      },
    });
  } else if (event.type === "VOID_APPROVED") {
    await prisma.reservation.update({
      where: { id: reservation.id },
      data: {
        paymentStatus: "REFUNDED",
        history: {
          create: {
            action: "payment_voided",
            newData: { provider: "bold", paymentId, amount, event: event.type },
            userName: "Bold",
          },
        },
      },
    });
  }

  return NextResponse.json({ ok: true });
}
