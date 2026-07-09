import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { cn } from "@/lib/utils";
import { MapPin, Phone, Clock, Mail, Instagram, Train, Trophy, Bike } from "lucide-react";
import { useTranslation } from "@/i18n/LanguageContext";
import WhatsAppIcon from "@/components/icons/WhatsAppIcon";
import { useWhatsapp } from "@/hooks/useWhatsapp";
import { useDirectusHotel } from "@/hooks/useDirectusHotel";
import { pickLang } from "@/lib/directus";

const MAP_EMBED_URL =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.2!2d-75.59!3d6.24!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sCRA+77C+No+48-91+Medellin!5e0!3m2!1ses!2sco";

const nearbyPlaces = [
  { icon: Train, name: "Estación Floresta del Metro", time: "3 min a pie" },
  { icon: Trophy, name: "Estadio Atanasio Girardot", time: "8 min" },
  { icon: Bike, name: "Velódromo", time: "5 min" },
];

const MedellinLocation = () => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 });
  const { t, lang } = useTranslation();
  const { waUrl } = useWhatsapp("medellin");
  const { hotel } = useDirectusHotel("medellin");

  const phoneDisplay = hotel?.phone || "305 309 3723";
  const phoneTel = hotel?.phone_tel || "573053093723";
  const phoneValue =
    phoneDisplay + (hotel?.phone_landline ? ` – ${hotel.phone_landline}` : " – (604) 324 6004");
  const email = hotel?.reservation_email || "reservationmed@santalejandriahotels.com";
  const mapEmbed = hotel?.maps_embed_url || MAP_EMBED_URL;
  const instagramUrl =
    hotel?.instagram_url || "https://www.instagram.com/santaalejandriahotelmed/";

  const nearbyIcons: Record<string, typeof Train> = { Train, Trophy, Bike };
  const displayNearby =
    hotel?.nearby_places && hotel.nearby_places.length > 0
      ? hotel.nearby_places.map((p) => ({
          Icon: nearbyIcons[p.icon] ?? MapPin,
          name: pickLang(p.name, p.name_en, lang),
          time: p.time,
        }))
      : nearbyPlaces.map((p) => ({ Icon: p.icon, name: p.name, time: p.time }));

  const contactInfo = [
    {
      icon: MapPin,
      label: t("medellinLocation", "direccion"),
      value: hotel?.address || "CRA 77C No 48 – 91, Sector Estadio",
      sublabel: hotel?.address_line2 || "Medellín, Antioquia, Colombia",
    },
    {
      icon: Phone,
      label: t("medellinLocation", "telefono"),
      value: phoneValue,
      href: `tel:+${phoneTel}`,
    },
    {
      icon: Mail,
      label: t("medellinLocation", "email"),
      value: email,
      href: `mailto:${email}`,
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
                href={waUrl("Hola, me gustaría hacer una reserva en Santa Alejandría Hotel – Medellín")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#D9D9D9] px-6 py-3 font-sans text-sm font-medium text-foreground transition-all duration-300 hover:bg-[#C4C4C4] hover:scale-[1.02]"
              >
                <WhatsAppIcon className="h-4 w-4" />
                WhatsApp
              </a>
              <a
                href={instagramUrl}
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
              {displayNearby.map((place, i) => {
                const Icon = place.Icon;
                return (
                  <div
                    key={i}
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
                src={mapEmbed}
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
