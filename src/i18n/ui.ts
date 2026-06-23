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

/** Strip the /sv prefix → the English-equivalent path. */
function toEnglishPath(pathname: string): string {
  const stripped = pathname.replace(/^\/sv(?=\/|$)/, "");
  return stripped === "" ? "/" : stripped;
}

/** The same page in the given language (used by the language switcher). */
export function switchLangPath(pathname: string, lang: Lang): string {
  const en = toEnglishPath(pathname);
  if (lang === "en") return en;
  return en === "/" ? "/sv/" : "/sv" + en;
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
