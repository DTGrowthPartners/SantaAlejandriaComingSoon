"use client";

import Link from "next/link";
import Image from "next/image";
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
    <aside className="flex w-64 shrink-0 flex-col bg-gradient-to-b from-[#2f5111] to-[#20390b] text-white">
      {/* Logo */}
      <div className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
        <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-white/10 ring-1 ring-white/15">
          <Image src="/favicon.png" alt="Santa Alejandría" width={40} height={40} unoptimized className="h-9 w-9 object-contain" />
        </span>
        <div className="leading-tight">
          <p className="font-serif text-lg font-bold text-white">Santa Alejandría</p>
          <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-gold-soft">Forecast PMS</p>
        </div>
      </div>

      {/* Navegación */}
      <nav className="flex-1 space-y-0.5 p-3">
        {NAV.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200",
                active
                  ? "bg-white/12 text-white shadow-sm"
                  : "text-white/65 hover:translate-x-0.5 hover:bg-white/8 hover:text-white",
              )}
            >
              <span
                className={cn(
                  "absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-gold transition-all duration-200",
                  active ? "opacity-100" : "opacity-0 group-hover:opacity-40",
                )}
              />
              <i
                className={cn(
                  item.icon,
                  "w-5 text-center text-[15px] transition-colors",
                  active ? "text-gold-soft" : "text-white/55 group-hover:text-gold-soft",
                )}
                aria-hidden
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Usuario */}
      <div className="border-t border-white/10 p-3">
        <div className="mb-1 flex items-center gap-3 px-2 py-1.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold/20 text-sm font-bold text-gold-soft">
            {user.name.charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-semibold text-white">{user.name}</p>
            <p className="text-xs text-gold-soft/80">{ROLE_META[user.role].label}</p>
          </div>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2 text-left text-sm text-white/60 transition-colors hover:bg-white/8 hover:text-white"
          >
            <i className="fa-solid fa-right-from-bracket w-5 text-center" aria-hidden />
            Cerrar sesión
          </button>
        </form>
      </div>
    </aside>
  );
}
