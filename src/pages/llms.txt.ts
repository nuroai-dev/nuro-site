import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

/**
 * Dynamic llms.txt. A curated site summary followed by an auto-generated list
 * of every published blog post (title + description from frontmatter, newest
 * first), so the file never goes stale as posts are added. Prerendered to
 * /llms.txt. Single source of truth for the blog list = the content collection.
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
- [Blog](https://nuroai.dev/blog): notes on neurodiversity in education, the research, the law, and what helps.
- [Privacy](https://nuroai.dev/privacy) and [Terms](https://nuroai.dev/terms).

## Blog posts
`;

export const GET: APIRoute = async () => {
  const posts = (await getCollection("blog", ({ data }) => !data.draft)).sort(
    (a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime(),
  );
  const lines = posts.map(
    (p) => `- [${p.data.title}](${SITE}/blog/${p.id}): ${p.data.description}`,
  );
  const body = `${HEADER}\n${lines.join("\n")}\n`;
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
