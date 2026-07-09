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
};

export type ParseResult = {
  reservations: ParsedReservation[];
  monthsScanned: string[];
  totalNotes: number;
};

/** Texto plano de un valor de celda exceljs (string / richText / result). */
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
  if (typeof note === "string") return note;
  const anyn = note as Record<string, unknown>;
  if (Array.isArray(anyn.texts)) {
    return (anyn.texts as { text: string }[]).map((t) => t.text).join("");
  }
  return null;
}

function detectChannel(text: string): BookingChannel {
  const t = text.toLowerCase();
  if (/\bbook|bhk\b/.test(t)) return "BOOKING";
  if (/\bexp|expedia\b/.test(t)) return "EXPEDIA";
  if (/airbnb|air\b/.test(t)) return "AIRBNB";
  if (/whats|\bwa\b/.test(t)) return "WHATSAPP";
  if (/walk/.test(t)) return "WALK_IN";
  if (/agenc/.test(t)) return "AGENCY";
  if (/\bdh\b|directo|hotel/.test(t)) return "DIRECT";
  return "OTHER";
}

function parseAmount(text: string): number {
  const m = text.match(/\$\s*([\d][\d.,]*)\s*(k)?/i);
  if (!m) return 0;
  let n = parseInt(m[1].replace(/[.,\s]/g, ""), 10);
  if (!Number.isFinite(n)) return 0;
  if (m[2] && n < 10000) n = n * 1000; // "$220k" → 220000
  return n;
}

function two(n: number) {
  return String(n).padStart(2, "0");
}

/** Construye YYYY-MM-DD desde año/mes(1-12)/día, con overflow (día en mes siguiente). */
function isoFrom(year: number, month1: number, day: number): string {
  return new Date(Date.UTC(year, month1 - 1, day)).toISOString().slice(0, 10);
}

/**
 * Parsea el libro del forecast. Cada reserva es un COMENTARIO de celda con
 * forma "…\nHuésped DD-DD/MM\nCanal $monto". Devuelve solo reservas cuyo
 * check-out sea >= cutoff (para no traer histórico).
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
      continue;
    }
    if (!curMonth) continue;

    // ¿Fila de habitación? etiqueta con un número de 3 dígitos (101..211)
    const roomMatch = aText.match(/\b(\d{3})\b/);
    if (!roomMatch) continue;
    const roomName = roomMatch[1];

    for (let c = 2; c <= maxCol; c++) {
      const cell = ws.getCell(r, c);
      const note = noteText(cell);
      if (!note) continue;
      totalNotes++;

      // Rango de fechas DD-DD/MM
      const dm = note.match(/(\d{1,2})\s*[-–]\s*(\d{1,2})\s*\/\s*(\d{1,2})/);
      if (!dm) continue;
      const dIn = parseInt(dm[1], 10);
      const dOut = parseInt(dm[2], 10);
      const mm = parseInt(dm[3], 10) || curMonth;
      if (dIn < 1 || dIn > 31) continue;

      const checkIn = isoFrom(curYear, mm, dIn);
      // Si el día de salida es <= entrada, cruza al mes siguiente
      const checkOut =
        dOut > dIn ? isoFrom(curYear, mm, dOut) : isoFrom(curYear, mm + 1, dOut);

      // Filtros de ventana operativa
      if (checkOut <= checkIn) continue;
      if (new Date(checkOut) < cutoff) continue;
      if (new Date(checkIn) > maxDate) continue; // descarta fechas erróneas lejanas

      // Huésped: texto antes del monto, sin fecha/canal/notas
      const lines = note.split("\n").map((l) => l.trim()).filter(Boolean);
      const dateLine =
        lines.find((l) => /\d{1,2}\s*[-–]\s*\d{1,2}\s*\/\s*\d{1,2}/.test(l)) ?? "";
      const clean = (s: string) =>
        s
          .split("$")[0]
          .replace(/\d{1,2}\s*[-–]\s*\d{1,2}\s*\/\s*\d{1,2}/g, " ")
          .replace(/\b(book(ing)?|exp(edia)?|dh|airbnb|air|bhk|directo|walk\s*in|agenc\w*)\b/gi, " ")
          .replace(/\bpcd\b|\btriple\b|\bt\.?\s*alta\b|\d\s*de\s*\d|\bhabs?\b|\bcx\b|\bojo\b|\bdpsito\b|\bvip\b|\bcmb\b/gi, " ")
          .replace(/[\/·:;.,]+/g, " ")
          .replace(/\s{2,}/g, " ")
          .trim();
      let guestName = clean(dateLine);
      if (guestName.length < 3) {
        const alt = lines.find(
          (l) => !/sta\s*alejandr|gerencia|usuario/i.test(l) && /[A-Za-zÁÉÍÓÚñ]{3,}/.test(l),
        );
        guestName = clean(alt ?? "");
      }
      if (guestName.length < 2) guestName = "Reserva importada";

      const channel = detectChannel(note);
      const totalAmount = parseAmount(note);

      const key = `${roomName}|${guestName.toLowerCase()}|${checkIn}`;
      if (seen.has(key)) continue;
      seen.add(key);

      reservations.push({
        roomName,
        guestName: guestName.slice(0, 80),
        checkIn,
        checkOut,
        channel,
        totalAmount,
        monthLabel: curLabel,
        source: note.replace(/\n/g, " / ").slice(0, 200),
      });
    }
  }

  return { reservations, monthsScanned, totalNotes };
}
