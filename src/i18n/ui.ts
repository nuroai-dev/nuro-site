// i18n helpers. English lives at the root (/), Swedish under /sv/.
// (astro.config.mjs: locales en/sv, defaultLocale en, prefixDefaultLocale false.)
import { TAG_HUB_SLUGS } from "@/lib/tag-hubs";

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
// version ships; blog posts match by shape below, tag hubs by lib/tag-hubs.ts.
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

/** Does this page exist in the given language? A tag hub only where that language's posts
 *  qualify it (lib/tag-hubs.ts); every other page always exists in English. */
function existsIn(enPath: string, lang: Lang): boolean {
  const tag = /^\/blog\/tag\/([^/]+)$/.exec(enPath);
  if (tag) return TAG_HUB_SLUGS[lang].has(tag[1]);
  return lang === "en" || TRANSLATED_PATHS.has(enPath) || isBlogPost(enPath);
}

/** Does this page have a Swedish version yet? */
export function hasSv(pathname: string): boolean {
  return existsIn(toEnglishPath(pathname), "sv");
}

/** The same page in the given language (used by the language switcher); that language's
 *  home when the page has no twin there. */
export function switchLangPath(pathname: string, lang: Lang): string {
  const en = toEnglishPath(pathname);
  return withLang(existsIn(en, lang) ? en : "/", lang);
}

/** This page's own path in the one form canonical, hreflang and the sitemap share:
 *  no trailing slash, roots "/" and "/sv/". */
export function canonicalPath(pathname: string): string {
  return withLang(toEnglishPath(pathname), langOfPath(pathname));
}

export function canonicalUrl(pathname: string): string {
  return SITE_URL + canonicalPath(pathname);
}

/** hreflang targets for a page; a language is null when the page does not exist in it. */
export function hreflangUrls(pathname: string): { en: string | null; sv: string | null } {
  const en = toEnglishPath(pathname);
  return {
    en: existsIn(en, "en") ? canonicalUrl(withLang(en, "en")) : null,
    sv: existsIn(en, "sv") ? canonicalUrl(withLang(en, "sv")) : null,
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
