import { ImageIcon, ChevronLeft, ChevronRight, Snowflake, Fan } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import type { MedellinRoomCategory } from "@/data/medellin-rooms";
import { useTranslation } from "@/i18n/LanguageContext";
import MaterialIcon from "@/components/MaterialIcon";
import WhatsAppIcon from "@/components/icons/WhatsAppIcon";

const WHATSAPP_BASE = "https://wa.me/573053093723?text=";

interface MedellinRoomCardProps {
  category: MedellinRoomCategory;
}

const MedellinRoomCard = ({ category }: MedellinRoomCardProps) => {
  const { t } = useTranslation();
  const totalRooms = category.variants.reduce((sum, v) => sum + v.quantity, 0);
  const images = category.images ?? [];
  const [currentIdx, setCurrentIdx] = useState(0);

  const categoryName = category.name || t("medellinRoomNames", category.id);
  const categoryDescription =
    category.description || t("medellinRoomDescriptions", category.id);

  const whatsappMessage = encodeURIComponent(
    `Hola, me gustaría reservar una ${categoryName} en Santa Alejandría Hotel – Medellín`
  );

  const goPrev = () =>
    setCurrentIdx((i) => (i === 0 ? images.length - 1 : i - 1));
  const goNext = () =>
    setCurrentIdx((i) => (i === images.length - 1 ? 0 : i + 1));

  return (
    <div className="grid gap-6 lg:grid-cols-5 lg:gap-8">
      {/* Image carousel - 3/5 width */}
      <div className="lg:col-span-3">
        {images.length > 0 ? (
          <div className="group relative overflow-hidden rounded-xl aspect-[16/10] bg-muted">
            <img
              src={images[currentIdx]}
              alt={`${category.name} ${currentIdx + 1}`}
              className="h-full w-full object-cover transition-opacity duration-500"
              loading="lazy"
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={goPrev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 backdrop-blur text-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                  aria-label="Anterior"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={goNext}
                  className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 backdrop-blur text-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                  aria-label="Siguiente"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentIdx(i)}
                      className={`h-1.5 rounded-full transition-all ${
                        i === currentIdx ? "w-6 bg-white" : "w-1.5 bg-white/60"
                      }`}
                      aria-label={`Imagen ${i + 1}`}
                    />
                  ))}
                </div>
                <div className="absolute top-3 right-3 rounded-full bg-black/50 backdrop-blur px-3 py-1 text-xs font-medium text-white">
                  {currentIdx + 1} / {images.length}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-dashed border-primary/20 aspect-[16/10] flex items-center justify-center">
            <div className="text-center p-8">
              <ImageIcon className="mx-auto mb-4 h-16 w-16 text-primary/25" />
              <p className="font-sans text-sm text-primary/40 max-w-xs">
                {t("medellinRooms", "imagePlaceholder")}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Room info - 2/5 width */}
      <div className="lg:col-span-2 flex flex-col">
        {/* Name */}
        <h3 className="font-serif text-2xl font-medium text-foreground">
          {categoryName}
        </h3>

        {/* Total rooms */}
        <p className="mt-1 font-sans text-sm text-primary font-medium">
          {totalRooms} {t("medellinRooms", "habitacionesDisponibles")}
        </p>

        {/* Description */}
        <p className="mt-4 font-sans text-sm text-muted-foreground leading-relaxed">
          {categoryDescription}
        </p>

        {/* Highlights */}
        <div className="mt-4 flex flex-wrap gap-2">
          {category.highlights.map((h) => (
            <Badge
              key={h}
              variant="secondary"
              className="bg-primary/10 text-primary border-none font-sans text-xs"
            >
              {h}
            </Badge>
          ))}
        </div>

        {/* Variants table */}
        <div className="mt-5 space-y-2">
          <p className="font-sans text-xs text-muted-foreground uppercase tracking-wide mb-2">
            {t("medellinRooms", "configuraciones")}
          </p>
          {category.variants.map((variant, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-lg bg-background border border-border/50 px-4 py-3 text-sm"
            >
              <div>
                <p className="font-medium text-foreground text-sm">{variant.bedConfig}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  {variant.cooling === "aa" ? (
                    <span className="flex items-center gap-1 text-xs text-primary">
                      <Snowflake className="h-3 w-3" /> A/C
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-amber-600">
                      <Fan className="h-3 w-3" /> Ventilador
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">
                    · {variant.maxGuests} {t("medellinRooms", "personas")}
                  </span>
                </div>
              </div>
              <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">
                ×{variant.quantity} hab.
              </span>
            </div>
          ))}
        </div>

        {/* Amenities grid */}
        <div className="mt-5 grid grid-cols-2 gap-2">
          {category.amenities.map((amenity) => (
            <div
              key={amenity.label}
              className="flex items-center gap-2 text-xs text-muted-foreground"
            >
              {amenity.icon && (
                <MaterialIcon name={amenity.icon} className="text-primary text-[16px]" />
              )}
              <span>{amenity.label}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <a
          href={`${WHATSAPP_BASE}${whatsappMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-[#D9D9D9] px-6 py-3 font-sans text-sm font-medium text-foreground tracking-wide transition-all duration-300 hover:bg-[#C4C4C4] hover:scale-[1.02] hover:shadow-lg"
        >
          <WhatsAppIcon className="h-4 w-4" />
          {t("medellinRooms", "reservarHabitacion")}
        </a>
      </div>
    </div>
  );
};

export default MedellinRoomCard;
