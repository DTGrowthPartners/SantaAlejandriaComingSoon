import { useTranslation } from "@/i18n/LanguageContext";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import LocationCard from "./LocationCard";
import cartagenaImage from "@/assets/centro-historico-cartagena.jpg";
import medellinImage from "@/assets/Medellin2.jpg";

const LocationsSection = () => {
  const { t } = useTranslation();
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation({ threshold: 0.2 });
  const { ref: card1Ref, isVisible: card1Visible } = useScrollAnimation({ threshold: 0.1 });
  const { ref: card2Ref, isVisible: card2Visible } = useScrollAnimation({ threshold: 0.1 });

  return (
    <section className="bg-card py-20 md:py-32">
      <div className="container">
        {/* Section Header */}
        <div
          ref={headerRef}
          className={`mb-16 text-center md:mb-24 transition-all duration-700 ease-out ${
            headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <span className="mb-4 inline-block font-sans text-xs font-medium uppercase tracking-[0.2em] text-accent">
            {t("locations", "experienciasUnicas")}
          </span>
          <h2 className="font-serif text-3xl font-medium text-foreground md:text-4xl lg:text-5xl">
            {t("locations", "nuestrasSedes")}
          </h2>
        </div>

        {/* Location Cards */}
        <div className="space-y-20 md:space-y-32">
          <div
            ref={card1Ref}
            className={`transition-all duration-700 ease-out ${
              card1Visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-12"
            }`}
          >
            <LocationCard
              city="Cartagena"
              image={cartagenaImage}
              description={t("locations", "cartagenaDesc")}
              whatsappNumber="573126915453"
              link="/cartagena"
            />
          </div>

          <div
            ref={card2Ref}
            className={`transition-all duration-700 ease-out delay-100 ${
              card2Visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12"
            }`}
          >
            <LocationCard
              city="Medellín"
              image={medellinImage}
              description={t("locations", "medellinDesc")}
              whatsappNumber="573126915453"
              reversed
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default LocationsSection;
