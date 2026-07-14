"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import {
  createReservationAction,
  updateReservationAction,
  type ActionState,
} from "@/lib/actions/reservations";
import {
  BOOKING_CHANNELS,
  CHANNEL_META,
  EDITABLE_RESERVATION_STATUSES,
  RESERVATION_STATUS_META,
  ivaOf,
  totalDue,
} from "@/lib/domain";
import { formatCOP } from "@/lib/format";

/** Espejo (solo lectura) del tipo de `@/lib/rates`; no se importa porque es server-only. */
type RoomTypeRate = {
  slug: string;
  typeName: string;
  pmsRooms: string[];
  basePrice: number;
  seasons: { label: string; pricePerNight: number; startDate: string; endDate: string }[];
};

type RateOption = { key: string; label: string; pricePerNight: number; vigente?: boolean };

/** Noches entre dos fechas YYYY-MM-DD (0 si inválidas). */
function nightsBetween(ci: string, co: string): number {
  if (!ci || !co) return 0;
  const a = Date.parse(`${ci}T00:00:00Z`);
  const b = Date.parse(`${co}T00:00:00Z`);
  if (Number.isNaN(a) || Number.isNaN(b) || b <= a) return 0;
  return Math.round((b - a) / 86_400_000);
}

export type ReservationInitial = {
  id?: string;
  roomId: string;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  channel: string;
  checkIn: string;
  checkOut: string;
  guestsCount: number;
  totalAmount: number;
  applyIva: boolean;
  depositRequired: number;
  notes: string;
  reservationStatus?: string;
  // Campos del FORMATO DE RESERVAS
  roomsCount: number;
  upgrade: boolean;
  mealPlan: string;
  arrivalTime: string;
  nationality: string;
  extraNights: number;
  company: string;
  cardRef: string;
  virtualAdvance: number;
};

const initialState: ActionState = { ok: false, error: null };

const field =
  "rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand-light";
const labelCls = "text-xs font-medium text-slate-600";

