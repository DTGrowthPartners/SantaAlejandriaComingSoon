"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession, canManageRooms } from "@/lib/auth";

export type RoomActionState = { ok: boolean; error: string | null };
const OK: RoomActionState = { ok: true, error: null };
const fail = (error: string): RoomActionState => ({ ok: false, error });

const roomSchema = z.object({
  name: z.string().trim().min(1, "El número/nombre es obligatorio"),
  type: z.string().trim().optional().default(""),
  directusSlug: z.string().trim().optional().default(""),
  capacity: z.coerce.number().int().min(1).max(20).default(2),
  sortOrder: z.coerce.number().int().min(0).default(0),
});

function revalidate() {
  revalidatePath("/dashboard/rooms");
  revalidatePath("/dashboard/forecast");
}

export async function createRoomAction(
  _prev: RoomActionState,
  formData: FormData,
): Promise<RoomActionState> {
  const session = await getSession();
  if (!session) return fail("Sesión expirada.");
  if (!canManageRooms(session.role)) return fail("No tienes permiso para gestionar habitaciones.");

  const parsed = roomSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Datos inválidos.");
  const d = parsed.data;

  await prisma.room.create({
    data: {
      hotelId: session.hotelId,
      name: d.name,
      type: d.type || null,
      directusSlug: d.directusSlug || null,
      capacity: d.capacity,
      sortOrder: d.sortOrder,
    },
  });
  revalidate();
  return OK;
}

export async function updateRoomAction(
  _prev: RoomActionState,
  formData: FormData,
): Promise<RoomActionState> {
  const session = await getSession();
  if (!session) return fail("Sesión expirada.");
  if (!canManageRooms(session.role)) return fail("No tienes permiso para gestionar habitaciones.");

  const id = String(formData.get("id") ?? "");
  const room = await prisma.room.findFirst({ where: { id, hotelId: session.hotelId } });
  if (!room) return fail("La habitación no existe.");

  const parsed = roomSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Datos inválidos.");
  const d = parsed.data;

  await prisma.room.update({
    where: { id },
    data: {
      name: d.name,
      type: d.type || null,
      directusSlug: d.directusSlug || null,
      capacity: d.capacity,
      sortOrder: d.sortOrder,
    },
  });
  revalidate();
  return OK;
}

export async function toggleRoomActiveAction(id: string): Promise<RoomActionState> {
  const session = await getSession();
  if (!session) return fail("Sesión expirada.");
  if (!canManageRooms(session.role)) return fail("No tienes permiso para gestionar habitaciones.");

  const room = await prisma.room.findFirst({ where: { id, hotelId: session.hotelId } });
  if (!room) return fail("La habitación no existe.");

  await prisma.room.update({ where: { id }, data: { active: !room.active } });
  revalidate();
  return OK;
}
