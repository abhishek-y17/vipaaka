import type { MetadataRoute } from "next";

import { film } from "@/content/film";
import { SITE_NAME } from "@/lib/seo";

/**
 * Installed-app identity. The badge is the mark here, at every size — a black
 * disc that survives being drawn at 32px on a home screen. The wordmark is a
 * logotype and never a small mark (CLAUDE.md §6a).
 *
 * `background_color` is `--void`, matching the page floor, so the splash
 * screen does not flash white before the site paints.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: film.title,
    description: film.logline,
    start_url: "/",
    display: "standalone",
    background_color: "#030304",
    theme_color: "#030304",
    icons: [
      { src: "/vipaka-badge-192.png", sizes: "192x192", type: "image/png" },
      { src: "/vipaka-badge-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/vipaka-badge-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
