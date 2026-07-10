"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function dismissNotification(id: string): Promise<{ ok: boolean }> {
  const s = await getSession();
  if (!s) return { ok: false };
  await prisma.notification.updateMany({
    where: { id, hotelId: s.hotelId },
    data: { dismissed: true },
  });
  return { ok: true };
}

export async function dismissAllNotifications(): Promise<{ ok: boolean }> {
  const s = await getSession();
  if (!s) return { ok: false };
  await prisma.notification.updateMany({
    where: { hotelId: s.hotelId, dismissed: false },
    data: { dismissed: true },
  });
  return { ok: true };
}
