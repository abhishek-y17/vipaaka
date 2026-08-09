import type { Metadata } from "next";

import { film } from "@/content/film";
import { stills } from "@/content/stills";

/**
 * One place that knows what this site is called, where it lives, and which
 * image represents each page in a link preview.
 *
 * `NEXT_PUBLIC_SITE_URL` is read at build time and falls back to the Vercel
 * system variable, so a preview deploy advertises itself rather than
 * production. Absolute URLs matter here in a way they do not elsewhere:
 * scrapers do not resolve relative paths, and a relative `og:image` is simply
 * no image.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "https://vipaka-film.vercel.app")
).replace(/\/$/, "");

export const SITE_NAME = `${film.title} — ${film.subtitle}`;

/**
 * Default share card: the composed key art, title and epigraph baked in.
 *
 * That baked-in text is precisely why this file is wrong as a hero backdrop
 * (CLAUDE.md §6a) and right as an OG image — a link preview is a thumbnail
 * with no type of its own, so art that carries its own title is the only kind
 * that reads at 300px wide in a chat window.
 *
 * JPEG, not the AVIF/WebP the site serves: Slack, WhatsApp, iMessage and
 * several crawlers still do not reliably decode either, and an OG image that
 * fails to decode is indistinguishable from one that was never set.
 */
export const OG_DEFAULT = {
  url: `${SITE_URL}/vipaka-banner-og.jpg`,
  width: 1200,
  height: 630,
  alt: `${SITE_NAME} — a ${film.studio} film`,
} as const;

const absolute = (src: string) => `${SITE_URL}${src}`;

/** Per-route share images. Anything not listed falls back to the key art. */
export const OG_IMAGES = {
  about: {
    url: absolute(stills.restaurant.src),
    width: stills.restaurant.width,
    height: stills.restaurant.height,
    alt: stills.restaurant.alt,
  },
  film: {
    url: absolute(stills.poster.src),
    width: stills.poster.width,
    height: stills.poster.height,
    alt: stills.poster.alt,
  },
} as const;

type PageMetaInput = {
  title: string;
  description: string;
  path: string;
  image?: { url: string; width: number; height: number; alt: string };
};

/**
 * Route metadata. Every page gets a canonical URL and an explicit OG image —
 * omitting either is how two routes end up competing for the same search
 * result, or sharing a preview that belongs to a different page.
 */
export function pageMetadata({
  title,
  description,
  path,
  image = OG_DEFAULT,
}: PageMetaInput): Metadata {
  const url = `${SITE_URL}${path}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title: `${title} · ${film.title}`,
      description,
      url,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} · ${film.title}`,
      description,
      images: [image.url],
    },
  };
}

/**
 * Movie JSON-LD for the site root.
 *
 * `dateCreated` rather than a rating or a trailer object: schema.org's
 * `aggregateRating` requires real counts, and the review table is empty until
 * release. Inventing one is the kind of structured data that gets a site
 * penalised rather than featured.
 */
export function movieJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Movie",
    name: SITE_NAME,
    alternateName: film.title,
    description: film.logline,
    url: SITE_URL,
    image: OG_DEFAULT.url,
    datePublished: film.releaseDate,
    inLanguage: film.language === "TBC" ? undefined : film.language,
    genre: film.genre,
    productionCompany: {
      "@type": "Organization",
      name: film.studio,
      url: SITE_URL,
    },
  };
}
