import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

/**
 * Swedish blog RSS 2.0 feed, prerendered to /sv/rss.xml. Mirrors rss.xml.ts
 * but reads the blogSv collection and links to the /sv/blog URLs.
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
    await getCollection("blogSv", ({ data }) => !data.draft)
  ).sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());

  const items = posts
    .map((post) => {
      const url = `${SITE}/sv/blog/${post.id}/`;
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
    <title>Nuro Blogg</title>
    <link>${SITE}/sv/blog</link>
    <description>Tankar om neurodiversitet i skolan, vad forskningen säger, vad lagen kräver och vad som faktiskt hjälper lärare, elever och föräldrar.</description>
    <language>sv</language>
    <atom:link href="${SITE}/sv/rss.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>
`;

  return new Response(xml, { headers: { "Content-Type": "application/xml" } });
};
