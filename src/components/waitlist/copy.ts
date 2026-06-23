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

export const SUBMIT_IDLE = "Join waitlist";
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

/* ── Swedish + locale picker ─────────────────────────────────────────────
 * The server-rendered strings come from getCopy(lang). The client <script>
 * keeps importing the English consts above as a fallback, but reads the
 * locale-correct submit/status strings from data-* attributes on the form. */
import type { Lang } from "@/i18n/ui";

export function getCopy(lang: Lang) {
  if (lang === "sv") {
    return {
      eyebrow: "Låt oss bygga det här tillsammans",
      headingPre: "Gå med i ",
      headingGradient: "Nuros",
      headingPost: " väntelista",
      sub: "Vi bygger Nuro för skolor och familjer som bryr sig. Berätta lite om dig själv så håller vi dig uppdaterad.",
      emailLabel: "E-post *",
      emailPlaceholder: "du@exempel.se",
      roleLabel: "Jag är... *",
      roleOptions: ["Förälder eller vårdnadshavare", "Elev", "Lärare eller skolpersonal"],
      agesLabel: "Hur gamla är dina elever/barn?",
      agesHelper: "Välj alla som stämmer — kryssa flera om du har mer än ett barn.",
      ageOptions: [
        "6–9 år (F–3)",
        "10–12 år (4–6)",
        "13–15 år (7–9)",
        "16–19 år (Gymnasiet)",
        "Ej tillämpligt",
      ],
      messageLabel: "Något annat du vill att vi ska veta?",
      messagePlaceholder:
        "Berätta om din situation, vilka utmaningar du möter, eller vad du skulle vilja se i Nuro...",
      submitIdle: "Gå med i väntelistan",
      submitLoading: "Skickar...",
      privacyNote: "Vi värnar om din integritet. Ingen spam, bara uppdateringar om Nuro.",
      successMessage: "Du är med på Nuros väntelista! Vi hör av oss.",
      duplicateTitle: "Redan med på listan!",
      duplicateBody: "Den här e-posten finns redan på vår väntelista.",
      errorTitle: "Något gick fel",
      errorBody: "Försök igen senare.",
      emailInvalidError: "Ange en giltig e-postadress.",
      roleRequiredError: "Välj ett alternativ.",
    };
  }
  return {
    eyebrow: WAITLIST_EYEBROW,
    headingPre: WAITLIST_HEADING_PRE,
    headingGradient: WAITLIST_HEADING_GRADIENT,
    headingPost: WAITLIST_HEADING_POST,
    sub: WAITLIST_SUB,
    emailLabel: EMAIL_LABEL,
    emailPlaceholder: EMAIL_PLACEHOLDER,
    roleLabel: ROLE_LABEL,
    roleOptions: [...ROLE_OPTIONS],
    agesLabel: AGES_LABEL,
    agesHelper: AGES_HELPER,
    ageOptions: [...AGE_OPTIONS],
    messageLabel: MESSAGE_LABEL,
    messagePlaceholder: MESSAGE_PLACEHOLDER,
    submitIdle: SUBMIT_IDLE,
    submitLoading: SUBMIT_LOADING,
    privacyNote: PRIVACY_NOTE,
    successMessage: SUCCESS_MESSAGE,
    duplicateTitle: DUPLICATE_TITLE,
    duplicateBody: DUPLICATE_BODY,
    errorTitle: ERROR_TITLE,
    errorBody: ERROR_BODY,
    emailInvalidError: EMAIL_INVALID_ERROR,
    roleRequiredError: ROLE_REQUIRED_ERROR,
  };
}
