import { NextRequest } from "next/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { corsJson, corsPreflight } from "@/lib/cors";
import {
  getDirectusRoom,
  quoteStay,
  findFreeRoom,
  parseIsoDate,
  ivaOf,
} from "@/lib/publicBooking";
import { createBoldPaymentLink } from "@/lib/bold";
import { notifyNewReservation } from "@/lib/notify";

export const runtime = "nodejs";
export const maxDuration = 30;

const bookSchema = z.object({
  room: z.string().min(1), // slug de Directus
  checkIn: z.string().min(10),
  checkOut: z.string().min(10),
  guestName: z.string().trim().min(3).max(120),
  guestPhone: z.string().trim().min(7).max(30),
  guestEmail: z.string().trim().email().max(120).optional().or(z.literal("")),
  guestsCount: z.coerce.number().int().min(1).max(6).default(2),
  payMode: z.enum(["hotel", "online", "deposit"]),
  notes: z.string().trim().max(500).optional().default(""),
});

export async function OPTIONS(req: NextRequest) {
  return corsPreflight(req.headers.get("origin"));
}

/**
 * POST /api/public/book — crea una reserva desde la web pública.
 * payMode "hotel"  → reserva PENDING (paga al llegar).
 * payMode "online" → reserva PENDING_PAYMENT + link de pago Bold (total + IVA 19%).
 */
