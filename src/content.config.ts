import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

// One Markdown file per post; `draft: true` keeps it out of the index and routes.
// A hero image needs its alt text and pixel size, so the page never ships one blind or shifting.
const blogSchema = z
  .object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    author: z.string().default("The Nuro team"),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    heroImage: z.string().optional(),
    heroImageAlt: z.string().min(1).optional(),
    heroImageWidth: z.number().int().positive().optional(),
    heroImageHeight: z.number().int().positive().optional(),
  })
  .refine(
    (d) => !d.heroImage || (d.heroImageAlt && d.heroImageWidth && d.heroImageHeight),
    { message: "heroImage needs heroImageAlt, heroImageWidth and heroImageHeight" },
  );

const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: blogSchema,
});

// Swedish bodies at /sv/blog/<slug>, same slugs and schema as `blog`.
const blogSv = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog-sv" }),
  schema: blogSchema,
});

export const collections = { blog, blogSv };
