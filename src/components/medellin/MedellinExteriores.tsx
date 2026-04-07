import { useState } from "react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { cn } from "@/lib/utils";
import { exteriorImages } from "@/data/medellin-room-images";
import { useTranslation } from "@/i18n/LanguageContext";
import { Building2, Sofa, Dumbbell, Sun, UtensilsCrossed, X, ChevronLeft, ChevronRight } from "lucide-react";

type CategoryKey = "fachadas" | "recepcion" | "gimnasio" | "terrazas" | "comedor";

interface CategoryDef {
  key: CategoryKey;
  icon: React.ElementType;
  labelKey: string;
}

const categories: CategoryDef[] = [
  { key: "fachadas", icon: Building2, labelKey: "fachadas" },
  { key: "recepcion", icon: Sofa, labelKey: "recepcion" },
  { key: "gimnasio", icon: Dumbbell, labelKey: "gimnasio" },
  { key: "terrazas", icon: Sun, labelKey: "terrazas" },
  { key: "comedor", icon: UtensilsCrossed, labelKey: "comedor" },
];

const MedellinExteriores = () => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.05 });
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState<CategoryKey>("fachadas");
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const activeImages = exteriorImages[activeCategory] ?? [];

  const openLightbox = (idx: number) => setLightboxIdx(idx);
  const closeLightbox = () => setLightboxIdx(null);
  const goPrev = () =>
    setLightboxIdx((i) =>
      i === null ? null : i === 0 ? activeImages.length - 1 : i - 1
    );
  const goNext = () =>
    setLightboxIdx((i) =>
      i === null ? null : i === activeImages.length - 1 ? 0 : i + 1
    );

  return (
    <section
      id="exteriores"
      ref={ref}
      className="scroll-mt-20 bg-muted/30 py-20 md:py-32"
    >
      <div className="container mx-auto px-6">
        {/* Header */}
        <div
          className={cn(
            "mb-12 text-center transition-all duration-700 ease-out",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
        >
          <p className="mb-3 font-sans text-xs tracking-[0.25em] uppercase text-primary font-medium">
            {t("medellinExteriores", "label")}
          </p>
          <h2 className="mb-4 font-serif text-3xl font-medium text-foreground md:text-4xl">
            {t("medellinExteriores", "heading")}
          </h2>
          <div className="mx-auto h-px w-16 bg-primary mb-4" />
          <p className="mx-auto max-w-2xl font-sans text-sm text-muted-foreground leading-relaxed">
            {t("medellinExteriores", "description")}
          </p>
        </div>

        {/* Category tabs */}
        <div
          className={cn(
            "mb-10 flex flex-wrap justify-center gap-2 transition-all duration-700 ease-out delay-100",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          )}
        >
          {categories.map((cat) => {
            const Icon = cat.icon;
            const count = exteriorImages[cat.key]?.length ?? 0;
            const isActive = activeCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={cn(
                  "group flex items-center gap-2 rounded-full border px-5 py-2.5 font-sans text-sm font-medium transition-all duration-300",
                  isActive
                    ? "bg-foreground text-background border-foreground shadow-md scale-105"
                    : "bg-card text-muted-foreground border-border hover:border-foreground/40 hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{t("medellinExteriores", cat.labelKey)}</span>
                <span
                  className={cn(
                    "ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                    isActive
                      ? "bg-background/20 text-background"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Image grid (masonry-style) */}
        {activeImages.length > 0 ? (
          <div
            key={activeCategory}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 animate-fade-in"
          >
            {activeImages.map((src, i) => (
              <button
                key={src}
                onClick={() => openLightbox(i)}
                className={cn(
                  "group relative overflow-hidden rounded-lg bg-muted aspect-square",
                  // Make some tiles span 2 rows for visual variety
                  i % 7 === 0 && "md:row-span-2 md:aspect-[3/4]",
                  i % 11 === 5 && "lg:col-span-2 lg:aspect-[2/1]"
                )}
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <img
                  src={src}
                  alt={`${activeCategory} ${i + 1}`}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-foreground/0 transition-colors duration-300 group-hover:bg-foreground/20" />
                <div className="absolute bottom-3 right-3 rounded-full bg-background/90 backdrop-blur px-2.5 py-1 text-[10px] font-medium text-foreground opacity-0 transition-opacity group-hover:opacity-100">
                  {i + 1} / {activeImages.length}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-center font-sans text-sm text-muted-foreground">
            {t("medellinExteriores", "sinFotos")}
          </p>
        )}
      </div>

      {/* Lightbox */}
      {lightboxIdx !== null && activeImages[lightboxIdx] && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 animate-fade-in"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur hover:bg-white/20 transition-colors"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>

          {activeImages.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goPrev();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur hover:bg-white/20 transition-colors"
                aria-label="Anterior"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goNext();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur hover:bg-white/20 transition-colors"
                aria-label="Siguiente"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          <img
            src={activeImages[lightboxIdx]}
            alt={`${activeCategory} ${lightboxIdx + 1}`}
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-white/10 backdrop-blur px-4 py-2 text-sm font-medium text-white">
            {lightboxIdx + 1} / {activeImages.length}
          </div>
        </div>
      )}
    </section>
  );
};

export default MedellinExteriores;
