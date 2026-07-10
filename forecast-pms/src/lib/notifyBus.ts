import { EventEmitter } from "node:events";

// Bus de eventos en memoria, compartido entre módulos y estable ante HMR.
// forecast-pms corre como una sola instancia PM2 (fork), así que basta con
// un EventEmitter global para empujar avisos por SSE al instante.
const g = globalThis as unknown as { __notifyBus?: EventEmitter };
export const notifyBus: EventEmitter = g.__notifyBus ?? (g.__notifyBus = new EventEmitter());
notifyBus.setMaxListeners(0);

/** Señala que hubo un cambio de notificaciones para un hotel (nueva reserva o movimiento). */
export function emitNotification(hotelId: string): void {
  notifyBus.emit("changed", hotelId);
}
