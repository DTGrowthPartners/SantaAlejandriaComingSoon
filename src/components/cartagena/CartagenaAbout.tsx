import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/i18n/LanguageContext";
import entradaImg from "@/assets/cartagena/entrada-2.jpg";
import imgGeneral from "@/assets/cartagena/img_6215.jpg";

const badgeKeys = ["badge14", "badgeColonial", "badgeCentro", "badge24h"] as const;

const CartagenaAbout = () => {
  const { ref: sectionRef, isVisible } = useScrollAnimation({ threshold: 0.1 });
  const { t } = useTranslation();

  return (
    <section
      id="historia"
      ref={sectionRef}
      className="scroll-mt-20 bg-card py-20 md:py-32"
    >
      <div className="container mx-auto px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Image column */}
          <div
            className={cn(
              "relative transition-all duration-1000 ease-out",
              isVisible
                ? "opacity-100 translate-x-0"
                : "opacity-0 -translate-x-10"
            )}
          >
            {/* Main image with decorative border */}
            <div className="relative">
              <div className="absolute -inset-3 border-2 border-accent/30 rounded-lg" />
              <div className="relative overflow-hidden rounded-lg">
                <img
                  src={entradaImg}
                  alt="Hotel Santa Alejandría - Fachada colonial"
                  className="w-full h-[400px] md:h-[500px] object-cover transition-transform duration-700 hover:scale-105"
                  loading="lazy"
                />
              </div>
            </div>

            {/* Overlapping secondary image */}
            <div className="absolute -bottom-6 -right-4 md:-right-8 w-36 md:w-48 h-28 md:h-36 overflow-hidden rounded-lg border-4 border-card shadow-xl">
              <img
                src={imgGeneral}
                alt="Interior del hotel"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          </div>

          {/* Text column */}
          <div
            className={cn(
              "transition-all duration-1000 ease-out delay-200",
              isVisible
                ? "opacity-100 translate-x-0"
                : "opacity-0 translate-x-10"
            )}
          >
            {/* Label */}
            <p className="mb-3 font-sans text-xs tracking-[0.25em] uppercase text-accent font-medium">
              {t("cartagenaAbout", "label")}
            </p>

            {/* Heading */}
            <h2 className="mb-4 font-serif text-3xl font-medium text-foreground md:text-4xl leading-tight">
              {t("cartagenaAbout", "heading")}
            </h2>

            {/* Separator */}
            <div className="mb-6 h-px w-16 bg-accent" />

            {/* Body text */}
            <div className="space-y-4 font-sans text-sm text-muted-foreground leading-relaxed md:text-base">
              <p>
                {t("cartagenaAbout", "paragraph1")}
              </p>
<p>
                {t("cartagenaAbout", "paragraph2")}
              </p>
            </div>

            {/* Badges */}
            <div className="mt-8 flex flex-wrap gap-2">
              {badgeKeys.map((key) => (
                <Badge
                  key={key}
                  variant="outline"
                  className="border-accent/40 text-accent bg-accent/5 font-sans text-xs px-3 py-1.5"
                >
                  {t("cartagenaAbout", key)}
                </Badge>
              ))}
            </div>

            {/* Check-in/out info */}
            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-background p-4 text-center">
                <p className="font-sans text-xs text-muted-foreground uppercase tracking-wide">{t("cartagenaAbout", "checkIn")}</p>
                <p className="mt-1 font-serif text-lg font-medium text-foreground">3:00 PM</p>
              </div>
              <div className="rounded-lg bg-background p-4 text-center">
                <p className="font-sans text-xs text-muted-foreground uppercase tracking-wide">{t("cartagenaAbout", "checkOut")}</p>
                <p className="mt-1 font-serif text-lg font-medium text-foreground">12:00 M</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CartagenaAbout;
