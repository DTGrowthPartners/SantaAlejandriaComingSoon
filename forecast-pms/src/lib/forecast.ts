import { prisma } from "@/lib/prisma";
import type {
  BookingChannel,
  ReservationStatus,
  PaymentStatus,
} from "@/generated/prisma/client";
import { ACTIVE_RESERVATION_STATUSES } from "@/lib/domain";

export type ForecastRoom = { id: string; name: string; type: string | null };

export type ForecastReservation = {
  id: string;
  number: number;
  roomId: string;
  guestName: string;
  guestPhone: string | null;
  guestEmail: string | null;
  channel: BookingChannel;
  reservationStatus: ReservationStatus;
  paymentStatus: PaymentStatus;
  checkIn: string;
  checkOut: string;
  nights: number;
  guestsCount: number;
  totalAmount: number;
  depositRequired: number;
  paidAmount: number;
  balanceAmount: number;
  notes: string | null;
  // Posición en la grilla (líneas de CSS grid; la columna 1 es la etiqueta de habitación).
  startCol: number;
  endCol: number;
  continuesLeft: boolean;
  continuesRight: boolean;
};

export type ForecastBlock = {
  id: string;
  roomId: string;
  reason: string | null;
  startCol: number;
  endCol: number;
};

export type ForecastDay = {
  day: number;
  weekday: string;
  isWeekend: boolean;
  isToday: boolean;
};

export type ForecastKpis = {
  occupancyPct: number;
  roomsTotal: number;
  availableToday: number;
  checkInsToday: number;
  checkOutsToday: number;
  projectedRevenue: number;
  depositsReceived: number;
  pendingBalance: number;
  pendingPaymentCount: number;
};

export type ForecastData = {
  year: number;
  month: number;
  monthLabel: string;
  daysInMonth: number;
  days: ForecastDay[];
  rooms: ForecastRoom[];
  reservationsByRoom: Record<string, ForecastReservation[]>;
  blocksByRoom: Record<string, ForecastBlock[]>;
  dayTotals: number[]; // habitaciones ocupadas por día (índice 0 = día 1)
  kpis: ForecastKpis;
};

const WEEKDAYS = ["D", "L", "M", "M", "J", "V", "S"];
const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const DAY_MS = 86_400_000;
const utc = (y: number, m1: number, d: number) => new Date(Date.UTC(y, m1 - 1, d));
const dayDiff = (a: Date, b: Date) => Math.round((b.getTime() - a.getTime()) / DAY_MS);

/** Fecha de "hoy" en la zona horaria del hotel, como medianoche UTC del día calendario. */
function todayUtc(tz: string): { date: Date; y: number; m: number; d: number } {
  const f = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const [y, m, d] = f.format(new Date()).split("-").map(Number);
  return { date: utc(y, m, d), y, m, d };
}

