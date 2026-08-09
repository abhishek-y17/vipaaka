import type { MetadataRoute } from "next";

import { nav } from "@/content/nav";
import { SITE_URL } from "@/lib/seo";

/**
 * Derived from `content/nav.ts` rather than listed again here. The nav is
 * already the definition of "every page on this site" (CLAUDE.md §2 rule 7
 * forbids adding routes without touching it), so a second hand-maintained
 * list would only ever be the one that goes stale.
 *
 * `/foundation` and `/kitchen-sink` are deliberately absent — they are not in
 * the nav, and they are build-time scaffolding rather than pages anyone
 * should land on from a search result. `robots.ts` disallows them too.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return nav.map((item) => ({
    url: `${SITE_URL}${item.href === "/" ? "" : item.href}`,
    lastModified: now,
    changeFrequency: "weekly",
    // Home leads; the film itself is the destination that matters most after
    // it, which is also the one being linked to from social.
    priority: item.href === "/" ? 1 : item.href === "/film" ? 0.9 : 0.7,
  }));
}
