const DIRECTUS_URL =
  import.meta.env.VITE_DIRECTUS_URL ?? "https://cms.santalejandriahotels.com";

function hotelFromPath(path: string): string {
  if (path.startsWith("/cartagena")) return "cartagena";
  if (path.startsWith("/medellin")) return "medellin";
  return "home";
}

/** Registra (fire-and-forget) un clic en un botón de WhatsApp en Directus. */
export function logWhatsappClick(anchor: HTMLAnchorElement) {
  try {
    const label =
      (anchor.getAttribute("aria-label") || anchor.textContent || "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 120) || "WhatsApp";
    const payload = {
      hotel: hotelFromPath(window.location.pathname),
      label,
      page: window.location.pathname || "/",
      user_agent: (navigator.userAgent || "").slice(0, 250),
    };
    fetch(`${DIRECTUS_URL}/items/whatsapp_clicks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
      mode: "cors",
    }).catch(() => {
      /* el tracking nunca debe romper la navegación */
    });
  } catch {
    /* ignore */
  }
}

/**
 * Instala un listener global que detecta clics en enlaces de WhatsApp (wa.me)
 * en cualquier parte de la web y los registra. Devuelve la función de limpieza.
 */
export function installWhatsappTracker(): () => void {
  const handler = (e: MouseEvent) => {
    const target = e.target as Element | null;
    const anchor = target?.closest("a") as HTMLAnchorElement | null;
    if (!anchor) return;
    const href = anchor.href || "";
    if (/wa\.me\/|api\.whatsapp\.com|whatsapp:\/\//i.test(href)) {
      logWhatsappClick(anchor);
    }
  };
  document.addEventListener("click", handler, true); // fase de captura
  return () => document.removeEventListener("click", handler, true);
}
