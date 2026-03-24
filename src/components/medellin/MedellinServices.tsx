import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { cn } from "@/lib/utils";
import {
  UtensilsCrossed,
  Wifi,
  Lock,
  Sparkles,
  Shirt,
  Wine,
  Zap,
  Clock,
  BookOpen,
  PartyPopper,
  Dumbbell,
  Leaf,
} from "lucide-react";
import {
  medellinIncludedServices,
  medellinAdditionalServices,
  medellinAmenities,
} from "@/data/medellin-services";
import { useTranslation } from "@/i18n/LanguageContext";

const iconComponents: Record<string, React.ElementType> = {
  UtensilsCrossed,
  Wifi,
  Lock,
  Sparkles,
  Shirt,
  Wine,
  Zap,
  Clock,
  BookOpen,
  PartyPopper,
  Dumbbell,
  Leaf,
};

const MedellinServices = () => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 });
  const { t } = useTranslation();

  return (
    <section
      id="servicios"
      ref={ref}
      className="scroll-mt-20 bg-[#1a3c2a] py-20 md:py-32"
    >
      <div className="container mx-auto px-6">
        {/* Section header */}
        <div
          className={cn(
            "mb-14 text-center transition-all duration-700 ease-out",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
        >
          <p className="mb-3 font-sans text-xs tracking-[0.25em] uppercase text-[#8FBF6B] font-medium">
            {t("medellinServices", "label")}
          </p>
          <h2 className="mb-4 font-serif text-3xl font-medium text-white md:text-4xl">
            {t("medellinServices", "heading")}
          </h2>
          <div className="mx-auto h-px w-16 bg-[#8FBF6B]" />
        </div>

        {/* Included services label */}
        <p className="mb-6 text-center font-sans text-xs tracking-[0.2em] uppercase text-[#8FBF6B]/70">
          {t("medellinServices", "includedLabel")}
        </p>

        {/* Included services grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-12">
          {medellinIncludedServices.map((service, i) => {
            const Icon = iconComponents[service.icon];
            return (
              <div
                key={service.id}
                className={cn(
                  "rounded-lg bg-white/10 backdrop-blur-sm border border-white/15 p-6 text-center transition-all duration-500 hover:scale-[1.03] hover:bg-white/15 hover:shadow-lg hover:shadow-[#8FBF6B]/5",
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                )}
                style={{
                  transitionDelay: isVisible ? `${i * 100 + 200}ms` : "0ms",
                }}
              >
                {Icon && <Icon className="mx-auto mb-3 h-8 w-8 text-[#8FBF6B]" />}
                <h3 className="font-serif text-lg font-medium text-white">
                  {t("medellinServiceNames", service.name)}
                </h3>
                <p className="mt-1 font-sans text-sm text-white/60">
                  {t("medellinServiceDescriptions", service.description)}
                </p>
              </div>
            );
          })}
        </div>

        {/* Divider */}
        <div className="mx-auto mb-12 h-px w-32 bg-white/15" />

        {/* Amenities/Facilities - unique layout for Medellín */}
        <p className="mb-6 text-center font-sans text-xs tracking-[0.2em] uppercase text-[#8FBF6B]/70">
          {t("medellinServices", "facilitiesLabel")}
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-12">
          {medellinAmenities.map((amenity, i) => {
            const Icon = iconComponents[amenity.icon];
            return (
              <div
                key={amenity.name}
                className={cn(
                  "flex flex-col items-center gap-3 rounded-lg border border-white/10 p-6 text-center transition-all duration-500 hover:bg-white/5",
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                )}
                style={{
                  transitionDelay: isVisible ? `${i * 100 + 400}ms` : "0ms",
                }}
              >
                {Icon && <Icon className="h-7 w-7 text-[#8FBF6B]" />}
                <div>
                  <p className="font-sans text-sm font-medium text-white">
                    {t("medellinAmenityNames", amenity.name)}
                  </p>
                  <p className="font-sans text-xs text-white/50">
                    {amenity.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Divider */}
        <div className="mx-auto mb-12 h-px w-32 bg-white/15" />

        {/* Additional services */}
        <p className="mb-6 text-center font-sans text-xs tracking-[0.2em] uppercase text-[#8FBF6B]/70">
          {t("medellinServices", "additionalLabel")}
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {medellinAdditionalServices.map((service, i) => {
            const Icon = iconComponents[service.icon];
            return (
              <div
                key={service.id}
                className={cn(
                  "flex items-center gap-4 rounded-lg border border-white/10 px-5 py-4 transition-all duration-500 hover:bg-white/5",
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                )}
                style={{
                  transitionDelay: isVisible ? `${i * 100 + 600}ms` : "0ms",
                }}
              >
                {Icon && <Icon className="h-5 w-5 text-[#8FBF6B] shrink-0" />}
                <div>
                  <p className="font-sans text-sm font-medium text-white">
                    {t("medellinServiceNames", service.name)}
                  </p>
                  <p className="font-sans text-xs text-white/50">
                    {t("medellinServiceDescriptions", service.description)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default MedellinServices;
