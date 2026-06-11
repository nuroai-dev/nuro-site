"use client";

import {
  useEffect,
  useRef,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from "react";

/**
 * <Reveal> — the signature blur-up scroll entrance (SPEC §5.1).
 *
 * Resting state is VISIBLE (globals.css). When JS is available the
 * `html[data-js] [data-reveal]:not([data-shown])` rule hides the element
 * until it intersects the viewport; on intersect we set `data-shown`, which
 * layers the one-shot `revealIn` animation. Fires once (the element is
 * unobserved immediately) so scrolling back up never re-blurs.
 *
 * A single module-level IntersectionObserver serves every <Reveal> on the
 * page — dozens of observers would be wasteful. No-JS users and engines
 * without IntersectionObserver see sharp, static content (we reveal
 * immediately in that case).
 *
 * `eager` (N-14, above-fold hero only): the entrance is started by CSS alone
 * at first paint (`[data-reveal-eager]` rule in globals.css) instead of
 * waiting for hydration + IntersectionObserver, so the hero LCP is never
 * delayed by JS. The JS path still runs to set `data-shown` (the computed
 * animation is identical, so it does not restart) and to release
 * `will-change` after the entrance completes.
 */

type RevealCallback = () => void;

const callbacks = new WeakMap<Element, RevealCallback>();

let observer: IntersectionObserver | null = null;

function getObserver(): IntersectionObserver | null {
  if (typeof IntersectionObserver === "undefined") return null;
  if (observer === null) {
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const cb = callbacks.get(entry.target);
          observer?.unobserve(entry.target);
          callbacks.delete(entry.target);
          cb?.();
        }
      },
      { rootMargin: "0px 0px -5% 0px" },
    );
  }
  return observer;
}

export type RevealProps = {
  /** Element to render. Defaults to a div. */
  as?: ElementType;
  /** Stagger in seconds, applied as animationDelay. */
  delay?: number;
  /**
   * Start the entrance at first paint via CSS (no JS needed). Use ONLY for
   * above-fold content (hero) so the LCP element is never held hidden
   * waiting for hydration (SPEC §6 N-14).
   */
  eager?: boolean;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
};

export function Reveal({
  as,
  delay = 0,
  eager = false,
  className,
  style,
  children,
  ...rest
}: RevealProps) {
  const Tag = (as ?? "div") as ElementType;
  const nodeRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const node = nodeRef.current;
    if (node === null) return;

    const show = () => {
      node.dataset.shown = "1";
      // Release the promoted GPU layer once the entrance has finished so we
      // don't keep dozens of layers alive; mirrors the ~/nuro reveal logic.
      // Delay-aware (N-14): a staggered item finishes at delay + 0.9s, so a
      // fixed timer could drop the layer mid-animation.
      window.setTimeout(
        () => {
          node.style.willChange = "auto";
        },
        delay * 1000 + 1200,
      );
    };

    const io = getObserver();
    if (io === null) {
      // No IntersectionObserver — never strand the element hidden.
      show();
      return;
    }

    callbacks.set(node, show);
    io.observe(node);

    return () => {
      io.unobserve(node);
      callbacks.delete(node);
    };
  }, [delay]);

  return (
    <Tag
      ref={(node: HTMLElement | null) => {
        nodeRef.current = node;
      }}
      data-reveal=""
      data-reveal-eager={eager ? "" : undefined}
      className={className}
      style={delay > 0 ? { ...style, animationDelay: `${delay}s` } : style}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export default Reveal;
