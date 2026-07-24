/**
 * Open Graph card for the Swedish blog index (/sv/blog). Prerendered to a
 * single static 1200x630 PNG at build time, the Swedish counterpart of
 * /og/pages/blog.png.
 */
import type { APIRoute } from "astro";
import { renderOgImage } from "@/lib/og-image";

export const prerender = true;

export const GET: APIRoute = async () => {
  const png = await renderOgImage("Tankar om en inkluderande skola");
  return new Response(png as BodyInit, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
};
