import ExcelJS from "exceljs";
import type { BookingChannel } from "@/generated/prisma/client";

const MONTHS_ES: Record<string, number> = {
  ENERO: 1, FEBRERO: 2, MARZO: 3, ABRIL: 4, MAYO: 5, JUNIO: 6,
  JULIO: 7, AGOSTO: 8, SEPTIEMBRE: 9, SEPT: 9, SEP: 9,
  OCTUBRE: 10, OCT: 10, NOVIEMBRE: 11, NOV: 11, DICIEMBRE: 12, DIC: 12,
};

export type ParsedReservation = {
  roomName: string;
  guestName: string;
  checkIn: string; // YYYY-MM-DD
  checkOut: string;
  channel: BookingChannel;
  totalAmount: number;
  monthLabel: string;
  source: string; // comentario original (para auditoría)
  hasNote: boolean; // true si la estancia venía anotada (comentario); false = solo color
};

export type ParseResult = {
  reservations: ParsedReservation[];
  monthsScanned: string[];
  totalNotes: number;
};

/** Texto plano de un valor de celda exceljs (string / richText / result / número). */
function cellText(v: ExcelJS.CellValue): string {
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (typeof v === "number") return String(v);
  if (typeof v === "object") {
    const anyv = v as unknown as Record<string, unknown>;
    if (Array.isArray(anyv.richText)) {
      return (anyv.richText as { text: string }[]).map((t) => t.text).join("");
    }
    if ("text" in anyv) return String(anyv.text);
    if ("result" in anyv) return String(anyv.result);
  }
  return "";
}

function noteText(cell: ExcelJS.Cell): string | null {
  const note = cell.note as unknown;
  if (!note) return null;
  if (typeof note === "string") return note.trim() || null;
  const anyn = note as Record<string, unknown>;
  if (Array.isArray(anyn.texts)) {
    const t = (anyn.texts as { text: string }[]).map((x) => x.text).join("").trim();
    return t || null;
  }
  return null;
}

/**
 * ¿La celda está "ocupada" (reservada esa noche)? En el forecast real una noche
 * ocupada aparece SIEMPRE con el valor 1 y con relleno de color; una noche libre
 * está vacía y sin relleno. Usamos la unión de ambas señales para no perder nada.
 */
function isOccupied(cell: ExcelJS.Cell): boolean {
  const v = cell.value;
  if (typeof v === "number" && v === 1) return true;
  if (typeof v === "string" && v.trim() === "1") return true;
  return isColoredFill(cell);
}

/**
 * Paleta del TEMA del libro (tema Office estándar, que es el que usa el forecast
 * del hotel), en el orden de índice que usa Excel en el atributo `theme` de la
 * celda: 0=lt1 1=dk1 2=lt2 3=dk2 4=accent1 … 9=accent6. Se usa para resolver a
 * RGB los colores por tema (que ExcelJS entrega como {theme, tint}); si el libro
 * trajera otro tema, la ocupación igual funciona por el valor 1, solo cambiaría
 * el matiz para clasificar el canal.
 */
const THEME_PALETTE = [
  "FFFFFF", "000000", "EEECE1", "1F497D",
  "4F81BD", "C0504D", "9BBB59", "8064A2", "4BACC6", "F79646",
];

/** Aplica el `tint` de Excel a un color base (aprox. estándar). */
function applyTint(hex: string, tint: number): string {
  const chan = (i: number) => {
    const c = parseInt(hex.slice(i, i + 2), 16);
    const v = tint < 0 ? c * (1 + tint) : c * (1 - tint) + 255 * tint;
    return Math.max(0, Math.min(255, Math.round(v)));
  };
  const to2 = (n: number) => n.toString(16).padStart(2, "0").toUpperCase();
  return to2(chan(0)) + to2(chan(2)) + to2(chan(4));
}

/** Devuelve el color de relleno de la celda resuelto a RRGGBB (o null). */
function resolveFillRgb(cell: ExcelJS.Cell): string | null {
  const f = cell.fill as ExcelJS.FillPattern | undefined;
  if (!f || f.type !== "pattern" || f.pattern !== "solid") return null;
  const fg = f.fgColor as { argb?: string; theme?: number; tint?: number } | undefined;
  if (!fg) return null;
  if (fg.argb) {
    const a = fg.argb.toUpperCase();
    return a.length === 8 ? a.slice(2) : a;
  }
  if (typeof fg.theme === "number") {
    const base = THEME_PALETTE[fg.theme];
    if (!base) return null;
    return applyTint(base, fg.tint ?? 0);
  }
  return null;
}

