import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

async function main() {
  console.log("🧹 Reset a 0: eliminando reservas, pagos, bloqueos e historial…");
  await prisma.reservationHistory.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.roomBlock.deleteMany();

  const rooms = await prisma.room.count();
  const users = await prisma.user.count();
  const reservations = await prisma.reservation.count();
  console.log(`✅ Listo. Quedan: ${rooms} habitaciones, ${users} usuarios, ${reservations} reservas.`);
  console.log("   El hotel y las habitaciones se conservan. Software en 0, listo para importar.");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error("❌ Error en reset:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
