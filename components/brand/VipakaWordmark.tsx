import { readFileSync } from "node:fs";
import { join } from "node:path";

import { wordmarkVector } from "@/content/brand";
import { cn } from "@/lib/utils";

/**
 * The film title, inlined.
 *
 * **A server component, deliberately.** The SVG is read from disk once at
 * module scope, which on a statically rendered route happens at build time —
 * the browser receives plain markup and makes no extra request for it.
 *
 * It is inlined rather than served through `<img>` because CSS custom
 * properties do not cross into an image document: `--wordmark-face` and
 * `--wordmark-shadow` would resolve to their baked-in fallbacks and the token
 * wiring would be inert. Since those fallbacks currently equal the tokens,
 * that failure would be invisible until the day someone changed the palette.
 *
 * ~38.5KB of path data, ~9.5KB over the wire once Brotli has had it — cheaper
 * than a round trip, and it sits in the hero's LCP path (Phase 3) where that
 * request would otherwise be one more thing between paint and "done".
 *
 * If the wordmark ever needs to appear twice on one page, switch to a single
 * `<symbol>` in `<defs>` plus `<use>` rather than paying for the paths twice.
 */

const SVG = readFileSync(
  join(process.cwd(), "public", "vipaka-wordmark.svg"),
  "utf8",
).trim();

export type VipakaWordmarkProps = {
  /**
   * Any CSS width. The aspect ratio is pinned from the viewBox so this never
   * causes layout shift.
   */
  width?: string | number;
  className?: string;
};

export function VipakaWordmark({ width, className }: VipakaWordmarkProps) {
  return (
    <span
      // The inlined <svg> carries role="img" and its own <title>, so the
      // wrapper stays out of the accessibility tree.
      className={cn(
        "block [&>svg]:block [&>svg]:h-auto [&>svg]:w-full",
        className,
      )}
      style={{
        width,
        aspectRatio: `${wordmarkVector.viewBoxWidth} / ${wordmarkVector.viewBoxHeight}`,
      }}
      dangerouslySetInnerHTML={{ __html: SVG }}
    />
  );
}

export default VipakaWordmark;
