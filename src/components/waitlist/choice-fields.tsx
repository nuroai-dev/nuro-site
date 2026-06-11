"use client";

import { useId } from "react";

import styles from "./waitlist.module.css";

/**
 * Choice fields for the waitlist form (SPEC §4 Waitlist, card N-09).
 *
 * Presentational only — selection state lives in <WaitlistForm>. Native
 * inputs are visually hidden but fully focusable so the keyboard flow is the
 * platform one (arrow keys move radios, Space toggles checkboxes); the chip
 * label carries `.focusable` so keyboard focus shows the holo aura. Selected
 * chips get the holo-gradient tint + a gradient checkmark.
 */

/** Checkmark stroked with the 5-stop holo gradient (SPEC §5.3 palette). */
function GradientCheck() {
  const gradientId = useId();
  return (
    <svg className={styles.checkIcon} viewBox="0 0 16 16" aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="16" y2="16">
          <stop offset="0%" stopColor="var(--holo-1)" />
          <stop offset="32%" stopColor="var(--holo-2)" />
          <stop offset="58%" stopColor="var(--holo-3)" />
          <stop offset="80%" stopColor="var(--holo-4)" />
          <stop offset="100%" stopColor="var(--holo-5)" />
        </linearGradient>
      </defs>
      <path
        d="M3 8.5l3.2 3.2L13 5"
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type ChoiceChipProps = {
  type: "radio" | "checkbox";
  name: string;
  label: string;
  checked: boolean;
  describedBy?: string;
  invalid?: boolean;
  disabled?: boolean;
  onChange: () => void;
};

function ChoiceChip({
  type,
  name,
  label,
  checked,
  describedBy,
  invalid,
  disabled = false,
  onChange,
}: ChoiceChipProps) {
  return (
    <label
      className={`${styles.chip} focusable`}
      data-checked={checked ? "true" : undefined}
    >
      <input
        className={styles.chipInput}
        type={type}
        name={name}
        value={label}
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        aria-describedby={describedBy}
        aria-invalid={invalid === true ? true : undefined}
      />
      <span className={styles.chipBox} aria-hidden="true">
        {checked ? <GradientCheck /> : null}
      </span>
      <span className={styles.chipLabel}>{label}</span>
    </label>
  );
}

export type RadioGroupProps = {
  legend: string;
  name: string;
  options: readonly string[];
  value: string | null;
  errorId?: string;
  disabled?: boolean;
  onChange: (value: string) => void;
};

export function RadioGroup({
  legend,
  name,
  options,
  value,
  errorId,
  disabled = false,
  onChange,
}: RadioGroupProps) {
  return (
    <fieldset className={styles.fieldset}>
      <legend className={styles.legend}>{legend}</legend>
      <div className={styles.chipGroup} role="presentation">
        {options.map((option) => (
          <ChoiceChip
            key={option}
            type="radio"
            name={name}
            label={option}
            checked={value === option}
            describedBy={errorId}
            invalid={errorId !== undefined}
            disabled={disabled}
            onChange={() => onChange(option)}
          />
        ))}
      </div>
    </fieldset>
  );
}

export type CheckboxGroupProps = {
  legend: string;
  helper: string;
  name: string;
  options: readonly string[];
  values: readonly string[];
  disabled?: boolean;
  onToggle: (value: string) => void;
};

export function CheckboxGroup({
  legend,
  helper,
  name,
  options,
  values,
  disabled = false,
  onToggle,
}: CheckboxGroupProps) {
  const helperId = useId();
  return (
    <fieldset className={styles.fieldset} aria-describedby={helperId}>
      <legend className={styles.legend}>{legend}</legend>
      <p className={styles.helper} id={helperId}>
        {helper}
      </p>
      <div className={styles.chipGroup} role="presentation">
        {options.map((option) => (
          <ChoiceChip
            key={option}
            type="checkbox"
            name={name}
            label={option}
            checked={values.includes(option)}
            disabled={disabled}
            onChange={() => onToggle(option)}
          />
        ))}
      </div>
    </fieldset>
  );
}
