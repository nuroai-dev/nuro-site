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
