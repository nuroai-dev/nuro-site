/**
 * Open Graph card for the English blog index (/blog). Prerendered to a single
 * static 1200x630 PNG at build time, mirroring the per-post cards under
 * /og/blog. Gives the most-shared non-post page its own branded social preview
 * instead of falling back to the generic homepage og.png.
 */
import type { APIRoute } from "astro";
import { renderOgImage } from "@/lib/og-image";

export const prerender = true;

export const GET: APIRoute = async () => {
  const png = await renderOgImage("Notes on inclusive education");
  return new Response(png as BodyInit, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
};