function rgbParts(rgb: string): [number, number, number] | null {
  if (!rgb || rgb.length < 6) return null;
  const r = parseInt(rgb.slice(0, 2), 16);
  const g = parseInt(rgb.slice(2, 4), 16);
  const b = parseInt(rgb.slice(4, 6), 16);
  if ([r, g, b].some((n) => Number.isNaN(n))) return null;
  return [r, g, b];
}

/** Relleno sólido con un color que no sea blanco/fondo. */
function isColoredFill(cell: ExcelJS.Cell): boolean {
  const rgb = resolveFillRgb(cell);
  const p = rgb && rgbParts(rgb);
  if (!p) return false;
  const [r, g, b] = p;
  if (r >= 250 && g >= 250 && b >= 250) return false; // blanco/fondo
  return true;
}

/**
 * ¿Es un tono ROSADO (magenta o rosa pálido)? En el forecast el rosado NO es una
 * reserva: es disponibilidad marcada en otro tono. Cubre tanto el magenta fuerte
 * (FC10FF) como el rosa pálido del tema (F2DBDB = accent2 aclarado).
 */
function isPinkRgb(rgb: string | null | undefined): boolean {
  const p = rgb ? rgbParts(rgb) : null;
  if (!p) return false;
  const [r, g, b] = p;
  // Magenta/fucsia fuerte: rojo y azul altos, verde bajo.
  if (r > 180 && b > 120 && g < 140 && r - g > 60 && b - g > 40) return true;
  // Rosa pálido / blush: claro, con matiz rojo y verde≈azul, ambos por debajo del rojo.
  if (r > 200 && r - g >= 15 && r - b >= 15 && Math.abs(g - b) < 25 && g > 150) return true;
  return false;
}

/**
 * Tono rosado. Por decisión del hotel NUNCA se importa (es disponibilidad),
 * tenga número o comentario o no.
 */
function isPinkFill(cell: ExcelJS.Cell): boolean {
  return isPinkRgb(resolveFillRgb(cell));
}

/** Clave estable del color de relleno, para separar reservas contiguas de distinto color. */
function fillKey(cell: ExcelJS.Cell): string | null {
  return resolveFillRgb(cell);
}

/** Canal inferido por la familia de color (fallback cuando no hay comentario). */
function channelFromRgb(rgb: string | null | undefined): BookingChannel | null {
  const p = rgb ? rgbParts(rgb) : null;
  if (!p) return null;
  const [r, g, b] = p;
  const max = Math.max(r, g, b);
  if (max < 40) return null; // casi negro → ignorar
  // Amarillo: rojo+verde altos, azul bajo
  if (r > 170 && g > 150 && b < 120) return "WALK_IN";
  // Naranja: rojo alto, verde medio, azul bajo
  if (r > 190 && g >= 90 && g <= 190 && b < 100) return "AGENCY";
  // Rojo / rosa: rojo domina, verde bajo
  if (r > 160 && g < 120 && b < 170 && r - g > 60) return "AIRBNB";
  // Verde: verde domina
  if (g >= r && g >= b && g > 90) return "DIRECT";
  // Morado / violeta: azul alto y rojo apreciable (rojo > verde)
  if (b >= 120 && r > 80 && r > g) return "EXPEDIA";
  // Azul: azul domina
  if (b >= r && b >= g && b > 90) return "BOOKING";
  return null;
}

function channelFromCell(cell: ExcelJS.Cell): BookingChannel | null {
  return channelFromRgb(resolveFillRgb(cell));
}

function detectChannel(text: string): BookingChannel | null {
  const t = text.toLowerCase();
  if (/\bbook|bhk\b/.test(t)) return "BOOKING";
  if (/\bexp|expedia\b/.test(t)) return "EXPEDIA";
  if (/airbnb|air\b/.test(t)) return "AIRBNB";
  if (/whats|\bwa\b/.test(t)) return "WHATSAPP";
  if (/walk/.test(t)) return "WALK_IN";
  if (/agenc/.test(t)) return "AGENCY";
  if (/\bdh\b|directo|hotel|gerencia/.test(t)) return "DIRECT";
  return null;
}

