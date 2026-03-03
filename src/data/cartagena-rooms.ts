import doble1erPiso1 from "@/assets/cartagena/doble-1er-piso-1.jpg";
import doble1erPiso2 from "@/assets/cartagena/doble-1er-piso-2.jpg";
import doble1erPiso3 from "@/assets/cartagena/doble-1er-piso-3.jpg";
import doble1erPiso4 from "@/assets/cartagena/doble-1er-piso-4.jpg";

import familiar1 from "@/assets/cartagena/familiar-1er-piso-1.jpg";
import familiar2 from "@/assets/cartagena/familiar-1er-piso-2.jpg";
import familiar3 from "@/assets/cartagena/familiar-1er-piso-3.jpg";
import familiar4 from "@/assets/cartagena/familiar-1er-piso-4.jpg";
import familiar5 from "@/assets/cartagena/familiar-1er-piso-5.jpg";

import dobleEstandar1 from "@/assets/cartagena/doble-estandar-1.jpg";
import dobleEstandar2 from "@/assets/cartagena/doble-estandar-2.jpg";
import dobleStandar3 from "@/assets/cartagena/doble-standar-3.jpg";
import dobleStandar4 from "@/assets/cartagena/doble-standar-4.jpg";

import twinsRoom1 from "@/assets/cartagena/twins-room-1.jpg";
import twinsRoom2 from "@/assets/cartagena/twins-room-2.jpg";
import twins1 from "@/assets/cartagena/twins-1.jpg";
import twins2 from "@/assets/cartagena/twins-2.jpg";
import twins3 from "@/assets/cartagena/twins-3.jpg";

import kingRoom1 from "@/assets/cartagena/king-room-1.jpg";
import kingRoom2 from "@/assets/cartagena/king-room-2.jpg";
import kingRoom3 from "@/assets/cartagena/king-room-3.jpg";
import kingRoom4 from "@/assets/cartagena/king-room-4.jpg";
import kingRoom5 from "@/assets/cartagena/king-room-5.jpg";
import kingRoom6 from "@/assets/cartagena/king-room-6.jpg";

import kingSuperior1 from "@/assets/cartagena/king-superior-1.jpg";
import kingSuperior2 from "@/assets/cartagena/king-superior-2.jpg";
import kingSuperior3 from "@/assets/cartagena/king-superior-3.jpg";
import kingSuperior4 from "@/assets/cartagena/king-superior-4.jpg";
import kingSuperior5 from "@/assets/cartagena/king-superior-5.jpg";
import kingSuperior6 from "@/assets/cartagena/king-superior-6.jpg";

export interface RoomType {
  id: string;
  name: string;
  shortName: string;
  description: string;
  floor: string;
  bedType: string;
  pricePerNight: number;
  maxGuests: number;
  quantity: number;
  images: string[];
  amenities: string[];
  highlights: string[];
}

export const ROOM_AMENITIES = [
  "Aire acondicionado",
  "TV LED 32\"",
  "Wi-Fi alta velocidad",
  "Caja de seguridad",
  "Minibar",
  "Baño privado",
  "Teléfono",
  "Ropa de cama premium",
];

export const rooms: RoomType[] = [
  {
    id: "doble-economica",
    name: "Habitación Doble Económica",
    shortName: "Doble Económica",
    description:
      "Acogedora habitación con cama doble en el primer piso. Perfecta para quienes buscan confort a un precio accesible, conservando los detalles coloniales que caracterizan nuestro hotel.",
    floor: "1er Piso",
    bedType: "Cama Doble",
    pricePerNight: 200000,
    maxGuests: 2,
    quantity: 2,
    images: [doble1erPiso1, doble1erPiso2, doble1erPiso3, doble1erPiso4],
    amenities: ROOM_AMENITIES,
    highlights: ["Primer piso", "Tarifa más accesible"],
  },
  {
    id: "familiar",
    name: "Habitación Familiar",
    shortName: "Familiar",
    description:
      "Espaciosa habitación con cama doble y cama sencilla, ideal para familias. Ubicada en el primer piso para mayor comodidad de acceso.",
    floor: "1er Piso",
    bedType: "Cama Doble + Cama Sencilla",
    pricePerNight: 230000,
    maxGuests: 3,
    quantity: 1,
    images: [familiar1, familiar2, familiar3, familiar4, familiar5],
    amenities: ROOM_AMENITIES,
    highlights: ["Primer piso", "Ideal para familias", "2 camas"],
  },
  {
    id: "doble-estandar",
    name: "Habitación Doble Estándar",
    shortName: "Doble Estándar",
    description:
      "Habitación con cama doble en el segundo piso, con grandes ventanas con barrotes coloniales que dejan entrar la luz y la brisa caribeña. Un equilibrio perfecto entre comodidad y encanto histórico.",
    floor: "2do Piso",
    bedType: "Cama Doble",
    pricePerNight: 230000,
    maxGuests: 2,
    quantity: 4,
    images: [dobleEstandar1, dobleEstandar2, dobleStandar3, dobleStandar4],
    amenities: ROOM_AMENITIES,
    highlights: ["Segundo piso", "Ventanas coloniales", "Nuestra más popular"],
  },
  {
    id: "twins",
    name: "Habitación Estándar Twins",
    shortName: "Twins",
    description:
      "Habitación con dos camas sencillas en el segundo piso. Perfecta para amigos o colegas que viajan juntos y prefieren camas individuales.",
    floor: "2do Piso",
    bedType: "2 Camas Sencillas",
    pricePerNight: 260000,
    maxGuests: 2,
    quantity: 2,
    images: [twinsRoom1, twinsRoom2, twins1, twins2, twins3],
    amenities: ROOM_AMENITIES,
    highlights: ["Segundo piso", "2 camas individuales"],
  },
  {
    id: "king",
    name: "Habitación King",
    shortName: "King",
    description:
      "Amplia habitación con cama King Size en el segundo piso. El máximo confort con espacio generoso, detalles coloniales y todas las comodidades modernas.",
    floor: "2do Piso",
    bedType: "Cama King Size",
    pricePerNight: 260000,
    maxGuests: 2,
    quantity: 4,
    images: [kingRoom1, kingRoom2, kingRoom3, kingRoom4, kingRoom5, kingRoom6],
    amenities: ROOM_AMENITIES,
    highlights: ["Segundo piso", "Cama King Size", "Más espacio"],
  },
  {
    id: "king-superior",
    name: "Habitación King Superior",
    shortName: "King Superior",
    description:
      "Nuestra habitación más exclusiva. Ubicada en el tercer piso con vistas privilegiadas, cama King Size y cama sencilla auxiliar. La experiencia más completa de Santa Alejandría.",
    floor: "3er Piso",
    bedType: "Cama King Size + Cama Auxiliar",
    pricePerNight: 280000,
    maxGuests: 3,
    quantity: 1,
    images: [
      kingSuperior1,
      kingSuperior2,
      kingSuperior3,
      kingSuperior4,
      kingSuperior5,
      kingSuperior6,
    ],
    amenities: ROOM_AMENITIES,
    highlights: [
      "Tercer piso",
      "Nuestra mejor habitación",
      "Cama auxiliar incluida",
    ],
  },
];

export const ADDITIONAL_PRICING = {
  additionalPerson: 100000,
  children3to10: 90000,
  note: "Todas las tarifas son por 1 noche de alojamiento con desayuno incluido, para 1 o 2 personas.",
};
