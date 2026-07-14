"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { dismissNotification, dismissAllNotifications } from "@/lib/actions/notifications";

type Notif = {
  id: string;
  kind: string;
  title: string;
  message: string;
  reservationNumber: number | null;
  createdAt: string;
};

const ICON: Record<string, string> = {
  reservation: "fa-calendar-check",
  move: "fa-right-left",
  payment: "fa-circle-dollar-to-slot",
};

function timeAgo(iso: string): string {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "ahora";
  if (s < 3600) return `hace ${Math.floor(s / 60)} min`;
  if (s < 86400) return `hace ${Math.floor(s / 3600)} h`;
  return `hace ${Math.floor(s / 86400)} d`;
}

export function NotificationCenter() {
  const [items, setItems] = useState<Notif[]>([]);
  const [open, setOpen] = useState(false);
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const seen = useRef<Set<string>>(new Set());
  const first = useRef(true);
  const router = useRouter();

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const res = await fetch("/api/notifications", { cache: "no-store" });
        if (!res.ok || !alive) return;
        const d = await res.json();
        const list: Notif[] = d.notifications ?? [];
        const fresh = list.filter((n) => !seen.current.has(n.id)).map((n) => n.id);
        list.forEach((n) => seen.current.add(n.id));
        if (!first.current && fresh.length) {
          setNewIds((prev) => new Set([...prev, ...fresh]));
          // Refresca los datos de servidor (grid del forecast, listas, etc.)
          // para que la reserva nueva/movida aparezca sin recargar la página.
          router.refresh();
        }
        first.current = false;
        setItems(list);
      } catch {
        /* red intermitente: reintenta en el próximo intervalo */
      }
    }

    load();

    // Tiempo real: el servidor empuja "changed" en cuanto entra/mueve una reserva.
    const es = new EventSource("/api/notifications/stream");
    es.onmessage = () => {
      if (alive) load();
    };
    // EventSource reintenta la conexión solo ante errores; no hace falta más.

    // Respaldo: polling lento + recarga al volver a la pestaña.
    const iv = setInterval(load, 30000);
    const onVisible = () => {
      if (document.visibilityState === "visible") load();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", load);

    return () => {
      alive = false;
      es.close();
      clearInterval(iv);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", load);
    };
  }, []);

  // Al abrir la bandeja, deja de resaltar las "nuevas".
  useEffect(() => {
    if (open) setNewIds(new Set());
  }, [open]);

  // Cerrar con Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  async function remove(id: string) {
    setItems((i) => i.filter((x) => x.id !== id));
    seen.current.delete(id);
    await dismissNotification(id);
  }
  async function clearAll() {
    setItems([]);
    setOpen(false);
    await dismissAllNotifications();
  }

  const count = items.length;
  const badge = count > 9 ? "9+" : String(count);

  return (
    <>
      {/* Fondo para cerrar la bandeja al hacer clic fuera */}
      {open && <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden />}

      <div className="fixed right-4 top-4 z-50">
        {/* Campanita */}
        <button
          onClick={() => setOpen((o) => !o)}
          className="relative flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-lg ring-1 ring-black/5 transition hover:bg-slate-50 hover:text-brand"
          title="Notificaciones"
          aria-label={`Notificaciones${count ? ` (${count})` : ""}`}
          aria-expanded={open}
        >
          <i className="fa-solid fa-bell text-[17px]" aria-hidden />
          {count > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-[18px] text-white ring-2 ring-white">
              {badge}
            </span>
          )}
        </button>

        {/* Bandeja */}
        {open && (
          <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl ring-1 ring-black/5">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <p className="text-sm font-bold text-slate-800">
                Notificaciones{count > 0 && <span className="ml-1.5 text-slate-400">({count})</span>}
              </p>
              {count > 0 && (
                <button onClick={clearAll} className="text-xs font-semibold text-brand hover:underline">
                  Limpiar todas
                </button>
              )}
            </div>

            {count === 0 ? (
              <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
                <i className="fa-regular fa-bell-slash text-2xl text-slate-300" aria-hidden />
                <p className="text-sm text-slate-400">Sin notificaciones</p>
              </div>
            ) : (
              <ul className="max-h-[70vh] divide-y divide-slate-100 overflow-y-auto">
                {items.map((n) => (
                  <li
                    key={n.id}
                    className={`flex items-start gap-3 px-4 py-3 transition-colors hover:bg-slate-50 ${
                      newIds.has(n.id) ? "bg-brand-light/40" : ""
                    }`}
                  >
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-light text-brand">
                      <i className={`fa-solid ${ICON[n.kind] ?? "fa-bell"}`} aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-slate-800">{n.title}</p>
                      <p className="text-xs leading-snug text-slate-500">{n.message}</p>
                      <p className="mt-0.5 text-[10px] uppercase tracking-wide text-slate-400">{timeAgo(n.createdAt)}</p>
                    </div>
                    <button
                      onClick={() => remove(n.id)}
                      className="shrink-0 rounded-md p-1 text-slate-300 transition hover:bg-slate-100 hover:text-red-500"
                      title="Eliminar"
                      aria-label="Eliminar notificación"
                    >
                      <i className="fa-solid fa-xmark" aria-hidden />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </>
  );
}
