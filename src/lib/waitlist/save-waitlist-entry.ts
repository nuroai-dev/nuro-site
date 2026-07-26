/**
 * Persistence seam for the waitlist.
 *
 * Waitlist signups are appended as JSON Lines to a file on a persistent
 * volume — one entry per line — so the team can review them later. No email
 * is sent (by design): the entry is stored, nothing more.
 *
 * The file lives on the gate volume mounted at `/data` (see gate.json
 * `services.www.volumes`). On the host that is
 * `/home/shared/<org>/volumes/nuro-site/data/waitlist.jsonl`, which survives
 * redeploys. Override the directory with WAITLIST_DIR if needed.
 */
import { appendFile, mkdir, readFile } from "node:fs/promises";
import { join } from "node:path";

/** A validated waitlist submission, matching the N-12 request contract. */
export type WaitlistEntry = {
  email: string;
  role: string;
  student_ages: string[];
  message: string;
};

const DATA_DIR = process.env.WAITLIST_DIR || "/data";
const FILE = join(DATA_DIR, "waitlist.jsonl");

/**
 * Append the entry as one JSON line. Stamps a server-side received_at so the
 * team can see when each signup arrived. Throws on write failure so the route
 * returns 500 and the visitor is told to retry (better than silently losing a
 * signup).
 */
export async function saveWaitlistEntry(entry: WaitlistEntry): Promise<void> {
  const record = {
    received_at: new Date().toISOString(),
    ...entry,
  };

  await mkdir(DATA_DIR, { recursive: true });
  await appendFile(FILE, JSON.stringify(record) + "\n", "utf8");

  // Lightweight server-side breadcrumb (no PII beyond the role), handy in logs.
  console.log(`[waitlist] saved entry (role=${entry.role}) -> ${FILE}`);
}

/** Normalised form used to compare addresses: trimmed and lower-cased. */
const normalise = (email: string) => email.trim().toLowerCase();

/**
 * True when this address is already on the list.
 *
 * The client has always had a "you are already on the list" state and handled
 * a 409, but nothing ever returned one, so the state was unreachable and the
 * file collected duplicate rows for the same person.
 *
 * Comparison is case-insensitive, so Anna@Skola.se and anna@skola.se are the
 * same signup. Malformed lines are skipped rather than throwing: one bad line
 * must not take down signups. Reading the whole file per POST is fine at
 * waitlist scale and keeps the JSON Lines file as the single source of truth.
 */
export async function waitlistHasEmail(email: string): Promise<boolean> {
  const target = normalise(email);
  let raw: string;
  try {
    raw = await readFile(FILE, "utf8");
  } catch {
    // No file yet means nobody has signed up, so nothing can be a duplicate.
    return false;
  }

  for (const line of raw.split("\n")) {
    if (line.trim() === "") continue;
    try {
      const row = JSON.parse(line) as { email?: unknown };
      if (typeof row.email === "string" && normalise(row.email) === target) {
        return true;
      }
    } catch {
      continue;
    }
  }
  return false;
}
