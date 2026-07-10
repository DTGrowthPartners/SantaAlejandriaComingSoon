import { prisma } from "@/lib/prisma";
import { CHANNEL_META } from "@/lib/domain";
import { formatDateShort } from "@/lib/format";
import type { BookingChannel } from "@/generated/prisma/client";

/**
 * Crea una notificación por una reserva NUEVA (web o recepción).
 * NO se llama en la importación de Excel (esas no deben notificar).
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
}): Promise<void> {
  try {
    const ch = CHANNEL_META[params.channel]?.label ?? params.channel;
    await prisma.notification.create({
      data: {
        hotelId: params.hotelId,
        kind: "reservation",
        title: `Nueva reserva #${params.number}`,
        message: `${params.guestName} · Hab ${params.roomName} · ${formatDateShort(params.checkIn)} → ${formatDateShort(params.checkOut)} · ${ch} · ${params.via}`,
        reservationNumber: params.number,
      },
    });
  } catch (e) {
    console.error("[notify] no se pudo crear la notificación:", e);
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
  } catch (e) {
    console.error("[notify] no se pudo crear la notificación de movimiento:", e);
  }
}
