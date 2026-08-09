import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/seo";

/**
 * `/foundation` and `/kitchen-sink` are development scaffolding that ships in
 * the bundle. They are harmless but they are not the film, and a token-dump
 * page outranking a synopsis for "vipaka" would be a genuinely bad outcome.
 * `/api/` is disallowed for the same reason nothing should crawl a keepalive
 * endpoint.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/foundation", "/kitchen-sink"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
