import type { Amenity } from "@/lib/directus";

export interface MedellinRoomCategory {
  id: string;
  name: string;
  nameEn?: string | null;
  shortName: string;
  shortNameEn?: string | null;
  description: string;
  descriptionEn?: string | null;
  pricePerNight?: number | null;
  variants: MedellinRoomVariant[];
  amenities: Amenity[];
  highlights: string[];
  highlightsEn?: string[] | null;
  beds24RoomId?: string | null;
  images: string[];
}

export interface MedellinRoomVariant {
  label: string;
  bedConfig: string;
  cooling: "aa" | "ventilador";
  quantity: number;
  maxGuests: number;
}

export const MEDELLIN_ROOM_AMENITIES_AA: Amenity[] = [
  { label: "Aire acondicionado", icon: "ac_unit" },
  { label: "TV", icon: "tv" },
  { label: "Wi-Fi", icon: "wifi" },
  { label: "Caja de seguridad", icon: "lock" },
  { label: "Baño privado", icon: "bathtub" },
  { label: "Ropa de cama premium", icon: "bed" },
];

export const MEDELLIN_ROOM_AMENITIES_FAN: Amenity[] = [
  { label: "Ventilador", icon: "mode_fan" },
  { label: "TV", icon: "tv" },
  { label: "Wi-Fi", icon: "wifi" },
  { label: "Caja de seguridad", icon: "lock" },
  { label: "Baño privado", icon: "bathtub" },
  { label: "Ropa de cama premium", icon: "bed" },
];

export const medellinRoomCategories: MedellinRoomCategory[] = [
  {
    id: "doble-sencilla",
    name: "Habitación Doble Sencilla",
    shortName: "Doble",
    description:
      "Cómoda habitación con cama doble, ideal para parejas o viajeros individuales que buscan descanso en el corazón del sector Estadio.",
    variants: [
      {
        label: "Con Aire Acondicionado",
        bedConfig: "1 Cama Doble",
        cooling: "aa",
        quantity: 15,
        maxGuests: 2,
      },
      {
        label: "Con Ventilador",
        bedConfig: "1 Cama Doble",
        cooling: "ventilador",
        quantity: 10,
        maxGuests: 2,
      },
    ],
    amenities: MEDELLIN_ROOM_AMENITIES_AA,
    highlights: ["25 habitaciones", "Opción AA o ventilador"],
    images: [],
  },
  {
    id: "twins",
    name: "Habitación Twins",
    shortName: "Twins",
    description:
      "Habitación con dos camas sencillas y aire acondicionado. Perfecta para amigos, colegas o viajeros que prefieren camas individuales.",
    variants: [
      {
        label: "Con Aire Acondicionado",
        bedConfig: "2 Camas Sencillas",
        cooling: "aa",
        quantity: 6,
        maxGuests: 2,
      },
    ],
    amenities: MEDELLIN_ROOM_AMENITIES_AA,
    highlights: ["6 habitaciones", "Aire acondicionado"],
    images: [],
  },
  {
    id: "triple",
    name: "Habitación Triple",
    shortName: "Triple",
    description:
      "Espaciosa habitación para tres personas. Disponible en diferentes configuraciones de camas para adaptarse a las necesidades de tu grupo o familia.",
    variants: [
      {
        label: "3 Camas Sencillas (AA)",
        bedConfig: "3 Camas Sencillas",
        cooling: "aa",
        quantity: 11,
        maxGuests: 3,
      },
      {
        label: "3 Camas Sencillas (Ventilador)",
        bedConfig: "3 Camas Sencillas",
        cooling: "ventilador",
        quantity: 6,
        maxGuests: 3,
      },
      {
        label: "1 Doble + 1 Sencilla (AA)",
        bedConfig: "1 Cama Doble + 1 Sencilla",
        cooling: "aa",
        quantity: 3,
        maxGuests: 3,
      },
      {
        label: "1 Doble + 1 Sencilla (Ventilador)",
        bedConfig: "1 Cama Doble + 1 Sencilla",
        cooling: "ventilador",
        quantity: 2,
        maxGuests: 3,
      },
    ],
    amenities: MEDELLIN_ROOM_AMENITIES_AA,
    highlights: ["22 habitaciones", "Ideal para familias", "Varias configuraciones"],
    images: [],
  },
  {
    id: "cuadruple",
    name: "Habitación Cuádruple",
    shortName: "Cuádruple",
    description:
      "Habitación amplia para grupos de hasta 4 personas. Múltiples configuraciones de camas disponibles con aire acondicionado o ventilador.",
    variants: [
      {
        label: "4 Camas Sencillas (AA)",
        bedConfig: "4 Camas Sencillas",
        cooling: "aa",
        quantity: 2,
        maxGuests: 4,
      },
      {
        label: "1 Doble + 2 Sencillas (AA)",
        bedConfig: "1 Cama Doble + 2 Sencillas",
        cooling: "aa",
        quantity: 3,
        maxGuests: 4,
      },
      {
        label: "1 Doble + 2 Sencillas (Ventilador)",
        bedConfig: "1 Cama Doble + 2 Sencillas",
        cooling: "ventilador",
        quantity: 3,
        maxGuests: 4,
      },
      {
        label: "4 Camas Sencillas (Ventilador)",
        bedConfig: "4 Camas Sencillas",
        cooling: "ventilador",
        quantity: 1,
        maxGuests: 4,
      },
    ],
    amenities: MEDELLIN_ROOM_AMENITIES_AA,
    highlights: ["9 habitaciones", "Ideal para grupos", "Varias configuraciones"],
    images: [],
  },
  {
    id: "camarote",
    name: "Habitación Camarote",
    shortName: "Camarote",
    description:
      "Habitación con literas ubicada en el primer piso, con capacidad para hasta 6 personas. Aire acondicionado incluido. Ideal para grupos grandes o equipos deportivos.",
    variants: [
      {
        label: "Camarotes (AA)",
        bedConfig: "Literas para 6 personas",
        cooling: "aa",
        quantity: 1,
        maxGuests: 6,
      },
    ],
    amenities: MEDELLIN_ROOM_AMENITIES_AA,
    highlights: ["Primer piso", "Hasta 6 personas", "Aire acondicionado"],
    images: [],
  },
  {
    id: "suite-junior",
    name: "Suite Junior",
    shortName: "Suite Junior",
    description:
      "Nuestra habitación más exclusiva. Amplia suite con cama King Size y aire acondicionado. El máximo confort para una experiencia premium en Medellín.",
    variants: [
      {
        label: "Suite Junior (AA)",
        bedConfig: "1 Cama King Size",
        cooling: "aa",
        quantity: 1,
        maxGuests: 2,
      },
    ],
    amenities: MEDELLIN_ROOM_AMENITIES_AA,
    highlights: ["Cama King", "Nuestra mejor habitación", "Aire acondicionado"],
    images: [],
  },
];

