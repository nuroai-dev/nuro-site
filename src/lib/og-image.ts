/**
 * Shared Open Graph card renderer. Turns a post title into a branded
 * 1200x630 PNG on the Nuro cream/holo template, via satori (JSX-tree to SVG)
 * then resvg (SVG to PNG). Used by the prerendered /og/blog and /og/blog-sv
 * endpoints, so each post ships its own social-preview image at build time.
 *
 * satori needs ttf/otf/woff buffers (NOT woff2), so we load the .woff files
 * @fontsource ships. Fonts are read once at module load and reused.
 */
import { createRequire } from "node:module";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";

const require = createRequire(import.meta.url);

// Brand tokens, mirrored from src/styles/globals.css.
const CREAM = "#faf7f2";
const INK = "#16161c";
const MUTED = "#6b7177";
const HOLO = ["#a7c7ff", "#c9b8ff", "#e8bfe6", "#ffc9e3", "#ffd9c2"];
const HOLO_GRADIENT = `linear-gradient(90deg, ${HOLO.join(", ")})`;

// Load font buffers once. IBM Plex Sans (bold) for the wordmark + title,
// Inter (regular) for the footer line. woff parses fine in satori; woff2 does
// not. The latin subset covers Swedish å/ä/ö.
const plexBold = require("node:fs").readFileSync(
  require.resolve(
    "@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-700-normal.woff",
  ),
);
const interRegular = require("node:fs").readFileSync(
  require.resolve("@fontsource/inter/files/inter-latin-400-normal.woff"),
);

const fonts = [
  { name: "IBM Plex Sans", data: plexBold, weight: 700 as const, style: "normal" as const },
  { name: "Inter", data: interRegular, weight: 400 as const, style: "normal" as const },
];

// Bigger type for short titles, smaller for long ones, so a typical
// 8-to-14-word title fills 3-to-4 lines without overflowing the card.
function titleFontSize(title: string): number {
  const len = title.length;
  if (len <= 40) return 68;
  if (len <= 70) return 56;
  if (len <= 100) return 46;
  return 40;
}

/**
 * Render a branded OG card for `title` and return a PNG as a Uint8Array.
 */
export async function renderOgImage(title: string): Promise<Uint8Array> {
  const tree = {
    type: "div",
    props: {
      style: {
        width: "1200px",
        height: "630px",
        display: "flex",
        flexDirection: "column",
        backgroundColor: CREAM,
        fontFamily: "IBM Plex Sans",
        position: "relative",
      },
      children: [
        // Bold holo accent bar across the top edge.
        {
          type: "div",
          props: {
            style: {
              width: "1200px",
              height: "18px",
              backgroundImage: HOLO_GRADIENT,
            },
          },
        },
        // Padded content column: wordmark up top, title in the middle,
        // footer line at the bottom.
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              flex: 1,
              padding: "70px",
            },
            children: [
              {
                type: "div",
                props: {
                  style: {
                    fontSize: "40px",
                    fontWeight: 700,
                    color: INK,
                    letterSpacing: "-0.5px",
                  },
                  children: "Nuro",
                },
              },
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    fontSize: `${titleFontSize(title)}px`,
                    fontWeight: 700,
                    color: INK,
                    lineHeight: 1.15,
                    letterSpacing: "-1px",
                    maxWidth: "1000px",
                  },
                  children: title,
                },
              },
              {
                type: "div",
                props: {
                  style: {
                    fontFamily: "Inter",
                    fontSize: "26px",
                    color: MUTED,
                  },
                  children: "nuroai.dev",
                },
              },
            ],
          },
        },
      ],
    },
  };

  const svg = await satori(tree as never, { width: 1200, height: 630, fonts });

  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: 1200 },
  });
  return resvg.render().asPng();
}
