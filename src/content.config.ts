import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

/**
 * Blog collection — one Markdown file per post in src/content/blog/.
 * Adding a post = dropping a new `.md` with this frontmatter. `draft: true`
 * keeps a post out of the index and out of the build's routes.
 */
const blogSchema = z.object({
  title: z.string(),
  description: z.string(),
  pubDate: z.coerce.date(),
  updatedDate: z.coerce.date().optional(),
  author: z.string().default("The Nuro team"),
  tags: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
  heroImage: z.string().optional(),
});

const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: blogSchema,
});

/**
 * Swedish blog post bodies — one Markdown file per post in
 * src/content/blog-sv/, mirroring the English `blog` slugs. Same schema; the
 * title/description/body are translated. Rendered at /sv/blog/<slug>.
 */
const blogSv = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog-sv" }),
  schema: blogSchema,
});

export const collections = { blog, blogSv };
