import type { Metadata, Viewport } from "next";
import { Cinzel, Bebas_Neue, Montserrat } from "next/font/google";

import { VipakaWordmark } from "@/components/brand/VipakaWordmark";
import { Footer } from "@/components/layout/Footer";
import { Nav } from "@/components/layout/Nav";
import { PageTransition } from "@/components/layout/PageTransition";
import { GrainOverlay } from "@/components/ui/GrainOverlay";
import { Preloader } from "@/components/ui/Preloader";
import { Toaster } from "@/components/ui/sonner";
import { film } from "@/content/film";
import { OG_DEFAULT, SITE_NAME, SITE_URL, movieJsonLd } from "@/lib/seo";

import "./globals.css";

/* ---------------------------------------------------------------------------
   Fonts. Loaded through next/font/google so they are self-hosted, preloaded
   and subsetted at build time — no render-blocking @import, no layout shift.
   Each exposes a CSS variable consumed by --font-display / --font-eyebrow /
   --font-body in globals.css.
   ------------------------------------------------------------------------ */

/** Cinzel is variable (400–900); omitting `weight` keeps the variable axis. */
const cinzel = Cinzel({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-cinzel",
});

/** Bebas Neue ships a single static weight, so 400 must be named explicitly. */
const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  display: "swap",
  weight: "400",
  variable: "--font-bebas",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s · ${film.title}`,
  },
  description: film.logline,
  applicationName: film.title,
  authors: [{ name: film.studio }],
  creator: film.studio,
  publisher: film.studio,
  alternates: { canonical: "/" },
  keywords: [film.title, film.subtitle, film.studio, "short film", film.genre],
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: film.logline,
    url: SITE_URL,
    images: [OG_DEFAULT],
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: film.logline,
    images: [OG_DEFAULT.url],
  },
  // The badge is the small mark — a black disc that stays legible at 32px.
  // The wordmark is not a favicon and never becomes one (CLAUDE.md §6a).
  icons: {
    icon: [
      { url: "/vipaka-badge-32.png", sizes: "32x32", type: "image/png" },
      { url: "/vipaka-badge-192.png", sizes: "192x192", type: "image/png" },
      { url: "/vipaka-badge-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/vipaka-badge-180.png", sizes: "180x180", type: "image/png" }],
    shortcut: ["/vipaka-badge-32.png"],
  },
  manifest: "/manifest.webmanifest",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export const viewport: Viewport = {
  themeColor: "#030304",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      // `dark` is permanent — the site has no light theme. It exists so shadcn
      // primitives resolve their dark branch.
      className={`dark ${cinzel.variable} ${bebasNeue.variable} ${montserrat.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-void text-mid font-body antialiased">
        {/*
          Framer Motion server-renders entrance states as inline `opacity: 0`.
          Without JS those never resolve and the page is blank, so every
          animated primitive carries `data-reveal` and this puts it back.
        */}
        <noscript>
          <style>{`[data-reveal]{opacity:1!important;transform:none!important}`}</style>
        </noscript>

        {/* Movie structured data. In the body rather than <head> because Next
            hoists neither — and Google reads JSON-LD from either. No
            `aggregateRating`: it needs real counts, the review table is empty
            until release, and fabricated structured data is penalised rather
            than featured. */}
        <script
          type="application/ld+json"
          // Serialised from a typed object, never interpolated from user
          // input — nothing here crosses a trust boundary.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(movieJsonLd()) }}
        />

        <Preloader mark={<VipakaWordmark className="w-[240px] sm:w-[320px]" />} />

        <Nav />

        {/*
          The nav is fixed and reserves no space, because the Landing hero
          (Phase 3) runs full-bleed underneath its transparent state. Every
          other page needs the offset, so it lives on that page's own root
          element rather than here — see the stub pages for the pattern.
        */}
        <PageTransition>{children}</PageTransition>

        <Footer />

        <GrainOverlay />

        <Toaster />
      </body>
    </html>
  );
}
