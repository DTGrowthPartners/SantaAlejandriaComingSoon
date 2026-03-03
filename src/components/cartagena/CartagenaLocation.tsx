import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { cn } from "@/lib/utils";
import { MapPin, Phone, Clock, Mail, Instagram, MessageCircle } from "lucide-react";
import { useEffect } from "react";

const WHATSAPP_URL =
  "https://wa.me/573126915453?text=Hola%2C%20me%20gustar%C3%ADa%20hacer%20una%20reserva%20en%20Santa%20Alejandr%C3%ADa%20Hotel%20%E2%80%93%20Cartagena";

const MAP_EMBED_URL =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3923.9487923431166!2d-75.5467512!3d10.425638399999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8ef6256ffa796155%3A0x10db7b27a315cbd3!2sHotel%20Santa%20Alejandr%C3%ADa!5e0!3m2!1ses-419!2sco!4v1772551734782!5m2!1ses-419!2sco";

const contactInfo = [
  {
    icon: MapPin,
    label: "Dirección",
    value: "Calle de la Cruz N° 9-42, Barrio San Diego",
    sublabel: "Centro Histórico, Cartagena, Colombia 13001",
  },
  {
    icon: Phone,
    label: "Teléfono",
    value: "+57 312 6915453",
    href: "tel:+573126915453",
  },
  {
    icon: Mail,
    label: "Email",
    value: "reservatiosantaalejandria@gmail.com",
    href: "mailto:reservatiosantaalejandria@gmail.com",
  },
  {
    icon: Clock,
    label: "Horario",
    value: "Servicio 24 horas",
  },
];

const CartagenaLocation = () => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 });

  // Load Elfsight script for Google Reviews
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://elfsightcdn.com/platform.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <section
      id="ubicacion"
      ref={ref}
      className="scroll-mt-20 bg-card py-20 md:py-32"
    >
      <div className="container mx-auto px-6">
        {/* Section header */}
        <div
          className={cn(
            "mb-14 text-center transition-all duration-700 ease-out",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
        >
          <p className="mb-3 font-sans text-xs tracking-[0.25em] uppercase text-accent font-medium">
            Cómo Llegar
          </p>
          <h2 className="mb-4 font-serif text-3xl font-medium text-foreground md:text-4xl">
            Encuéntranos
          </h2>
          <div className="mx-auto h-px w-16 bg-accent" />
        </div>

        {/* Two columns: Contact info + Map */}
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
          {/* Contact info */}
          <div
            className={cn(
              "transition-all duration-700 ease-out delay-200",
              isVisible
                ? "opacity-100 translate-x-0"
                : "opacity-0 -translate-x-10"
            )}
          >
            <div className="space-y-6">
              {contactInfo.map((item) => {
                const Icon = item.icon;
                const content = (
                  <div className="flex items-start gap-4 group">
                    <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent transition-colors group-hover:bg-accent group-hover:text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-sans text-xs text-muted-foreground uppercase tracking-wide">
                        {item.label}
                      </p>
                      <p className="mt-0.5 font-sans text-sm font-medium text-foreground leading-relaxed">
                        {item.value}
                      </p>
                      {"sublabel" in item && item.sublabel && (
                        <p className="font-sans text-xs text-muted-foreground">
                          {item.sublabel}
                        </p>
                      )}
                    </div>
                  </div>
                );

                if ("href" in item && item.href) {
                  return (
                    <a
                      key={item.label}
                      href={item.href}
                      className="block transition-opacity hover:opacity-80"
                    >
                      {content}
                    </a>
                  );
                }
                return <div key={item.label}>{content}</div>;
              })}
            </div>

            {/* Action buttons */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 font-sans text-sm font-medium text-white transition-all duration-300 hover:bg-accent/90 hover:scale-[1.02]"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </a>
              <a
                href="https://www.instagram.com/santaalejandriahotel/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-6 py-3 font-sans text-sm font-medium text-foreground transition-all duration-300 hover:bg-foreground/5"
              >
                <Instagram className="h-4 w-4" />
                Instagram
              </a>
            </div>
          </div>

          {/* Map */}
          <div
            className={cn(
              "transition-all duration-700 ease-out delay-300",
              isVisible
                ? "opacity-100 translate-x-0"
                : "opacity-0 translate-x-10"
            )}
          >
            <div className="overflow-hidden rounded-lg border-2 border-accent/20 shadow-lg">
              <iframe
                src={MAP_EMBED_URL}
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ubicación Hotel Santa Alejandría"
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Google Reviews widget */}
        <div
          className={cn(
            "mt-16 transition-all duration-700 ease-out delay-500",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
        >
          <p className="mb-6 text-center font-sans text-xs tracking-[0.25em] uppercase text-accent font-medium">
            Lo que dicen nuestros huéspedes
          </p>
          <div
            className="elfsight-app-e498e6bf-ac7c-48be-9eb4-68b9777fc54e min-h-[200px]"
            data-elfsight-app-lazy
          />
        </div>
      </div>
    </section>
  );
};

export default CartagenaLocation;
