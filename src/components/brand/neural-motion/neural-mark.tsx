import { useId, useMemo, useRef } from "react";
import {
  bridgePath,
  attachmentRadius,
  clamp,
  edges,
  logoGeometry,
  mix,
  nodes,
  silhouetteTransform,
  smooth,
  spring,
} from "./geometry";
import { useMotionClock } from "./use-motion-clock";

export const phaseTimes = [0, 1.25, 2.45, 4.8];
const starts = [1.4, 1.75, 1.4, 1.7, 2, 1.65, 1.95, 2.25, 2.55, 1.6, 1.9, 2.2, 1.85, 2.3, 2.55];

type Props = {
  playing: boolean;
  command: { id: number; time: number };
  onPhase?: (phase: number) => void;
  label: string;
};

export function NeuralMark({ playing, command, onPhase, label }: Props) {
  const geometry = useMemo(logoGeometry, []);
  const id = useId().replace(/:/g, "");
  const lastPhase = useRef(-1);
  const ringRefs = useRef<(SVGPathElement | null)[]>([]);
  const nodeRefs = useRef<(SVGPathElement | null)[]>([]);
  const bridgeRefs = useRef<(SVGPathElement | null)[]>([]);
  const signalRefs = useRef<(SVGCircleElement | null)[]>([]);
  const pulseRefs = useRef<(SVGPathElement | null)[]>([]);
  const organic = useRef<SVGGElement>(null);
  const exact = useRef<SVGGElement>(null);
  const color = useRef<SVGGElement>(null);
  const colorRings = useRef<SVGPathElement>(null);
  const reveal = useRef<SVGCircleElement>(null);
  const glow = useRef<SVGRadialGradientElement>(null);
  const glowPath = useRef<SVGPathElement>(null);

  const { element, reduced } = useMotionClock(
    (time, reduce) => {
      const t = reduce ? 6 : time;
      const phase = t < 1.25 ? 0 : t < 2.45 ? 1 : t < 4.8 ? 2 : 3;
      if (lastPhase.current !== phase) {
        lastPhase.current = phase;
        onPhase?.(phase);
      }
      const handoff = smooth((t - 3.2) / 0.55);
      const colour = smooth((t - 3.15) / 1.65);
      organic.current?.setAttribute("opacity", `${1 - handoff}`);
      exact.current?.setAttribute("opacity", `${handoff}`);
      color.current?.setAttribute("opacity", `${handoff}`);
      colorRings.current?.setAttribute("opacity", `${colour}`);
      reveal.current?.setAttribute("r", `${colour * 260}`);
      if (handoff < 1) {
        const positions = nodes.map((node, i) => {
          const settle = spring(clamp((t - 0.35 - (i % 4) * 0.05) / 1.1));
          const wander = 1 - smooth((t - 0.5) / 1.3);
          const x = node.x + (Math.sin(i * 2.4) * 16 + Math.sin(t * 1.3 + i) * 2) * (1 - settle);
          const y = node.y + (Math.cos(i * 3.1) * 13 + Math.cos(t + i) * 2) * (1 - settle);
          const shape = geometry.silhouettes[i % geometry.silhouettes.length]!;
          const breathe = Math.sin(t * 3 + i * 1.7) * 0.3 * wander;
          nodeRefs.current[i]?.setAttribute(
            "transform",
            silhouetteTransform(shape, { x, y }, node.r + breathe, wander * Math.sin(i) * 22),
          );
          return { x, y, radius: attachmentRadius(shape, node.r + breathe) };
        });
        geometry.rings.forEach((ring, i) => {
          const away = 1 - spring(clamp((t - 0.45 - (i % 5) * 0.04) / 1.1));
          ringRefs.current[i]?.setAttribute(
            "transform",
            `translate(${Math.sin(i * 2.8) * 11 * away} ${Math.cos(i * 1.5) * 12 * away})`,
          );
        });
        edges.forEach(([a, b], i) => {
          const progress = smooth((t - starts[i]!) / 0.6);
          const from = positions[a]!,
            to = positions[b]!;
          const bridge = bridgeRefs.current[i];
          bridge?.setAttribute("opacity", `${smooth(progress * 4)}`);
          // The neck stretches out of the first node before making contact with the second.
          const end = {
            x: mix(from.x, to.x, 0.35 + progress * 0.65),
            y: mix(from.y, to.y, 0.35 + progress * 0.65),
          };
          bridge?.setAttribute(
            "d",
            bridgePath(from, end, from.radius, progress, mix(1.5, to.radius, progress)),
          );
          const signal = clamp((t - starts[i]! - 0.2) / 0.58);
          signalRefs.current[i]?.setAttribute("cx", `${mix(from.x, to.x, signal)}`);
          signalRefs.current[i]?.setAttribute("cy", `${mix(from.y, to.y, signal)}`);
          signalRefs.current[i]?.setAttribute("opacity", `${Math.sin(signal * Math.PI) * 0.7}`);
        });
      } else {
        ringRefs.current.forEach((path) => path?.removeAttribute("transform"));
      }
      const ambient = reduce ? 0 : smooth((t - 4.8) / 0.8);
      const wave = (t - 4.8) * 0.65;
      glow.current?.setAttribute("cx", `${93 + Math.sin(wave) * 90}`);
      glow.current?.setAttribute("cy", `${82 + Math.cos(wave * 0.8) * 78}`);
      glowPath.current?.setAttribute(
        "opacity",
        `${ambient * (0.25 + 0.12 * Math.sin(wave * 1.7))}`,
      );
      pulseRefs.current.forEach((path, i) => {
        path?.setAttribute("stroke-dashoffset", `${200 - (((t - 4.8) * 36 + i * 43) % 240)}`);
        path?.setAttribute("opacity", `${ambient * 0.36}`);
      });
      element.current?.setAttribute("data-phase", `${phase}`);
      element.current?.setAttribute("data-time", t.toFixed(2));
    },
    playing,
    command,
  );

  return (
    <svg
      ref={element}
      viewBox="-30 -28 246 220"
      role="img"
      aria-label={label}
      className="neural-mark"
      data-reduced-motion={reduced}
    >
      <defs>
        <linearGradient
          id={`${id}-colour`}
          x1="15.2742"
          y1="-12.6352"
          x2="205.862"
          y2="126.638"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="var(--neural-sky)" />
          <stop offset=".5" stopColor="var(--neural-lilac)" />
          <stop offset="1" stopColor="var(--neural-rose)" />
        </linearGradient>
        <linearGradient
          id={`${id}-rings`}
          x1="8.33936"
          y1="2.45602"
          x2="183.69"
          y2="167.361"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="var(--neural-ring-start)" />
          <stop offset="1" stopColor="var(--neural-ring-end)" />
        </linearGradient>
        <radialGradient
          ref={glow}
          id={`${id}-signal`}
          cx="30"
          cy="30"
          r="65"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="var(--neural-ambient-sky)" />
          <stop offset=".4" stopColor="var(--neural-ambient-rose)" stopOpacity=".9" />
          <stop offset="1" stopColor="var(--neural-ambient-lilac)" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}-feather`}>
          <stop offset=".78" stopColor="white" />
          <stop offset="1" stopColor="black" />
        </radialGradient>
        <mask
          id={`${id}-reveal`}
          maskUnits="userSpaceOnUse"
          x="-30"
          y="-28"
          width="246"
          height="220"
        >
          <circle ref={reveal} cx="25" cy="20" r="0" fill={`url(#${id}-feather)`} />
        </mask>
        <clipPath id={`${id}-network`}>
          <path d={geometry.network} />
        </clipPath>
      </defs>
      <g fill="var(--neural-ring)">
        {geometry.rings.map((ring, i) => (
          <path
            key={i}
            d={ring.d}
            ref={(el) => {
              ringRefs.current[i] = el;
            }}
          />
        ))}
      </g>
      <path ref={colorRings} d={geometry.ringPath} fill={`url(#${id}-rings)`} opacity="0" />
      <g ref={organic} fill="var(--neural-node)">
        {edges.map((_, i) => (
          <path
            key={`b${i}`}
            ref={(el) => {
              bridgeRefs.current[i] = el;
            }}
          />
        ))}
        {nodes.map((node, i) => {
          const shape = geometry.silhouettes[i % geometry.silhouettes.length]!;
          return (
            <path
              key={`n${i}`}
              d={shape.d}
              transform={silhouetteTransform(shape, node, node.r)}
              ref={(el) => {
                nodeRefs.current[i] = el;
              }}
            />
          );
        })}
        {edges.map((_, i) => (
          <circle
            key={`s${i}`}
            r="2.4"
            fill="var(--neural-signal)"
            opacity="0"
            ref={(el) => {
              signalRefs.current[i] = el;
            }}
          />
        ))}
      </g>
      <g ref={exact} opacity="0">
        <path d={geometry.network} fill="var(--neural-node)" />
      </g>
      <g ref={color} data-mark-layer="colour" opacity="0" mask={`url(#${id}-reveal)`}>
        <path d={geometry.network} fill={`url(#${id}-colour)`} />
        <path ref={glowPath} d={geometry.network} fill={`url(#${id}-signal)`} opacity="0" />
        <g clipPath={`url(#${id}-network)`} fill="none" strokeLinecap="round" strokeWidth="15">
          {[
            "M38 38L38 126",
            "M38 38L65 59L93 82L120 106L147 126",
            "M147 38L147 126",
            "M38 11L65 37L93 62",
            "M147 11L120 38",
          ].map((d, i) => (
            <path
              key={d}
              d={d}
              pathLength="200"
              stroke={i % 2 ? "var(--neural-pulse-rose)" : "var(--neural-pulse-sky)"}
              strokeDasharray="12 228"
              opacity="0"
              ref={(el) => {
                pulseRefs.current[i] = el;
              }}
            />
          ))}
        </g>
      </g>
    </svg>
  );
}
