import nodemailer, { type Transporter } from "nodemailer";
import { formatCOP, formatDate } from "@/lib/format";

let transporter: Transporter | null = null;
let checked = false;

/** Crea (una sola vez) el transporte SMTP desde variables de entorno. */
function getTransporter(): Transporter | null {
  if (checked) return transporter;
  checked = true;
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) {
    console.warn("[email] SMTP no configurado (SMTP_HOST/SMTP_USER/SMTP_PASS). No se enviarán correos.");
    return null;
  }
  const port = Number(process.env.SMTP_PORT ?? 465);
  const secure = process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : port === 465;
  // Permite conectarse al Postfix local aunque el certificado no valide contra "localhost".
  const rejectUnauthorized = process.env.SMTP_TLS_REJECT_UNAUTHORIZED !== "false";
  transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    tls: { rejectUnauthorized },
  });
  return transporter;
}

export type ReservationEmailData = {
  number: number;
  guestName: string;
  guestPhone?: string | null;
  guestEmail?: string | null;
  roomName: string;
  roomType?: string | null;
  channelLabel: string;
  via: string;
  checkIn: Date;
  checkOut: Date;
  nights: number;
  guestsCount: number;
  subtotal: number;
  iva: number;
  total: number;
  statusLabel: string;
  notes?: string | null;
};

function row(label: string, value: string): string {
  return `<tr>
    <td style="padding:8px 14px;color:#6b7280;font-size:13px;border-bottom:1px solid #f1f1ee;white-space:nowrap;">${label}</td>
    <td style="padding:8px 14px;color:#1f2937;font-size:14px;font-weight:600;border-bottom:1px solid #f1f1ee;">${value}</td>
  </tr>`;
}

/** Envía un correo con TODA la info de una reserva nueva. Nunca lanza. */
export async function sendNewReservationEmail(d: ReservationEmailData): Promise<void> {
  const tx = getTransporter();
  if (!tx) return;

  const to = process.env.RESERVATION_NOTIFY_TO || process.env.SMTP_USER!;
  const from = process.env.RESERVATION_NOTIFY_FROM || `Reservas Santa Alejandría <${process.env.SMTP_USER}>`;

  const subject = `🟢 Nueva reserva #${d.number} · ${d.guestName} · ${formatDate(d.checkIn)}`;

  const rooms = d.roomType ? `${d.roomName} — ${d.roomType}` : d.roomName;
  const contact = [d.guestPhone, d.guestEmail].filter(Boolean).join(" · ") || "—";

  const html = `<div style="background:#f5f4ef;padding:24px;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #eae7df;">
    <div style="background:#2f5711;padding:18px 22px;">
      <p style="margin:0;color:#e9d9a6;font-size:12px;letter-spacing:2px;text-transform:uppercase;">Santa Alejandría · Cartagena</p>
      <p style="margin:4px 0 0;color:#ffffff;font-size:20px;font-weight:700;">Nueva reserva #${d.number}</p>
    </div>
    <div style="padding:8px 8px 4px;">
      <table style="width:100%;border-collapse:collapse;">
        ${row("Huésped", d.guestName)}
        ${row("Contacto", contact)}
        ${row("Habitación", rooms)}
        ${row("Entrada", formatDate(d.checkIn))}
        ${row("Salida", formatDate(d.checkOut))}
        ${row("Noches", String(d.nights))}
        ${row("Huéspedes", String(d.guestsCount))}
        ${row("Canal", `${d.channelLabel} (${d.via})`)}
        ${row("Estado", d.statusLabel)}
        ${row("Subtotal", formatCOP(d.subtotal))}
        ${row("IVA 19%", formatCOP(d.iva))}
        ${row("Total", formatCOP(d.total))}
        ${d.notes ? row("Notas", d.notes) : ""}
      </table>
    </div>
    <div style="padding:14px 22px;background:#faf9f5;border-top:1px solid #eae7df;">
      <p style="margin:0;color:#9ca3af;font-size:12px;">Correo automático del PMS · Forecast Santa Alejandría Hotels</p>
    </div>
  </div>
</div>`;

  const text =
    `Nueva reserva #${d.number}\n` +
    `Huésped: ${d.guestName}\nContacto: ${contact}\n` +
    `Habitación: ${rooms}\nEntrada: ${formatDate(d.checkIn)}\nSalida: ${formatDate(d.checkOut)}\n` +
    `Noches: ${d.nights} · Huéspedes: ${d.guestsCount}\n` +
    `Canal: ${d.channelLabel} (${d.via})\nEstado: ${d.statusLabel}\n` +
    `Subtotal: ${formatCOP(d.subtotal)} · IVA 19%: ${formatCOP(d.iva)} · Total: ${formatCOP(d.total)}\n` +
    (d.notes ? `Notas: ${d.notes}\n` : "");

  try {
    await tx.sendMail({ from, to, subject, html, text });
  } catch (e) {
    console.error("[email] no se pudo enviar el correo de reserva:", e);
  }
}

