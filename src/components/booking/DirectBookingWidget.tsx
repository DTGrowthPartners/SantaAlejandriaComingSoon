import { useEffect, useMemo, useState } from "react";
import {
  Calendar as CalendarIcon,
  Users,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Hotel,
  CreditCard,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { RoomType } from "@/data/cartagena-rooms";

const PMS_API =
  (import.meta.env.VITE_PMS_API_URL as string | undefined) ??
  "https://forecast.santalejandriahotels.com";
const IVA_RATE = 0.19;

function toISO(d: Date): string {
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
function formatCOP(n: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function DirectBookingWidget({ room }: { room: RoomType }) {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [checkIn, setCheckIn] = useState<Date | undefined>();
  const [checkOut, setCheckOut] = useState<Date | undefined>();
  const [adults, setAdults] = useState(2);
  const [roomsBusy, setRoomsBusy] = useState<Set<string>[]>([]);
  const [ciOpen, setCiOpen] = useState(false);
  const [coOpen, setCoOpen] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [payMode, setPayMode] = useState<"hotel" | "online">("online");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ number: number; total: number; mode: string } | null>(null);

  // Disponibilidad (fechas bloqueadas) desde el PMS
  useEffect(() => {
    let cancelled = false;
    const from = toISO(today);
    const to = toISO(plusDays(today, 183));
    fetch(`${PMS_API}/api/public/availability?room=${encodeURIComponent(room.id)}&from=${from}&to=${to}`)
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled && Array.isArray(d.rooms)) {
          setRoomsBusy(d.rooms.map((r: { busy: string[] }) => new Set(r.busy)));
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [room.id, today]);

  const priceForNight = (isoDay: string): number => {
    const p = room.pricePeriods.find((pp) => pp.startDate <= isoDay && pp.endDate >= isoDay);
    return p ? p.price : room.pricePerNight;
  };

  const quote = useMemo(() => {
    if (!checkIn || !checkOut || checkOut <= checkIn) return null;
    let subtotal = 0;
    let nights = 0;
    const cur = new Date(checkIn);
    while (cur < checkOut) {
      subtotal += priceForNight(toISO(cur));
      nights++;
      cur.setDate(cur.getDate() + 1);
    }
    const iva = Math.round(subtotal * IVA_RATE);
    return { nights, subtotal, iva, total: subtotal + iva };
  }, [checkIn, checkOut, room]);

  // Un día no sirve de check-in si TODAS las habitaciones del tipo están ocupadas esa noche.
  const allRoomsBusy = (d: Date) => roomsBusy.length > 0 && roomsBusy.every((bs) => bs.has(toISO(d)));

  // ¿Existe UNA habitación libre TODAS las noches [ci, co)? (sin datos → no bloquea; el server valida)
  const someRoomFree = (ci: Date, co: Date): boolean => {
    if (roomsBusy.length === 0) return true;
    return roomsBusy.some((bs) => {
      const cur = new Date(ci);
      while (cur < co) {
        if (bs.has(toISO(cur))) return false;
        cur.setDate(cur.getDate() + 1);
      }
      return true;
    });
  };

  async function submit() {
    if (!checkIn || !checkOut) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`${PMS_API}/api/public/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          room: room.id,
          checkIn: toISO(checkIn),
          checkOut: toISO(checkOut),
          guestName: name,
          guestPhone: phone,
          guestEmail: email,
          guestsCount: adults,
          payMode,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo crear la reserva.");
        return;
      }
      if (payMode === "online" && data.paymentUrl) {
        window.location.href = data.paymentUrl; // → checkout Bold
        return;
      }
      setDone({ number: data.reservationNumber, total: data.total, mode: payMode });
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  const canReserve = Boolean(
    checkIn && checkOut && quote && quote.nights > 0 && someRoomFree(checkIn, checkOut),
  );
  const formValid = name.trim().length >= 3 && phone.trim().length >= 7;

  return (
    <div className="mt-6 rounded-xl border border-accent/25 bg-card p-5">
      <p className="mb-4 flex items-center gap-2 font-sans text-xs font-medium uppercase tracking-wider text-accent">
        <CalendarIcon className="h-3.5 w-3.5" />
        Reservar en línea
      </p>

      {/* Fechas */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <span className="font-sans text-xs text-muted-foreground">Entrada</span>
          <Popover open={ciOpen} onOpenChange={setCiOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className={cn(
                  "mt-1 flex w-full items-center justify-between rounded-md border border-border bg-background px-3 py-2 font-sans text-sm hover:border-accent",
                  !checkIn && "text-muted-foreground",
                )}
              >
                {checkIn ? format(checkIn, "d MMM yyyy", { locale: es }) : "Seleccionar"}
                <CalendarIcon className="ml-2 h-4 w-4 text-muted-foreground" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={checkIn}
                onSelect={(d) => {
                  setCheckIn(d);
                  if (d) {
                    const keep = checkOut && checkOut > d && someRoomFree(d, checkOut);
                    setCheckOut(keep ? checkOut : plusDays(d, 1));
                  }
                  setCiOpen(false);
                }}
                disabled={(d) => d < today || allRoomsBusy(d)}
                initialFocus
                locale={es}
              />
            </PopoverContent>
          </Popover>
        </div>
        <div>
          <span className="font-sans text-xs text-muted-foreground">Salida</span>
          <Popover open={coOpen} onOpenChange={setCoOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className={cn(
                  "mt-1 flex w-full items-center justify-between rounded-md border border-border bg-background px-3 py-2 font-sans text-sm hover:border-accent",
                  !checkOut && "text-muted-foreground",
                )}
              >
                {checkOut ? format(checkOut, "d MMM yyyy", { locale: es }) : "Seleccionar"}
                <CalendarIcon className="ml-2 h-4 w-4 text-muted-foreground" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={checkOut}
                onSelect={(d) => {
                  setCheckOut(d);
                  setCoOpen(false);
                }}
                disabled={(d) => {
                  if (checkIn ? d <= checkIn : d < today) return true;
                  if (checkIn && !someRoomFree(checkIn, d)) return true;
                  return false;
                }}
                initialFocus
                locale={es}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Huéspedes */}
      <div className="mt-3">
        <span className="flex items-center gap-1 font-sans text-xs text-muted-foreground">
          <Users className="h-3 w-3" /> Huéspedes
        </span>
        <Select value={String(adults)} onValueChange={(v) => setAdults(Number(v))}>
          <SelectTrigger className="mt-1 bg-background">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: Math.max(1, room.maxGuests) }, (_, i) => i + 1).map((n) => (
              <SelectItem key={n} value={String(n)}>
                {n} {n === 1 ? "persona" : "personas"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Resumen de precio */}
      {quote && (
        <div className="mt-4 rounded-lg bg-primary/5 p-3 font-sans text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>{quote.nights} {quote.nights === 1 ? "noche" : "noches"} (neto)</span>
            <span>{formatCOP(quote.subtotal)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>IVA 19%</span>
            <span>{formatCOP(quote.iva)}</span>
          </div>
          <div className="mt-1 flex justify-between border-t border-border pt-1 font-serif text-base font-semibold text-foreground">
            <span>Total</span>
            <span className="text-accent">{formatCOP(quote.total)}</span>
          </div>
        </div>
      )}

      {checkIn && checkOut && quote && quote.nights > 0 && !someRoomFree(checkIn, checkOut) && (
        <p className="mt-2 font-sans text-xs text-amber-700">
          No hay una habitación libre para todas esas noches. Prueba con otras fechas.
        </p>
      )}

      <button
        type="button"
        disabled={!canReserve}
        onClick={() => {
          setDone(null);
          setError(null);
          setModalOpen(true);
        }}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-2.5 font-sans text-sm font-medium text-white transition-all duration-300 hover:bg-accent/90 hover:scale-[1.01] disabled:opacity-50 disabled:hover:scale-100"
      >
        Reservar ahora
      </button>

      {/* Modal de datos + pago */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <DialogTitle className="font-serif text-xl text-foreground">
            {done ? "¡Reserva confirmada!" : `Reservar ${room.name}`}
          </DialogTitle>

          {done ? (
            <div className="py-2 text-center">
              <CheckCircle2 className="mx-auto h-12 w-12 text-green-600" />
              <p className="mt-3 font-sans text-sm text-muted-foreground">
                Tu reserva <strong>#{done.number}</strong> quedó registrada por{" "}
                <strong>{formatCOP(done.total)}</strong>.
              </p>
              <p className="mt-1 font-sans text-sm text-muted-foreground">
                {done.mode === "hotel"
                  ? "Pagas al llegar al hotel. ¡Te esperamos!"
                  : "Revisa tu correo para el pago."}
              </p>
              <button
                onClick={() => setModalOpen(false)}
                className="mt-5 rounded-full bg-accent px-6 py-2 font-sans text-sm font-medium text-white hover:bg-accent/90"
              >
                Listo
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {quote && (
                <p className="font-sans text-sm text-muted-foreground">
                  {checkIn && format(checkIn, "d MMM", { locale: es })} →{" "}
                  {checkOut && format(checkOut, "d MMM yyyy", { locale: es })} ·{" "}
                  {quote.nights} {quote.nights === 1 ? "noche" : "noches"} ·{" "}
                  <strong className="text-foreground">{formatCOP(quote.total)}</strong> (IVA inc.)
                </p>
              )}

              <input
                placeholder="Nombre completo *"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-md border border-border bg-background px-3 py-2 font-sans text-sm outline-none focus:border-accent"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  placeholder="Teléfono *"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="rounded-md border border-border bg-background px-3 py-2 font-sans text-sm outline-none focus:border-accent"
                />
                <input
                  placeholder="Correo"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-md border border-border bg-background px-3 py-2 font-sans text-sm outline-none focus:border-accent"
                />
              </div>

              {/* Elección de pago */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPayMode("online")}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-lg border p-3 font-sans text-xs transition",
                    payMode === "online"
                      ? "border-accent bg-accent/5 text-foreground"
                      : "border-border text-muted-foreground hover:border-accent/50",
                  )}
                >
                  <CreditCard className="h-5 w-5 text-accent" />
                  Pagar en línea
                </button>
                <button
                  type="button"
                  onClick={() => setPayMode("hotel")}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-lg border p-3 font-sans text-xs transition",
                    payMode === "hotel"
                      ? "border-accent bg-accent/5 text-foreground"
                      : "border-border text-muted-foreground hover:border-accent/50",
                  )}
                >
                  <Hotel className="h-5 w-5 text-accent" />
                  Pagar en el hotel
                </button>
              </div>

              {error && (
                <p className="flex items-center gap-1.5 rounded-md bg-red-50 px-3 py-2 font-sans text-xs text-red-700">
                  <AlertCircle className="h-3.5 w-3.5" /> {error}
                </p>
              )}

              <button
                type="button"
                disabled={!formValid || submitting}
                onClick={submit}
                className="mt-1 inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-2.5 font-sans text-sm font-medium text-white hover:bg-accent/90 disabled:opacity-50"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {payMode === "online" ? "Ir a pagar" : "Confirmar reserva"}
              </button>
              <p className="text-center font-sans text-[10px] text-muted-foreground">
                {payMode === "online"
                  ? "Pago seguro con Bold. Serás redirigido al checkout."
                  : "Guardamos tu reserva y pagas al llegar."}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
