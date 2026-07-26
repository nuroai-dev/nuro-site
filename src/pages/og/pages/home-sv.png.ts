import type { APIRoute } from "astro";
import { renderOgImage } from "@/lib/og-image";

export const prerender = true;

/**
 * Swedish default share card, used by every /sv page that does not set its own.
 * Wording is the approved Swedish hero copy from Hero.astro, so the card and
 * the page a visitor lands on say the same thing.
 */
export const GET: APIRoute = async () => {
  const png = await renderOgImage(
    "Hjälp skolor att sluta bryta mot lagen",
    "Det saknade verktyget för neurodivergenta elever.",
  );
  return new Response(png, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
};
