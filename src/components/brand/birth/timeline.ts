import type { EntrancePose } from "@/components/voice/runtime/character";

export const BIRTH_DURATION = 6.65;
export const BIRTH_PHASES = ["waiting", "eyes", "looking", "blinking", "outline", "fill", "pop", "alive"] as const;
export type BirthPhase = (typeof BIRTH_PHASES)[number];

const clamp = (n: number) => Math.min(1, Math.max(0, n));
const progress = (time: number, start: number, duration: number) => clamp((time - start) / duration);
const smooth = (n: number) => n * n * (3 - 2 * n);
const out = (n: number) => 1 - (1 - n) ** 3;
const mix = (a: number, b: number, n: number) => a + (b - a) * n;

function gaze(time: number) {
  let x = -0.12 * smooth(progress(time, 0.98, 0.23));
  x += 0.24 * smooth(progress(time, 1.83, 0.26));
  x -= 0.12 * smooth(progress(time, 2.65, 0.25));
  return x;
}

function blink(time: number, start: number) {
  const age = time - start;
  if (age < 0 || age >= 0.23) return 1;
  return age < 0.075
    ? mix(1, 0.065, smooth(age / 0.075))
    : mix(0.065, 1, out((age - 0.075) / 0.155));
}

/** A single time source, so replay/visibility/pause cannot desynchronise the face and body. */
export function birthFrame(time: number): EntrancePose & { phase: BirthPhase; shadow: number } {
  const popAge = time - 5.20;
  const compress = smooth(progress(time, 4.98, 0.22));
  let scale = 0.64;
  let stretch = 1 - compress * 0.18;
  let lift = -compress * 0.045;
  if (popAge >= 0) {
    // A fast launch, one overshoot and a small counter-settle. Never a loose wobble.
    if (popAge < 0.26) {
      const p = out(popAge / 0.26);
      scale = mix(0.64, 1.105, p);
      stretch = mix(0.82, 1.075, p);
      lift = mix(-0.045, 0.105, p);
    } else if (popAge < 0.62) {
      const p = smooth((popAge - 0.26) / 0.36);
      scale = mix(1.105, 0.982, p);
      stretch = mix(1.075, 0.978, p);
      lift = mix(0.105, -0.012, p);
    } else {
      const p = out(progress(popAge, 0.62, 0.32));
      scale = mix(0.982, 1, p);
      stretch = mix(0.978, 1, p);
      lift = mix(-0.012, 0, p);
    }
  }
  const phase: BirthPhase = time < 0.30 ? "waiting"
    : time < 0.98 ? "eyes"
    : time < 3.03 ? "looking"
    : time < 3.67 ? "blinking"
    : time < 4.48 ? "outline"
    : time < 5.20 ? "fill"
    : time < BIRTH_DURATION ? "pop" : "alive";
  return {
    eyes: out(progress(time, 0.30, 0.25)),
    outline: out(progress(time, 3.67, 0.65)),
    fill: smooth(progress(time, 4.48, 0.43)),
    glass: out(progress(time, 5.23, 0.42)),
    lookX: gaze(time),
    lids: Math.min(blink(time, 3.03), blink(time, 3.36)),
    influence: 1 - smooth(progress(time, 6.16, BIRTH_DURATION - 6.16)),
    shadow: smooth(progress(time, 5.25, 0.85)),
    scale, stretch, lift, phase,
  };
}
