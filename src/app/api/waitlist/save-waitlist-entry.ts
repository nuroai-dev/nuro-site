/**
 * Persistence seam for the waitlist (card N-12 — STUB ONLY).
 *
 * The real backend (Supabase insert + confirmation email, per SPEC §6 N-12 /
 * deferred-work note) replaces ONLY this module. The route handler must never
 * know how entries are stored.
 */

/** A validated waitlist submission, matching the N-12 request contract. */
export type WaitlistEntry = {
  email: string;
  role: string;
  student_ages: string[];
  message: string;
};

/**
 * Stub implementation: logs the payload server-side, per the card. No
 * Supabase, no external deps, no env vars.
 */
export async function saveWaitlistEntry(entry: WaitlistEntry): Promise<void> {
  console.log("[waitlist] new entry", JSON.stringify(entry));
}
