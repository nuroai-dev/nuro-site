import { useEffect, useMemo, useRef } from "react";
import {
  attachmentRadius,
  bridgePath,
  logoGeometry,
  mix,
  silhouetteTransform,
  smooth,
  spring,
} from "@/components/brand/neural-motion/geometry";

/** The vector mark's coordinate space; it sits inside the responsive button circle. */
const MARK_SIZE = 46;
const CENTER = { x: MARK_SIZE / 2, y: MARK_SIZE / 2 };

/**
 * Nuro's "respond" mark, played inside the join button: one white node appears, two more
 * bud out of it on elastic necks, and the three bob once. Runs for about a second.
 * `delay` (ms) waits for the button to finish shrinking.
 */
export function JoinMark({ delay }: { delay: number }) {
  const { silhouettes } = useMemo(logoGeometry, []);
  const root = useRef<SVGSVGElement>(null);
  const shapes = useRef<(SVGPathElement | null)[]>([]);
  const bridges = useRef<(SVGPathElement | null)[]>([]);

  useEffect(() => {
    let frame = 0;
    const start = performance.now() + delay;
    const draw = (now: number) => {
      const t = Math.max(0, (now - start) / 1000);
      const appear = spring(t / 0.3);
      const grow = spring((t - 0.15) / 0.5);
      root.current?.setAttribute("opacity", `${smooth(t / 0.1)}`);
      const positions = [-1, 0, 1].map((side, i) => {
        const bounce = Math.sin(t * 6.5 - i * 1.5) * Math.exp(-((t - 0.7) ** 2) * 4);
        const p = { x: CENTER.x + side * 10 * grow, y: CENTER.y + bounce * 1.5 * grow };
        const radius = side === 0
          ? mix(6 * appear, 4.5, smooth((t - 0.15) / 0.4)) + bounce * 0.4
          : 4 * smooth(grow / 0.9) + bounce * 0.4;
        const shape = silhouettes[(i * 3 + 2) % silhouettes.length]!;
        const size = Math.max(radius, 0.01);
        shapes.current[i]?.setAttribute("transform", silhouetteTransform(shape, p, size, bounce * 5));
        return { ...p, radius: attachmentRadius(shape, size) };
      });
      for (let i = 0; i < 2; i++) {
        bridges.current[i]?.setAttribute(
          "d",
          bridgePath(positions[i]!, positions[i + 1]!, positions[i]!.radius, smooth(grow), positions[i + 1]!.radius),
        );
      }
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [delay, silhouettes]);

  return (
    <svg ref={root} className="landing-join-mark" viewBox={`0 0 ${MARK_SIZE} ${MARK_SIZE}`} aria-hidden="true" opacity="0">
      <g fill="currentColor">
        {[0, 1].map((i) => <path key={`bridge${i}`} ref={(el) => { bridges.current[i] = el; }} />)}
        {[0, 1, 2].map((i) => (
          <path key={i} d={silhouettes[(i * 3 + 2) % silhouettes.length]!.d}
            ref={(el) => { shapes.current[i] = el; }} />
        ))}
      </g>
    </svg>
  );
}
