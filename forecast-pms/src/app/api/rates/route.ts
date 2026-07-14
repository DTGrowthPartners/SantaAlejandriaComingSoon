import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDirectusRates } from "@/lib/rates";

/**
 * Tarifas de Directus (precios web) para el formulario de reservas del PMS.
 * Protegido por sesión: solo el panel lo consume.
 */
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false, rates: [] }, { status: 401 });

  const rates = await getDirectusRates();
  return NextResponse.json({ ok: true, rates });
}
