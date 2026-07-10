import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { corsJson, corsPreflight } from "@/lib/cors";
import { getDirectusRoom, roomOccupancy, parseIsoDate } from "@/lib/publicBooking";
import { expireStaleHolds } from "@/lib/holds";

export const runtime = "nodejs";

export async function OPTIONS(req: NextRequest) {
  return corsPreflight(req.headers.get("origin"));
}

/**
 * GET /api/public/availability?room=<slug>&from=YYYY-MM-DD&to=YYYY-MM-DD
 * → { count, rooms: [{ busy: ["2026-07-18", ...] }] }
 *   Ocupación por habitación física del tipo. Una estadía es válida solo si
 *   UNA habitación está libre TODAS las noches. Rango: hoy → +6 meses (máx 12).
 */
export async function GET(req: NextRequest) {
  const origin = req.headers.get("origin");
  const slug = req.nextUrl.searchParams.get("room");
  if (!slug) return corsJson(origin, { error: "Falta el parámetro room" }, { status: 400 });

  const today = new Date(new Date().toISOString().slice(0, 10) + "T00:00:00Z");
  const from = parseIsoDate(req.nextUrl.searchParams.get("from") ?? "") ?? today;
  const defaultTo = new Date(from.getTime() + 183 * 86_400_000);
  let to = parseIsoDate(req.nextUrl.searchParams.get("to") ?? "") ?? defaultTo;
  const maxTo = new Date(from.getTime() + 366 * 86_400_000);
  if (to > maxTo) to = maxTo;
  if (to <= from) return corsJson(origin, { error: "Rango de fechas inválido" }, { status: 400 });

  try {
    const room = await getDirectusRoom(slug);
    if (!room) return corsJson(origin, { error: "Habitación no encontrada" }, { status: 404 });

    const hotel = await prisma.hotel.findFirst();
    if (!hotel) return corsJson(origin, { error: "Hotel no configurado" }, { status: 500 });

    await expireStaleHolds(hotel.id); // libera holds vencidos antes de calcular
    const occ = await roomOccupancy(room, hotel.id, from, to);
    return corsJson(origin, {
      room: room.slug,
      from: from.toISOString().slice(0, 10),
      to: to.toISOString().slice(0, 10),
      count: occ.count,
      rooms: occ.rooms,
    });
  } catch (e) {
    console.error("[public/availability]", e);
    return corsJson(origin, { error: "Error consultando disponibilidad" }, { status: 500 });
  }
}
