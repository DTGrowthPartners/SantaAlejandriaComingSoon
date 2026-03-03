import { useTranslation } from "@/i18n/LanguageContext";
import LocationCard from "./LocationCard";
import cartagenaImage from "@/assets/centro-historico-cartagena.jpg";
import medellinImage from "@/assets/Medellin2.jpg";

const LocationsSection = () => {
  const { t } = useTranslation();

  return (
    <section className="bg-card py-20 md:py-32">
      <div className="container">
        {/* Section Header */}
        <div className="mb-16 text-center md:mb-24">
          <span className="mb-4 inline-block font-sans text-xs font-medium uppercase tracking-[0.2em] text-accent">
            {t("locations", "experienciasUnicas")}
          </span>
          <h2 className="font-serif text-3xl font-medium text-foreground md:text-4xl lg:text-5xl">
            {t("locations", "nuestrasSedes")}
          </h2>
        </div>

        {/* Location Cards */}
        <div className="space-y-20 md:space-y-32">
          <LocationCard
            city="Cartagena"
            image={cartagenaImage}
            description={t("locations", "cartagenaDesc")}
            whatsappNumber="573126915453"
            link="/cartagena"
          />

          <LocationCard
            city="Medellín"
            image={medellinImage}
            description={t("locations", "medellinDesc")}
            whatsappNumber="573126915453"
            reversed
          />
        </div>
      </div>
    </section>
  );
};

export default LocationsSection;
