import { useState } from "react";
import { MessageCircle, Snowflake, Tv, Wifi, Lock, Wine, Bath, Phone, Droplets, Bed } from "lucide-react";
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
import RoomGalleryDialog from "./RoomGalleryDialog";

const iconMap: Record<string, React.ElementType> = {
  "Aire acondicionado": Snowflake,
  'TV LED 32"': Tv,
  "Wi-Fi alta velocidad": Wifi,
  "Caja de seguridad": Lock,
  Minibar: Wine,
  "Baño privado": Bath,
  Teléfono: Phone,
  "Ropa de cama premium": Bed,
};

function formatPrice(price: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

interface RoomCardProps {
  room: RoomType;
}

const RoomCard = ({ room }: RoomCardProps) => {
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const { t } = useTranslation();

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

  const roomName = t("roomNames", room.id);
  const whatsappMessage = encodeURIComponent(
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

          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-serif text-3xl font-medium text-accent">
              {formatPrice(room.pricePerNight)}
            </span>
            <span className="font-sans text-sm text-muted-foreground">{t("cartagenaRooms", "noche")}</span>
          </div>

          {/* Description */}
          <p className="mt-4 font-sans text-sm text-muted-foreground leading-relaxed">
            {t("roomDescriptions", room.id)}
          </p>

          {/* Highlights */}
          <div className="mt-4 flex flex-wrap gap-2">
            {room.highlights.map((h) => (
              <Badge
                key={h}
                variant="secondary"
                className="bg-primary/10 text-primary border-none font-sans text-xs"
              >
                {t("roomHighlights", h)}
              </Badge>
            ))}
          </div>

          {/* Room details */}
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-md bg-background p-3">
              <span className="text-muted-foreground">{t("cartagenaRooms", "piso")}</span>
              <p className="font-medium text-foreground">{t("roomFloors", room.floor)}</p>
            </div>
            <div className="rounded-md bg-background p-3">
              <span className="text-muted-foreground">{t("cartagenaRooms", "cama")}</span>
              <p className="font-medium text-foreground">{t("roomBedTypes", room.bedType)}</p>
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
              const Icon = iconMap[amenity];
              return (
                <div
                  key={amenity}
                  className="flex items-center gap-2 text-xs text-muted-foreground"
                >
                  {Icon && <Icon className="h-3.5 w-3.5 text-accent" />}
                  <span>{t("roomAmenities", amenity)}</span>
                </div>
              );
            })}
          </div>

          {/* CTA */}
          <a
            href={`https://wa.me/573126915453?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 font-sans text-sm font-medium text-white tracking-wide transition-all duration-300 hover:bg-accent/90 hover:scale-[1.02] hover:shadow-lg"
          >
            <MessageCircle className="h-4 w-4" />
            {t("cartagenaRooms", "reservarHabitacion")}
          </a>
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
