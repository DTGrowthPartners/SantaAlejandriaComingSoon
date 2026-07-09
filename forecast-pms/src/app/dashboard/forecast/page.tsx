import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getForecastData } from "@/lib/forecast";
import { ForecastKpisRow } from "@/components/forecast/ForecastKpis";
import { MonthNav } from "@/components/forecast/MonthNav";
import { ForecastGrid } from "@/components/forecast/ForecastGrid";
import { CHANNEL_META } from "@/lib/domain";

function currentYM(tz = "America/Bogota") {
  const f = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
  });
  const [y, m] = f.format(new Date()).split("-").map(Number);
  return { y, m };
}

export default async function ForecastPage({
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

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-3 p-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900">
            {hotel?.name ?? "Forecast"}
          </h1>
          <p className="text-sm text-slate-500">Forecast de ocupación</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <MonthNav year={year} month={month} monthLabel={data.monthLabel} />
          <Link
            href="/dashboard/import"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            ⬆ Importar forecast
          </Link>
          <Link
            href="/dashboard/reservations"
            className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            + Crear reserva
          </Link>
        </div>
      </header>

      <ForecastKpisRow kpis={data.kpis} />

      <ForecastGrid data={data} hotelName={hotel?.name ?? "el hotel"} />

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Canales
        </span>
        {Object.values(CHANNEL_META).map((c) => (
          <span key={c.label} className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: c.color }} />
            {c.label}
          </span>
        ))}
        <span className="flex items-center gap-1.5 text-xs text-slate-600">
          <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: "#DC2626" }} />
          No Show
        </span>
        <span className="flex items-center gap-1.5 text-xs text-slate-600">
          <span
            className="h-3 w-3 rounded-sm"
            style={{
              backgroundColor: "#e2e8f0",
              backgroundImage:
                "repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(100,116,139,.3) 3px, rgba(100,116,139,.3) 6px)",
            }}
          />
          Bloqueo
        </span>
      </div>
    </div>
  );
}
