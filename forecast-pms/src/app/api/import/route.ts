import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseForecastWorkbook } from "@/lib/import/forecastParser";
import { findConflicts, parseDateInput, nightsBetween } from "@/lib/reservations";
import { totalConIva } from "@/lib/domain";

export const runtime = "nodejs";
export const maxDuration = 120;

/** Inicio del año en curso (zona horaria del hotel). Importamos todo el año. */
function yearStartUtc(tz = "America/Bogota"): Date {
  const f = new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric" });
  const y = Number(f.format(new Date()));
  return new Date(Date.UTC(y, 0, 1));
}

/** Código de habitación (3 dígitos) hallado en el nombre o el tipo. */
function roomCode(text: string | null | undefined): string | null {
  const m = (text ?? "").match(/\b(\d{3})\b/);
  return m ? m[1] : null;
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  // Cualquier usuario autenticado puede importar el forecast.

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Falta el archivo (.xlsx)" }, { status: 400 });
  }

  let parsed;
  try {
    const buf = Buffer.from(await file.arrayBuffer());
    parsed = await parseForecastWorkbook(buf, yearStartUtc());
  } catch {
    return NextResponse.json({ error: "No se pudo leer el Excel. ¿Es el forecast correcto?" }, { status: 400 });
  }

  const rooms = await prisma.room.findMany({ where: { hotelId: session.hotelId } });
  // Matcheamos por el CÓDIGO de 3 dígitos (101..211), buscándolo en el nombre o
  // en el tipo. Así, aunque en la pestaña Habitaciones renombren el cuarto, la
  // importación sigue funcionando mientras el número siga en el nombre o el tipo.
  const roomByCode = new Map<string, string>();
  for (const r of rooms) {
    const code = roomCode(r.name) ?? roomCode(r.type);
    if (code && !roomByCode.has(code)) roomByCode.set(code, r.id);
  }

  let imported = 0;
  let skippedNoRoom = 0;
  let skippedConflict = 0;
  const byMonth: Record<string, number> = {};

  for (const r of parsed.reservations) {
    const roomId = roomByCode.get(r.roomName);
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
        balanceAmount: totalConIva(r.totalAmount), // saldo incluye IVA 19%
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
    colorOnly: parsed.reservations.filter((r) => !r.hasNote).length,
    monthsScanned: parsed.monthsScanned.length,
    byMonth,
    sample: parsed.reservations.slice(0, 8),
  });
}
