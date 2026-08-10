import Image from "next/image";

import { datadorks } from "@/content/brand";
import { film } from "@/content/film";
import { cn } from "@/lib/utils";

/**
 * The studio lockup, top-left of the nav on every page: the Datadorks mark,
 * then the DATADORKS wordmark.
 *
 * ── Tone ────────────────────────────────────────────────────────────────────
 * Defaults to the **mono** (white) mark. The full-colour version is cyan, and
 * in a black-and-gold palette that is the most saturated thing on screen —
 * sitting top-left of every page, it would pull focus off the film. See the
 * note in `content/brand.ts`. `tone="full"` exists for contexts where
 * Datadorks itself is the subject; nothing in the site chrome qualifies.
 *
 * ── The accessible name is exactly "DATADORKS — home" ───────────────────────
 * One source, and one only: the `sr-only` span. Everything visible is removed
 * from the name computation — the mark via `alt=""` plus `aria-hidden`, the
 * wordmark via `aria-hidden`.
 *
 * This is load-bearing and has regressed once already. The accessible name is
 * built from the *whole subtree's* text content, so any visible copy that is
 * not explicitly hidden gets concatenated in. The deployed nav link computed
 * as "DATADORKSDATADORKS — home" for exactly that reason. `alt=""` alone is
 * not enough on the image if the wordmark is left exposed, and hiding the
 * wordmark alone is not enough if the image carries alt text — both have to
 * be silent, or the name grows a duplicate.
 */

export type DatadorksMarkProps = {
  className?: string;
  /** Hide the wordmark and show the mark alone. */
  monogramOnly?: boolean;
  /** `mono` (default) is the white knockout. `full` is the cyan original. */
  tone?: "mono" | "full";
};

export function DatadorksMark({
  className,
  monogramOnly = false,
  tone = "mono",
}: DatadorksMarkProps) {
  const mark = tone === "full" ? datadorks.full : datadorks.mono;

  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      {/* Decorative: the sr-only span below is the single source of the
          accessible name. Empty alt AND aria-hidden — see the note above on
          why one without the other is not sufficient. */}
      <Image
        src={mark.src}
        alt=""
        aria-hidden="true"
        width={32}
        height={32}
        sizes="32px"
        className="size-8 shrink-0 object-contain"
      />
      {monogramOnly ? null : (
        <span
          aria-hidden="true"
          className="text-hi text-[0.9375rem] leading-none font-semibold tracking-[0.14em]"
        >
          {film.studio}
        </span>
      )}
      <span className="sr-only">{film.studio} — home</span>
    </span>
  );
}

export default DatadorksMark;
