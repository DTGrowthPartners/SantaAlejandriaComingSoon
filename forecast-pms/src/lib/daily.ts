import { prisma } from "@/lib/prisma";
import { ACTIVE_RESERVATION_STATUSES } from "@/lib/domain";
import type { BookingChannel, ReservationStatus, PaymentStatus } from "@/generated/prisma/client";

export type DailyReservation = {
  id: string;
  number: number;
  guestName: string;
  guestPhone: string | null;
  roomName: string;
  channel: BookingChannel;
  reservationStatus: ReservationStatus;
  paymentStatus: PaymentStatus;
  checkIn: string;
  checkOut: string;
  nights: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
};

export type DailySummary = {
  todayLabel: string;
  kpis: {
    checkIns: number;
    checkOuts: number;
    inHouse: number;
    availableToday: number;
    occupancyPct: number;
    toCollectToday: number;
    pendingBalanceTotal: number;
    pendingCount: number;
  };
  checkIns: DailyReservation[];
  checkOuts: DailyReservation[];
  inHouse: DailyReservation[];
  toCollect: DailyReservation[];
};

function todayUtc(tz: string): Date {
  const f = new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" });
  const [y, m, d] = f.format(new Date()).split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export async function getDailySummary(hotelId: string, tz = "America/Bogota"): Promise<DailySummary> {
  const today = todayUtc(tz);
  const t = today.getTime();

  const [rooms, active] = await Promise.all([
    prisma.room.count({ where: { hotelId, active: true } }),
    prisma.reservation.findMany({
      where: {
        hotelId,
        reservationStatus: { in: ACTIVE_RESERVATION_STATUSES },
        checkOut: { gte: today },
      },
      include: { room: { select: { name: true } } },
      orderBy: { checkIn: "asc" },
    }),
  ]);

  const mapRow = (r: (typeof active)[number]): DailyReservation => ({
    id: r.id,
    number: r.number,
    guestName: r.guestName,
    guestPhone: r.guestPhone,
    roomName: r.room.name,
    channel: r.channel,
    reservationStatus: r.reservationStatus,
    paymentStatus: r.paymentStatus,
    checkIn: r.checkIn.toISOString(),
    checkOut: r.checkOut.toISOString(),
    nights: r.nights,
    totalAmount: r.totalAmount,
    paidAmount: r.paidAmount,
    balanceAmount: r.balanceAmount,
  });

  const checkIns = active.filter((r) => r.checkIn.getTime() === t).map(mapRow);
  const checkOuts = active.filter((r) => r.checkOut.getTime() === t).map(mapRow);
  const inHouse = active.filter((r) => r.checkIn.getTime() < t && r.checkOut.getTime() > t).map(mapRow);
  const occupyingToday = active.filter((r) => r.checkIn.getTime() <= t && r.checkOut.getTime() > t);
  const toCollect = active
    .filter((r) => r.balanceAmount > 0)
    .sort((a, b) => a.checkIn.getTime() - b.checkIn.getTime())
    .map(mapRow);

  const occupancyPct = rooms > 0 ? Math.round((occupyingToday.length / rooms) * 100) : 0;

  const todayLabel = new Intl.DateTimeFormat("es-CO", {
    timeZone: "UTC",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(today);

  return {
    todayLabel,
    kpis: {
      checkIns: checkIns.length,
      checkOuts: checkOuts.length,
      inHouse: inHouse.length,
      availableToday: Math.max(0, rooms - occupyingToday.length),
      occupancyPct,
      toCollectToday: checkIns.reduce((s, r) => s + r.balanceAmount, 0),
      pendingBalanceTotal: toCollect.reduce((s, r) => s + r.balanceAmount, 0),
      pendingCount: toCollect.length,
    },
    checkIns,
    checkOuts,
    inHouse,
    toCollect,
  };
}
