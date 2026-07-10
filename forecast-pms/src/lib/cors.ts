import { NextResponse } from "next/server";

const ALLOWED_ORIGINS = new Set([
  "https://santalejandriahotels.com",
  "https://www.santalejandriahotels.com",
  "http://localhost:8080",
  "http://localhost:5173",
  "http://localhost:3000",
]);

export function corsHeaders(origin: string | null): Record<string, string> {
  const allow = origin && ALLOWED_ORIGINS.has(origin) ? origin : "https://santalejandriahotels.com";
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

export function corsJson(
  origin: string | null,
  body: unknown,
  init?: { status?: number },
): NextResponse {
  return NextResponse.json(body, { status: init?.status ?? 200, headers: corsHeaders(origin) });
}

export function corsPreflight(origin: string | null): NextResponse {
  return new NextResponse(null, { status: 204, headers: corsHeaders(origin) });
}
