import * as React from "react";
import type { NuroExpression, NuroGesture } from "@/components/voice/types";
import type { BirthResponse } from "./use-birth-character";

type Reaction = { expression: NuroExpression; gesture: NuroGesture; hold: number };
const REACTIONS = [
  { expression: "happy", gesture: "happy-eyes", hold: 4000 },
  { expression: "curious", gesture: "tilt", hold: 4200 },
  { expression: "thinking", gesture: "look-up", hold: 4200 },
  { expression: "playful", gesture: "wink", hold: 3800 },
  { expression: "excited", gesture: "attention-hop", hold: 3800 },
  { expression: "proud", gesture: "proud-swell", hold: 4000 },
  { expression: "reassuring", gesture: "nod", hold: 4000 },
  { expression: "sleepy", gesture: "yawn-stretch", hold: 4400 },
] as const satisfies readonly Reaction[];
const IDLE_REACTIONS = [
  { expression: "curious", gesture: "tilt", hold: 2400 },
  { expression: "thinking", gesture: "look-up", hold: 2600 },
  { expression: "happy", gesture: "happy-eyes", hold: 2200 },
] as const satisfies readonly Reaction[];

/** One interruptible response, never a queue. Form interactions take priority. */
export function useBirthPersonality({ target, respond, expression, ready, active, still, replay }: {
  target: React.RefObject<HTMLButtonElement | null>;
  respond: BirthResponse;
  expression: NuroExpression;
  ready: boolean;
  active: boolean;
  still: boolean;
  replay: number;
}) {
  const next = React.useRef(0);
  const idleNext = React.useRef(0);
  const pop = React.useRef<Animation | null>(null);
  const reaction = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [announcement, setAnnouncement] = React.useState<NuroExpression | null>(null);

  const cancel = React.useCallback(() => {
    clearTimeout(reaction.current);
    pop.current?.cancel();
    pop.current = null;
  }, []);

  const respondToForm = React.useCallback<BirthResponse>((mood, gesture, hold) => {
    cancel();
    setAnnouncement(null);
    respond(mood, gesture, hold);
  }, [cancel, respond]);

  const interact = React.useCallback(() => {
    if (!ready || !active) return;
    cancel();
    let chosen = REACTIONS[next.current++ % REACTIONS.length] ?? REACTIONS[0];
    if (chosen.expression === expression) chosen = REACTIONS[next.current++ % REACTIONS.length] ?? REACTIONS[0];
    setAnnouncement(chosen.expression);
    // Pigment starts flowing on press; the face reacts as the body springs out.
    respond(chosen.expression, undefined, chosen.hold);
    if (still) return;
    pop.current = target.current?.animate([
      { transform: "translateY(0) scale(1, 1)", offset: 0 },
      { transform: "translateY(3px) scale(1.025, .91)", offset: .16 },
      { transform: "translateY(-7px) scale(1.13, 1.15)", offset: .43 },
      { transform: "translateY(1px) scale(.99, .985)", offset: .75 },
      { transform: "translateY(0) scale(1, 1)", offset: 1 },
    ], { duration: 620, easing: "cubic-bezier(.22,.8,.3,1)" }) ?? null;
    reaction.current = setTimeout(() => {
      respond(chosen.expression, chosen.gesture, chosen.hold);
    }, 150);
  }, [active, cancel, expression, ready, respond, still, target]);

  React.useEffect(() => {
    if (!ready || !active || still || expression !== "idle") return;
    const timer = setTimeout(() => {
      // Listening/typing always wins, even if focus changes in this same tick.
      if (document.hidden || document.activeElement?.matches("input, textarea, select, [contenteditable=true]")) return;
      const chosen = IDLE_REACTIONS[idleNext.current++ % IDLE_REACTIONS.length] ?? IDLE_REACTIONS[0];
      respond(chosen.expression, chosen.gesture, chosen.hold);
    }, 10000 + (idleNext.current % 3) * 1800);
    return () => clearTimeout(timer);
  }, [active, expression, ready, respond, still]);

  React.useEffect(() => {
    if (!ready || !active || still) cancel();
  }, [active, cancel, ready, still]);
  React.useEffect(() => {
    cancel();
    next.current = 0;
    idleNext.current = 0;
    setAnnouncement(null);
  }, [cancel, replay]);
  React.useEffect(() => cancel, [cancel]);

  return { interact, respondToForm, announcement };
}
