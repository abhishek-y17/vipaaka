import type { Metadata } from "next";

import { film } from "@/content/film";
import { OG_IMAGES, pageMetadata } from "@/lib/seo";

/**
 * `page.tsx` is a client component — it owns the review refresh key — and a
 * client component cannot export `metadata`. A layout is the standard place
 * to put it rather than splitting the page in two to move one constant.
 *
 * The share image is the film poster, the same 1280×720 file the page shows
 * while the release is pending. Its title and date are baked in, which is
 * wrong for a hero and exactly right for a link preview.
 */
/**
 * Rendered per request, not cached.
 *
 * This used to be `revalidate = 900`, which regenerated the prerendered HTML
 * every 15 minutes so it caught up with the release on its own. Around the
 * release itself that window is too wide: a cold visitor could be served up to
 * 15 minutes of stale pre-release markup — poster, countdown, no player, no
 * review form — and only see the real page once hydration corrected it. On
 * release day the served HTML has to be right the first time.
 *
 * The client-side correction in `page.tsx` stays regardless; this only removes
 * the stale-HTML window in front of it. Worth reinstating a cache once the
 * release has settled — the page is static again by then.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMetadata({
  title: "Film",
  description: `Watch ${film.title} — ${film.subtitle}. Releasing ${film.releaseDateDisplay}. A ${film.studio} film.`,
  path: "/film",
  image: OG_IMAGES.film,
});

export default function FilmLayout({ children }: { children: React.ReactNode }) {
  return children;
}
