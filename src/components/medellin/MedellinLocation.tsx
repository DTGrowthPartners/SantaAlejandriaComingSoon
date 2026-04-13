import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { cn } from "@/lib/utils";
import {
  MapPin,
  Phone,
  Clock,
  Mail,
  Instagram,
  MessageCircle,
  Train,
  Trophy,
  Bike,
} from "lucide-react";
import { useTranslation } from "@/i18n/LanguageContext";

const WHATSAPP_URL =
  "https://wa.me/573053093723?text=Hola%2C%20me%20gustar%C3%ADa%20hacer%20una%20reserva%20en%20Santa%20Alejandr%C3%ADa%20Hotel%20%E2%80%93%20Medell%C3%ADn";

const MAP_EMBED_URL =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.2!2d-75.59!3d6.24!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sCRA+77C+No+48-91+Medellin!5e0!3m2!1ses!2sco";

const nearbyPlaces = [
  { icon: Train, name: "Estación Floresta del Metro", time: "3 min a pie" },
  { icon: Trophy, name: "Estadio Atanasio Girardot", time: "8 min" },
  { icon: Bike, name: "Velódromo", time: "5 min" },
];

const MedellinLocation = () => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 });
  const { t } = useTranslation();

  const contactInfo = [
    {
      icon: MapPin,
      label: t("medellinLocation", "direccion"),
      value: "CRA 77C No 48 – 91, Sector Estadio",
      sublabel: "Medellín, Antioquia, Colombia",
    },
    {
      icon: Phone,
      label: t("medellinLocation", "telefono"),
      value: "305 309 3723 – (604) 324 6004",
      href: "tel:+573053093723",
    },
    {
      icon: Mail,
      label: t("medellinLocation", "email"),
      value: "reservationmed@santalejandriahotels.com",
      href: "mailto:reservationmed@santalejandriahotels.com",
    },
    {
      icon: Clock,
      label: t("medellinLocation", "horario"),
      value: t("medellinLocation", "servicio24h"),
    },
  ];

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
          <p className="mb-3 font-sans text-xs tracking-[0.25em] uppercase text-primary font-medium">
            {t("medellinLocation", "label")}
          </p>
          <h2 className="mb-4 font-serif text-3xl font-medium text-foreground md:text-4xl">
            {t("medellinLocation", "heading")}
          </h2>
          <div className="mx-auto h-px w-16 bg-primary" />
        </div>

        {/* Three columns layout - different from Cartagena's two columns */}
        <div className="grid gap-10 lg:grid-cols-3 lg:gap-8">
          {/* Contact info */}
          <div
            className={cn(
              "transition-all duration-700 ease-out delay-200",
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"
            )}
          >
            <div className="space-y-5">
              {contactInfo.map((item) => {
                const Icon = item.icon;
                const content = (
                  <div className="flex items-start gap-3 group">
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                      <Icon className="h-4 w-4" />
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
            <div className="mt-6 flex flex-col gap-3 sm:flex-row lg:flex-col">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#D9D9D9] px-6 py-3 font-sans text-sm font-medium text-foreground transition-all duration-300 hover:bg-[#C4C4C4] hover:scale-[1.02]"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </a>
              <a
                href="https://www.instagram.com/santaalejandriahotelmed/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-6 py-3 font-sans text-sm font-medium text-foreground transition-all duration-300 hover:bg-foreground/5"
              >
                <Instagram className="h-4 w-4" />
                Instagram
              </a>
            </div>
          </div>

          {/* Nearby places - unique to Medellín */}
          <div
            className={cn(
              "transition-all duration-700 ease-out delay-300",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            )}
          >
            <p className="mb-4 font-sans text-xs tracking-[0.2em] uppercase text-primary font-medium">
              {t("medellinLocation", "cercaDe")}
            </p>
            <div className="space-y-3">
              {nearbyPlaces.map((place) => {
                const Icon = place.icon;
                return (
                  <div
                    key={place.name}
                    className="flex items-center gap-3 rounded-lg bg-primary/5 border border-primary/10 p-4"
                  >
                    <Icon className="h-5 w-5 text-primary shrink-0" />
                    <div>
                      <p className="font-sans text-sm font-medium text-foreground">{place.name}</p>
                      <p className="font-sans text-xs text-muted-foreground">{place.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Map */}
          <div
            className={cn(
              "transition-all duration-700 ease-out delay-400",
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"
            )}
          >
            <div className="overflow-hidden rounded-lg border-2 border-primary/20 shadow-lg">
              <iframe
                src={MAP_EMBED_URL}
                width="100%"
                height="350"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ubicación Hotel Santa Alejandría Medellín"
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MedellinLocation;