export async function getForecastData(
  hotelId: string,
  year: number,
  month: number,
  tz = "America/Bogota",
): Promise<ForecastData> {
  const monthStart = utc(year, month, 1);
  const monthEndExcl = month === 12 ? utc(year + 1, 1, 1) : utc(year, month + 1, 1);
  const daysInMonth = dayDiff(monthStart, monthEndExcl);

  const [rooms, reservations, blocks] = await Promise.all([
    prisma.room.findMany({
      where: { hotelId, active: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.reservation.findMany({
      where: {
        hotelId,
        checkIn: { lt: monthEndExcl },
        checkOut: { gt: monthStart },
      },
    }),
    prisma.roomBlock.findMany({
      where: {
        active: true,
        room: { hotelId },
        startDate: { lt: monthEndExcl },
        endDate: { gt: monthStart },
      },
    }),
  ]);

  const today = todayUtc(tz);
  const isCurrentMonth = today.y === year && today.m === month;

  const days: ForecastDay[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const dow = utc(year, month, d).getUTCDay();
    days.push({
      day: d,
      weekday: WEEKDAYS[dow],
      isWeekend: dow === 0 || dow === 6,
      isToday: isCurrentMonth && d === today.d,
    });
  }

  /** Convierte un rango [inicio, fin) a líneas de grid, recortado al mes. */
  function toCols(start: Date, endExcl: Date) {
    const startOffset = dayDiff(monthStart, start) + 1; // día del mes (1..daysInMonth)
    const endOffsetExcl = dayDiff(monthStart, endExcl) + 1;
    const occStart = Math.max(1, startOffset);
    const occEnd = Math.min(daysInMonth + 1, endOffsetExcl);
    return {
      startCol: occStart + 1,
      endCol: occEnd + 1,
      continuesLeft: startOffset < 1,
      continuesRight: endOffsetExcl > daysInMonth + 1,
      visible: occEnd > occStart,
    };
  }

  const GRID_STATUSES: ReservationStatus[] = [...ACTIVE_RESERVATION_STATUSES, "NO_SHOW"];
  const reservationsByRoom: Record<string, ForecastReservation[]> = {};
  for (const r of reservations) {
    if (!GRID_STATUSES.includes(r.reservationStatus)) continue;
    const pos = toCols(r.checkIn, r.checkOut);
    if (!pos.visible) continue;
    (reservationsByRoom[r.roomId] ??= []).push({
      id: r.id,
      number: r.number,
      roomId: r.roomId,
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
      depositRequired: r.depositRequired,
      paidAmount: r.paidAmount,
      balanceAmount: r.balanceAmount,
      notes: r.notes,
      startCol: pos.startCol,
      endCol: pos.endCol,
      continuesLeft: pos.continuesLeft,
      continuesRight: pos.continuesRight,
    });
  }

  const blocksByRoom: Record<string, ForecastBlock[]> = {};
  for (const b of blocks) {
    const pos = toCols(b.startDate, b.endDate);
    if (!pos.visible) continue;
    (blocksByRoom[b.roomId] ??= []).push({
      id: b.id,
      roomId: b.roomId,
      reason: b.reason,
      startCol: pos.startCol,
      endCol: pos.endCol,
    });
  }

  // ── KPIs ──
  const activeRes = reservations.filter((r) =>
    ACTIVE_RESERVATION_STATUSES.includes(r.reservationStatus),
  );

  let occupiedNights = 0;
  for (const r of activeRes) {
    const s = Math.max(monthStart.getTime(), r.checkIn.getTime());
    const e = Math.min(monthEndExcl.getTime(), r.checkOut.getTime());
    if (e > s) occupiedNights += Math.round((e - s) / DAY_MS);
  }
  const capacity = rooms.length * daysInMonth;
  const occupancyPct = capacity > 0 ? Math.round((occupiedNights / capacity) * 1000) / 10 : 0;

  // Habitaciones ocupadas por día (reservas activas + bloqueos) → fila de totales
  const dayTotals = new Array<number>(daysInMonth).fill(0);
  const addOccupancy = (start: Date, endExcl: Date) => {
    const s = Math.max(1, dayDiff(monthStart, start) + 1);
    const e = Math.min(daysInMonth + 1, dayDiff(monthStart, endExcl) + 1);
    for (let d = s; d < e; d++) dayTotals[d - 1]++;
  };
  for (const r of activeRes) addOccupancy(r.checkIn, r.checkOut);
  for (const b of blocks) addOccupancy(b.startDate, b.endDate);

  const t = today.date.getTime();
  const occupyingToday = isCurrentMonth
    ? activeRes.filter((r) => r.checkIn.getTime() <= t && t < r.checkOut.getTime()).length
    : 0;
  const blocksToday = isCurrentMonth
    ? blocks.filter((b) => b.startDate.getTime() <= t && t < b.endDate.getTime()).length
    : 0;

  return {
    year,
    month,
    monthLabel: `${MONTHS[month - 1]} ${year}`,
    daysInMonth,
    days,
    rooms: rooms.map((r) => ({ id: r.id, name: r.name, type: r.type })),
    reservationsByRoom,
    blocksByRoom,
    dayTotals,
    kpis: {
      occupancyPct,
      roomsTotal: rooms.length,
      availableToday: isCurrentMonth
        ? Math.max(0, rooms.length - occupyingToday - blocksToday)
        : rooms.length,
      checkInsToday: isCurrentMonth
        ? activeRes.filter((r) => r.checkIn.getTime() === t).length
        : 0,
      checkOutsToday: isCurrentMonth
        ? activeRes.filter((r) => r.checkOut.getTime() === t).length
        : 0,
      projectedRevenue: activeRes.reduce((s, r) => s + r.totalAmount, 0),
      depositsReceived: activeRes.reduce((s, r) => s + r.paidAmount, 0),
      pendingBalance: activeRes.reduce((s, r) => s + r.balanceAmount, 0),
      pendingPaymentCount: reservations.filter(
        (r) => r.reservationStatus === "PENDING_PAYMENT",
      ).length,
    },
  };
}
