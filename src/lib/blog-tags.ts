import type { CollectionEntry } from "astro:content";

/**
 * Shared tag helpers for the bilingual blog topic hubs. Tags in post
 * frontmatter are inconsistent in casing and separators ("NPF" vs "npf",
 * "school absence" vs "school-absence"); `tagSlug` normalises them to one key
 * so both spellings collapse to the same tag page.
 */

type BlogEntry = CollectionEntry<"blog"> | CollectionEntry<"blogSv">;

/** Normalise a raw tag to a stable slug ("NPF" → "npf", "school absence" → "school-absence"). */
export const tagSlug = (t: string) =>
  t.toLowerCase().trim().replace(/\s+/g, "-");

/** Only tags used by this many posts (or more) get their own page, to avoid thin pages. */
export const MIN_TAGGED = 2;

/** Display labels for slugs whose Title Case default would read wrong (acronyms). */
const TAG_LABELS: Record<string, string> = {
  npf: "NPF",
  ai: "AI",
  adhd: "ADHD",
  asd: "ASD",
};

/** Human label for a slug: a curated override, else Title Case of the slug. */
export const tagLabel = (slug: string) =>
  TAG_LABELS[slug] ??
  slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

/**
 * Curated one-sentence intros for the topic hubs. Used as the page's meta
 * description, the visible lede under the H1, and the CollectionPage schema
 * description, so every hub reads distinctly instead of sharing the templated
 * "Nuro blog posts about X." A slug with no entry falls back to a generic line.
 */
const TAG_INTRO_EN: Record<string, string> = {
  sweden:
    "How Swedish schools support neurodivergent students, or fail to. The law, the research, the funding, and what actually helps in the classroom.",
  skollagen:
    "What Skollagen, the Swedish Education Act, requires schools to do for students who need extra anpassningar and särskilt stöd, and where everyday practice falls short.",
  neurodiversity:
    "Understanding neurodiversity in education: how ADHD, autism, and dyslexia show up in the classroom and what support helps each student learn.",
  npf: "NPF (neuropsykiatriska funktionsnedsättningar) in Swedish schools: what the terms mean, what the law says, and how to support students with ADHD, autism, and dyslexia.",
  policy:
    "Swedish education policy and neurodivergent students: government inquiries, reforms, and the gap between what is legislated and what reaches the classroom.",
  classroom:
    "Practical, evidence-based classroom strategies for teaching students with ADHD, autism, and dyslexia.",
  rights:
    "The legal rights of neurodivergent students in Swedish schools, and why the right to support does not depend on a diagnosis.",
  "sarskilt-stod":
    "Särskilt stöd in Swedish schools: what it is, when a school must provide it, and how it differs from extra anpassningar.",
  compliance:
    "How Swedish schools can meet, and document, their legal duty to give neurodivergent students the adapted support Skollagen requires.",
  "school-absence":
    "School absence and school refusal (hemmasittare) in Sweden: why it starts, who it affects, and how early support can prevent it.",
  inclusion:
    "Building an inclusive, accessible learning environment (tillgänglig lärmiljö) where neurodivergent students can meet the same goals as their peers.",
  "school-funding":
    "Resources and funding for special support in Swedish schools, and what happens to neurodivergent students when they run short.",
  research:
    "What the research says about neurodiversity, learning, and effective support for students with ADHD, autism, and dyslexia.",
  diagnosis:
    "Diagnosis and school support in Sweden: why a student's needs, not a label, decide the right to help.",
  ai: "How AI can help Swedish schools deliver the individual, adapted support that neurodivergent students are legally entitled to.",
  adhd: "Understanding ADHD in the classroom: how it affects learning and the strategies and adaptations that help students focus and thrive.",
  elevhalsa:
    "The elevhälsa, Sweden's student health team, and its role as the frontline meant to catch struggling students early.",
  "early-support":
    "Why early support matters for neurodivergent students, and how catching difficulties sooner keeps them from hardening into absence.",
};