function parseAmount(text: string): number {
  const m = text.match(/\$\s*([\d][\d.,]*)\s*(k)?/i);
  if (!m) return 0;
  let n = parseInt(m[1].replace(/[.,\s]/g, ""), 10);
  if (!Number.isFinite(n)) return 0;
  if (m[2] && n < 10000) n = n * 1000; // "$220k" → 220000
  return n;
}

/** Construye YYYY-MM-DD desde año/mes(1-12)/día, con overflow (día en mes siguiente). */
function isoFrom(year: number, month1: number, day: number): string {
  return new Date(Date.UTC(year, month1 - 1, day)).toISOString().slice(0, 10);
}

/** Nombre del huésped a partir del texto del comentario. */
function guestFromNote(note: string): string {
  const lines = note.split("\n").map((l) => l.trim()).filter(Boolean);
  const dateLine =
    lines.find((l) => /\d{1,2}\s*[-–]\s*\d{1,2}\s*\/\s*\d{1,2}/.test(l)) ?? "";
  const clean = (s: string) =>
    s
      .split("$")[0]
      .replace(/\d{1,2}\s*[-–]\s*\d{1,2}\s*\/\s*\d{1,2}/g, " ")
      .replace(/\b(book(ing)?|exp(edia)?|dh|airbnb|air|bhk|directo|walk\s*in|agenc\w*)\b/gi, " ")
      .replace(/\bpcd\b|\btriple\b|\bt\.?\s*alta\b|\d\s*de\s*\d|\bhabs?\b|\bcx\b|\bojo\b|\bdpsito\b|\bvip\b|\bcmb\b|\bsenc\b/gi, " ")
      .replace(/sta\s*alejandr\w*:?|santa\s*alejandr\w*:?|gerencia:?|usuario:?/gi, " ")
      .replace(/[\/·:;.,]+/g, " ")
      .replace(/\s{2,}/g, " ")
      .trim();
  let guest = clean(dateLine);
  if (guest.length < 3) {
    const alt = lines.find(
      (l) => !/sta\s*alejandr|santa\s*alejandr|gerencia|usuario|temporada/i.test(l) && /[A-Za-zÁÉÍÓÚñ]{3,}/.test(l),
    );
    guest = clean(alt ?? "");
  }
  return guest.slice(0, 80);
}

type Run = {
  startCol: number; // columna Excel de la primera noche ocupada
  endCol: number; // columna Excel de la última noche ocupada
  colorKey: string | null;
  channelColor: BookingChannel | null;
  note: string | null; // comentario ancla (check-in)
};

/**
 * Parsea el libro del forecast. La verdad visual son los COLORES: cada celda
 * de habitación con valor 1 / relleno de color es una noche ocupada. Una
 * "reserva" es una tira contigua de noches ocupadas del mismo color (o hasta
 * un nuevo comentario de check-in). Así salen TODAS las reservas —incluso las
 * que no tienen comentario— y la suma de noches por día coincide con la fila
 * "TOTAL HAB/Día" del Excel. El comentario (cuando existe) aporta huésped,
 * canal y monto. Devuelve solo estancias cuyo check-out sea >= cutoff.
 */
