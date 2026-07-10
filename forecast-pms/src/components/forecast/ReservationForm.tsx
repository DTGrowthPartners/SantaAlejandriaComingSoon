"use client";

import { useActionState, useEffect } from "react";
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
} from "@/lib/domain";

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
  depositRequired: number;
  notes: string;
  reservationStatus?: string;
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
  rooms: { id: string; name: string; type: string | null }[];
  initial: ReservationInitial;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const action = mode === "create" ? createReservationAction : updateReservationAction;
  const [state, formAction, pending] = useActionState(action, initialState);

  useEffect(() => {
    if (state.ok) onSuccess();
  }, [state.ok, onSuccess]);

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
          <button onClick={onClose} className="rounded-md px-2 py-1 text-slate-400 hover:bg-slate-100">
            ✕
          </button>
        </div>

        <form action={formAction} className="grid grid-cols-2 gap-3 p-5">
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
            <select name="roomId" defaultValue={initial.roomId} className={field} required>
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
            <input name="checkIn" type="date" required defaultValue={initial.checkIn} className={field} />
          </label>
          <label className="flex flex-col gap-1">
            <span className={labelCls}>Check-out *</span>
            <input name="checkOut" type="date" required defaultValue={initial.checkOut} className={field} />
          </label>

          <label className="flex flex-col gap-1">
            <span className={labelCls}>Personas</span>
            <input name="guestsCount" type="number" min={1} defaultValue={initial.guestsCount} className={field} />
          </label>
          <label className="flex flex-col gap-1">
            <span className={labelCls}>Valor total (COP, sin IVA)</span>
            <input name="totalAmount" type="number" min={0} step={1000} defaultValue={initial.totalAmount} className={field} />
          </label>

          <label className="flex flex-col gap-1">
            <span className={labelCls}>Abono requerido (COP)</span>
            <input name="depositRequired" type="number" min={0} step={1000} defaultValue={initial.depositRequired} className={field} />
          </label>
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
