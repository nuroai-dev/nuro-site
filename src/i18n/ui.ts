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
 * English paths that already have a Swedish (/sv) translation. The site is
 * rolling out bilingually page by page — add a path here when its /sv version
 * ships, and the switcher + hreflang light up for it automatically. Anything
 * not listed falls back to the Swedish home (no broken /sv/<page> links).
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
  // Translated blog post bodies (src/content/blog-sv/<slug>.md → /sv/blog/<slug>).
  "/blog/the-right-exists-the-system-doesnt",
  "/blog/sweden-needs-more-special-education-teachers",
  "/blog/school-absence-starts-earlier",
  "/blog/what-skollagen-requires-extra-anpassningar-sarskilt-stod",
  "/blog/cost-of-school-absence-false-economy",
  "/blog/adhd-in-the-classroom-what-helps",
  "/blog/autism-in-the-classroom-what-helps",
  "/blog/dyslexia-in-the-classroom-what-helps",
  "/blog/parent-guide-child-not-getting-support-at-school",
  "/blog/school-leaders-support-compliance-risk",
  "/blog/what-is-npf-neurodevelopmental-conditions-school",
  "/blog/when-a-child-has-more-than-one-diagnosis-npf-overlap",
  "/blog/support-without-a-diagnosis-school",
  "/blog/swedens-parliament-npf-school-results",
  "/blog/sweden-proposes-rewriting-school-support-law",
  "/blog/sweden-doesnt-count-school-absence",
  "/blog/principals-say-they-lack-resources-for-npf",
  "/blog/what-is-an-accessible-learning-environment",
]);

/** Does this page have a Swedish version yet? */
export function hasSv(pathname: string): boolean {
  return TRANSLATED_PATHS.has(toEnglishPath(pathname));
}

/** The same page in the given language (used by the language switcher). */
export function switchLangPath(pathname: string, lang: Lang): string {
  const en = toEnglishPath(pathname);
  if (lang === "en") return en; // every page exists in English
  if (en === "/") return "/sv/";
  return TRANSLATED_PATHS.has(en) ? "/sv" + en : "/sv/";
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
