/**
 * Waitlist copy — SPEC §4 Waitlist, every string VERBATIM.
 *
 * Single source of truth for labels, placeholders, helper text, states and
 * the `POST /api/waitlist` contract (stub lands in N-12). The UI must never
 * inline-duplicate any of these strings.
 */

export const WAITLIST_EYEBROW = "Let's build this together";

/** H2 is "Join the Nuro waiting list" with "Nuro" in holo gradient. */
export const WAITLIST_HEADING_PRE = "Join the ";
export const WAITLIST_HEADING_GRADIENT = "Nuro";
export const WAITLIST_HEADING_POST = " waiting list";

export const WAITLIST_SUB =
  "We're building Nuro for schools and families that care. Tell us a bit about yourself and we'll keep you updated.";

export const EMAIL_LABEL = "Email *";
export const EMAIL_PLACEHOLDER = "you@example.com";

export const ROLE_LABEL = "I am a... *";
export const ROLE_OPTIONS = [
  "Parent or guardian",
  "Student",
  "Teacher or school staff",
] as const;

export const AGES_LABEL = "What age are your students/children?";
export const AGES_HELPER =
  "Select all that apply — pick multiple if you have more than one child.";
export const AGE_OPTIONS = [
  "6–9 years (F–3)",
  "10–12 years (4–6)",
  "13–15 years (7–9)",
  "16–19 years (Gymnasiet)",
  "Not applicable",
] as const;

export const MESSAGE_LABEL = "Anything else you'd like us to know?";
export const MESSAGE_PLACEHOLDER =
  "Tell us about your situation, what challenges you face, or what you'd love to see in Nuro...";
export const MESSAGE_MAX_LENGTH = 1000;

export const SUBMIT_IDLE = "Join the waiting list";
export const SUBMIT_LOADING = "Submitting...";
export const PRIVACY_NOTE =
  "We respect your privacy. No spam, just updates about Nuro.";

export const SUCCESS_MESSAGE =
  "You're on the Nuro waiting list! We'll be in touch.";
export const DUPLICATE_TITLE = "Already on the list!";
export const DUPLICATE_BODY = "This email is already on our waiting list.";
export const ERROR_TITLE = "Something went wrong";
export const ERROR_BODY = "Please try again later.";

/** Client-side validation messages (card N-09; not spec-verbatim-mandated). */
export const EMAIL_INVALID_ERROR = "Please enter a valid email address.";
export const ROLE_REQUIRED_ERROR = "Please select one option.";

/** Request body for `POST /api/waitlist` (contract per card N-09 / N-12). */
export type WaitlistPayload = {
  email: string;
  role: string;
  student_ages: string[];
  message: string;
};

/** Successful response per the N-12 contract. */
export type WaitlistResponse = {
  ok: boolean;
  reason?: string;
};

export const WAITLIST_ENDPOINT = "/api/waitlist";
