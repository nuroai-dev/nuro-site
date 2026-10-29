export function createTextMotion(root: HTMLElement, options?: { reduced?: boolean; animateOnMount?: boolean; granularity?: "letter" | "word" }): {
  set: (element: HTMLElement, text: string, options?: { stream?: boolean; immediate?: boolean }) => void;
  setReducedMotion: (reduced: boolean) => void;
  reveal: (scope: HTMLElement) => void;
  dispose: () => void;
};
