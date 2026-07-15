"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { formatCOP } from "@/lib/format";
import {
  cellNumber,
  computeTotals,
  weekdayInitial,
  type LedgerSheetData,
  type LedgerSectionData,
  type LedgerRowData,
} from "@/lib/ledger/shared";
import type { LedgerSectionKind } from "@/generated/prisma/client";
import {
  updateCellAction,
  updateRowLabelAction,
  addRowAction,
  deleteRowAction,
  moveRowAction,
  addSectionAction,
  updateSectionAction,
  deleteSectionAction,
  moveSectionAction,
} from "@/lib/actions/ledger";

const KIND_META: Record<LedgerSectionKind, { label: string; badge: string; money: boolean }> = {
  INCOME: { label: "Ingreso", badge: "bg-emerald-100 text-emerald-700 ring-emerald-200", money: true },
  EXPENSE: { label: "Gasto", badge: "bg-rose-100 text-rose-700 ring-rose-200", money: true },
  DATA: { label: "Datos", badge: "bg-slate-100 text-slate-600 ring-slate-200", money: false },
};

/** Formatea un entero con puntos de miles (formato COP): 1942310 → "1.942.310". */
const INT_FMT = new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 });
function fmtInt(n: number): string {
  return INT_FMT.format(n);
}

/** Valor CRUDO para editar (sin puntos): número → dígitos, texto → tal cual. */
function cellRaw(row: LedgerRowData, day: number): string {
  const v = row.cells[String(day)];
  if (v == null) return "";
  return typeof v === "number" ? String(v) : v;
}

/** Valor para MOSTRAR (con puntos de miles si es número). */
function cellDisplay(row: LedgerRowData, day: number): string {
  const v = row.cells[String(day)];
  if (v == null) return "";
  return typeof v === "number" ? fmtInt(v) : v;
}

