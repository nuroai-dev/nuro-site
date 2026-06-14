/**
 * Site motion runtime (SPEC §5.1–5.2) — vanilla, no animation library.
 *
 * Two IntersectionObservers, set up once per page:
 *  - Reveal: every [data-reveal] element is hidden by CSS until it scrolls
 *    into view, then gets data-shown to layer the one-shot blur-up entrance.
 *    Fires once (unobserved on intersect) so scrolling back up never re-blurs.
 *    will-change is released ~1.2s after the (delay-aware) entrance completes.
 *  - Aurora: each [data-aurora-root] toggles data-paused so the blob drift
 *    animations pause while the field is off-screen.
 *
 * Engines without IntersectionObserver reveal everything immediately (never
 * stranded hidden) and let the aurora keep drifting.
 */

type RevealCallback = () => void;

function showReveal(el: HTMLElement): void {
  el.dataset.shown = "1";
  // Release the promoted GPU layer once the entrance has finished so we don't
  // keep dozens of layers alive. Delay-aware: a staggered item finishes at
  // delay + 0.9s, so a fixed timer could drop the layer mid-animation.
  const delay = Number.parseFloat(el.dataset.revealDelay ?? "0") || 0;
  window.setTimeout(() => {
    el.style.willChange = "auto";
  }, delay * 1000 + 1200);
}

function initReveal(): void {
  const els = Array.from(
    document.querySelectorAll<HTMLElement>("[data-reveal]"),
  );
  if (els.length === 0) return;

  if (typeof IntersectionObserver === "undefined") {
    for (const el of els) showReveal(el);
    return;
  }

  const callbacks = new WeakMap<Element, RevealCallback>();
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const cb = callbacks.get(entry.target);
        observer.unobserve(entry.target);
        callbacks.delete(entry.target);
        cb?.();
      }
    },
    { rootMargin: "0px 0px -5% 0px" },
  );

  for (const el of els) {
    if (el.dataset.shown) continue;
    callbacks.set(el, () => showReveal(el));
    observer.observe(el);
  }
}

function initAurora(): void {
  const roots = document.querySelectorAll<HTMLElement>("[data-aurora-root]");
  if (roots.length === 0 || typeof IntersectionObserver === "undefined") return;

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        (entry.target as HTMLElement).dataset.paused = entry.isIntersecting
          ? "false"
          : "true";
      }
    },
    { rootMargin: "100px" },
  );
  roots.forEach((root) => observer.observe(root));
}

function init(): void {
  initReveal();
  initAurora();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
