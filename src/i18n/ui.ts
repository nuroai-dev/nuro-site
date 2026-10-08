// i18n helpers. English lives at the root (/), Swedish under /sv/.
// (astro.config.mjs: locales en/sv, defaultLocale en, prefixDefaultLocale false.)
export type Lang = "en" | "sv";

export const SITE_URL = "https://nuroai.dev";

export const LANGUAGES: { code: Lang; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "sv", label: "SV" },
];

function langOfPath(pathname: string): Lang {
  return pathname === "/sv" || pathname.startsWith("/sv/") ? "sv" : "en";
}

/** Active language from a URL (Swedish iff the path is /sv or /sv/...). */
export function getLang(url: URL): Lang {
  return langOfPath(url.pathname);
}

/** Strip the /sv prefix and any trailing slash → the English-equivalent path
 *  in the same form TRANSLATED_PATHS uses ("/about/" at prerender → "/about"). */
function toEnglishPath(pathname: string): string {
  let p = pathname.replace(/^\/sv(?=\/|$)/, "");
  if (p === "") p = "/";
  if (p.length > 1 && p.endsWith("/")) p = p.slice(0, -1);
  return p;
}

/** An English path in the given language: "/" → "/sv/", "/about" → "/sv/about". */
function withLang(en: string, lang: Lang): string {
  if (lang === "en") return en;
  return en === "/" ? "/sv/" : "/sv" + en;
}

// English static pages that already have a Swedish (/sv) translation. Add a path when its /sv
// version ships; blog posts and tag hubs match by shape below.
export const TRANSLATED_PATHS = new Set<string>([
  "/",
  "/about",
  "/team",
  "/press",
  "/faq",
  "/career",
  "/privacy",
  "/terms",
  "/blog",
  "/blog/tags",
  "/glossary",
]);

// Every post ships bilingually (src/content/blog + blog-sv), so /blog/<slug> always has an /sv twin.
function isBlogPost(enPath: string): boolean {
  return /^\/blog\/[^/]+$/.test(enPath);
}

// Tag hubs are mirrored by sv/blog/tag/[tag].astro, so /blog/tag/<slug> always has an /sv twin.
function isTagPage(enPath: string): boolean {
  return /^\/blog\/tag\/[^/]+$/.test(enPath);
}

/** Does this page have a Swedish version yet? */
export function hasSv(pathname: string): boolean {
  const en = toEnglishPath(pathname);
  return TRANSLATED_PATHS.has(en) || isBlogPost(en) || isTagPage(en);
}

/** The same page in the given language (used by the language switcher). */
export function switchLangPath(pathname: string, lang: Lang): string {
  return lang === "en" || hasSv(pathname)
    ? withLang(toEnglishPath(pathname), lang)
    : "/sv/";
}

/** This page's own path in the one form canonical, hreflang and the sitemap share:
 *  no trailing slash, roots "/" and "/sv/". */
export function canonicalPath(pathname: string): string {
  return withLang(toEnglishPath(pathname), langOfPath(pathname));
}

export function canonicalUrl(pathname: string): string {
  return SITE_URL + canonicalPath(pathname);
}

/** hreflang targets for a page; sv is null when the page has no Swedish twin. */
export function hreflangUrls(pathname: string): { en: string; sv: string | null } {
  return {
    en: canonicalUrl(switchLangPath(pathname, "en")),
    sv: hasSv(pathname) ? canonicalUrl(switchLangPath(pathname, "sv")) : null,
  };
}

/** Localize an internal link: English unchanged, Swedish prefixed with /sv;
 *  bare anchors and external links are left alone. */
export function localizePath(path: string, lang: Lang): string {
  if (lang === "en") return path;
  if (/^(https?:|mailto:|tel:|#)/.test(path)) return path;
  if (path === "/") return "/sv/";
  if (path.startsWith("/#")) return "/sv/" + path.slice(1);
  return "/sv" + path;
}
