import { requireUser, canOperate } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getLedgerSheet, listLedgerMonths, monthLabel } from "@/lib/ledger";
import { LedgerGrid } from "@/components/ledger/LedgerGrid";
import { LedgerToolbar } from "@/components/ledger/LedgerToolbar";

function currentYM(tz = "America/Bogota") {
  const f = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
  });
  const [y, m] = f.format(new Date()).split("-").map(Number);
  return { y, m };
}

export default async function LedgerPage({
  searchParams,
}: {
  searchParams: Promise<{ y?: string; m?: string }>;
}) {
  const user = await requireUser();
  const sp = await searchParams;
  const cur = currentYM();

  let year = sp.y ? parseInt(sp.y, 10) : cur.y;
  let month = sp.m ? parseInt(sp.m, 10) : cur.m;
  if (!Number.isFinite(year) || year < 2000 || year > 2100) year = cur.y;
  if (!Number.isFinite(month) || month < 1 || month > 12) month = cur.m;

  const hotel = await prisma.hotel.findUnique({ where: { id: user.hotelId } });
  const [sheet, months] = await Promise.all([
    getLedgerSheet(user.hotelId, year, month),
    listLedgerMonths(user.hotelId),
  ]);
  const canEdit = canOperate(user.role);
  const label = monthLabel(year, month);

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-3 p-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-xl font-bold text-brand-dark">Ingresos y Gastos</h1>
          <p className="text-sm text-slate-500">
            Control diario por habitación — {hotel?.name ?? "el hotel"}
          </p>
        </div>
        <LedgerToolbar
          year={year}
          month={month}
          monthLabel={label}
          hasSheet={!!sheet}
          sheetId={sheet?.id ?? null}
          months={months}
          canEdit={canEdit}
        />
      </header>

      {sheet ? (
        <LedgerGrid sheet={sheet} canEdit={canEdit} />
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <div className="text-4xl">📒</div>
          <h2 className="text-lg font-semibold text-brand-dark">
            No hay hoja para {label}
          </h2>
          <p className="max-w-md text-sm text-slate-500">
            {months.length > 0
              ? "Crea la hoja de este mes: se clona la estructura (secciones, habitaciones y categorías) de la hoja más reciente, con las celdas vacías, lista para llenar."
              : "Crea la primera hoja para empezar a registrar ingresos y gastos por habitación por día."}
          </p>
          {!canEdit && (
            <p className="text-xs text-slate-400">
              Tu rol es de solo lectura. Pide a un administrador que cree la hoja.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