export type GuestConfirmationEmailData = {
  to: string;
  number: number;
  guestName: string;
  roomName: string;
  roomType?: string | null;
  checkIn: Date;
  checkOut: Date;
  nights: number;
  guestsCount: number;
  subtotal: number;
  iva: number;
  total: number;
  /** "hotel" = paga al llegar · "online" = prepago total · "deposit" = abono 1 noche */
  payMode: "hotel" | "online" | "deposit";
  amountToPay: number; // a pagar en línea ahora (0 si paga en el hotel)
  balanceAtHotel: number; // saldo a pagar al llegar
  paymentUrl?: string | null;
  linkExpiresMinutes?: number | null;
  hotelName: string;
};

/**
 * Correo de CONFIRMACIÓN al huésped (cliente) tras reservar en la web. Es el que
 * ve el cliente: cálido, con la marca del hotel, el detalle de su reserva y —según
 * el modo de pago— el botón para pagar en línea o el aviso de pago en el hotel.
 * Nunca lanza. No hace nada si no hay email del huésped.
 */
export async function sendGuestConfirmationEmail(d: GuestConfirmationEmailData): Promise<void> {
  const tx = getTransporter();
  if (!tx || !d.to) return;

  const from =
    process.env.RESERVATION_NOTIFY_FROM || `Santa Alejandría Hotels <${process.env.SMTP_USER}>`;
  const replyTo = process.env.RESERVATION_NOTIFY_TO || process.env.SMTP_USER!;
  const { subject, html, text } = renderGuestConfirmationEmail(d, replyTo);

  try {
    await tx.sendMail({ from, to: d.to, replyTo, subject, html, text });
  } catch (e) {
    console.error("[email] no se pudo enviar la confirmación al huésped:", e);
  }
}

