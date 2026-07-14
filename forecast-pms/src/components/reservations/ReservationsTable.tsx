"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CHANNEL_META,
  RESERVATION_STATUS_META,
  EDITABLE_RESERVATION_STATUSES,
  totalDue,
} from "@/lib/domain";
import { formatCOP, formatDate } from "@/lib/format";
import { cancelReservationAction } from "@/lib/actions/reservations";
import { ReservationForm, type ReservationInitial } from "@/components/forecast/ReservationForm";
import { DepositLinkButton } from "@/components/payments/DepositLink";
import type { BookingChannel, ReservationStatus, PaymentStatus } from "@/generated/prisma/client";

export type ReservationRow = {
  id: string;
  number: number;
  roomId: string;
  roomName: string;
  guestName: string;
  guestPhone: string | null;
  guestEmail: string | null;
  channel: BookingChannel;
  reservationStatus: ReservationStatus;
  paymentStatus: PaymentStatus;
  checkIn: string;
  checkOut: string;
  nights: number;
  guestsCount: number;
  totalAmount: number;
  applyIva: boolean;
  depositRequired: number;
  paidAmount: number;
  balanceAmount: number;
  notes: string | null;
  roomsCount: number;
  upgrade: boolean;
  mealPlan: string | null;
  arrivalTime: string | null;
  nationality: string | null;
  extraNights: number;
  company: string | null;
  cardRef: string | null;
  virtualAdvance: number;
};

export function ReservationsTable({
  reservations,
  rooms,
  canEdit,
  canPay = false,
}: {
  reservations: ReservationRow[];
  rooms: { id: string; name: string; type: string | null; directusSlug: string | null }[];
  canEdit: boolean;
  canPay?: boolean;
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("ALL");
  const [editing, setEditing] = useState<ReservationRow | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return reservations.filter((r) => {
      if (status !== "ALL" && r.reservationStatus !== status) return false;
      if (query && !`${r.guestName} ${r.roomName}`.toLowerCase().includes(query)) return false;
      return true;
    });
  }, [reservations, q, status]);

  function toInitial(r: ReservationRow): ReservationInitial {
    return {
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
      applyIva: r.applyIva,
      depositRequired: r.depositRequired,
      notes: r.notes ?? "",
      reservationStatus: r.reservationStatus,
      roomsCount: r.roomsCount,
      upgrade: r.upgrade,
      mealPlan: r.mealPlan ?? "",
      arrivalTime: r.arrivalTime ?? "",
      nationality: r.nationality ?? "",
      extraNights: r.extraNights,
      company: r.company ?? "",
      cardRef: r.cardRef ?? "",
      virtualAdvance: r.virtualAdvance,
    };
  }

  function cancel(id: string) {
    if (!confirm("¿Cancelar esta reserva?")) return;
    startTransition(async () => {
      const res = await cancelReservationAction(id);
      if (res.ok) router.refresh();
      else alert(res.error);
    });
  }

  return (
    <div className="mx-auto w-full max-w-6xl p-6">
      <div className="mb-4">
        <h1 className="font-serif text-2xl font-bold text-brand-dark">Reservas</h1>
        <p className="text-sm text-slate-500">{filtered.length} de {reservations.length} reservas</p>
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar huésped o habitación…"
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand"
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
          <option value="ALL">Todos los estados</option>
          {EDITABLE_RESERVATION_STATUSES.map((s) => (
            <option key={s} value={s}>{RESERVATION_STATUS_META[s].label}</option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white thin-scroll">
        <table className="w-full min-w-[820px] text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-3 py-2.5">Huésped</th>
              <th className="px-3 py-2.5">Hab.</th>
              <th className="px-3 py-2.5">Entrada</th>
              <th className="px-3 py-2.5">Salida</th>
              <th className="px-3 py-2.5 text-center">Canal</th>
              <th className="px-3 py-2.5 text-center">Estado</th>
              <th className="px-3 py-2.5 text-right">Total</th>
              <th className="px-3 py-2.5 text-right">Saldo</th>
              {(canEdit || canPay) && <th className="px-3 py-2.5" />}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((r) => {
              const ch = CHANNEL_META[r.channel];
              const st = RESERVATION_STATUS_META[r.reservationStatus];
              return (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="px-3 py-2.5 font-medium text-slate-800">
                    <span className="mr-1 text-slate-400">{r.number}-</span>
                    {r.guestName}
                  </td>
                  <td className="px-3 py-2.5 text-slate-600">{r.roomName}</td>
                  <td className="px-3 py-2.5 text-slate-600">{formatDate(r.checkIn)}</td>
                  <td className="px-3 py-2.5 text-slate-600">{formatDate(r.checkOut)}</td>
                  <td className="px-3 py-2.5 text-center">
                    <span className="rounded-full px-2 py-0.5 text-xs font-semibold text-white" style={{ backgroundColor: ch.color }}>{ch.short}</span>
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <span className="rounded-full px-2 py-0.5 text-xs font-semibold text-white" style={{ backgroundColor: st.color }}>{st.label}</span>
                  </td>
                  <td className="px-3 py-2.5 text-right text-slate-700">
                    {formatCOP(totalDue(r.totalAmount, r.applyIva))}
                    {!r.applyIva && <span className="ml-1 text-[10px] text-slate-400">sin IVA</span>}
                  </td>
                  <td className="px-3 py-2.5 text-right font-semibold text-slate-900">{formatCOP(r.balanceAmount)}</td>
                  {(canEdit || canPay) && (
                    <td className="whitespace-nowrap px-3 py-2.5 text-right">
                      {canPay && r.reservationStatus !== "CANCELLED" && (
                        <span className="mr-3 inline-block">
                          <DepositLinkButton
                            reservationId={r.id}
                            number={r.number}
                            guestName={r.guestName}
                            balanceAmount={r.balanceAmount}
                            variant="icon"
                          />
                        </span>
                      )}
                      {canEdit && (
                        <button onClick={() => setEditing(r)} className="mr-3 text-slate-400 hover:text-brand" title="Editar">
                          <i className="fa-solid fa-pen" aria-hidden />
                        </button>
                      )}
                      {canEdit && r.reservationStatus !== "CANCELLED" && (
                        <button onClick={() => cancel(r.id)} disabled={isPending} className="text-slate-400 hover:text-red-600" title="Cancelar">
                          <i className="fa-solid fa-ban" aria-hidden />
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={9} className="px-3 py-10 text-center text-slate-400">Sin reservas que coincidan.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <ReservationForm
          mode="edit"
          rooms={rooms}
          initial={toInitial(editing)}
          onClose={() => setEditing(null)}
          onSuccess={() => { setEditing(null); router.refresh(); }}
        />
      )}
    </div>
  );
}
