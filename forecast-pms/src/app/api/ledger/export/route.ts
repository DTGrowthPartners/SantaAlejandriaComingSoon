import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { getSession } from "@/lib/auth";
import {
  getLedgerSheet,
  cellNumber,
  sectionDayTotals,
  computeTotals,
  MONTHS_ES,
} from "@/lib/ledger";

/**
 * Exporta la hoja del mes del ledger "Ingresos y Gastos" a un .xlsx, con la
 * misma forma que el Excel del hotel: columna de concepto + un día por columna +
 * total, un bloque por sección y un resumen diario al final.
 */
export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });

  const url = new URL(req.url);
  const year = parseInt(url.searchParams.get("y") ?? "", 10);
  const month = parseInt(url.searchParams.get("m") ?? "", 10);
  if (!Number.isFinite(year) || !Number.isFinite(month) || month < 1 || month > 12)
    return NextResponse.json({ ok: false, error: "Mes inválido" }, { status: 400 });

  const sheet = await getLedgerSheet(session.hotelId, year, month);
  if (!sheet) return NextResponse.json({ ok: false, error: "Sin hoja" }, { status: 404 });

  const days = sheet.daysInMonth;
  const wb = new ExcelJS.Workbook();
  wb.creator = "Forecast PMS · Santa Alejandría";
  const ws = wb.addWorksheet(`${MONTHS_ES[month - 1]} ${year}`.toUpperCase());

  // Anchos de columna + formato de miles (COP) en columnas numéricas
  ws.getColumn(1).width = 34;
  for (let d = 1; d <= days; d++) {
    ws.getColumn(d + 1).width = 11;
    ws.getColumn(d + 1).numFmt = "#,##0";
  }
  ws.getColumn(days + 2).width = 16;
  ws.getColumn(days + 2).numFmt = "#,##0";

  const headerFill: ExcelJS.Fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF2F5111" },
  };

  function headerRow() {
    const r = ws.addRow(["FECHA", ...Array.from({ length: days }, (_, i) => i + 1), "TOTAL"]);
    r.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = headerFill;
      cell.alignment = { horizontal: "center" };
    });
    return r;
  }

  for (const section of sheet.sections) {
    // Título de la sección
    const titleRow = ws.addRow([section.title]);
    titleRow.getCell(1).font = { bold: true, size: 12 };
    ws.mergeCells(titleRow.number, 1, titleRow.number, days + 2);
    headerRow();

    for (const row of section.rows) {
      const values: (number | string)[] = [row.label];
      let rowTot = 0;
      for (let d = 1; d <= days; d++) {
        const v = row.cells[String(d)];
        values.push(v ?? "");
        rowTot += cellNumber(v);
      }
      values.push(rowTot);
      ws.addRow(values);
    }

    // Total de la sección por día
    const dayTot = sectionDayTotals(section, days);
    const totRow: (number | string)[] = [`TOTAL ${section.title}`];
    let grand = 0;
    for (let d = 1; d <= days; d++) {
      totRow.push(dayTot[d]);
      grand += dayTot[d];
    }
    totRow.push(grand);
    const tr = ws.addRow(totRow);
    tr.eachCell((cell) => {
      cell.font = { bold: true };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFEDEDED" } };
    });
    ws.addRow([]);
  }

  // Resumen diario
  const totals = computeTotals(sheet);
  const sumTitle = ws.addRow(["RESUMEN DIARIO"]);
  sumTitle.getCell(1).font = { bold: true, size: 12 };
  ws.mergeCells(sumTitle.number, 1, sumTitle.number, days + 2);
  headerRow();
  const line = (label: string, arr: number[], month: number) =>
    ws.addRow([label, ...Array.from({ length: days }, (_, i) => arr[i + 1]), month]);
  line("INGRESOS", totals.income, totals.incomeMonth);
  line("GASTOS", totals.expense, totals.expenseMonth);
  const util = line("UTILIDAD", totals.utility, totals.utilityMonth);
  util.eachCell((cell) => (cell.font = { bold: true }));

  const buf = await wb.xlsx.writeBuffer();
  const fname = `Ingresos-Gastos-${MONTHS_ES[month - 1]}-${year}.xlsx`;
  return new NextResponse(buf as ArrayBuffer, {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${fname}"`,
    },
  });
}
