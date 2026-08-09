import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Phase 9 converts every still to AVIF/WebP. Ordered most-preferred first.
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      // YouTube poster frames, used by the player's PosterFrame fallback.
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "img.youtube.com" },
    ],
  },
};

export default nextConfig;
