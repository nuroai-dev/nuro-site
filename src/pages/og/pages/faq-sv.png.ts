/**
 * Open Graph card for the faq-sv FAQ hub. Prerendered to a single static 1200x630
 * PNG at build time, mirroring /og/pages/glossary.png.
 */
import type { APIRoute } from "astro";
import { renderOgImage } from "@/lib/og-image";

export const prerender = true;

export const GET: APIRoute = async () => {
  const png = await renderOgImage("Frågorna föräldrar och skolor faktiskt ställer");
  return new Response(png as BodyInit, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
};
