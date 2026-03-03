import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { rooms, ADDITIONAL_PRICING } from "@/data/cartagena-rooms";
import { Users, Baby } from "lucide-react";
import RoomCard from "./RoomCard";

function formatPrice(price: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

const CartagenaRooms = () => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.05 });

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
          <p className="mb-3 font-sans text-xs tracking-[0.25em] uppercase text-accent font-medium">
            Alojamiento
          </p>
          <h2 className="mb-4 font-serif text-3xl font-medium text-foreground md:text-4xl">
            Nuestras Habitaciones
          </h2>
          <div className="mx-auto h-px w-16 bg-accent" />
          <p className="mt-4 mx-auto max-w-2xl font-sans text-sm text-muted-foreground leading-relaxed">
            14 cómodas y bien dotadas habitaciones que conservan detalles del estilo colonial,
            grandes ventanas con barrotes, viejos baúles y los tradicionales farolitos
            que llenan de magia los espacios.
          </p>
        </div>

        {/* Tabs */}
        <div
          className={cn(
            "transition-all duration-700 ease-out delay-200",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
        >
          <Tabs defaultValue={rooms[0].id} className="w-full">
            <TabsList className="mb-8 flex h-auto flex-wrap justify-center gap-2 bg-transparent p-0">
              {rooms.map((room) => (
                <TabsTrigger
                  key={room.id}
                  value={room.id}
                  className="rounded-full border border-border bg-transparent px-4 py-2 font-sans text-xs font-medium tracking-wide data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary transition-all duration-300 hover:border-primary/50"
                >
                  {room.shortName}
                </TabsTrigger>
              ))}
            </TabsList>

            {rooms.map((room) => (
              <TabsContent key={room.id} value={room.id}>
                <RoomCard room={room} />
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* Additional pricing note */}
        <div
          className={cn(
            "mt-12 rounded-lg bg-card p-6 transition-all duration-700 ease-out delay-300",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
        >
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-center sm:text-left">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-accent" />
              <div>
                <p className="font-sans text-sm font-medium text-foreground">
                  Persona adicional
                </p>
                <p className="font-serif text-lg text-accent">
                  {formatPrice(ADDITIONAL_PRICING.additionalPerson)}
                </p>
              </div>
            </div>
            <div className="hidden sm:block h-8 w-px bg-border" />
            <div className="flex items-center gap-3">
              <Baby className="h-5 w-5 text-accent" />
              <div>
                <p className="font-sans text-sm font-medium text-foreground">
                  Niños (3-10 años)
                </p>
                <p className="font-serif text-lg text-accent">
                  {formatPrice(ADDITIONAL_PRICING.children3to10)}
                </p>
              </div>
            </div>
          </div>
          <p className="mt-4 text-center font-sans text-xs text-muted-foreground">
            {ADDITIONAL_PRICING.note}
          </p>
        </div>
      </div>
    </section>
  );
};

export default CartagenaRooms;
