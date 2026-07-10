"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { getBoldLink } from "@/lib/bold";
import { totalConIva } from "@/lib/domain";
import { notifyPaymentReceived } from "@/lib/notify";

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
            providerPaymentId: lnk,
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
