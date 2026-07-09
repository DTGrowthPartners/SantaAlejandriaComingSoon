const COP = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

/** Formatea un monto en pesos colombianos: 288000 → "$ 288.000". */
export function formatCOP(amount: number | null | undefined): string {
  return COP.format(amount ?? 0);
}

const DATE_LONG = new Intl.DateTimeFormat("es-CO", {
  timeZone: "UTC",
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const DATE_SHORT = new Intl.DateTimeFormat("es-CO", {
  timeZone: "UTC",
  day: "2-digit",
  month: "2-digit",
});

/** Fecha guardada como @db.Date se interpreta en UTC para no correr el día. */
export function formatDate(date: Date | string): string {
  return DATE_LONG.format(new Date(date));
}

export function formatDateShort(date: Date | string): string {
  return DATE_SHORT.format(new Date(date));
}

/** Número de noches entre dos fechas (checkout - checkin). */
export function nightsBetween(checkIn: Date | string, checkOut: Date | string): number {
  const a = new Date(checkIn).getTime();
  const b = new Date(checkOut).getTime();
  return Math.max(0, Math.round((b - a) / 86_400_000));
}
