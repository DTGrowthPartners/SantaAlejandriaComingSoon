import { useEffect, useState } from "react";
import {
  getServicesByHotelSlug,
  getGalleryByHotelSlug,
  getPricingByHotelSlug,
  fileUrl,
  type DirectusService,
} from "@/lib/directus";

interface ServicesState {
  services: DirectusService[];
  loading: boolean;
  error: Error | null;
}

/** Servicios de una sede desde Directus (incluidos + adicionales). */
export function useHotelServices(slug: string): ServicesState {
  const [state, setState] = useState<ServicesState>({
    services: [],
    loading: true,
    error: null,
  });
  useEffect(() => {
    let cancelled = false;
    getServicesByHotelSlug(slug)
      .then((services) => {
        if (cancelled) return;
        setState({ services: services ?? [], loading: false, error: null });
      })
      .catch((err) => {
        if (cancelled) return;
        setState({ services: [], loading: false, error: err });
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);
  return state;
}

interface PricingState {
  /** Montos por key (ej: additional_person, child_3_10). */
  amounts: Record<string, number>;
  loading: boolean;
}

/** Precios extra de una sede desde Directus (pricing_extras). */
export function useHotelPricing(slug: string): PricingState {
  const [state, setState] = useState<PricingState>({ amounts: {}, loading: true });
  useEffect(() => {
    let cancelled = false;
    getPricingByHotelSlug(slug)
      .then((rows) => {
        if (cancelled) return;
        const amounts: Record<string, number> = {};
        for (const r of rows ?? []) {
          if (r.amount != null) amounts[r.key] = r.amount;
        }
        setState({ amounts, loading: false });
      })
      .catch(() => {
        if (cancelled) return;
        setState({ amounts: {}, loading: false });
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);
  return state;
}

export type GalleryByCategory = Record<string, string[]>;

interface GalleryState {
  byCategory: GalleryByCategory;
  loading: boolean;
  error: Error | null;
}

/** Galería de instalaciones/exteriores de una sede, agrupada por categoría. */
export function useHotelGallery(slug: string): GalleryState {
  const [state, setState] = useState<GalleryState>({
    byCategory: {},
    loading: true,
    error: null,
  });
  useEffect(() => {
    let cancelled = false;
    getGalleryByHotelSlug(slug)
      .then((items) => {
        if (cancelled) return;
        const byCategory: GalleryByCategory = {};
        for (const it of items ?? []) {
          const url = fileUrl(it.image);
          if (!url) continue;
          (byCategory[it.category] ??= []).push(url);
        }
        setState({ byCategory, loading: false, error: null });
      })
      .catch((err) => {
        if (cancelled) return;
        setState({ byCategory: {}, loading: false, error: err });
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);
  return state;
}
