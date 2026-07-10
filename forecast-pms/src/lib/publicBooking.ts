import { prisma } from "@/lib/prisma";
import { ACTIVE_RESERVATION_STATUSES, ivaOf } from "@/lib/domain";

const DIRECTUS_URL = process.env.DIRECTUS_URL ?? "https://cms.santalejandriahotels.com";
const HOTEL_SLUG = process.env.PUBLIC_BOOKING_HOTEL_SLUG ?? "cartagena";

const DAY_MS = 86_400_000;

/**
 * Mapeo por defecto tipo comercial (slug Directus) → habitaciones físicas del PMS.
 * Es solo un respaldo: si en Directus la habitación tiene el campo `pms_rooms`,
 * ese valor manda (el usuario controla el mapeo desde Directus).
 */
const DEFAULT_ROOM_MAP: Record<string, string[]> = {
  "Doble-Economica": ["101", "102"],
  "Familiar- Económica": ["103"],
  "doble-estandar": ["201", "202"],
  king: ["203", "204", "205", "206", "209", "210"],
  "King- Familiar": ["211"], // "King Superior" comercial = la Suite (211)
  twins: ["207", "208"],
};

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
  /** Campo configurable en Directus: números de habitación del PMS, separados por coma. */
  pms_rooms: string | null;
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

// Se apaga si Directus aún no expone `pms_rooms` (403), para no romper la consulta.
let pmsRoomsFieldAvailable = true;

/** Habitación (tipo) publicada del hotel en Directus, por slug. */
export async function getDirectusRoom(slug: string): Promise<DirectusPublicRoom | null> {
  const withMapping = pmsRoomsFieldAvailable;
  const fields = ROOM_FIELDS + (withMapping ? ",pms_rooms" : "");
  const url =
    `${DIRECTUS_URL}/items/rooms?fields=${fields}` +
    `&filter[slug][_eq]=${encodeURIComponent(slug)}` +
    `&filter[status][_eq]=published` +
    `&filter[hotel][slug][_eq]=${encodeURIComponent(HOTEL_SLUG)}&limit=1`;

  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (res.status === 403 && withMapping) {
    // El campo pms_rooms aún no existe o el rol público no puede leerlo → reintentar sin él.
    pmsRoomsFieldAvailable = false;
    return getDirectusRoom(slug);
  }
  if (!res.ok) throw new Error(`Directus ${res.status}`);
  const body = (await res.json()) as { data: DirectusPublicRoom[] };
  return body.data[0] ?? null;
}

/**
 * Precio por noche según "Precios por temporada" (price_overrides).
 * Cada noche se cotiza con el periodo publicado que la cubra; si ninguno aplica,
 * usa el precio base (price_per_night).
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

/** Números de habitación del PMS para un tipo: el campo de Directus manda; si no, el respaldo. */
function roomNamesForType(room: DirectusPublicRoom): string[] {
  const fromDirectus = (room.pms_rooms ?? "")
    .split(/[\s,;]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  return fromDirectus.length > 0 ? fromDirectus : DEFAULT_ROOM_MAP[room.slug] ?? [];
}

/** Habitaciones físicas del PMS asociadas al tipo comercial. */
export async function pmsRoomsForType(room: DirectusPublicRoom, hotelId: string) {
  const names = roomNamesForType(room);
  if (names.length === 0) return [];
  return prisma.room.findMany({ where: { hotelId, active: true, name: { in: names } } });
}

/** Fechas bloqueadas (sin ninguna habitación libre del tipo) en [from, to). */
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

/**
 * Ocupación POR habitación física del tipo, en [from, to).
 * Devuelve, por cada habitación, las noches ocupadas. El cliente usa esto para
 * calcular disponibilidad real: una estadía es válida solo si UNA habitación
 * está libre TODAS las noches del rango.
 */
export async function roomOccupancy(
  room: DirectusPublicRoom,
  hotelId: string,
  from: Date,
  to: Date,
): Promise<{ count: number; rooms: { busy: string[] }[] }> {
  const physical = await pmsRoomsForType(room, hotelId);
  if (physical.length === 0) return { count: 0, rooms: [] };
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

  const rooms = physical.map((pr) => {
    const spans = [
      ...reservations.filter((r) => r.roomId === pr.id).map((r) => ({ s: r.checkIn.getTime(), e: r.checkOut.getTime() })),
      ...blocks.filter((b) => b.roomId === pr.id).map((b) => ({ s: b.startDate.getTime(), e: b.endDate.getTime() })),
    ];
    const busy: string[] = [];
    for (let t = from.getTime(); t < to.getTime(); t += DAY_MS) {
      if (spans.some((x) => x.s <= t && t < x.e)) busy.push(iso(new Date(t)));
    }
    return { busy };
  });

  return { count: physical.length, rooms };
}

/** Primera habitación física del tipo libre en TODO el rango (o null). */
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
