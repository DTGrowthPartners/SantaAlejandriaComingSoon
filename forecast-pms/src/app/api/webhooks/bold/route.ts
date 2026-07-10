import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifyBoldSignature } from "@/lib/bold";
import { totalConIva } from "@/lib/domain";

export const runtime = "nodejs";

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

/**
 * POST /api/webhooks/bold — notificaciones de pago de Bold.
 * Debe responder 200 en <2s; Bold reintenta hasta 5 veces si no.
 */
export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  const signature = req.headers.get("x-bold-signature");
  const valid = await verifyBoldSignature(rawBody, signature);
  if (!valid) {
    console.warn("[webhooks/bold] firma inválida");
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

  // Idempotencia: si ya procesamos este payment_id aprobado, respondemos 200.
  if (paymentId) {
    const dup = await prisma.payment.findFirst({
      where: { providerPaymentId: paymentId, status: "APPROVED" },
    });
    if (dup) return NextResponse.json({ ok: true, duplicate: true });
  }

  // Localizar la reserva por referencia "RSV-<number>".
  const match = /^RSV-(\d+)$/.exec(reference);
  const reservation = match
    ? await prisma.reservation.findUnique({ where: { number: parseInt(match[1], 10) } })
    : null;

  if (!reservation) {
    console.warn(`[webhooks/bold] evento ${event.type} sin reserva (ref=${reference})`);
    return NextResponse.json({ ok: true, unmatched: true });
  }

  if (event.type === "SALE_APPROVED") {
    const newPaid = reservation.paidAmount + amount;
    const totalDue = totalConIva(reservation.totalAmount);
    const balance = Math.max(0, totalDue - newPaid);

    let reservationStatus = reservation.reservationStatus;
    if (reservation.totalAmount > 0 && newPaid >= totalDue) reservationStatus = "PAID";
    else if (newPaid > 0) reservationStatus = "DEPOSIT_PAID";

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
          history: {
            create: {
              action: "payment",
              newData: { provider: "bold", paymentId, amount, newPaid, balance, event: event.type },
              userName: "Bold",
            },
          },
        },
      }),
    ]);
    revalidatePath("/dashboard/forecast");
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