export interface Apartaestudio {
  id: string;
  name: string;
  nameEn?: string | null;
  ambientes: number;
  quantity: number | null;
  pricePerDay: number;
  pricePerMonth: number;
  includes: string[];
  images?: string[];
}

export const apartaestudios: Apartaestudio[] = [
  {
    id: "apto-1-ambiente",
    name: "Apartaestudio 1 Ambiente",
    ambientes: 1,
    quantity: null,
    pricePerDay: 210000,
    pricePerMonth: 2000000,
    includes: [
      "Cocina integral",
      "Cafetera",
      "Sanduchera",
      "TV",
      "Estación de TV",
      "Comedor",
      "Nevera minibar",
      "Sofá",
      "Microondas",
      "Vajilla",
      "Ventilador",
      "Closet",
    ],
  },
  {
    id: "apto-2-ambientes",
    name: "Apartaestudio 2 Ambientes",
    ambientes: 2,
    quantity: null,
    pricePerDay: 210000,
    pricePerMonth: 2000000,
    includes: [
      "Cocina integral",
      "Cafetera",
      "Sanduchera",
      "TV",
      "Estación de TV",
      "Comedor",
      "Nevera minibar",
      "Sofá",
      "Microondas",
      "Vajilla",
      "Ventilador",
      "Closet",
    ],
  },
  {
    id: "apto-3-ambientes",
    name: "Apartaestudio 3 Ambientes",
    ambientes: 3,
    quantity: 2,
    pricePerDay: 210000,
    pricePerMonth: 2000000,
    includes: [
      "Cocina integral",
      "Cafetera",
      "Sanduchera",
      "TV",
      "Estación de TV",
      "Comedor",
      "Nevera minibar",
      "Sofá",
      "Microondas",
      "Vajilla",
      "Ventilador",
      "Closet",
    ],
  },
];
