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
  transporter = nodemailer.createTransport({ host, port, secure, auth: { user, pass } });
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
