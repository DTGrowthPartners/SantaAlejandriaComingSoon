import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { cn } from "@/lib/utils";
import {
  UtensilsCrossed,
  Wifi,
  Tv,
  Phone,
  Clock,
  Plane,
  Map,
  Shirt,
  Snowflake,
  Lock,
  Wine,
  Bath,
  Droplets,
} from "lucide-react";
import { includedServices, additionalServices, roomAmenities } from "@/data/cartagena-services";

const iconComponents: Record<string, React.ElementType> = {
  UtensilsCrossed,
  Wifi,
  Tv,
  Phone,
  Clock,
  Plane,
  Map,
  Shirt,
  Snowflake,
  Lock,
  Wine,
  Bath,
  Droplets,
};

const CartagenaServices = () => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 });

  return (
    <section
      id="servicios"
      ref={ref}
      className="scroll-mt-20 bg-primary py-20 md:py-32"
    >
      <div className="container mx-auto px-6">
        {/* Section header */}
        <div
          className={cn(
            "mb-14 text-center transition-all duration-700 ease-out",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
        >
          <p className="mb-3 font-sans text-xs tracking-[0.25em] uppercase text-highlight font-medium">
            Comodidades
          </p>
          <h2 className="mb-4 font-serif text-3xl font-medium text-primary-foreground md:text-4xl">
            Servicios & Amenidades
          </h2>
          <div className="mx-auto h-px w-16 bg-highlight" />
        </div>

        {/* Included services label */}
        <p className="mb-6 text-center font-sans text-xs tracking-[0.2em] uppercase text-highlight/70">
          Incluidos en la tarifa
        </p>

        {/* Included services grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-12">
          {includedServices.map((service, i) => {
            const Icon = iconComponents[service.icon];
            return (
              <div
                key={service.id}
                className={cn(
                  "rounded-lg bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/15 p-6 text-center transition-all duration-500 hover:scale-[1.03] hover:bg-primary-foreground/15 hover:shadow-lg hover:shadow-highlight/5",
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8",
                )}
                style={{
                  transitionDelay: isVisible ? `${i * 100 + 200}ms` : "0ms",
                }}
              >
                {Icon && (
                  <Icon className="mx-auto mb-3 h-8 w-8 text-highlight" />
                )}
                <h3 className="font-serif text-lg font-medium text-primary-foreground">
                  {service.name}
                </h3>
                <p className="mt-1 font-sans text-sm text-primary-foreground/60">
                  {service.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Divider */}
        <div className="mx-auto mb-12 h-px w-32 bg-primary-foreground/15" />

        {/* Additional services label */}
        <p className="mb-6 text-center font-sans text-xs tracking-[0.2em] uppercase text-highlight/70">
          Servicios Adicionales
        </p>

        {/* Additional services */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-12">
          {additionalServices.map((service, i) => {
            const Icon = iconComponents[service.icon];
            return (
              <div
                key={service.id}
                className={cn(
                  "flex items-center gap-4 rounded-lg border border-primary-foreground/10 px-5 py-4 transition-all duration-500 hover:bg-primary-foreground/5",
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                )}
                style={{
                  transitionDelay: isVisible ? `${i * 100 + 500}ms` : "0ms",
                }}
              >
                {Icon && <Icon className="h-5 w-5 text-highlight shrink-0" />}
                <div>
                  <p className="font-sans text-sm font-medium text-primary-foreground">
                    {service.name}
                  </p>
                  <p className="font-sans text-xs text-primary-foreground/50">
                    {service.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Room amenities strip */}
        <div className="border-t border-primary-foreground/10 pt-8">
          <p className="mb-5 text-center font-sans text-xs tracking-[0.2em] uppercase text-highlight/70">
            En cada habitación
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            {roomAmenities.map((amenity) => {
              const Icon = iconComponents[amenity.icon];
              return (
                <div
                  key={amenity.name}
                  className="flex items-center gap-2 text-primary-foreground/70"
                >
                  {Icon && <Icon className="h-4 w-4 text-highlight/60" />}
                  <span className="font-sans text-xs">{amenity.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CartagenaServices;
