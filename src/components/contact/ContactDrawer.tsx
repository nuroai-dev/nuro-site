import { useEffect, useState, type FormEvent } from "react";
import { Drawer } from "vaul";
import "./contact-drawer.css";

/**
 * Contact drawer (Vaul) — the only React island on the site. Hydrated
 * `client:visible` from the footer, so React loads only when the footer is
 * near the viewport. Opens when any `[data-contact-trigger]` element is
 * clicked (the footer "Contact" link), so the trigger stays in plain Astro
 * markup. Floating bottom sheet, max-width 800px, lifted off the bottom edge.
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
    nameLabel: "Name", namePlaceholder: "Your name", nameError: "Please enter your name.",
    emailLabel: "Email", emailPlaceholder: "you@example.com", emailError: "Please enter a valid email.",
    messageLabel: "Message", messagePlaceholder: "How can we help?", messageError: "Please enter a message.",
    submit: "Send message", submitting: "Sending\u2026",
    errorBanner: "Something went wrong. Please try again.",
    successTitle: "Thanks, we\u2019ll be in touch.",
    successLead: "We\u2019ve got your message and will reply to your email soon.",
    close: "Close",
  },
  sv: {
    title: "H\u00f6r av dig",
    lead: "Fr\u00e5gor om Nuro? Skicka ett meddelande s\u00e5 svarar vi via e-post.",
    nameLabel: "Namn", namePlaceholder: "Ditt namn", nameError: "Ange ditt namn.",
    emailLabel: "E-post", emailPlaceholder: "du@exempel.se", emailError: "Ange en giltig e-postadress.",
    messageLabel: "Meddelande", messagePlaceholder: "Hur kan vi hj\u00e4lpa till?", messageError: "Skriv ett meddelande.",
    submit: "Skicka meddelande", submitting: "Skickar\u2026",
    errorBanner: "N\u00e5got gick fel. F\u00f6rs\u00f6k igen.",
    successTitle: "Tack, vi h\u00f6r av oss.",
    successLead: "Vi har f\u00e5tt ditt meddelande och svarar till din e-post snart.",
    close: "St\u00e4ng",
  },
} as const;

type Status = "idle" | "submitting" | "success" | "error";
type Errors = { name?: boolean; email?: boolean; message?: boolean };

export default function ContactDrawer({
  lang = "en",
}: {
  lang?: "en" | "sv";
}) {
  const t = COPY[lang];
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Errors>({});

  // Open on any [data-contact-trigger] click, anywhere on the page.
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("[data-contact-trigger]")) {
        event.preventDefault();
        setStatus("idle");
        setErrors({});
        setOpen(true);
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const name = (form.elements.namedItem("name") as HTMLInputElement).value.trim();
    const email = (form.elements.namedItem("email") as HTMLInputElement).value.trim();
    const message = (
      form.elements.namedItem("message") as HTMLTextAreaElement
    ).value.trim();

    const nextErrors: Errors = {
      name: name.length === 0,
      email: !EMAIL_RE.test(email),
      message: message.length === 0,
    };
    setErrors(nextErrors);
    if (nextErrors.name || nextErrors.email || nextErrors.message) return;

    setStatus("submitting");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      setStatus(res.ok ? "success" : "error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <Drawer.Root open={open} onOpenChange={setOpen}>
      <Drawer.Portal>
        <Drawer.Overlay className="cd-overlay" />
        <Drawer.Content className="cd-content">
          <div className="cd-grabber" aria-hidden="true" />
          <div className="cd-inner">
            {status === "success" ? (
              <div className="cd-success">
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
              <form className="cd-form" onSubmit={onSubmit} noValidate>
                <Drawer.Title className="cd-title">{t.title}</Drawer.Title>
                <Drawer.Description className="cd-lead">
                  {t.lead}
                </Drawer.Description>

                <div className="cd-field" data-invalid={errors.name || undefined}>
                  <label className="cd-label" htmlFor="cd-name">
                    {t.nameLabel}
                  </label>
                  <input
                    id="cd-name"
                    name="name"
                    type="text"
                    className="cd-input"
                    autoComplete="name"
                    placeholder={t.namePlaceholder}
                  />
                  {errors.name && (
                    <span className="cd-field-error">{t.nameError}</span>
                  )}
                </div>

                <div className="cd-field" data-invalid={errors.email || undefined}>
                  <label className="cd-label" htmlFor="cd-email">
                    {t.emailLabel}
                  </label>
                  <input
                    id="cd-email"
                    name="email"
                    type="email"
                    className="cd-input"
                    autoComplete="email"
                    placeholder={t.emailPlaceholder}
                  />
                  {errors.email && (
                    <span className="cd-field-error">
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
                    id="cd-message"
                    name="message"
                    className="cd-textarea"
                    placeholder={t.messagePlaceholder}
                    rows={4}
                  />
                  {errors.message && (
                    <span className="cd-field-error">
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
                </button>

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
