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
 * for search engines and no-JS readers in the window after release.
 *
 * ⚠ Was briefly `dynamic = "force-dynamic"` around the release instant, to
 * close the 15-minute stale-HTML window against a cold visitor. That made
 * this route a serverless function invoked on every request instead of a
 * prerendered page, and it broke production: Vercel returned a hard 500 (its
 * own generic fallback page, not even a Next error boundary) on every load,
 * confirmed to be specific to this route — every other page on the site
 * stayed up. It was never exercised against real Vercel infrastructure
 * before shipping, only against a local `next start`, which does not
 * reproduce how Vercel invokes a dynamic route.
 *
 * Reverted the moment the release instant passed, since the stale-window
 * problem it existed for no longer applies going forward — a build taken
 * after RELEASE_AT is static content that is already correct. If a future
 * release ever needs that guarantee again, prefer a short numeric
 * `revalidate` (e.g. 60) over `force-dynamic`, and load-test it against a
 * real preview deployment first.
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
