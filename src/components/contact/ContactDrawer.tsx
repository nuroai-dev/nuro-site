import { useEffect, useRef, useState, type FormEvent } from "react";
import { Drawer } from "vaul";
import { ArrowRight, Check, X } from "@/components/site/icons";
import { useMotionStill } from "@/components/system/grammar/use-motion-still";
import "./contact-drawer.css";

/**
 * Shared Vaul contact drawer. The refreshed pages hydrate it at load so
 * every contact trigger works, including Press and Career above the footer.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Drawer copy per locale. The drawer is the site's contact channel and it is
 * portalled open by client JS, so it never appears in server HTML. That is why
 * the page-level translation work never caught it: it shipped fully English on
 * Swedish pages.
 */
const COPY = {
  en: {
    title: "Get in touch",
    lead: "Questions about Nuro? Send us a note and we\u2019ll reply by email.",
    nameLabel: "Name",
    namePlaceholder: "Your name",
    nameError: "Please enter your name.",
    emailLabel: "Email",
    emailPlaceholder: "you@example.com",
    emailError: "Please enter a valid email.",
    messageLabel: "Message",
    messagePlaceholder: "How can we help?",
    messageError: "Please enter a message.",
    submit: "Send message",
    submitting: "Sending\u2026",
    errorBanner: "Something went wrong. Please try again.",
    successTitle: "Thanks, we\u2019ll be in touch.",
    successLead:
      "We\u2019ve got your message and will reply to your email soon.",
    close: "Close",
    press: "Press enquiries",
    career: "Let’s build something that matters.",
    careerLead: "Tell us who you are, with a link to your GitHub or something you’ve built. We’ll reply by email.",
    careerPlaceholder: "A few lines about you, and a link",
    privacy: "We’ll only use these details to reply to your message.",
  },
  sv: {
    title: "H\u00f6r av dig",
    lead: "Fr\u00e5gor om Nuro? Skicka ett meddelande s\u00e5 svarar vi via e-post.",
    nameLabel: "Namn",
    namePlaceholder: "Ditt namn",
    nameError: "Ange ditt namn.",
    emailLabel: "E-post",
    emailPlaceholder: "du@exempel.se",
    emailError: "Ange en giltig e-postadress.",
    messageLabel: "Meddelande",
    messagePlaceholder: "Hur kan vi hj\u00e4lpa till?",
    messageError: "Skriv ett meddelande.",
    submit: "Skicka meddelande",
    submitting: "Skickar\u2026",
    errorBanner: "N\u00e5got gick fel. F\u00f6rs\u00f6k igen.",
    successTitle: "Tack, vi h\u00f6r av oss.",
    successLead:
      "Vi har f\u00e5tt ditt meddelande och svarar till din e-post snart.",
    close: "St\u00e4ng",
    press: "Presskontakt",
    career: "Låt oss bygga något som gör skillnad.",
    careerLead: "Berätta vem du är, med en länk till din GitHub eller något du har byggt. Vi svarar via e-post.",
    careerPlaceholder: "Ett par rader om dig, och en länk",
    privacy: "Vi använder bara uppgifterna för att svara på ditt meddelande.",
  },
} as const;

type Status = "idle" | "submitting" | "success" | "error";
type Errors = { name?: boolean; email?: boolean; message?: boolean };

