import type { APIRoute } from "astro";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * `GET /api/waitlist-export` — protected read of the stored waitlist.
 *
 * The signups file (`/data/waitlist.jsonl`) is owned by the container user and
 * is not readable from outside the app, so this endpoint is how the team
 * reviews entries. Requires a bearer token that matches WAITLIST_EXPORT_TOKEN.
 *
 *   curl -H "Authorization: Bearer <token>" https://nuroai.dev/api/waitlist-export
 *
 * Returns `{ count, entries }` as JSON, or `?format=jsonl` for the raw lines.
 */
export const prerender = false;

const DATA_DIR = process.env.WAITLIST_DIR || "/data";
const FILE = join(DATA_DIR, "waitlist.jsonl");

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const GET: APIRoute = async ({ request, url }) => {
  const token = process.env.WAITLIST_EXPORT_TOKEN;
  if (!token) {
    return json({ ok: false, reason: "export not configured" }, 503);
  }

  const auth = request.headers.get("authorization") ?? "";
  const provided = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (provided !== token) {
    return json({ ok: false, reason: "unauthorized" }, 401);
  }

  let raw: string;
  try {
    raw = await readFile(FILE, "utf8");
  } catch (err) {
    // No file yet → no signups yet.
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      return url.searchParams.get("format") === "jsonl"
        ? new Response("", { headers: { "Content-Type": "text/plain" } })
        : json({ ok: true, count: 0, entries: [] });
    }
    return json({ ok: false, reason: "read failed" }, 500);
  }

  if (url.searchParams.get("format") === "jsonl") {
    return new Response(raw, { headers: { "Content-Type": "text/plain" } });
  }

  const entries = raw
    .split("\n")
    .filter((line) => line.trim().length > 0)
    .map((line) => {
      try {
        return JSON.parse(line);
      } catch {
        return { _unparsed: line };
      }
    });

  return json({ ok: true, count: entries.length, entries });
};
