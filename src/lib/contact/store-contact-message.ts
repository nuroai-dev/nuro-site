/**
 * Durable capture for contact messages.
 *
 * Email delivery is best-effort: the API key can be missing, and Resend can
 * fail. Before this existed, a submission with no RESEND_API_KEY was written to
 * the container log and nothing else, so the visitor was thanked and the
 * message was gone. Every message is now appended to a JSON Lines file on the
 * same persistent volume the waitlist uses, before any send is attempted, so a
 * message can always be recovered even when mail is down or misconfigured.
 *
 * Read them back with `GET /api/contact-export` (bearer token).
 */
import { appendFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import type { ContactEntry } from "./save-contact-entry";

const DATA_DIR = process.env.CONTACT_DIR || "/data";
const FILE = join(DATA_DIR, "contact.jsonl");

/**
 * Append the message as one JSON line, stamped with a server-side received_at.
 * Throws on write failure so the route returns 500 and the visitor is asked to
 * retry, which is the honest outcome when we could not hold on to the message.
 */
export async function storeContactMessage(entry: ContactEntry): Promise<void> {
  const record = { received_at: new Date().toISOString(), ...entry };
  await mkdir(DATA_DIR, { recursive: true });
  await appendFile(FILE, JSON.stringify(record) + "\n", "utf8");
}
