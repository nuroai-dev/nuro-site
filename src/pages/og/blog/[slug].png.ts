/**
 * Per-post Open Graph image for English blog posts. Prerendered: one static
 * 1200x630 PNG is emitted per post at build time (mirrors the prerendered
 * blog routes in src/pages/blog/[...slug].astro), so there is no runtime cost.
 * The card renders the post's own title on the Nuro brand template.
 */
import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { renderOgImage } from "@/lib/og-image";

export const prerender = true;

export async function getStaticPaths() {
  const posts = await getCollection("blog", ({ data }) => !data.draft);
  return posts.map((post) => ({
    params: { slug: post.id },
    props: { title: post.data.title },
  }));
}

export const GET: APIRoute = async ({ props }) => {
  const png = await renderOgImage(props.title as string);
  return new Response(png as BodyInit, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
};
