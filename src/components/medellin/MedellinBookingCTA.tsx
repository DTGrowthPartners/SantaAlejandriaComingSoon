import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { cn } from "@/lib/utils";
import { MessageCircle, Phone } from "lucide-react";
import { useTranslation } from "@/i18n/LanguageContext";
import medellinImg from "@/assets/ciudad-edificios-hotel-nutibara-medellin-colombia.jpeg";

const WHATSAPP_URL =
  "https://wa.me/573053093723?text=Hola%2C%20me%20gustar%C3%ADa%20hacer%20una%20reserva%20en%20Santa%20Alejandr%C3%ADa%20Hotel%20%E2%80%93%20Medell%C3%ADn";

const MedellinBookingCTA = () => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.15 });
  const { t } = useTranslation();

  return (
    <section ref={ref} className="relative min-h-[60vh] flex items-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={medellinImg}
          alt="Medellín - Ciudad de la Eterna Primavera"
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>

      {/* Green overlay - different from Cartagena */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/70 to-primary/90" />

      {/* Content */}
      <div
        className={cn(
          "relative z-10 w-full py-20 text-center transition-all duration-700 ease-out",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        )}
      >
        <div className="container mx-auto px-6">
          {/* Decorative element */}
          <div className="mb-6 flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-highlight" />
            <span className="h-2 w-2 rounded-full bg-highlight" />
            <span className="h-px w-8 bg-highlight" />
          </div>

          <h2 className="mb-4 font-serif text-3xl font-medium text-background md:text-5xl leading-tight">
            {t("medellinBookingCTA", "heading1")}<br />
            <span className="text-highlight">{t("medellinBookingCTA", "heading2")}</span>
          </h2>

          <p className="mb-8 mx-auto max-w-lg font-sans text-sm text-background/70 leading-relaxed">
            {t("medellinBookingCTA", "subtitle")}
          </p>

          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-[#D9D9D9] px-10 py-4 font-sans text-base font-medium text-foreground tracking-wide uppercase transition-all duration-300 hover:bg-[#C4C4C4] hover:scale-105 hover:shadow-xl"
          >
            <MessageCircle className="h-5 w-5" />
            {t("medellinBookingCTA", "reservar")}
          </a>

          <div className="mt-6 flex items-center justify-center gap-4 text-background/50">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <a
                href="tel:+573053093723"
                className="font-sans text-sm hover:text-background/80 transition-colors"
              >
                305 309 3723
              </a>
            </div>
            <span className="text-background/30">|</span>
            <a
              href="tel:+576043246004"
              className="font-sans text-sm hover:text-background/80 transition-colors"
            >
              (604) 324 6004
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MedellinBookingCTA;
