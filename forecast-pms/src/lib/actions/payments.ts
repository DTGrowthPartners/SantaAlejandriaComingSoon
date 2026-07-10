"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession, canManagePayments } from "@/lib/auth";
import { getBoldLink, createBoldPaymentLink, invalidateBoldLinksCache } from "@/lib/bold";
import { totalConIva, IVA_RATE } from "@/lib/domain";
import { formatCOP } from "@/lib/format";
import { notifyPaymentReceived } from "@/lib/notify";

/**
 * Genera un link de pago de Bold por un monto (abono/anticipo) sobre una
 * reserva existente. Cuando el huésped paga, el webhook lo suma como abono.
 */
export async function createDepositLinkAction(input: {
  reservationId: string;
  amount: number;
}): Promise<{ ok: boolean; url?: string; error?: string }> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Sesión expirada, vuelve a entrar." };
  if (!canManagePayments(session.role))
    return { ok: false, error: "No tienes permiso para generar links de pago." };

  const r = await prisma.reservation.findFirst({
    where: { id: input.reservationId, hotelId: session.hotelId },
  });
  if (!r) return { ok: false, error: "La reserva no existe." };

  const amount = Math.round(input.amount);
  if (!Number.isFinite(amount) || amount < 1000)
    return { ok: false, error: "El monto mínimo es $1.000." };
  if (r.balanceAmount > 0 && amount > r.balanceAmount)
    return { ok: false, error: `El monto supera el saldo pendiente (${formatCOP(r.balanceAmount)}).` };

  // El abono es un monto BRUTO (lo que paga el huésped); se separa el IVA proporcional.
  const subtotal = Math.round(amount / (1 + IVA_RATE));
  const iva = amount - subtotal;

  let link;
  try {
    link = await createBoldPaymentLink({
      reference: `RSV-${r.number}`,
      subtotal,
      iva,
      description: `Abono reserva #${r.number} · ${r.guestName}`.slice(0, 100),
      payerEmail: r.guestEmail,
      callbackUrl: `https://santalejandriahotels.com/cartagena?reserva=${r.number}`,
    });
  } catch (e) {
    console.error("[deposit-link] Bold error:", e);
    return { ok: false, error: "Bold no pudo generar el link. Intenta de nuevo." };
  }

  await prisma.$transaction([
    prisma.payment.create({
      data: {
        reservationId: r.id,
        provider: "bold",
        providerPaymentId: link.paymentLinkId,
        providerReference: `RSV-${r.number}`,
        paymentLink: link.url,
        amount,
        status: "LINK_CREATED",
        method: "link",
      },
    }),
    prisma.reservation.update({
      where: { id: r.id },
      data: {
        paymentLink: link.url,
        paymentStatus: r.paymentStatus === "APPROVED" ? r.paymentStatus : "LINK_CREATED",
        reservationStatus: r.reservationStatus === "PENDING" ? "PENDING_PAYMENT" : r.reservationStatus,
        history: {
          create: {
            action: "deposit_link",
            newData: { amount, lnk: link.paymentLinkId },
            userId: session.userId,
            userName: session.name,
          },
        },
      },
    }),
  ]);

  invalidateBoldLinksCache(); // que el nuevo link aparezca ya en el historial
  revalidatePath("/dashboard/payments");
  revalidatePath("/dashboard/forecast");
  return { ok: true, url: link.url };
}

export type ReconcileResult = {
  ok: boolean;
  checked: number;
  paid: number;
  expired: number;
  error?: string;
};

/**
 * Consulta en Bold el estado real de cada link de pago del PMS que no esté
 * finalizado y actualiza el PMS: si el link está PAID lo marca pagado (como el
 * webhook), si está EXPIRED lo marca vencido. Sirve de respaldo al webhook.
 */
export async function reconcileBoldPayments(): Promise<ReconcileResult> {
  const session = await getSession();
  if (!session) return { ok: false, checked: 0, paid: 0, expired: 0, error: "Sesión expirada." };

  const list = await prisma.reservation.findMany({
    where: {
      hotelId: session.hotelId,
      paymentLink: { not: null },
      reservationStatus: { notIn: ["PAID", "CANCELLED"] },
    },
    include: { payments: true },
    take: 100,
  });

  let checked = 0;
  let paid = 0;
  let expired = 0;

  for (const r of list) {
    const lnk = r.payments.find((p) => p.providerPaymentId?.startsWith("LNK"))?.providerPaymentId;
    if (!lnk) continue;

    const bold = await getBoldLink(lnk);
    if (!bold) continue;
    checked++;

    const status = (bold.status ?? "").toUpperCase();

    if (status === "PAID") {
      const already = r.payments.some((p) => p.status === "APPROVED");
      if (already) continue;

      // Usa el transaction_id de Bold como id del pago: es el MISMO que manda el
      // webhook, así ninguno de los dos procesa el pago dos veces (dedup común).
      const paymentId = bold.transaction_id ?? lnk;
      const amount = bold.total ?? totalConIva(r.totalAmount);
      const newPaid = r.paidAmount + amount;
      const totalDue = totalConIva(r.totalAmount);
      const balance = Math.max(0, totalDue - newPaid);
      const reservationStatus = r.totalAmount > 0 && newPaid >= totalDue ? "PAID" : "DEPOSIT_PAID";

      await prisma.$transaction([
        prisma.payment.create({
          data: {
            reservationId: r.id,
            provider: "bold",
            providerPaymentId: paymentId,
            providerReference: bold.reference ?? `RSV-${r.number}`,
            amount,
            status: "APPROVED",
            method: bold.payment_method ?? "bold",
            paidAt: new Date(),
          },
        }),
        prisma.reservation.update({
          where: { id: r.id },
          data: {
            paidAmount: newPaid,
            balanceAmount: balance,
            paymentStatus: "APPROVED",
            reservationStatus,
            holdExpiresAt: null,
            history: {
              create: {
                action: "payment",
                newData: { provider: "bold", via: "reconcile", lnk, amount },
                userId: session.userId,
                userName: session.name,
              },
            },
          },
        }),
      ]);
      await notifyPaymentReceived({
        hotelId: r.hotelId,
        number: r.number,
        guestName: r.guestName,
        amount,
      });
      paid++;
    } else if (status === "EXPIRED" && r.paymentStatus !== "EXPIRED") {
      await prisma.reservation.update({
        where: { id: r.id },
        data: {
          paymentStatus: "EXPIRED",
          history: {
            create: {
              action: "payment_expired",
              newData: { provider: "bold", via: "reconcile", lnk },
              userId: session.userId,
              userName: session.name,
            },
          },
        },
      });
      expired++;
    }
  }

  revalidatePath("/dashboard/payments");
  revalidatePath("/dashboard/forecast");
  return { ok: true, checked, paid, expired };
}
