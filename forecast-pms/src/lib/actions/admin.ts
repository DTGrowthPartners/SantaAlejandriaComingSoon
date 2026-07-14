"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession, canAdmin } from "@/lib/auth";

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
  if (!canAdmin(session.role)) {
    return { ok: false, error: "No tienes permiso para cambiar el modo de pago." };
  }
  await prisma.hotel.update({
    where: { id: session.hotelId },
    data: { webPrepayFull: prepayFull },
  });
  revalidatePath("/dashboard/settings");
  return { ok: true };
}

/**
 * Cambia si la reserva web cobra IVA 19% o queda exenta.
 * applyIva=true (por defecto) → la web cobra con IVA.
 * applyIva=false → la web cobra sin IVA.
 * Solo afecta reservas web NUEVAS; las ya creadas conservan su propio `applyIva`.
 * Solo ADMIN.
 */
export async function setWebIvaAction(
  applyIva: boolean,
): Promise<{ ok: boolean; error?: string }> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Sesión expirada, vuelve a entrar." };
  if (!canAdmin(session.role)) {
    return { ok: false, error: "No tienes permiso para cambiar el IVA de la web." };
  }
  await prisma.hotel.update({
    where: { id: session.hotelId },
    data: { webApplyIva: applyIva },
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
  if (!canAdmin(session.role)) {
    return { ok: false, error: "No tienes permiso para reiniciar los datos." };
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
