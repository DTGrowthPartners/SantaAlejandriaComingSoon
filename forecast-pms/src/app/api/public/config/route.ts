import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { corsJson, corsPreflight } from "@/lib/cors";

export const runtime = "nodejs";

export async function OPTIONS(req: NextRequest) {
  return corsPreflight(req.headers.get("origin"));
}

/**
 * GET /api/public/config — configuración pública para el widget de reserva web.
 * prepayFull=true (temporada alta) → prepago total obligatorio.
 * prepayFull=false (temporada baja) → apartar pagando 1 noche.
 */
export async function GET(req: NextRequest) {
  const origin = req.headers.get("origin");
  const hotel = await prisma.hotel.findFirst({ select: { webPrepayFull: true } });
  return corsJson(origin, { prepayFull: hotel?.webPrepayFull ?? false });
}
