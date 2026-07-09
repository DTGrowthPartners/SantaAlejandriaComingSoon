"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export type ResetResult = { ok: boolean; error: string | null; deleted?: number };

/**
 * Reinicia los datos operativos a 0: elimina reservas, pagos, bloqueos e
 * historial. Conserva hotel, habitaciones y usuarios. Solo ADMIN, y requiere
 * que el usuario escriba exactamente "REINICIAR" como reconfirmación.
 */
export async function resetDataAction(confirmText: string): Promise<ResetResult> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Sesión expirada, vuelve a entrar." };
  if (session.role !== "ADMIN") {
    return { ok: false, error: "Solo un Administrador puede reiniciar los datos." };
  }
  if (confirmText.trim() !== "REINICIAR") {
    return { ok: false, error: 'Escribe "REINICIAR" para confirmar.' };
  }

  const deleted = await prisma.reservation.count({ where: { hotelId: session.hotelId } });

  await prisma.reservationHistory.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.reservation.deleteMany({ where: { hotelId: session.hotelId } });
  await prisma.roomBlock.deleteMany({ where: { room: { hotelId: session.hotelId } } });

  revalidatePath("/dashboard/forecast");
  revalidatePath("/dashboard/reservations");
  return { ok: true, error: null, deleted };
}
