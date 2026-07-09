"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import {
  CHANNEL_META,
  RESERVATION_STATUS_META,
  PAYMENT_STATUS_META,
} from "@/lib/domain";
import { formatCOP, formatDate } from "@/lib/format";
import {
  cancelReservationAction,
  registerManualPaymentAction,
} from "@/lib/actions/reservations";
import { ReservationForm, type ReservationInitial } from "./ReservationForm";
import type { ForecastData, ForecastReservation } from "@/lib/forecast";

const LABEL_W = 220;
const DAY_MIN = 38;
const ROW_H = 46;
const pad = (n: number) => String(n).padStart(2, "0");

function isoAddDays(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

export function ForecastGrid({
  data,
  hotelName,
  canEdit,
  canPay,
}: {
  data: ForecastData;
  hotelName: string;
  canEdit: boolean;
  canPay: boolean;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<ForecastReservation | null>(null);
  const [form, setForm] = useState<{ mode: "create" | "edit"; initial: ReservationInitial } | null>(null);
  const [isPending, startTransition] = useTransition();

  const roomName = useMemo(() => {
    const m = new Map<string, string>();
    for (const r of data.rooms) m.set(r.id, r.name);
    return m;
  }, [data.rooms]);

  const gridCols = `${LABEL_W}px repeat(${data.daysInMonth}, minmax(${DAY_MIN}px, 1fr))`;
  const dateStr = (day: number) => `${data.year}-${pad(data.month)}-${pad(day)}`;

  function openCreate(prefill?: { roomId?: string; checkIn?: string }) {
    const checkIn = prefill?.checkIn ?? "";
    setSelected(null);
    setForm({
      mode: "create",
      initial: {
        roomId: prefill?.roomId ?? data.rooms[0]?.id ?? "",
        guestName: "",
        guestPhone: "",
        guestEmail: "",
        channel: "DIRECT",
        checkIn,
        checkOut: checkIn ? isoAddDays(checkIn, 1) : "",
        guestsCount: 2,
        totalAmount: 0,
        depositRequired: 0,
        notes: "",
      },
    });
  }

  function openEdit(r: ForecastReservation) {
    setSelected(null);
    setForm({
      mode: "edit",
      initial: {
        id: r.id,
        roomId: r.roomId,
        guestName: r.guestName,
        guestPhone: r.guestPhone ?? "",
        guestEmail: r.guestEmail ?? "",
        channel: r.channel,
        checkIn: r.checkIn.slice(0, 10),
        checkOut: r.checkOut.slice(0, 10),
        guestsCount: r.guestsCount,
        totalAmount: r.totalAmount,
        depositRequired: r.depositRequired,
        notes: r.notes ?? "",
        reservationStatus: r.reservationStatus,
      },
    });
  }

  function onSuccess() {
    setForm(null);
    router.refresh();
  }

  function handleCancel(id: string) {
    if (!confirm("¿Cancelar esta reserva? La habitación quedará libre.")) return;
    startTransition(async () => {
      const res = await cancelReservationAction(id);
      if (res.ok) {
        setSelected(null);
        router.refresh();
      } else {
        alert(res.error);
      }
    });
  }

  function handlePay(reservationId: string, amount: number, method: string) {
    startTransition(async () => {
      const res = await registerManualPaymentAction({ reservationId, amount, method });
      if (res.ok) {
        setSelected(null);
        router.refresh();
      } else {
        alert(res.error);
      }
    });
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2">
        <p className="text-sm font-semibold text-slate-700">
          Ocupación · {data.monthLabel}
        </p>
        {canEdit && (
          <button
            onClick={() => openCreate()}
            className="rounded-lg bg-brand px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-brand-dark"
          >
            + Crear reserva
          </button>
        )}
      </div>

      <div className="overflow-x-auto thin-scroll">
        <div style={{ minWidth: LABEL_W + data.daysInMonth * DAY_MIN }}>
          {/* Encabezado de días */}
          <div className="sticky top-0 z-20 grid border-b border-slate-200 bg-slate-50" style={{ gridTemplateColumns: gridCols }}>
            <div className="sticky left-0 z-30 flex items-center border-r border-slate-200 bg-slate-50 px-3 text-xs font-semibold uppercase tracking-wide text-slate-500" style={{ gridColumn: 1, height: 40 }}>
              Habitación
            </div>
            {data.days.map((d) => (
              <div key={d.day} className={cn("flex flex-col items-center justify-center border-r border-slate-100 text-center leading-none", d.isWeekend && "bg-slate-100", d.isToday && "bg-brand-light")} style={{ height: 40 }}>
                <span className={cn("text-xs font-bold", d.isToday ? "text-brand-dark" : "text-slate-700")}>{d.day}</span>
                <span className="text-[10px] text-slate-400">{d.weekday}</span>
              </div>
            ))}
          </div>

          {/* Filas por habitación */}
          {data.rooms.map((room, idx) => {
            const reservations = data.reservationsByRoom[room.id] ?? [];
            const blocks = data.blocksByRoom[room.id] ?? [];
            return (
              <div key={room.id} className="grid border-b border-slate-100" style={{ gridTemplateColumns: gridCols, height: ROW_H }}>
                <div className={cn("sticky left-0 z-10 flex flex-col justify-center border-r border-slate-200 px-3", idx % 2 ? "bg-slate-50" : "bg-white")} style={{ gridColumn: 1, gridRow: 1 }}>
                  <span className="text-sm font-semibold text-slate-800">{room.name}</span>
                  {room.type && <span className="truncate text-[11px] text-slate-400">{room.type}</span>}
                </div>

                {data.days.map((d) =>
                  canEdit ? (
                    <button
                      key={d.day}
                      onClick={() => openCreate({ roomId: room.id, checkIn: dateStr(d.day) })}
                      title={`Crear reserva · Hab ${room.name} · ${d.day}`}
                      className={cn("border-r border-slate-100 transition hover:bg-brand-light/60", d.isWeekend && "bg-slate-50", d.isToday && "bg-brand-light")}
                      style={{ gridColumn: d.day + 1, gridRow: 1 }}
                    />
                  ) : (
                    <div key={d.day} className={cn("border-r border-slate-100", d.isWeekend && "bg-slate-50", d.isToday && "bg-brand-light")} style={{ gridColumn: d.day + 1, gridRow: 1 }} />
                  ),
                )}

                {blocks.map((b) => (
                  <div key={b.id} title={b.reason ?? "Bloqueo"} className="z-10 m-[3px] flex items-center justify-center overflow-hidden rounded-md text-[10px] font-semibold text-slate-500" style={{ gridColumn: `${b.startCol} / ${b.endCol}`, gridRow: 1, backgroundColor: "#e2e8f0", backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(100,116,139,.18) 5px, rgba(100,116,139,.18) 10px)" }}>
                    🚧
                  </div>
                ))}

                {reservations.map((r) => {
                  const meta = CHANNEL_META[r.channel];
                  const isNoShow = r.reservationStatus === "NO_SHOW";
                  const bg = isNoShow ? RESERVATION_STATUS_META.NO_SHOW.color : meta.color;
                  const fg = isNoShow ? "#ffffff" : meta.textOnColor;
                  return (
                    <button
                      key={r.id}
                      onClick={() => setSelected(r)}
                      title={`${r.guestName} · ${meta.label} · ${formatDate(r.checkIn)} → ${formatDate(r.checkOut)} · ${formatCOP(r.totalAmount)}`}
                      className="z-20 m-[3px] flex items-center overflow-hidden px-2 text-left text-xs font-semibold shadow-sm transition hover:brightness-95"
                      style={{
                        gridColumn: `${r.startCol} / ${r.endCol}`,
                        gridRow: 1,
                        backgroundColor: bg,
                        color: fg,
                        borderTopLeftRadius: r.continuesLeft ? 0 : 6,
                        borderBottomLeftRadius: r.continuesLeft ? 0 : 6,
                        borderTopRightRadius: r.continuesRight ? 0 : 6,
                        borderBottomRightRadius: r.continuesRight ? 0 : 6,
                      }}
                    >
                      <span className="truncate">
                        {r.continuesLeft && "‹ "}
                        {isNoShow ? "🚫 " : ""}
                        {r.guestName}
                      </span>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {selected && (
        <ReservationDrawer
          reservation={selected}
          roomName={roomName.get(selected.roomId) ?? ""}
          hotelName={hotelName}
          canEdit={canEdit}
          canPay={canPay}
          busy={isPending}
          onClose={() => setSelected(null)}
          onEdit={() => openEdit(selected)}
          onCancel={() => handleCancel(selected.id)}
          onPay={(amount, method) => handlePay(selected.id, amount, method)}
        />
      )}

      {form && (
        <ReservationForm
          mode={form.mode}
          rooms={data.rooms}
          initial={form.initial}
          onClose={() => setForm(null)}
          onSuccess={onSuccess}
        />
      )}
    </div>
  );
}

function ReservationDrawer({
  reservation: r,
  roomName,
  hotelName,
  canEdit,
  canPay,
  busy,
  onClose,
  onEdit,
  onCancel,
  onPay,
}: {
  reservation: ForecastReservation;
  roomName: string;
  hotelName: string;
  canEdit: boolean;
  canPay: boolean;
  busy: boolean;
  onClose: () => void;
  onEdit: () => void;
  onCancel: () => void;
  onPay: (amount: number, method: string) => void;
}) {
  const [copied, setCopied] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [payAmount, setPayAmount] = useState(r.balanceAmount || r.depositRequired || 0);
  const [payMethod, setPayMethod] = useState("efectivo");
  const channel = CHANNEL_META[r.channel];
  const resStatus = RESERVATION_STATUS_META[r.reservationStatus];
  const payStatus = PAYMENT_STATUS_META[r.paymentStatus];

  function copyWhatsapp() {
    const msg = [
      `Hola ${r.guestName}, tu reserva en ${hotelName} está preconfirmada.`,
      ``,
      `Fechas: ${formatDate(r.checkIn)} al ${formatDate(r.checkOut)} (${r.nights} noches)`,
      `Habitación: ${roomName}`,
      `Valor total: ${formatCOP(r.totalAmount)}`,
      r.depositRequired > 0 ? `Abono requerido: ${formatCOP(r.depositRequired)}` : ``,
      r.balanceAmount > 0 ? `Saldo pendiente: ${formatCOP(r.balanceAmount)}` : ``,
    ].filter(Boolean).join("\n");
    navigator.clipboard.writeText(msg).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  return (
    <div className="fixed inset-0 z-40" onClick={onClose}>
      <div className="absolute inset-0 bg-slate-900/20" />
      <div className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col overflow-y-auto bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between px-5 py-4 text-white" style={{ backgroundColor: channel.color }}>
          <div>
            <p className="text-lg font-bold">{r.guestName}</p>
            <p className="text-sm opacity-90">{channel.label} · Habitación {roomName}</p>
          </div>
          <button onClick={onClose} className="rounded-md px-2 py-1 text-sm hover:bg-white/20">✕</button>
        </div>

        <div className="flex flex-col gap-4 p-5">
          <div className="flex flex-wrap gap-2">
            <Badge label={resStatus.label} color={resStatus.color} />
            <Badge label={payStatus.label} color={payStatus.color} />
          </div>

          <Section title="Estadía">
            <Row k="Check-in" v={formatDate(r.checkIn)} />
            <Row k="Check-out" v={formatDate(r.checkOut)} />
            <Row k="Noches" v={String(r.nights)} />
            <Row k="Personas" v={String(r.guestsCount)} />
          </Section>

          <Section title="Contacto">
            <Row k="Teléfono" v={r.guestPhone ?? "—"} />
            <Row k="Email" v={r.guestEmail ?? "—"} />
          </Section>

          <Section title="Pagos">
            <Row k="Valor total" v={formatCOP(r.totalAmount)} />
            <Row k="Abono requerido" v={formatCOP(r.depositRequired)} />
            <Row k="Pagado" v={formatCOP(r.paidAmount)} />
            <Row k="Saldo" v={formatCOP(r.balanceAmount)} strong />
          </Section>

          {r.notes && (
            <Section title="Notas">
              <p className="text-sm text-slate-600">{r.notes}</p>
            </Section>
          )}

          {canPay && payOpen && (
            <div className="rounded-lg border border-brand-light bg-brand-light/50 p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-dark">Registrar pago</p>
              <div className="flex gap-2">
                <input type="number" min={1} value={payAmount} onChange={(e) => setPayAmount(Number(e.target.value))} className="w-32 rounded-lg border border-slate-300 px-2 py-1.5 text-sm" />
                <select value={payMethod} onChange={(e) => setPayMethod(e.target.value)} className="flex-1 rounded-lg border border-slate-300 px-2 py-1.5 text-sm">
                  <option value="efectivo">Efectivo</option>
                  <option value="transferencia">Transferencia</option>
                  <option value="datafono">Datáfono</option>
                  <option value="bold">Bold</option>
                </select>
              </div>
              <div className="mt-2 flex justify-end gap-2">
                <button onClick={() => setPayOpen(false)} className="rounded-md px-3 py-1.5 text-sm text-slate-600 hover:bg-white">Cerrar</button>
                <button disabled={busy} onClick={() => onPay(payAmount, payMethod)} className="rounded-md bg-brand px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60">
                  {busy ? "Guardando…" : "Confirmar pago"}
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <button onClick={copyWhatsapp} className="rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark">
              {copied ? "✓ Mensaje copiado" : "Copiar mensaje WhatsApp"}
            </button>
            <div className="flex gap-2">
              {canEdit && (
                <button onClick={onEdit} className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                  Editar
                </button>
              )}
              {canPay && !payOpen && (
                <button onClick={() => setPayOpen(true)} className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                  Registrar pago
                </button>
              )}
            </div>
            {canEdit && r.reservationStatus !== "CANCELLED" && (
              <button disabled={busy} onClick={onCancel} className="rounded-lg px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60">
                Cancelar reserva
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">{title}</p>
      <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-3">{children}</div>
    </div>
  );
}

function Row({ k, v, strong }: { k: string; v: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between py-0.5 text-sm">
      <span className="text-slate-500">{k}</span>
      <span className={strong ? "font-bold text-slate-900" : "text-slate-800"}>{v}</span>
    </div>
  );
}

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span className="rounded-full px-2.5 py-0.5 text-xs font-semibold text-white" style={{ backgroundColor: color }}>
      {label}
    </span>
  );
}
