"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession, canManagePayments } from "@/lib/auth";
import { createBoldPaymentLink, invalidateBoldLinksCache } from "@/lib/bold";
import { IVA_RATE } from "@/lib/domain";
import { formatCOP } from "@/lib/format";
import { reconcileBoldPaymentsCore, type ReconcileResult } from "@/lib/reconcile";

export type { ReconcileResult };

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

  // El abono es un monto BRUTO (lo que paga el huésped). Si la reserva lleva IVA,
  // se separa el IVA proporcional; si está exenta, todo es subtotal y el IVA es 0.
  const subtotal = r.applyIva ? Math.round(amount / (1 + IVA_RATE)) : amount;
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

/**
 * Botón "Conciliar" del panel: respaldo manual del webhook. Corre el núcleo de
 * conciliación para el hotel de la sesión. El cron automático usa el mismo core
 * (ver /api/cron/reconcile) sin sesión.
 */
export async function reconcileBoldPayments(): Promise<ReconcileResult> {
  const session = await getSession();
  if (!session) return { ok: false, checked: 0, paid: 0, expired: 0, error: "Sesión expirada." };
  if (!canManagePayments(session.role))
    return { ok: false, checked: 0, paid: 0, expired: 0, error: "No tienes permiso." };

  return reconcileBoldPaymentsCore(session.hotelId, {
    userId: session.userId,
    userName: session.name,
  });
}
