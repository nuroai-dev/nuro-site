import * as React from "react";
import {
  joinWaitlist, updateWaitlist, waitlistEmail,
  type WaitlistAge, type WaitlistDetails, type WaitlistEntry, type WaitlistRole,
} from "@/lib/waitlist/client";
import type { BirthResponse } from "../birth/use-birth-character";

export type WaitlistStep = "email" | "roles" | "ages" | "done";
const emptyDetails = (): WaitlistDetails => ({ roles: [], student_ages: [], message: "" });

export function useWaitlist(respond: BirthResponse) {
  const [step, setStep] = React.useState<WaitlistStep>("email");
  const [email, setEmail] = React.useState("");
  const [entry, setEntry] = React.useState<WaitlistEntry | null>(null);
  const [draft, setDraft] = React.useState(emptyDetails);
  const [duplicate, setDuplicate] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<"email" | "save" | null>(null);
  const locked = React.useRef(false);

  /** `holdMs` keeps the email step on screen that long, so the join animation can finish. */
  async function join(holdMs = 0) {
    if (locked.current) return;
    const parsed = waitlistEmail.safeParse(email);
    if (!parsed.success) {
      setError("email");
      respond("reassuring", undefined, 1200);
      return;
    }
    locked.current = true;
    setBusy(true);
    setError(null);
    respond("thinking");
    const hold = new Promise((resolve) => setTimeout(resolve, holdMs));
    try {
      const result = await joinWaitlist(parsed.data);
      await hold;
      setEntry(result.entry);
      setDraft({ roles: result.entry.roles, student_ages: result.entry.student_ages, message: result.entry.message });
      setDuplicate(result.duplicate);
      setStep(result.duplicate ? "done" : "roles");
      respond("happy", "happy-eyes", 1900);
    } catch {
      setError("save");
      respond("reassuring");
    } finally {
      locked.current = false;
      setBusy(false);
    }
  }

  async function save(next: "ages" | "done") {
    if (!entry || locked.current) return;
    locked.current = true;
    setBusy(true);
    setError(null);
    try {
      setEntry(await updateWaitlist(entry, draft));
      setStep(next);
      respond(next === "done" ? "happy" : "curious", next === "done" ? "nod" : "tilt", 1400);
    } catch {
      setError("save");
      respond("reassuring");
    } finally {
      locked.current = false;
      setBusy(false);
    }
  }

  function toggleRole(role: WaitlistRole) {
    setError(null);
    setDraft((d) => ({ ...d, roles: d.roles.includes(role) ? d.roles.filter((r) => r !== role) : [...d.roles, role] }));
    respond("listening", "nod", 850);
  }

  function toggleAge(age: WaitlistAge) {
    setError(null);
    setDraft((d) => {
      const selected = d.student_ages;
      const next = selected.includes(age) ? selected.filter((a) => a !== age)
        : age === "not-applicable" ? [age]
        : [...selected.filter((a) => a !== "not-applicable"), age];
      return { ...d, student_ages: next };
    });
    respond("listening", "nod", 850);
  }

  function reset() {
    if (locked.current) return;
    setStep("email"); setEmail(""); setEntry(null); setDraft(emptyDetails());
    setDuplicate(false); setError(null); respond("idle");
  }

  return {
    step, email, entry, draft, duplicate, busy, error, join, save, toggleRole, toggleAge, reset,
    setEmail(value: string) { setEmail(value); setError(null); },
    back() {
      if (locked.current) return;
      setStep("roles");
      setError(null); respond("idle");
    },
  };
}
export type WaitlistFlow = ReturnType<typeof useWaitlist>;
