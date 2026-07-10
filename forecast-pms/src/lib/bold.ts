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

export type BoldLink = {
  id: string;
  total: number;
  status: string; // ACTIVE | PAID | EXPIRED | VOIDED | ...
  description: string | null;
  currency: string;
  expiration_date?: number | null;
  subtotal?: number;
  reference?: string | null;
  payment_method?: string | null;
  transaction_id?: string | null;
  creation_date?: number;
};

/** Lista los links de pago de Bold (paginado). Solo funciona con llaves de producción. */
export async function listBoldLinks(
  page = 1,
  pageSize = 50,
): Promise<{ page: number; totalPages: number; links: BoldLink[] }> {
  const apiKey = process.env.BOLD_API_KEY;
  if (!apiKey) return { page: 1, totalPages: 0, links: [] };
  try {
    const res = await fetch(`${BOLD_LINK_API}?page_size=${pageSize}&page=${page}`, {
      headers: { Authorization: `x-api-key ${apiKey}` },
      cache: "no-store",
    });
    if (!res.ok) return { page, totalPages: 0, links: [] };
    const j = (await res.json()) as { page?: number; total_pages?: number; links?: BoldLink[] };
    return { page: j.page ?? page, totalPages: j.total_pages ?? 1, links: j.links ?? [] };
  } catch {
    return { page, totalPages: 0, links: [] };
  }
}

/**
 * Trae TODOS los links de Bold (todas las páginas) y los ordena de más nuevos a
 * más viejos. Bold no expone fecha de creación ni acepta orden, así que se usa la
 * fecha de vencimiento como referencia; los links sin vencimiento (los que genera
 * el PMS por API) quedan de primeros por ser los más recientes.
 */
export async function listAllBoldLinks(pageSize = 50, maxPages = 20): Promise<BoldLink[]> {
  const first = await listBoldLinks(1, pageSize);
  const total = Math.min(first.totalPages || 1, maxPages);
  const rest =
    total > 1
      ? await Promise.all(
          Array.from({ length: total - 1 }, (_, i) => listBoldLinks(i + 2, pageSize)),
        )
      : [];
  const all = [...first.links, ...rest.flatMap((r) => r.links)];
  all.sort((a, b) => {
    const ea = a.expiration_date ?? Number.MAX_VALUE;
    const eb = b.expiration_date ?? Number.MAX_VALUE;
    return eb - ea; // descendente: más nuevo primero
  });
  return all;
}

/** Consulta el estado de un link de pago por su id (LNK_xxx). */
export async function getBoldLink(id: string): Promise<BoldLink | null> {
  const apiKey = process.env.BOLD_API_KEY;
  if (!apiKey) return null;
  try {
    const res = await fetch(`${BOLD_LINK_API}/${id}`, {
      headers: { Authorization: `x-api-key ${apiKey}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as BoldLink;
  } catch {
    return null;
  }
}

/**
 * Verifica la firma del webhook de Bold.
 * Firma = HMAC-SHA256( base64(rawBody), llaveSecreta ) en hex, header `x-bold-signature`.
 * En PRUEBAS Bold puede firmar con secreto vacío ''; en PRODUCCIÓN se firma con la
 * llave secreta. Solo se acepta '' si BOLD_TEST_MODE=true (si no, se podría falsificar).
 */
export async function verifyBoldSignature(
  rawBody: string,
  signature: string | null,
): Promise<boolean> {
  if (!signature) return false;

  const { createHmac, timingSafeEqual } = await import("node:crypto");
  const encoded = Buffer.from(rawBody, "utf8").toString("base64");

  const configured = [process.env.BOLD_WEBHOOK_SECRET, process.env.BOLD_SECRET].filter(
    (s): s is string => typeof s === "string" && s.length > 0,
  );
  // El secreto vacío SOLO es válido en modo pruebas explícito.
  const candidates = Array.from(
    new Set(process.env.BOLD_TEST_MODE === "true" ? [...configured, ""] : configured),
  );
  if (candidates.length === 0) return false;

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
