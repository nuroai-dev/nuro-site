"use client";

import type { ChangeEvent, Ref } from "react";

import {
  EMAIL_INVALID_ERROR,
  EMAIL_LABEL,
  EMAIL_PLACEHOLDER,
  MESSAGE_LABEL,
  MESSAGE_MAX_LENGTH,
  MESSAGE_PLACEHOLDER,
} from "./copy";
import styles from "./waitlist.module.css";

/**
 * Text fields for the waitlist form (SPEC §4 Waitlist, card N-09).
 *
 * Presentational only — values and validation live in <WaitlistForm>.
 * Both wrap their control in `.focusable` so keyboard focus shows the
 * holo aura; the email field carries the #c46a8a error treatment.
 */

export type EmailFieldProps = {
  value: string;
  error: boolean;
  inputRef: Ref<HTMLInputElement>;
  disabled?: boolean;
  onChange: (value: string) => void;
};

export function EmailField({
  value,
  error,
  inputRef,
  disabled = false,
  onChange,
}: EmailFieldProps) {
  return (
    <div className={styles.field} data-invalid={error || undefined}>
      <label className={styles.label} htmlFor="waitlist-email">
        {EMAIL_LABEL}
      </label>
      <span className={`${styles.inputWrap} focusable`}>
        <input
          ref={inputRef}
          id="waitlist-email"
          className={styles.input}
          type="email"
          name="email"
          autoComplete="email"
          placeholder={EMAIL_PLACEHOLDER}
          value={value}
          disabled={disabled}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            onChange(e.target.value)
          }
          aria-invalid={error || undefined}
          aria-describedby={error ? "waitlist-email-error" : undefined}
        />
      </span>
      {error ? (
        <p className={styles.fieldError} id="waitlist-email-error">
          {EMAIL_INVALID_ERROR}
        </p>
      ) : null}
    </div>
  );
}

export type MessageFieldProps = {
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
};

export function MessageField({
  value,
  disabled = false,
  onChange,
}: MessageFieldProps) {
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor="waitlist-message">
        {MESSAGE_LABEL}
      </label>
      <span className={`${styles.inputWrap} focusable`}>
        <textarea
          id="waitlist-message"
          className={styles.textarea}
          name="message"
          rows={4}
          maxLength={MESSAGE_MAX_LENGTH}
          placeholder={MESSAGE_PLACEHOLDER}
          value={value}
          disabled={disabled}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
            onChange(e.target.value)
          }
        />
      </span>
    </div>
  );
}
