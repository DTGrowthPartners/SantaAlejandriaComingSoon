"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export type ResetResult = { ok: boolean; error: string | null; deleted?: number };

/**
 * Cambia el modo de pago de la reserva web según la temporada.
 * prepayFull=true (temporada alta) → prepago total obligatorio.
 * prepayFull=false (temporada baja) → el cliente aparta con 1 noche.
 * Solo ADMIN.
 */
export async function setWebPaymentModeAction(
  prepayFull: boolean,
): Promise<{ ok: boolean; error?: string }> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Sesión expirada, vuelve a entrar." };
  if (session.role !== "ADMIN") {
    return { ok: false, error: "Solo un Administrador puede cambiar el modo de pago." };
  }
  await prisma.hotel.update({
    where: { id: session.hotelId },
    data: { webPrepayFull: prepayFull },
  });
  revalidatePath("/dashboard/settings");
  return { ok: true };
}

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
