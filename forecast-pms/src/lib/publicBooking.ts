import { prisma } from "@/lib/prisma";
import { ACTIVE_RESERVATION_STATUSES, ivaOf } from "@/lib/domain";

const DIRECTUS_URL = process.env.DIRECTUS_URL ?? "https://cms.santalejandriahotels.com";
const HOTEL_SLUG = process.env.PUBLIC_BOOKING_HOTEL_SLUG ?? "cartagena";

const DAY_MS = 86_400_000;

/** Normaliza para comparar tipos: minúsculas, sin tildes, sin separadores. */
export function normalizeType(s: string | null | undefined): string {
  return (s ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

export function parseIsoDate(s: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const [y, m, d] = s.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return Number.isNaN(date.getTime()) ? null : date;
}

const iso = (d: Date) => d.toISOString().slice(0, 10);

// ── Directus ──

export type DirectusPublicRoom = {
  id: string;
  slug: string;
  name: string;
  short_name: string;
  quantity: number | null;
  max_guests: number | null;
  price_per_night: number | null;
  price_overrides: Array<{
    status: string;
    label: string;
    start_date: string;
    end_date: string;
    price_per_night: number;
  }> | null;
};

const ROOM_FIELDS =
  "id,slug,name,short_name,quantity,max_guests,price_per_night," +
  "price_overrides.status,price_overrides.label,price_overrides.start_date,price_overrides.end_date,price_overrides.price_per_night";

/** Habitación (tipo) publicada del hotel en Directus, por slug. */
export async function getDirectusRoom(slug: string): Promise<DirectusPublicRoom | null> {
  const url =
    `${DIRECTUS_URL}/items/rooms?fields=${ROOM_FIELDS}` +
    `&filter[slug][_eq]=${encodeURIComponent(slug)}` +
    `&filter[status][_eq]=published` +
    `&filter[hotel][slug][_eq]=${encodeURIComponent(HOTEL_SLUG)}&limit=1`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Directus ${res.status}`);
  const body = (await res.json()) as { data: DirectusPublicRoom[] };
  return body.data[0] ?? null;
}

/**
 * Precio por noche según "Precios por temporada" (price_overrides).
 * Cada noche de la estadía se cotiza con el periodo publicado que la cubra;
 * si ninguno aplica, usa el precio base (price_per_night).
 */
export function quoteStay(
  room: DirectusPublicRoom,
  checkIn: Date,
  checkOut: Date,
): { nights: number; subtotal: number; perNight: { date: string; price: number; season: string | null }[] } {
  const overrides = (room.price_overrides ?? []).filter((o) => o.status === "published");
  const base = room.price_per_night ?? 0;
  const perNight: { date: string; price: number; season: string | null }[] = [];
  let subtotal = 0;

  for (let t = checkIn.getTime(); t < checkOut.getTime(); t += DAY_MS) {
    const day = iso(new Date(t));
    const season = overrides.find((o) => o.start_date <= day && o.end_date >= day) ?? null;
    const price = season ? season.price_per_night : base;
    subtotal += price;
    perNight.push({ date: day, price, season: season?.label ?? null });
  }

  return { nights: perNight.length, subtotal, perNight };
}

// ── Disponibilidad contra el PMS ──

/** Habitaciones físicas del PMS cuyo tipo corresponde al tipo de Directus. */
export async function pmsRoomsForType(room: DirectusPublicRoom, hotelId: string) {
  const wanted = new Set([normalizeType(room.short_name), normalizeType(room.name), normalizeType(room.slug)]);
  const all = await prisma.room.findMany({ where: { hotelId, active: true } });
  return all.filter((r) => wanted.has(normalizeType(r.type)));
}

/**
 * Fechas bloqueadas (sin ninguna habitación libre del tipo) en [from, to).
 * Una fecha bloqueada no puede ser NOCHE de estadía.
 */
export async function blockedDates(
  room: DirectusPublicRoom,
  hotelId: string,
  from: Date,
  to: Date,
): Promise<string[]> {
  const physical = await pmsRoomsForType(room, hotelId);
  if (physical.length === 0) return [];
  const ids = physical.map((r) => r.id);

  const [reservations, blocks] = await Promise.all([
    prisma.reservation.findMany({
      where: {
        roomId: { in: ids },
        reservationStatus: { in: ACTIVE_RESERVATION_STATUSES },
        checkIn: { lt: to },
        checkOut: { gt: from },
      },
      select: { roomId: true, checkIn: true, checkOut: true },
    }),
    prisma.roomBlock.findMany({
      where: { roomId: { in: ids }, active: true, startDate: { lt: to }, endDate: { gt: from } },
      select: { roomId: true, startDate: true, endDate: true },
    }),
  ]);

  const spans = [
    ...reservations.map((r) => ({ roomId: r.roomId, s: r.checkIn.getTime(), e: r.checkOut.getTime() })),
    ...blocks.map((b) => ({ roomId: b.roomId, s: b.startDate.getTime(), e: b.endDate.getTime() })),
  ];

  const out: string[] = [];
  for (let t = from.getTime(); t < to.getTime(); t += DAY_MS) {
    const occupied = new Set(spans.filter((x) => x.s <= t && t < x.e).map((x) => x.roomId));
    if (occupied.size >= physical.length) out.push(iso(new Date(t)));
  }
  return out;
}

/** Primera habitación física del tipo libre en TODO el rango (o null si no hay). */
export async function findFreeRoom(
  room: DirectusPublicRoom,
  hotelId: string,
  checkIn: Date,
  checkOut: Date,
): Promise<{ id: string; name: string } | null> {
  const physical = await pmsRoomsForType(room, hotelId);
  for (const r of physical.sort((a, b) => a.sortOrder - b.sortOrder)) {
    const [conflictRes, conflictBlock] = await Promise.all([
      prisma.reservation.count({
        where: {
          roomId: r.id,
          reservationStatus: { in: ACTIVE_RESERVATION_STATUSES },
          checkIn: { lt: checkOut },
          checkOut: { gt: checkIn },
        },
      }),
      prisma.roomBlock.count({
        where: { roomId: r.id, active: true, startDate: { lt: checkOut }, endDate: { gt: checkIn } },
      }),
    ]);
    if (conflictRes === 0 && conflictBlock === 0) return { id: r.id, name: r.name };
  }
  return null;
}

export { ivaOf };
