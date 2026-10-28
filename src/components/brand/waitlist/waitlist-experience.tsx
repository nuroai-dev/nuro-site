import * as React from "react";
import { useTranslation } from "@/components/site/language";
import { StepTransition } from "@/components/site/StepTransition";
import { useMotionStill } from "@/components/system/grammar/use-motion-still";
import type { BirthResponse } from "../birth/use-birth-character";
import { useWaitlist } from "./use-waitlist";
import { EmailForm } from "./email-form";
import { InterestForm } from "./interest-form";
import { WaitlistConfirmation } from "./waitlist-confirmation";
import { LandingCaption } from "./landing-caption";
import "./i18n";
import "./waitlist.css";

export function WaitlistExperience({ respond, focusEmail = false, active = true, paused = false, replayKey = 0 }: {
  respond: BirthResponse; focusEmail?: boolean; active?: boolean; paused?: boolean; replayKey?: number;
}) {
  const { t } = useTranslation();
  const still = useMotionStill();
  const flow = useWaitlist(respond);
  const conversation = React.useRef<HTMLElement>(null);
  const [visible, setVisible] = React.useState(true);
  React.useEffect(() => {
    if (!conversation.current) return;
    let inView = true;
    const update = () => setVisible(inView && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry?.isIntersecting ?? false; update();
    });
    observer.observe(conversation.current);
    document.addEventListener("visibilitychange", update);
    update();
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", update); };
  }, []);
  const motionPaused = paused || !visible;
  const heading = React.useRef<HTMLHeadingElement>(null);
  const previous = React.useRef(flow.step);
  const response = React.useRef<HTMLDivElement>(null);
  const [intro, setIntro] = React.useState<"title" | "subtitle" | "form">("title");
  const instant = still || focusEmail;
  const showForm = active && (instant || intro === "form");
  const showSubtitle = active && (instant || intro !== "title");
  React.useLayoutEffect(() => { setIntro(instant ? "form" : "title"); }, [replayKey]);
  React.useLayoutEffect(() => { if (instant) setIntro("form"); }, [instant]);
  React.useLayoutEffect(() => { if (response.current) response.current.inert = !showForm; }, [showForm]);
  const single = flow.draft.roles.length === 1 ? flow.draft.roles[0] : null;
  const ageTitle = single === "parent" ? "agesParent"
    : flow.draft.roles.length && flow.draft.roles.every((role) => ["teacher", "principal", "municipality"].includes(role)) ? "agesSchool" : "agesMixed";
  const title = flow.step === "email" ? "greeting" : flow.step === "roles" ? flow.duplicate ? "duplicate" : "joined"
    : flow.step === "ages" ? ageTitle : flow.duplicate ? "duplicate" : "done";
  const subtitle = flow.step === "email" ? "introduction" : flow.step === "roles" ? "invitation"
    : flow.step === "ages" ? "agesHint" : "doneMessage";

  React.useEffect(() => {
    if (focusEmail) document.getElementById("landing-email")?.focus({ preventScroll: true });
  }, [focusEmail]);

  const focusStep = () => {
    if (previous.current === flow.step) return;
    previous.current = flow.step;
    if (flow.step === "email") document.getElementById("landing-email")?.focus({ preventScroll: true });
    else heading.current?.focus({ preventScroll: true });
  };

  return <section ref={conversation} className="landing-conversation" data-step={flow.step} data-still={still}
    data-intro-phase={instant ? "form" : intro} data-paused={motionPaused} aria-labelledby="landing-heading">
    <div className="landing-caption">
      <h1 ref={heading} id="landing-heading" tabIndex={-1}>
        <LandingCaption key={`title-${replayKey}`} text={t(`landingWaitlist.${title}`)}
          visible={active} paused={motionPaused} instant={still || (focusEmail && flow.step === "email")}
          onComplete={() => { if (intro === "title") setIntro("subtitle"); }} />
      </h1>
      <p><LandingCaption key={`subtitle-${replayKey}`} text={t(`landingWaitlist.${subtitle}`)}
        visible={showSubtitle} paused={motionPaused} instant={still || (focusEmail && flow.step === "email")}
        onComplete={() => { if (intro === "subtitle") setIntro("form"); }} /></p>
    </div>
    <div ref={response} className="landing-form-reveal" data-visible={showForm} data-instant={instant} aria-hidden={!showForm}>
    <StepTransition transitionKey={flow.step} onEntered={focusStep}>
        {flow.step === "email" ? <EmailForm flow={flow} respond={respond} />
          : flow.step === "done" ? <WaitlistConfirmation flow={flow} /> : <InterestForm flow={flow} />}
      </StepTransition>
    </div>
    <p className="sr-only" role="status">{flow.step === "roles" ? t("landingWaitlist.savedAnnouncement") : flow.step === "done" ? t("landingWaitlist.doneAnnouncement") : ""}</p>
  </section>;
}
