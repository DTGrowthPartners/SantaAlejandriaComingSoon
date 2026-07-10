/**
 * Service layer de Bold (pasarela de pagos Colombia).
 * Docs: https://developers.bold.co/pagos-en-linea/api-link-de-pagos
 */

const BOLD_LINK_API = "https://integrations.api.bold.co/online/link/v1";

export type BoldLinkResult = {
  paymentLinkId: string; // "LNK_xxx"
  url: string; // https://checkout.bold.co/LNK_xxx
  raw: unknown;
};

export async function createBoldPaymentLink(params: {
  /** Referencia externa única (ej. "RSV-123"); vuelve en el webhook como metadata.reference. */
  reference: string;
  /** Subtotal en COP (sin IVA). */
  subtotal: number;
  /** IVA en COP. */
  iva: number;
  description: string;
  payerEmail?: string | null;
  /** URL a la que Bold redirige al pagador al terminar. */
  callbackUrl?: string;
  /** Milisegundos epoch de expiración del link (opcional). */
  expirationDate?: number;
}): Promise<BoldLinkResult> {
  const apiKey = process.env.BOLD_API_KEY;
  if (!apiKey) throw new Error("BOLD_API_KEY no está configurada");

  const total = params.subtotal + params.iva;

  const body = {
    amount_type: "CLOSE",
    amount: {
      currency: "COP",
      total_amount: total,
      tip_amount: 0,
      taxes: [
        {
          type: "VAT",
          base: params.subtotal,
          value: params.iva,
        },
      ],
    },
    reference: params.reference,
    description: params.description.slice(0, 100),
    ...(params.payerEmail ? { payer_email: params.payerEmail } : {}),
    ...(params.callbackUrl ? { callback_url: params.callbackUrl } : {}),
    ...(params.expirationDate ? { expiration_date: params.expirationDate } : {}),
  };

  const res = await fetch(BOLD_LINK_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `x-api-key ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  const json = (await res.json().catch(() => ({}))) as {
    payload?: { payment_link?: string; url?: string };
    errors?: unknown[];
  };

  if (!res.ok || !json.payload?.url) {
    throw new Error(
      `Bold link error (HTTP ${res.status}): ${JSON.stringify(json.errors ?? json).slice(0, 300)}`,
    );
  }

  return {
    paymentLinkId: json.payload.payment_link ?? "",
    url: json.payload.url,
    raw: json,
  };
}

/**
 * Verifica la firma del webhook de Bold.
 * Firma = HMAC-SHA256( base64(rawBody), llaveSecreta ) en hex, header `x-bold-signature`.
 * Nota: en ambiente de PRUEBAS la llave secreta del webhook es cadena vacía ''.
 */
export async function verifyBoldSignature(
  rawBody: string,
  signature: string | null,
): Promise<boolean> {
  if (!signature) return false;

  const { createHmac, timingSafeEqual } = await import("node:crypto");
  const encoded = Buffer.from(rawBody, "utf8").toString("base64");

  // En pruebas Bold puede firmar con secreto vacío o con la llave secreta;
  // aceptamos cualquiera de los candidatos configurados.
  const candidates = Array.from(
    new Set([process.env.BOLD_WEBHOOK_SECRET ?? "", process.env.BOLD_SECRET ?? "", ""]),
  );
  for (const secret of candidates) {
    const expected = createHmac("sha256", secret).update(encoded).digest("hex");
    if (expected.length === signature.length) {
      try {
        if (timingSafeEqual(Buffer.from(expected), Buffer.from(signature))) return true;
      } catch {
        /* longitudes distintas */
      }
    }
  }
  return false;
}
