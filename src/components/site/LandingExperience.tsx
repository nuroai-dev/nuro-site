import * as React from "react";
import { SiteLanguage, useTranslation } from "./language";
import type { Lang } from "@/i18n/ui";
import { useMotionStill } from "@/components/system/grammar/use-motion-still";
import { useBirthCharacter } from "@/components/brand/birth/use-birth-character";
import { useBirthPersonality } from "@/components/brand/birth/use-birth-personality";
import { NeuralMark } from "@/components/brand/neural-motion/neural-mark";
import { GLASS_STILLS } from "@/components/voice/stills";
import { WaitlistExperience } from "@/components/brand/waitlist/waitlist-experience";
import "@/components/voice/voice.css";
import "@/styles/landing.css";

const logoCommand = { id: 0, time: 0 };
export default function LandingExperience({ lang }: { lang: Lang }) {
  return (
    <SiteLanguage lang={lang}>
      <Experience />
    </SiteLanguage>
  );
}
function Experience() {
  const { t, i18n } = useTranslation();
  const reduced = useMotionStill();
  const stage = React.useRef<HTMLDivElement>(null),
    canvas = React.useRef<HTMLCanvasElement>(null),
    character = React.useRef<HTMLButtonElement>(null),
    copy = React.useRef<HTMLDivElement>(null),
    composition = React.useRef<HTMLDivElement>(null);
  const [skip, setSkip] = React.useState(false),
    [introduced, setIntroduced] = React.useState(false);
  const { status, finished, expression, awake, respond } = useBirthCharacter(
    canvas,
    stage,
    { id: 0, paused: false, reduced, skip },
    true,
  );
  const { interact, respondToForm, announcement } = useBirthPersonality({
    target: character,
    respond,
    expression,
    ready: finished,
    active: awake,
    still: reduced,
    replay: 0,
  });
  React.useEffect(() => {
    if (
      new URLSearchParams(location.search).get("join") === "1" ||
      location.hash === "#waitlist"
    )
      setSkip(true);
  }, []);
  React.useEffect(() => {
    if (finished) setIntroduced(true);
  }, [finished]);
  React.useLayoutEffect(() => {
    if (copy.current) copy.current.inert = !finished;
  }, [finished]);
  React.useEffect(() => {
    const header = document.querySelector<HTMLElement>("[data-birth-header]");
    if (header) header.dataset.ready = String(finished);
    const title = document.getElementById("landing-static-title");
    if (title) title.hidden = finished;
  }, [finished]);
  React.useEffect(() => {
    const join = (event: MouseEvent) => {
      const target = (event.target as Element).closest("[data-join-trigger]");
      if (!target) return;
      event.preventDefault();
      setSkip(true);
      window.scrollTo({ top: 0, behavior: reduced ? "instant" : "smooth" });
      (
        document.getElementById("landing-email") ??
        document.getElementById("landing-heading")
      )?.focus({ preventScroll: true });
    };
    document.addEventListener("click", join);
    return () => document.removeEventListener("click", join);
  }, [reduced]);
  React.useLayoutEffect(() => {
    const el = composition.current;
    if (!el || reduced) return;
    let height = el.offsetHeight;
    let animation: Animation | undefined;
    const observer = new ResizeObserver(() => {
      const next = el.offsetHeight;
      const delta = (next - height) / 2;
      height = next;
      if (Math.abs(delta) < 1) return;
      animation?.cancel();
      animation = el.animate(
        [
          { transform: `translateY(${delta}px)` },
          { transform: "translateY(0)" },
        ],
        { duration: 650, easing: "cubic-bezier(.22,1,.36,1)" },
      );
    });
    observer.observe(el);
    return () => {
      observer.disconnect();
      animation?.cancel();
    };
  }, [reduced]);
  return (
    <div
      data-screen-label="Nuro landing"
      data-introduced={finished}
      data-still={reduced}
    >
      {finished && (
        <a className="landing-brand" href={i18n.language === "sv" ? "/sv/" : "/"} aria-label={i18n.language === "sv" ? "Nuro, startsida" : "Nuro, home"}>
          <NeuralMark playing command={logoCommand} label="Nuro" />
        </a>
      )}
      <div className="birth-stage" ref={stage} data-status={status}>
        <div className="landing-composition" ref={composition}>
          <div className="landing-character-wrap">
            <button
              ref={character}
              type="button"
              className="birth-character nuro-glass-character"
              aria-label={t("nuroBirth.interact")}
              disabled={!finished}
              data-mood={expression}
              onClick={interact}
            >
              <canvas ref={canvas} aria-hidden="true" />
              {status === "fallback" && (
                <img
                  className="birth-still"
                  src={GLASS_STILLS[expression][256]}
                  alt=""
                />
              )}
              <span className="birth-shadow" aria-hidden="true" />
            </button>
            <span className="sr-only" role="status">
              {announcement ? t(`nuroBirth.moods.${announcement}`) : ""}
            </span>
          </div>
          <div
            ref={copy}
            id="landing-copy"
            className="landing-copy"
            aria-hidden={!finished}
          >
            {introduced && (
              <WaitlistExperience
                respond={respondToForm}
                focusEmail={skip && finished}
                active={finished}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