const TAG_INTRO_SV: Record<string, string> = {
  sweden:
    "Hur svenska skolor stöttar neurodivergenta elever, eller inte gör det. Lagen, forskningen, resurserna och vad som faktiskt hjälper i klassrummet.",
  skollagen:
    "Vad skollagen kräver att skolan gör för elever som behöver extra anpassningar och särskilt stöd, och var vardagen brister.",
  neurodiversity:
    "Att förstå neurodiversitet i skolan: hur adhd, autism och dyslexi visar sig i klassrummet och vilket stöd som hjälper varje elev att lära.",
  npf: "NPF i svenska skolan: vad begreppen betyder, vad lagen säger och hur man stöttar elever med adhd, autism och dyslexi.",
  policy:
    "Svensk skolpolitik och neurodivergenta elever: utredningar, reformer och glappet mellan det som lagstiftas och det som når klassrummet.",
  classroom:
    "Praktiska, evidensbaserade strategier för att undervisa elever med adhd, autism och dyslexi.",
  rights:
    "Neurodivergenta elevers rättigheter i svenska skolan, och varför rätten till stöd inte beror på en diagnos.",
  "sarskilt-stod":
    "Särskilt stöd i skolan: vad det är, när skolan måste ge det och hur det skiljer sig från extra anpassningar.",
  compliance:
    "Hur svenska skolor kan uppfylla, och dokumentera, sin lagstadgade skyldighet att ge neurodivergenta elever det anpassade stöd som skollagen kräver.",
  "school-absence":
    "Skolfrånvaro och hemmasittare i Sverige: varför det börjar, vilka som drabbas och hur tidigt stöd kan förebygga det.",
  inclusion:
    "Att bygga en tillgänglig lärmiljö där neurodivergenta elever kan nå samma mål som sina klasskamrater.",
  "school-funding":
    "Resurser och finansiering för särskilt stöd i skolan, och vad som händer med neurodivergenta elever när de inte räcker till.",
  research:
    "Vad forskningen säger om neurodiversitet, lärande och effektivt stöd för elever med adhd, autism och dyslexi.",
  diagnosis:
    "Diagnos och skolstöd i Sverige: varför elevens behov, inte en etikett, avgör rätten till hjälp.",
  ai: "Hur AI kan hjälpa svenska skolor att ge det individuella, anpassade stöd som neurodivergenta elever har rätt till.",
  adhd: "Att förstå adhd i klassrummet: hur det påverkar lärandet och vilka strategier och anpassningar som hjälper eleven att fokusera och lyckas.",
  elevhalsa:
    "Elevhälsan och dess roll som den första linjen som ska fånga upp elever som kämpar tidigt.",
  "early-support":
    "Varför tidigt stöd är avgörande för neurodivergenta elever, och hur man förebygger att svårigheter hårdnar till frånvaro.",
};

/** Intro line for an English topic hub: curated override, else a generic fallback. */
export const tagIntroEn = (slug: string, label: string) =>
  TAG_INTRO_EN[slug] ??
  `Articles from Nuro on ${label} in Swedish schools: the research, the law, and what helps neurodivergent students.`;

/** Intro line for a Swedish topic hub: curated override, else a generic fallback. */
export const tagIntroSv = (slug: string, label: string) =>
  TAG_INTRO_SV[slug] ??
  `Artiklar från Nuro om ${label} i svenska skolan: forskningen, lagen och vad som hjälper neurodivergenta elever.`;

export interface TagGroup {
  slug: string;
  label: string;
  posts: BlogEntry[];
}

/**
 * Build the qualifying tag index for a set of posts. Each post contributes once
 * per unique slug (so casing/separator variants don't double-count). Returns one
 * group per slug used by >= MIN_TAGGED posts, each group's posts sorted by
 * pubDate descending, and the groups sorted by post count descending then slug
 * ascending. Pure: pass in the collection entries, no getCollection inside.
 */
export function buildTagIndex(posts: BlogEntry[]): TagGroup[] {
  const bySlug = new Map<string, BlogEntry[]>();

  for (const post of posts) {
    const slugs = new Set(post.data.tags.map(tagSlug));
    for (const slug of slugs) {
      const bucket = bySlug.get(slug);
      if (bucket) bucket.push(post);
      else bySlug.set(slug, [post]);
    }
  }

  return [...bySlug.entries()]
    .filter(([, entries]) => entries.length >= MIN_TAGGED)
    .map(([slug, entries]) => ({
      slug,
      label: tagLabel(slug),
      posts: [...entries].sort(
        (a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime(),
      ),
    }))
    .sort((a, b) => b.posts.length - a.posts.length || a.slug.localeCompare(b.slug));
}
