import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getForecastData } from "@/lib/forecast";
import { CHANNEL_META, ACTIVE_RESERVATION_STATUSES } from "@/lib/domain";
import { formatCOP } from "@/lib/format";
import type { BookingChannel } from "@/generated/prisma/client";

function currentYM(tz = "America/Bogota") {
  const f = new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit" });
  const [y, m] = f.format(new Date()).split("-").map(Number);
  return { y, m };
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ y?: string; m?: string }>;
}) {
  const user = await requireUser();
  const sp = await searchParams;
  const cur = currentYM();
  let year = sp.y ? parseInt(sp.y, 10) : cur.y;
  let month = sp.m ? parseInt(sp.m, 10) : cur.m;
  if (!Number.isFinite(year) || year < 2000 || year > 2100) year = cur.y;
  if (!Number.isFinite(month) || month < 1 || month > 12) month = cur.m;

  const hotel = await prisma.hotel.findUnique({ where: { id: user.hotelId } });
  const tz = hotel?.timezone ?? "America/Bogota";
  const data = await getForecastData(user.hotelId, year, month, tz);
  const k = data.kpis;

  const monthStart = new Date(Date.UTC(year, month - 1, 1));
  const monthEnd = new Date(Date.UTC(month === 12 ? year + 1 : year, month === 12 ? 0 : month, 1));
  const res = await prisma.reservation.findMany({
    where: {
      hotelId: user.hotelId,
      checkIn: { lt: monthEnd },
      checkOut: { gt: monthStart },
      reservationStatus: { in: ACTIVE_RESERVATION_STATUSES },
    },
    select: { channel: true, totalAmount: true },
  });

  const byChannel = new Map<BookingChannel, { count: number; revenue: number }>();
  for (const r of res) {
    const e = byChannel.get(r.channel) ?? { count: 0, revenue: 0 };
    e.count++;
    e.revenue += r.totalAmount;
    byChannel.set(r.channel, e);
  }
  const channelRows = [...byChannel.entries()].sort((a, b) => b[1].revenue - a[1].revenue);
  const maxRev = Math.max(1, ...channelRows.map(([, v]) => v.revenue));

  const prev = month === 1 ? { y: year - 1, m: 12 } : { y: year, m: month - 1 };
  const next = month === 12 ? { y: year + 1, m: 1 } : { y: year, m: month + 1 };
  const navBtn = "flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50";

  const cards = [
    { label: "Ocupación", value: `${k.occupancyPct}%` },
    { label: "Reservas activas", value: res.length },
    { label: "Ingresos proyectados", value: formatCOP(k.projectedRevenue) },
    { label: "Abonos recibidos", value: formatCOP(k.depositsReceived) },
    { label: "Saldos pendientes", value: formatCOP(k.pendingBalance) },
    { label: "Pend. de pago", value: k.pendingPaymentCount },
  ];

  return (
    <div className="mx-auto w-full max-w-4xl p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-bold text-brand-dark">Reportes</h1>
          <p className="text-sm text-slate-500">Ocupación e ingresos del mes</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/reports?y=${prev.y}&m=${prev.m}`} className={navBtn}>‹</Link>
          <span className="min-w-40 text-center text-base font-semibold text-slate-900">{data.monthLabel}</span>
          <Link href={`/dashboard/reports?y=${next.y}&m=${next.m}`} className={navBtn}>›</Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-slate-200 bg-white px-4 py-3">
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{c.label}</p>
            <p className="mt-0.5 text-xl font-bold text-slate-900">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mb-3 text-sm font-semibold text-slate-700">Ingresos por canal</h2>
        {channelRows.length === 0 ? (
          <p className="text-sm text-slate-400">Sin reservas en este mes.</p>
        ) : (
          <div className="flex flex-col gap-2.5">
            {channelRows.map(([ch, v]) => {
              const meta = CHANNEL_META[ch];
              return (
                <div key={ch} className="flex items-center gap-3">
                  <span className="w-28 shrink-0 text-sm text-slate-600">{meta.label}</span>
                  <div className="h-5 flex-1 overflow-hidden rounded bg-slate-100">
                    <div className="h-full rounded" style={{ width: `${(v.revenue / maxRev) * 100}%`, backgroundColor: meta.color }} />
                  </div>
                  <span className="w-32 shrink-0 text-right text-sm font-medium text-slate-700">{formatCOP(v.revenue)}</span>
                  <span className="w-10 shrink-0 text-right text-xs text-slate-400">{v.count}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
