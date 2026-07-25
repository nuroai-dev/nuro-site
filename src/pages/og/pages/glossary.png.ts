/**
 * Open Graph card for the English glossary (/glossary). Prerendered to a single
 * static 1200x630 PNG at build time, mirroring /og/pages/blog.png. The glossary
 * is the page school staff are most likely to paste into a chat, so it gets its
 * own branded preview instead of the generic homepage og.png.
 */
import type { APIRoute } from "astro";
import { renderOgImage } from "@/lib/og-image";

export const prerender = true;

export const GET: APIRoute = async () => {
  const png = await renderOgImage("The Swedish school-support system, explained");
  return new Response(png as BodyInit, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
};
