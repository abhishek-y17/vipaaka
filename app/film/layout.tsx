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
 * Regenerate every 15 minutes so the prerendered HTML catches up with the
 * release on its own. The page also corrects itself on the client, so nobody
 * ever sees a stale lock — this is what stops the SERVED markup being wrong
 * for search engines and no-JS readers in the window after midnight.
 */
export const revalidate = 900;

export const metadata: Metadata = pageMetadata({
  title: "Film",
  description: `Watch ${film.title} — ${film.subtitle}. Releasing ${film.releaseDateDisplay}. A ${film.studio} film.`,
  path: "/film",
  image: OG_IMAGES.film,
});

export default function FilmLayout({ children }: { children: React.ReactNode }) {
  return children;
}
