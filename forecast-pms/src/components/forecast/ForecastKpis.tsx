import { formatCOP } from "@/lib/format";
import type { ForecastKpis } from "@/lib/forecast";

export function ForecastKpisRow({ kpis }: { kpis: ForecastKpis }) {
  const items: { label: string; value: string | number; highlight?: boolean }[] = [
    { label: "Ocupación mes", value: `${kpis.occupancyPct}%`, highlight: true },
    { label: "Disponibles hoy", value: `${kpis.availableToday}/${kpis.roomsTotal}` },
    { label: "Check-ins hoy", value: kpis.checkInsToday },
    { label: "Check-outs hoy", value: kpis.checkOutsToday },
    { label: "Ingresos proyect.", value: formatCOP(kpis.projectedRevenue) },
    { label: "Abonos recibidos", value: formatCOP(kpis.depositsReceived) },
    { label: "Saldos pendientes", value: formatCOP(kpis.pendingBalance) },
    { label: "Pend. de pago", value: kpis.pendingPaymentCount },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-8">
      {items.map((it) => (
        <div
          key={it.label}
          className={
            "rounded-xl border px-3 py-2.5 " +
            (it.highlight
              ? "border-brand-light bg-brand-light"
              : "border-slate-200 bg-white")
          }
        >
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
            {it.label}
          </p>
          <p className="mt-0.5 truncate text-lg font-bold text-slate-900">
            {it.value}
          </p>
        </div>
      ))}
    </div>
  );
}
