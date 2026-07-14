"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession, canEditReservations, canManagePayments } from "@/lib/auth";
import { BOOKING_CHANNELS, EDITABLE_RESERVATION_STATUSES, totalDue } from "@/lib/domain";
import {
  parseDateInput,
  nightsBetween,
  addDays,
  findConflictsWith,
  lockRoom,
} from "@/lib/reservations";
import { notifyNewReservation, notifyReservationMoved } from "@/lib/notify";

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
  applyIva: z.preprocess((v) => v === "on" || v === "true" || v === true, z.boolean()),
  depositRequired: z.coerce.number().int().min(0).default(0),
  notes: z.string().trim().optional().default(""),
  // Campos del FORMATO DE RESERVAS
  roomsCount: z.coerce.number().int().min(1).default(1),
  upgrade: z.preprocess((v) => v === "on" || v === "true" || v === true, z.boolean()).default(false),
  mealPlan: z.string().trim().optional().default(""),
  arrivalTime: z.string().trim().optional().default(""),
  nationality: z.string().trim().optional().default(""),
  extraNights: z.coerce.number().int().min(0).default(0),
  company: z.string().trim().optional().default(""),
  cardRef: z.string().trim().optional().default(""),
  virtualAdvance: z.coerce.number().int().min(0).default(0),
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

  // Anti-sobreventa: lock por cuarto + chequeo de cruce + insert, todo atómico.
  // Dos recepcionistas (o web↔recepción) no pueden crear a la vez sobre el mismo cuarto/fechas.
  const outcome = await prisma.$transaction(async (tx) => {
    await lockRoom(tx, d.roomId);
    const conflicts = await findConflictsWith(tx, {
      hotelId: session.hotelId,
      roomId: d.roomId,
      checkIn,
      checkOut,
    });
    if (conflicts.length > 0) return { conflict: conflicts[0].label };
    const created = await tx.reservation.create({
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
        applyIva: d.applyIva,
        depositRequired: d.depositRequired,
        paidAmount: 0,
        balanceAmount: totalDue(d.totalAmount, d.applyIva), // saldo = total (+ IVA 19% si aplica)
        reservationStatus: "PENDING",
        paymentStatus: "NO_PAYMENT",
        notes: d.notes || null,
        roomsCount: d.roomsCount,
        upgrade: d.upgrade,
        mealPlan: d.mealPlan || null,
        arrivalTime: d.arrivalTime || null,
        nationality: d.nationality || null,
        extraNights: d.extraNights,
        company: d.company || null,
        cardRef: d.cardRef || null,
        virtualAdvance: d.virtualAdvance,
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
    return { created };
  });

  if ("conflict" in outcome) {
    return fail(`Cruce con ${outcome.conflict}. La habitación ya está ocupada en esas fechas.`);
  }
  const created = outcome.created;

  await notifyNewReservation({
    hotelId: session.hotelId,
    number: created.number,
    guestName: d.guestName,
    roomName: room.name,
    roomType: room.type,
    channel: d.channel,
    checkIn,
    checkOut,
    via: "recepción",
    guestPhone: d.guestPhone || null,
    guestEmail: d.guestEmail || null,
    guestsCount: d.guestsCount,
    subtotal: d.totalAmount,
    applyIva: d.applyIva,
    status: "PENDING",
    notes: d.notes || null,
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

  const balance = Math.max(0, totalDue(d.totalAmount, d.applyIva) - existing.paidAmount);

  // Anti-sobreventa: lock por cuarto + chequeo de cruce + update, atómico.
  const conflict = await prisma.$transaction(async (tx) => {
    await lockRoom(tx, d.roomId);
    const conflicts = await findConflictsWith(tx, {
      hotelId: session.hotelId,
      roomId: d.roomId,
      checkIn,
      checkOut,
      excludeId: d.id,
    });
    if (conflicts.length > 0) return conflicts[0].label;

    await tx.reservation.update({
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
      applyIva: d.applyIva,
      depositRequired: d.depositRequired,
      balanceAmount: balance,
      reservationStatus: d.reservationStatus,
      notes: d.notes || null,
      roomsCount: d.roomsCount,
      upgrade: d.upgrade,
      mealPlan: d.mealPlan || null,
      arrivalTime: d.arrivalTime || null,
      nationality: d.nationality || null,
      extraNights: d.extraNights,
      company: d.company || null,
      cardRef: d.cardRef || null,
      virtualAdvance: d.virtualAdvance,
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
    return null;
  });

  if (conflict) {
    return fail(`Cruce con ${conflict}. La habitación ya está ocupada en esas fechas.`);
  }

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

  const fromRoom = await prisma.room.findFirst({
    where: { id: existing.roomId },
    select: { name: true },
  });

  // Anti-sobreventa: lock del cuarto destino + chequeo + update, atómico.
  const conflict = await prisma.$transaction(async (tx) => {
    await lockRoom(tx, input.roomId);
    const conflicts = await findConflictsWith(tx, {
      hotelId: session.hotelId,
      roomId: input.roomId,
      checkIn,
      checkOut,
      excludeId: input.id,
    });
    if (conflicts.length > 0) return true;

    await tx.reservation.update({
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
    return false;
  });

  if (conflict) {
    return fail("No se puede mover la reserva. La habitación ya está ocupada en esas fechas.");
  }

  await notifyReservationMoved({
    hotelId: session.hotelId,
    number: existing.number,
    guestName: existing.guestName,
    fromRoom: fromRoom?.name ?? "—",
    toRoom: room.name,
    checkIn,
    checkOut,
    by: session.name,
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
  const due = totalDue(r.totalAmount, r.applyIva); // el pago total incluye IVA 19% si aplica
  const balance = Math.max(0, due - newPaid);

  let reservationStatus = r.reservationStatus;
  if (r.totalAmount > 0 && newPaid >= due) reservationStatus = "PAID";
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
