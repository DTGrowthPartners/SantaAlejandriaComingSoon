import Link from "next/link";

export function MonthNav({
  year,
  month,
  monthLabel,
}: {
  year: number;
  month: number;
  monthLabel: string;
}) {
  const prev = month === 1 ? { y: year - 1, m: 12 } : { y: year, m: month - 1 };
  const next = month === 12 ? { y: year + 1, m: 1 } : { y: year, m: month + 1 };

  const btn =
    "flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50";

  return (
    <div className="flex items-center gap-2">
      <Link href={`/dashboard/forecast?y=${prev.y}&m=${prev.m}`} className={btn} aria-label="Mes anterior">
        ‹
      </Link>
      <span className="min-w-44 text-center text-base font-semibold text-slate-900">
        {monthLabel}
      </span>
      <Link href={`/dashboard/forecast?y=${next.y}&m=${next.m}`} className={btn} aria-label="Mes siguiente">
        ›
      </Link>
      <Link
        href="/dashboard/forecast"
        className="ml-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
      >
        Hoy
      </Link>
    </div>
  );
}
