import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseForecastWorkbook } from "@/lib/import/forecastParser";
import { findConflicts, parseDateInput, nightsBetween } from "@/lib/reservations";

export const runtime = "nodejs";
export const maxDuration = 120;

function monthStartUtc(tz = "America/Bogota"): Date {
  const f = new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit" });
  const [y, m] = f.format(new Date()).split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 1));
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  if (session.role !== "ADMIN" && session.role !== "MANAGER") {
    return NextResponse.json({ error: "Solo Admin/Gerencia pueden importar" }, { status: 403 });
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Falta el archivo (.xlsx)" }, { status: 400 });
  }

  let parsed;
  try {
    const buf = Buffer.from(await file.arrayBuffer());
    parsed = await parseForecastWorkbook(buf, monthStartUtc());
  } catch {
    return NextResponse.json({ error: "No se pudo leer el Excel. ¿Es el forecast correcto?" }, { status: 400 });
  }

  const rooms = await prisma.room.findMany({ where: { hotelId: session.hotelId } });
  const roomByName = new Map(rooms.map((r) => [r.name, r.id]));

  let imported = 0;
  let skippedNoRoom = 0;
  let skippedConflict = 0;
  const byMonth: Record<string, number> = {};

  for (const r of parsed.reservations) {
    const roomId = roomByName.get(r.roomName);
    if (!roomId) {
      skippedNoRoom++;
      continue;
    }
    const checkIn = parseDateInput(r.checkIn);
    const checkOut = parseDateInput(r.checkOut);
    const conflicts = await findConflicts({ hotelId: session.hotelId, roomId, checkIn, checkOut });
    if (conflicts.length > 0) {
      skippedConflict++;
      continue;
    }
    await prisma.reservation.create({
      data: {
        hotelId: session.hotelId,
        roomId,
        guestName: r.guestName,
        channel: r.channel,
        checkIn,
        checkOut,
        nights: nightsBetween(checkIn, checkOut),
        guestsCount: 2,
        totalAmount: r.totalAmount,
        depositRequired: 0,
        paidAmount: 0,
        balanceAmount: r.totalAmount,
        reservationStatus: "CONFIRMED",
        paymentStatus: "NO_PAYMENT",
        notes: `Importado del Excel · ${r.source}`,
        createdById: session.userId,
        history: {
          create: {
            action: "imported",
            newData: { source: r.source, month: r.monthLabel },
            userId: session.userId,
            userName: session.name,
          },
        },
      },
    });
    imported++;
    byMonth[r.monthLabel] = (byMonth[r.monthLabel] ?? 0) + 1;
  }

  revalidatePath("/dashboard/forecast");

  return NextResponse.json({
    ok: true,
    imported,
    skippedNoRoom,
    skippedConflict,
    totalParsed: parsed.reservations.length,
    monthsScanned: parsed.monthsScanned.length,
    byMonth,
    sample: parsed.reservations.slice(0, 8),
  });
}
