import ExcelJS from "exceljs";

/**
 * Importador del Excel de referencia "INGRESOS Y GASTOS POR DÍA" del hotel
 * (hoja con los datos reales: "MAYO 2026"). Lee cada bloque apilado de la hoja
 * y lo devuelve como una sección editable del ledger. Fiel al Excel: no se
 * pierde nada. Los bloques totalmente computados (TOTALES DÍA, UTILIDAD DIARIA)
 * y las filas "TOTAL ..." se omiten porque se recalculan en vivo.
 *
 * La hoja del hotel usa columnas B..AE = días 1..30 (col A = etiqueta,
 * AF = total mensual). Aunque a mayo le corresponden 31 días, el Excel corta en
 * el 30; se importan los 30 presentes y el día 31 queda vacío.
 */

export type ParsedRow = { label: string; cells: Record<string, number | string> };
export type ParsedSection = {
  title: string;
  kind: "INCOME" | "EXPENSE" | "DATA";
  isText: boolean;
  rows: ParsedRow[];
};
export type ParsedSheet = {
  year: number;
  month: number;
  daysInMonth: number;
  sourceSheet: string;
  sections: ParsedSection[];
};

/** Columnas de día en el Excel del hotel: B(2)..AE(31) = días 1..30. */
const MAX_DAY_COLS = 30;

/** Texto plano de un valor de celda exceljs. */
function cellText(v: ExcelJS.CellValue): string {
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (typeof v === "number") return String(v);
  if (v instanceof Date) return v.toISOString();
  if (typeof v === "object") {
    const anyv = v as unknown as Record<string, unknown>;
    if (Array.isArray(anyv.richText)) {
      return (anyv.richText as { text: string }[]).map((t) => t.text).join("");
    }
    if ("result" in anyv) return anyv.result == null ? "" : String(anyv.result);
    if ("text" in anyv) return String(anyv.text);
  }
  return "";
}

/** Valor de celda como número, texto o null (vacío). Resuelve fórmulas por su result. */
function cellValue(v: ExcelJS.CellValue): number | string | null {
  if (v == null) return null;
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const t = v.trim();
    return t === "" ? null : t;
  }
  if (typeof v === "object") {
    const anyv = v as unknown as Record<string, unknown>;
    if ("result" in anyv) {
      const r = anyv.result;
      if (typeof r === "number") return r;
      if (typeof r === "string") return r.trim() || null;
      return null;
    }
    const txt = cellText(v).trim();
    return txt === "" ? null : txt;
  }
  return null;
}

/**
 * Lee un bloque matricial etiqueta×día. Recorre las filas [firstRow, lastRow],
 * toma la etiqueta de la col A y los valores de las columnas de día. Salta filas
 * sin etiqueta y filas cuya etiqueta empieza por "TOTAL" (son derivadas).
 */
function readMatrix(
  ws: ExcelJS.Worksheet,
  firstRow: number,
  lastRow: number,
): ParsedRow[] {
  const rows: ParsedRow[] = [];
  for (let r = firstRow; r <= lastRow; r++) {
    const label = cellText(ws.getCell(r, 1).value).trim();
    if (!label) continue;
    if (label.toUpperCase().startsWith("TOTAL")) continue;
    const cells: Record<string, number | string> = {};
    for (let day = 1; day <= MAX_DAY_COLS; day++) {
      const val = cellValue(ws.getCell(r, day + 1).value);
      if (val !== null) cells[String(day)] = val;
    }
    rows.push({ label, cells });
  }
  return rows;
}

/**
 * Bloque auxiliar de provisión de nómina (no es matriz día×día): filas con una
 * etiqueta y uno o dos importes en columnas contiguas. Se preservan etiqueta +
 * importes (en orden) para no perder nada.
 */
