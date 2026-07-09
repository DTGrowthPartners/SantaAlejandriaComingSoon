"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { logoutAction } from "@/lib/actions/auth";
import { ROLE_META } from "@/lib/domain";
import type { UserRole } from "@/generated/prisma/client";

const NAV = [
  { href: "/dashboard/forecast", label: "Forecast", icon: "📅" },
  { href: "/dashboard/reservations", label: "Reservas", icon: "🧾" },
  { href: "/dashboard/payments", label: "Pagos", icon: "💳" },
  { href: "/dashboard/rooms", label: "Habitaciones", icon: "🛏️" },
  { href: "/dashboard/reports", label: "Reportes", icon: "📊" },
  { href: "/dashboard/settings", label: "Configuración", icon: "⚙️" },
];

export function Sidebar({
  user,
}: {
  user: { name: string; email: string; role: UserRole };
}) {
  const pathname = usePathname();

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-5 py-4">
        <p className="text-sm font-bold text-slate-900">Forecast PMS</p>
        <p className="text-xs text-slate-500">Santa Alejandría Hotel</p>
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
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-slate-600 hover:bg-slate-50",
              )}
            >
              <span aria-hidden>{item.icon}</span>
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
            className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-600 transition hover:bg-slate-50"
          >
            Cerrar sesión
          </button>
        </form>
      </div>
    </aside>
  );
}