export default function ContactDrawer({ lang = "en" }: { lang?: "en" | "sv" }) {
  const t = COPY[lang];
  const reducedMotion = useMotionStill();
  const [open, setOpen] = useState(false);
  const [topic, setTopic] = useState<"press" | "career" | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  // The element that opened the drawer, so focus can be handed back on close.
  const triggerRef = useRef<HTMLElement | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Errors>({});

  // Open on any [data-contact-trigger] click, anywhere on the page.
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const trigger = target?.closest<HTMLElement>("[data-contact-trigger]");
      if (trigger) {
        event.preventDefault();
        triggerRef.current = trigger;
        setStatus("idle");
        setErrors({});
        const requested = trigger.dataset.contactTopic;
        setTopic(
          requested === "press" || requested === "career" ? requested : null,
        );
        setOpen(true);
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return;
    const form = event.currentTarget;
    const name = (
      form.elements.namedItem("name") as HTMLInputElement
    ).value.trim();
    const email = (
      form.elements.namedItem("email") as HTMLInputElement
    ).value.trim();
    const message = (
      form.elements.namedItem("message") as HTMLTextAreaElement
    ).value.trim();

    const nextErrors: Errors = {
      name: name.length === 0 || name.length > 120,
      email: !EMAIL_RE.test(email) || email.length > 254,
      message: message.length === 0 || message.length > 3900,
    };
    setErrors(nextErrors);
    if (nextErrors.name || nextErrors.email || nextErrors.message) {
      const invalid = nextErrors.name
        ? "name"
        : nextErrors.email
          ? "email"
          : "message";
      (form.elements.namedItem(invalid) as HTMLElement)?.focus();
      return;
    }

    setStatus("submitting");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          message: topic
            ? `[${topic === "press" ? "Press enquiry" : "Career enquiry"}]\n\n${message}`
            : message,
        }),
      });
      const body = await res.json();
      setStatus(res.ok && body.ok === true ? "success" : "error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <Drawer.Root
      open={open}
      onOpenChange={setOpen}
      shouldScaleBackground={!reducedMotion}
      setBackgroundColorOnScale={false}
      repositionInputs
    >
      <Drawer.Portal>
        <Drawer.Overlay className="cd-overlay" data-vaul-animate={reducedMotion ? "false" : undefined} />
        <Drawer.Content
          className="cd-content"
          data-vaul-animate={reducedMotion ? "false" : undefined}
          ref={contentRef}
          aria-modal="true"
          tabIndex={-1}
          onOpenAutoFocus={(event) => {
            /*
             * vaul defaults autoFocus to false and calls preventDefault() on this
             * event, which leaves focus on the trigger that opened the drawer. The
             * drawer is modal (overlay, background pointer-events disabled), so a
             * keyboard user was left tabbing through the page behind it and could
             * never reach the contact form.
             *
             * Move focus onto the drawer itself rather than the first input: that
             * puts focus inside the focus trap and lets the dialog be announced,
             * without opening the on-screen keyboard on mobile the way focusing a
             * text field would.
             */
            event.preventDefault();
            contentRef.current?.focus();
          }}
          onCloseAutoFocus={(event) => {
            /*
             * Hand focus back to the trigger that opened the drawer. Without this,
             * focus lands on <body> after closing and a keyboard user loses their
             * place, having to tab from the top of the page again.
             */
            event.preventDefault();
            const trigger = triggerRef.current;
            if (trigger?.isConnected && trigger.offsetParent !== null) {
              trigger.focus();
            } else {
              // On mobile the trigger lives in the menu, which closes behind the
              // drawer. Fall back to the main landmark so focus stays somewhere
              // meaningful instead of resetting to <body>.
              document.getElementById("main-content")?.focus();
            }
          }}
        >
          <Drawer.Handle className="cd-grabber" preventCycle />
          <Drawer.Close className="cd-close" aria-label={t.close}>
            <X size={20} aria-hidden="true" />
          </Drawer.Close>
          <div className="cd-inner">
            {status === "success" ? (
              <div className="cd-success">
                <span className="cd-success-mark" aria-hidden="true">
                  <Check size={26} />
                </span>
                <Drawer.Title className="cd-title">
                  {t.successTitle}
                </Drawer.Title>
                <Drawer.Description className="cd-lead">
                  {t.successLead}
                </Drawer.Description>
                <button
                  type="button"
                  className="cd-submit"
                  onClick={() => setOpen(false)}
                >
                  {t.close}
                </button>
              </div>
            ) : (
              <form
                className="cd-form"
                onSubmit={onSubmit}
                noValidate
                aria-busy={status === "submitting"}
              >
                <Drawer.Title className="cd-title">
                  {topic ? t[topic] : t.title}
                </Drawer.Title>
                <Drawer.Description className="cd-lead">
                  {topic === "career" ? t.careerLead : t.lead}
                </Drawer.Description>

                <div
                  className="cd-field"
                  data-invalid={errors.name || undefined}
                >
                  <label className="cd-label" htmlFor="cd-name">
                    {t.nameLabel}
                  </label>
                  <input
                    data-vaul-no-drag
                    id="cd-name"
                    name="name"
                    type="text"
                    className="cd-input"
                    autoComplete="name"
                    required
                    maxLength={120}
                    disabled={status === "submitting"}
                    aria-invalid={errors.name || undefined}
                    aria-describedby={errors.name ? "cd-name-error" : undefined}
                    placeholder={t.namePlaceholder}
                  />
                  {errors.name && (
                    <span id="cd-name-error" className="cd-field-error">
                      {t.nameError}
                    </span>
                  )}
                </div>

                <div
                  className="cd-field"
                  data-invalid={errors.email || undefined}
                >
                  <label className="cd-label" htmlFor="cd-email">
                    {t.emailLabel}
                  </label>
                  <input
                    data-vaul-no-drag
                    id="cd-email"
                    name="email"
                    type="email"
                    className="cd-input"
                    autoComplete="email"
                    required
                    maxLength={254}
                    disabled={status === "submitting"}
                    aria-invalid={errors.email || undefined}
                    aria-describedby={
                      errors.email ? "cd-email-error" : undefined
                    }
                    placeholder={t.emailPlaceholder}
                  />
                  {errors.email && (
                    <span id="cd-email-error" className="cd-field-error">
                      {t.emailError}
                    </span>
                  )}
                </div>

                <div
                  className="cd-field"
                  data-invalid={errors.message || undefined}
                >
                  <label className="cd-label" htmlFor="cd-message">
                    {t.messageLabel}
                  </label>
                  <textarea
                    data-vaul-no-drag
                    id="cd-message"
                    name="message"
                    className="cd-textarea"
                    placeholder={topic === "career" ? t.careerPlaceholder : t.messagePlaceholder}
                    rows={4}
                    required
                    maxLength={3900}
                    disabled={status === "submitting"}
                    aria-invalid={errors.message || undefined}
                    aria-describedby={
                      errors.message ? "cd-message-error" : undefined
                    }
                  />
                  {errors.message && (
                    <span id="cd-message-error" className="cd-field-error">
                      {t.messageError}
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  className="cd-submit"
                  disabled={status === "submitting"}
                >
                  {status === "submitting" ? t.submitting : t.submit}
                  <ArrowRight className="site-arrow" data-direction="right" size={18} aria-hidden="true" />
                </button>
                <p className="cd-privacy">{t.privacy}</p>

                {status === "error" && (
                  <p className="cd-error-banner" role="alert">
                    {t.errorBanner}
                  </p>
                )}
              </form>
            )}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
