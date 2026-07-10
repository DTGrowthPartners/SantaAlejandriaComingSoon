import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

/** GET /api/notifications → notificaciones no descartadas del hotel (para polling). */
export async function GET() {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "no auth" }, { status: 401 });

  const items = await prisma.notification.findMany({
    where: { hotelId: s.hotelId, dismissed: false },
    orderBy: { createdAt: "desc" },
    take: 40,
  });

  return NextResponse.json({
    notifications: items.map((n) => ({
      id: n.id,
      kind: n.kind,
      title: n.title,
      message: n.message,
      reservationNumber: n.reservationNumber,
      createdAt: n.createdAt.toISOString(),
    })),
  });
}
