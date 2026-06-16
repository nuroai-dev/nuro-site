import type { APIRoute } from "astro";

import {
  saveContactEntry,
  type ContactEntry,
} from "@/lib/contact/save-contact-entry";

/**
 * `POST /api/contact` (stub backend, mirrors /api/waitlist).
 *
 * Validates `{ name, email, message }` and returns 400 `{ ok: false }` on bad
 * input, 200 `{ ok: true }` otherwise. Persistence is isolated behind
 * `saveContactEntry()`.
 */

// Dynamic endpoint (server-rendered output); never prerender it.
export const prerender = false;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const MAX_NAME = 120;
const MAX_EMAIL = 254;
const MAX_MESSAGE = 4000;

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function parseEntry(body: unknown): ContactEntry | null {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return null;
  }
  const { name, email, message } = body as Record<string, unknown>;

  if (typeof name !== "string") return null;
  const trimmedName = name.trim();
  if (trimmedName.length === 0 || trimmedName.length > MAX_NAME) return null;

  if (typeof email !== "string") return null;
  const trimmedEmail = email.trim();
  if (trimmedEmail.length > MAX_EMAIL || !EMAIL_RE.test(trimmedEmail)) {
    return null;
  }

  if (typeof message !== "string") return null;
  const trimmedMessage = message.trim();
  if (trimmedMessage.length === 0 || trimmedMessage.length > MAX_MESSAGE) {
    return null;
  }

  return {
    name: trimmedName,
    email: trimmedEmail,
    message: trimmedMessage,
  };
}

export const POST: APIRoute = async ({ request }) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, reason: "invalid" }, 400);
  }

  const entry = parseEntry(body);
  if (entry === null) {
    return json({ ok: false, reason: "invalid" }, 400);
  }

  try {
    await saveContactEntry(entry);
  } catch (error) {
    console.error("[contact] saveContactEntry failed", error);
    return json({ ok: false }, 500);
  }

  return json({ ok: true });
};
