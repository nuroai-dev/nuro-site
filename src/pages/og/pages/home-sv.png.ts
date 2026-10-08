import type { APIRoute } from "astro";
import { renderOgImage } from "@/lib/og-image";

export const prerender = true;

// Swedish default share card for every /sv page without its own; wording is the
// approved Swedish hero copy from Hero.astro.
export const GET: APIRoute = async () => {
  const png = await renderOgImage(
    "Hjälp skolor att sluta bryta mot lagen",
    "Det saknade verktyget för neurodivergenta elever.",
  );
  return new Response(png as BodyInit, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
};
