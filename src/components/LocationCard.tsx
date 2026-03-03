import { MessageCircle, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/i18n/LanguageContext";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

interface LocationCardProps {
  city: string;
  image: string;
  description: string;
  whatsappNumber: string;
  reversed?: boolean;
  link?: string;
}

const LocationCard = ({
  city,
  image,
  description,
  whatsappNumber,
  reversed = false,
  link,
}: LocationCardProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.15 });

  const handleClick = () => {
    if (link) {
      navigate(link);
    } else {
      const message = encodeURIComponent(
        `Hola, me gustaría hacer una reserva en Santa Alejandría – ${city}`
      );
      window.open(`https://wa.me/${whatsappNumber}?text=${message}`, "_blank");
    }
  };

  return (
    <div
      ref={ref}
      className={`grid gap-8 lg:grid-cols-2 lg:gap-12 ${
        reversed ? "lg:[direction:rtl]" : ""
      }`}
    >
      {/* Image */}
      <div className="relative aspect-[2/1] lg:min-h-[300px] overflow-hidden lg:[direction:ltr] group">
        <img
          src={image}
          alt={`Santa Alejandría – ${city}`}
          className={`h-full w-full object-cover transition-all duration-1000 border-2 border-secondary ${
            isVisible ? "scale-100" : "scale-110"
          } group-hover:scale-105`}
        />
        <div className="absolute inset-0 bg-secondary/0 transition-colors duration-500 group-hover:bg-secondary/10" />
      </div>

      {/* Content */}
      <div className={`flex flex-col justify-center p-4 lg:[direction:ltr] ${reversed ? '' : 'lg:ml-12'}`}>
        <span className={`mb-3 font-sans text-xs font-medium uppercase tracking-[0.2em] text-accent transition-all duration-500 delay-100 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}>
          {t("locations", "sede")}
        </span>
        <h3 className={`mb-4 font-serif text-3xl font-medium text-foreground md:text-4xl transition-all duration-500 delay-200 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}>
          Santa Alejandría – {city}
        </h3>
        <div className={`mb-8 h-px bg-accent transition-all duration-700 delay-300 ${
          isVisible ? "w-16 opacity-100" : "w-0 opacity-0"
        }`} />
        <p className={`mb-8 max-w-md font-sans text-base font-light leading-relaxed text-muted-foreground transition-all duration-500 delay-[400ms] ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}>
          {description}
        </p>
        <button
          onClick={handleClick}
          className={`group/btn inline-flex w-fit items-center gap-3 border border-primary bg-transparent px-8 py-4 font-sans text-sm font-medium uppercase tracking-widest text-primary transition-all duration-300 hover:bg-primary hover:text-primary-foreground hover:shadow-lg delay-500 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          {link ? (
            <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover/btn:translate-x-1" />
          ) : (
            <MessageCircle className="h-5 w-5 transition-transform duration-300 group-hover/btn:scale-110" />
          )}
          <span>{link ? t("locations", "verSede") : t("locations", "reservarWhatsApp")}</span>
        </button>
      </div>
    </div>
  );
};

export default LocationCard;
