import { WAITLIST_ROLES, WAITLIST_AGES } from "./options";
export { WAITLIST_ROLES, WAITLIST_AGES } from "./options";

export type WaitlistRole = (typeof WAITLIST_ROLES)[number];
export type WaitlistAge = (typeof WAITLIST_AGES)[number];
export type WaitlistDetails = {
  roles: WaitlistRole[];
  student_ages: WaitlistAge[];
  message: string;
};
export type WaitlistEntry = WaitlistDetails & {
  id: string;
  email: string;
  editToken?: string;
};
export const waitlistEmail = {
  safeParse(value: string) {
    const data = value.trim().toLowerCase();
    return {
      success: data.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data),
      data,
    };
  },
};
export async function joinWaitlist(
  email: string,
): Promise<{ entry: WaitlistEntry; duplicate: boolean }> {
  const response = await fetch("/api/waitlist", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const body = await response.json();
  const entry = { email, id: "", roles: [], student_ages: [], message: "" };
  if (response.status === 409 && body.reason === "duplicate")
    return { entry, duplicate: true };
  if (
    !response.ok ||
    body.ok !== true ||
    typeof body.id !== "string" ||
    typeof body.editToken !== "string"
  )
    throw new Error("Signup failed");
  return {
    entry: { ...entry, id: body.id, editToken: body.editToken },
    duplicate: false,
  };
}
export async function updateWaitlist(
  entry: WaitlistEntry,
  draft: WaitlistDetails,
): Promise<WaitlistEntry> {
  if (!entry.editToken) throw new Error("Signup session unavailable");
  const response = await fetch("/api/waitlist", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: entry.id,
      editToken: entry.editToken,
      ...draft,
    }),
  });
  const body = await response.json();
  if (!response.ok || body.ok !== true)
    throw new Error("Could not save answers");
  return { ...entry, ...draft };
}
