/** The transport owns speech; this contract owns only its presentation. */
export type VoiceSpeaker = "nuro" | "user";
export type VoicePhase = "idle" | "loading" | "listening" | "speaking" | "paused";
export type NuroExpression =
  | "idle"
  | "listening"
  | "thinking"
  | "speaking"
  | "curious"
  | "happy"
  | "excited"
  | "proud"
  | "reassuring"
  | "oops"
  | "sleepy"
  | "playful";
export type NuroGesture =
  | "blink"
  | "look-left"
  | "look-right"
  | "look-up"
  | "gaze-wander"
  | "sway"
  | "tilt"
  | "wobble"
  | "bounce"
  | "float-lift"
  | "sigh"
  | "shiver"
  | "spin-shine"
  | "wave-hello"
  | "nod"
  | "head-shake"
  | "wink"
  | "happy-eyes"
  | "listening-lean"
  | "peek"
  | "shy-sink"
  | "attention-hop"
  | "sparkle-gift"
  | "oops-soft"
  | "proud-swell"
  | "yawn-stretch"
  | "hat-trick"
  | "mote-juggle"
  | "zoomies";

export type AudioFeatures = {
  energy: number;
  brightness: number;
  bands: readonly number[] | Float32Array;
};
export type VoiceSnapshot = {
  turnId: number;
  speaker: VoiceSpeaker;
  phase: VoicePhase;
  caption: string;
  expression: NuroExpression | null;
  gesture: { name: NuroGesture; id: number } | null;
};
export type VoiceTurn = {
  id: number;
  isCurrent: () => boolean;
  /** Call from actual playback/capture events, never text-token arrival. */
  playing: () => void;
  waiting: () => void;
  pause: () => void;
  caption: (text: string) => void;
  expression: (mood: NuroExpression | null) => void;
  gesture: (name: NuroGesture) => void;
  audio: (features: AudioFeatures) => void;
  silence: () => void;
  end: () => void;
};
export type VoicePresentation = {
  getSnapshot: () => VoiceSnapshot;
  subscribe: (listener: () => void) => () => void;
  getAudio: () => AudioFeatures;
  subscribeAudio: (listener: (features: AudioFeatures) => void) => () => void;
  begin: (options: {
    speaker: VoiceSpeaker;
    caption?: string;
    expression?: NuroExpression;
    /** Stop the old transport when another speaker/utterance takes over. */
    onInterrupt?: () => void;
  }) => VoiceTurn;
  interrupt: () => void;
};
