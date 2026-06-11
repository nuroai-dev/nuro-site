/**
 * Temporary motion-primitives demo route (SPEC §5.1–5.2, card N-02).
 * Exercises <Reveal> staggers and <Aurora> variants in isolation so the
 * blur-up entrance, fire-once behaviour, off-screen pause, and
 * reduced-motion fallback can be verified by hand.
 *
 * REMOVED IN N-14 — not part of the shipped site.
 */
import { Aurora } from "@/components/motion/aurora";
import { Reveal } from "@/components/motion/reveal";

const CARDS = [
  {
    title: "Blur-up entrance",
    body: "Each block fades and de-blurs as it enters the viewport, then never re-blurs on scroll-up.",
  },
  {
    title: "Staggered reveal",
    body: "Children share one IntersectionObserver and offset their animationDelay for a top-to-bottom cascade.",
  },
  {
    title: "Ambient aurora",
    body: "Four soft blobs drift behind the content and pause when scrolled out of view.",
  },
];

export default function MotionDemoPage() {
  return (
    <main>
      <section
        style={{
          position: "relative",
          overflow: "hidden",
          minHeight: "100vh",
          padding: "16vh 6vw",
        }}
      >
        <Aurora variant="hero" />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 760 }}>
          <Reveal as="h1" style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)" }}>
            Motion primitives
          </Reveal>
          <Reveal as="p" delay={0.08} style={{ marginTop: "1.25rem" }}>
            This page is a scratchpad for the <code>Reveal</code> and{" "}
            <code>Aurora</code> components. Scroll to watch below-fold items
            blur up with a staggered cascade.
          </Reveal>
          <Reveal as="p" delay={0.16} style={{ marginTop: "1rem" }}>
            Enable <code>prefers-reduced-motion: reduce</code> and everything
            stays static and sharp — no hidden frames, no drift.
          </Reveal>
          <div
            style={{
              display: "grid",
              gap: "1rem",
              marginTop: "2.5rem",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            }}
          >
            {CARDS.map((card, i) => (
              <Reveal
                key={card.title}
                delay={0.24 + i * 0.08}
                style={{
                  padding: "1.5rem",
                  borderRadius: "var(--r-l)",
                  background: "var(--surface)",
                  border: "1px solid var(--hair)",
                  boxShadow: "var(--shadow-m)",
                }}
              >
                <h3 style={{ fontSize: "1.15rem" }}>{card.title}</h3>
                <p style={{ marginTop: "0.5rem" }}>{card.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section
        style={{
          position: "relative",
          overflow: "hidden",
          minHeight: "80vh",
          padding: "16vh 6vw",
        }}
      >
        <Aurora variant="card" />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 760 }}>
          <Reveal as="h2" style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}>
            Subtle card aurora
          </Reveal>
          <Reveal as="p" delay={0.08} style={{ marginTop: "1.25rem" }}>
            The <code>card</code> variant runs the same field at a lower base
            opacity for use behind dense content.
          </Reveal>
        </div>
      </section>
    </main>
  );
}
