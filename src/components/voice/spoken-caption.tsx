import * as React from "react";
import { useMotionStill } from "@/components/system/grammar/use-motion-still";
import { createTextMotion } from "./runtime/text-motion.js";

/** React owns the host; Aura alone owns its descendants. Ordinary UI never opts in. */
export function SpokenCaption({ text, readable = false, replayKey, granularity = "letter" }: {
  text: string; readable?: boolean; replayKey?: number; granularity?: "letter" | "word";
}) {
  const root = React.useRef<HTMLSpanElement>(null);
  const animator = React.useRef<ReturnType<typeof createTextMotion> | null>(null);
  const reduced = useMotionStill();
  const lastReplay = React.useRef<number | undefined>(undefined);
  React.useEffect(() => {
    const element = root.current;
    if (!element) return;
    animator.current = createTextMotion(element, { animateOnMount: false, granularity });
    return () => {
      animator.current?.dispose();
      animator.current = null;
      element.replaceChildren();
    };
  }, [granularity]);
  React.useEffect(() => {
    if (!root.current || !animator.current) return;
    animator.current.setReducedMotion(reduced || readable);
    animator.current.set(root.current, text, {
      stream: true,
      immediate: !text || reduced || readable,
    });
  }, [text, reduced, readable, granularity]);
  React.useEffect(() => {
    if (replayKey === undefined || replayKey === lastReplay.current) return;
    lastReplay.current = replayKey;
    if (root.current && !reduced && !readable) animator.current?.reveal(root.current);
  }, [replayKey, reduced, readable]);
  return <span ref={root} className="nuro-spoken-caption" data-readable={readable || reduced} data-granularity={granularity} />;
}
