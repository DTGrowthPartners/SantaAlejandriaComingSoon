import { prisma } from "@/lib/prisma";
import { ACTIVE_RESERVATION_STATUSES } from "@/lib/domain";

/** Convierte "YYYY-MM-DD" a Date en medianoche UTC (coherente con @db.Date). */
export function parseDateInput(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

/** "YYYY-MM-DD" de un Date usando componentes UTC. */
export function toDateInput(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function nightsBetween(checkIn: Date, checkOut: Date): number {
  return Math.round((checkOut.getTime() - checkIn.getTime()) / 86_400_000);
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 86_400_000);
}

export type Conflict = { type: "reservation" | "block"; label: string };

/**
 * Regla crítica de disponibilidad:
 *   existing.checkIn < newCheckOut && existing.checkOut > newCheckIn
 * Solo cuentan reservas activas y bloqueos de habitación.
 */
export async function findConflicts(p: {
  hotelId: string;
  roomId: string;
  checkIn: Date;
  checkOut: Date;
  excludeId?: string;
}): Promise<Conflict[]> {
  const [reservations, blocks] = await Promise.all([
    prisma.reservation.findMany({
      where: {
        hotelId: p.hotelId,
        roomId: p.roomId,
        ...(p.excludeId ? { id: { not: p.excludeId } } : {}),
        reservationStatus: { in: ACTIVE_RESERVATION_STATUSES },
        checkIn: { lt: p.checkOut },
        checkOut: { gt: p.checkIn },
      },
      select: { guestName: true },
    }),
    prisma.roomBlock.findMany({
      where: {
        roomId: p.roomId,
        active: true,
        startDate: { lt: p.checkOut },
        endDate: { gt: p.checkIn },
      },
      select: { reason: true },
    }),
  ]);

  return [
    ...reservations.map((r) => ({ type: "reservation" as const, label: r.guestName })),
    ...blocks.map((b) => ({ type: "block" as const, label: b.reason ?? "Bloqueo" })),
  ];
}

/** Deriva estados de pago a partir de montos. */
export function derivePaymentState(paid: number, total: number, deposit: number) {
  const balance = Math.max(0, total - paid);
  if (paid <= 0) return { balance, reservationStatus: null };
  if (paid >= total && total > 0) return { balance, reservationStatus: "PAID" as const };
  if (deposit > 0 && paid >= deposit) return { balance, reservationStatus: "DEPOSIT_PAID" as const };
  return { balance, reservationStatus: "DEPOSIT_PAID" as const };
}
