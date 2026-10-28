import type { APIRoute } from "astro";
import { WAITLIST_ROLES, WAITLIST_AGES } from "@/lib/waitlist/options";
import { ROLE_OPTIONS, getCopy } from "@/components/waitlist/copy";

const legacyRoles = new Set<string>(["Not specified", ...WAITLIST_ROLES, ...ROLE_OPTIONS, ...getCopy("sv").roleOptions]);
import {
  joinWaitlistEntry,
  updateWaitlistEntry,
  type WaitlistEntry,
} from "@/lib/waitlist/save-waitlist-entry";
export const prerender = false;
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function object(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
function strings(
  value: unknown,
  max: number,
  length: number,
): value is string[] {
  return (
    Array.isArray(value) &&
    value.length <= max &&
    value.every((item) => typeof item === "string" && item.length <= length)
  );
}
export const POST: APIRoute = async ({ request }) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, reason: "invalid" }, 400);
  }
  if (
    !object(body) ||
    typeof body.email !== "string" ||
    body.email.trim().length > 254 ||
    !emailPattern.test(body.email.trim())
  )
    return json({ ok: false, reason: "invalid" }, 400);
  // Old forms still send role/ages; the new first step only needs an email.
  const role = body.role === undefined ? "Not specified" : body.role;
  const ages = body.student_ages ?? [];
  const message = body.message ?? "";
  if (
    typeof role !== "string" ||
    !legacyRoles.has(role.trim()) ||
    !strings(ages, 10, 50) ||
    typeof message !== "string" ||
    message.length > 2000
  )
    return json({ ok: false, reason: "invalid" }, 400);
  const entry: WaitlistEntry = {
    email: body.email.trim(),
    role: role.trim(),
    student_ages: ages,
    message,
  };
  try {
    const result = await joinWaitlistEntry(entry);
    if (result.duplicate) return json({ ok: false, reason: "duplicate" }, 409);
    return json({ ok: true, id: result.id, editToken: result.editToken });
  } catch {
    console.error("[waitlist] storage unavailable");
    return json({ ok: false }, 500);
  }
};
export const PATCH: APIRoute = async ({ request }) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, reason: "invalid" }, 400);
  }
  if (
    !object(body) ||
    typeof body.id !== "string" ||
    !/^[\da-f-]{36}$/i.test(body.id) ||
    typeof body.editToken !== "string" ||
    !/^[\da-f]{64}$/i.test(body.editToken)
  )
    return json({ ok: false, reason: "invalid" }, 400);
  const roles = body.roles,
    ages = body.student_ages,
    message = body.message ?? "";
  if (
    !strings(roles, WAITLIST_ROLES.length, 20) ||
    !roles.every((r) =>
      (WAITLIST_ROLES as readonly string[]).includes(r),
    ) ||
    !strings(ages, 5, 20) ||
    !ages.every((a) =>
      (WAITLIST_AGES as readonly string[]).includes(a),
    ) ||
    typeof message !== "string" ||
    message.length > 1000
  )
    return json({ ok: false, reason: "invalid" }, 400);
  if (ages.includes("not-applicable") && ages.length > 1)
    return json({ ok: false, reason: "invalid" }, 400);
  try {
    const updated = await updateWaitlistEntry(body.id, body.editToken, {
      roles: [...new Set(roles)],
      student_ages: [...new Set(ages)],
      message,
    });
    return updated
      ? json({ ok: true })
      : json({ ok: false, reason: "unauthorized" }, 403);
  } catch {
    console.error("[waitlist] update unavailable");
    return json({ ok: false }, 500);
  }
};
