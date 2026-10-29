import * as React from "react";
import type { CharacterController } from "@/components/voice/runtime/character";
import type { NuroExpression, NuroGesture } from "@/components/voice/types";
import { BIRTH_DURATION, birthFrame, type BirthPhase } from "./timeline";

export type BirthCommand = { id: number; paused: boolean; reduced: boolean; skip?: boolean };
export type BirthResponse = (expression: NuroExpression, gesture?: NuroGesture, settleAfter?: number) => void;

/** Owns one renderer and one entrance clock. Hidden tabs never consume the entrance. */
export function useBirthCharacter(
  canvas: React.RefObject<HTMLCanvasElement | null>,
  stage: React.RefObject<HTMLDivElement | null>,
  command: BirthCommand,
  enabled: boolean,
) {
  const [status, setStatus] = React.useState<"loading" | "ready" | "fallback">("loading");
  const [finished, setFinished] = React.useState(false);
  const [expression, setExpression] = React.useState<NuroExpression>("idle");
  const [awake, setAwake] = React.useState(false);
  const latest = React.useRef(command);
  latest.current = command;
  const rigRef = React.useRef<CharacterController | null>(null);
  const wakeRef = React.useRef<(() => void) | null>(null);
  const clock = React.useRef({ time: 0, id: command.id });
  const settle = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const expressionRef = React.useRef<NuroExpression>("idle");

  const showExpression = React.useCallback((next: NuroExpression) => {
    expressionRef.current = next;
    setExpression(next);
    rigRef.current?.setExpression(next);
  }, []);

  const respond = React.useCallback<BirthResponse>((expression, gesture, settleAfter = 0) => {
    clearTimeout(settle.current);
    rigRef.current?.cancelGesture();
    showExpression(expression);
    if (gesture) rigRef.current?.playGesture(gesture);
    if (settleAfter) settle.current = setTimeout(() => showExpression("idle"), settleAfter);
  }, [showExpression]);

  React.useEffect(() => {
    const element = canvas.current;
    const host = stage.current;
    if (!element || !host || !enabled) return;
    let alive = true;
    let loaded = false;
    let visible = true;
    let frame = 0;
    let last = performance.now();
    let phase: BirthPhase | undefined;
    let generation = 0;

    const paint = () => {
      if (!loaded || !alive) return;
      const cmd = latest.current;
      if (clock.current.id !== cmd.id) {
        clock.current = { time: 0, id: cmd.id };
        phase = undefined;
        clearTimeout(settle.current);
        rigRef.current?.cancelGesture();
        showExpression("idle");
        setFinished(false);
      }
      if (cmd.reduced || cmd.skip) clock.current.time = BIRTH_DURATION;
      const pose = birthFrame(clock.current.time);
      rigRef.current?.setEntrancePose(pose.phase === "alive" ? null : pose);
      host.style.setProperty("--birth-shadow", String(pose.shadow));
      host.dataset.time = clock.current.time.toFixed(3);
      if (phase !== pose.phase) {
        phase = pose.phase;
        host.dataset.phase = phase;
        setFinished(phase === "alive");
      }
    };
    const tick = (now: number) => {
      frame = 0;
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (!document.hidden && visible && !latest.current.paused) {
        clock.current.time = Math.min(BIRTH_DURATION, clock.current.time + dt);
      }
      paint();
      if (alive && loaded && visible && !document.hidden && !latest.current.paused &&
          !latest.current.reduced && clock.current.time < BIRTH_DURATION) {
        frame = requestAnimationFrame(tick);
      }
    };
    const wake = () => {
      cancelAnimationFrame(frame);
      last = performance.now();
      rigRef.current?.setReducedMotion(latest.current.reduced);
      rigRef.current?.setPaused(!visible || document.hidden || (latest.current.paused && !latest.current.reduced));
      setAwake(visible && !document.hidden && !latest.current.paused);
      paint();
      if (loaded && visible && !document.hidden && !latest.current.paused &&
          !latest.current.reduced && clock.current.time < BIRTH_DURATION) {
        frame = requestAnimationFrame(tick);
      }
    };
    const fail = () => {
      loaded = false;
      cancelAnimationFrame(frame);
      rigRef.current?.dispose();
      rigRef.current = null;
      if (alive) {
        setStatus("fallback");
        setFinished(true);
        host.dataset.phase = "alive";
        host.style.setProperty("--birth-shadow", "1");
      }
    };
    const initialize = async () => {
      const attempt = ++generation;
      setStatus("loading");
      try {
        const { createNuroCharacter } = await import("@/components/voice/runtime/character.js");
        if (!alive || attempt !== generation) return;
        rigRef.current = createNuroCharacter(element, {
          onReady: () => {
            if (!alive || attempt !== generation) return;
            loaded = true;
            setStatus("ready");
            wake();
          },
          onError: fail,
        });
        rigRef.current.setEntrancePose(birthFrame(latest.current.reduced ? BIRTH_DURATION : clock.current.time));
        rigRef.current.setExpression(expressionRef.current);
        rigRef.current.setPaused(latest.current.paused);
      } catch {
        if (alive) fail();
      }
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? false;
      wake();
    });
    const lost = (event: Event) => {
      event.preventDefault();
      generation++;
      fail();
    };
    observer.observe(element);
    wakeRef.current = wake;
    document.addEventListener("visibilitychange", wake);
    element.addEventListener("webglcontextlost", lost);
    element.addEventListener("webglcontextrestored", initialize);
    void initialize();
    return () => {
      alive = false;
      generation++;
      cancelAnimationFrame(frame);
      clearTimeout(settle.current);
      observer.disconnect();
      wakeRef.current = null;
      document.removeEventListener("visibilitychange", wake);
      element.removeEventListener("webglcontextlost", lost);
      element.removeEventListener("webglcontextrestored", initialize);
      rigRef.current?.dispose();
      rigRef.current = null;
    };
  }, [canvas, stage, enabled, showExpression]);

  React.useEffect(() => {
    wakeRef.current?.();
  }, [command.id, command.paused, command.reduced, command.skip, stage]);

  return { status: enabled ? status : "loading", finished, expression, awake: enabled && awake, respond };
}
