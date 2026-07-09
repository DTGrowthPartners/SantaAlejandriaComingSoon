import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import type { UserRole } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

type UserInput = { email: string; name: string; role: UserRole; pw: string };

/**
 * Crea/actualiza usuarios del PMS a partir de la variable PMS_USERS_JSON.
 * Las contraseñas NO se guardan en el repo: se pasan por entorno al ejecutar.
 *
 * Uso:
 *   PMS_DELETE_DEMO=1 PMS_USERS_JSON='[{"email":"...","name":"...","role":"ADMIN","pw":"..."}]' npm run db:users
 */
async function main() {
  const raw = process.env.PMS_USERS_JSON;
  if (!raw) throw new Error("Falta la variable PMS_USERS_JSON con el arreglo de usuarios.");
  const users = JSON.parse(raw) as UserInput[];

  const hotel = await prisma.hotel.findFirst();
  if (!hotel) throw new Error("No hay hotel en la base. Corre el seed/reset primero.");

  for (const u of users) {
    const password = bcrypt.hashSync(u.pw, 10);
    const saved = await prisma.user.upsert({
      where: { email: u.email.toLowerCase() },
      update: { name: u.name, role: u.role, password, active: true, hotelId: hotel.id },
      create: {
        hotelId: hotel.id,
        email: u.email.toLowerCase(),
        name: u.name,
        role: u.role,
        password,
        active: true,
      },
    });
    const ok = bcrypt.compareSync(u.pw, saved.password);
    console.log(`  ✓ ${u.email} (${u.role}) · login verifica: ${ok ? "OK" : "FALLA"}`);
  }

  if (process.env.PMS_DELETE_DEMO === "1") {
    const del = await prisma.user.deleteMany({
      where: {
        email: {
          in: [
            "admin@hotel.com",
            "recepcion@hotel.com",
            "contabilidad@hotel.com",
            "gerencia@hotel.com",
          ],
        },
      },
    });
    console.log(`  🗑️  usuarios demo eliminados: ${del.count}`);
  }

  const all = await prisma.user.findMany({
    orderBy: { email: "asc" },
    select: { email: true, role: true },
  });
  console.log("Usuarios finales:", all.map((x) => `${x.email}[${x.role}]`).join("  "));
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error("❌ Error:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
