import type {
  BookingChannel,
  ReservationStatus,
  PaymentStatus,
  UserRole,
} from "@/generated/prisma/client";

/**
 * Colores alineados a la leyenda del forecast Excel real del hotel,
 * para que recepción reconozca los bloques de inmediato.
 *   Booking  → azul   (#00B0F0)
 *   Expedia  → morado (#7030A0)
 *   Directo  → verde  (#00A650)
 *   ...
 */
export const CHANNEL_META: Record<
  BookingChannel,
  { label: string; short: string; color: string; textOnColor: string }
> = {
  DIRECT: { label: "Directo Hotel", short: "DH", color: "#00A650", textOnColor: "#ffffff" },
  WHATSAPP: { label: "WhatsApp", short: "WA", color: "#12B76A", textOnColor: "#ffffff" },
  BOOKING: { label: "Booking", short: "BK", color: "#00B0F0", textOnColor: "#04222b" },
  EXPEDIA: { label: "Expedia", short: "EX", color: "#7030A0", textOnColor: "#ffffff" },
  AIRBNB: { label: "Airbnb", short: "AB", color: "#FF385C", textOnColor: "#ffffff" },
  WALK_IN: { label: "Walk-in", short: "WI", color: "#F5A300", textOnColor: "#3a2c00" },
  AGENCY: { label: "Agencia", short: "AG", color: "#FF7A00", textOnColor: "#3a1e00" },
  OTHER: { label: "Otro", short: "OT", color: "#9CA3AF", textOnColor: "#111827" },
};

export const RESERVATION_STATUS_META: Record<
  ReservationStatus,
  { label: string; color: string }
> = {
  PENDING: { label: "Pendiente", color: "#9CA3AF" },
  PENDING_PAYMENT: { label: "Esperando pago", color: "#F59E0B" },
  DEPOSIT_PAID: { label: "Abono pagado", color: "#3B82F6" },
  CONFIRMED: { label: "Confirmada", color: "#10B981" },
  PAID: { label: "Pagada", color: "#059669" },
  CANCELLED: { label: "Cancelada", color: "#6B7280" },
  EXPIRED: { label: "Vencida", color: "#EF4444" },
  NO_SHOW: { label: "No Show", color: "#DC2626" },
};

export const PAYMENT_STATUS_META: Record<
  PaymentStatus,
  { label: string; color: string }
> = {
  NO_PAYMENT: { label: "Sin pago", color: "#9CA3AF" },
  LINK_CREATED: { label: "Link creado", color: "#6366F1" },
  PAYMENT_PENDING: { label: "Pago pendiente", color: "#F59E0B" },
  APPROVED: { label: "Aprobado", color: "#10B981" },
  REJECTED: { label: "Rechazado (TC negada)", color: "#EF4444" },
  EXPIRED: { label: "Vencido", color: "#EF4444" },
  REFUNDED: { label: "Reembolsado", color: "#8B5CF6" },
};

export const ROLE_META: Record<UserRole, { label: string }> = {
  ADMIN: { label: "Administrador" },
  MANAGER: { label: "Gerencia" },
  RECEPTION: { label: "Recepción" },
  ACCOUNTING: { label: "Contabilidad" },
  VIEWER: { label: "Solo lectura" },
};

/** Estados que OCUPAN la habitación (bloquean disponibilidad y cuentan ocupación). */
export const ACTIVE_RESERVATION_STATUSES: ReservationStatus[] = [
  "PENDING",
  "PENDING_PAYMENT",
  "DEPOSIT_PAID",
  "CONFIRMED",
  "PAID",
];

/** Estados que NO ocupan (liberan la habitación). */
export const INACTIVE_RESERVATION_STATUSES: ReservationStatus[] = [
  "CANCELLED",
  "EXPIRED",
  "NO_SHOW",
];

export function isActiveStatus(status: ReservationStatus): boolean {
  return ACTIVE_RESERVATION_STATUSES.includes(status);
}

/** Canales en orden, para selects y validación (zod). */
export const BOOKING_CHANNELS = [
  "DIRECT",
  "WHATSAPP",
  "BOOKING",
  "EXPEDIA",
  "AIRBNB",
  "WALK_IN",
  "AGENCY",
  "OTHER",
] as const satisfies readonly BookingChannel[];

/** Estados asignables manualmente al editar una reserva. */
export const EDITABLE_RESERVATION_STATUSES = [
  "PENDING",
  "PENDING_PAYMENT",
  "DEPOSIT_PAID",
  "CONFIRMED",
  "PAID",
  "NO_SHOW",
  "CANCELLED",
] as const satisfies readonly ReservationStatus[];
