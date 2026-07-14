import { requireUser, canEditReservations, canManagePayments } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ReservationsTable, type ReservationRow } from "@/components/reservations/ReservationsTable";

export default async function ReservationsPage() {
  const user = await requireUser();

  const [reservations, rooms] = await Promise.all([
    prisma.reservation.findMany({
      where: { hotelId: user.hotelId },
      orderBy: { checkIn: "desc" },
      include: { room: { select: { name: true } } },
    }),
    prisma.room.findMany({
      where: { hotelId: user.hotelId, active: true },
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true, type: true, directusSlug: true },
    }),
  ]);

  const rows: ReservationRow[] = reservations.map((r) => ({
    id: r.id,
    number: r.number,
    roomId: r.roomId,
    roomName: r.room.name,
    guestName: r.guestName,
    guestPhone: r.guestPhone,
    guestEmail: r.guestEmail,
    channel: r.channel,
    reservationStatus: r.reservationStatus,
    paymentStatus: r.paymentStatus,
    checkIn: r.checkIn.toISOString(),
    checkOut: r.checkOut.toISOString(),
    nights: r.nights,
    guestsCount: r.guestsCount,
    totalAmount: r.totalAmount,
    applyIva: r.applyIva,
    depositRequired: r.depositRequired,
    paidAmount: r.paidAmount,
    balanceAmount: r.balanceAmount,
    notes: r.notes,
    roomsCount: r.roomsCount,
    upgrade: r.upgrade,
    mealPlan: r.mealPlan,
    arrivalTime: r.arrivalTime,
    nationality: r.nationality,
    extraNights: r.extraNights,
    company: r.company,
    cardRef: r.cardRef,
    virtualAdvance: r.virtualAdvance,
  }));

  return (
    <ReservationsTable
      reservations={rows}
      rooms={rooms}
      canEdit={canEditReservations(user.role)}
      canPay={canManagePayments(user.role)}
    />
  );
}
