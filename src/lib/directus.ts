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
  short_name: string;
  description: string;
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
  description: string | null;
  city: string;
  address: string | null;
  phone: string | null;
  email: string | null;
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
}

const FIELDS_ROOMS =
  "id,status,sort,slug,name,short_name,description,floor,bed_type,price_per_night,price_per_month,max_guests,quantity,highlights,amenities,variants,category,ambientes,hotel,beds24_room_id,images.id,images.directus_files_id,price_overrides.id,price_overrides.status,price_overrides.sort,price_overrides.label,price_overrides.start_date,price_overrides.end_date,price_overrides.price_per_night";

const FIELDS_HOTELS =
  "id,slug,name,tagline,description,city,address,phone,email,whatsapp_number,whatsapp_message,maps_url,maps_embed_url,hero_image,gallery.id,gallery.directus_files_id,beds24_property_id,is_closed,closed_message,reopen_date";

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

export async function getHotelBySlug(
  slug: string
): Promise<DirectusHotel | null> {
  const list = await directusFetch<DirectusHotel[]>(
    `/items/hotels?fields=${FIELDS_HOTELS}&filter[slug][_eq]=${encodeURIComponent(slug)}&limit=1`
  );
  return list[0] ?? null;
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
