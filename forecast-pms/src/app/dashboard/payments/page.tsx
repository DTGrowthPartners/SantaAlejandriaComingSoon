import { Suspense } from "react";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { listAllBoldLinks, getBoldLink } from "@/lib/bold";
import { PAYMENT_STATUS_META, ACTIVE_RESERVATION_STATUSES, totalDue } from "@/lib/domain";
import { formatCOP, formatDate } from "@/lib/format";
import { ReconcileButton, CopyLinkButton } from "@/components/payments/PaymentsClient";

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

const BOLD_FILTERS = [
  { key: "vigentes", label: "Vigentes" },
  { key: "pagados", label: "Pagados" },
  { key: "vencidos", label: "Vencidos" },
  { key: "todos", label: "Todos" },
] as const;

function boldStatusKept(status: string, filter: string): boolean {
  const s = (status ?? "").toUpperCase();
  if (filter === "todos") return true;
  if (filter === "pagados") return s === "PAID";
  if (filter === "vencidos") return ["EXPIRED", "VOIDED", "REJECTED", "CANCELLED"].includes(s);
  return s === "PAID" || s === "ACTIVE"; // vigentes (por defecto)
}

/** Recuadro con encabezado + estado de carga mientras llegan los datos de Bold. */
function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-5 py-3">
        <h2 className="text-sm font-semibold text-slate-700">{title}</h2>
        {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function LoadingRow() {
  return (
    <p className="flex items-center justify-center gap-2 px-5 py-8 text-center text-sm text-slate-400">
      <i className="fa-solid fa-spinner fa-spin" aria-hidden /> Cargando desde Bold…
    </p>
  );
}

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ bpage?: string; bfilter?: string }>;
}) {
  const user = await requireUser();
  const sp = await searchParams;
  const bpage = Math.max(1, parseInt(sp.bpage ?? "1", 10) || 1);
  const bfilter = BOLD_FILTERS.some((f) => f.key === sp.bfilter) ? sp.bfilter! : "vigentes";

  // Datos rápidos desde la BD (render inmediato del esqueleto).
  const [pmsPayments, activeRes] = await Promise.all([
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

      {/* Estado en vivo de los links del PMS (consulta Bold) → streaming */}
      <Suspense fallback={<SectionCard title="Links de pago · estado en vivo"><LoadingRow /></SectionCard>}>
        <LinkStatusSection hotelId={user.hotelId} />
      </Suspense>

      {/* Pagos del PMS (nuestra BD) → inmediato */}
      <PmsPaymentsSection payments={pmsPayments} />

      {/* Historial completo de Bold → streaming */}
      <Suspense
        key={`${bfilter}-${bpage}`}
        fallback={<SectionCard title="Historial de links · Bold"><LoadingRow /></SectionCard>}
      >
        <BoldHistorySection bfilter={bfilter} bpage={bpage} />
      </Suspense>
    </div>
  );
}

// ── Sección: links del PMS con estado en vivo (consulta Bold) ──
async function LinkStatusSection({ hotelId }: { hotelId: string }) {
  const linkRes = await prisma.reservation.findMany({
    where: { hotelId, paymentLink: { not: null } },
    include: { payments: true },
    orderBy: { createdAt: "desc" },
    take: 40,
  });
  const linkRows = await Promise.all(
    linkRes.map(async (r) => {
      const lnk = r.payments.find((p) => p.providerPaymentId?.startsWith("LNK"))?.providerPaymentId ?? null;
      const bold = lnk && r.reservationStatus !== "PAID" ? await getBoldLink(lnk) : null;
      return { r, bold };
    }),
  );

  return (
    <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-5 py-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-700">Links de pago · estado en vivo</h2>
          <p className="text-xs text-slate-400">Consultado a Bold; se marca solo al recibir el pago</p>
        </div>
        <ReconcileButton />
      </div>
      {linkRows.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-slate-400">
          Aún no se han generado links de pago desde el PMS.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-slate-400">
                <th className="px-5 py-2 font-medium">Reserva</th>
                <th className="px-3 py-2 font-medium">Huésped</th>
                <th className="px-3 py-2 font-medium">Estado del link</th>
                <th className="px-3 py-2 font-medium">Link de pago</th>
                <th className="px-5 py-2 text-right font-medium">Monto</th>
              </tr>
            </thead>
            <tbody>
              {linkRows.map(({ r, bold }) => {
                const b = bold
                  ? boldBadge(bold.status)
                  : r.reservationStatus === "PAID" || r.paymentStatus === "APPROVED"
                    ? { label: "Pagado", color: "#047857", bg: "#d1fae5" }
                    : { label: "Pendiente", color: "#b45309", bg: "#fef3c7" };
                return (
                  <tr key={r.id} className="border-t border-slate-50 hover:bg-slate-50/60">
                    <td className="whitespace-nowrap px-5 py-2.5 font-semibold text-brand">#{r.number}</td>
                    <td className="px-3 py-2.5 text-slate-700">{r.guestName}</td>
                    <td className="px-3 py-2.5">
                      <span
                        className="inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold"
                        style={{ color: b.color, backgroundColor: b.bg }}
                      >
                        {b.label}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      {r.paymentLink ? (
                        <span className="flex items-center gap-1.5">
                          <a
                            href={r.paymentLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-medium text-brand hover:underline"
                          >
                            Abrir
                          </a>
                          <CopyLinkButton url={r.paymentLink} />
                        </span>
                      ) : (
                        <span className="text-xs text-slate-300">—</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-5 py-2.5 text-right font-semibold text-slate-900">
                      {formatCOP(totalDue(r.totalAmount, r.applyIva))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Sección: pagos del PMS (BD, inmediato) ──
function PmsPaymentsSection({
  payments,
}: {
  payments: {
    id: string;
    amount: number;
    status: keyof typeof PAYMENT_STATUS_META;
    method: string | null;
    provider: string;
    paidAt: Date | null;
    createdAt: Date;
    reservation: { number: number; guestName: string } | null;
  }[];
}) {
  return (
    <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
        <h2 className="text-sm font-semibold text-slate-700">Pagos del PMS</h2>
        <span className="text-xs text-slate-400">{payments.length} registro(s)</span>
      </div>
      {payments.length === 0 ? (
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
              {payments.map((p) => {
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
  );
}

// ── Sección: historial completo de Bold (streaming) ──
async function BoldHistorySection({ bfilter, bpage }: { bfilter: string; bpage: number }) {
  const allBoldLinks = await listAllBoldLinks();
  const filteredBold = allBoldLinks.filter((l) => boldStatusKept(l.status, bfilter));
  const BOLD_PER_PAGE = 50;
  const totalPages = Math.max(1, Math.ceil(filteredBold.length / BOLD_PER_PAGE));
  const page = Math.min(bpage, totalPages);
  const links = filteredBold.slice((page - 1) * BOLD_PER_PAGE, page * BOLD_PER_PAGE);

  const prev = page > 1 ? page - 1 : null;
  const next = page < totalPages ? page + 1 : null;
  const navBtn =
    "flex h-8 min-w-8 items-center justify-center rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-600 hover:bg-slate-50";
  const navOff = "flex h-8 min-w-8 items-center justify-center rounded-lg border border-slate-100 bg-slate-50 px-2 text-sm text-slate-300";

  return (
    <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-5 py-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-700">Historial de links · Bold</h2>
          <p className="text-xs text-slate-400">
            Links de la cuenta Bold (incluye los creados manualmente) · {filteredBold.length}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          {prev ? (
            <Link href={`/dashboard/payments?bfilter=${bfilter}&bpage=${prev}`} className={navBtn}>‹</Link>
          ) : (
            <span className={navOff}>‹</span>
          )}
          <span className="px-1 text-xs text-slate-500">{totalPages > 0 ? `${page} / ${totalPages}` : "—"}</span>
          {next ? (
            <Link href={`/dashboard/payments?bfilter=${bfilter}&bpage=${next}`} className={navBtn}>›</Link>
          ) : (
            <span className={navOff}>›</span>
          )}
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5 border-b border-slate-100 px-5 py-2.5">
        {BOLD_FILTERS.map((f) => (
          <Link
            key={f.key}
            href={`/dashboard/payments?bfilter=${f.key}`}
            className={
              bfilter === f.key
                ? "rounded-full bg-brand px-3 py-1 text-xs font-semibold text-white"
                : "rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500 hover:bg-slate-50"
            }
          >
            {f.label}
          </Link>
        ))}
      </div>
      {links.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-slate-400">
          {allBoldLinks.length === 0
            ? "No se pudo cargar el historial de Bold (revisa las llaves de producción)."
            : "No hay links en este filtro."}
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
              {links.map((l) => {
                const b = boldBadge(l.status);
                const exp = fromNano(l.expiration_date);
                return (
                  <tr key={l.id} className="border-t border-slate-50 hover:bg-slate-50/60">
                    <td className="max-w-md px-5 py-2.5 text-slate-700">
                      <span className="line-clamp-1">{l.description || <span className="text-slate-300">sin descripción</span>}</span>
                      <span className="text-[11px] text-slate-300">{l.id}</span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-slate-500">{exp ? formatDate(exp) : "—"}</td>
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
  );
}
