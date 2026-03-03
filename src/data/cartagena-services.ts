export interface HotelService {
  id: string;
  name: string;
  description: string;
  icon: string;
  included: boolean;
}

export const includedServices: HotelService[] = [
  {
    id: "breakfast",
    name: "Desayuno Americano",
    description: "Servido a la mesa cada mañana",
    icon: "UtensilsCrossed",
    included: true,
  },
  {
    id: "wifi",
    name: "Wi-Fi Alta Velocidad",
    description: "Conexión gratuita en todo el hotel",
    icon: "Wifi",
    included: true,
  },
  {
    id: "tv",
    name: "TV Digital",
    description: "Televisores LED de 32 pulgadas",
    icon: "Tv",
    included: true,
  },
  {
    id: "calls",
    name: "Llamadas Locales",
    description: "Llamadas locales sin costo",
    icon: "Phone",
    included: true,
  },
];

export const additionalServices: HotelService[] = [
  {
    id: "reception",
    name: "Recepción 24 Horas",
    description: "Atención personalizada a cualquier hora",
    icon: "Clock",
    included: false,
  },
  {
    id: "transfer",
    name: "Traslado Aeropuerto",
    description: "Servicio de transporte (costo adicional)",
    icon: "Plane",
    included: false,
  },
  {
    id: "tourism",
    name: "Asesoría Turística",
    description: "Información y recomendaciones de la ciudad",
    icon: "Map",
    included: false,
  },
  {
    id: "laundry",
    name: "Lavandería",
    description: "Servicio de lavandería (costo adicional)",
    icon: "Shirt",
    included: false,
  },
];

export const roomAmenities = [
  { name: "Aire Acondicionado", icon: "Snowflake" },
  { name: "TV LED 32\"", icon: "Tv" },
  { name: "Wi-Fi", icon: "Wifi" },
  { name: "Caja Fuerte", icon: "Lock" },
  { name: "Minibar", icon: "Wine" },
  { name: "Baño Privado", icon: "Bath" },
  { name: "Teléfono", icon: "Phone" },
  { name: "Agua Caliente", icon: "Droplets" },
];
