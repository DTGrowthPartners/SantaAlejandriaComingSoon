"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { reconcileBoldPayments } from "@/lib/actions/payments";

export function ReconcileButton() {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const router = useRouter();

  function run() {
    setMsg(null);
    start(async () => {
      const r = await reconcileBoldPayments();
      if (!r.ok) {
        setMsg(r.error ?? "No se pudo reconciliar.");
        return;
      }
      const parts: string[] = [];
      if (r.paid) parts.push(`${r.paid} pagada(s)`);
      if (r.expired) parts.push(`${r.expired} vencida(s)`);
      setMsg(parts.length ? `Actualizado: ${parts.join(", ")}.` : `Sin cambios (${r.checked} revisada(s)).`);
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-2">
      {msg && <span className="text-xs text-slate-500">{msg}</span>}
      <button
        onClick={run}
        disabled={pending}
        className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
      >
        <i className={`fa-solid fa-rotate ${pending ? "fa-spin" : ""}`} aria-hidden />
        {pending ? "Consultando Bold…" : "Reconciliar con Bold"}
      </button>
    </div>
  );
}

export function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }
  return (
    <button
      onClick={copy}
      className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-brand"
      title="Copiar link"
      aria-label="Copiar link"
    >
      <i className={`fa-solid ${copied ? "fa-check text-brand" : "fa-copy"}`} aria-hidden />
    </button>
  );
}
