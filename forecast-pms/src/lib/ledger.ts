import { prisma } from "@/lib/prisma";
import {
  monthLabel,
  normalizeCells,
  type LedgerSheetData,
} from "@/lib/ledger/shared";

// Reexporta las utilidades puras para que el resto del server las importe desde
// "@/lib/ledger" como siempre. La lógica sin Prisma vive en "@/lib/ledger/shared".
export * from "@/lib/ledger/shared";

/**
 * Capa de datos del ledger "Ingresos y Gastos" (usa Prisma). Solo servidor.
 * Todo es manual: no jala datos de reservas.
 */

/** Lee la hoja del mes (o null si no existe todavía). */
export async function getLedgerSheet(
  hotelId: string,
  year: number,
  month: number,
): Promise<LedgerSheetData | null> {
  const sheet = await prisma.ledgerSheet.findUnique({
    where: { hotelId_year_month: { hotelId, year, month } },
    include: {
      sections: {
        orderBy: { sortOrder: "asc" },
        include: { rows: { orderBy: { sortOrder: "asc" } } },
      },
    },
  });
  if (!sheet) return null;
  return {
    id: sheet.id,
    year: sheet.year,
    month: sheet.month,
    daysInMonth: sheet.daysInMonth,
    monthLabel: monthLabel(sheet.year, sheet.month),
    note: sheet.note,
    sections: sheet.sections.map((s) => ({
      id: s.id,
      title: s.title,
      kind: s.kind,
      isText: s.isText,
      sortOrder: s.sortOrder,
      rows: s.rows.map((r) => ({
        id: r.id,
        label: r.label,
        roomId: r.roomId,
        sortOrder: r.sortOrder,
        cells: normalizeCells(r.cells),
      })),
    })),
  };
}

/** Meses con hoja creada, más recientes primero (para el selector). */
export async function listLedgerMonths(
  hotelId: string,
): Promise<{ year: number; month: number; label: string }[]> {
  const sheets = await prisma.ledgerSheet.findMany({
    where: { hotelId },
    select: { year: true, month: true },
    orderBy: [{ year: "desc" }, { month: "desc" }],
  });
  return sheets.map((s) => ({
    year: s.year,
    month: s.month,
    label: monthLabel(s.year, s.month),
  }));
}
