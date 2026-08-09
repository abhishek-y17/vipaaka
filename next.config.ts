import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Ordered most-preferred first.
    formats: ["image/avif", "image/webp"],
    /**
     * Default `deviceSizes` tops out at 3840, and the deployed site was
     * genuinely requesting it — `vipaka-plate.png` at `w=3840` on a
     * 1440px/DPR-2 screen, from a 1983px source.
     *
     * Nothing in `public/` is wider than 1983px (plate and banner; the world
     * art is 1600, the stills 1672, the poster 1280). A 3840 candidate can
     * therefore never be filled — the optimiser caps at the source, so the
     * request returns a smaller image than it asked for. Measured on the
     * deployed site: `film-poster` at w=1920 and w=3840 came back byte-for-
     * byte identical at 27,368 bytes.
     *
     * Removing it costs nothing and buys three things: no pointless
     * over-request, one fewer cache entry per image, and a shorter srcset in
     * every document. Raise the ceiling again if a wider master ever ships.
     */
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    remotePatterns: [
      // YouTube poster frames, used by the player's PosterFrame fallback.
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "img.youtube.com" },
    ],
  },
};

export default nextConfig;
