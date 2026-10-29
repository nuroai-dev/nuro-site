/** Same persistent JSONL store as the existing site; email-first entries may add answers later. */
import {
  appendFile,
  mkdir,
  readFile,
  rename,
  writeFile,
} from "node:fs/promises";
import { join } from "node:path";
import {
  createHash,
  randomBytes,
  randomUUID,
  timingSafeEqual,
} from "node:crypto";
export type WaitlistEntry = {
  email: string;
  role: string;
  student_ages: string[];
  message: string;
};
const directory = process.env.WAITLIST_DIR || "/data";
const file = join(directory, "waitlist.jsonl");
let pending: Promise<unknown> = Promise.resolve();
// All writes in the standalone Node server use the same queue, including legacy forms.
function exclusive<T>(work: () => Promise<T>): Promise<T> {
  const task = pending.then(work, work);
  pending = task.catch(() => {});
  return task;
}
const normalize = (email: string) => email.trim().toLowerCase();
const hash = (token: string) =>
  createHash("sha256").update(token).digest("hex");
async function readLines(): Promise<string[]> {
  try {
    return (await readFile(file, "utf8")).split("\n").filter(Boolean);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}
function row(line: string): Record<string, unknown> | null {
  try {
    return JSON.parse(line);
  } catch {
    return null;
  }
}
export async function waitlistHasEmail(email: string) {
  return (await readLines()).some((line) => {
    const value = row(line)?.email;
    return typeof value === "string" && normalize(value) === normalize(email);
  });
}
export function joinWaitlistEntry(entry: WaitlistEntry) {
  return exclusive(async () => {
    if (await waitlistHasEmail(entry.email))
      return { duplicate: true as const };
    const id = randomUUID(),
      editToken = randomBytes(32).toString("hex");
    await mkdir(directory, { recursive: true });
    await appendFile(
      file,
      JSON.stringify({
        ...entry,
        email: normalize(entry.email),
        received_at: new Date().toISOString(),
        id,
        edit_token_hash: hash(editToken),
      }) + "\n",
      { encoding: "utf8", mode: 0o600 },
    );
    return { duplicate: false as const, id, editToken };
  });
}
export async function saveWaitlistEntry(entry: WaitlistEntry): Promise<void> {
  await joinWaitlistEntry(entry);
}
export function updateWaitlistEntry(
  id: string,
  editToken: string,
  details: { roles: string[]; student_ages: string[]; message: string },
) {
  return exclusive(async () => {
    const lines = await readLines();
    const index = lines.findIndex((line) => row(line)?.id === id);
    if (index < 0) return false;
    const existing = row(lines[index])!;
    const stored = existing.edit_token_hash;
    if (
      typeof stored !== "string" ||
      stored.length !== 64 ||
      !timingSafeEqual(
        Buffer.from(stored, "hex"),
        Buffer.from(hash(editToken), "hex"),
      )
    )
      return false;
    lines[index] = JSON.stringify({
      ...existing,
      ...details,
      role: details.roles.join(", ") || "Not specified",
      updated_at: new Date().toISOString(),
    });
    const temporary = join(directory, `.waitlist-${randomUUID()}.tmp`);
    await writeFile(temporary, lines.join("\n") + "\n", {
      encoding: "utf8",
      mode: 0o600,
    });
    await rename(temporary, file);
    return true;
  });
}
