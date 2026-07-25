/**
 * Open Graph card for the Swedish topic index (/sv/blog/tags).
 */
import type { APIRoute } from "astro";
import { renderOgImage } from "@/lib/og-image";

export const prerender = true;

export const GET: APIRoute = async () => {
  const png = await renderOgImage("Bläddra i bloggen efter ämne");
  return new Response(png as BodyInit, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
};
