import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { reconcileBoldPaymentsCore } from "@/lib/reconcile";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Conciliación automática de pagos Bold (respaldo del webhook). Pensado para un
 * cron que lo llame periódicamente. Protegido por `CRON_SECRET`: se pasa como
 * `?key=` o header `x-cron-key`. Sin secreto configurado, responde 503.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET no configurado" }, { status: 503 });
  }
  const key = req.nextUrl.searchParams.get("key") ?? req.headers.get("x-cron-key");
  if (key !== secret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const hotels = await prisma.hotel.findMany({ select: { id: true } });
  const totals = { checked: 0, paid: 0, expired: 0 };
  for (const h of hotels) {
    try {
      const r = await reconcileBoldPaymentsCore(h.id, { userName: "Conciliación automática" });
      totals.checked += r.checked;
      totals.paid += r.paid;
      totals.expired += r.expired;
    } catch (e) {
      console.error(`[cron/reconcile] hotel ${h.id}:`, e);
    }
  }

  return NextResponse.json({ ok: true, hotels: hotels.length, ...totals });
}
