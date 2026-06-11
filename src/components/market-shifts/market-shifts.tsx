import styles from './market-shifts.module.css';

/**
 * Four cards pulled from the pitch's "market shifts" slide. Each card
 * gets a holo-palette accent tint (sky / lavender / rose / peach) so
 * the section reads as a holographic family rather than four identical
 * pieces. Numbered badges give a rhythm; uppercase eyebrows echo the
 * slide's visual structure.
 */

type Shift = {
  num: string;
  eyebrow: string;
  label: string;
  body: string;
  tint: string; // hex
};

const SHIFTS: Shift[] = [
  {
    num: '01',
    eyebrow: 'Diagnoses rising',
    label: 'Neurodivergence has moved into the mainstream conversation.',
    body: 'Autism and ADHD referrals, assessments, and recorded diagnoses have climbed sharply in many countries. What was once treated as niche is now a familiar part of school, family, and workplace life.',
    tint: '#C9B8FF',
  },
  {
    num: '02',
    eyebrow: 'AI capability leap',
    label: 'AI can finally adapt to the learner.',
    body: 'Frontier AI models can now genuinely adapt instruction to each learner’s needs, not just reformat content. For the first time, personalized support can be delivered at scale.',
    tint: '#A7C7FF',
  },
  {
    num: '03',
    eyebrow: 'The need is validated',
    label: 'Parents are already paying.',
    body: 'Families already spend heavily on fragmented learning support: tutoring, therapy, assessments, and software. This is not a new budget category; it is existing demand waiting for a better product.',
    tint: '#E8BFE6',
  },
  {
    num: '04',
    eyebrow: 'Institutional pressure',
    label: 'Legal and regulatory pressure.',
    body: 'Municipalities face growing legal and financial liability for failing neurodivergent students. Compliance is no longer optional, and budgets are being allocated to meet the new mandate.',
    tint: '#FFD9C2',
  },
];

export default function MarketShifts() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <h2 className={styles.headline}>
          Four market shifts are<br />
          <span className={styles.shimmer}>converging at once.</span>
        </h2>

        <div className={styles.grid}>
          {SHIFTS.map((s) => (
            <article
              key={s.num}
              className={styles.card}
              style={{ ['--tint' as string]: s.tint }}
            >
              <div className={styles.badge}>{s.num}</div>
              <p className={styles.eyebrow}>{s.eyebrow}</p>
              <h3 className={styles.label}>{s.label}</h3>
              <p className={styles.body}>{s.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
