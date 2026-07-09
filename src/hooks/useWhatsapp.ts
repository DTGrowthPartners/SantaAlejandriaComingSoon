import { useDirectusHotel } from "./useDirectusHotel";

// Números de respaldo por sede (si el CMS está vacío o no responde).
const FALLBACK_NUMBER: Record<string, string> = {
  cartagena: "573126915453",
  medellin: "573053093723",
};

export interface HotelWhatsapp {
  /** Número en formato internacional sin "+" (ej: 573053093723). */
  number: string;
  /** Construye la URL wa.me con el mensaje dado. */
  waUrl: (text: string) => string;
  /** href para llamada telefónica (tel:+…). */
  telHref: string;
}

/**
 * Número de WhatsApp/teléfono de una sede, leído del CMS (hotels.whatsapp_number)
 * con respaldo local. Editable desde Directus sin tocar el código.
 */
export function useWhatsapp(slug: string): HotelWhatsapp {
  const { hotel } = useDirectusHotel(slug);
  const number = hotel?.whatsapp_number || FALLBACK_NUMBER[slug] || "";
  const waUrl = (text: string) =>
    `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
  return { number, waUrl, telHref: `tel:+${number}` };
}
