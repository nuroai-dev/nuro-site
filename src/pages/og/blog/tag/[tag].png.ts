/**
 * Open Graph card per English tag hub (/blog/tag/<slug>). One static 1200x630
 * PNG is prerendered for every tag that buildTagIndex publishes, so a shared
 * topic hub previews with its own topic name instead of the generic og.png.
 */
import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { renderOgImage } from "@/lib/og-image";
import { buildTagIndex } from "@/lib/blog-tags";

export const prerender = true;

export async function getStaticPaths() {
  const posts = await getCollection("blog", ({ data }) => !data.draft);
  return buildTagIndex(posts).map((group) => ({
    params: { tag: group.slug },
    props: { label: group.label },
  }));
}

export const GET: APIRoute = async ({ props }) => {
  const png = await renderOgImage(`Posts tagged ${(props as { label: string }).label}`);
  return new Response(png as BodyInit, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
};
