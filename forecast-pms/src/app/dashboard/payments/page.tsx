import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { listBoldLinks } from "@/lib/bold";
import { PAYMENT_STATUS_META, ACTIVE_RESERVATION_STATUSES } from "@/lib/domain";
import { formatCOP, formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

function boldBadge(status: string): { label: string; color: string; bg: string } {
  const s = status.toUpperCase();
  if (s === "PAID") return { label: "Pagado", color: "#047857", bg: "#d1fae5" };
  if (s === "ACTIVE") return { label: "Activo", color: "#b45309", bg: "#fef3c7" };
  if (s === "EXPIRED") return { label: "Vencido", color: "#6b7280", bg: "#f3f4f6" };
  if (s === "VOIDED" || s === "REJECTED") return { label: "Anulado", color: "#b91c1c", bg: "#fee2e2" };
  return { label: status, color: "#6b7280", bg: "#f3f4f6" };
}

/** Fechas de Bold vienen en nanosegundos epoch. */
function fromNano(n?: number | null): Date | null {
  if (!n) return null;
  return new Date(Math.round(n / 1_000_000));
}

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ bpage?: string }>;
}) {
  const user = await requireUser();
  const sp = await searchParams;
  const bpage = Math.max(1, parseInt(sp.bpage ?? "1", 10) || 1);

  // ── Pagos del PMS (nuestra BD) ──
  const [pmsPayments, activeRes, boldData] = await Promise.all([
    prisma.payment.findMany({
      where: { reservation: { hotelId: user.hotelId } },
      include: { reservation: { select: { number: true, guestName: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.reservation.findMany({
      where: { hotelId: user.hotelId, reservationStatus: { in: ACTIVE_RESERVATION_STATUSES } },
      select: { balanceAmount: true, paymentStatus: true },
    }),
    listBoldLinks(bpage, 50),
  ]);

  const cobrado = pmsPayments
    .filter((p) => p.status === "APPROVED")
    .reduce((s, p) => s + p.amount, 0);
  const saldoPendiente = activeRes.reduce((s, r) => s + r.balanceAmount, 0);
  const linksActivos = activeRes.filter(
    (r) => r.paymentStatus === "LINK_CREATED" || r.paymentStatus === "PAYMENT_PENDING",
  ).length;

  const cards = [
    { label: "Cobrado (PMS)", value: formatCOP(cobrado) },
    { label: "Saldo pendiente", value: formatCOP(saldoPendiente) },
    { label: "Pagos registrados", value: pmsPayments.length },
    { label: "Links por cobrar", value: linksActivos },
  ];

  const boldPrev = bpage > 1 ? bpage - 1 : null;
  const boldNext = bpage < boldData.totalPages ? bpage + 1 : null;
  const navBtn =
    "flex h-8 min-w-8 items-center justify-center rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-600 hover:bg-slate-50";
  const navOff = "flex h-8 min-w-8 items-center justify-center rounded-lg border border-slate-100 bg-slate-50 px-2 text-sm text-slate-300";

  return (
    <div className="mx-auto w-full max-w-5xl p-6">
      <div className="mb-4">
        <h1 className="font-serif text-2xl font-bold text-brand-dark">Pagos</h1>
        <p className="text-sm text-slate-500">Pagos del PMS e historial de links de Bold</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-slate-200 bg-white px-4 py-3">
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{c.label}</p>
            <p className="mt-0.5 text-xl font-bold text-slate-900">{c.value}</p>
          </div>
        ))}
      </div>

      {/* ── Pagos del PMS ── */}
      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
          <h2 className="text-sm font-semibold text-slate-700">Pagos del PMS</h2>
          <span className="text-xs text-slate-400">{pmsPayments.length} registro(s)</span>
        </div>
        {pmsPayments.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-slate-400">
            Aún no hay pagos registrados. Los pagos por link de Bold y los manuales aparecerán aquí.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wide text-slate-400">
                  <th className="px-5 py-2 font-medium">Fecha</th>
                  <th className="px-3 py-2 font-medium">Reserva</th>
                  <th className="px-3 py-2 font-medium">Huésped</th>
                  <th className="px-3 py-2 font-medium">Método</th>
                  <th className="px-3 py-2 font-medium">Estado</th>
                  <th className="px-5 py-2 text-right font-medium">Monto</th>
                </tr>
              </thead>
              <tbody>
                {pmsPayments.map((p) => {
                  const meta = PAYMENT_STATUS_META[p.status];
                  return (
                    <tr key={p.id} className="border-t border-slate-50 hover:bg-slate-50/60">
                      <td className="whitespace-nowrap px-5 py-2.5 text-slate-500">
                        {formatDate(p.paidAt ?? p.createdAt)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 font-semibold text-brand">
                        #{p.reservation?.number ?? "—"}
                      </td>
                      <td className="px-3 py-2.5 text-slate-700">{p.reservation?.guestName ?? "—"}</td>
                      <td className="px-3 py-2.5 capitalize text-slate-500">{p.method ?? p.provider}</td>
                      <td className="px-3 py-2.5">
                        <span
                          className="inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold"
                          style={{ color: meta.color, backgroundColor: `${meta.color}1a` }}
                        >
                          {meta.label}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-5 py-2.5 text-right font-semibold text-slate-900">
                        {formatCOP(p.amount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Historial de links de Bold ── */}
      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-700">Historial de links · Bold</h2>
            <p className="text-xs text-slate-400">
              Todos los links de la cuenta Bold (incluye los creados manualmente)
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            {boldPrev ? (
              <Link href={`/dashboard/payments?bpage=${boldPrev}`} className={navBtn}>‹</Link>
            ) : (
              <span className={navOff}>‹</span>
            )}
            <span className="px-1 text-xs text-slate-500">
              {boldData.totalPages > 0 ? `${bpage} / ${boldData.totalPages}` : "—"}
            </span>
            {boldNext ? (
              <Link href={`/dashboard/payments?bpage=${boldNext}`} className={navBtn}>›</Link>
            ) : (
              <span className={navOff}>›</span>
            )}
          </div>
        </div>
        {boldData.links.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-slate-400">
            No se pudo cargar el historial de Bold (revisa las llaves de producción).
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wide text-slate-400">
                  <th className="px-5 py-2 font-medium">Descripción</th>
                  <th className="px-3 py-2 font-medium">Vence</th>
                  <th className="px-3 py-2 font-medium">Estado</th>
                  <th className="px-5 py-2 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {boldData.links.map((l) => {
                  const b = boldBadge(l.status);
                  const exp = fromNano(l.expiration_date);
                  return (
                    <tr key={l.id} className="border-t border-slate-50 hover:bg-slate-50/60">
                      <td className="max-w-md px-5 py-2.5 text-slate-700">
                        <span className="line-clamp-1">{l.description || <span className="text-slate-300">sin descripción</span>}</span>
                        <span className="text-[11px] text-slate-300">{l.id}</span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-slate-500">
                        {exp ? formatDate(exp) : "—"}
                      </td>
                      <td className="px-3 py-2.5">
                        <span
                          className="inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold"
                          style={{ color: b.color, backgroundColor: b.bg }}
                        >
                          {b.label}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-5 py-2.5 text-right font-semibold text-slate-900">
                        {formatCOP(l.total)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
