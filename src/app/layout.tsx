import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

/* Headline trial 2026-06-12: IBM Plex Sans replaces Inter Tight for display.
   Plex caps at weight 700 — 800 usages render at 700. */
const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-plex-sans",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-jetbrains",
});

const SITE_URL = "https://nuroai.dev";
const TITLE = "Nuro — Inclusive Education for Swedish Schools";
const DESCRIPTION =
  "Nuro helps Swedish schools support neurodiverse students with ADHD, Autism, and Dyslexia. AI-powered lesson adaptation that meets Skollagen requirements.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Nuro",
    title: TITLE,
    description: DESCRIPTION,
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Nuro — The missing tool for neurodivergent students.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/og.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${ibmPlexSans.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        {/* Runs before paint: marks JS as available so the reveal motion (N-02)
            can gate its hidden initial state on [data-js]. No-JS users never
            see the hidden state — content stays sharp and visible. */}
        <script
          dangerouslySetInnerHTML={{
            __html: "document.documentElement.dataset.js='1'",
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
