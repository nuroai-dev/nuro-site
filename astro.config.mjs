import { defineConfig } from "astro/config";
import node from "@astrojs/node";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

// Server-rendered output on the standalone Node adapter (deploy contract in
// gate.json). The built server reads HOST / PORT from the environment, which
// is how Gate starts it through the checked npm start entry point.
export default defineConfig({
  // Keep existing inline spacing when moving from Astro 5 to the new compiler.
  compressHTML: true,
  devToolbar: { enabled: false },
  output: "server",
  adapter: node({ mode: "standalone" }),
  redirects: {
    "/blog/swedens-school-support-reform-2028":
      "/blog/sweden-proposes-rewriting-school-support-law",
    "/sv/blog/swedens-school-support-reform-2028":
      "/sv/blog/sweden-proposes-rewriting-school-support-law",
  },
  site: "https://nuroai.dev",
  // Bilingual: English at the root (/), Swedish under /sv/. No auto-redirect —
  // a language switcher in the nav/footer is the only way between them.
  i18n: {
    locales: ["en", "sv"],
    defaultLocale: "en",
    routing: { prefixDefaultLocale: false },
  },
  // React islands power the interactive Nuro character, signup flow, logo and contact drawer.
  // Editorial pages stay prerendered Astro; the existing Node/API deployment stays unchanged.
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
});
