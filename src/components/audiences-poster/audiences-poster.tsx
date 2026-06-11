import Reveal from "@/components/motion/reveal";
import styles from "./audiences-poster.module.css";

/**
 * Audiences poster section — editorial three-panel exploration (operator
 * design pass 2026-06-12), added BELOW the purple audiences band as a new
 * take on the same three audiences. Inspired by tall scan-clinic poster
 * cards: small eyebrow, large display headline, atmospheric gradient
 * filling the panel, product chip anchored bottom.
 *
 * Server component; panels reveal with a stagger and lift slightly on
 * hover. All visuals are CSS gradients — no images.
 */

type Panel = {
  eyebrow: string;
  headline: string;
  bullets: readonly string[];
  chip: string;
  tone: "light" | "indigo" | "pink";
};

const PANELS: readonly Panel[] = [
  {
    eyebrow: "For Students",
    headline: "Learning that works with your brain.",
    bullets: [
      "24/7 personalized support",
      "Zero overwhelm",
      "Research-backed structure",
    ],
    chip: "▶ Start first block",
    tone: "light",
  },
  {
    eyebrow: "For Teachers",
    headline: "Every student seen. No extra hours.",
    bullets: [
      "Automated adaptation",
      "Saves 40+ hours per month",
      "Easier documentation and follow-up",
    ],
    chip: "Focus score 72",
    tone: "indigo",
  },
  {
    eyebrow: "For Parents",
    headline: "Know how your child is really doing.",
    bullets: [
      "Real-time progress feed",
      "Auto-compliance documentation",
      "Direct connection with teachers",
    ],
    chip: "93% of focus blocks completed",
    tone: "pink",
  },
];

const TONE_CLASS: Record<Panel["tone"], string> = {
  light: styles.toneLight,
  indigo: styles.toneIndigo,
  pink: styles.tonePink,
};

const CLOSING =
  "By automating support, Nuro doesn't just save time, it prevents the lifetime societal cost of student dropouts due to lack of bandwidth.";

export default function AudiencesPoster() {
  return (
    <section id="audience" className={styles.section}>
      <div className={styles.container}>
        <Reveal className={styles.header}>
          <h2 className={styles.heading}>
            One platform.
            <br />
            <span className={styles.headingMuted}>Three experiences.</span>
          </h2>
          <a className={styles.cta} href="#waitlist">
            Join waitlist <span aria-hidden="true">→</span>
          </a>
        </Reveal>

        <div className={styles.grid}>
          {PANELS.map((panel, i) => (
            <Reveal
              key={panel.eyebrow}
              className={`${styles.panel} ${TONE_CLASS[panel.tone]}`}
              delay={i * 0.08}
            >
              <div className={styles.panelTop}>
                <div className={styles.eyebrow}>{panel.eyebrow}</div>
                <h3 className={styles.headline}>{panel.headline}</h3>
              </div>

              <div className={styles.panelBottom}>
                <ul className={styles.bullets}>
                  {panel.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
                <span className={styles.chip}>{panel.chip}</span>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal as="p" className={styles.closing} delay={0.24}>
          {CLOSING}
        </Reveal>
      </div>
    </section>
  );
}
