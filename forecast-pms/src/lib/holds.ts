import { prisma } from "@/lib/prisma";

/** Minutos que se mantiene "apartada" la habitación esperando el pago online. */
export const HOLD_MINUTES = 20;
/** Margen extra antes de borrar, para dar tiempo a que llegue el webhook de Bold. */
const CLEANUP_GRACE_MIN = 10;

/**
 * Elimina los "holds" de reservas web con pago online que ya vencieron y siguen
 * sin pagar (PENDING_PAYMENT + holdExpiresAt + paidAmount 0). Así el cuarto se
 * libera y no quedan reservas fantasma. No toca reservas normales ni las que ya
 * tienen algún abono. Nunca lanza.
 */
export async function expireStaleHolds(hotelId?: string): Promise<void> {
  try {
    const cutoff = new Date(Date.now() - CLEANUP_GRACE_MIN * 60_000);
    await prisma.reservation.deleteMany({
      where: {
        ...(hotelId ? { hotelId } : {}),
        reservationStatus: "PENDING_PAYMENT",
        paidAmount: 0,
        holdExpiresAt: { not: null, lt: cutoff },
      },
    });
  } catch (e) {
    console.error("[holds] no se pudieron limpiar los holds vencidos:", e);
  }
}