export function ReservationForm({
  mode,
  rooms,
  initial,
  onClose,
  onSuccess,
}: {
  mode: "create" | "edit";
  rooms: { id: string; name: string; type: string | null; directusSlug: string | null }[];
  initial: ReservationInitial;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const action = mode === "create" ? createReservationAction : updateReservationAction;
  const [state, formAction, pending] = useActionState(action, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  const [roomId, setRoomId] = useState<string>(initial.roomId);
  const [checkIn, setCheckIn] = useState<string>(initial.checkIn);
  const [checkOut, setCheckOut] = useState<string>(initial.checkOut);
  const [totalAmount, setTotalAmount] = useState<number>(initial.totalAmount);
  const [applyIva, setApplyIva] = useState<boolean>(initial.applyIva);
  const [depositRequired, setDepositRequired] = useState<number>(initial.depositRequired);
  const [virtualAdvance, setVirtualAdvance] = useState<number>(initial.virtualAdvance);

  // Tarifas de Directus (precios web): "custom" = valor escrito a mano.
  const [rates, setRates] = useState<RoomTypeRate[]>([]);
  const [rateKey, setRateKey] = useState<string>("custom");

  useEffect(() => {
    if (state.ok) onSuccess();
  }, [state.ok, onSuccess]);

  useEffect(() => {
    let alive = true;
    fetch("/api/rates")
      .then((r) => r.json())
      .then((d) => {
        if (alive && d?.ok && Array.isArray(d.rates)) setRates(d.rates as RoomTypeRate[]);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const nights = nightsBetween(checkIn, checkOut);
  const selectedRoom = rooms.find((r) => r.id === roomId);
  const roomNumber = selectedRoom?.name ?? "";
  // Tarifa del tipo web: primero por el vínculo del PMS (directusSlug), y como
  // respaldo por el campo pms_rooms de Directus.
  const roomRate =
    (selectedRoom?.directusSlug
      ? rates.find((rt) => rt.slug === selectedRoom.directusSlug)
      : null) ??
    rates.find((rt) => rt.pmsRooms.includes(roomNumber)) ??
    null;

  const rateOptions: RateOption[] = roomRate
    ? [
        { key: "base", label: "Precio normal", pricePerNight: roomRate.basePrice },
        ...roomRate.seasons.map((s, i) => ({
          key: `s${i}`,
          label: s.label,
          pricePerNight: s.pricePerNight,
          vigente: !!checkIn && s.startDate <= checkIn && s.endDate >= checkIn,
        })),
      ]
    : [];
  const selectedRate = rateOptions.find((o) => o.key === rateKey) ?? null;

  // Al elegir una tarifa (o cambiar noches/habitación con una tarifa activa),
  // el total = precio/noche × noches. "custom" no toca el valor escrito.
  useEffect(() => {
    if (rateKey === "custom" || !selectedRate) return;
    setTotalAmount(selectedRate.pricePerNight * (nights > 0 ? nights : 1));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rateKey, nights, roomNumber, rates]);

  // Imprime la reserva en el mismo formato del "FORMATO DE RESERVAS" del hotel:
  // un cuadro con una celda por cada campo. Lee los valores actuales del form.
  function handlePrint() {
    const formEl = formRef.current;
    if (!formEl) return;
    const fd = new FormData(formEl);
    const str = (k: string) => (fd.get(k)?.toString() ?? "").trim();
    const int = (k: string) => Number(fd.get(k) ?? 0) || 0;
    const esc = (s: string) =>
      s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const cop = (n: number) =>
      new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);

    const room = rooms.find((r) => r.id === str("roomId"));
    const ci = str("checkIn");
    const co = str("checkOut");
    const nn = nightsBetween(ci, co);
    const subtotal = int("totalAmount");
    const iva = applyIva ? Math.round(subtotal * 0.19) : 0;
    const total = subtotal + iva;
    const deposito = int("depositRequired");
    const anticipo = int("virtualAdvance");
    const saldo = Math.max(0, total - deposito - anticipo);
    const tarifaNoche = nn > 0 ? Math.round(subtotal / nn) : subtotal;
    const chKey = str("channel") as keyof typeof CHANNEL_META;
    const channelLabel = CHANNEL_META[chKey]?.label ?? str("channel");
    const hoy = new Date().toLocaleDateString("es-CO", { year: "numeric", month: "2-digit", day: "2-digit" });

    // Cada celda del cuadro: etiqueta arriba, valor debajo.
    const cell = (label: string, value: string, span = 1) =>
      `<td colspan="${span}"><div class="lbl">${esc(label)}</div><div class="val">${esc(value || "—")}</div></td>`;

    const html = `<!doctype html><html lang="es"><head><meta charset="utf-8">
<title>Formato de reserva${room ? " · Hab " + esc(room.name) : ""}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; color: #111; margin: 24px; }
  .hdr { text-align: center; margin-bottom: 14px; }
  .hdr h1 { font-size: 18px; letter-spacing: 1px; margin: 0; }
  .hdr h2 { font-size: 13px; font-weight: 600; margin: 2px 0 0; color: #444; }
  table { width: 100%; border-collapse: collapse; }
  td { border: 1px solid #333; padding: 6px 8px; vertical-align: top; width: 33.33%; }
  .lbl { font-size: 9px; text-transform: uppercase; letter-spacing: .4px; color: #555; }
  .val { font-size: 13px; font-weight: 600; min-height: 16px; margin-top: 2px; }
  .money .val { text-align: right; }
  .total .val { color: #000; font-size: 15px; }
  .firma td { height: 60px; }
  @media print { body { margin: 0; } @page { margin: 14mm; } }
</style></head><body>
<div class="hdr"><h1>HOTEL SANTA ALEJANDRÍA</h1><h2>FORMATO DE RESERVAS</h2></div>
<table>
  <tr>${cell("Fecha", hoy)}${cell("# Habitación", room?.name ?? "")}${cell("Tipo de Habitación", room?.type ?? "")}</tr>
  <tr>${cell("Nombre del Huésped", str("guestName"), 2)}${cell("N° de Pax", str("guestsCount"))}</tr>
  <tr>${cell("# Celular", str("guestPhone"))}${cell("Cantidad de Habitaciones", str("roomsCount"))}${cell("Up Grade", fd.get("upgrade") ? "Sí" : "No")}</tr>
  <tr>${cell("Tipo de plan", str("mealPlan"))}${cell("Hora de llegada", str("arrivalTime"))}${cell("Nacionalidad", str("nationality"))}</tr>
  <tr>${cell("Fecha In", ci)}${cell("Fecha Out", co)}${cell("Noches Extras", str("extraNights"))}</tr>
  <tr>${cell("Canal", channelLabel)}${cell("Empresa", str("company"), 2)}</tr>
  <tr>${cell("Observaciones", str("notes"), 3)}</tr>
  <tr>${cell("Tarifa x Noche", cop(tarifaNoche))}${cell("TC. No.", str("cardRef"))}${cell("Anticipo por cobro virtual", cop(anticipo))}</tr>
  <tr class="money">${cell("Valor de la Reserva sin IVA 19%", cop(subtotal))}${cell("IVA 19%", cop(iva))}<td class="total"><div class="lbl">Total Reserva Con IVA 19%</div><div class="val">${cop(total)}</div></td></tr>
  <tr class="money">${cell("Depósito", cop(deposito))}${cell("Saldo", cop(saldo), 2)}</tr>
  <tr class="firma">${cell("Firma", "")}</tr>
</table>
</body></html>`;

    const w = window.open("", "_blank", "width=820,height=1040");
    if (!w) {
      alert("Habilita las ventanas emergentes para imprimir el formato.");
      return;
    }
    w.document.write(html);
    w.document.close();
    w.focus();
    w.onload = () => w.print();
    // fallback si onload no dispara (documento ya cargado)
    setTimeout(() => {
      try { w.print(); } catch { /* noop */ }
    }, 300);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/30 p-4" onClick={onClose}>
      <div
        className="mt-8 w-full max-w-lg rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
          <h2 className="text-base font-bold text-slate-900">
            {mode === "create" ? "Nueva reserva" : "Editar reserva"}
          </h2>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrint}
              title="Imprimir en el formato del hotel"
              className="flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              🖨 Imprimir
            </button>
            <button onClick={onClose} className="rounded-md px-2 py-1 text-slate-400 hover:bg-slate-100">
              ✕
            </button>
          </div>
        </div>

        <form ref={formRef} action={formAction} className="grid grid-cols-2 gap-3 p-5">
          {mode === "edit" && <input type="hidden" name="id" defaultValue={initial.id} />}

          <label className="col-span-2 flex flex-col gap-1">
            <span className={labelCls}>Huésped *</span>
            <input name="guestName" required defaultValue={initial.guestName} className={field} />
          </label>

          <label className="flex flex-col gap-1">
            <span className={labelCls}>Teléfono</span>
            <input name="guestPhone" defaultValue={initial.guestPhone} className={field} />
          </label>
          <label className="flex flex-col gap-1">
            <span className={labelCls}>Email</span>
            <input name="guestEmail" type="email" defaultValue={initial.guestEmail} className={field} />
          </label>

          <label className="flex flex-col gap-1">
            <span className={labelCls}>Habitación *</span>
            <select
              name="roomId"
              value={roomId}
              onChange={(e) => {
                setRoomId(e.target.value);
                setRateKey("custom"); // la tarifa depende de la habitación
              }}
              className={field}
              required
            >
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} {r.type ? `· ${r.type}` : ""}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className={labelCls}>Canal</span>
            <select name="channel" defaultValue={initial.channel} className={field}>
              {BOOKING_CHANNELS.map((c) => (
                <option key={c} value={c}>
                  {CHANNEL_META[c].label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className={labelCls}>Check-in *</span>
            <input name="checkIn" type="date" required value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className={field} />
          </label>
          <label className="flex flex-col gap-1">
            <span className={labelCls}>Check-out *</span>
            <input name="checkOut" type="date" required value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className={field} />
          </label>

          <label className="flex flex-col gap-1">
            <span className={labelCls}>Personas</span>
            <input name="guestsCount" type="number" min={1} defaultValue={initial.guestsCount} className={field} />
          </label>
          <label className="flex flex-col gap-1">
            <span className={labelCls}>Depósito / abono requerido (COP)</span>
            <input
              name="depositRequired"
              type="number"
              min={0}
              step={1000}
              value={depositRequired}
              onChange={(e) => setDepositRequired(Number(e.target.value) || 0)}
              className={field}
            />
          </label>

          {/* Datos del FORMATO DE RESERVAS del hotel (recepción) */}
          <p className="col-span-2 -mb-1 mt-1 border-t border-slate-100 pt-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Datos del formato
          </p>

          <label className="flex flex-col gap-1">
            <span className={labelCls}>Cantidad de habitaciones</span>
            <input name="roomsCount" type="number" min={1} defaultValue={initial.roomsCount} className={field} />
          </label>
          <label className="flex flex-col gap-1">
            <span className={labelCls}>Noches extras</span>
            <input name="extraNights" type="number" min={0} defaultValue={initial.extraNights} className={field} />
          </label>

          <label className="flex flex-col gap-1">
            <span className={labelCls}>Tipo de plan</span>
            <input
              name="mealPlan"
              list="mealPlanOptions"
              defaultValue={initial.mealPlan}
              placeholder="Alojamiento, desayuno…"
              className={field}
            />
            <datalist id="mealPlanOptions">
              <option value="Solo alojamiento" />
              <option value="Alojamiento + desayuno" />
              <option value="Media pensión" />
              <option value="Todo incluido" />
            </datalist>
          </label>
          <label className="flex flex-col gap-1">
            <span className={labelCls}>Hora de llegada</span>
            <input name="arrivalTime" type="time" defaultValue={initial.arrivalTime} className={field} />
          </label>

          <label className="flex flex-col gap-1">
            <span className={labelCls}>Nacionalidad</span>
            <input name="nationality" defaultValue={initial.nationality} className={field} />
          </label>
          <label className="flex flex-col gap-1">
            <span className={labelCls}>Empresa</span>
            <input name="company" defaultValue={initial.company} className={field} />
          </label>

          <label className="flex flex-col gap-1">
            <span className={labelCls}>TC. No. (tarjeta)</span>
            <input name="cardRef" defaultValue={initial.cardRef} className={field} />
          </label>
          <label className="flex flex-col gap-1">
            <span className={labelCls}>Anticipo por cobro virtual (COP)</span>
            <input
              name="virtualAdvance"
              type="number"
              min={0}
              step={1000}
              value={virtualAdvance}
              onChange={(e) => setVirtualAdvance(Number(e.target.value) || 0)}
              className={field}
            />
          </label>

          <label className="col-span-2 flex items-center gap-2">
            <input
              name="upgrade"
              type="checkbox"
              defaultChecked={initial.upgrade}
              className="h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand-light"
            />
            <span className="text-sm text-slate-700">Up Grade (cambio de categoría)</span>
          </label>

          {/* Tarifa desde Directus (precios de la web): normal o por temporada */}
          <label className="col-span-2 flex flex-col gap-1">
            <span className={labelCls}>
              Tarifa (precios web{roomNumber ? ` · Hab ${roomNumber}` : ""})
            </span>
            <select value={rateKey} onChange={(e) => setRateKey(e.target.value)} className={field}>
              <option value="custom">Personalizado (escribir el valor)</option>
              {rateOptions.map((o) => (
                <option key={o.key} value={o.key}>
                  {o.label} — {formatCOP(o.pricePerNight)}/noche{o.vigente ? " · vigente" : ""}
                </option>
              ))}
            </select>
            {roomRate === null && rates.length > 0 && (
              <span className="text-[11px] text-slate-400">
                Esta habitación no tiene tarifa publicada en Directus; escribe el valor a mano.
              </span>
            )}
          </label>

          <label className="col-span-2 flex flex-col gap-1">
            <span className={labelCls}>Valor total (COP, sin IVA)</span>
            <input
              name="totalAmount"
              type="number"
              min={0}
              step={1000}
              value={totalAmount}
              onChange={(e) => {
                setTotalAmount(Number(e.target.value) || 0);
                setRateKey("custom"); // escribir a mano = tarifa personalizada
              }}
              className={field}
            />
            {rateKey !== "custom" && selectedRate && (
              <span className="text-[11px] text-slate-500">
                {formatCOP(selectedRate.pricePerNight)}/noche × {nights || 1}{" "}
                {(nights || 1) === 1 ? "noche" : "noches"} = {formatCOP(selectedRate.pricePerNight * (nights || 1))}
              </span>
            )}
          </label>

          {/* Switch: cobrar IVA o no (dinámico por reserva) */}
          <div className="col-span-2 flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-slate-700">Cobrar IVA (19%)</span>
              <span className="text-xs text-slate-500">
                {applyIva ? "Se suma el IVA al total y a los abonos" : "Reserva exenta de IVA"}
              </span>
            </div>
            <input type="hidden" name="applyIva" value={applyIva ? "true" : "false"} />
            <button
              type="button"
              role="switch"
              aria-checked={applyIva}
              aria-label="Cobrar IVA"
              onClick={() => setApplyIva((v) => !v)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${
                applyIva ? "bg-brand" : "bg-slate-300"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                  applyIva ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>

          {/* Resumen en vivo de lo que se cobrará */}
          <div className="col-span-2 flex flex-col gap-1 rounded-lg bg-slate-900/[0.03] px-3 py-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">
                {applyIva ? `Subtotal ${formatCOP(totalAmount)} + IVA ${formatCOP(ivaOf(totalAmount))}` : "Sin IVA"}
              </span>
              <span className="font-semibold text-slate-900">
                Total: {formatCOP(totalDue(totalAmount, applyIva))}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-slate-900/5 pt-1 text-xs text-slate-500">
              <span>
                − Depósito {formatCOP(depositRequired)}
                {virtualAdvance > 0 ? ` − Anticipo ${formatCOP(virtualAdvance)}` : ""}
              </span>
              <span className="font-semibold text-brand-dark">
                Saldo: {formatCOP(Math.max(0, totalDue(totalAmount, applyIva) - depositRequired - virtualAdvance))}
              </span>
            </div>
          </div>
          {mode === "edit" && (
            <label className="flex flex-col gap-1">
              <span className={labelCls}>Estado</span>
              <select name="reservationStatus" defaultValue={initial.reservationStatus} className={field}>
                {EDITABLE_RESERVATION_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {RESERVATION_STATUS_META[s].label}
                  </option>
                ))}
              </select>
            </label>
          )}

          <label className="col-span-2 flex flex-col gap-1">
            <span className={labelCls}>Notas</span>
            <textarea name="notes" rows={2} defaultValue={initial.notes} className={field} />
          </label>

          {state.error && (
            <p className="col-span-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {state.error}
            </p>
          )}

          <div className="col-span-2 mt-1 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={pending}
              className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
            >
              {pending ? "Guardando…" : mode === "create" ? "Crear reserva" : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
