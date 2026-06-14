import { defineConfig } from "astro/config";
import node from "@astrojs/node";
import tailwindcss from "@tailwindcss/vite";

// Server-rendered output on the standalone Node adapter (deploy contract in
// gate.json). The built server reads HOST / PORT from the environment, which
// is how gate's container runs it: node ./dist/server/entry.mjs.
export default defineConfig({
  output: "server",
  adapter: node({ mode: "standalone" }),
  site: "https://nuroai.dev",
  vite: {
    plugins: [tailwindcss()],
  },
});