function readPayroll(
  ws: ExcelJS.Worksheet,
  firstRow: number,
  lastRow: number,
): ParsedRow[] {
  const rows: ParsedRow[] = [];
  for (let r = firstRow; r <= lastRow; r++) {
    // Etiqueta: primer texto no vacío entre columnas A..C
    let label = "";
    for (let c = 1; c <= 3; c++) {
      const t = cellText(ws.getCell(r, c).value).trim();
      if (t && Number.isNaN(Number(t))) {
        label = t;
        break;
      }
    }
    // Importes: números en columnas B..F, en orden
    const nums: number[] = [];
    for (let c = 2; c <= 6; c++) {
      const v = cellValue(ws.getCell(r, c).value);
      if (typeof v === "number") nums.push(v);
    }
    if (!label && nums.length === 0) continue;
    const cells: Record<string, number | string> = {};
    nums.forEach((n, i) => {
      cells[String(i + 1)] = n;
    });
    rows.push({ label: label || "(subtotal)", cells });
  }
  return rows;
}

/**
 * Definición de los bloques de la hoja "MAYO 2026" (rangos verificados). Cada
 * bloque = una sección editable del ledger.
 */
const BLOCKS: {
  title: string;
  kind: "INCOME" | "EXPENSE" | "DATA";
  isText: boolean;
  first: number;
  last: number;
  reader?: "matrix" | "payroll";
}[] = [
  { title: "VALOR POR HABITACIÓN", kind: "INCOME", isText: false, first: 5, last: 20 },
  { title: "HABITACIONES QUE DUERMEN", kind: "DATA", isText: false, first: 28, last: 41 },
  { title: "#PAX HABITACIONES X NOCHE", kind: "DATA", isText: false, first: 48, last: 61 },
  { title: "DESAYUNOS X HAB", kind: "DATA", isText: false, first: 68, last: 81 },
  { title: "OTROS INGRESOS", kind: "INCOME", isText: false, first: 88, last: 101 },
  { title: "OTROS INGRESOS (BLOQUE 2)", kind: "DATA", isText: false, first: 108, last: 121 },
  { title: "CONTROL DE TURNOS DEL HOTEL", kind: "DATA", isText: true, first: 137, last: 150 },
  { title: "GASTOS DIARIOS", kind: "EXPENSE", isText: false, first: 156, last: 186 },
  { title: "PROVISIÓN DE NÓMINA (tabla auxiliar)", kind: "DATA", isText: false, first: 212, last: 228, reader: "payroll" },
];

/** Nombre de hoja preferido en el libro (los datos reales están en "MAYO 2026"). */
function pickDataSheet(wb: ExcelJS.Workbook): ExcelJS.Worksheet {
  // Busca una hoja cuyo nombre sea "<MES> <AÑO>" y tenga datos.
  const named = wb.worksheets.find((w) => /\b20\d{2}\b/.test(w.name) && w.rowCount > 20);
  return named ?? wb.worksheets[0];
}

const MONTHS_ES: Record<string, number> = {
  ENERO: 1, FEBRERO: 2, MARZO: 3, ABRIL: 4, MAYO: 5, JUNIO: 6,
  JULIO: 7, AGOSTO: 8, SEPTIEMBRE: 9, OCTUBRE: 10, NOVIEMBRE: 11, DICIEMBRE: 12,
};

function parseSheetMonth(name: string): { year: number; month: number } {
  const upper = name.toUpperCase();
  let month = 5;
  for (const [k, v] of Object.entries(MONTHS_ES)) {
    if (upper.includes(k)) {
      month = v;
      break;
    }
  }
  const ym = upper.match(/20\d{2}/);
  const year = ym ? Number(ym[0]) : 2026;
  return { year, month };
}

/** Lee el archivo de referencia y devuelve las secciones parseadas. */
export async function parseReferenceLedger(filePath: string): Promise<ParsedSheet> {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(filePath);
  const ws = pickDataSheet(wb);
  const { year, month } = parseSheetMonth(ws.name);
  const realDays = new Date(Date.UTC(year, month, 0)).getUTCDate();

  const sections: ParsedSection[] = [];
  for (const b of BLOCKS) {
    const rows =
      b.reader === "payroll"
        ? readPayroll(ws, b.first, b.last)
        : readMatrix(ws, b.first, b.last);
    if (rows.length === 0) continue;
    sections.push({ title: b.title, kind: b.kind, isText: b.isText, rows });
  }

  return {
    year,
    month,
    daysInMonth: realDays,
    sourceSheet: ws.name,
    sections,
  };
}
