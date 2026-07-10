import { prisma } from "@/lib/prisma";
import { CHANNEL_META, RESERVATION_STATUS_META, ivaOf, totalConIva } from "@/lib/domain";
import { formatDateShort, nightsBetween, formatCOP } from "@/lib/format";
import { sendNewReservationEmail } from "@/lib/email";
import { emitNotification } from "@/lib/notifyBus";
import type { BookingChannel, ReservationStatus } from "@/generated/prisma/client";

/**
 * Crea una notificación por una reserva NUEVA (web o recepción) y envía el
 * correo corporativo con toda la info. NO se llama en la importación de Excel.
 * Nunca lanza: si falla, no rompe la creación de la reserva.
 */
export async function notifyNewReservation(params: {
  hotelId: string;
  number: number;
  guestName: string;
  roomName: string;
  channel: BookingChannel;
  checkIn: Date;
  checkOut: Date;
  via: string; // "web" | "recepción"
  // Detalle opcional para el correo:
  guestPhone?: string | null;
  guestEmail?: string | null;
  roomType?: string | null;
  guestsCount?: number;
  subtotal?: number;
  status?: ReservationStatus;
  notes?: string | null;
}): Promise<void> {
  const ch = CHANNEL_META[params.channel]?.label ?? params.channel;

  try {
    await prisma.notification.create({
      data: {
        hotelId: params.hotelId,
        kind: "reservation",
        title: `Nueva reserva #${params.number}`,
        message: `${params.guestName} · Hab ${params.roomName} · ${formatDateShort(params.checkIn)} → ${formatDateShort(params.checkOut)} · ${ch} · ${params.via}`,
        reservationNumber: params.number,
      },
    });
    emitNotification(params.hotelId);
  } catch (e) {
    console.error("[notify] no se pudo crear la notificación:", e);
  }

  const subtotal = params.subtotal ?? 0;
  await sendNewReservationEmail({
    number: params.number,
    guestName: params.guestName,
    guestPhone: params.guestPhone,
    guestEmail: params.guestEmail,
    roomName: params.roomName,
    roomType: params.roomType,
    channelLabel: ch,
    via: params.via,
    checkIn: params.checkIn,
    checkOut: params.checkOut,
    nights: nightsBetween(params.checkIn, params.checkOut),
    guestsCount: params.guestsCount ?? 1,
    subtotal,
    iva: ivaOf(subtotal),
    total: totalConIva(subtotal),
    statusLabel: params.status ? RESERVATION_STATUS_META[params.status]?.label ?? params.status : "Pendiente",
    notes: params.notes,
  });
}

/**
 * Notifica un PAGO recibido (webhook Bold aprobado o reconciliación).
 * Crea el cuadrito y empuja el evento SSE para refrescar la pantalla de Pagos.
 * Nunca lanza.
 */
export async function notifyPaymentReceived(params: {
  hotelId: string;
  number: number;
  guestName: string;
  amount: number;
}): Promise<void> {
  try {
    await prisma.notification.create({
      data: {
        hotelId: params.hotelId,
        kind: "payment",
        title: `Pago recibido · Reserva #${params.number}`,
        message: `${params.guestName} · ${formatCOP(params.amount)}`,
        reservationNumber: params.number,
      },
    });
    emitNotification(params.hotelId);
  } catch (e) {
    console.error("[notify] no se pudo crear la notificación de pago:", e);
  }
}

/**
 * Crea una notificación cuando una reserva CAMBIA DE LUGAR (habitación o fecha).
 * Nunca lanza: si falla, no rompe el movimiento de la reserva.
 */
export async function notifyReservationMoved(params: {
  hotelId: string;
  number: number;
  guestName: string;
  fromRoom: string;
  toRoom: string;
  checkIn: Date;
  checkOut: Date;
  by: string; // nombre de quien la movió
}): Promise<void> {
  try {
    const sameRoom = params.fromRoom === params.toRoom;
    const where = sameRoom
      ? `Hab ${params.toRoom}`
      : `Hab ${params.fromRoom} → Hab ${params.toRoom}`;
    await prisma.notification.create({
      data: {
        hotelId: params.hotelId,
        kind: "move",
        title: `Reserva #${params.number} movida`,
        message: `${params.guestName} · ${where} · ${formatDateShort(params.checkIn)} → ${formatDateShort(params.checkOut)} · ${params.by}`,
        reservationNumber: params.number,
      },
    });
    emitNotification(params.hotelId);
  } catch (e) {
    console.error("[notify] no se pudo crear la notificación de movimiento:", e);
  }
}
