"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createDepositLinkAction } from "@/lib/actions/payments";
import { formatCOP } from "@/lib/format";

export function DepositLinkButton({
  reservationId,
  number,
  guestName,
  balanceAmount,
  variant = "button",
}: {
  reservationId: string;
  number: number;
  guestName: string;
  balanceAmount: number;
  variant?: "button" | "icon";
}) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState<number>(balanceAmount > 0 ? balanceAmount : 0);
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [pending, start] = useTransition();
  const router = useRouter();

  function close() {
    setOpen(false);
    setUrl(null);
    setError(null);
    setAmount(balanceAmount > 0 ? balanceAmount : 0);
  }

  function generate() {
    setError(null);
    start(async () => {
      const res = await createDepositLinkAction({ reservationId, amount });
      if (!res.ok) {
        setError(res.error ?? "No se pudo generar el link.");
        return;
      }
      setUrl(res.url ?? null);
      router.refresh();
    });
  }

  function copy() {
    if (!url) return;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <>
      {variant === "icon" ? (
        <button
          onClick={() => setOpen(true)}
          className="text-slate-400 hover:text-brand"
          title="Generar link de abono"
        >
          <i className="fa-solid fa-link" aria-hidden />
        </button>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <i className="fa-solid fa-link mr-1.5" aria-hidden />
          Link de abono
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4" onClick={close}>
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-1 flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold text-brand-dark">Link de abono</h3>
              <button onClick={close} className="rounded-md px-2 py-1 text-slate-400 hover:bg-slate-100">
                <i className="fa-solid fa-xmark" aria-hidden />
              </button>
            </div>
            <p className="mb-3 text-sm text-slate-500">
              Reserva #{number} · {guestName}
              <br />
              Saldo pendiente: <span className="font-semibold text-slate-700">{formatCOP(balanceAmount)}</span>
            </p>

            {!url ? (
              <>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-400">
                  Monto del abono (COP)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min={1000}
                    step={1000}
                    value={amount || ""}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    placeholder="Ej. 100000"
                  />
                  {balanceAmount > 0 && (
                    <button
                      onClick={() => setAmount(balanceAmount)}
                      className="whitespace-nowrap rounded-lg border border-slate-200 px-2 text-xs text-slate-500 hover:bg-slate-50"
                    >
                      Saldo total
                    </button>
                  )}
                </div>
                {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
                <div className="mt-4 flex justify-end gap-2">
                  <button onClick={close} className="rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100">
                    Cancelar
                  </button>
                  <button
                    onClick={generate}
                    disabled={pending || amount < 1000}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
                  >
                    <i className={`fa-solid ${pending ? "fa-spinner fa-spin" : "fa-bolt"}`} aria-hidden />
                    {pending ? "Generando…" : "Generar link"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="rounded-lg border border-brand-light bg-brand-light/40 p-3">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-brand-dark">
                    Link por {formatCOP(amount)}
                  </p>
                  <p className="break-all text-xs text-slate-600">{url}</p>
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Envíaselo al huésped. Cuando pague, se marca solo como abono y baja el saldo.
                </p>
                <div className="mt-4 flex justify-end gap-2">
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Abrir
                  </a>
                  <button
                    onClick={copy}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
                  >
                    <i className={`fa-solid ${copied ? "fa-check" : "fa-copy"}`} aria-hidden />
                    {copied ? "Copiado" : "Copiar link"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
