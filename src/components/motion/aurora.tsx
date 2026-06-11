"use client";

import { useEffect, useRef, type CSSProperties } from "react";

/**
 * <Aurora> — ambient holographic background: four soft, heavily-blurred
 * blobs that drift on GPU-composited transforms (SPEC §5.2). Ported from
 * `~/nuro/components/brand/aurora.tsx`.
 *
 * Pauses its animations when scrolled out of view (its own
 * IntersectionObserver toggles `data-paused` on the root; the paused state
 * is enforced by a CSS rule in globals.css). Engines without
 * IntersectionObserver simply keep drifting — never stuck.
 *
 * Must be placed inside a `position: relative; overflow: hidden` parent: the
 * root is absolutely positioned and fills it. Consumers own that container.
 */

type Blob = {
  width: string;
  height: string;
  left?: string;
  right?: string;
  top?: string;
  bottom?: string;
  color: string;
  blur: number;
  opacity: number;
  animation: string;
};

const BLOBS: ReadonlyArray<Blob> = [
  {
    width: "60%",
    height: "60%",
    left: "-10%",
    top: "-20%",
    color: "rgba(167,199,255,0.7)",
    blur: 60,
    opacity: 0.9,
    animation: "aurora-a 18s ease-in-out infinite",
  },
  {
    width: "55%",
    height: "55%",
    right: "-10%",
    top: "-10%",
    color: "rgba(232,191,230,0.7)",
    blur: 70,
    opacity: 0.85,
    animation: "aurora-b 22s ease-in-out infinite",
  },
  {
    width: "65%",
    height: "65%",
    left: "30%",
    bottom: "-20%",
    color: "rgba(255,201,227,0.7)",
    blur: 80,
    opacity: 0.75,
    animation: "aurora-c 26s ease-in-out infinite",
  },
  {
    width: "40%",
    height: "40%",
    left: "10%",
    bottom: "10%",
    color: "rgba(255,217,194,0.6)",
    blur: 60,
    opacity: 0.7,
    animation: "aurora-d 20s ease-in-out infinite",
  },
];

export type AuroraVariant = "hero" | "waitlist" | "card";

/** Per-variant base opacity multiplier — "card" is deliberately subtle. */
const VARIANT_INTENSITY: Record<AuroraVariant, number> = {
  hero: 1,
  waitlist: 0.85,
  card: 0.55,
};

export type AuroraProps = {
  /** Surface preset controlling base intensity. Defaults to "hero". */
  variant?: AuroraVariant;
  /** Additional opacity multiplier, stacked on the variant. Defaults to 1. */
  intensity?: number;
  className?: string;
  style?: CSSProperties;
};

function blobOpacity(base: number, variant: AuroraVariant, intensity: number) {
  return Math.min(1, base * VARIANT_INTENSITY[variant] * intensity);
}

export function Aurora({
  variant = "hero",
  intensity = 1,
  className,
  style,
}: AuroraProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (node === null) return;
    if (typeof IntersectionObserver === "undefined") return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          (entry.target as HTMLElement).dataset.paused = entry.isIntersecting
            ? "false"
            : "true";
        }
      },
      { rootMargin: "100px" },
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  const rootClassName = [
    "pointer-events-none",
    "absolute",
    "inset-0",
    "z-0",
    "overflow-hidden",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      ref={ref}
      aria-hidden
      data-aurora-root=""
      data-paused="false"
      className={rootClassName}
      style={style}
    >
      {BLOBS.map((blob, i) => (
        <div
          key={i}
          data-aurora-blob=""
          style={{
            position: "absolute",
            width: blob.width,
            height: blob.height,
            left: blob.left,
            right: blob.right,
            top: blob.top,
            bottom: blob.bottom,
            background: `radial-gradient(closest-side, ${blob.color}, transparent)`,
            filter: `blur(${blob.blur}px)`,
            opacity: blobOpacity(blob.opacity, variant, intensity),
            animation: blob.animation,
            transformOrigin: "center",
            willChange: "transform",
          }}
        />
      ))}
    </div>
  );
}

export default Aurora;
