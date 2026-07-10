import { useState } from "react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import type { RoomType } from "@/data/cartagena-rooms";
import { useTranslation } from "@/i18n/LanguageContext";
import MaterialIcon from "@/components/MaterialIcon";
import RoomGalleryDialog from "./RoomGalleryDialog";
import DirectBookingWidget from "@/components/booking/DirectBookingWidget";
import WhatsAppIcon from "@/components/icons/WhatsAppIcon";
import { useWhatsapp } from "@/hooks/useWhatsapp";

function formatPrice(price: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

/** Formatea una fecha ISO (YYYY-MM-DD) como "07 de Julio" / "July 07" sin corrimiento de zona horaria. */
function formatDayMonth(iso: string, lang: string) {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1));
  const locale = lang === "en" ? "en-US" : "es-CO";
  const day = new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    timeZone: "UTC",
  }).format(date);
  let month = new Intl.DateTimeFormat(locale, {
    month: "long",
    timeZone: "UTC",
  }).format(date);
  month = month.charAt(0).toUpperCase() + month.slice(1);
  return lang === "en" ? `${month} ${day}` : `${day} de ${month}`;
}

interface RoomCardProps {
  room: RoomType;
  beds24PropertyId: string | null;
}

const RoomCard = ({ room }: RoomCardProps) => {
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const { t, lang } = useTranslation();
  const { waUrl } = useWhatsapp("cartagena");

  const handleApiChange = (carouselApi: CarouselApi) => {
    setApi(carouselApi);
    if (carouselApi) {
      carouselApi.on("select", () => {
        setCurrent(carouselApi.selectedScrollSnap());
      });
    }
  };

  const openGallery = (index: number) => {
    setGalleryIndex(index);
    setGalleryOpen(true);
  };

  const roomName = room.name || t("roomNames", room.id);
  const roomDescription = room.description || t("roomDescriptions", room.id);
  const whatsappHref = waUrl(
    `Hola, me gustaría reservar la ${roomName} en Santa Alejandría Hotel – Cartagena`
  );

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-5 lg:gap-8">
        {/* Image carousel - 3/5 width */}
        <div className="lg:col-span-3">
          <Carousel
            opts={{ loop: true }}
            setApi={handleApiChange}
            className="w-full"
          >
            <CarouselContent>
              {room.images.map((img, i) => (
                <CarouselItem key={i}>
                  <div
                    className="cursor-pointer overflow-hidden rounded-lg"
                    onClick={() => openGallery(i)}
                  >
                    <img
                      src={img}
                      alt={`${roomName} - ${t("gallery", "foto")} ${i + 1}`}
                      className="aspect-[16/10] w-full object-cover transition-transform duration-500 hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-3 bg-primary/80 hover:bg-primary border-none text-white h-9 w-9" />
            <CarouselNext className="right-3 bg-primary/80 hover:bg-primary border-none text-white h-9 w-9" />
          </Carousel>

          {/* Dots indicator */}
          <div className="mt-3 flex justify-center gap-1.5">
            {room.images.map((_, i) => (
              <button
                key={i}
                onClick={() => api?.scrollTo(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === current
                    ? "w-6 bg-accent"
                    : "w-1.5 bg-border hover:bg-muted-foreground"
                }`}
                aria-label={`${t("cartagenaRooms", "irAFoto")} ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Room info - 2/5 width */}
        <div className="lg:col-span-2 flex flex-col">
          {/* Name & price */}
          <h3 className="font-serif text-2xl font-medium text-foreground">
            {roomName}
          </h3>

          {room.pricePeriods.length > 0 ? (
            <div className="mt-2 space-y-3">
              {room.pricePeriods.map((p, i) => (
                <div key={i}>
                  {p.label && p.label.trim() && (
                    <p className="font-sans text-xs font-semibold uppercase tracking-wide text-primary">
                      {p.label}
                    </p>
                  )}
                  <p className="font-sans text-xs tracking-wide text-muted-foreground">
                    {lang === "en" ? "from" : "de"} {formatDayMonth(p.startDate, lang)} - {formatDayMonth(p.endDate, lang)}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="font-serif text-2xl font-medium text-accent">
                      {formatPrice(p.price)}
                    </span>
                    <span className="font-sans text-sm text-muted-foreground">
                      {t("cartagenaRooms", "noche")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-serif text-3xl font-medium text-accent">
                {formatPrice(room.pricePerNight)}
              </span>
              <span className="font-sans text-sm text-muted-foreground">{t("cartagenaRooms", "noche")}</span>
            </div>
          )}

          {/* Description */}
          <p className="mt-4 font-sans text-sm text-muted-foreground leading-relaxed">
            {roomDescription}
          </p>

          {/* Highlights */}
          <div className="mt-4 flex flex-wrap gap-2">
            {room.highlights.map((h) => {
              const translated = t("roomHighlights", h);
              return (
                <Badge
                  key={h}
                  variant="secondary"
                  className="bg-primary/10 text-primary border-none font-sans text-xs"
                >
                  {translated === h ? h : translated}
                </Badge>
              );
            })}
          </div>

          {/* Room details */}
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-md bg-background p-3">
              <span className="text-muted-foreground">{t("cartagenaRooms", "piso")}</span>
              <p className="font-medium text-foreground">
                {(() => {
                  const tr = t("roomFloors", room.floor);
                  return tr === room.floor ? room.floor : tr;
                })()}
              </p>
            </div>
            <div className="rounded-md bg-background p-3">
              <span className="text-muted-foreground">{t("cartagenaRooms", "cama")}</span>
              <p className="font-medium text-foreground">
                {(() => {
                  const tr = t("roomBedTypes", room.bedType);
                  return tr === room.bedType ? room.bedType : tr;
                })()}
              </p>
            </div>
            <div className="rounded-md bg-background p-3">
              <span className="text-muted-foreground">{t("cartagenaRooms", "capacidad")}</span>
              <p className="font-medium text-foreground">{room.maxGuests} {t("cartagenaRooms", "personas")}</p>
            </div>
            <div className="rounded-md bg-background p-3">
              <span className="text-muted-foreground">{t("cartagenaRooms", "disponibles")}</span>
              <p className="font-medium text-foreground">{room.quantity} {t("cartagenaRooms", "hab")}</p>
            </div>
          </div>

          {/* Amenities grid */}
          <div className="mt-4 grid grid-cols-2 gap-2">
            {room.amenities.map((amenity) => {
              const translated = t("roomAmenities", amenity.label);
              return (
                <div
                  key={amenity.label}
                  className="flex items-center gap-2 text-xs text-muted-foreground"
                >
                  {amenity.icon && (
                    <MaterialIcon name={amenity.icon} className="text-accent text-[16px]" />
                  )}
                  <span>{translated === amenity.label ? amenity.label : translated}</span>
                </div>
              );
            })}
          </div>

          {/* CTA */}
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 font-sans text-sm font-medium text-white tracking-wide transition-all duration-300 hover:bg-accent/90 hover:scale-[1.02] hover:shadow-lg"
          >
            <WhatsAppIcon className="h-4 w-4" />
            {t("cartagenaRooms", "reservarHabitacion")}
          </a>

          {/* Reserva directa por web OCULTA temporalmente (cambiar `false` por `true`
              para reactivarla). El código y la API del PMS siguen intactos. */}
          {false && <DirectBookingWidget room={room} />}
        </div>
      </div>

      <RoomGalleryDialog
        images={room.images}
        roomName={roomName}
        open={galleryOpen}
        onOpenChange={setGalleryOpen}
        startIndex={galleryIndex}
      />
    </>
  );
};

export default RoomCard;
