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

type Status = "idle" | "submitting" | "success" | "error";
type Errors = { name?: boolean; email?: boolean; message?: boolean };

export default function ContactDrawer() {
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
                  Thanks — we&rsquo;ll be in touch.
                </Drawer.Title>
                <Drawer.Description className="cd-lead">
                  We&rsquo;ve got your message and will reply to your email
                  soon.
                </Drawer.Description>
                <button
                  type="button"
                  className="cd-submit"
                  onClick={() => setOpen(false)}
                >
                  Close
                </button>
              </div>
            ) : (
              <form className="cd-form" onSubmit={onSubmit} noValidate>
                <Drawer.Title className="cd-title">Get in touch</Drawer.Title>
                <Drawer.Description className="cd-lead">
                  Questions about Nuro? Send us a note and we&rsquo;ll reply by
                  email.
                </Drawer.Description>

                <div className="cd-field" data-invalid={errors.name || undefined}>
                  <label className="cd-label" htmlFor="cd-name">
                    Name
                  </label>
                  <input
                    id="cd-name"
                    name="name"
                    type="text"
                    className="cd-input"
                    autoComplete="name"
                    placeholder="Your name"
                  />
                  {errors.name && (
                    <span className="cd-field-error">Please enter your name.</span>
                  )}
                </div>

                <div className="cd-field" data-invalid={errors.email || undefined}>
                  <label className="cd-label" htmlFor="cd-email">
                    Email
                  </label>
                  <input
                    id="cd-email"
                    name="email"
                    type="email"
                    className="cd-input"
                    autoComplete="email"
                    placeholder="you@example.com"
                  />
                  {errors.email && (
                    <span className="cd-field-error">
                      Please enter a valid email.
                    </span>
                  )}
                </div>

                <div
                  className="cd-field"
                  data-invalid={errors.message || undefined}
                >
                  <label className="cd-label" htmlFor="cd-message">
                    Message
                  </label>
                  <textarea
                    id="cd-message"
                    name="message"
                    className="cd-textarea"
                    placeholder="How can we help?"
                    rows={4}
                  />
                  {errors.message && (
                    <span className="cd-field-error">
                      Please enter a message.
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  className="cd-submit"
                  disabled={status === "submitting"}
                >
                  {status === "submitting" ? "Sending…" : "Send message"}
                </button>

                {status === "error" && (
                  <p className="cd-error-banner" role="alert">
                    Something went wrong. Please try again.
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
