import { NextRequest } from "next/server";
import { handleBoldWebhook, boldWebhookGet } from "@/lib/boldWebhook";

export const runtime = "nodejs";

// Alias: Bold puede estar enviando a esta ruta (guion) en vez de /api/webhooks/bold.
export async function POST(req: NextRequest) {
  return handleBoldWebhook(req);
}

export function GET() {
  return boldWebhookGet();
}
