import { useEffect, useState } from "react";
import {
  getRoomsByHotelSlug,
  fileUrl,
  effectivePricePerNight,
  type DirectusRoom,
} from "@/lib/directus";
import {
  ROOM_AMENITIES,
  type RoomType,
} from "@/data/cartagena-rooms";
import {
  MEDELLIN_ROOM_AMENITIES_AA,
  type MedellinRoomCategory,
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
    shortName: r.short_name,
    description: r.description,
    variants,
    amenities:
      r.amenities && r.amenities.length > 0
        ? r.amenities
        : MEDELLIN_ROOM_AMENITIES_AA,
    highlights: r.highlights ?? [],
    images: directusImages(r),
    beds24RoomId: r.beds24_room_id ?? null,
  };
}

interface CartagenaState {
  rooms: RoomType[];
  loading: boolean;
  error: Error | null;
  beds24PropertyId: string | null;
}

export function useCartagenaRooms(): CartagenaState {
  const [state, setState] = useState<CartagenaState>({
    rooms: [],
    loading: true,
    error: null,
    beds24PropertyId: null,
  });
  useEffect(() => {
    let cancelled = false;
    getRoomsByHotelSlug("cartagena")
      .then((result) => {
        if (cancelled) return;
        if (!result) {
          setState({ rooms: [], loading: false, error: null, beds24PropertyId: null });
          return;
        }
        const rooms = result.rooms
          .filter((r) => r.category === "room" || r.category === null)
          .map(toCartagenaRoom);
        setState({ rooms, loading: false, error: null, beds24PropertyId: result.hotel.beds24_property_id ?? null });
      })
      .catch((err) => {
        if (cancelled) return;
        setState({ rooms: [], loading: false, error: err, beds24PropertyId: null });
      });
    return () => {
      cancelled = true;
    };
  }, []);
  return state;
}

interface MedellinState {
  categories: MedellinRoomCategory[];
  apartaestudios: MedellinRoomCategory[];
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
        const apartaestudios: MedellinRoomCategory[] = [];
        for (const r of result.rooms) {
          const mapped = toMedellinCategory(r);
          if (r.category === "apartaestudio") {
            apartaestudios.push(mapped);
          } else {
            categories.push(mapped);
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
