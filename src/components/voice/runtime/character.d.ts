import type { NuroExpression, NuroGesture } from "../types";
/** Optional entrance choreography. Null hands the character back to its normal rig. */
export type EntrancePose = {
  eyes: number;
  outline: number;
  fill: number;
  glass: number;
  scale: number;
  stretch: number;
  lift: number;
  lookX: number;
  lids: number;
  influence: number;
};
export type CharacterController = {
  setState: (phase: "idle" | "listening" | "thinking" | "speaking" | "ready") => void;
  setExpression: (expression: NuroExpression | null) => void;
  playGesture: (gesture: NuroGesture, options?: { preview?: boolean }) => boolean;
  cancelGesture: () => void;
  setPaused: (paused: boolean) => void;
  setAudioFeatures: (features: { energy: number; brightness: number }) => void;
  setReducedMotion: (reduced: boolean) => void;
  setFaceVisible: (visible: boolean) => void;
  setEntrancePose: (pose: EntrancePose | null) => void;
  snapshot: () => Record<string, unknown>;
  dispose: () => void;
};
export function createNuroCharacter(canvas: HTMLCanvasElement, options?: {
  onReady?: () => void;
  onError?: (error?: unknown) => void;
  pixelRatio?: number;
  random?: () => number;
}): CharacterController;
