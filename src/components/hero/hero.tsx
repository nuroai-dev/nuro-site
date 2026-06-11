import Aurora from "@/components/motion/aurora";
import Reveal from "@/components/motion/reveal";

import VideoFacade from "./video-facade";
import styles from "./hero.module.css";

/**
 * Hero — SPEC §4 "Hero (min 100vh, aurora background)".
 *
 * Server component: all copy is in the SSR HTML. The only interactive part
 * is the click-to-play video facade, isolated in <VideoFacade>. Layout and
 * type scale port `~/nuro-website-design/nuro-site/nuro-site.css` (.hero);
 * the CTA uses the holo-drift gradient treatment from SPEC §5.3.
 *
 * Entrances stagger per SPEC §5.1: H1 at 0, lead +0.08s, CTA +0.16s,
 * media card +0.24s. All four are `eager` (SPEC §6 N-14): above-fold
 * content starts its entrance at first paint via CSS so the LCP is never
 * delayed by hydration.
 */
export default function Hero() {
  return (
    <section className={styles.hero} id="hero">
      <Aurora variant="hero" />
      <div className={styles.inner}>
        <Reveal as="h1" eager className={styles.title}>
          The missing tool for
          <br />
          <span className="holo-text">neurodivergent</span>
          <br />
          students.
        </Reveal>
        <Reveal as="p" eager delay={0.08} className={styles.sub}>
          Learning that finally works for the 1 in 6, bringing teachers,
          students and parents together so no child falls through the cracks
          again.
        </Reveal>
        <Reveal eager delay={0.16} className={styles.ctaRow}>
          <a href="#waitlist" className={`${styles.cta} focusable`}>
            Join the waiting list
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </a>
        </Reveal>
        <Reveal eager delay={0.24}>
          <VideoFacade />
        </Reveal>
      </div>
    </section>
  );
}
