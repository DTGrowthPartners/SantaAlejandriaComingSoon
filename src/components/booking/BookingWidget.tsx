import { useMemo, useState } from "react";
import { Calendar as CalendarIcon, CheckCircle2, AlertCircle, Loader2, Users, Flame } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useBeds24Availability } from "@/hooks/useBeds24Availability";
import { useRoomCalendar } from "@/hooks/useRoomCalendar";
import { bookingDeepLink } from "@/lib/beds24";
import { cn } from "@/lib/utils";

function toISO(d: Date | undefined): string {
  if (!d) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function plusDays(d: Date, n: number): Date {
  const out = new Date(d);
  out.setDate(out.getDate() + n);
  return out;
}

function formatPriceCOP(n: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

interface Props {
  propertyId: string | null | undefined;
  roomId: string | null | undefined;
  pricePerNight: number;
  maxGuests: number;
}

const BookingWidget = ({ propertyId, roomId, pricePerNight, maxGuests }: Props) => {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [checkInDate, setCheckInDate] = useState<Date | undefined>(plusDays(today, 7));
  const [checkOutDate, setCheckOutDate] = useState<Date | undefined>(plusDays(today, 9));
  const [adults, setAdults] = useState(2);
  const [checked, setChecked] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [checkOutOpen, setCheckOutOpen] = useState(false);

  const checkIn = toISO(checkInDate);
  const checkOut = toISO(checkOutDate);

  const canQuery = Boolean(
    propertyId && roomId && checkInDate && checkOutDate && checkOutDate > checkInDate
  );

  const { unavailable, loading: calendarLoading } = useRoomCalendar({ propertyId, roomId });

  const isUnavailable = (d: Date) => unavailable.has(toISO(d));

  // For checkout: disable dates that would cause the stay to cross an unavailable night.
  // A stay [checkIn, checkOut) is valid only if every night in that range is available.
  const checkoutCrossesUnavailable = (candidate: Date): boolean => {
    if (!checkInDate) return false;
    const cur = new Date(checkInDate);
    while (cur < candidate) {
      if (unavailable.has(toISO(cur))) return true;
      cur.setDate(cur.getDate() + 1);
    }
    return false;
  };

  const { status, error, nights, minAvail } = useBeds24Availability({
    propertyId,
    roomId,
    checkIn,
    checkOut,
    enabled: checked && canQuery,
  });

  const totalEstimate = useMemo(() => pricePerNight * nights, [pricePerNight, nights]);

  const reservarUrl = useMemo(
    () =>
      bookingDeepLink({
        propertyId: propertyId || "",
        roomId: roomId || undefined,
        checkIn,
        checkOut,
        numAdult: adults,
      }),
    [propertyId, roomId, checkIn, checkOut, adults]
  );

  if (!propertyId || !roomId) return null;

  return (
    <div className="mt-6 rounded-xl border border-accent/20 bg-card p-5">
      <p className="mb-4 flex items-center gap-2 font-sans text-xs font-medium uppercase tracking-wider text-accent">
        <CalendarIcon className="h-3.5 w-3.5" />
        Verificar disponibilidad
      </p>

      <p className="-mt-2 mb-4 font-sans text-[11px] leading-snug text-muted-foreground">
        Los precios mostrados son netos. Se les aplica <strong>IVA del 19%</strong> al precio neto en el checkout.
      </p>

      {/* Dates row */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <span className="font-sans text-xs text-muted-foreground">Entrada <span className="text-[10px] text-accent/70">desde 3:00 PM</span></span>
          <Popover open={checkInOpen} onOpenChange={setCheckInOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className={cn(
                  "mt-1 flex w-full items-center justify-between rounded-md border border-border bg-background px-3 py-2 font-sans text-sm text-foreground hover:border-accent focus:border-accent focus:outline-none",
                  !checkInDate && "text-muted-foreground"
                )}
              >
                {checkInDate ? format(checkInDate, "d MMM yyyy", { locale: es }) : "Seleccionar"}
                <CalendarIcon className="ml-2 h-4 w-4 text-muted-foreground" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={checkInDate}
                onSelect={(d) => {
                  setCheckInDate(d);
                  setChecked(false);
                  // If the new check-in invalidates the current check-out (already past, or
                  // the stay would cross an occupied night), pick the next free night instead.
                  if (d) {
                    let nextCheckout = checkOutDate && checkOutDate > d ? checkOutDate : plusDays(d, 1);
                    const cur = new Date(d);
                    while (cur < nextCheckout) {
                      if (unavailable.has(toISO(cur))) {
                        nextCheckout = new Date(cur);
                        break;
                      }
                      cur.setDate(cur.getDate() + 1);
                    }
                    if (nextCheckout <= d) nextCheckout = plusDays(d, 1);
                    setCheckOutDate(nextCheckout);
                  }
                  setCheckInOpen(false);
                }}
                disabled={(d) => d < today || isUnavailable(d)}
                initialFocus
                locale={es}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <span className="font-sans text-xs text-muted-foreground">Salida <span className="text-[10px] text-accent/70">hasta 12:00 M</span></span>
          <Popover open={checkOutOpen} onOpenChange={setCheckOutOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className={cn(
                  "mt-1 flex w-full items-center justify-between rounded-md border border-border bg-background px-3 py-2 font-sans text-sm text-foreground hover:border-accent focus:border-accent focus:outline-none",
                  !checkOutDate && "text-muted-foreground"
                )}
              >
                {checkOutDate ? format(checkOutDate, "d MMM yyyy", { locale: es }) : "Seleccionar"}
                <CalendarIcon className="ml-2 h-4 w-4 text-muted-foreground" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={checkOutDate}
                onSelect={(d) => {
                  setCheckOutDate(d);
                  setChecked(false);
                  setCheckOutOpen(false);
                }}
                disabled={(d) => {
                  if (checkInDate ? d <= checkInDate : d < today) return true;
                  // The checkout night itself isn't slept in, but every night between
                  // check-in (inclusive) and checkout (exclusive) must be available.
                  if (checkInDate && checkoutCrossesUnavailable(d)) return true;
                  return false;
                }}
                initialFocus
                locale={es}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Guests row */}
      <div className="mt-3">
        <span className="font-sans text-xs text-muted-foreground flex items-center gap-1">
          <Users className="h-3 w-3" />
          Adultos
        </span>
        <Select
          value={String(adults)}
          onValueChange={(v) => {
            setAdults(Number(v));
            setChecked(false);
          }}
        >
          <SelectTrigger className="mt-1 bg-background">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: maxGuests }, (_, i) => i + 1).map((n) => (
              <SelectItem key={n} value={String(n)}>
                {n} {n === 1 ? "adulto" : "adultos"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <p className="mt-2 font-sans text-[10px] text-muted-foreground italic">
        Persona adicional: tarifa extra se calcula al confirmar.
      </p>

      <button
        type="button"
        onClick={() => setChecked(true)}
        disabled={!canQuery || status === "loading"}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border border-accent bg-transparent px-6 py-2.5 font-sans text-sm font-medium text-accent transition-all duration-300 hover:bg-accent hover:text-white disabled:opacity-50"
      >
        {status === "loading" && <Loader2 className="h-4 w-4 animate-spin" />}
        {status === "loading" ? "Consultando..." : "Verificar"}
      </button>

      {checked && status === "available" && (
        <div className="mt-4 rounded-lg bg-green-50 p-3">
          <p className="flex items-center gap-2 font-sans text-sm font-medium text-green-700">
            <CheckCircle2 className="h-4 w-4" />
            ¡Disponible! {nights} {nights === 1 ? "noche" : "noches"}
          </p>
          {pricePerNight > 0 && (
            <div className="mt-1 font-sans text-xs text-green-700/80">
              <p>
                Precio neto: <span className="font-serif font-semibold">{formatPriceCOP(totalEstimate)}</span>
              </p>
              <p className="text-green-700/70">
                + IVA 19% ({formatPriceCOP(totalEstimate * 0.19)}) — Total con IVA:{" "}
                <span className="font-serif font-semibold">{formatPriceCOP(totalEstimate * 1.19)}</span>
              </p>
            </div>
          )}
          {minAvail !== null && minAvail > 0 && minAvail <= 2 && (
            <p className="mt-2 flex items-center gap-1.5 font-sans text-xs font-medium text-orange-700">
              <Flame className="h-3.5 w-3.5" />
              {minAvail === 1
                ? "¡Solo queda 1 habitación para estas fechas!"
                : `¡Solo quedan ${minAvail} habitaciones para estas fechas!`}
            </p>
          )}
          <button
            type="button"
            onClick={() => setBookingOpen(true)}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-2.5 font-sans text-sm font-medium text-white transition-all duration-300 hover:bg-accent/90"
          >
            Reservar ahora
          </button>
        </div>
      )}

      {checked && status === "unavailable" && (
        <div className="mt-4 rounded-lg bg-amber-50 p-3">
          <p className="flex items-center gap-2 font-sans text-sm font-medium text-amber-700">
            <AlertCircle className="h-4 w-4" />
            No hay disponibilidad en esas fechas
          </p>
          <p className="mt-1 font-sans text-xs text-amber-700/80">
            Probá con otras fechas o contactanos por WhatsApp para alternativas.
          </p>
        </div>
      )}

      <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
        <DialogContent
          className="max-w-4xl w-full h-[90vh] p-0 overflow-hidden"
          onInteractOutside={(e) => {
            const t = e.target as HTMLElement;
            if (t?.closest?.("iframe")) e.preventDefault();
          }}
        >
          <DialogTitle className="sr-only">Reservar habitación</DialogTitle>
          <iframe
            src={reservarUrl}
            title="Reserva Santa Alejandría"
            className="w-full h-full border-0"
            allow="payment"
          />
        </DialogContent>
      </Dialog>

      {checked && status === "error" && (
        <div className="mt-4 rounded-lg bg-red-50 p-3">
          <p className="flex items-center gap-2 font-sans text-sm font-medium text-red-700">
            <AlertCircle className="h-4 w-4" />
            No pudimos consultar disponibilidad
          </p>
          <p className="mt-1 font-sans text-xs text-red-700/80">{error}</p>
        </div>
      )}
    </div>
  );
};

export default BookingWidget;
