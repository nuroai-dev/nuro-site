"use client";

import { useRef, useState, type FormEvent } from "react";

import { CheckboxGroup, RadioGroup } from "./choice-fields";
import {
  AGE_OPTIONS,
  AGES_HELPER,
  AGES_LABEL,
  DUPLICATE_BODY,
  DUPLICATE_TITLE,
  ERROR_BODY,
  ERROR_TITLE,
  PRIVACY_NOTE,
  ROLE_LABEL,
  ROLE_OPTIONS,
  ROLE_REQUIRED_ERROR,
  SUBMIT_IDLE,
  SUBMIT_LOADING,
  SUCCESS_MESSAGE,
  WAITLIST_ENDPOINT,
  type WaitlistPayload,
  type WaitlistResponse,
} from "./copy";
import { EmailField, MessageField } from "./text-fields";
import styles from "./waitlist.module.css";

/**
 * Waitlist form — the interactive island of SPEC §4 Waitlist (card N-09).
 *
 * Client-side validation (email format, role required) blocks submit; the
 * request is coded purely against the N-12 contract
 * `{ email, role, student_ages, message }` → `{ ok: true }` (HTTP 409 or
 * `reason: "duplicate"` maps to the duplicate state, anything else to error).
 * A persistent `role="status"` live region announces every state change.
 */

type Status = "idle" | "submitting" | "success" | "duplicate" | "error";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function submitWaitlist(payload: WaitlistPayload): Promise<Status> {
  try {
    const res = await fetch(WAITLIST_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.status === 409) return "duplicate";
    if (!res.ok) return "error";
    const data = (await res.json()) as WaitlistResponse;
    if (data.ok) return "success";
    return data.reason === "duplicate" ? "duplicate" : "error";
  } catch {
    return "error";
  }
}

const LIVE_TEXT: Record<Status, string> = {
  idle: "",
  submitting: SUBMIT_LOADING,
  success: SUCCESS_MESSAGE,
  duplicate: `${DUPLICATE_TITLE} ${DUPLICATE_BODY}`,
  error: `${ERROR_TITLE}. ${ERROR_BODY}`,
};

export default function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<string | null>(null);
  const [ages, setAges] = useState<readonly string[]>([]);
  const [message, setMessage] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [roleError, setRoleError] = useState(false);
  const [status, setStatus] = useState<Status>("idle");

  const formRef = useRef<HTMLFormElement | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);

  const isSubmitting = status === "submitting";

  function resetServerStatus() {
    if (status === "duplicate" || status === "error") {
      setStatus("idle");
    }
  }

  function toggleAge(age: string) {
    resetServerStatus();
    setAges((prev) =>
      prev.includes(age) ? prev.filter((a) => a !== age) : [...prev, age],
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;
    resetServerStatus();

    const badEmail = !EMAIL_RE.test(email.trim());
    const badRole = role === null;
    setEmailError(badEmail);
    setRoleError(badRole);
    if (badEmail) {
      emailRef.current?.focus();
      return;
    }
    if (badRole) {
      formRef.current
        ?.querySelector<HTMLInputElement>('input[name="role"]')
        ?.focus();
      return;
    }

    setStatus("submitting");
    setStatus(
      await submitWaitlist({
        email: email.trim(),
        role,
        student_ages: [...ages],
        message,
      }),
    );
  }

  const showAlert = status === "duplicate" || status === "error";

  return (
    <div className={styles.formCard}>
      {status === "success" ? (
        <div className={styles.success}>
          <p className={styles.successText}>{SUCCESS_MESSAGE}</p>
        </div>
      ) : (
        <form ref={formRef} noValidate onSubmit={handleSubmit}>
          <EmailField
            value={email}
            error={emailError}
            inputRef={emailRef}
            disabled={isSubmitting}
            onChange={(next) => {
              setEmail(next);
              setEmailError(false);
              resetServerStatus();
            }}
          />

          <div className={styles.field} data-invalid={roleError || undefined}>
            <RadioGroup
              legend={ROLE_LABEL}
              name="role"
              options={ROLE_OPTIONS}
              value={role}
              errorId={roleError ? "waitlist-role-error" : undefined}
              disabled={isSubmitting}
              onChange={(next) => {
                setRole(next);
                setRoleError(false);
                resetServerStatus();
              }}
            />
            {roleError ? (
              <p className={styles.fieldError} id="waitlist-role-error">
                {ROLE_REQUIRED_ERROR}
              </p>
            ) : null}
          </div>

          <div className={styles.field}>
            <CheckboxGroup
              legend={AGES_LABEL}
              helper={AGES_HELPER}
              name="student_ages"
              options={AGE_OPTIONS}
              values={ages}
              disabled={isSubmitting}
              onToggle={toggleAge}
            />
          </div>

          <MessageField
            value={message}
            disabled={isSubmitting}
            onChange={(next) => {
              setMessage(next);
              resetServerStatus();
            }}
          />

          <button
            className={`${styles.submit} focusable`}
            type="submit"
            disabled={isSubmitting}
          >
            {status === "submitting" ? SUBMIT_LOADING : SUBMIT_IDLE}
          </button>
          <p className={styles.privacy}>{PRIVACY_NOTE}</p>
        </form>
      )}

      {showAlert ? (
        <div className={styles.alert} data-kind={status}>
          <strong className={styles.alertTitle}>
            {status === "duplicate" ? DUPLICATE_TITLE : ERROR_TITLE}
          </strong>
          <span>{status === "duplicate" ? DUPLICATE_BODY : ERROR_BODY}</span>
        </div>
      ) : null}
      <p className={styles.srOnly} role="status" aria-live="polite">
        {LIVE_TEXT[status]}
      </p>
    </div>
  );
}
