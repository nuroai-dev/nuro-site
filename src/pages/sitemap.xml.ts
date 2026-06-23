import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

/**
 * Dynamic sitemap — static pages plus every published blog post, so new posts
 * appear automatically without anyone editing a file. Prerendered to a static
 * /sitemap.xml at build (robots.txt points here).
 */
export const prerender = true;

const SITE = "https://nuroai.dev";

const STATIC: { path: string; changefreq: string; priority: string }[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/about/", changefreq: "monthly", priority: "0.8" },
  { path: "/team/", changefreq: "monthly", priority: "0.6" },
  { path: "/blog/", changefreq: "weekly", priority: "0.8" },
  { path: "/press/", changefreq: "monthly", priority: "0.6" },
  { path: "/career/", changefreq: "monthly", priority: "0.6" },
  { path: "/privacy/", changefreq: "yearly", priority: "0.3" },
  { path: "/terms/", changefreq: "yearly", priority: "0.3" },
];

export const GET: APIRoute = async () => {
  const posts = await getCollection("blog", ({ data }) => !data.draft);

  const urls = [
    ...STATIC.map(
      (p) =>
        `  <url>\n    <loc>${SITE}${p.path}</loc>\n    <changefreq>${p.changefreq}</changefreq>\n    <priority>${p.priority}</priority>\n  </url>`,
    ),
    ...posts.map(
      (post) =>
        `  <url>\n    <loc>${SITE}/blog/${post.id}/</loc>\n    <lastmod>${post.data.pubDate.toISOString().slice(0, 10)}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>`,
    ),
  ].join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml" },
  });
};
