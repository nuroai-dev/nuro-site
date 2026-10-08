import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { hreflangUrls } from "@/i18n/ui";
import { TAG_HUB_SLUGS } from "@/lib/tag-hubs";

// Static pages, posts and tag hubs, each with xhtml:link hreflang alternates. Every URL comes from
// hreflangUrls(), the helper Layout.astro uses, so loc == canonical == in-page hreflang.
export const prerender = true;

const STATIC: { path: string; changefreq: string; priority: string }[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/about", changefreq: "monthly", priority: "0.8" },
  { path: "/team", changefreq: "monthly", priority: "0.6" },
  { path: "/blog", changefreq: "weekly", priority: "0.8" },
  { path: "/blog/tags", changefreq: "weekly", priority: "0.5" },
  { path: "/faq", changefreq: "monthly", priority: "0.7" },
  { path: "/glossary", changefreq: "monthly", priority: "0.6" },
  { path: "/press", changefreq: "monthly", priority: "0.6" },
  { path: "/career", changefreq: "monthly", priority: "0.6" },
  { path: "/privacy", changefreq: "yearly", priority: "0.3" },
  { path: "/terms", changefreq: "yearly", priority: "0.3" },
];

export const GET: APIRoute = async () => {
  const posts = await getCollection("blog", ({ data }) => !data.draft);
  const urls: string[] = [];

  /** One <url> per language the page exists in; alternates only when it exists in both. */
  const add = (enPath: string, meta: string) => {
    const { en, sv } = hreflangUrls(enPath);
    if (!en || !sv) {
      for (const loc of [en, sv]) {
        if (loc) urls.push(`  <url>\n    <loc>${loc}</loc>\n${meta}\n  </url>`);
      }
      return;
    }
    const alts = [
      `    <xhtml:link rel="alternate" hreflang="en" href="${en}"/>`,
      `    <xhtml:link rel="alternate" hreflang="sv" href="${sv}"/>`,
      `    <xhtml:link rel="alternate" hreflang="x-default" href="${en}"/>`,
    ].join("\n");
    for (const loc of [en, sv]) {
      urls.push(`  <url>\n    <loc>${loc}</loc>\n${alts}\n${meta}\n  </url>`);
    }
  };

  for (const p of STATIC) {
    add(p.path, `    <changefreq>${p.changefreq}</changefreq>\n    <priority>${p.priority}</priority>`);
  }

  for (const post of posts) {
    const lastmod = post.data.pubDate.toISOString().slice(0, 10);
    add(
      `/blog/${post.id}`,
      `    <lastmod>${lastmod}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>`,
    );
  }

  // Every tag hub in either language; hreflangUrls() decides which of its URLs exist.
  for (const slug of new Set([...TAG_HUB_SLUGS.en, ...TAG_HUB_SLUGS.sv])) {
    add(`/blog/tag/${slug}`, `    <changefreq>weekly</changefreq>\n    <priority>0.5</priority>`);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join("\n")}\n</urlset>\n`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml" },
  });
};
