import { NextRequest } from "next/server";

const sheetsWebhookUrl = process.env.SHEETS_WEBHOOK_URL;
const allowedOrigin =
  process.env.SHEETS_ALLOWED_ORIGIN || "https://forrestbsmith.github.io";

const baseHeaders = {
  "Access-Control-Allow-Origin": allowedOrigin,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "3600",
};

const withCors = (
  body: BodyInit | null,
  init?: ResponseInit,
  contentType = "application/json"
) =>
  new Response(body, {
    ...(init || {}),
    headers: {
      "Content-Type": contentType,
      ...baseHeaders,
      ...(init?.headers || {}),
    },
  });

export async function OPTIONS() {
  return withCors(null, { status: 204 });
}

export async function POST(req: NextRequest) {
  if (!sheetsWebhookUrl) {
    return withCors(
      JSON.stringify({ ok: false, error: "SHEETS_WEBHOOK_URL not configured" }),
      { status: 500 }
    );
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return withCors(
      JSON.stringify({ ok: false, error: "Invalid JSON body" }),
      { status: 400 }
    );
  }

  try {
    const upstream = await fetch(sheetsWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const text = await upstream.text();
    let data: unknown = text;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }

    if (!upstream.ok) {
      return withCors(
        JSON.stringify({
          ok: false,
          status: upstream.status,
          upstream: data,
        }),
        { status: 502 }
      );
    }

    return withCors(
      JSON.stringify({
        ok: true,
        upstream: data,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Sheets proxy failed", error);
    return withCors(
      JSON.stringify({
        ok: false,
        error: "Unable to reach the Sheets webhook",
      }),
      { status: 502 }
    );
  }
}
