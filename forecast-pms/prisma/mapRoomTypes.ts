import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

/**
 * Nombre de cada habitación EN EL FORECAST (como lo conoce recepción).
 * OJO: esto es solo el display. El mapeo a los tipos comerciales de Directus
 * (para venta web) se controla en Directus con el campo `pms_rooms`, con
 * respaldo en publicBooking.ts (DEFAULT_ROOM_MAP). Editable en /dashboard/rooms.
 */
const DISPLAY: Record<string, string> = {
  "101": "Doble Estándar",
  "102": "Doble Estándar",
  "103": "Doble Estándar",
  "201": "Doble Estándar",
  "202": "Doble Estándar",
  "203": "King Superior",
  "204": "King Superior",
  "205": "King Superior",
  "206": "King Superior",
  "209": "King Superior",
  "210": "King Superior",
  "207": "Twin Estándar",
  "208": "Twin Estándar",
  "211": "Suite Alejandría",
};

async function main() {
  const rooms = await prisma.room.findMany();
  let updated = 0;
  for (const r of rooms) {
    const type = DISPLAY[r.name];
    if (type && r.type !== type) {
      await prisma.room.update({ where: { id: r.id }, data: { type } });
      console.log(`  ${r.name}: "${r.type}" → "${type}"`);
      updated++;
    }
  }
  console.log(`✅ Nombres del forecast actualizados: ${updated}/${rooms.length}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error("❌", e);
    await prisma.$disconnect();
    process.exit(1);
  });
