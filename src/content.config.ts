import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

/**
 * Blog collection — one Markdown file per post in src/content/blog/.
 * Adding a post = dropping a new `.md` with this frontmatter. `draft: true`
 * keeps a post out of the index and out of the build's routes.
 */
const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    author: z.string().default("The Nuro team"),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
