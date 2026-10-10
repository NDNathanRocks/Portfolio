import { NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";

export const runtime = "nodejs";

const schema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.email().max(200),
  other: z.string().trim().max(200).optional().default(""),
  message: z.string().trim().min(10).max(4000),
  website: z.string().max(200).optional().default(""),
  elapsed: z.number().optional().default(0),
});

const MAX_BODY = 16_000;
const MIN_FILL_MS = 2500;
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, { count: number; reset: number }>();

function limited(ip: string) {
  const now = Date.now();
  for (const [key, entry] of hits) if (entry.reset < now) hits.delete(key);
  const entry = hits.get(ip);
  if (!entry) {
    hits.set(ip, { count: 1, reset: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_PER_WINDOW;
}

const oneLine = (s: string) => s.replace(/[\u0000-\u001f\u007f]+/g, " ").trim();

export async function POST(req: Request) {
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (origin && host) {
    try {
      if (new URL(origin).host !== host) return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    } catch {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }
  }

  const raw = await req.text();
  if (raw.length > MAX_BODY) return NextResponse.json({ error: "Message is too large." }, { status: 413 });

  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please check your name, email and message (10+ characters)." }, { status: 400 });
  }
  const { name, email, other, message, website, elapsed } = parsed.data;

  if (website || elapsed < MIN_FILL_MS) return NextResponse.json({ ok: true });

  const ip = (req.headers.get("x-forwarded-for") ?? "unknown").split(",")[0].trim();
  if (limited(ip)) {
    return NextResponse.json({ error: "Too many messages. Please try again later." }, { status: 429 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  if (!apiKey || !to) {
    return NextResponse.json({ error: "The contact form isn't configured yet. Please email me directly." }, { status: 503 });
  }

  const lines = [`From: ${oneLine(name)} <${email}>`];
  if (other) lines.push(`Other contact: ${oneLine(other)}`);
  lines.push("", message);

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: process.env.CONTACT_FROM || "Portfolio <onboarding@resend.dev>",
      to: [to],
      replyTo: email,
      headers: { "X-Priority": "1", Importance: "high" },
      subject: `Portfolio message from ${oneLine(name).slice(0, 80)}`,
      text: lines.join("\n"),
    });
    if (error) return NextResponse.json({ error: "Couldn't send your message. Please try again." }, { status: 502 });
  } catch {
    return NextResponse.json({ error: "Couldn't send your message. Please try again." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
