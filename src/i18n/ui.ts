/**
 * i18n helpers. English lives at the root (/), Swedish under /sv/.
 * (astro.config.mjs: locales en/sv, defaultLocale en, prefixDefaultLocale false.)
 */
export type Lang = "en" | "sv";

export const LANGUAGES: { code: Lang; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "sv", label: "SV" },
];

/** Active language from a URL (Swedish iff the path is /sv or /sv/...). */
export function getLang(url: URL): Lang {
  return url.pathname === "/sv" || url.pathname.startsWith("/sv/")
    ? "sv"
    : "en";
}

/** Strip the /sv prefix and any trailing slash → the English-equivalent path
 *  in the same form TRANSLATED_PATHS uses (Astro's pathname has a trailing
 *  slash, e.g. "/about/", so normalize before comparing). */
function toEnglishPath(pathname: string): string {
  let p = pathname.replace(/^\/sv(?=\/|$)/, "");
  if (p === "") p = "/";
  if (p.length > 1 && p.endsWith("/")) p = p.slice(0, -1);
  return p;
}

/**
 * English static pages that already have a Swedish (/sv) translation. Add a
 * path here when its /sv version ships, and the switcher + hreflang light up
 * for it automatically. Blog posts are NOT listed here; they are handled by
 * isBlogPost() below, because every post ships bilingually.
 */
export const TRANSLATED_PATHS = new Set<string>([
  "/",
  "/about",
  "/team",
  "/press",
  "/career",
  "/privacy",
  "/terms",
  "/blog",
  "/blog/tags",
  "/glossary",
]);

/**
 * Every blog post ships bilingually: an English body in src/content/blog and a
 * matching Swedish body in src/content/blog-sv (→ /sv/blog/<slug>). So any
 * /blog/<slug> path always has a Swedish counterpart. Matching by shape keeps
 * the switcher and hreflang correct automatically as posts are added, with no
 * per-post maintenance. (The /blog index itself is a static path above, not a
 * post, so it is intentionally excluded here.)
 */
function isBlogPost(enPath: string): boolean {
  return /^\/blog\/[^/]+$/.test(enPath);
}

/**
 * Individual tag hubs (/blog/tag/<slug>) ship bilingually via the mirrored
 * sv/blog/tag/[tag].astro route, exactly like blog posts. Matching by shape
 * lights up the switcher + hreflang for every tag hub automatically, so a
 * translated tag pair is never left uncross-referenced. (The /blog/tags index
 * is a static path in TRANSLATED_PATHS above, not matched here.)
 */
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
  const en = toEnglishPath(pathname);
  if (lang === "en") return en; // every page exists in English
  if (en === "/") return "/sv/";
  return TRANSLATED_PATHS.has(en) || isBlogPost(en) || isTagPage(en)
    ? "/sv" + en
    : "/sv/";
}

/**
 * Localize an internal link for the active language. English → unchanged.
 * Swedish → prefixed with /sv. Handles "/" , "/about", root anchors "/#x",
 * and leaves bare anchors ("#contact") and external/mailto/tel links alone.
 */
export function localizePath(path: string, lang: Lang): string {
  if (lang === "en") return path;
  if (/^(https?:|mailto:|tel:|#)/.test(path)) return path;
  if (path === "/") return "/sv/";
  if (path.startsWith("/#")) return "/sv/" + path.slice(1);
  return "/sv" + path;
}
