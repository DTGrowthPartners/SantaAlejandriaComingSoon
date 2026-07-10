"use client";

import { useEffect, useRef, useState } from "react";
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
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const seen = useRef<Set<string>>(new Set());
  const first = useRef(true);

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
        if (!first.current && fresh.length) setNewIds(new Set(fresh));
        first.current = false;
        setItems(list);
      } catch {
        /* red intermitente: reintenta en el próximo intervalo */
      }
    }
    load();
    const iv = setInterval(load, 15000);
    return () => {
      alive = false;
      clearInterval(iv);
    };
  }, []);

  async function dismiss(id: string) {
    setItems((i) => i.filter((x) => x.id !== id));
    await dismissNotification(id);
  }
  async function clearAll() {
    setItems([]);
    await dismissAllNotifications();
  }

  if (items.length === 0) return null;
  const visible = items.slice(0, 5);
  const extra = items.length - visible.length;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2">
      {visible.map((n) => (
        <div key={n.id} className={newIds.has(n.id) ? "animate-fade-up" : ""}>
          <div className="flex items-start gap-3 rounded-2xl border border-brand-light bg-white p-3 shadow-xl ring-1 ring-black/5">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-light text-brand">
              <i className={`fa-solid ${ICON[n.kind] ?? "fa-bell"}`} aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-800">{n.title}</p>
              <p className="text-xs leading-snug text-slate-500">{n.message}</p>
              <p className="mt-0.5 text-[10px] uppercase tracking-wide text-slate-400">{timeAgo(n.createdAt)}</p>
            </div>
            <button
              onClick={() => dismiss(n.id)}
              className="shrink-0 rounded-md p-1 text-slate-300 transition hover:bg-slate-100 hover:text-red-500"
              title="Descartar"
              aria-label="Descartar notificación"
            >
              <i className="fa-solid fa-xmark" aria-hidden />
            </button>
          </div>
        </div>
      ))}

      <div className="flex items-center justify-between rounded-full bg-brand-dark px-3.5 py-1.5 text-xs text-white shadow-lg">
        <span>
          {extra > 0 ? `+${extra} más · ` : ""}
          {items.length} {items.length === 1 ? "notificación" : "notificaciones"}
        </span>
        <button onClick={clearAll} className="font-semibold text-gold-soft hover:underline">
          Limpiar todas
        </button>
      </div>
    </div>
  );
}
