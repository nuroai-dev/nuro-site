/**
 * Per-post Open Graph image for Swedish blog posts. Same as the English
 * endpoint but over the `blogSv` collection, so the card renders the Swedish
 * title. Prerendered: one static 1200x630 PNG per post at build time.
 */
import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { renderOgImage } from "@/lib/og-image";

export const prerender = true;

export async function getStaticPaths() {
  const posts = await getCollection("blogSv", ({ data }) => !data.draft);
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
