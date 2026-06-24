import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { TRANSLATED_PATHS } from "@/i18n/ui";

/**
 * Dynamic sitemap. Static pages + every published blog post, and for pages
 * that exist in Swedish (TRANSLATED_PATHS) both the English and /sv URLs are
 * listed with xhtml:link hreflang alternates, so Google serves the right
 * language. Grows automatically as pages are translated (single source of
 * truth = TRANSLATED_PATHS). Prerendered to /sitemap.xml (robots.txt points
 * here).
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

/** English key for TRANSLATED_PATHS ("/about/" -> "/about", "/" -> "/"). */
const enKey = (path: string) => (path === "/" ? "/" : path.replace(/\/$/, ""));
/** Swedish equivalent loc ("/" -> "/sv/", "/about/" -> "/sv/about/"). */
const svPath = (path: string) => (path === "/" ? "/sv/" : "/sv" + path);

export const GET: APIRoute = async () => {
  const posts = await getCollection("blog", ({ data }) => !data.draft);

  /** hreflang alternates block shared by a page's en + sv entries. */
  const alts = (enHref: string, svHref: string) =>
    [
      `    <xhtml:link rel="alternate" hreflang="en" href="${enHref}"/>`,
      `    <xhtml:link rel="alternate" hreflang="sv" href="${svHref}"/>`,
      `    <xhtml:link rel="alternate" hreflang="x-default" href="${enHref}"/>`,
    ].join("\n");

  const urls: string[] = [];

  for (const p of STATIC) {
    const hasSv = TRANSLATED_PATHS.has(enKey(p.path));
    const enHref = `${SITE}${p.path}`;
    const meta = `    <changefreq>${p.changefreq}</changefreq>\n    <priority>${p.priority}</priority>`;
    if (hasSv) {
      const svHref = `${SITE}${svPath(p.path)}`;
      urls.push(
        `  <url>\n    <loc>${enHref}</loc>\n${alts(enHref, svHref)}\n${meta}\n  </url>`,
      );
      urls.push(
        `  <url>\n    <loc>${svHref}</loc>\n${alts(enHref, svHref)}\n${meta}\n  </url>`,
      );
    } else {
      urls.push(`  <url>\n    <loc>${enHref}</loc>\n${meta}\n  </url>`);
    }
  }

  for (const post of posts) {
    urls.push(
      `  <url>\n    <loc>${SITE}/blog/${post.id}/</loc>\n    <lastmod>${post.data.pubDate
        .toISOString()
        .slice(0, 10)}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>`,
    );
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join("\n")}\n</urlset>\n`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml" },
  });
};
