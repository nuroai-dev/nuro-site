import { useEffect, useRef } from "react";
import { useMotionStill } from "@/components/system/grammar/use-motion-still";

/** One clock per visible study; no React state or layout reads in the animation loop. */
export function useMotionClock(
  draw: (time: number, reduced: boolean) => void,
  playing: boolean,
  command: { id: number; time: number },
) {
  const element = useRef<SVGSVGElement>(null);
  const callback = useRef(draw);
  callback.current = draw;
  const elapsed = useRef(0);
  const reduced = useMotionStill();

  useEffect(() => {
    elapsed.current = command.time;
    callback.current(elapsed.current, reduced);
  }, [command, reduced]);

  useEffect(() => {
    let frame = 0,
      previous = 0,
      visible = false;
    const tick = (now: number) => {
      elapsed.current += previous ? Math.min((now - previous) / 1000, 0.05) : 0;
      previous = now;
      callback.current(elapsed.current, reduced);
      frame = requestAnimationFrame(tick);
    };
    const sync = () => {
      cancelAnimationFrame(frame);
      previous = 0;
      if (playing && visible && !document.hidden && !reduced) frame = requestAnimationFrame(tick);
      else callback.current(elapsed.current, reduced);
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = !!entry?.isIntersecting;
      sync();
    });
    if (element.current) observer.observe(element.current);
    document.addEventListener("visibilitychange", sync);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
      cancelAnimationFrame(frame);
    };
  }, [playing, reduced]);

  return { element, reduced };
}
