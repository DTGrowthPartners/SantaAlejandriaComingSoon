import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/i18n/LanguageContext";
import { Leaf, Users, Clock, TreePine } from "lucide-react";

const stats = [
  { icon: Users, value: "176", labelKey: "capacidad" },
  { icon: TreePine, value: "10+", labelKey: "anosExperiencia" },
  { icon: Leaf, value: "100%", labelKey: "libreHumo" },
  { icon: Clock, value: "24/7", labelKey: "atencion" },
];

const badgeKeys = ["badgeCapacidad", "badgePrimavera", "badgeEstadio", "badge24h"] as const;

const MedellinAbout = () => {
  const { ref: sectionRef, isVisible } = useScrollAnimation({ threshold: 0.1 });
  const { t } = useTranslation();

  return (
    <section
      id="historia"
      ref={sectionRef}
      className="scroll-mt-20 bg-card py-20 md:py-32"
    >
      <div className="container mx-auto px-6">
        {/* Section header - centered, different from Cartagena's side-by-side layout */}
        <div
          className={cn(
            "max-w-3xl mx-auto text-center mb-16 transition-all duration-1000 ease-out",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          )}
        >
          <p className="mb-3 font-sans text-xs tracking-[0.25em] uppercase text-[#2d7a4a] font-medium">
            {t("medellinAbout", "label")}
          </p>
          <h2 className="mb-4 font-serif text-3xl font-medium text-foreground md:text-4xl leading-tight">
            {t("medellinAbout", "heading")}
          </h2>
          <div className="mx-auto mb-6 h-px w-16 bg-[#2d7a4a]" />
          <p className="font-sans text-sm text-muted-foreground leading-relaxed md:text-base">
            {t("medellinAbout", "paragraph1")}
          </p>
        </div>

        {/* Stats row - unique to Medellín */}
        <div
          className={cn(
            "grid grid-cols-2 md:grid-cols-4 gap-6 mb-16 transition-all duration-1000 ease-out delay-200",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          )}
        >
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.labelKey}
                className="text-center p-6 rounded-xl bg-[#2d7a4a]/5 border border-[#2d7a4a]/10"
                style={{ transitionDelay: `${i * 100 + 300}ms` }}
              >
                <Icon className="mx-auto mb-3 h-6 w-6 text-[#2d7a4a]" />
                <p className="font-serif text-2xl font-medium text-foreground">{stat.value}</p>
                <p className="mt-1 font-sans text-xs text-muted-foreground uppercase tracking-wide">
                  {t("medellinAbout", stat.labelKey)}
                </p>
              </div>
            );
          })}
        </div>

        {/* Two column: "Lo que nos hace diferentes" */}
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Text column */}
          <div
            className={cn(
              "transition-all duration-1000 ease-out delay-300",
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"
            )}
          >
            <p className="mb-3 font-sans text-xs tracking-[0.25em] uppercase text-[#2d7a4a] font-medium">
              {t("medellinAbout", "diferentesLabel")}
            </p>
            <h3 className="mb-4 font-serif text-2xl font-medium text-foreground md:text-3xl leading-tight">
              {t("medellinAbout", "diferentesHeading")}
            </h3>
            <div className="mb-6 h-px w-16 bg-[#2d7a4a]" />
            <p className="font-sans text-sm text-muted-foreground leading-relaxed md:text-base">
              {t("medellinAbout", "paragraph2")}
            </p>

            {/* Badges */}
            <div className="mt-8 flex flex-wrap gap-2">
              {badgeKeys.map((key) => (
                <Badge
                  key={key}
                  variant="outline"
                  className="border-[#2d7a4a]/40 text-[#2d7a4a] bg-[#2d7a4a]/5 font-sans text-xs px-3 py-1.5"
                >
                  {t("medellinAbout", key)}
                </Badge>
              ))}
            </div>
          </div>

          {/* Check-in/out + Image placeholder */}
          <div
            className={cn(
              "transition-all duration-1000 ease-out delay-400",
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"
            )}
          >
            {/* Image placeholder */}
            <div className="relative mb-8 overflow-hidden rounded-xl bg-gradient-to-br from-[#2d7a4a]/10 to-[#2d7a4a]/5 border-2 border-dashed border-[#2d7a4a]/20 aspect-[4/3] flex items-center justify-center">
              <div className="text-center p-6">
                <TreePine className="mx-auto mb-3 h-12 w-12 text-[#2d7a4a]/30" />
                <p className="font-sans text-sm text-[#2d7a4a]/40">
                  {t("medellinAbout", "imagePlaceholder")}
                </p>
              </div>
            </div>

            {/* Check-in/out info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-[#2d7a4a]/5 border border-[#2d7a4a]/10 p-4 text-center">
                <p className="font-sans text-xs text-muted-foreground uppercase tracking-wide">Check-in</p>
                <p className="mt-1 font-serif text-lg font-medium text-foreground">3:00 PM</p>
                <p className="mt-0.5 font-sans text-[10px] text-muted-foreground">
                  {t("medellinAbout", "earlyCheckIn")}
                </p>
              </div>
              <div className="rounded-lg bg-[#2d7a4a]/5 border border-[#2d7a4a]/10 p-4 text-center">
                <p className="font-sans text-xs text-muted-foreground uppercase tracking-wide">Check-out</p>
                <p className="mt-1 font-serif text-lg font-medium text-foreground">12:00 M</p>
                <p className="mt-0.5 font-sans text-[10px] text-muted-foreground">
                  {t("medellinAbout", "lateCheckOut")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MedellinAbout;
