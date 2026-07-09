"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { logoutAction } from "@/lib/actions/auth";
import { ROLE_META } from "@/lib/domain";
import type { UserRole } from "@/generated/prisma/client";

const NAV = [
  { href: "/dashboard/inicio", label: "Inicio", icon: "fa-solid fa-house" },
  { href: "/dashboard/forecast", label: "Forecast", icon: "fa-solid fa-calendar-days" },
  { href: "/dashboard/reservations", label: "Reservas", icon: "fa-solid fa-clipboard-list" },
  { href: "/dashboard/payments", label: "Pagos", icon: "fa-solid fa-credit-card" },
  { href: "/dashboard/rooms", label: "Habitaciones", icon: "fa-solid fa-bed" },
  { href: "/dashboard/reports", label: "Reportes", icon: "fa-solid fa-chart-column" },
  { href: "/dashboard/settings", label: "Configuración", icon: "fa-solid fa-gear" },
];

export function Sidebar({
  user,
}: {
  user: { name: string; email: string; role: UserRole };
}) {
  const pathname = usePathname();

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-4">
        <i className="fa-solid fa-hotel text-lg text-brand" aria-hidden />
        <div>
          <p className="font-serif text-base font-bold leading-tight text-brand-dark">
            Santa Alejandría
          </p>
          <p className="text-[11px] uppercase tracking-widest text-gold">Forecast PMS</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {NAV.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
                active
                  ? "bg-brand-light text-brand-dark"
                  : "text-slate-600 hover:bg-slate-50",
              )}
            >
              <i className={cn(item.icon, "w-5 text-center text-[15px]")} aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 p-3">
        <div className="mb-2 px-2">
          <p className="truncate text-sm font-medium text-slate-800">{user.name}</p>
          <p className="text-xs text-slate-500">{ROLE_META[user.role].label}</p>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-600 transition hover:bg-slate-50"
          >
            <i className="fa-solid fa-right-from-bracket w-5 text-center" aria-hidden />
            Cerrar sesión
          </button>
        </form>
      </div>
    </aside>
  );
}
