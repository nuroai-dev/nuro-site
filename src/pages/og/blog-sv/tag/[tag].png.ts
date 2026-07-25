/**
 * Open Graph card per Swedish tag hub (/sv/blog/tag/<slug>). Swedish
 * counterpart of /og/blog/tag/<slug>.png.
 */
import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { renderOgImage } from "@/lib/og-image";
import { buildTagIndex } from "@/lib/blog-tags";

export const prerender = true;

export async function getStaticPaths() {
  const posts = await getCollection("blogSv", ({ data }) => !data.draft);
  return buildTagIndex(posts).map((group) => ({
    params: { tag: group.slug },
    props: { label: group.label },
  }));
}

export const GET: APIRoute = async ({ props }) => {
  const png = await renderOgImage(`Inlägg taggade ${(props as { label: string }).label}`);
  return new Response(png as BodyInit, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
};
