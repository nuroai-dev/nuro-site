/** Production entry point: verify the existing Node + persistent-volume contract. */
import { mkdir, open, unlink } from "node:fs/promises";
import { join, isAbsolute } from "node:path";
import { randomUUID } from "node:crypto";

const required = ["RESEND_API_KEY", "WAITLIST_EXPORT_TOKEN"];
const missing = required.filter((name) => !process.env[name]?.trim());
if (missing.length) {
  console.error(`Cannot start: configure ${missing.join(", ")} on the host. See README.md.`);
  process.exit(1);
}

for (const name of ["WAITLIST_DIR", "CONTACT_DIR"]) {
  const directory = process.env[name] || "/data";
  if (!isAbsolute(directory)) throw new Error(`${name} must be an absolute persistent-volume path.`);
  process.env[name] = directory;
  await mkdir(directory, { recursive: true });
  const probe = join(directory, `.nuro-write-check-${randomUUID()}`);
  const handle = await open(probe, "wx", 0o600);
  await handle.close();
  await unlink(probe);
}

process.env.NODE_ENV = "production";
process.env.HOST ||= "0.0.0.0";
process.env.PORT ||= "3000";
await import("../dist/server/entry.mjs");
