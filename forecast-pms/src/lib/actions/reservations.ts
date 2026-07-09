"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession, canEditReservations, canManagePayments } from "@/lib/auth";
import { BOOKING_CHANNELS, EDITABLE_RESERVATION_STATUSES } from "@/lib/domain";
import { parseDateInput, nightsBetween, addDays, findConflicts } from "@/lib/reservations";

export type ActionState = { ok: boolean; error: string | null };
const OK: ActionState = { ok: true, error: null };
const fail = (error: string): ActionState => ({ ok: false, error });

const baseFields = {
  roomId: z.string().min(1, "Selecciona una habitación"),
  guestName: z.string().trim().min(1, "El nombre del huésped es obligatorio"),
  guestPhone: z.string().trim().optional().default(""),
  guestEmail: z.string().trim().optional().default(""),
  channel: z.enum(BOOKING_CHANNELS),
  checkIn: z.string().min(1, "Check-in requerido"),
  checkOut: z.string().min(1, "Check-out requerido"),
  guestsCount: z.coerce.number().int().min(1).default(1),
  totalAmount: z.coerce.number().int().min(0).default(0),
  depositRequired: z.coerce.number().int().min(0).default(0),
  notes: z.string().trim().optional().default(""),
};
const createSchema = z.object(baseFields);
const updateSchema = z.object({
  ...baseFields,
  id: z.string().min(1),
  reservationStatus: z.enum(EDITABLE_RESERVATION_STATUSES),
});

function revalidate() {
  revalidatePath("/dashboard/forecast");
  revalidatePath("/dashboard/reservations");
}

export async function createReservationAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await getSession();
  if (!session) return fail("Sesión expirada, vuelve a entrar.");
  if (!canEditReservations(session.role)) return fail("No tienes permiso para crear reservas.");

  const parsed = createSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Datos inválidos.");
  const d = parsed.data;

  const checkIn = parseDateInput(d.checkIn);
  const checkOut = parseDateInput(d.checkOut);
  if (checkOut <= checkIn) return fail("El check-out debe ser posterior al check-in.");

  const room = await prisma.room.findFirst({
    where: { id: d.roomId, hotelId: session.hotelId },
  });
  if (!room) return fail("Habitación inválida.");

  const conflicts = await findConflicts({
    hotelId: session.hotelId,
    roomId: d.roomId,
    checkIn,
    checkOut,
  });
  if (conflicts.length > 0) {
    return fail(`Cruce con ${conflicts[0].label}. La habitación ya está ocupada en esas fechas.`);
  }

  await prisma.reservation.create({
    data: {
      hotelId: session.hotelId,
      roomId: d.roomId,
      guestName: d.guestName,
      guestPhone: d.guestPhone || null,
      guestEmail: d.guestEmail || null,
      channel: d.channel,
      checkIn,
      checkOut,
      nights: nightsBetween(checkIn, checkOut),
      guestsCount: d.guestsCount,
      totalAmount: d.totalAmount,
      depositRequired: d.depositRequired,
      paidAmount: 0,
      balanceAmount: d.totalAmount,
      reservationStatus: "PENDING",
      paymentStatus: "NO_PAYMENT",
      notes: d.notes || null,
      createdById: session.userId,
      history: {
        create: {
          action: "created",
          newData: { guestName: d.guestName, roomId: d.roomId, checkIn: d.checkIn, checkOut: d.checkOut },
          userId: session.userId,
          userName: session.name,
        },
      },
    },
  });

  revalidate();
  return OK;
}

export async function updateReservationAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await getSession();
  if (!session) return fail("Sesión expirada, vuelve a entrar.");
  if (!canEditReservations(session.role)) return fail("No tienes permiso para editar reservas.");

  const parsed = updateSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Datos inválidos.");
  const d = parsed.data;

  const existing = await prisma.reservation.findFirst({
    where: { id: d.id, hotelId: session.hotelId },
  });
  if (!existing) return fail("La reserva no existe.");

  const checkIn = parseDateInput(d.checkIn);
  const checkOut = parseDateInput(d.checkOut);
  if (checkOut <= checkIn) return fail("El check-out debe ser posterior al check-in.");

  const conflicts = await findConflicts({
    hotelId: session.hotelId,
    roomId: d.roomId,
    checkIn,
    checkOut,
    excludeId: d.id,
  });
  if (conflicts.length > 0) {
    return fail(`Cruce con ${conflicts[0].label}. La habitación ya está ocupada en esas fechas.`);
  }

  const balance = Math.max(0, d.totalAmount - existing.paidAmount);

  await prisma.reservation.update({
    where: { id: d.id },
    data: {
      roomId: d.roomId,
      guestName: d.guestName,
      guestPhone: d.guestPhone || null,
      guestEmail: d.guestEmail || null,
      channel: d.channel,
      checkIn,
      checkOut,
      nights: nightsBetween(checkIn, checkOut),
      guestsCount: d.guestsCount,
      totalAmount: d.totalAmount,
      depositRequired: d.depositRequired,
      balanceAmount: balance,
      reservationStatus: d.reservationStatus,
      notes: d.notes || null,
      history: {
        create: {
          action: "updated",
          oldData: {
            roomId: existing.roomId,
            checkIn: existing.checkIn.toISOString().slice(0, 10),
            checkOut: existing.checkOut.toISOString().slice(0, 10),
            status: existing.reservationStatus,
            total: existing.totalAmount,
          },
          newData: {
            roomId: d.roomId,
            checkIn: d.checkIn,
            checkOut: d.checkOut,
            status: d.reservationStatus,
            total: d.totalAmount,
          },
          userId: session.userId,
          userName: session.name,
        },
      },
    },
  });

  revalidate();
  return OK;
}

