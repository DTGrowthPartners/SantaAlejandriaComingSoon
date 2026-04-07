import { MessageCircle, ChevronDown } from "lucide-react";
import { useScrollProgress } from "@/hooks/useScrollProgress";
import { useTranslation } from "@/i18n/LanguageContext";
import medellinImg from "@/assets/ciudad-edificios-hotel-nutibara-medellin-colombia.webp";
import logo from "@/assets/logo-santa-alejandria.png";

const WHATSAPP_URL =
  "https://wa.me/573053093723?text=Hola%2C%20me%20gustar%C3%ADa%20hacer%20una%20reserva%20en%20Santa%20Alejandr%C3%ADa%20Hotel%20%E2%80%93%20Medell%C3%ADn";

const MedellinHero = () => {
  const { scrollY } = useScrollProgress();
  const { t } = useTranslation();

  return (
    <section id="inicio" className="relative min-h-screen w-full overflow-hidden">
      {/* Parallax Background */}
      <div
        className="absolute inset-0 will-change-transform"
        style={{ transform: `translateY(${scrollY * 0.3}px)` }}
      >
        <img
          src={medellinImg}
          alt="Medellín - Ciudad de la Eterna Primavera"
          className="h-[130%] w-full object-cover"
        />
      </div>

      {/* Green-tinted gradient overlay - different from Cartagena's darker tone */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/70 via-primary/40 to-primary/80" />

      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center">
        {/* Logo */}
        <div className="mb-4 animate-fade-in">
          <img
            src={logo}
            alt="Santa Alejandría Hotel"
            className="h-24 w-auto drop-shadow-lg md:h-36 lg:h-44"
          />
        </div>

        {/* Decorative leaf-inspired line */}
        <div className="mb-6 flex items-center gap-3 animate-fade-in-delay">
          <span className="h-px w-8 bg-highlight" />
          <span className="h-2 w-2 rounded-full bg-highlight" />
          <span className="h-px w-8 bg-highlight" />
        </div>

        {/* Label */}
        <p className="mb-3 font-sans text-xs tracking-[0.3em] uppercase text-highlight animate-fade-in-delay">
          {t("medellinHero", "eternaPrimavera")}
        </p>

        {/* Main heading */}
        <h1 className="mb-3 font-serif text-5xl font-medium text-background md:text-7xl lg:text-8xl animate-fade-in-delay">
          Hotel Santa Alejandría
        </h1>

        {/* Subtitle */}
        <p className="mb-6 font-serif text-xl italic text-background/85 md:text-2xl animate-fade-in-delay-2">
          Medellín
        </p>

        {/* Decorative dots */}
        <div className="mb-6 flex items-center gap-2 animate-fade-in-delay-2">
          <span className="h-1 w-1 rounded-full bg-highlight" />
          <span className="h-1.5 w-1.5 rounded-full bg-highlight" />
          <span className="h-1 w-1 rounded-full bg-highlight" />
        </div>

        {/* Tagline */}
        <p className="mb-10 max-w-lg font-sans text-sm tracking-wide text-background/70 animate-fade-in-delay-2 leading-relaxed">
          {t("medellinHero", "tagline")}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col gap-4 sm:flex-row animate-fade-in-delay-3">
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-[#D9D9D9] px-8 py-3.5 font-sans text-sm font-medium text-foreground tracking-wide uppercase transition-all duration-300 hover:bg-[#C4C4C4] hover:scale-105 hover:shadow-lg"
          >
            <MessageCircle className="h-4 w-4" />
            {t("medellinHero", "reservar")}
          </a>
          <a
            href="#habitaciones"
            className="inline-flex items-center gap-2 rounded-full border border-background/40 px-8 py-3.5 font-sans text-sm font-medium text-background tracking-wide uppercase transition-all duration-300 hover:bg-background/10 hover:border-background/60"
          >
            {t("medellinHero", "explorar")}
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce z-10">
        <ChevronDown className="h-6 w-6 text-highlight/70" />
      </div>
    </section>
  );
};

export default MedellinHero;
