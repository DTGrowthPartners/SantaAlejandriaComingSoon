import { Home } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Apartaestudio } from "@/data/medellin-rooms";
import { useTranslation } from "@/i18n/LanguageContext";
import WhatsAppIcon from "@/components/icons/WhatsAppIcon";
import { useWhatsapp } from "@/hooks/useWhatsapp";

function formatPrice(price: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

interface MedellinApartaestudiosProps {
  apartaestudios: Apartaestudio[];
}

const MedellinApartaestudios = ({ apartaestudios }: MedellinApartaestudiosProps) => {
  const { t } = useTranslation();
  const { waUrl } = useWhatsapp("medellin");

  const whatsappHref = waUrl(
    "Hola, me gustaría información sobre los Apartaestudios en Santa Alejandría Hotel – Medellín"
  );

  return (
    <div className="space-y-8">
      {/* Intro */}
      <div className="text-center max-w-2xl mx-auto">
        <h3 className="font-serif text-2xl font-medium text-foreground mb-2">
          {t("medellinApartaestudios", "heading")}
        </h3>
        <p className="font-sans text-sm text-muted-foreground leading-relaxed">
          {t("medellinApartaestudios", "description")}
        </p>
      </div>

      {/* Cards grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {apartaestudios.map((apto) => {
          const aptoImages = apto.images ?? [];
          const previewImage = aptoImages[0];
          return (
          <div
            key={apto.id}
            className="overflow-hidden rounded-xl border border-primary/15 bg-card transition-all duration-300 hover:shadow-lg hover:border-primary/30"
          >
            {/* Preview image */}
            {previewImage ? (
              <div className="aspect-[16/10] overflow-hidden">
                <img
                  src={previewImage}
                  alt={apto.name}
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                  loading="lazy"
                />
              </div>
            ) : (
              <div className="aspect-[16/10] bg-muted flex items-center justify-center">
                <Home className="h-12 w-12 text-primary/20" />
              </div>
            )}

            <div className="p-6">
            {/* Icon + Title */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Home className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-serif text-lg font-medium text-foreground">
                  {apto.ambientes} {apto.ambientes === 1 ? t("medellinApartaestudios", "ambiente") : t("medellinApartaestudios", "ambientes")}
                </h4>
                {apto.quantity && (
                  <p className="font-sans text-xs text-muted-foreground">
                    {apto.quantity} {t("medellinApartaestudios", "disponibles")}
                  </p>
                )}
              </div>
            </div>

            {/* Pricing */}
            <div className="space-y-2 mb-4 p-4 rounded-lg bg-primary/5">
              <div className="flex justify-between items-baseline">
                <span className="font-sans text-xs text-muted-foreground uppercase">{t("medellinApartaestudios", "porDia")}</span>
                <span className="font-serif text-lg font-medium text-primary">{formatPrice(apto.pricePerDay)}</span>
              </div>
              <div className="h-px bg-primary/10" />
              <div className="flex justify-between items-baseline">
                <span className="font-sans text-xs text-muted-foreground uppercase">{t("medellinApartaestudios", "porMes")}</span>
                <span className="font-serif text-lg font-medium text-primary">{formatPrice(apto.pricePerMonth)}</span>
              </div>
              <p className="font-sans text-[10px] text-muted-foreground text-center">
                {t("medellinApartaestudios", "serviciosIncluidos")}
              </p>
            </div>

            {/* Includes preview */}
            <div className="flex flex-wrap gap-1.5">
              {apto.includes.slice(0, 6).map((item) => (
                <Badge
                  key={item}
                  variant="outline"
                  className="border-primary/20 text-primary/70 font-sans text-[10px] px-2 py-0.5"
                >
                  {item}
                </Badge>
              ))}
              {apto.includes.length > 6 && (
                <Badge
                  variant="outline"
                  className="border-primary/20 text-primary/70 font-sans text-[10px] px-2 py-0.5"
                >
                  +{apto.includes.length - 6} más
                </Badge>
              )}
            </div>
            </div>
          </div>
          );
        })}
      </div>

      {/* Full includes list */}
      <div className="rounded-xl bg-primary/5 border border-primary/10 p-6">
        <p className="font-sans text-xs text-muted-foreground uppercase tracking-wide mb-4 text-center">
          {t("medellinApartaestudios", "todosIncluyen")}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {(apartaestudios[0]?.includes ?? []).map((item) => (
            <span key={item} className="flex items-center gap-1.5 font-sans text-sm text-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center">
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-[#D9D9D9] px-8 py-3.5 font-sans text-sm font-medium text-foreground tracking-wide transition-all duration-300 hover:bg-[#C4C4C4] hover:scale-105 hover:shadow-lg"
        >
          <WhatsAppIcon className="h-4 w-4" />
          {t("medellinApartaestudios", "consultar")}
        </a>
      </div>
    </div>
  );
};

export default MedellinApartaestudios;
