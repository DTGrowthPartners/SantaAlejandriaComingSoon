import { useEffect, useState } from "react";
import {
  getRoomsByHotelSlug,
  fileUrl,
  effectivePricePerNight,
  publishedPricePeriods,
  type DirectusRoom,
} from "@/lib/directus";
import {
  ROOM_AMENITIES,
  type RoomType,
} from "@/data/cartagena-rooms";
import {
  MEDELLIN_ROOM_AMENITIES_AA,
  type MedellinRoomCategory,
  type Apartaestudio,
} from "@/data/medellin-rooms";

function directusImages(room: DirectusRoom): string[] {
  return (room.images ?? [])
    .map((f) => fileUrl(f.directus_files_id))
    .filter((u): u is string => u !== null);
}

function toCartagenaRoom(r: DirectusRoom): RoomType {
  return {
    id: r.slug,
    name: r.name,
    shortName: r.short_name,
    description: r.description,
    floor: r.floor ?? "",
    bedType: r.bed_type ?? "",
    pricePerNight: effectivePricePerNight(r),
    // Precio base crudo (sin temporada de hoy) = fallback de cotización, alineado con el PMS.
    basePricePerNight: r.price_per_night ?? 0,
    pricePeriods: publishedPricePeriods(r).map((p) => ({
      label: p.label,
      startDate: p.start_date,
      endDate: p.end_date,
      price: p.price_per_night,
    })),
    maxGuests: r.max_guests ?? 0,
    quantity: r.quantity ?? 0,
    images: directusImages(r),
    amenities: r.amenities && r.amenities.length > 0 ? r.amenities : ROOM_AMENITIES,
    highlights: r.highlights ?? [],
    beds24RoomId: r.beds24_room_id ?? null,
  };
}

function toMedellinCategory(r: DirectusRoom): MedellinRoomCategory {
  const variants = (r.variants ?? []).map((v) => ({
    label: v.label,
    bedConfig: v.bed_config,
    cooling: v.cooling as "aa" | "ventilador",
    quantity: v.quantity,
    maxGuests: v.max_guests,
  }));
  return {
    id: r.slug,
    name: r.name,
    nameEn: r.name_en,
    shortName: r.short_name,
    shortNameEn: r.short_name_en,
    description: r.description,
    descriptionEn: r.description_en,
    pricePerNight: effectivePricePerNight(r) || null,
    variants,
    amenities:
      r.amenities && r.amenities.length > 0
        ? r.amenities
        : MEDELLIN_ROOM_AMENITIES_AA,
    highlights: r.highlights ?? [],
    highlightsEn: r.highlights_en,
    images: directusImages(r),
    beds24RoomId: r.beds24_room_id ?? null,
  };
}

function toApartaestudio(r: DirectusRoom): Apartaestudio {
  return {
    id: r.slug,
    name: r.name,
    nameEn: r.name_en,
    ambientes: r.ambientes ?? 1,
    quantity: r.quantity ?? null,
    pricePerDay: r.price_per_night ?? 0,
    pricePerMonth: r.price_per_month ?? 0,
    includes: (r.amenities ?? []).map((a) => a.label),
    images: directusImages(r),
  };
}

interface CartagenaState {
  rooms: RoomType[];
  loading: boolean;
  error: Error | null;
  beds24PropertyId: string | null;
  directBookingEnabled: boolean;
}

export function useCartagenaRooms(): CartagenaState {
  const [state, setState] = useState<CartagenaState>({
    rooms: [],
    loading: true,
    error: null,
    beds24PropertyId: null,
    directBookingEnabled: false,
  });
  useEffect(() => {
    let cancelled = false;
    getRoomsByHotelSlug("cartagena")
      .then((result) => {
        if (cancelled) return;
        if (!result) {
          setState({ rooms: [], loading: false, error: null, beds24PropertyId: null, directBookingEnabled: false });
          return;
        }
        const rooms = result.rooms
          .filter((r) => r.category === "room" || r.category === null)
          .map(toCartagenaRoom);
        setState({
          rooms,
          loading: false,
          error: null,
          beds24PropertyId: result.hotel.beds24_property_id ?? null,
          directBookingEnabled: result.hotel.direct_booking_enabled === true,
        });
      })
      .catch((err) => {
        if (cancelled) return;
        setState({ rooms: [], loading: false, error: err, beds24PropertyId: null, directBookingEnabled: false });
      });
    return () => {
      cancelled = true;
    };
  }, []);
  return state;
}

interface MedellinState {
  categories: MedellinRoomCategory[];
  apartaestudios: Apartaestudio[];
  loading: boolean;
  error: Error | null;
  beds24PropertyId: string | null;
}

export function useMedellinRooms(): MedellinState {
  const [state, setState] = useState<MedellinState>({
    categories: [],
    apartaestudios: [],
    loading: true,
    error: null,
    beds24PropertyId: null,
  });
  useEffect(() => {
    let cancelled = false;
    getRoomsByHotelSlug("medellin")
      .then((result) => {
        if (cancelled) return;
        if (!result) {
          setState({
            categories: [],
            apartaestudios: [],
            loading: false,
            error: null,
            beds24PropertyId: null,
          });
          return;
        }
        const categories: MedellinRoomCategory[] = [];
        const apartaestudios: Apartaestudio[] = [];
        for (const r of result.rooms) {
          if (r.category === "apartaestudio") {
            apartaestudios.push(toApartaestudio(r));
          } else {
            categories.push(toMedellinCategory(r));
          }
        }
        setState({
          categories,
          apartaestudios,
          loading: false,
          error: null,
          beds24PropertyId: result.hotel.beds24_property_id ?? null,
        });
      })
      .catch((err) => {
        if (cancelled) return;
        setState({
          categories: [],
          apartaestudios: [],
          loading: false,
          error: err,
          beds24PropertyId: null,
        });
      });
    return () => {
      cancelled = true;
    };
  }, []);
  return state;
}
