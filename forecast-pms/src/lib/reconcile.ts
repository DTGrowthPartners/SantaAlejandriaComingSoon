import "server-only";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getBoldLink } from "@/lib/bold";
import { totalDue } from "@/lib/domain";
import { notifyPaymentReceived } from "@/lib/notify";

export type ReconcileResult = {
  ok: boolean;
  checked: number;
  paid: number;
  expired: number;
  error?: string;
};

/**
 * Núcleo de la conciliación con Bold, SIN sesión: sirve tanto para el botón del
 * panel (con sesión) como para el cron automático. Consulta en Bold el estado
 * real de cada link de pago del PMS que no esté finalizado y actualiza el PMS:
 * link PAID → lo marca pagado (como el webhook); link EXPIRED → lo marca vencido.
 * Es un respaldo del webhook: si un evento no llegó, esto lo recupera.
 */
export async function reconcileBoldPaymentsCore(
  hotelId: string,
  actor: { userId?: string; userName: string },
): Promise<ReconcileResult> {
  const list = await prisma.reservation.findMany({
    where: {
      hotelId,
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
      // Ya conciliado (por el webhook o una corrida previa): no dupliques.
      const already = r.payments.some((p) => p.status === "APPROVED");
      if (already) continue;

      // El transaction_id de Bold como id del pago. Si el webhook ya lo registró
      // con este mismo id, el @@unique([provider, providerPaymentId]) lo bloquea;
      // si difiere, el "already" de arriba evita el doble conteo.
      const paymentId = bold.transaction_id ?? lnk;
      const due = totalDue(r.totalAmount, r.applyIva);
      const amount = bold.total ?? due;
      const newPaid = r.paidAmount + amount;
      const balance = Math.max(0, due - newPaid);
      const reservationStatus = r.totalAmount > 0 && newPaid >= due ? "PAID" : "DEPOSIT_PAID";

      try {
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
                  ...(actor.userId ? { userId: actor.userId } : {}),
                  userName: actor.userName,
                },
              },
            },
          }),
        ]);
      } catch (e) {
        // Carrera con el webhook que registró el mismo pago con el mismo id.
        if (e instanceof Error && "code" in e && (e as { code?: string }).code === "P2002") continue;
        throw e;
      }
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
              ...(actor.userId ? { userId: actor.userId } : {}),
              userName: actor.userName,
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
