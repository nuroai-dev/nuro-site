import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { buildTagIndex, tagIntroEn } from "@/lib/blog-tags";

/**
 * Dynamic llms.txt. A curated site summary, then two auto-generated sections:
 * the topic hubs (the blog's thematic map, so an answer engine can see what we
 * cover by subject, not just a flat list) and every published blog post (title
 * + description from frontmatter, newest first). Neither can go stale as posts
 * are added. Prerendered to /llms.txt. Single source of truth = the content
 * collection, and the same buildTagIndex the hub pages themselves are built
 * from, so the counts here always match the live hubs.
 */
export const prerender = true;

const SITE = "https://nuroai.dev";

const HEADER = `# Nuro

> Nuro is an AI-powered education platform that helps Swedish schools give neurodivergent students (including those with ADHD, autism, and dyslexia) the adapted support they are legally entitled to under Skollagen (the Swedish Education Act). It helps teachers see each individual student, automatically adapts lessons to how each child learns, and flags students at risk of falling behind long before they become school refusers (hemmasittare).

The site is bilingual: English at the root and Swedish under /sv (for example https://nuroai.dev/sv/).

## What Nuro does

- **For teachers:** automated lesson adaptation and easier documentation, so every student is seen without hours of extra manual work.
- **For students:** a learning experience that works with how their brain functions, broken into clear, structured steps.
- **For parents:** a real-time view of how their child is actually doing.
- **Compliance:** helps schools deliver and automatically document the adapted support (särskilt stöd) that Swedish law requires.

## Key facts

- Country / market: Sweden.
- Audience: schools, teachers, students, and parents.
- Supported needs: ADHD, autism, dyslexia, and other neurodivergent learning profiles.
- Status: in active development; access is via the waitlist at https://nuroai.dev/#waitlist
- Contact: hello@nuroai.dev

## Pages

- [Home](https://nuroai.dev/): the problem, the business case, the solution, and the three experiences (students, teachers, parents). Swedish: https://nuroai.dev/sv/
- [About](https://nuroai.dev/about): Nuro's mission statement.
- [Team](https://nuroai.dev/team): the people building Nuro.
- [Press](https://nuroai.dev/press): news and coverage.
- [Career](https://nuroai.dev/career): join the team.
- [FAQ](https://nuroai.dev/faq): direct answers to the twenty questions families and schools ask most about Swedish school support, grouped into rights and the law, everyday school life, school refusal, and what is changing in 2026. Each answer cites the rule it rests on and links to a fuller explainer. Swedish: https://nuroai.dev/sv/faq
- [Blog](https://nuroai.dev/blog): notes on neurodiversity in education, the research, the law, and what helps.
- [Topics](https://nuroai.dev/blog/tags): every subject the blog covers, each with its own hub page. Swedish: https://nuroai.dev/sv/blog/tags
- [Glossary](https://nuroai.dev/glossary): plain-language definitions of the Swedish school-support system (ledning och stimulans, extra anpassningar, särskilt stöd, åtgärdsprogram, elevhälsa, NPF, tilläggsbelopp, and more), each linking to a fuller explainer. Swedish: https://nuroai.dev/sv/glossary
- [Privacy](https://nuroai.dev/privacy) and [Terms](https://nuroai.dev/terms).
`;

export const GET: APIRoute = async () => {
  const posts = (await getCollection("blog", ({ data }) => !data.draft)).sort(
    (a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime(),
  );
  // The Swedish half of the site is addressable here too, so a model answering
  // a Swedish question can cite the Swedish page instead of the English one.
  // Derived from the blogSv collection rather than assumed, so an English-only
  // post can never emit a Swedish URL that 404s.
  const postsSv = await getCollection("blogSv", ({ data }) => !data.draft);
  const svIds = new Set(postsSv.map((p) => p.id));
  const svTagSlugs = new Set(buildTagIndex(postsSv).map((t) => t.slug));
  // Thematic map first: same index the hub pages are built from, so labels,
  // membership and counts always agree with what is actually published.
  const topicLines = buildTagIndex(posts).map(
    (t) =>
      `- [${t.label}](${SITE}/blog/tag/${t.slug}) (${t.posts.length} posts): ${tagIntroEn(t.slug, t.label)}${
        svTagSlugs.has(t.slug) ? ` Swedish: ${SITE}/sv/blog/tag/${t.slug}` : ""
      }`,
  );
  const postLines = posts.map(
    (p) =>
      `- [${p.data.title}](${SITE}/blog/${p.id}): ${p.data.description}${
        svIds.has(p.id) ? ` Swedish: ${SITE}/sv/blog/${p.id}` : ""
      }`,
  );
  const body = [
    HEADER,
    "\n## Topics\n",
    "Each topic below has a hub page listing every post on that subject.\n",
    topicLines.join("\n"),
    "\n## Blog posts\n",
    "Where a Swedish translation exists, its URL follows the English one.\n",
    postLines.join("\n"),
    "",
  ].join("\n");
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
