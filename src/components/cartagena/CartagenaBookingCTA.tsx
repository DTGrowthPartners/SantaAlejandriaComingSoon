import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { cn } from "@/lib/utils";
import { MessageCircle, Phone } from "lucide-react";
import { useTranslation } from "@/i18n/LanguageContext";
import kingRoomImg from "@/assets/cartagena/king-room-1.jpg";

const WHATSAPP_URL =
  "https://wa.me/573126915453?text=Hola%2C%20me%20gustar%C3%ADa%20hacer%20una%20reserva%20en%20Santa%20Alejandr%C3%ADa%20Hotel%20%E2%80%93%20Cartagena";

const CartagenaBookingCTA = () => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.15 });
  const { t } = useTranslation();

  return (
    <section ref={ref} className="relative min-h-[60vh] flex items-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={kingRoomImg}
          alt="Habitación King - Santa Alejandría"
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/70 to-primary/90" />

      {/* Content */}
      <div
        className={cn(
          "relative z-10 w-full py-20 text-center transition-all duration-700 ease-out",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        )}
      >
        <div className="container mx-auto px-6">
          {/* Decorative dots */}
          <div className="mb-6 flex items-center justify-center gap-2">
            <span className="h-1 w-1 rounded-full bg-highlight" />
            <span className="h-1.5 w-1.5 rounded-full bg-highlight" />
            <span className="h-1 w-1 rounded-full bg-highlight" />
          </div>

          <h2 className="mb-4 font-serif text-3xl font-medium text-[#FDFCF6] md:text-5xl leading-tight">
            {t("cartagenaBookingCTA", "heading1")}<br />
            <span className="text-highlight">{t("cartagenaBookingCTA", "heading2")}</span>
          </h2>

          <p className="mb-8 mx-auto max-w-lg font-sans text-sm text-[#FDFCF6]/70 leading-relaxed">
            {t("cartagenaBookingCTA", "subtitle")}
          </p>

          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-accent px-10 py-4 font-sans text-base font-medium text-white tracking-wide uppercase transition-all duration-300 hover:bg-accent/90 hover:scale-105 hover:shadow-xl"
          >
            <MessageCircle className="h-5 w-5" />
            {t("cartagenaBookingCTA", "reservar")}
          </a>

          <div className="mt-6 flex items-center justify-center gap-2 text-[#FDFCF6]/50">
            <Phone className="h-4 w-4" />
            <a
              href="tel:+573126915453"
              className="font-sans text-sm hover:text-[#FDFCF6]/80 transition-colors"
            >
              +57 312 6915453
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CartagenaBookingCTA;
