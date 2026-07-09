"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ImportResult = {
  imported: number;
  skippedNoRoom: number;
  skippedConflict: number;
  totalParsed: number;
  monthsScanned: number;
  byMonth: Record<string, number>;
  sample: { roomName: string; guestName: string; checkIn: string; checkOut: string; channel: string; totalAmount: number }[];
};

export function ImportPanel() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!file) return;
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/import", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) setError(json.error ?? "Error al importar");
      else {
        setResult(json);
        router.refresh();
      }
    } catch {
      setError("Error de red al subir el archivo.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl p-6">
      <div className="mb-5">
        <h1 className="font-serif text-2xl font-bold text-brand-dark">Importar forecast</h1>
        <p className="mt-1 text-sm text-slate-500">
          Sube el Excel del hotel (<code>FORECAST ACTUALIZADO 2026.xlsx</code>). Se leen los
          comentarios de cada celda (huésped, fechas, canal y monto) y se crean las reservas
          desde el mes actual en adelante. Los cruces se omiten automáticamente.
        </p>
      </div>

      <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-brand/40 bg-brand-light/40 px-6 py-10 text-center transition hover:bg-brand-light/70">
        <i className="fa-solid fa-file-arrow-up text-3xl text-brand" aria-hidden />
        <span className="text-sm font-medium text-slate-700">
          {file ? file.name : "Haz clic para elegir el archivo .xlsx"}
        </span>
        <input
          type="file"
          accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          className="hidden"
          onChange={(e) => {
            setFile(e.target.files?.[0] ?? null);
            setResult(null);
            setError(null);
          }}
        />
      </label>

      <button
        onClick={submit}
        disabled={!file || busy}
        className="mt-4 w-full rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-50"
      >
        {busy ? "Importando…" : "Importar reservas"}
      </button>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      {result && (
        <div className="mt-5 rounded-xl border border-slate-200 bg-white p-5">
          <p className="flex items-center gap-2 text-base font-bold text-brand-dark">
            <i className="fa-solid fa-circle-check text-brand" aria-hidden />
            {result.imported} reservas importadas
          </p>
          <div className="mt-3 grid grid-cols-3 gap-3 text-center text-sm">
            <Stat n={result.totalParsed} label="Detectadas" />
            <Stat n={result.skippedConflict} label="Omitidas (cruce)" />
            <Stat n={result.skippedNoRoom} label="Sin habitación" />
          </div>
          {Object.keys(result.byMonth).length > 0 && (
            <div className="mt-4">
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">Por mes</p>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(result.byMonth).map(([m, n]) => (
                  <span key={m} className="rounded-full bg-brand-light px-2.5 py-0.5 text-xs font-medium text-brand-dark">
                    {m}: {n}
                  </span>
                ))}
              </div>
            </div>
          )}
          <a href="/dashboard/forecast" className="mt-5 inline-block rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            Ver en el forecast →
          </a>
        </div>
      )}
    </div>
  );
}

function Stat({ n, label }: { n: number; label: string }) {
  return (
    <div className="rounded-lg bg-slate-50 py-2">
      <p className="text-lg font-bold text-slate-900">{n}</p>
      <p className="text-[11px] text-slate-500">{label}</p>
    </div>
  );
}
