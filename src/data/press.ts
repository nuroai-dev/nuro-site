// Press coverage and recognitions; add an object to PRESS_ITEMS, `image` optional.
// A `url` starting with "/" is one of our own pages: localised on /sv, opened in place.

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
  /** External article URL (new tab), or an internal path like "/blog/<slug>". */
  url: string;
  /** Optional cover image (absolute URL or a local path under public/). */
  image?: string;
};

/** Coverage that mentions Nuro. Newest first (the page sorts by `date`). */
export const PRESS_ITEMS: PressItem[] = [
  {
    outlet: "Founders 50",
    title: "Sandra Hilltomt named to Founders 50 2026",
    tldr: "Nuro's founder is one of the 50 founders on the first Founders 50, a Nordic list built on peer nominations where nobody can nominate themselves.",
    titleSv: "Sandra Hilltomt med på Founders 50 2026",
    tldrSv: "Nuros grundare är en av de 50 grundarna på första Founders 50, en nordisk lista som bygger på nomineringar från andra, där ingen får nominera sig själv.",
    date: "2026-08-24",
    url: "/blog/sandra-hilltomt-founders-50-2026",
    image: "/blog/founders-50-sandra-hilltomt.webp",
  },
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
