const DIRECTUS_URL =
  import.meta.env.VITE_DIRECTUS_URL ?? "https://cms.santalejandriahotels.com";

export interface Amenity {
  label: string;
  icon: string;
}

export interface DirectusPriceOverride {
  id: string;
  status: string;
  sort: number | null;
  label: string;
  start_date: string;
  end_date: string;
  price_per_night: number;
}

export interface DirectusRoom {
  id: string;
  status: string;
  sort: number | null;
  slug: string;
  name: string;
  name_en: string | null;
  short_name: string;
  short_name_en: string | null;
  description: string;
  description_en: string | null;
  highlights_en: string[] | null;
  floor: string | null;
  bed_type: string | null;
  price_per_night: number | null;
  price_per_month: number | null;
  max_guests: number | null;
  quantity: number | null;
  highlights: string[] | null;
  amenities: Amenity[] | null;
  variants: Array<{
    label: string;
    bed_config: string;
    cooling: string;
    quantity: number;
    max_guests: number;
  }> | null;
  category: string | null;
  ambientes: number | null;
  hotel: string;
  beds24_room_id: string | null;
  images: Array<{ id: number; directus_files_id: string }>;
  price_overrides: DirectusPriceOverride[] | null;
}

export interface DirectusHotel {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  tagline_en: string | null;
  description: string | null;
  description_en: string | null;
  city: string;
  address: string | null;
  address_line2: string | null;
  phone: string | null;
  phone_tel: string | null;
  phone_landline: string | null;
  phone_landline_tel: string | null;
  email: string | null;
  reservation_email: string | null;
  instagram_url: string | null;
  whatsapp_number: string | null;
  whatsapp_message: string | null;
  maps_url: string | null;
  maps_embed_url: string | null;
  hero_image: string | null;
  gallery: Array<{ id: number; directus_files_id: string }> | null;
  beds24_property_id: string | null;
  is_closed: boolean | null;
  closed_message: string | null;
  reopen_date: string | null;
  // Datos del About
  checkin_time: string | null;
  checkout_time: string | null;
  stats: Array<{ value: string; icon: string; label_es: string; label_en: string }> | null;
  nearby_places: Array<{ name: string; name_en: string | null; time: string; icon: string }> | null;
  // Textos de secciones (bilingües)
  hero_tagline_es: string | null;
  hero_tagline_en: string | null;
  about_heading_es: string | null;
  about_heading_en: string | null;
  about_p1_es: string | null;
  about_p1_en: string | null;
  about_p2_es: string | null;
  about_p2_en: string | null;
  cta_subtitle_es: string | null;
  cta_subtitle_en: string | null;
}

const FIELDS_ROOMS =
  "id,status,sort,slug,name,name_en,short_name,short_name_en,description,description_en,floor,bed_type,price_per_night,price_per_month,max_guests,quantity,highlights,highlights_en,amenities,variants,category,ambientes,hotel,beds24_room_id,images.id,images.directus_files_id,price_overrides.id,price_overrides.status,price_overrides.sort,price_overrides.label,price_overrides.start_date,price_overrides.end_date,price_overrides.price_per_night";

const FIELDS_HOTELS =
  "id,slug,name,tagline,tagline_en,description,description_en,city,address,address_line2,phone,phone_tel,phone_landline,phone_landline_tel,email,reservation_email,instagram_url,whatsapp_number,whatsapp_message,maps_url,maps_embed_url,hero_image,gallery.id,gallery.directus_files_id,beds24_property_id,is_closed,closed_message,reopen_date,checkin_time,checkout_time,stats,nearby_places,hero_tagline_es,hero_tagline_en,about_heading_es,about_heading_en,about_p1_es,about_p1_en,about_p2_es,about_p2_en,cta_subtitle_es,cta_subtitle_en";

// ---- Servicios ----
export interface DirectusService {
  id: string;
  slug: string | null;
  name: string;
  name_en: string | null;
  description: string | null;
  description_en: string | null;
  icon: string | null;
  included: boolean;
  kind: string | null;
  sort: number | null;
}

const FIELDS_SERVICES = "id,slug,name,name_en,description,description_en,icon,included,kind,sort";

// ---- Galería de instalaciones (exteriores) ----
export interface DirectusGalleryItem {
  id: string;
  category: string;
  caption: string | null;
  image: string | null;
  sort: number | null;
}

const FIELDS_GALLERY = "id,category,caption,image,sort";

