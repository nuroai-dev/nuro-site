import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { hasSv } from "@/i18n/ui";
import { buildTagIndex } from "@/lib/blog-tags";

/**
 * Dynamic sitemap. Static pages + every published blog post, and for pages
 * that exist in Swedish both the English and /sv URLs are listed with
 * xhtml:link hreflang alternates, so Google serves the right language.
 * Whether a page has a Swedish version comes from the shared hasSv() helper
 * (static pages via TRANSLATED_PATHS, blog posts via their bilingual shape),
 * so the sitemap stays in sync with the in-page hreflang. Grows automatically
 * as posts are added. Prerendered to /sitemap.xml (robots.txt points here).
 */
export const prerender = true;

const SITE = "https://nuroai.dev";

const STATIC: { path: string; changefreq: string; priority: string }[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/about/", changefreq: "monthly", priority: "0.8" },
  { path: "/team/", changefreq: "monthly", priority: "0.6" },
  { path: "/blog/", changefreq: "weekly", priority: "0.8" },
  { path: "/blog/tags/", changefreq: "weekly", priority: "0.5" },
  { path: "/press/", changefreq: "monthly", priority: "0.6" },
  { path: "/career/", changefreq: "monthly", priority: "0.6" },
  { path: "/privacy/", changefreq: "yearly", priority: "0.3" },
  { path: "/terms/", changefreq: "yearly", priority: "0.3" },
];

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
    const translated = hasSv(p.path);
    const enHref = `${SITE}${p.path}`;
    const meta = `    <changefreq>${p.changefreq}</changefreq>\n    <priority>${p.priority}</priority>`;
    if (translated) {
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
    const lastmod = post.data.pubDate.toISOString().slice(0, 10);
    const meta = `    <lastmod>${lastmod}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>`;
    const enHref = `${SITE}/blog/${post.id}/`;
    // Every post ships bilingually, so it gets both URLs + hreflang alternates.
    const translated = hasSv(`/blog/${post.id}`);
    if (translated) {
      const svHref = `${SITE}/sv/blog/${post.id}/`;
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

  // Topic-hub tag pages. A tag that qualifies (2+ posts) in both languages gets
  // both URLs with hreflang alternates; an EN-only tag gets just the EN loc.
  const svTagSlugs = new Set(
    buildTagIndex(await getCollection("blogSv", ({ data }) => !data.draft)).map(
      (g) => g.slug,
    ),
  );
  const enTags = buildTagIndex(posts);
  for (const { slug } of enTags) {
    const meta = `    <changefreq>weekly</changefreq>\n    <priority>0.5</priority>`;
    const enHref = `${SITE}/blog/tag/${slug}/`;
    if (svTagSlugs.has(slug)) {
      const svHref = `${SITE}/sv/blog/tag/${slug}/`;
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

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join("\n")}\n</urlset>\n`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml" },
  });
};