export function LedgerGrid({
  sheet,
  canEdit,
}: {
  sheet: LedgerSheetData;
  canEdit: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [sections, setSections] = useState<LedgerSectionData[]>(sheet.sections);
  const [error, setError] = useState<string | null>(null);
  // Celda en edición (rowId:day): mientras se edita se muestra el número crudo
  // (sin puntos) para escribir cómodo; al salir se ve con puntos de miles.
  const [editing, setEditing] = useState<string | null>(null);

  // Re-sincroniza con el servidor tras cambios estructurales (router.refresh()).
  useEffect(() => {
    setSections(sheet.sections);
  }, [sheet]);

  const days = sheet.daysInMonth;
  const dayList = useMemo(() => Array.from({ length: days }, (_, i) => i + 1), [days]);

  // Totales del mes (en vivo, desde el estado local).
  const totals = useMemo(
    () => computeTotals({ ...sheet, sections }),
    [sheet, sections],
  );

  function run(action: Promise<{ ok: boolean; error: string | null }>, refresh = false) {
    startTransition(async () => {
      const res = await action;
      if (!res.ok) setError(res.error);
      else {
        setError(null);
        if (refresh) router.refresh();
      }
    });
  }

  // ---- edición de celdas (sin refresh, para no interrumpir la escritura) ----
  function setLocalCell(sectionId: string, rowId: string, day: number, raw: string) {
    setSections((prev) =>
      prev.map((s) =>
        s.id !== sectionId
          ? s
          : {
              ...s,
              rows: s.rows.map((r) => {
                if (r.id !== rowId) return r;
                const cells = { ...r.cells };
                const t = raw.trim();
                if (t === "") delete cells[String(day)];
                else if (s.isText) cells[String(day)] = t;
                else {
                  const digits = t.replace(/[^\d-]/g, "");
                  cells[String(day)] =
                    digits === "" || digits === "-" ? t : Number(digits);
                }
                return { ...r, cells };
              }),
            },
      ),
    );
  }

  function persistCell(rowId: string, day: number, raw: string) {
    startTransition(async () => {
      const res = await updateCellAction({ rowId, day, value: raw });
      if (!res.ok) setError(res.error);
    });
  }

  function setLocalLabel(sectionId: string, rowId: string, label: string) {
    setSections((prev) =>
      prev.map((s) =>
        s.id !== sectionId
          ? s
          : { ...s, rows: s.rows.map((r) => (r.id === rowId ? { ...r, label } : r)) },
      ),
    );
  }

  const inputBase =
    "w-full bg-transparent px-1 py-1 text-right text-[12px] tabular-nums outline-none focus:bg-amber-50 focus:ring-1 focus:ring-gold rounded";

  return (
    <div className="flex flex-col gap-3">
      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}

      {/* Resumen del mes */}
      <div className="grid grid-cols-3 gap-3">
        <SummaryCard label="Ingresos del mes" value={formatCOP(totals.incomeMonth)} tone="emerald" />
        <SummaryCard label="Gastos del mes" value={formatCOP(totals.expenseMonth)} tone="rose" />
        <SummaryCard
          label="Utilidad del mes"
          value={formatCOP(totals.utilityMonth)}
          tone={totals.utilityMonth >= 0 ? "brand" : "rose"}
        />
      </div>

      {sections.map((section, si) => {
        const meta = KIND_META[section.kind];
        const dayTotals = dayList.map((d) =>
          section.rows.reduce((a, r) => a + cellNumber(r.cells[String(d)]), 0),
        );
        const grand = dayTotals.reduce((a, b) => a + b, 0);
        return (
          <section
            key={section.id}
            className="overflow-hidden rounded-xl border border-slate-200 bg-white"
          >
            {/* Cabecera de sección */}
            <header className="flex flex-wrap items-center gap-2 border-b border-slate-100 bg-slate-50/70 px-3 py-2">
              <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1", meta.badge)}>
                {meta.label}
              </span>
              {canEdit ? (
                <input
                  defaultValue={section.title}
                  onBlur={(e) => {
                    const t = e.target.value.trim();
                    if (t && t !== section.title)
                      run(updateSectionAction({ sectionId: section.id, title: t }), true);
                  }}
                  className="min-w-0 flex-1 rounded bg-transparent px-1 py-0.5 text-sm font-bold text-brand-dark outline-none focus:bg-white focus:ring-1 focus:ring-gold"
                />
              ) : (
                <span className="flex-1 text-sm font-bold text-brand-dark">{section.title}</span>
              )}
              {canEdit && (
                <div className="flex items-center gap-1">
                  <select
                    value={section.kind}
                    onChange={(e) =>
                      run(
                        updateSectionAction({
                          sectionId: section.id,
                          kind: e.target.value as LedgerSectionKind,
                        }),
                        true,
                      )
                    }
                    className="rounded border border-slate-200 bg-white px-1.5 py-1 text-[11px] text-slate-600"
                    title="Tipo de sección"
                  >
                    <option value="INCOME">Ingreso</option>
                    <option value="EXPENSE">Gasto</option>
                    <option value="DATA">Datos</option>
                  </select>
                  <IconBtn title="Subir sección" disabled={si === 0}
                    onClick={() => run(moveSectionAction({ sectionId: section.id, direction: "up" }), true)}>↑</IconBtn>
                  <IconBtn title="Bajar sección" disabled={si === sections.length - 1}
                    onClick={() => run(moveSectionAction({ sectionId: section.id, direction: "down" }), true)}>↓</IconBtn>
                  <IconBtn title="Agregar fila"
                    onClick={() => run(addRowAction({ sectionId: section.id }), true)}>＋</IconBtn>
                  <IconBtn title="Eliminar sección" danger
                    onClick={() => {
                      if (confirm(`¿Eliminar la sección "${section.title}" y todas sus filas?`))
                        run(deleteSectionAction({ sectionId: section.id }), true);
                    }}>🗑</IconBtn>
                </div>
              )}
            </header>

            {/* Tabla */}
            <div className="overflow-x-auto">
              <table className="border-collapse text-[12px]">
                <thead>
                  <tr className="bg-slate-50 text-slate-500">
                    <th className="sticky left-0 z-10 w-52 min-w-52 border-b border-r border-slate-200 bg-slate-50 px-2 py-1 text-left font-semibold">
                      Concepto
                    </th>
                    {dayList.map((d) => (
                      <th key={d} className="w-[68px] min-w-[68px] border-b border-slate-100 px-1 py-0.5 text-center font-medium">
                        <div className="text-[13px] font-semibold text-slate-700">{d}</div>
                        <div className="text-[9px] uppercase text-slate-400">
                          {weekdayInitial(sheet.year, sheet.month, d)}
                        </div>
                      </th>
                    ))}
                    <th className="w-24 min-w-24 border-b border-l border-slate-200 bg-slate-100 px-2 py-1 text-right font-semibold text-slate-600">
                      Total
                    </th>
                    {canEdit && <th className="w-16 border-b border-slate-100" />}
                  </tr>
                </thead>
                <tbody>
                  {section.rows.map((row, ri) => {
                    const rTotal = dayList.reduce((a, d) => a + cellNumber(row.cells[String(d)]), 0);
                    return (
                      <tr key={row.id} className="group hover:bg-amber-50/30">
                        <td className="sticky left-0 z-10 border-b border-r border-slate-100 bg-white px-1 py-0.5 group-hover:bg-amber-50/60">
                          {canEdit ? (
                            <input
                              value={row.label}
                              onChange={(e) => setLocalLabel(section.id, row.id, e.target.value)}
                              onBlur={(e) => {
                                const t = e.target.value.trim();
                                if (t && t !== section.rows[ri]?.label)
                                  persistLabel(row.id, t);
                              }}
                              className="w-full rounded bg-transparent px-1 py-0.5 text-[12px] font-medium text-slate-700 outline-none focus:bg-amber-50 focus:ring-1 focus:ring-gold"
                            />
                          ) : (
                            <span className="px-1 text-[12px] font-medium text-slate-700">{row.label}</span>
                          )}
                        </td>
                        {dayList.map((d) => {
                          const key = `${row.id}:${d}`;
                          const isEditing = editing === key;
                          const display =
                            section.isText || isEditing ? cellRaw(row, d) : cellDisplay(row, d);
                          return (
                            <td key={d} className="border-b border-slate-50 p-0 text-center">
                              {canEdit ? (
                                <input
                                  inputMode={section.isText ? "text" : "numeric"}
                                  value={display}
                                  onFocus={() => setEditing(key)}
                                  onChange={(e) => setLocalCell(section.id, row.id, d, e.target.value)}
                                  onBlur={(e) => {
                                    setEditing(null);
                                    persistCell(row.id, d, e.target.value);
                                  }}
                                  className={inputBase}
                                />
                              ) : (
                                <span className="block px-1 py-1 text-right text-[12px] tabular-nums">
                                  {cellDisplay(row, d)}
                                </span>
                              )}
                            </td>
                          );
                        })}
                        <td className="border-b border-l border-slate-200 bg-slate-50 px-2 py-1 text-right text-[12px] font-semibold tabular-nums text-slate-700">
                          {meta.money ? formatCOP(rTotal) : rTotal ? fmtInt(rTotal) : ""}
                        </td>
                        {canEdit && (
                          <td className="border-b border-slate-50 px-1 py-0.5">
                            <div className="flex items-center justify-center gap-0.5 opacity-40 transition group-hover:opacity-100">
                              <IconBtn title="Subir" disabled={ri === 0}
                                onClick={() => run(moveRowAction({ rowId: row.id, direction: "up" }), true)}>↑</IconBtn>
                              <IconBtn title="Bajar" disabled={ri === section.rows.length - 1}
                                onClick={() => run(moveRowAction({ rowId: row.id, direction: "down" }), true)}>↓</IconBtn>
                              <IconBtn title="Eliminar fila" danger
                                onClick={() => {
                                  if (confirm(`¿Eliminar la fila "${row.label}"?`))
                                    run(deleteRowAction({ rowId: row.id }), true);
                                }}>✕</IconBtn>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                  {/* Totales por día de la sección */}
                  <tr className="bg-slate-100 font-semibold text-slate-700">
                    <td className="sticky left-0 z-10 border-r border-slate-200 bg-slate-100 px-2 py-1 text-[11px] uppercase tracking-wide">
                      Total {meta.label.toLowerCase()}
                    </td>
                    {dayList.map((d, i) => (
                      <td key={d} className="border-slate-200 px-1 py-1 text-right text-[11px] tabular-nums">
                        {dayTotals[i] ? fmtInt(dayTotals[i]) : ""}
                      </td>
                    ))}
                    <td className="border-l border-slate-200 bg-slate-200 px-2 py-1 text-right text-[12px] tabular-nums">
                      {meta.money ? formatCOP(grand) : grand ? fmtInt(grand) : ""}
                    </td>
                    {canEdit && <td className="bg-slate-100" />}
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        );
      })}

      {canEdit && (
        <button
          onClick={() => run(addSectionAction({ sheetId: sheet.id }), true)}
          disabled={isPending}
          className="self-start rounded-lg border border-dashed border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-gold hover:text-brand-dark disabled:opacity-50"
        >
          ＋ Agregar sección
        </button>
      )}

      {/* Resumen diario Ingresos / Gastos / Utilidad */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <header className="border-b border-slate-100 bg-slate-50/70 px-3 py-2 text-sm font-bold text-brand-dark">
          Resumen diario
        </header>
        <div className="overflow-x-auto">
          <table className="border-collapse text-[12px]">
            <thead>
              <tr className="bg-slate-50 text-slate-500">
                <th className="sticky left-0 z-10 w-52 min-w-52 border-b border-r border-slate-200 bg-slate-50 px-2 py-1 text-left font-semibold">
                  Concepto
                </th>
                {dayList.map((d) => (
                  <th key={d} className="w-[68px] min-w-[68px] border-b border-slate-100 px-1 py-1 text-center text-[13px] font-semibold text-slate-700">
                    {d}
                  </th>
                ))}
                <th className="w-28 min-w-28 border-b border-l border-slate-200 bg-slate-100 px-2 py-1 text-right font-semibold text-slate-600">
                  Mes
                </th>
              </tr>
            </thead>
            <tbody>
              <SummaryRow label="Ingresos" values={totals.income} month={totals.incomeMonth} dayList={dayList} tone="text-emerald-700" />
              <SummaryRow label="Gastos" values={totals.expense} month={totals.expenseMonth} dayList={dayList} tone="text-rose-700" />
              <SummaryRow label="Utilidad" values={totals.utility} month={totals.utilityMonth} dayList={dayList} tone="text-brand-dark" bold />
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );

  // helper cerrado sobre startTransition/setError
  function persistLabel(rowId: string, label: string) {
    startTransition(async () => {
      const res = await updateRowLabelAction({ rowId, label });
      if (!res.ok) setError(res.error);
    });
  }
}

function SummaryRow({
  label, values, month, dayList, tone, bold,
}: {
  label: string;
  values: number[];
  month: number;
  dayList: number[];
  tone: string;
  bold?: boolean;
}) {
  return (
    <tr className={cn("border-b border-slate-50", bold && "font-bold")}>
      <td className={cn("sticky left-0 z-10 border-r border-slate-100 bg-white px-2 py-1 font-semibold", tone)}>
        {label}
      </td>
      {dayList.map((d) => (
        <td key={d} className={cn("px-1 py-1 text-right text-[11px] tabular-nums", tone)}>
          {values[d] ? fmtInt(values[d]) : ""}
        </td>
      ))}
      <td className={cn("border-l border-slate-200 bg-slate-50 px-2 py-1 text-right tabular-nums", tone)}>
        {formatCOP(month)}
      </td>
    </tr>
  );
}

function SummaryCard({
  label, value, tone,
}: {
  label: string;
  value: string;
  tone: "emerald" | "rose" | "brand";
}) {
  const toneCls =
    tone === "emerald" ? "text-emerald-700" : tone === "rose" ? "text-rose-700" : "text-brand-dark";
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className={cn("mt-0.5 text-xl font-bold tabular-nums", toneCls)}>{value}</p>
    </div>
  );
}

function IconBtn({
  children, onClick, title, disabled, danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex h-6 w-6 items-center justify-center rounded border border-slate-200 bg-white text-[12px] text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30",
        danger && "hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600",
      )}
    >
      {children}
    </button>
  );
}
