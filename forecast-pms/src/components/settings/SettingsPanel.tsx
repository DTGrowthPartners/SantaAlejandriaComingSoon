"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { resetDataAction, setWebPaymentModeAction, setWebIvaAction } from "@/lib/actions/admin";

export function SettingsPanel({
  user,
  hotelName,
  reservationsCount,
  isAdmin,
  webPrepayFull,
  webApplyIva,
}: {
  user: { name: string; email: string; roleLabel: string };
  hotelName: string;
  reservationsCount: number;
  isAdmin: boolean;
  webPrepayFull: boolean;
  webApplyIva: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<number | null>(null);
  const [prepayFull, setPrepayFull] = useState(webPrepayFull);
  const [savingMode, setSavingMode] = useState(false);
  const [applyIva, setApplyIva] = useState(webApplyIva);
  const [savingIva, setSavingIva] = useState(false);

  function toggleMode() {
    const next = !prepayFull;
    setPrepayFull(next); // optimista
    setSavingMode(true);
    startTransition(async () => {
      const res = await setWebPaymentModeAction(next);
      if (!res.ok) setPrepayFull(!next); // revierte si falla
      setSavingMode(false);
      router.refresh();
    });
  }

  function toggleIva() {
    const next = !applyIva;
    setApplyIva(next); // optimista
    setSavingIva(true);
    startTransition(async () => {
      const res = await setWebIvaAction(next);
      if (!res.ok) setApplyIva(!next); // revierte si falla
      setSavingIva(false);
      router.refresh();
    });
  }

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
        <section className="mb-5 rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="mb-1 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
            <i className="fa-solid fa-calendar-days text-gold" aria-hidden />
            Modo de pago web (temporada)
          </h2>
          <div className="mt-3 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-800">
                {prepayFull ? "Temporada alta · prepago total" : "Temporada baja · apartar con 1 noche"}
              </p>
              <p className="mt-0.5 text-sm text-slate-500">
                {prepayFull
                  ? "En la reserva web el cliente debe pagar el total antes de llegar."
                  : "En la reserva web el cliente aparta pagando la 1.ª noche y paga el resto al llegar al hotel."}
              </p>
            </div>
            <button
              onClick={toggleMode}
              disabled={savingMode}
              role="switch"
              aria-checked={prepayFull}
              className={`relative mt-1 h-7 w-12 shrink-0 rounded-full transition ${prepayFull ? "bg-brand" : "bg-slate-300"} disabled:opacity-60`}
              title="Cambiar temporada"
            >
              <span
                className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${prepayFull ? "left-[22px]" : "left-0.5"}`}
              />
            </button>
          </div>
          <p className="mt-3 text-xs text-slate-400">
            {prepayFull
              ? "Enciende = temporada alta. Apágalo para volver a temporada baja (apartar con 1 noche)."
              : "Apagado = temporada baja. Enciéndelo en temporada alta para exigir prepago total."}
          </p>
        </section>
      )}

      {isAdmin && (
        <section className="mb-5 rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="mb-1 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
            <i className="fa-solid fa-receipt text-gold" aria-hidden />
            IVA de la reserva web
          </h2>
          <div className="mt-3 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-800">
                {applyIva ? "Cobra IVA 19%" : "Exento de IVA"}
              </p>
              <p className="mt-0.5 text-sm text-slate-500">
                {applyIva
                  ? "La reserva web suma el IVA 19% al total que paga el cliente."
                  : "La reserva web cobra el total sin IVA (exento)."}
              </p>
            </div>
            <button
              onClick={toggleIva}
              disabled={savingIva}
              role="switch"
              aria-checked={applyIva}
              className={`relative mt-1 h-7 w-12 shrink-0 rounded-full transition ${applyIva ? "bg-brand" : "bg-slate-300"} disabled:opacity-60`}
              title="Cobrar IVA en la web"
            >
              <span
                className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${applyIva ? "left-[22px]" : "left-0.5"}`}
              />
            </button>
          </div>
          <p className="mt-3 text-xs text-slate-400">
            Solo afecta a las reservas web <span className="font-medium">nuevas</span>. Las ya creadas
            conservan el IVA con el que se registraron.
          </p>
        </section>
      )}

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
