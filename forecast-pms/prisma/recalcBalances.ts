import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

const IVA_RATE = 0.19;
const totalConIva = (subtotal: number) => subtotal + Math.round(subtotal * IVA_RATE);

/** Recalcula balanceAmount de todas las reservas: total + IVA 19% − pagado. */
async function main() {
  const reservations = await prisma.reservation.findMany({
    select: { id: true, totalAmount: true, paidAmount: true, balanceAmount: true },
  });
  let updated = 0;
  for (const r of reservations) {
    const balance = Math.max(0, totalConIva(r.totalAmount) - r.paidAmount);
    if (balance !== r.balanceAmount) {
      await prisma.reservation.update({ where: { id: r.id }, data: { balanceAmount: balance } });
      updated++;
    }
  }
  console.log(`✅ Saldos recalculados con IVA 19%: ${updated}/${reservations.length} actualizados.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error("❌ Error:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
