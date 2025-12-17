import LocationCard from "./LocationCard";
import cartagenaImage from "@/assets/centro-historico-cartagena.jpg";
import medellinImage from "@/assets/Medellin2.jpg";

const LocationsSection = () => {
  return (
    <section className="bg-card py-20 md:py-32">
      <div className="container">
        {/* Section Header */}
        <div className="mb-16 text-center md:mb-24">
          <span className="mb-4 inline-block font-sans text-xs font-medium uppercase tracking-[0.2em] text-accent">
            Experiencias únicas
          </span>
          <h2 className="font-serif text-3xl font-medium text-foreground md:text-4xl lg:text-5xl">
            Nuestras Sedes
          </h2>
        </div>

        {/* Location Cards */}
        <div className="space-y-20 md:space-y-32">
          <LocationCard
            city="Cartagena"
            image={cartagenaImage}
            description="Ubicados en el corazón histórico de la ciudad amurallada. Una experiencia única donde la historia colonial se encuentra con el lujo contemporáneo."
            whatsappNumber="573126915453"
          />

          <LocationCard
            city="Medellín"
            image={medellinImage}
            description="Una experiencia boutique en la ciudad de la eterna primavera. Rodeados de montañas y naturaleza, con la calidez característica de nuestra marca."
            whatsappNumber="573126915453"
            reversed
          />
        </div>
      </div>
    </section>
  );
};

export default LocationsSection;
