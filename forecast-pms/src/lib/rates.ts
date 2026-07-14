import "server-only";

/**
 * Tarifas publicadas en Directus (la misma fuente de precios de la web) para
 * alinear la línea de precios web ↔ Directus ↔ PMS. Cada tipo de habitación
 * trae su precio base ("normal") y sus precios por temporada (price_overrides),
 * junto con las habitaciones físicas del PMS a las que aplica (pms_rooms).
 */

const DIRECTUS_URL = process.env.DIRECTUS_URL ?? "https://cms.santalejandriahotels.com";
const HOTEL_SLUG = process.env.PUBLIC_BOOKING_HOTEL_SLUG ?? "cartagena";

export type RoomRateSeason = {
  label: string;
  pricePerNight: number;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
};

export type RoomTypeRate = {
  slug: string;
  typeName: string;
  /** Números de habitación del PMS a los que aplica esta tarifa (de `pms_rooms`). */
  pmsRooms: string[];
  /** Precio "normal" por noche (price_per_night de Directus). */
  basePrice: number;
  /** Precios por temporada publicados. */
  seasons: RoomRateSeason[];
};

type DirectusRoomRow = {
  slug: string;
  name: string;
  price_per_night: number | null;
  pms_rooms: string | null;
  price_overrides:
    | Array<{
        label: string;
        status: string;
        start_date: string;
        end_date: string;
        price_per_night: number;
      }>
    | null;
};

const FIELDS = [
  "slug",
  "name",
  "price_per_night",
  "pms_rooms",
  "price_overrides.label",
  "price_overrides.status",
  "price_overrides.start_date",
  "price_overrides.end_date",
  "price_overrides.price_per_night",
].join(",");

/**
 * Trae de Directus todas las tarifas publicadas del hotel. Se cachean 60s para
 * que un cambio de precio en Directus se refleje casi de inmediato en el PMS.
 * Nunca lanza: si Directus falla, devuelve [] y el formulario cae a "valor
 * escrito a mano".
 */
export async function getDirectusRates(): Promise<RoomTypeRate[]> {
  const url =
    `${DIRECTUS_URL}/items/rooms?fields=${FIELDS}` +
    `&filter[status][_eq]=published` +
    `&filter[hotel][slug][_eq]=${encodeURIComponent(HOTEL_SLUG)}` +
    `&limit=-1`;

  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: 60 },
    });
    if (!res.ok) throw new Error(`Directus ${res.status}`);
    const body = (await res.json()) as { data: DirectusRoomRow[] };

    return body.data.map((r) => ({
      slug: r.slug,
      typeName: r.name,
      pmsRooms: (r.pms_rooms ?? "")
        .split(/[\s,;]+/)
        .map((s) => s.trim())
        .filter(Boolean),
      basePrice: r.price_per_night ?? 0,
      seasons: (r.price_overrides ?? [])
        .filter((o) => o.status === "published")
        .map((o) => ({
          label: o.label,
          pricePerNight: o.price_per_night,
          startDate: o.start_date,
          endDate: o.end_date,
        })),
    }));
  } catch (e) {
    console.error("[rates] no se pudieron cargar las tarifas de Directus:", e);
    return [];
  }
}
