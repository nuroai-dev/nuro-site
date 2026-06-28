import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

/**
 * Blog RSS 2.0 feed (English), prerendered to /rss.xml. Hand-rolled to match
 * sitemap.xml.ts, no extra dependency. Lists every published English post,
 * newest first.
 */
export const prerender = true;

const SITE = "https://nuroai.dev";

const esc = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export const GET: APIRoute = async () => {
  const posts = (
    await getCollection("blog", ({ data }) => !data.draft)
  ).sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());

  const items = posts
    .map((post) => {
      const url = `${SITE}/blog/${post.id}/`;
      return `    <item>
      <title>${esc(post.data.title)}</title>
      <link>${url}</link>
      <guid>${url}</guid>
      <pubDate>${post.data.pubDate.toUTCString()}</pubDate>
      <description>${esc(post.data.description)}</description>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Nuro Blog</title>
    <link>${SITE}/blog</link>
    <description>Notes on neurodiversity in education: what the research says, what the law requires, and what actually helps teachers, students, and parents.</description>
    <language>en</language>
    <atom:link href="${SITE}/rss.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>
`;

  return new Response(xml, { headers: { "Content-Type": "application/xml" } });
};
