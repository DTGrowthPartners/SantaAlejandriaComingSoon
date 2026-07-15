import type { LedgerSectionKind } from "@/generated/prisma/client";

/**
 * Utilidades PURAS del ledger (sin Prisma), aptas para el cliente: tipos,
 * etiquetas de mes, cálculo de totales en vivo. La capa de datos (Prisma) vive
 * en `@/lib/ledger`.
 */

export const MONTHS_ES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

/** Iniciales de día de semana (D L M M J V S). */
export const WEEKDAYS_ES = ["D", "L", "M", "M", "J", "V", "S"];

export function monthLabel(year: number, month: number): string {
  return `${MONTHS_ES[month - 1] ?? "?"} ${year}`;
}

/** Días reales del mes (28-31). month es 1-12. */
export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/** Inicial del día de la semana para un día concreto del mes. */
export function weekdayInitial(year: number, month: number, day: number): string {
  const dow = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  return WEEKDAYS_ES[dow] ?? "";
}

export type LedgerCellValue = number | string;
export type LedgerCells = Record<string, LedgerCellValue>;

export type LedgerRowData = {
  id: string;
  label: string;
  roomId: string | null;
  sortOrder: number;
  cells: LedgerCells;
};

export type LedgerSectionData = {
  id: string;
  title: string;
  kind: LedgerSectionKind;
  isText: boolean;
  sortOrder: number;
  rows: LedgerRowData[];
};

export type LedgerSheetData = {
  id: string;
  year: number;
  month: number;
  daysInMonth: number;
  monthLabel: string;
  note: string | null;
  sections: LedgerSectionData[];
};

/** Convierte el Json crudo de Prisma a un mapa día→valor limpio. */
export function normalizeCells(raw: unknown): LedgerCells {
  const out: LedgerCells = {};
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
      if (v == null || v === "") continue;
      if (typeof v === "number") out[k] = v;
      else if (typeof v === "string") out[k] = v;
      else out[k] = String(v);
    }
  }
  return out;
}

/** Valor numérico de una celda (0 si es texto o vacío). */
export function cellNumber(v: LedgerCellValue | undefined): number {
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const n = Number(v.replace(/[^\d.-]/g, ""));
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

/** Suma numérica de una fila (total del mes de esa fila). */
export function rowTotal(row: LedgerRowData): number {
  return Object.values(row.cells).reduce<number>((acc, v) => acc + cellNumber(v), 0);
}

/** Totales por día de una sección (index 1..daysInMonth). */
export function sectionDayTotals(section: LedgerSectionData, days: number): number[] {
  const totals = new Array<number>(days + 1).fill(0);
  for (const row of section.rows) {
    for (let d = 1; d <= days; d++) {
      totals[d] += cellNumber(row.cells[String(d)]);
    }
  }
  return totals;
}

export type LedgerTotals = {
  /** index 1..daysInMonth */
  income: number[];
  expense: number[];
  utility: number[];
  incomeMonth: number;
  expenseMonth: number;
  utilityMonth: number;
};

/** Ingresos, gastos y utilidad por día y del mes (solo secciones INCOME/EXPENSE). */
export function computeTotals(sheet: LedgerSheetData): LedgerTotals {
  const days = sheet.daysInMonth;
  const income = new Array<number>(days + 1).fill(0);
  const expense = new Array<number>(days + 1).fill(0);
  for (const section of sheet.sections) {
    if (section.kind === "INCOME" || section.kind === "EXPENSE") {
      const t = sectionDayTotals(section, days);
      const target = section.kind === "INCOME" ? income : expense;
      for (let d = 1; d <= days; d++) target[d] += t[d];
    }
  }
  const utility = new Array<number>(days + 1).fill(0);
  let incomeMonth = 0;
  let expenseMonth = 0;
  for (let d = 1; d <= days; d++) {
    utility[d] = income[d] - expense[d];
    incomeMonth += income[d];
    expenseMonth += expense[d];
  }
  return {
    income,
    expense,
    utility,
    incomeMonth,
    expenseMonth,
    utilityMonth: incomeMonth - expenseMonth,
  };
}
