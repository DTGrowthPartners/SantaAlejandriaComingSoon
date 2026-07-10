import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

/**
 * Alinea el `type` de las habitaciones físicas del PMS con los tipos
 * comerciales de Directus (short_name), para que la reserva web pueda
 * mapear tipo → habitaciones físicas. Las cantidades siguen el `quantity`
 * de Directus (Cartagena). Editable luego en /dashboard/rooms.
 */
const MAPPING: Record<string, string> = {
  "101": "Doble Económica",
  "102": "Doble Económica",
  "103": "Doble Estándar",
  "201": "Doble Estándar",
  "202": "Familiar - Económica",
  "203": "King",
  "204": "King",
  "205": "King",
  "206": "King",
  "209": "King",
  "210": "King Superior",
  "207": "Twins",
  "208": "Twins",
  "211": "Suite Alejandría", // no está en Directus → sin venta web (solo directa)
};

async function main() {
  const rooms = await prisma.room.findMany();
  let updated = 0;
  for (const r of rooms) {
    const type = MAPPING[r.name];
    if (type && r.type !== type) {
      await prisma.room.update({ where: { id: r.id }, data: { type } });
      console.log(`  ${r.name}: "${r.type}" → "${type}"`);
      updated++;
    }
  }
  console.log(`✅ Tipos actualizados: ${updated}/${rooms.length}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error("❌", e);
    await prisma.$disconnect();
    process.exit(1);
  });
