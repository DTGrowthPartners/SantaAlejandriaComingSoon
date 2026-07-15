import "dotenv/config";
import path from "node:path";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { parseReferenceLedger } from "../src/lib/ledger/importer";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

/**
 * Importa el Excel de referencia del hotel al ledger "Ingresos y Gastos".
 * Idempotente: si la hoja del mes ya existe la borra y la recrea (borrado en
 * cascada de secciones/filas), así se puede re-correr sin duplicar.
 *
 *   npx tsx prisma/importLedger.ts [ruta.xlsx]
 *
 * Por defecto lee: docs-santalejandria/INGRESOS Y GASTOS POR DÍA JULIO 2026.xlsx
 * (cuya hoja con datos reales es "MAYO 2026").
 */
const DEFAULT_FILE =
  "/home/ubuntu/docs-santalejandria/INGRESOS Y GASTOS POR DÍA JULIO 2026.xlsx";

/** Extrae el número de habitación (101..211) de una etiqueta para vincular a Room. */
function roomNumberOf(label: string): string | null {
  const m = label.match(/\b([12]\d{2})\b/);
  return m ? m[1] : null;
}

async function main() {
  const file = path.resolve(process.argv[2] ?? DEFAULT_FILE);
  console.log(`📄 Leyendo ${file}`);

  const parsed = await parseReferenceLedger(file);

  // OJO: el archivo se llama "JULIO 2026" pero su hoja con datos es "MAYO 2026".
  // Los datos corresponden a JULIO 2026, así que por defecto se importa como
  // 2026-07. Se puede sobreescribir con LEDGER_YEAR / LEDGER_MONTH.
  const year = process.env.LEDGER_YEAR ? Number(process.env.LEDGER_YEAR) : 2026;
  const month = process.env.LEDGER_MONTH ? Number(process.env.LEDGER_MONTH) : 7;
  parsed.year = year;
  parsed.month = month;
  parsed.daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();

  console.log(
    `   Hoja fuente: "${parsed.sourceSheet}" → importada como ${parsed.year}-${String(parsed.month).padStart(2, "0")} ` +
      `(${parsed.daysInMonth} días), ${parsed.sections.length} secciones.`,
  );

  const hotel = await prisma.hotel.findFirst({ orderBy: { createdAt: "asc" } });
  if (!hotel) throw new Error("No hay hotel en la base de datos. Corre el seed primero.");

  // Mapa número de habitación → Room.id (para vincular filas cuando aplique)
  const rooms = await prisma.room.findMany({ where: { hotelId: hotel.id } });
  const roomByNumber = new Map(rooms.map((r) => [r.name, r.id]));

  // Idempotencia: borra la hoja del mes si ya existía.
  const existing = await prisma.ledgerSheet.findUnique({
    where: { hotelId_year_month: { hotelId: hotel.id, year: parsed.year, month: parsed.month } },
  });
  if (existing) {
    await prisma.ledgerSheet.delete({ where: { id: existing.id } });
    console.log(`   ♻️  Hoja previa ${parsed.year}-${parsed.month} borrada (re-import).`);
  }

  let totalRows = 0;
  let totalCells = 0;

  const sheet = await prisma.ledgerSheet.create({
    data: {
      hotelId: hotel.id,
      year: parsed.year,
      month: parsed.month,
      daysInMonth: parsed.daysInMonth,
      note: `Importado del Excel del hotel (hoja "${parsed.sourceSheet}").`,
      sections: {
        create: parsed.sections.map((s, si) => ({
          title: s.title,
          kind: s.kind,
          isText: s.isText,
          sortOrder: si,
          rows: {
            create: s.rows.map((r, ri) => {
              const cellCount = Object.keys(r.cells).length;
              totalRows++;
              totalCells += cellCount;
              const num = roomNumberOf(r.label);
              return {
                label: r.label,
                roomId: num ? roomByNumber.get(num) ?? null : null,
                sortOrder: ri,
                cells: r.cells,
              };
            }),
          },
        })),
      },
    },
    include: { sections: { include: { rows: true } } },
  });

  console.log(`\n✅ Hoja creada: id=${sheet.id}`);
  for (const s of sheet.sections.sort((a, b) => a.sortOrder - b.sortOrder)) {
    console.log(`   • [${s.kind}] ${s.title} — ${s.rows.length} filas`);
  }
  console.log(`\n   Total: ${sheet.sections.length} secciones, ${totalRows} filas, ${totalCells} celdas.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error("❌", e);
    await prisma.$disconnect();
    process.exit(1);
  });
