import { getCollection } from "astro:content";
import { buildTagIndex, type TagGroup } from "@/lib/blog-tags";

// The one answer to "which tag hubs exist in which language": the hub routes, their OG cards,
// hreflang, the language switcher, the sitemap and llms.txt all read it from here.

type Lang = "en" | "sv";

/** The tag hubs one language publishes, exactly the pages its [tag].astro route generates. */
export async function tagHubs(lang: Lang): Promise<TagGroup[]> {
  const posts = await getCollection(lang === "sv" ? "blogSv" : "blog", ({ data }) => !data.draft);
  return buildTagIndex(posts, lang);
}

// Read once at module load so i18n/ui.ts can stay synchronous for Layout, Nav and Footer.
export const TAG_HUB_SLUGS: Record<Lang, ReadonlySet<string>> = {
  en: new Set((await tagHubs("en")).map((g) => g.slug)),
  sv: new Set((await tagHubs("sv")).map((g) => g.slug)),
};
