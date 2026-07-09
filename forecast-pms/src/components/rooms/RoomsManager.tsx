"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createRoomAction,
  updateRoomAction,
  toggleRoomActiveAction,
  type RoomActionState,
} from "@/lib/actions/rooms";

export type RoomRow = {
  id: string;
  name: string;
  type: string | null;
  capacity: number;
  sortOrder: number;
  active: boolean;
  reservations: number;
};

const initialState: RoomActionState = { ok: false, error: null };

export function RoomsManager({ rooms, canManage }: { rooms: RoomRow[]; canManage: boolean }) {
  const router = useRouter();
  const [editing, setEditing] = useState<RoomRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [isPending, startTransition] = useTransition();

  function toggle(id: string) {
    startTransition(async () => {
      const r = await toggleRoomActiveAction(id);
      if (r.ok) router.refresh();
      else alert(r.error);
    });
  }

  return (
    <div className="mx-auto w-full max-w-4xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-brand-dark">Habitaciones</h1>
          <p className="text-sm text-slate-500">{rooms.length} habitaciones · {rooms.filter((r) => r.active).length} activas</p>
        </div>
        {canManage && (
          <button onClick={() => setCreating(true)} className="rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-white hover:bg-brand-dark">
            <i className="fa-solid fa-plus mr-1.5" aria-hidden />
            Agregar
          </button>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-4 py-2.5">Hab.</th>
              <th className="px-4 py-2.5">Tipo</th>
              <th className="px-4 py-2.5 text-center">Cap.</th>
              <th className="px-4 py-2.5 text-center">Orden</th>
              <th className="px-4 py-2.5 text-center">Reservas</th>
              <th className="px-4 py-2.5 text-center">Estado</th>
              {canManage && <th className="px-4 py-2.5" />}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rooms.map((r) => (
              <tr key={r.id} className={r.active ? "" : "bg-slate-50/60 text-slate-400"}>
                <td className="px-4 py-2.5 font-semibold text-slate-800">{r.name}</td>
                <td className="px-4 py-2.5 text-slate-600">{r.type ?? "—"}</td>
                <td className="px-4 py-2.5 text-center">{r.capacity}</td>
                <td className="px-4 py-2.5 text-center text-slate-500">{r.sortOrder}</td>
                <td className="px-4 py-2.5 text-center text-slate-500">{r.reservations}</td>
                <td className="px-4 py-2.5 text-center">
                  {canManage ? (
                    <button
                      onClick={() => toggle(r.id)}
                      disabled={isPending}
                      className={
                        "rounded-full px-2.5 py-0.5 text-xs font-semibold " +
                        (r.active ? "bg-brand-light text-brand-dark" : "bg-slate-200 text-slate-500")
                      }
                    >
                      {r.active ? "Activa" : "Inactiva"}
                    </button>
                  ) : (
                    <span className="text-xs">{r.active ? "Activa" : "Inactiva"}</span>
                  )}
                </td>
                {canManage && (
                  <td className="px-4 py-2.5 text-right">
                    <button onClick={() => setEditing(r)} className="text-slate-400 hover:text-brand">
                      <i className="fa-solid fa-pen" aria-hidden />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {creating && (
        <RoomForm mode="create" onClose={() => setCreating(false)} onSuccess={() => { setCreating(false); router.refresh(); }} />
      )}
      {editing && (
        <RoomForm mode="edit" room={editing} onClose={() => setEditing(null)} onSuccess={() => { setEditing(null); router.refresh(); }} />
      )}
    </div>
  );
}

function RoomForm({
  mode,
  room,
  onClose,
  onSuccess,
}: {
  mode: "create" | "edit";
  room?: RoomRow;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const action = mode === "create" ? createRoomAction : updateRoomAction;
  const [state, formAction, pending] = useActionState(action, initialState);
  useEffect(() => {
    if (state.ok) onSuccess();
  }, [state.ok, onSuccess]);

  const field = "rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand-light";

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/30 p-4" onClick={onClose}>
      <div className="mt-16 w-full max-w-sm rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="border-b border-slate-100 px-5 py-3.5">
          <h2 className="text-base font-bold text-slate-900">{mode === "create" ? "Nueva habitación" : "Editar habitación"}</h2>
        </div>
        <form action={formAction} className="flex flex-col gap-3 p-5">
          {mode === "edit" && <input type="hidden" name="id" defaultValue={room?.id} />}
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-600">Número / nombre *</span>
            <input name="name" required defaultValue={room?.name} className={field} placeholder="101" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-600">Tipo</span>
            <input name="type" defaultValue={room?.type ?? ""} className={field} placeholder="Doble Estándar" />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-slate-600">Capacidad</span>
              <input name="capacity" type="number" min={1} defaultValue={room?.capacity ?? 2} className={field} />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-slate-600">Orden</span>
              <input name="sortOrder" type="number" min={0} defaultValue={room?.sortOrder ?? 0} className={field} />
            </label>
          </div>
          {state.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}
          <div className="mt-1 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">Cancelar</button>
            <button type="submit" disabled={pending} className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60">
              {pending ? "Guardando…" : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
