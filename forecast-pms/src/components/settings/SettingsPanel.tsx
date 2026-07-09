"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { resetDataAction } from "@/lib/actions/admin";

export function SettingsPanel({
  user,
  hotelName,
  reservationsCount,
  isAdmin,
}: {
  user: { name: string; email: string; roleLabel: string };
  hotelName: string;
  reservationsCount: number;
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<number | null>(null);

  function confirmReset() {
    setError(null);
    startTransition(async () => {
      const res = await resetDataAction(text);
      if (res.ok) {
        setDone(res.deleted ?? 0);
        setOpen(false);
        setText("");
        router.refresh();
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <div className="mx-auto w-full max-w-2xl p-6">
      <h1 className="mb-5 font-serif text-2xl font-bold text-brand-dark">Configuración</h1>

      <section className="mb-5 rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">Cuenta</h2>
        <Row k="Hotel" v={hotelName} />
        <Row k="Usuario" v={user.name} />
        <Row k="Correo" v={user.email} />
        <Row k="Rol" v={user.roleLabel} />
      </section>

      {isAdmin && (
        <section className="rounded-xl border border-red-200 bg-red-50/40 p-5">
          <h2 className="mb-1 flex items-center gap-2 text-sm font-bold text-red-700">
            <i className="fa-solid fa-triangle-exclamation" aria-hidden />
            Zona de peligro
          </h2>
          <p className="mb-4 text-sm text-slate-600">
            <strong>Reiniciar</strong> elimina <strong>todas</strong> las reservas, pagos, bloqueos e
            historial ({reservationsCount} reservas). Se conservan el hotel, las habitaciones y los
            usuarios. Esta acción <strong>no se puede deshacer</strong>.
          </p>

          {done !== null && (
            <p className="mb-3 rounded-lg bg-brand-light px-3 py-2 text-sm font-medium text-brand-dark">
              ✓ Datos reiniciados. Se eliminaron {done} reservas.
            </p>
          )}

          <button
            onClick={() => { setOpen(true); setError(null); }}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            <i className="fa-solid fa-rotate-left mr-1.5" aria-hidden />
            Reiniciar (poner todo en 0)
          </button>
        </section>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" onClick={() => setOpen(false)}>
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-2 flex items-center gap-2 text-red-700">
              <i className="fa-solid fa-triangle-exclamation text-lg" aria-hidden />
              <h3 className="text-base font-bold">¿Reiniciar todo a 0?</h3>
            </div>
            <p className="mb-4 text-sm text-slate-600">
              Se eliminarán <strong>{reservationsCount} reservas</strong> con sus pagos e historial.
              Para confirmar, escribe <span className="font-mono font-bold">REINICIAR</span>:
            </p>
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="REINICIAR"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
            />
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => { setOpen(false); setText(""); setError(null); }} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">
                Cancelar
              </button>
              <button
                onClick={confirmReset}
                disabled={isPending || text.trim() !== "REINICIAR"}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {isPending ? "Reiniciando…" : "Sí, reiniciar todo"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-50 py-1.5 text-sm last:border-0">
      <span className="text-slate-500">{k}</span>
      <span className="font-medium text-slate-800">{v}</span>
    </div>
  );
}
