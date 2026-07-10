import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getDailySummary, type DailyReservation } from "@/lib/daily";
import { CHANNEL_META } from "@/lib/domain";
import { formatCOP, formatDate } from "@/lib/format";

function waLink(phone: string | null): string | null {
  if (!phone) return null;
  let n = phone.replace(/\D/g, "");
  if (n.length === 10) n = "57" + n;
  return n.length >= 10 ? `https://wa.me/${n}` : null;
}

export default async function InicioPage() {
  const user = await requireUser();
  const hotel = await prisma.hotel.findUnique({ where: { id: user.hotelId } });
  const tz = hotel?.timezone ?? "America/Bogota";
  const s = await getDailySummary(user.hotelId, tz);
  const k = s.kpis;

  const kpis = [
    { label: "Entradas hoy", value: k.checkIns, icon: "fa-arrow-right-to-bracket", accent: true },
    { label: "Salidas hoy", value: k.checkOuts, icon: "fa-arrow-right-from-bracket" },
    { label: "En casa", value: k.inHouse, icon: "fa-bed" },
    { label: "Disponibles hoy", value: k.availableToday, icon: "fa-door-open" },
    { label: "Ocupación hoy", value: `${k.occupancyPct}%`, icon: "fa-chart-pie" },
    { label: "Por cobrar hoy", value: formatCOP(k.toCollectToday), icon: "fa-hand-holding-dollar" },
    { label: "Saldo pendiente", value: formatCOP(k.pendingBalanceTotal), icon: "fa-coins" },
    { label: "Reservas x cobrar", value: k.pendingCount, icon: "fa-file-invoice-dollar" },
  ];

  return (
    <div className="mx-auto w-full max-w-5xl animate-fade-up p-6">
      <header className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">Resumen del día</p>
        <h1 className="font-serif text-3xl font-bold capitalize text-brand-dark">{s.todayLabel}</h1>
        <p className="text-sm text-slate-500">{hotel?.name}</p>
      </header>

      <div className="mb-6 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {kpis.map((it, i) => (
          <div
            key={it.label}
            style={{ animationDelay: `${i * 45}ms` }}
            className={
              "card-hover animate-fade-up px-3.5 py-3 " +
              (it.accent
                ? "rounded-2xl border border-gold/30 bg-gradient-to-br from-brand-light/70 to-cream shadow-sm"
                : "card")
            }
          >
            <div className="mb-1 flex items-center justify-between">
              <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{it.label}</span>
              <i className={"fa-solid " + it.icon + " text-gold/80"} aria-hidden />
            </div>
            <p className="truncate font-serif text-2xl font-bold text-brand-dark">{it.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ResCard title="Entradas de hoy" icon="fa-arrow-right-to-bracket" items={s.checkIns} empty="Sin entradas hoy" showBalance />
        <ResCard title="Salidas de hoy" icon="fa-arrow-right-from-bracket" items={s.checkOuts} empty="Sin salidas hoy" showBalance />
      </div>

      <div className="mt-4">
        <ResCard title="Huéspedes en casa" icon="fa-bed" items={s.inHouse} empty="No hay huéspedes alojados ahora" />
      </div>

      <div className="mt-4">
        <ResCard title="Por cobrar" icon="fa-hand-holding-dollar" items={s.toCollect} empty="Todo al día ✓" showBalance showContact />
      </div>
    </div>
  );
}

function ResCard({
  title,
  icon,
  items,
  empty,
  showBalance,
  showContact,
}: {
  title: string;
  icon: string;
  items: DailyReservation[];
  empty: string;
  showBalance?: boolean;
  showContact?: boolean;
}) {
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5">
        <p className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <i className={`fa-solid ${icon} text-brand/70`} aria-hidden />
          {title}
        </p>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">{items.length}</span>
      </div>
      {items.length === 0 ? (
        <p className="px-4 py-6 text-center text-sm text-slate-400">{empty}</p>
      ) : (
        <ul className="divide-y divide-slate-50">
          {items.map((r) => {
            const ch = CHANNEL_META[r.channel];
            const wa = waLink(r.guestPhone);
            return (
              <li key={r.id} className="flex items-center gap-3 px-4 py-2.5">
                <span className="h-8 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: ch.color }} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-800">
                    <span className="text-slate-400">{r.number}-</span> {r.guestName}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    Hab {r.roomName} · {ch.label} · {formatDate(r.checkIn)} → {formatDate(r.checkOut)}
                  </p>
                </div>
                {showBalance && r.balanceAmount > 0 && (
                  <span className="shrink-0 rounded-md bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">
                    {formatCOP(r.balanceAmount)}
                  </span>
                )}
                {showBalance && r.balanceAmount <= 0 && (
                  <span className="shrink-0 text-xs font-semibold text-brand">Pagado</span>
                )}
                {showContact && wa && (
                  <a href={wa} target="_blank" rel="noopener noreferrer" className="shrink-0 text-brand hover:text-brand-dark" title="WhatsApp">
                    <i className="fa-brands fa-whatsapp text-lg" aria-hidden />
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
