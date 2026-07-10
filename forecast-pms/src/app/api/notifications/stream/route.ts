import type { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { notifyBus } from "@/lib/notifyBus";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * SSE: empuja un evento al navegador en cuanto entra/mueve una reserva,
 * para que la notificación salga al instante (sin esperar al polling).
 */
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return new Response("no auth", { status: 401 });
  const hotelId = session.hotelId;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const enc = new TextEncoder();
      let closed = false;
      const send = (data: unknown) => {
        if (closed) return;
        try {
          controller.enqueue(enc.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch {
          /* stream ya cerrado */
        }
      };

      send({ type: "ready" });

      const onChanged = (hid: string) => {
        if (hid === hotelId) send({ type: "changed" });
      };
      notifyBus.on("changed", onChanged);

      // Heartbeat: mantiene viva la conexión a través de nginx/proxies.
      const keepAlive = setInterval(() => send({ type: "ping" }), 25000);

      const close = () => {
        if (closed) return;
        closed = true;
        clearInterval(keepAlive);
        notifyBus.off("changed", onChanged);
        try {
          controller.close();
        } catch {
          /* ya cerrado */
        }
      };

      req.signal.addEventListener("abort", close);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      // Evita el buffering de nginx para que el push llegue de inmediato.
      "X-Accel-Buffering": "no",
    },
  });
}
