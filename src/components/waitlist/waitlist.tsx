import Aurora from "@/components/motion/aurora";
import Reveal from "@/components/motion/reveal";

import {
  WAITLIST_EYEBROW,
  WAITLIST_HEADING_GRADIENT,
  WAITLIST_HEADING_POST,
  WAITLIST_HEADING_PRE,
  WAITLIST_SUB,
} from "./copy";
import WaitlistForm from "./waitlist-form";
import styles from "./waitlist.module.css";

/**
 * Waitlist section (`#waitlist`) — SPEC §4 Waitlist (card N-09).
 *
 * Server component shell: aurora background + header copy in the SSR HTML;
 * the form itself is the client island (<WaitlistForm>). Mounted in page.tsx
 * by card N-11. Entrances stagger per SPEC §5.1: header at 0/.08/.16, form
 * card +0.24s.
 */
export default function Waitlist() {
  return (
    <section className={styles.section} id="waitlist">
      <Aurora variant="waitlist" />
      <div className={styles.container}>
        <Reveal as="p" className={styles.eyebrow}>
          {WAITLIST_EYEBROW}
        </Reveal>
        <Reveal as="h2" delay={0.08} className={styles.heading}>
          {WAITLIST_HEADING_PRE}
          <span className="holo-text">{WAITLIST_HEADING_GRADIENT}</span>
          {WAITLIST_HEADING_POST}
        </Reveal>
        <Reveal as="p" delay={0.16} className={styles.subLead}>
          {WAITLIST_SUB}
        </Reveal>
        <Reveal delay={0.24}>
          <WaitlistForm />
        </Reveal>
      </div>
    </section>
  );
}
