import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

const DIRECTUS_URL = process.env.DIRECTUS_URL ?? "https://cms.santalejandriahotels.com";
const HOTEL_SLUG = process.env.PUBLIC_BOOKING_HOTEL_SLUG ?? "cartagena";

/**
 * Backfill idempotente: copia el mapeo actual de Directus (`pms_rooms` por tipo)
 * al campo `Room.directusSlug` del PMS, para que el vínculo web↔PMS arranque
 * COMPLETO y editable desde el PMS. A partir de aquí, recepción lo cambia en
 * /dashboard/rooms y `pms_rooms` de Directus queda como respaldo histórico.
 *
 * Correr una sola vez tras `prisma db push`:
 *   npx tsx prisma/backfillDirectusSlug.ts
 */
async function main() {
  const fields = [
    "slug",
    "pms_rooms",
  ].join(",");
  const url =
    `${DIRECTUS_URL}/items/rooms?fields=${fields}` +
    `&filter[status][_eq]=published` +
    `&filter[hotel][slug][_eq]=${encodeURIComponent(HOTEL_SLUG)}&limit=-1`;

  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Directus ${res.status}`);
  const body = (await res.json()) as { data: Array<{ slug: string; pms_rooms: string | null }> };

  // número de habitación → slug del tipo web
  const roomToSlug = new Map<string, string>();
  for (const t of body.data) {
    for (const num of (t.pms_rooms ?? "").split(/[\s,;]+/).map((s) => s.trim()).filter(Boolean)) {
      roomToSlug.set(num, t.slug);
    }
  }
  console.log(`Directus: ${body.data.length} tipos, ${roomToSlug.size} habitaciones mapeadas.`);

  const rooms = await prisma.room.findMany();
  let updated = 0;
  for (const r of rooms) {
    const slug = roomToSlug.get(r.name) ?? null;
    // Solo escribe si aún no está vinculada (no piso cambios hechos a mano en el PMS).
    if (slug && r.directusSlug == null) {
      await prisma.room.update({ where: { id: r.id }, data: { directusSlug: slug } });
      console.log(`  ${r.name} → ${slug}`);
      updated++;
    }
  }
  console.log(`✅ Vínculos web escritos: ${updated} (las ya vinculadas no se tocan).`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error("❌", e);
    await prisma.$disconnect();
    process.exit(1);
  });
