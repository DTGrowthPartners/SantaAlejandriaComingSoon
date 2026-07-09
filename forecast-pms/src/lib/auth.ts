import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import type { UserRole } from "@/generated/prisma/client";

const secret = new TextEncoder().encode(
  process.env.AUTH_SESSION_SECRET ?? "insecure-dev-secret",
);
const COOKIE = "fpms_session";
const DAYS = Number(process.env.AUTH_SESSION_DAYS ?? "7");

export type SessionPayload = {
  userId: string;
  hotelId: string;
  role: UserRole;
  name: string;
  email: string;
};

export async function createSession(payload: SessionPayload): Promise<void> {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${DAYS}d`)
    .sign(secret);

  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: DAYS * 24 * 60 * 60,
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE);
}

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return {
      userId: payload.userId as string,
      hotelId: payload.hotelId as string,
      role: payload.role as UserRole,
      name: payload.name as string,
      email: payload.email as string,
    };
  } catch {
    return null;
  }
}

/** Para usar en Server Components: redirige a /login si no hay sesión. */
export async function requireUser(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

/** Permisos por rol (MVP). */
export function canEditReservations(role: UserRole): boolean {
  return role === "ADMIN" || role === "MANAGER" || role === "RECEPTION";
}
export function canManagePayments(role: UserRole): boolean {
  return role === "ADMIN" || role === "ACCOUNTING" || role === "RECEPTION";
}
