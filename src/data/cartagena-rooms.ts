import type { Amenity } from "@/lib/directus";

export interface PricePeriod {
  label: string;
  startDate: string; // ISO YYYY-MM-DD
  endDate: string; // ISO YYYY-MM-DD
  price: number;
}

export interface RoomType {
  id: string;
  name: string;
  shortName: string;
  description: string;
  floor: string;
  bedType: string;
  pricePerNight: number;
  /** Periodos de precio por temporada (vacío = usar solo pricePerNight). */
  pricePeriods: PricePeriod[];
  maxGuests: number;
  quantity: number;
  images: string[];
  amenities: Amenity[];
  highlights: string[];
  beds24RoomId?: string | null;
}

export const ROOM_AMENITIES: Amenity[] = [
  { label: "Aire acondicionado", icon: "ac_unit" },
  { label: 'TV LED 32"', icon: "tv" },
  { label: "Wi-Fi alta velocidad", icon: "wifi" },
  { label: "Caja de seguridad", icon: "lock" },
  { label: "Minibar", icon: "local_bar" },
  { label: "Baño privado", icon: "bathtub" },
  { label: "Teléfono", icon: "call" },
  { label: "Ropa de cama premium", icon: "bed" },
];

export const ADDITIONAL_PRICING = {
  additionalPerson: 100000,
  children3to10: 90000,
  note: "Todas las tarifas son por 1 noche de alojamiento con desayuno incluido, para 1 o 2 personas.",
};