export async function POST(req: NextRequest) {
  const origin = req.headers.get("origin");

  let data;
  try {
    data = bookSchema.parse(await req.json());
  } catch {
    return corsJson(origin, { error: "Datos incompletos o inválidos." }, { status: 400 });
  }

  const checkIn = parseIsoDate(data.checkIn);
  const checkOut = parseIsoDate(data.checkOut);
  if (!checkIn || !checkOut || checkOut <= checkIn) {
    return corsJson(origin, { error: "Fechas inválidas." }, { status: 400 });
  }
  const today = new Date(new Date().toISOString().slice(0, 10) + "T00:00:00Z");
  if (checkIn < today) {
    return corsJson(origin, { error: "El check-in no puede ser en el pasado." }, { status: 400 });
  }
  const nights = Math.round((checkOut.getTime() - checkIn.getTime()) / 86_400_000);
  if (nights > 30) {
    return corsJson(origin, { error: "Máximo 30 noches por reserva web." }, { status: 400 });
  }

  try {
    const dRoom = await getDirectusRoom(data.room);
    if (!dRoom) return corsJson(origin, { error: "Habitación no encontrada." }, { status: 404 });
    if (dRoom.max_guests && data.guestsCount > dRoom.max_guests) {
      return corsJson(origin, { error: `Máximo ${dRoom.max_guests} huéspedes para esta habitación.` }, { status: 400 });
    }

    const hotel = await prisma.hotel.findFirst();
    if (!hotel) return corsJson(origin, { error: "Hotel no configurado." }, { status: 500 });

    // Precio autoritativo por temporada (Directus) — nunca se confía en el cliente.
    const quote = quoteStay(dRoom, checkIn, checkOut);
    if (quote.subtotal <= 0) {
      return corsJson(origin, { error: "Esta habitación no tiene tarifa configurada." }, { status: 409 });
    }
    const iva = ivaOf(quote.subtotal);
    const total = quote.subtotal + iva;

    // Abono = SOLO el valor de la 1.ª noche, SIN IVA. El IVA y las noches
    // restantes se cobran después (quedan en el saldo).
    const depositSubtotal = quote.perNight[0]?.price ?? quote.subtotal;

    // Modo por temporada: alta = prepago total obligatorio; baja = apartar con 1 noche.
    if (hotel.webPrepayFull && data.payMode !== "online") {
      return corsJson(
        origin,
        { error: "En este momento la reserva requiere el prepago total en línea." },
        { status: 409 },
      );
    }

    // Monto a cobrar en línea según el modo elegido.
    const payOnline = data.payMode === "online" || data.payMode === "deposit";
    const chargeSubtotal = data.payMode === "deposit" ? depositSubtotal : quote.subtotal;
    // El abono NO lleva IVA (solo la noche); el prepago total sí.
    const chargeIva = data.payMode === "deposit" ? 0 : ivaOf(chargeSubtotal);
    const chargeTotal = chargeSubtotal + chargeIva;

    // Anti-sobreventa: asignar una habitación física libre en TODO el rango.
    const free = await findFreeRoom(dRoom, hotel.id, checkIn, checkOut);
    if (!free) {
      return corsJson(origin, { error: "No hay disponibilidad para esas fechas." }, { status: 409 });
    }

    const seasons = [...new Set(quote.perNight.map((n) => n.season).filter(Boolean))];
    const reservation = await prisma.reservation.create({
      data: {
        hotelId: hotel.id,
        roomId: free.id,
        guestName: data.guestName,
        guestPhone: data.guestPhone,
        guestEmail: data.guestEmail || null,
        channel: "DIRECT",
        checkIn,
        checkOut,
        nights,
        guestsCount: data.guestsCount,
        totalAmount: quote.subtotal,
        depositRequired: data.payMode === "deposit" ? depositSubtotal : 0,
        paidAmount: 0,
        balanceAmount: total,
        reservationStatus: payOnline ? "PENDING_PAYMENT" : "PENDING",
        paymentStatus: "NO_PAYMENT",
        notes:
          `Reserva web (${dRoom.short_name})` +
          (seasons.length ? ` · Temporada: ${seasons.join(", ")}` : "") +
          (data.notes ? ` · ${data.notes}` : ""),
        history: {
          create: {
            action: "web_booking",
            newData: {
              room: dRoom.slug,
              payMode: data.payMode,
              subtotal: quote.subtotal,
              iva,
              total,
              perNight: quote.perNight,
            },
            userName: "Web",
          },
        },
      },
    });

    // Notificación de reserva NUEVA por la web (no aplica a importaciones).
    await notifyNewReservation({
      hotelId: hotel.id,
      number: reservation.number,
      guestName: data.guestName,
      roomName: free.name,
      roomType: dRoom.short_name,
      channel: "DIRECT",
      checkIn,
      checkOut,
      via: "web",
      guestPhone: data.guestPhone,
      guestEmail: data.guestEmail || null,
      guestsCount: data.guestsCount,
      subtotal: quote.subtotal,
      status: payOnline ? "PENDING_PAYMENT" : "PENDING",
      notes: data.notes || null,
    });

    // Pago virtual → link Bold: total completo (online) o 1.ª noche (deposit).
    if (payOnline) {
      const isDeposit = data.payMode === "deposit";
      try {
        const link = await createBoldPaymentLink({
          reference: `RSV-${reservation.number}`,
          subtotal: chargeSubtotal,
          iva: chargeIva,
          description:
            (isDeposit
              ? `Abono 1 noche · Reserva #${reservation.number} · ${dRoom.short_name}`
              : `Reserva #${reservation.number} · ${dRoom.short_name} · ${data.checkIn} a ${data.checkOut}`).slice(0, 100),
          payerEmail: data.guestEmail || null,
          callbackUrl: `https://santalejandriahotels.com/cartagena?reserva=${reservation.number}`,
        });

        await prisma.$transaction([
          prisma.payment.create({
            data: {
              reservationId: reservation.id,
              provider: "bold",
              providerPaymentId: link.paymentLinkId,
              providerReference: `RSV-${reservation.number}`,
              paymentLink: link.url,
              amount: chargeTotal,
              status: "LINK_CREATED",
              method: "link",
            },
          }),
          prisma.reservation.update({
            where: { id: reservation.id },
            data: { paymentLink: link.url, paymentStatus: "LINK_CREATED" },
          }),
        ]);

        revalidatePath("/dashboard/forecast");
        return corsJson(origin, {
          ok: true,
          reservationNumber: reservation.number,
          nights,
          subtotal: quote.subtotal,
          iva,
          total,
          mode: data.payMode,
          amountToPay: chargeTotal,
          balanceAtHotel: isDeposit ? total - chargeTotal : 0,
          paymentUrl: link.url,
        });
      } catch (e) {
        console.error("[public/book] Bold error:", e);
        // La reserva queda creada; el hotel puede cobrar por otro medio.
        return corsJson(origin, {
          ok: true,
          reservationNumber: reservation.number,
          nights,
          subtotal: quote.subtotal,
          iva,
          total,
          mode: data.payMode,
          paymentUrl: null,
          warning: "Reserva creada, pero no se pudo generar el link de pago. El hotel te contactará.",
        });
      }
    }

    revalidatePath("/dashboard/forecast");
    return corsJson(origin, {
      ok: true,
      reservationNumber: reservation.number,
      nights,
      subtotal: quote.subtotal,
      iva,
      total,
      mode: data.payMode,
      amountToPay: 0,
      paymentUrl: null,
    });
  } catch (e) {
    console.error("[public/book]", e);
    return corsJson(origin, { error: "Error creando la reserva." }, { status: 500 });
  }
}
