"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { createMonthAction, deleteSheetAction } from "@/lib/actions/ledger";

export function LedgerToolbar({
  year,
  month,
  monthLabel,
  hasSheet,
  sheetId,
  months,
  canEdit,
}: {
  year: number;
  month: number;
  monthLabel: string;
  hasSheet: boolean;
  sheetId: string | null;
  months: { year: number; month: number; label: string }[];
  canEdit: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const prev = month === 1 ? { y: year - 1, m: 12 } : { y: year, m: month - 1 };
  const next = month === 12 ? { y: year + 1, m: 1 } : { y: year, m: month + 1 };
  const go = (y: number, m: number) => router.push(`/dashboard/ledger?y=${y}&m=${m}`);

  const btn =
    "flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50";

  function createMonth() {
    startTransition(async () => {
      const res = await createMonthAction({ year, month });
      if (res.ok) router.refresh();
      else alert(res.error);
    });
  }

  function removeSheet() {
    if (!confirm(`¿Eliminar la hoja de ${monthLabel}? Esta acción no se puede deshacer.`)) return;
    startTransition(async () => {
      const res = await deleteSheetAction({ sheetId: sheetId! });
      if (res.ok) router.refresh();
      else alert(res.error);
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button onClick={() => go(prev.y, prev.m)} className={btn} aria-label="Mes anterior">‹</button>
      <span className="min-w-40 text-center text-base font-semibold text-slate-900">{monthLabel}</span>
      <button onClick={() => go(next.y, next.m)} className={btn} aria-label="Mes siguiente">›</button>

      {months.length > 0 && (
        <select
          value={`${year}-${month}`}
          onChange={(e) => {
            const [y, m] = e.target.value.split("-").map(Number);
            go(y, m);
          }}
          className="ml-1 rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm text-slate-700"
          title="Ir a un mes con hoja"
        >
          {!months.some((mo) => mo.year === year && mo.month === month) && (
            <option value={`${year}-${month}`}>{monthLabel} (sin hoja)</option>
          )}
          {months.map((mo) => (
            <option key={`${mo.year}-${mo.month}`} value={`${mo.year}-${mo.month}`}>
              {mo.label}
            </option>
          ))}
        </select>
      )}

      {canEdit && !hasSheet && (
        <button
          onClick={createMonth}
          disabled={isPending}
          className="rounded-lg bg-brand-dark px-3 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {months.length > 0 ? "＋ Crear hoja de este mes (plantilla)" : "＋ Crear hoja de este mes"}
        </button>
      )}

      {hasSheet && (
        <a
          href={`/api/ledger/export?y=${year}&m=${month}`}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          ⬇ Exportar Excel
        </a>
      )}

      {canEdit && hasSheet && sheetId && (
        <button
          onClick={removeSheet}
          disabled={isPending}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50 disabled:opacity-50"
        >
          Eliminar hoja
        </button>
      )}
    </div>
  );
}
