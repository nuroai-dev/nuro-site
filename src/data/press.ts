/**
 * Press coverage — external articles news outlets write about Nuro.
 *
 * To add an item, paste an object below. Everything except `image` is
 * required. `image` is an absolute URL (the article's OG image) or a local
 * `/press/...` path; omit it and the card falls back to a branded panel.
 *
 *   {
 *     outlet: "TechCrunch",
 *     title: "Nuro raises the bar for inclusive edtech",   // TLDR headline
 *     tldr: "One-to-two sentence summary of what the piece says about Nuro.",
 *     date: "2026-06-15",                                  // ISO, sorts newest-first
 *     url: "https://techcrunch.com/...",
 *     image: "https://techcrunch.com/.../og.jpg",          // optional
 *   },
 */

export type PressItem = {
  /** Publication name, e.g. "TechCrunch". */
  outlet: string;
  /** TLDR headline for the card (the article's angle on Nuro). */
  title: string;
  /** Short summary — one or two sentences. */
  tldr: string;
  /** ISO date (YYYY-MM-DD); used for display and newest-first sorting. */
  date: string;
  /** External article URL (opens in a new tab). */
  url: string;
  /** Optional cover image (absolute URL or local /press path). */
  image?: string;
};

/** No coverage yet — paste items here as they come in. */
export const PRESS_ITEMS: PressItem[] = [];
