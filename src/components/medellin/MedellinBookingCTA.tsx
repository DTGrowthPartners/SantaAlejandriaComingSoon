import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { cn } from "@/lib/utils";
import { Phone } from "lucide-react";
import { useTranslation } from "@/i18n/LanguageContext";
import medellinImg from "@/assets/ciudad-edificios-hotel-nutibara-medellin-colombia.webp";
import WhatsAppIcon from "@/components/icons/WhatsAppIcon";
import { useWhatsapp } from "@/hooks/useWhatsapp";
import { useDirectusHotel } from "@/hooks/useDirectusHotel";
import { pickLang } from "@/lib/directus";

const MedellinBookingCTA = () => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.15 });
  const { t, lang } = useTranslation();
  const { waUrl } = useWhatsapp("medellin");
  const { hotel } = useDirectusHotel("medellin");
  const phoneDisplay = hotel?.phone || "305 309 3723";
  const phoneTel = hotel?.phone_tel || "573053093723";
  const landlineDisplay = hotel?.phone_landline || "(604) 324 6004";
  const landlineTel = hotel?.phone_landline_tel || "576043246004";

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
            {pickLang(hotel?.cta_subtitle_es, hotel?.cta_subtitle_en, lang) ||
              t("medellinBookingCTA", "subtitle")}
          </p>

          <a
            href={waUrl("Hola, me gustaría hacer una reserva en Santa Alejandría Hotel – Medellín")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-[#D9D9D9] px-10 py-4 font-sans text-base font-medium text-foreground tracking-wide uppercase transition-all duration-300 hover:bg-[#C4C4C4] hover:scale-105 hover:shadow-xl"
          >
            <WhatsAppIcon className="h-5 w-5" />
            {t("medellinBookingCTA", "reservar")}
          </a>

          <div className="mt-6 flex items-center justify-center gap-4 text-background/50">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <a
                href={`tel:+${phoneTel}`}
                className="font-sans text-sm hover:text-background/80 transition-colors"
              >
                {phoneDisplay}
              </a>
            </div>
            <span className="text-background/30">|</span>
            <a
              href={`tel:+${landlineTel}`}
              className="font-sans text-sm hover:text-background/80 transition-colors"
            >
              {landlineDisplay}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MedellinBookingCTA;
