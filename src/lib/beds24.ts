// Client for the Beds24 proxy (which lives at /api/booking/* on the same origin).
// The proxy hides the API token and auto-refreshes it.

const PROXY_BASE = "/api/booking";

export interface AvailabilityResponse {
  success: boolean;
  data: Array<{
    roomId: number;
    propertyId: number;
    name: string;
    availability: Record<string, number>; // date → units left (0 means sold out that night)
  }>;
}

export async function fetchAvailability(params: {
  propertyId: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
}): Promise<AvailabilityResponse> {
  const url = new URL(`${PROXY_BASE}/availability`, window.location.origin);
  url.searchParams.set("propertyId", params.propertyId);
  url.searchParams.set("roomId", params.roomId);
  url.searchParams.set("checkIn", params.checkIn);
  url.searchParams.set("checkOut", params.checkOut);
  const res = await fetch(url.toString());
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`beds24 proxy ${res.status}: ${body}`);
  }
  return res.json();
}

// Returns the smallest numAvail across nights in [checkIn, checkOut).
// null means we have no data for at least one night in the range.
export function minAvailInRange(
  resp: AvailabilityResponse,
  checkIn: string,
  checkOut: string
): number | null {
  const room = resp.data?.[0];
  if (!room) return null;
  let min = Infinity;
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  for (const d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
    const key = d.toISOString().slice(0, 10);
    const n = room.availability[key];
    if (n === undefined || n === null) return null;
    if (n < min) min = n;
  }
  return Number.isFinite(min) ? min : null;
}

export function isRangeAvailable(
  resp: AvailabilityResponse,
  checkIn: string,
  checkOut: string
): boolean {
  const m = minAvailInRange(resp, checkIn, checkOut);
  return m !== null && m > 0;
}

export function bookingDeepLink(params: {
  propertyId: string;
  roomId?: string;
  checkIn?: string;
  checkOut?: string;
  numAdult?: number;
  numChild?: number;
}): string {
  const url = new URL("https://beds24.com/booking2.php");
  url.searchParams.set("propid", params.propertyId);
  url.searchParams.set("lang", "es"); // forzar el checkout de Beds24 en español
  if (params.roomId) url.searchParams.set("roomid", params.roomId);
  if (params.checkIn) url.searchParams.set("checkin", params.checkIn);
  if (params.checkOut) url.searchParams.set("checkout", params.checkOut);
  if (params.numAdult) url.searchParams.set("numadult", String(params.numAdult));
  if (params.numChild) url.searchParams.set("numchild", String(params.numChild));
  // El motor de Beds24 oculta el botón "Reservar" hasta que el huésped elige la
  // cantidad en el selector "Seleccione la cantidad". Su JS lee el parámetro
  // sr1-<roomId> de la URL y, si es > 0, pre-selecciona 1 unidad y muestra el
  // botón automáticamente. Así el huésped no se queda trabado sin saber qué hacer.
  if (params.roomId) {
    url.searchParams.set(`sr1-${params.roomId}`, "1");
    if (params.numAdult)
      url.searchParams.set(`naa1-1-${params.roomId}`, String(params.numAdult));
  }
  return url.toString();
}