/** Arma el asunto/HTML/texto del correo al huésped. Pura (sin envío) para poder previsualizar. */
export function renderGuestConfirmationEmail(
  d: GuestConfirmationEmailData,
  replyTo: string,
): { subject: string; html: string; text: string } {
  const pendingPay = d.payMode !== "hotel";
  const subject = pendingPay
    ? `Reserva #${d.number} · Completa tu pago · Santa Alejandría Cartagena`
    : `Reserva #${d.number} confirmada · Santa Alejandría Cartagena`;

  const rooms = d.roomType ? `${d.roomType} — Hab. ${d.roomName}` : `Hab. ${d.roomName}`;

  // Bloque de pago según el modo elegido.
  let payBlock = "";
  let payText = "";
  if (d.payMode === "hotel") {
    payBlock = `
      <div style="margin:6px 14px 2px;padding:14px 16px;background:#f0f6ea;border:1px solid #d8e8c8;border-radius:12px;">
        <p style="margin:0 0 4px;color:#2f5711;font-size:14px;font-weight:700;">Pago al llegar al hotel</p>
        <p style="margin:0;color:#4b5563;font-size:13px;">Tu reserva ya está apartada. Pagarás <strong>${formatCOP(d.total)}</strong> directamente en recepción al hacer el check-in.</p>
      </div>`;
    payText = `Pago: al llegar al hotel. Total a pagar en recepción: ${formatCOP(d.total)}.\n`;
  } else {
    const btnLabel =
      d.payMode === "deposit"
        ? `Pagar abono · ${formatCOP(d.amountToPay)}`
        : `Pagar ahora · ${formatCOP(d.amountToPay)}`;
    const expiry = d.linkExpiresMinutes
      ? `<p style="margin:8px 0 0;color:#9ca3af;font-size:12px;">Este enlace de pago vence en ${d.linkExpiresMinutes} minutos.</p>`
      : "";
    const balance =
      d.payMode === "deposit" && d.balanceAtHotel > 0
        ? `<p style="margin:6px 0 0;color:#4b5563;font-size:13px;">Saldo restante a pagar al llegar al hotel: <strong>${formatCOP(d.balanceAtHotel)}</strong>.</p>`
        : "";
    payBlock = d.paymentUrl
      ? `
      <div style="margin:6px 14px 2px;padding:16px;background:#f0f6ea;border:1px solid #d8e8c8;border-radius:12px;text-align:center;">
        <p style="margin:0 0 10px;color:#2f5711;font-size:14px;font-weight:700;">${d.payMode === "deposit" ? "Aparta tu reserva con el abono" : "Completa tu pago para confirmar"}</p>
        <a href="${d.paymentUrl}" style="display:inline-block;background:#2f5711;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:10px;font-weight:700;font-size:15px;">${btnLabel}</a>
        ${balance}
        ${expiry}
      </div>`
      : `
      <div style="margin:6px 14px 2px;padding:14px 16px;background:#fdf6e3;border:1px solid #f0e2b6;border-radius:12px;">
        <p style="margin:0 0 4px;color:#8a6d1a;font-size:14px;font-weight:700;">Pago pendiente</p>
        <p style="margin:0;color:#4b5563;font-size:13px;">No pudimos generar el enlace de pago automáticamente. El hotel te contactará para completar el pago de <strong>${formatCOP(d.amountToPay)}</strong>.</p>
      </div>`;
    payText =
      (d.payMode === "deposit"
        ? `Abono a pagar ahora: ${formatCOP(d.amountToPay)}. Saldo al llegar: ${formatCOP(d.balanceAtHotel)}.\n`
        : `Total a pagar en línea: ${formatCOP(d.amountToPay)}.\n`) +
      (d.paymentUrl ? `Paga aquí: ${d.paymentUrl}\n` : `El hotel te contactará para completar el pago.\n`);
  }

  const html = `<div style="background:#f5f4ef;padding:24px;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #eae7df;">
    <div style="background:#2f5711;padding:22px;text-align:center;">
      <p style="margin:0;color:#e9d9a6;font-size:12px;letter-spacing:2px;text-transform:uppercase;">Santa Alejandría · Cartagena</p>
      <p style="margin:6px 0 0;color:#ffffff;font-size:22px;font-weight:700;">¡Gracias por tu reserva!</p>
    </div>
    <div style="padding:20px 22px 6px;">
      <p style="margin:0 0 4px;color:#1f2937;font-size:15px;">Hola <strong>${d.guestName}</strong>,</p>
      <p style="margin:0;color:#4b5563;font-size:14px;">Hemos recibido tu reserva <strong>#${d.number}</strong>. Estos son los detalles:</p>
    </div>
    <div style="padding:4px 8px;">
      <table style="width:100%;border-collapse:collapse;">
        ${row("Habitación", rooms)}
        ${row("Entrada", formatDate(d.checkIn))}
        ${row("Salida", formatDate(d.checkOut))}
        ${row("Noches", String(d.nights))}
        ${row("Huéspedes", String(d.guestsCount))}
        ${row("Subtotal", formatCOP(d.subtotal))}
        ${d.iva > 0 ? row("IVA 19%", formatCOP(d.iva)) : ""}
        ${row("Total", formatCOP(d.total))}
      </table>
    </div>
    ${payBlock}
    <div style="padding:16px 22px;background:#faf9f5;border-top:1px solid #eae7df;margin-top:10px;">
      <p style="margin:0 0 4px;color:#6b7280;font-size:13px;">¿Dudas o cambios? Responde a este correo o escríbenos a <a href="mailto:${replyTo}" style="color:#2f5711;">${replyTo}</a>.</p>
      <p style="margin:0;color:#9ca3af;font-size:12px;">Santa Alejandría Hotels · Cartagena · santalejandriahotels.com</p>
    </div>
  </div>
</div>`;

  const text =
    `¡Gracias por tu reserva, ${d.guestName}!\n\n` +
    `Reserva #${d.number}\n` +
    `Habitación: ${rooms}\n` +
    `Entrada: ${formatDate(d.checkIn)} · Salida: ${formatDate(d.checkOut)}\n` +
    `Noches: ${d.nights} · Huéspedes: ${d.guestsCount}\n` +
    `Subtotal: ${formatCOP(d.subtotal)}` +
    (d.iva > 0 ? ` · IVA 19%: ${formatCOP(d.iva)}` : "") +
    ` · Total: ${formatCOP(d.total)}\n` +
    payText +
    `\n¿Dudas? Escríbenos a ${replyTo}\nSanta Alejandría Hotels · Cartagena\n`;

  return { subject, html, text };
}