/** Mover reserva (drag & drop): cambia habitación y/o fecha, conserva la duración. */
export async function moveReservationAction(input: {
  id: string;
  roomId: string;
  checkIn: string;
}): Promise<ActionState> {
  const session = await getSession();
  if (!session) return fail("Sesión expirada, vuelve a entrar.");
  if (!canEditReservations(session.role)) return fail("No tienes permiso para mover reservas.");

  const existing = await prisma.reservation.findFirst({
    where: { id: input.id, hotelId: session.hotelId },
  });
  if (!existing) return fail("La reserva no existe.");

  const room = await prisma.room.findFirst({
    where: { id: input.roomId, hotelId: session.hotelId },
  });
  if (!room) return fail("Habitación inválida.");

  const checkIn = parseDateInput(input.checkIn);
  const checkOut = addDays(checkIn, existing.nights);

  const conflicts = await findConflicts({
    hotelId: session.hotelId,
    roomId: input.roomId,
    checkIn,
    checkOut,
    excludeId: input.id,
  });
  if (conflicts.length > 0) {
    return fail(
      "No se puede mover la reserva. La habitación ya está ocupada en esas fechas.",
    );
  }

  await prisma.reservation.update({
    where: { id: input.id },
    data: {
      roomId: input.roomId,
      checkIn,
      checkOut,
      history: {
        create: {
          action: "moved",
          oldData: {
            roomId: existing.roomId,
            checkIn: existing.checkIn.toISOString().slice(0, 10),
          },
          newData: { roomId: input.roomId, checkIn: input.checkIn },
          userId: session.userId,
          userName: session.name,
        },
      },
    },
  });

  revalidate();
  return OK;
}

export async function cancelReservationAction(id: string): Promise<ActionState> {
  const session = await getSession();
  if (!session) return fail("Sesión expirada, vuelve a entrar.");
  if (!canEditReservations(session.role)) return fail("No tienes permiso para cancelar reservas.");

  const existing = await prisma.reservation.findFirst({
    where: { id, hotelId: session.hotelId },
  });
  if (!existing) return fail("La reserva no existe.");

  await prisma.reservation.update({
    where: { id },
    data: {
      reservationStatus: "CANCELLED",
      history: {
        create: {
          action: "cancelled",
          oldData: { status: existing.reservationStatus },
          userId: session.userId,
          userName: session.name,
        },
      },
    },
  });

  revalidate();
  return OK;
}

export async function registerManualPaymentAction(input: {
  reservationId: string;
  amount: number;
  method: string;
}): Promise<ActionState> {
  const session = await getSession();
  if (!session) return fail("Sesión expirada, vuelve a entrar.");
  if (!canManagePayments(session.role)) return fail("No tienes permiso para registrar pagos.");

  const amount = Math.round(Number(input.amount));
  if (!Number.isFinite(amount) || amount <= 0) return fail("El monto debe ser mayor a 0.");

  const r = await prisma.reservation.findFirst({
    where: { id: input.reservationId, hotelId: session.hotelId },
  });
  if (!r) return fail("La reserva no existe.");

  const newPaid = r.paidAmount + amount;
  const balance = Math.max(0, r.totalAmount - newPaid);

  let reservationStatus = r.reservationStatus;
  if (r.totalAmount > 0 && newPaid >= r.totalAmount) reservationStatus = "PAID";
  else if (newPaid >= r.depositRequired && r.depositRequired > 0) reservationStatus = "DEPOSIT_PAID";

  await prisma.$transaction([
    prisma.payment.create({
      data: {
        reservationId: r.id,
        provider: "manual",
        amount,
        status: "APPROVED",
        method: input.method || "manual",
        paidAt: new Date(),
      },
    }),
    prisma.reservation.update({
      where: { id: r.id },
      data: {
        paidAmount: newPaid,
        balanceAmount: balance,
        reservationStatus,
        paymentStatus: "APPROVED",
        history: {
          create: {
            action: "payment",
            newData: { amount, method: input.method || "manual", newPaid, balance },
            userId: session.userId,
            userName: session.name,
          },
        },
      },
    }),
  ]);

  revalidate();
  return OK;
}
