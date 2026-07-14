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
  directusSlug: string | null;
  capacity: number;
  sortOrder: number;
  active: boolean;
  reservations: number;
};

/** Tipo comercial publicado en la web (Directus). */
type WebType = { slug: string; typeName: string; pmsRooms: string[] };

const initialState: RoomActionState = { ok: false, error: null };

export function RoomsManager({ rooms, canManage }: { rooms: RoomRow[]; canManage: boolean }) {
  const router = useRouter();
  const [editing, setEditing] = useState<RoomRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Tipos de habitación de la web (Directus) para vincular cada habitación del PMS.
  const [webTypes, setWebTypes] = useState<WebType[]>([]);
  useEffect(() => {
    let alive = true;
    fetch("/api/rates")
      .then((r) => r.json())
      .then((d) => {
        if (alive && d?.ok && Array.isArray(d.rates)) {
          setWebTypes(
            d.rates.map((x: { slug: string; typeName: string; pmsRooms?: string[] }) => ({
              slug: x.slug,
              typeName: x.typeName,
              pmsRooms: Array.isArray(x.pmsRooms) ? x.pmsRooms : [],
            })),
          );
        }
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const webName = (slug: string | null) =>
    slug ? webTypes.find((t) => t.slug === slug)?.typeName ?? slug : null;

  function toggle(id: string) {
    startTransition(async () => {
      const r = await toggleRoomActiveAction(id);
      if (r.ok) router.refresh();
      else alert(r.error);
    });
  }

  // --- Consistencia web ↔ Directus ↔ PMS (solo cuando Directus ya respondió) ---
  const ratesLoaded = webTypes.length > 0;
  const activeLinkedSlugs = new Set(
    rooms.filter((r) => r.active && r.directusSlug).map((r) => r.directusSlug as string),
  );
  const publishedSlugs = new Set(webTypes.map((t) => t.slug));
  // #1 Tipo web sin ninguna habitación activa vinculada → se ve en la web pero nunca hay cupo.
  const orphanTypes = ratesLoaded ? webTypes.filter((t) => !activeLinkedSlugs.has(t.slug)) : [];
  // #3 Habitación con un vínculo que ya no existe en Directus (renombrado/despublicado).
  const danglingRooms = ratesLoaded
    ? rooms.filter((r) => r.directusSlug && !publishedSlugs.has(r.directusSlug))
    : [];
  // #2 El mapeo pms_rooms de Directus contradice el vínculo autoritativo del PMS.
  const directusExpects = new Map<string, string>();
  webTypes.forEach((t) => t.pmsRooms.forEach((n) => directusExpects.set(n, t.slug)));
  const driftRooms = ratesLoaded
    ? rooms.filter((r) => {
        const exp = directusExpects.get(r.name);
        return exp && exp !== (r.directusSlug ?? "");
      })
    : [];
  const hasIssues = orphanTypes.length > 0 || danglingRooms.length > 0 || driftRooms.length > 0;

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

      {hasIssues && (
        <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-amber-900">
          <p className="mb-1.5 text-sm font-semibold">
            <i className="fa-solid fa-triangle-exclamation mr-1.5" aria-hidden />
            Revisar vínculos web ↔ PMS
          </p>
          <ul className="ml-1 flex flex-col gap-1.5 text-[13px] leading-snug">
            {orphanTypes.length > 0 && (
              <li>
                <span className="font-medium">Tipos de la web sin habitación asignada:</span>{" "}
                {orphanTypes.map((t) => t.typeName).join(", ")}. Aparecen en la web pero nunca muestran
                disponibilidad — vincula al menos una habitación <span className="font-medium">activa</span>.
              </li>
            )}
            {danglingRooms.length > 0 && (
              <li>
                <span className="font-medium">Habitaciones con vínculo inexistente en la web:</span>{" "}
                {danglingRooms.map((r) => `${r.name} (${r.directusSlug})`).join(", ")}. Ese tipo ya no existe o
                está despublicado en Directus — reasígnalas.
              </li>
            )}
            {driftRooms.length > 0 && (
              <li>
                <span className="font-medium">Vínculo distinto al de Directus (pms_rooms):</span>{" "}
                {driftRooms
                  .map(
                    (r) =>
                      `${r.name} → PMS: ${r.directusSlug ? webName(r.directusSlug) : "sin vincular"} / Directus: ${directusExpects.get(r.name)}`,
                  )
                  .join("; ")}
                . Manda el del PMS; actualiza <code>pms_rooms</code> en Directus para no confundir.
              </li>
            )}
          </ul>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-4 py-2.5">Hab.</th>
              <th className="px-4 py-2.5">Tipo</th>
              <th className="px-4 py-2.5">En la web</th>
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
                <td className="px-4 py-2.5">
                  {r.directusSlug ? (
                    <span className="rounded-full bg-brand-light px-2 py-0.5 text-xs font-medium text-brand-dark">
                      {webName(r.directusSlug)}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-300">Sin vincular</span>
                  )}
                </td>
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
        <RoomForm mode="create" webTypes={webTypes} onClose={() => setCreating(false)} onSuccess={() => { setCreating(false); router.refresh(); }} />
      )}
      {editing && (
        <RoomForm mode="edit" room={editing} webTypes={webTypes} onClose={() => setEditing(null)} onSuccess={() => { setEditing(null); router.refresh(); }} />
      )}
    </div>
  );
}

function RoomForm({
  mode,
  room,
  webTypes,
  onClose,
  onSuccess,
}: {
  mode: "create" | "edit";
  room?: RoomRow;
  webTypes: WebType[];
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

          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-600">Habitación en la web</span>
            <select name="directusSlug" defaultValue={room?.directusSlug ?? ""} className={field}>
              <option value="">— Sin vincular —</option>
              {webTypes.map((t) => (
                <option key={t.slug} value={t.slug}>
                  {t.typeName}
                </option>
              ))}
            </select>
            <span className="text-[11px] text-slate-400">
              Las reservas de este tipo en la web entrarán a esta habitación.
            </span>
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
