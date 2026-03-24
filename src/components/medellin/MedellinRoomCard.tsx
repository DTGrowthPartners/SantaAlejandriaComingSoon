import { MessageCircle, Snowflake, Fan, Tv, Wifi, Lock, Bath, Bed, ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { MedellinRoomCategory } from "@/data/medellin-rooms";
import { useTranslation } from "@/i18n/LanguageContext";

const WHATSAPP_BASE = "https://wa.me/573053093723?text=";

const iconMap: Record<string, React.ElementType> = {
  "Aire acondicionado": Snowflake,
  "Ventilador": Fan,
  "TV": Tv,
  "Wi-Fi": Wifi,
  "Caja de seguridad": Lock,
  "Baño privado": Bath,
  "Ropa de cama premium": Bed,
};

interface MedellinRoomCardProps {
  category: MedellinRoomCategory;
}

const MedellinRoomCard = ({ category }: MedellinRoomCardProps) => {
  const { t } = useTranslation();
  const totalRooms = category.variants.reduce((sum, v) => sum + v.quantity, 0);

  const whatsappMessage = encodeURIComponent(
    `Hola, me gustaría reservar una ${category.name} en Santa Alejandría Hotel – Medellín`
  );

  return (
    <div className="grid gap-6 lg:grid-cols-5 lg:gap-8">
      {/* Image placeholder - 3/5 width */}
      <div className="lg:col-span-3">
        <div className="overflow-hidden rounded-xl bg-gradient-to-br from-[#2d7a4a]/10 to-[#2d7a4a]/5 border-2 border-dashed border-[#2d7a4a]/20 aspect-[16/10] flex items-center justify-center">
          <div className="text-center p-8">
            <ImageIcon className="mx-auto mb-4 h-16 w-16 text-[#2d7a4a]/25" />
            <p className="font-sans text-sm text-[#2d7a4a]/40 max-w-xs">
              {t("medellinRooms", "imagePlaceholder")}
            </p>
          </div>
        </div>
      </div>

      {/* Room info - 2/5 width */}
      <div className="lg:col-span-2 flex flex-col">
        {/* Name */}
        <h3 className="font-serif text-2xl font-medium text-foreground">
          {t("medellinRoomNames", category.id)}
        </h3>

        {/* Total rooms */}
        <p className="mt-1 font-sans text-sm text-[#2d7a4a] font-medium">
          {totalRooms} {t("medellinRooms", "habitacionesDisponibles")}
        </p>

        {/* Description */}
        <p className="mt-4 font-sans text-sm text-muted-foreground leading-relaxed">
          {t("medellinRoomDescriptions", category.id)}
        </p>

        {/* Highlights */}
        <div className="mt-4 flex flex-wrap gap-2">
          {category.highlights.map((h) => (
            <Badge
              key={h}
              variant="secondary"
              className="bg-[#2d7a4a]/10 text-[#2d7a4a] border-none font-sans text-xs"
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
                    <span className="flex items-center gap-1 text-xs text-[#2d7a4a]">
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
          {category.amenities.map((amenity) => {
            const Icon = iconMap[amenity];
            return (
              <div
                key={amenity}
                className="flex items-center gap-2 text-xs text-muted-foreground"
              >
                {Icon && <Icon className="h-3.5 w-3.5 text-[#2d7a4a]" />}
                <span>{amenity}</span>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <a
          href={`${WHATSAPP_BASE}${whatsappMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3 font-sans text-sm font-medium text-white tracking-wide transition-all duration-300 hover:bg-[#20BD5A] hover:scale-[1.02] hover:shadow-lg"
        >
          <MessageCircle className="h-4 w-4" />
          {t("medellinRooms", "reservarHabitacion")}
        </a>
      </div>
    </div>
  );
};

export default MedellinRoomCard;
