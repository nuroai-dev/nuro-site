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
  /** Short summary, one or two sentences. */
  tldr: string;
  /** Optional Swedish title/summary for /sv/press (falls back to English). */
  titleSv?: string;
  tldrSv?: string;
  /** ISO date (YYYY-MM-DD); used for display and newest-first sorting. */
  date: string;
  /** External article URL (opens in a new tab). */
  url: string;
  /** Optional cover image (absolute URL or local /press path). */
  image?: string;
};

/** Coverage that mentions Nuro. Newest first (the page sorts by `date`). */
export const PRESS_ITEMS: PressItem[] = [
  {
    outlet: "Dagens Industri",
    title: "Nuro among the next wave of Swedish vertical-AI companies",
    tldr: "Dagens Industri looks at the next wave of Swedish AI startups building deep, domain-specific verticals, with Nuro among the companies named.",
    titleSv: "Nuro bland nästa våg av svenska vertikala AI-bolag",
    tldrSv: "Dagens Industri tittar på nästa våg av svenska AI-startups som bygger smala, domänspecifika vertikaler, med Nuro bland de namngivna bolagen.",
    date: "2026-06-18",
    url: "https://www.di.se/digital/har-ar-nasta-vag-av-svenska-ai-bolag-djupa-vertikaler/",
    image: "/press/nuro-team.jpg",
  },
  {
    outlet: "Breakit",
    title: "Nuro joins the new AI cohort at SSE Business Lab",
    tldr: "Breakit covers the new, AI-heavy cohort entering Stockholm School of Economics' incubator SSE Business Lab, with Nuro among the companies.",
    titleSv: "Nuro med i SSE Business Labs nya AI-kull",
    tldrSv: "Breakit skriver om den nya, AI-tunga kullen som tas in på Handelshögskolans inkubator SSE Business Lab, med Nuro bland bolagen.",
    date: "2026-06-18",
    url: "https://www.breakit.se/artikel/46679/ai-ai-och-ai-har-ar-bolagen-som-kommer-in-pa-sse-business-lab",
    image: "/press/nuro-team.jpg",
  },
];
