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
import { appendFile, mkdir } from "node:fs/promises";
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
