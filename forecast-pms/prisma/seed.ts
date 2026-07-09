import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import type {
  BookingChannel,
  ReservationStatus,
  PaymentStatus,
} from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

/** Fecha UTC a medianoche (para columnas @db.Date, evita corrimiento de día). */
function d(year: number, month1: number, day: number): Date {
  return new Date(Date.UTC(year, month1 - 1, day));
}
function nights(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

// 14 habitaciones reales del hotel (del forecast Excel).
const ROOMS: { name: string; type: string; capacity: number }[] = [
  { name: "101", type: "Doble Estándar", capacity: 2 },
  { name: "102", type: "Doble Estándar", capacity: 2 },
  { name: "103", type: "Doble Estándar", capacity: 2 },
  { name: "201", type: "Doble Estándar", capacity: 2 },
  { name: "202", type: "Doble Estándar", capacity: 2 },
  { name: "203", type: "King Superior", capacity: 2 },
  { name: "204", type: "King Superior", capacity: 2 },
  { name: "205", type: "King Superior", capacity: 2 },
  { name: "206", type: "King Superior", capacity: 2 },
  { name: "207", type: "Twin Estándar", capacity: 2 },
  { name: "208", type: "Twin Estándar", capacity: 2 },
  { name: "209", type: "King Superior", capacity: 2 },
  { name: "210", type: "King Superior", capacity: 2 },
  { name: "211", type: "Suite Alejandría", capacity: 3 },
];

type ResSeed = {
  room: string;
  guest: string;
  phone?: string;
  channel: BookingChannel;
  in: number; // día de julio 2026
  out: number;
  guests?: number;
  total: number;
  deposit: number;
  res: ReservationStatus;
  pay: PaymentStatus;
};

// Reservas demo de JULIO 2026 (sin cruces dentro de una misma habitación).
const RESERVATIONS: ResSeed[] = [
  { room: "101", guest: "Yesica Ramírez", phone: "3001112233", channel: "BOOKING", in: 3, out: 6, total: 540000, deposit: 270000, res: "CONFIRMED", pay: "APPROVED" },
  { room: "101", guest: "Luis Amaral", phone: "3002223344", channel: "DIRECT", in: 10, out: 13, total: 540000, deposit: 540000, res: "PAID", pay: "APPROVED" },
  { room: "101", guest: "Mónica Ramírez", phone: "3003334455", channel: "EXPEDIA", in: 20, out: 24, total: 720000, deposit: 0, res: "PENDING_PAYMENT", pay: "LINK_CREATED" },
  { room: "102", guest: "Juan P. Giraldo", phone: "3011234567", channel: "WHATSAPP", in: 5, out: 8, total: 540000, deposit: 200000, res: "DEPOSIT_PAID", pay: "APPROVED" },
  { room: "102", guest: "Martha Morales", channel: "BOOKING", in: 15, out: 18, total: 540000, deposit: 270000, res: "CONFIRMED", pay: "APPROVED" },
  { room: "103", guest: "Delio Cardona", phone: "3021234567", channel: "AGENCY", in: 1, out: 4, total: 510000, deposit: 510000, res: "PAID", pay: "APPROVED" },
  { room: "103", guest: "Will Fair", channel: "WALK_IN", in: 12, out: 14, total: 360000, deposit: 0, res: "CONFIRMED", pay: "NO_PAYMENT" },
  { room: "201", guest: "Mariana Ramírez", phone: "3031234567", channel: "BOOKING", in: 8, out: 12, total: 720000, deposit: 360000, res: "DEPOSIT_PAID", pay: "APPROVED" },
  { room: "202", guest: "Juliana Alves", channel: "EXPEDIA", in: 6, out: 9, total: 540000, deposit: 270000, res: "CONFIRMED", pay: "APPROVED" },
  { room: "202", guest: "Misael Contreras", channel: "DIRECT", in: 22, out: 25, total: 540000, deposit: 0, res: "PENDING", pay: "NO_PAYMENT" },
  { room: "203", guest: "Mario Arroyo", phone: "3041234567", channel: "DIRECT", in: 4, out: 7, total: 690000, deposit: 690000, res: "PAID", pay: "APPROVED" },
  { room: "203", guest: "Theolene Cerney", channel: "BOOKING", in: 18, out: 21, total: 690000, deposit: 345000, res: "CONFIRMED", pay: "APPROVED" },
  { room: "205", guest: "Catalina Lugo", channel: "BOOKING", in: 2, out: 5, total: 690000, deposit: 0, res: "NO_SHOW", pay: "REJECTED" },
  { room: "207", guest: "Louise Vancollenberghe", phone: "3051234567", channel: "AIRBNB", in: 10, out: 15, total: 850000, deposit: 425000, res: "CONFIRMED", pay: "APPROVED" },
  { room: "210", guest: "Raquel Ruiz", channel: "BOOKING", in: 7, out: 9, total: 460000, deposit: 230000, res: "CONFIRMED", pay: "APPROVED" },
  { room: "204", guest: "Alejandra Guaqueta", phone: "3061234567", channel: "WHATSAPP", in: 25, out: 28, total: 690000, deposit: 0, res: "PENDING_PAYMENT", pay: "LINK_CREATED" },
  { room: "211", guest: "Lilia Pineda", phone: "3071234567", channel: "DIRECT", in: 14, out: 19, guests: 3, total: 1750000, deposit: 875000, res: "DEPOSIT_PAID", pay: "APPROVED" },
];

async function main() {
  console.log("🌱 Seed: limpiando datos previos...");
  await prisma.reservationHistory.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.roomBlock.deleteMany();
  await prisma.room.deleteMany();
  await prisma.user.deleteMany();
  await prisma.hotel.deleteMany();

  const hotel = await prisma.hotel.create({
    data: {
      name: "Santa Alejandría Hotel",
      timezone: "America/Bogota",
      currency: "COP",
    },
  });
  console.log(`🏨 Hotel: ${hotel.name}`);

  const roomsById = new Map<string, string>();
  for (let i = 0; i < ROOMS.length; i++) {
    const r = ROOMS[i];
    const room = await prisma.room.create({
      data: {
        hotelId: hotel.id,
        name: r.name,
        type: r.type,
        capacity: r.capacity,
        sortOrder: i,
      },
    });
    roomsById.set(r.name, room.id);
  }
  console.log(`🛏️  ${ROOMS.length} habitaciones creadas`);

  const password = bcrypt.hashSync("Admin123", 10);
  await prisma.user.createMany({
    data: [
      { hotelId: hotel.id, name: "Administrador", email: "admin@hotel.com", password, role: "ADMIN" },
      { hotelId: hotel.id, name: "Recepción", email: "recepcion@hotel.com", password, role: "RECEPTION" },
      { hotelId: hotel.id, name: "Contabilidad", email: "contabilidad@hotel.com", password, role: "ACCOUNTING" },
      { hotelId: hotel.id, name: "Gerencia", email: "gerencia@hotel.com", password, role: "MANAGER" },
    ],
  });
  console.log("👤 4 usuarios creados (contraseña: Admin123)");

  let created = 0;
  for (const s of RESERVATIONS) {
    const roomId = roomsById.get(s.room);
    if (!roomId) throw new Error(`Habitación ${s.room} no existe`);
    const checkIn = d(2026, 7, s.in);
    const checkOut = d(2026, 7, s.out);
    const n = nights(checkIn, checkOut);

    let paid = 0;
    if (s.res === "PAID") paid = s.total;
    else if (s.res === "DEPOSIT_PAID" || s.res === "CONFIRMED") paid = s.deposit;
    const balance = s.total - paid;

    const reservation = await prisma.reservation.create({
      data: {
        hotelId: hotel.id,
        roomId,
        guestName: s.guest,
        guestPhone: s.phone ?? null,
        channel: s.channel,
        checkIn,
        checkOut,
        nights: n,
        guestsCount: s.guests ?? 2,
        totalAmount: s.total,
        depositRequired: s.deposit,
        paidAmount: paid,
        balanceAmount: balance,
        reservationStatus: s.res,
        paymentStatus: s.pay,
        history: {
          create: {
            action: "created",
            newData: { seed: true, guest: s.guest },
            userName: "Seed",
          },
        },
      },
    });

    if (paid > 0) {
      await prisma.payment.create({
        data: {
          reservationId: reservation.id,
          provider: "manual",
          amount: paid,
          status: "APPROVED",
          method: "manual",
          paidAt: checkIn,
        },
      });
    }
    created++;
  }
  console.log(`📅 ${created} reservas demo (julio 2026) creadas`);

  await prisma.roomBlock.create({
    data: {
      roomId: roomsById.get("206")!,
      startDate: d(2026, 7, 14),
      endDate: d(2026, 7, 17),
      reason: "Mantenimiento aire acondicionado",
    },
  });
  console.log("🚧 1 bloqueo de habitación creado (206, 14-17 jul)");

  console.log("✅ Seed completado");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error("❌ Error en seed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
