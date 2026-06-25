import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/i18n/LanguageContext";
import { medellinRoomCategories as baseRoomCategories } from "@/data/medellin-rooms";
import { roomImages } from "@/data/medellin-room-images";
import MedellinRoomCard from "./MedellinRoomCard";
import MedellinApartaestudios from "./MedellinApartaestudios";

const MedellinRooms = () => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.05 });
  const { t } = useTranslation();
  // Photos served locally from the repo, not Directus.
  const medellinRoomCategories = baseRoomCategories.map((cat) => ({
    ...cat,
    images: roomImages[cat.id] ?? [],
  }));
  const loading = false;

  return (
    <section
      id="habitaciones"
      ref={ref}
      className="scroll-mt-20 bg-background py-20 md:py-32"
    >
      <div className="container mx-auto px-6">
        {/* Section header */}
        <div
          className={cn(
            "mb-12 text-center transition-all duration-700 ease-out",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
        >
          <p className="mb-3 font-sans text-xs tracking-[0.25em] uppercase text-primary font-medium">
            {t("medellinRooms", "label")}
          </p>
          <h2 className="mb-4 font-serif text-3xl font-medium text-foreground md:text-4xl">
            {t("medellinRooms", "heading")}
          </h2>
          <div className="mx-auto h-px w-16 bg-primary" />
          <p className="mt-4 mx-auto max-w-2xl font-sans text-sm text-muted-foreground leading-relaxed">
            {t("medellinRooms", "description")}
          </p>
        </div>

        {/* Room categories tabs */}
        <div
          className={cn(
            "transition-all duration-700 ease-out delay-200",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
        >
          {loading || medellinRoomCategories.length === 0 ? (
            <div className="py-16 text-center font-sans text-sm text-muted-foreground">
              {loading ? "Cargando habitaciones..." : "No hay habitaciones disponibles"}
            </div>
          ) : (
          <Tabs defaultValue={medellinRoomCategories[0].id} className="w-full">
            <TabsList className="mb-8 flex h-auto flex-wrap justify-center gap-2 bg-transparent p-0">
              {medellinRoomCategories.map((cat) => (
                <TabsTrigger
                  key={cat.id}
                  value={cat.id}
                  className="rounded-full border border-border bg-transparent px-4 py-2 font-sans text-xs font-medium tracking-wide data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:border-primary transition-all duration-300 hover:border-primary/50"
                >
                  {t("medellinRoomNames", cat.id)}
                </TabsTrigger>
              ))}
              <TabsTrigger
                value="apartaestudios"
                className="rounded-full border border-border bg-transparent px-4 py-2 font-sans text-xs font-medium tracking-wide data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:border-primary transition-all duration-300 hover:border-primary/50"
              >
                {t("medellinRoomNames", "apartaestudios")}
              </TabsTrigger>
            </TabsList>

            {medellinRoomCategories.map((cat) => (
              <TabsContent key={cat.id} value={cat.id}>
                <MedellinRoomCard category={cat} />
              </TabsContent>
            ))}

            <TabsContent value="apartaestudios">
              <MedellinApartaestudios />
            </TabsContent>
          </Tabs>
          )}
        </div>
      </div>
    </section>
  );
};

export default MedellinRooms;
