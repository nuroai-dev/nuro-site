import { defineConfig } from "astro/config";
import node from "@astrojs/node";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

// Server-rendered output on the standalone Node adapter (deploy contract in
// gate.json). The built server reads HOST / PORT from the environment, which
// is how gate's container runs it: node ./dist/server/entry.mjs.
export default defineConfig({
  output: "server",
  adapter: node({ mode: "standalone" }),
  site: "https://nuroai.dev",
  // React only powers the contact-drawer island (Vaul). It hydrates on
  // demand (client:visible in the footer) — the rest of the page is static.
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
});