export async function parseForecastWorkbook(
  buffer: ArrayBuffer | Buffer,
  cutoff: Date,
): Promise<ParseResult> {
  const wb = new ExcelJS.Workbook();
  // exceljs acepta Buffer/ArrayBuffer; el cast evita el desajuste del tipo genérico de Buffer.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await wb.xlsx.load(buffer as any);

  const ws =
    wb.getWorksheet("2026") ??
    wb.worksheets.find((w) => /2026|2025/.test(w.name)) ??
    wb.worksheets[wb.worksheets.length - 1];
  if (!ws) return { reservations: [], monthsScanned: [], totalNotes: 0 };

  const reservations: ParsedReservation[] = [];
  const monthsScanned: string[] = [];
  const seen = new Set<string>();
  let totalNotes = 0;
  // Ventana operativa: hasta ~18 meses adelante (descarta fechas erróneas del Excel)
  const maxDate = new Date(cutoff.getTime() + 550 * 86_400_000);

  let curMonth = 0;
  let curYear = 0;
  let curLabel = "";
  let dayByCol: Map<number, number> = new Map(); // columna Excel → día del mes
  const maxCol = Math.min(ws.columnCount || 40, 40);

  for (let r = 1; r <= ws.rowCount; r++) {
    const aText = cellText(ws.getCell(r, 1).value).trim();

    // ¿Encabezado de mes? "MES : JULIO 2026"
    const mesMatch = aText.match(/MES\s*:?\s*([A-Za-zÁÉÍÓÚñ]+)\s+(\d{4})/i);
    if (mesMatch) {
      const monthName = mesMatch[1].toUpperCase().replace(/[^A-Z]/g, "");
      curMonth = MONTHS_ES[monthName] ?? 0;
      curYear = parseInt(mesMatch[2], 10);
      curLabel = `${mesMatch[1]} ${curYear}`;
      if (curMonth) monthsScanned.push(curLabel);
      dayByCol = new Map();
      continue;
    }
    if (!curMonth) continue;

    // ¿Fila "FECHA" con los días del mes? Mapear columna → día.
    if (/^\s*FECHA\s*$/i.test(aText)) {
      for (let c = 2; c <= maxCol; c++) {
        const dv = ws.getCell(r, c).value;
        const d = typeof dv === "number" ? dv : parseInt(cellText(dv), 10);
        if (Number.isInteger(d) && d >= 1 && d <= 31) dayByCol.set(c, d);
      }
      continue;
    }

    // Ignorar la fila de totales del propio Excel.
    if (/TOTAL/i.test(aText)) continue;

    // ¿Fila de habitación? etiqueta con un número de 3 dígitos (101..211)
    const roomMatch = aText.match(/\b(\d{3})\b/);
    if (!roomMatch) continue;
    if (dayByCol.size === 0) continue; // sin cabecera de días no podemos ubicar fechas
    const roomName = roomMatch[1];

    // ── Recorrer la fila construyendo "runs" de noches ocupadas ──
    const runs: Run[] = [];
    let cur: Run | null = null;
    for (let c = 2; c <= maxCol; c++) {
      if (!dayByCol.has(c)) continue; // columna fuera del rango de días del mes
      const cell = ws.getCell(r, c);
      // Rosado = disponibilidad, nunca es reserva → tratar siempre como libre.
      const occupied = isOccupied(cell) && !isPinkFill(cell);
      if (!occupied) {
        cur = null;
        continue;
      }
      const note = noteText(cell);
      if (note) totalNotes++;
      const key = fillKey(cell);
      const startNew =
        cur === null ||
        note !== null || // un comentario marca un nuevo check-in
        (key !== null && cur.colorKey !== null && key !== cur.colorKey); // cambio de color = otro huésped
      if (startNew) {
        cur = {
          startCol: c,
          endCol: c,
          colorKey: key,
          channelColor: channelFromCell(cell),
          note,
        };
        runs.push(cur);
      } else {
        cur!.endCol = c;
        if (cur!.colorKey === null) cur!.colorKey = key;
        if (cur!.channelColor === null) cur!.channelColor = channelFromCell(cell);
      }
    }

    // ── Cada run → una reserva ──
    for (const run of runs) {
      const dIn = dayByCol.get(run.startCol);
      const dLast = dayByCol.get(run.endCol);
      if (dIn == null || dLast == null) continue;

      const checkIn = isoFrom(curYear, curMonth, dIn);
      // Check-out = día siguiente a la última noche ocupada (puede caer en el mes siguiente).
      const checkOut = isoFrom(curYear, curMonth, dLast + 1);

      // Filtros de ventana operativa
      if (checkOut <= checkIn) continue;
      if (new Date(checkOut) < cutoff) continue;
      if (new Date(checkIn) > maxDate) continue;

      const note = run.note ?? "";
      // Omitir bloqueos por remodelación (no son reservas).
      if (/remodelaci|remodelac|remodel/i.test(note)) continue;
      let guestName = note ? guestFromNote(note) : "";
      if (guestName.length < 2) guestName = "Ocupada (sin nombre)";

      const channel =
        (note ? detectChannel(note) : null) ?? run.channelColor ?? "OTHER";
      const totalAmount = note ? parseAmount(note) : 0;

      const key = `${roomName}|${checkIn}|${run.startCol}`;
      if (seen.has(key)) continue;
      seen.add(key);

      reservations.push({
        roomName,
        guestName,
        checkIn,
        checkOut,
        channel,
        totalAmount,
        monthLabel: curLabel,
        source: note ? note.replace(/\n/g, " / ").slice(0, 200) : "(ocupación por color, sin nota)",
        hasNote: Boolean(run.note),
      });
    }
  }

  return { reservations, monthsScanned, totalNotes };
}
