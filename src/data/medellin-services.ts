export interface MedellinService {
  id: string;
  name: string;
  description: string;
  icon: string;
  included: boolean;
}

export const medellinIncludedServices: MedellinService[] = [
  {
    id: "breakfast",
    name: "Desayuno Americano",
    description: "Servido de 7:00 AM a 9:30 AM",
    icon: "UtensilsCrossed",
    included: true,
  },
  {
    id: "wifi",
    name: "Wi-Fi en cada piso",
    description: "Conexión gratuita en todo el hotel",
    icon: "Wifi",
    included: true,
  },
  {
    id: "safe",
    name: "Caja de seguridad",
    description: "Disponible en cada habitación",
    icon: "Lock",
    included: true,
  },
  {
    id: "cleaning",
    name: "Limpieza diaria",
    description: "De 9:00 AM a 2:00 PM, cambio de lencería cada 2 días",
    icon: "Sparkles",
    included: true,
  },
];

export const medellinAdditionalServices: MedellinService[] = [
  {
    id: "laundry",
    name: "Lavandería",
    description: "Servicio de lavandería (costo adicional)",
    icon: "Shirt",
    included: false,
  },
  {
    id: "minibar",
    name: "Minibar en recepción",
    description: "Snacks y bebidas disponibles",
    icon: "Wine",
    included: false,
  },
  {
    id: "iron",
    name: "Plancha y secador",
    description: "Disponibles bajo solicitud",
    icon: "Zap",
    included: false,
  },
  {
    id: "reception",
    name: "Recepción 24/7",
    description: "Atención personalizada a cualquier hora",
    icon: "Clock",
    included: false,
  },
];

export const medellinAmenities = [
  { name: "Terraza de lectura", icon: "BookOpen", description: "En cada piso" },
  { name: "Terraza de fiestas", icon: "PartyPopper", description: "3er piso" },
  { name: "Gimnasio", icon: "Dumbbell", description: "8:00 AM a 8:00 PM" },
  { name: "Zona libre de humo", icon: "Leaf", description: "Espacios saludables" },
];
