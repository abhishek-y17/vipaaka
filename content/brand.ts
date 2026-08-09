/**
 * Brand asset registry — three marks, three jobs, never substituted for one
 * another (CLAUDE.md §6a).
 *
 * Components import from here rather than writing `/vipaka-badge.png` inline.
 * That is the whole point: a raw string in a component is how the badge ends
 * up as a hero title. Every raster entry carries its intrinsic size so
 * `next/image` always has width/height and CLS stays at zero.
 */

export type BrandAsset = {
  src: string;
  width: number;
  height: number;
  alt: string;
  /** Tiny base64 JPEG for `placeholder="blur"`. Only set where next/image needs it. */
  blurDataURL?: string;
};

/* -------------------------------------------------------------------------- */
/*  The film title                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Vector wordmark — the primary. Two paths, fills driven by `--wordmark-face`
 * and `--wordmark-shadow` (see globals.css), with `#F5F3EF` / `#F0B429`
 * baked in as fallbacks.
 *
 * **Render it through `<VipakaWordmark>`, which inlines it.** CSS custom
 * properties do not cross into an SVG loaded via `<img>` or `next/image` — the
 * document is isolated, so the fills would silently freeze at their fallbacks
 * and the tokens would be decorative. It happens that the fallbacks currently
 * equal the tokens, which is exactly what would make that bug invisible.
 *
 * No width ceiling: this is the asset the 463px raster cap existed to route
 * around.
 *
 * TODO(brand): still an auto-trace, now a cleaner one — straight edges hold to
 * ~1800px displayed width (was ~1200px), 39KB (was 70KB). Good for the hero at
 * any reasonable viewport. A designer redraw is still owed; this is a better
 * stopgap, not that redraw.
 */
export const wordmarkVector = {
  src: "/vipaka-wordmark.svg",
  /** viewBox is "168 318 468 163" — these are the extents, for aspect-ratio. */
  viewBoxWidth: 468,
  viewBoxHeight: 163,
  alt: "Vipāka",
  /** Above this the auto-trace's edge wobble becomes visible. */
  comfortableMaxWidth: 1800,
} as const;

/**
 * Raster wordmark. Kept as a fallback for contexts that cannot inline SVG.
 *
 * ⚠ Hard ceiling of 463px — that is all the detail the extraction contains.
 * `assertWordmarkWidth()` enforces it in development. The vector above is
 * exempt and is what any wide slot should use.
 */
export const wordmarkRaster: BrandAsset = {
  src: "/vipaka-wordmark.png",
  width: 463,
  height: 159,
  alt: "Vipāka",
};

/** Displayed width beyond which the *raster* wordmark visibly softens. */
export const MAX_WORDMARK_WIDTH = 463;

/**
 * Throws in development if a layout asks the raster wordmark to render wider
 * than the source supports. Silent in production — a soft logo is better than
 * a blank page in front of a visitor.
 *
 * Does not apply to `wordmarkVector`.
 */
export function assertWordmarkWidth(width: number, where: string): void {
  if (process.env.NODE_ENV !== "production" && width > MAX_WORDMARK_WIDTH) {
    throw new Error(
      `[brand] ${where} renders the RASTER wordmark at ${width}px; the source ` +
        `is ${MAX_WORDMARK_WIDTH}px wide. Use <VipakaWordmark>, which renders ` +
        `the vector and has no ceiling. See CLAUDE.md §6a.`,
    );
  }
}

/* -------------------------------------------------------------------------- */
/*  The badge                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Black disc, transparent outside. Favicon, app icons, OG avatar, small footer
 * mark. Never the hero title.
 */
export const badge = {
  full: { src: "/vipaka-badge.png", width: 626, height: 626, alt: "Vipāka" },
  x512: { src: "/vipaka-badge-512.png", width: 512, height: 512, alt: "Vipāka" },
  x192: { src: "/vipaka-badge-192.png", width: 192, height: 192, alt: "Vipāka" },
  x180: { src: "/vipaka-badge-180.png", width: 180, height: 180, alt: "Vipāka" },
  x32: { src: "/vipaka-badge-32.png", width: 32, height: 32, alt: "Vipāka" },
} as const satisfies Record<string, BrandAsset>;

/* -------------------------------------------------------------------------- */
/*  Key art                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * The hero backdrop. Same collage key art as `banner`, with the baked-in
 * title, epigraph and eyebrow removed by masked reconstruction — Phase 3
 * discovered `banner` is a fully composed poster (own wordmark, own subtitle,
 * even its own — and wrong — eyebrow), not a plain backdrop; laying our live
 * type sequence over it double-exposed both. `plate` is what the hero actually
 * renders behind that sequence.
 *
 * TODO(brand): a reconstruction, not an export — there is a faint flattened
 * patch where the wordmark used to sit, roughly centred. It is dark enough,
 * and far enough under the vignette and our own wordmark, to be invisible in
 * practice, but it is a patch, not source pixels. Alongside the wordmark
 * TODO(brand) in this file — resolved by the same ask to Datadorks for clean
 * source layers.
 *
 * `src` points at the master PNG, not a pre-baked `.avif`/`.webp` twin —
 * `next.config.ts` already lists `formats: ["image/avif", "image/webp"]`, so
 * next/image content-negotiates the right format per request straight from
 * this source. Handing it an already-compressed `.avif` instead would mean
 * decoding a lossy file and re-encoding it again for every size/format
 * variant — a second compression pass for no reason. (The old pre-converted
 * files this used to point at are gone; regenerate with `sharp` if a static
 * pair is ever needed outside Next's own pipeline.)
 */
export const plate: BrandAsset = {
  src: "/vipaka-plate.png",
  width: 1983,
  height: 793,
  // Empty, deliberately: this is decorative texture behind the hero's own
  // live text (eyebrow, wordmark, subtitle, date), which already carries the
  // real content as accessible text nodes. A non-empty alt here would have a
  // screen reader announce the same information twice.
  alt: "",
  // 16px-wide JPEG, generated once via sharp(src).resize(16).jpeg({quality:40}).
  // `public/` assets aren't static-imported, so next/image can't derive this
  // automatically the way it does for images imported through the module
  // system — it has to be supplied by hand.
  blurDataURL:
    "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAGABADASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAEG/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/EABQBAQAAAAAAAAAAAAAAAAAAAAD/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwDHqAP/2Q==",
};

/**
 * The composed poster — title, subtitle and epigraph baked in. Wrong for the
 * hero (see `plate`), right for a link preview: OpenGraph / Twitter card only,
 * never rendered in-page. Social scrapers do not reliably decode AVIF or
 * WebP, so cards need JPEG.
 */
export const bannerOg: BrandAsset = {
  src: "/vipaka-banner-og.jpg",
  width: 1200,
  height: 630,
  alt: "Vipāka — Till Understood",
};
