import * as React from "react";
import { SpokenCaption } from "@/components/voice/spoken-caption";

/** Shared onboarding chat animation; the final letter ends the next cue. */
export function LandingCaption({ text, visible, paused, instant, onComplete }: {
  text: string;
  visible: boolean;
  paused: boolean;
  instant: boolean;
  onComplete?: () => void;
}) {
  const root = React.useRef<HTMLSpanElement>(null);
  return <span ref={root} className="landing-typed-caption" data-visible={visible}
    data-paused={paused || !visible} aria-hidden={!visible}
    onAnimationEnd={(event) => {
      if (!visible || paused || event.animationName !== "nuro-aura-letter-focus") return;
      const lastWord = root.current?.querySelector(".aura-frame")?.lastElementChild;
      if (event.target === lastWord?.lastElementChild) onComplete?.();
    }}>
    <span className="landing-typed-measure" aria-hidden="true">{text}</span>
    <SpokenCaption text={text} readable={instant} />
  </span>;
}
