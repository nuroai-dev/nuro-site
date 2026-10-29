import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { useMotionStill } from "@/components/system/grammar/use-motion-still";

/** Native exit/enter sequence keeps the approved blur motion without an animation library. */
export function StepTransition({
  transitionKey,
  children,
  onEntered,
}: {
  transitionKey: string;
  children: ReactNode;
  onEntered: () => void;
}) {
  const still = useMotionStill();
  const host = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(transitionKey);
  const previous = useRef(children);
  const callback = useRef(onEntered);
  callback.current = onEntered;
  if (shown === transitionKey) previous.current = children;
  useLayoutEffect(() => {
    const el = host.current;
    if (!el || shown === transitionKey) return;
    if (still) {
      setShown(transitionKey);
      return;
    }
    el.inert = true;
    const animation = el.animate(
      [
        { opacity: 1, filter: "blur(0px)", transform: "translateY(0)" },
        { opacity: 0, filter: "blur(6px)", transform: "translateY(-6px)" },
      ],
      { duration: 260, easing: "cubic-bezier(.22,.9,.3,1)", fill: "forwards" },
    );
    animation.onfinish = () => setShown(transitionKey);
    return () => animation.cancel();
  }, [transitionKey, shown, still]);
  useLayoutEffect(() => {
    const el = host.current;
    if (!el) return;
    el.inert = false;
    if (still) {
      callback.current();
      return;
    }
    const animation = el.animate(
      [
        { opacity: 0, filter: "blur(6px)", transform: "translateY(8px)" },
        { opacity: 1, filter: "blur(0px)", transform: "translateY(0)" },
      ],
      { duration: 320, easing: "cubic-bezier(.22,.9,.3,1)" },
    );
    animation.onfinish = () => callback.current();
    return () => animation.cancel();
  }, [shown, still]);
  return (
    <div ref={host} className="landing-response">
      {shown === transitionKey ? children : previous.current}
    </div>
  );
}
