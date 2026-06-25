import { useEffect, useState } from "react";
import {
  getHotelBySlug,
  fileUrl,
  type DirectusHotel,
} from "@/lib/directus";

export interface HotelImages {
  heroImage: string | null;
  gallery: string[];
}

interface HotelState {
  hotel: DirectusHotel | null;
  images: HotelImages;
  loading: boolean;
  error: Error | null;
}

const EMPTY: HotelImages = { heroImage: null, gallery: [] };

export function useDirectusHotel(slug: string): HotelState {
  const [state, setState] = useState<HotelState>({
    hotel: null,
    images: EMPTY,
    loading: true,
    error: null,
  });
  useEffect(() => {
    let cancelled = false;
    getHotelBySlug(slug)
      .then((hotel) => {
        if (cancelled) return;
        if (!hotel) {
          setState({ hotel: null, images: EMPTY, loading: false, error: null });
          return;
        }
        const gallery = (hotel.gallery ?? [])
          .map((g) => fileUrl(g.directus_files_id))
          .filter((u): u is string => u !== null);
        setState({
          hotel,
          images: {
            heroImage: fileUrl(hotel.hero_image),
            gallery,
          },
          loading: false,
          error: null,
        });
      })
      .catch((err) => {
        if (cancelled) return;
        setState({ hotel: null, images: EMPTY, loading: false, error: err });
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);
  return state;
}