/** Devuelve el valor en el idioma pedido, con fallback a español si el EN está vacío. */
export function pickLang(
  es: string | null | undefined,
  en: string | null | undefined,
  lang: string
): string {
  if (lang === "en" && en) return en;
  return es ?? "";
}

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function activePriceOverride(
  overrides: DirectusPriceOverride[] | null | undefined,
  today: string = todayIsoDate()
): DirectusPriceOverride | null {
  if (!overrides || overrides.length === 0) return null;
  const active = overrides.filter(
    (o) =>
      o.status === "published" &&
      o.start_date <= today &&
      o.end_date >= today
  );
  if (active.length === 0) return null;
  active.sort(
    (a, b) =>
      (a.sort ?? Number.MAX_SAFE_INTEGER) -
      (b.sort ?? Number.MAX_SAFE_INTEGER)
  );
  return active[0];
}

export function effectivePricePerNight(room: DirectusRoom): number {
  const override = activePriceOverride(room.price_overrides);
  if (override) return override.price_per_night;
  return room.price_per_night ?? 0;
}

/**
 * Devuelve los periodos de precio publicados (temporadas) ordenados por
 * fecha de inicio. Cada entrada de `room_price_overrides` representa un rango
 * de fechas con su tarifa; se usan para mostrar "Precio del X al Y: $monto".
 * Si la habitación no tiene periodos definidos, devuelve [] y la UI cae al
 * precio base (`price_per_night`).
 */
export function publishedPricePeriods(
  room: DirectusRoom
): DirectusPriceOverride[] {
  const periods = (room.price_overrides ?? []).filter(
    (o) => o.status === "published"
  );
  periods.sort((a, b) => {
    if (a.start_date !== b.start_date) {
      return a.start_date < b.start_date ? -1 : 1;
    }
    return (
      (a.sort ?? Number.MAX_SAFE_INTEGER) -
      (b.sort ?? Number.MAX_SAFE_INTEGER)
    );
  });
  return periods;
}

export function fileUrl(id: string | null | undefined): string | null {
  if (!id) return null;
  return `${DIRECTUS_URL}/assets/${id}`;
}

async function directusFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${DIRECTUS_URL}${path}`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`Directus ${res.status}: ${path}`);
  }
  const body = await res.json();
  return body.data as T;
}

// Cache de promesas por slug: varios componentes (banner, botones de WhatsApp…)
// piden el mismo hotel y así se hace una sola petición de red por carga.
const _hotelCache = new Map<string, Promise<DirectusHotel | null>>();

export function getHotelBySlug(slug: string): Promise<DirectusHotel | null> {
  let p = _hotelCache.get(slug);
  if (!p) {
    p = directusFetch<DirectusHotel[]>(
      `/items/hotels?fields=${FIELDS_HOTELS}&filter[slug][_eq]=${encodeURIComponent(slug)}&limit=1`
    )
      .then((list) => list[0] ?? null)
      .catch((err) => {
        _hotelCache.delete(slug); // permitir reintento si falló
        throw err;
      });
    _hotelCache.set(slug, p);
  }
  return p;
}

export async function getRoomsByHotel(
  hotelId: string
): Promise<DirectusRoom[]> {
  return directusFetch<DirectusRoom[]>(
    `/items/rooms?fields=${FIELDS_ROOMS}&filter[hotel][_eq]=${hotelId}&filter[status][_eq]=published&sort=sort`
  );
}

export async function getRoomsByHotelSlug(
  hotelSlug: string
): Promise<{ hotel: DirectusHotel; rooms: DirectusRoom[] } | null> {
  const hotel = await getHotelBySlug(hotelSlug);
  if (!hotel) return null;
  const rooms = await getRoomsByHotel(hotel.id);
  return { hotel, rooms };
}

export async function getServicesByHotelSlug(
  hotelSlug: string
): Promise<DirectusService[]> {
  return directusFetch<DirectusService[]>(
    `/items/services?fields=${FIELDS_SERVICES}&filter[hotel][slug][_eq]=${encodeURIComponent(hotelSlug)}&filter[status][_eq]=published&sort=sort&limit=-1`
  );
}

export async function getGalleryByHotelSlug(
  hotelSlug: string
): Promise<DirectusGalleryItem[]> {
  return directusFetch<DirectusGalleryItem[]>(
    `/items/hotel_gallery?fields=${FIELDS_GALLERY}&filter[hotel][slug][_eq]=${encodeURIComponent(hotelSlug)}&filter[status][_eq]=published&sort=sort&limit=-1`
  );
}

// ---- Precios extra (persona adicional, niño, notas) ----
export interface DirectusPricingExtra {
  key: string;
  label: string | null;
  amount: number | null;
  note: string | null;
}

export async function getPricingByHotelSlug(
  hotelSlug: string
): Promise<DirectusPricingExtra[]> {
  return directusFetch<DirectusPricingExtra[]>(
    `/items/pricing_extras?fields=key,label,amount,note,sort&filter[hotel][slug][_eq]=${encodeURIComponent(hotelSlug)}&sort=sort&limit=-1`
  );
}
