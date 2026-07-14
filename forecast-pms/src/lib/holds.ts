import { prisma } from "@/lib/prisma";

/** Minutos que se mantiene "apartada" la habitación esperando el pago online. */
export const HOLD_MINUTES = 20;
/** Margen extra antes de borrar, para dar tiempo a que llegue el webhook de Bold. */
const CLEANUP_GRACE_MIN = 10;

/**
 * Vence los "holds" de reservas web con pago online que ya pasaron su hora sin
 * pagar (PENDING_PAYMENT + holdExpiresAt + paidAmount 0). Se marcan como EXPIRED
 * (estado inactivo → libera el cuarto de disponibilidad), pero NO se borran: así,
 * si el pago de Bold llega tarde, el webhook todavía encuentra la reserva y puede
 * conciliar el pago (evita el "pago recibido pero reserva borrada"). No toca
 * reservas normales ni las que ya tienen algún abono. Nunca lanza.
 */
export async function expireStaleHolds(hotelId?: string): Promise<void> {
  try {
    const cutoff = new Date(Date.now() - CLEANUP_GRACE_MIN * 60_000);
    await prisma.reservation.updateMany({
      where: {
        ...(hotelId ? { hotelId } : {}),
        reservationStatus: "PENDING_PAYMENT",
        paidAmount: 0,
        holdExpiresAt: { not: null, lt: cutoff },
      },
      data: { reservationStatus: "EXPIRED", holdExpiresAt: null },
    });
  } catch (e) {
    console.error("[holds] no se pudieron vencer los holds:", e);
  }
}
