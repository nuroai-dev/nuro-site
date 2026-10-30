import * as React from "react";
import { ArrowRight, LoaderCircle } from "@/components/site/icons";
import { useTranslation } from "@/components/site/language";
import { useMotionStill } from "@/components/system/grammar/use-motion-still";
import type { BirthResponse } from "../birth/use-birth-character";
import { JoinMark } from "./join-mark";
import type { WaitlistFlow } from "./use-waitlist";

/** Join animation (ms): the field and the label fade, the button shrinks to a circle at
    the centre, and the white three-node mark plays inside it for a second before the next step. */
const MORPH_DELAY = 120;
const MORPH = 320;
const MARK_AT = MORPH_DELAY + MORPH;
const HOLD = MARK_AT + 1000;

export function EmailForm({ flow, respond }: { flow: WaitlistFlow; respond: BirthResponse }) {
  const { t } = useTranslation();
  const still = useMotionStill();
  const input = React.useRef<HTMLInputElement>(null);
  const control = React.useRef<HTMLDivElement>(null);
  const button = React.useRef<HTMLButtonElement>(null);
  // Stays on through the step's exit, so the mark isn't undone while it fades away.
  const sending = !still && (flow.busy || flow.step !== "email");
  React.useEffect(() => {
    if (flow.error === "email") input.current?.focus();
  }, [flow.error]);

  React.useLayoutEffect(() => {
    const el = button.current, box = control.current;
    if (!sending || !el || !box) return;
    const from = el.getBoundingClientRect(), area = box.getBoundingClientRect();
    const { paddingLeft, paddingRight } = getComputedStyle(el);
    const diameter = from.height;
    // Measure where flex actually puts the circle: right-aligned in the desktop row,
    // centred in the mobile column. Restore before paint so the pill never jumps.
    const originalWidth = el.style.width;
    el.style.width = `${diameter}px`;
    const target = el.getBoundingClientRect();
    el.style.width = originalWidth;
    const dx = area.left + area.width / 2 - (target.left + target.width / 2);
    const easing = "cubic-bezier(.3,.7,.2,1)";
    const animations = [
      el.animate([{ width: `${from.width}px`, paddingLeft, paddingRight, transform: "translateX(0)" },
        { width: `${diameter}px`, paddingLeft: "0px", paddingRight: "0px", transform: `translateX(${dx}px)` }],
        { duration: MORPH, delay: MORPH_DELAY, easing, fill: "both" }),
    ];
    // A failed save brings the form back as it was.
    return () => { for (const animation of animations) animation.cancel(); };
  }, [sending]);

  return <form className="landing-email-form" data-sending={sending || undefined} noValidate onSubmit={(event) => {
    event.preventDefault(); void flow.join(still ? 0 : HOLD);
  }}>
    <div ref={control} className="landing-email-control landing-reveal-row" data-invalid={flow.error === "email" || undefined}>
      <input ref={input} id="landing-email" name="email" type="email" autoComplete="email"
        aria-label={t("landingWaitlist.email")}
        autoCapitalize="none" spellCheck={false} maxLength={254} required
        value={flow.email} onChange={(event) => flow.setEmail(event.target.value)}
        placeholder={t("landingWaitlist.placeholder")} disabled={flow.busy}
        aria-invalid={flow.error === "email" || undefined}
        aria-describedby={flow.error ? "landing-waitlist-error" : "landing-email-promise"}
        onFocus={() => respond("listening", "listening-lean")}
        onBlur={() => { if (!flow.busy) respond("idle"); }} />
      <button ref={button} className="landing-primary" type="submit" disabled={flow.busy}
        aria-label={sending ? t("landingWaitlist.joining") : undefined}>
        {/* Animated: the label just fades out; reduced motion keeps the spinner and "Saving…". */}
        <span className="landing-primary-label">
          {t(flow.busy && !sending ? "landingWaitlist.joining" : "landingWaitlist.join")}
          {flow.busy && !sending ? <LoaderCircle size={16} className="landing-spinner" aria-hidden="true" /> : <ArrowRight className="site-arrow" data-direction="right" size={16} aria-hidden="true" />}
        </span>
        {sending && <JoinMark delay={MARK_AT} />}
      </button>
    </div>
    {flow.error && <p id="landing-waitlist-error" className="landing-error" role="alert">
      {t(flow.error === "email" ? "landingWaitlist.invalidEmail" : "landingWaitlist.saveError")}
    </p>}
    <p id="landing-email-promise" className="landing-helper landing-reveal-row">{t("landingWaitlist.promise")}</p>
  </form>;
}
