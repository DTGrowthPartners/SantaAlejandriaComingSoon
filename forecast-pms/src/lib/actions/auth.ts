"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSession, destroySession } from "@/lib/auth";

export type LoginState = { error: string | null };

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Ingresa tu correo y contraseña." };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.active || !bcrypt.compareSync(password, user.password)) {
    return { error: "Correo o contraseña incorrectos." };
  }

  await createSession({
    userId: user.id,
    hotelId: user.hotelId,
    role: user.role,
    name: user.name,
    email: user.email,
  });

  redirect("/dashboard/forecast");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/login");
}
