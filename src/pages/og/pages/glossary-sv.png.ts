/**
 * Open Graph card for the Swedish glossary (/sv/glossary). Swedish counterpart
 * of /og/pages/glossary.png.
 */
import type { APIRoute } from "astro";
import { renderOgImage } from "@/lib/og-image";

export const prerender = true;

export const GET: APIRoute = async () => {
  const png = await renderOgImage("Skolans stödsystem, förklarat");
  return new Response(png as BodyInit, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
};
