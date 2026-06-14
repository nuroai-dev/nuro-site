import type { APIRoute } from "astro";

import {
  saveWaitlistEntry,
  type WaitlistEntry,
} from "@/lib/waitlist/save-waitlist-entry";

/**
 * `POST /api/waitlist` (card N-12 — stub backend).
 *
 * Validates `{ email, role, student_ages: string[], message? }` and returns
 * 400 `{ ok: false, reason: "invalid" }` on bad input, 200 `{ ok: true }`
 * otherwise. Persistence is isolated behind `saveWaitlistEntry()`.
 */

// This endpoint is dynamic (server-rendered output); never prerender it.
export const prerender = false;

/** Same pragmatic email check the waitlist form uses client-side. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Length caps so an unauthenticated endpoint can't flood server logs. */
const MAX_EMAIL = 254;
const MAX_ROLE = 100;
const MAX_MESSAGE = 2000;
const MAX_AGES = 10;
const MAX_AGE_ITEM = 50;

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function parseEntry(body: unknown): WaitlistEntry | null {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return null;
  }
  const { email, role, student_ages, message } = body as Record<
    string,
    unknown
  >;

  if (typeof email !== "string") return null;
  const trimmedEmail = email.trim();
  if (trimmedEmail.length > MAX_EMAIL || !EMAIL_RE.test(trimmedEmail)) {
    return null;
  }

  if (typeof role !== "string") return null;
  const trimmedRole = role.trim();
  if (trimmedRole.length === 0 || trimmedRole.length > MAX_ROLE) return null;

  if (!Array.isArray(student_ages) || student_ages.length > MAX_AGES) {
    return null;
  }
  if (
    !student_ages.every(
      (age) => typeof age === "string" && age.length <= MAX_AGE_ITEM,
    )
  ) {
    return null;
  }

  if (message !== undefined && typeof message !== "string") return null;
  const safeMessage = (message ?? "").slice(0, MAX_MESSAGE);

  return {
    email: trimmedEmail,
    role: trimmedRole,
    student_ages: student_ages as string[],
    message: safeMessage,
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
    await saveWaitlistEntry(entry);
  } catch (error) {
    console.error("[waitlist] saveWaitlistEntry failed", error);
    return json({ ok: false }, 500);
  }

  return json({ ok: true });
};
