import Image from "next/image";

import { datadorks } from "@/content/brand";
import { film } from "@/content/film";
import { cn } from "@/lib/utils";

/**
 * The studio lockup, top-left of the nav on every page: the Datadorks mark,
 * then the DATADORKS wordmark.
 *
 * ── Tone ────────────────────────────────────────────────────────────────────
 * Defaults to the **gold** mark — `--gold`, never `--gold-bright`. The bright
 * tone belongs to CTAs and active state; a mark that sits in the nav on every
 * page is permanent, and spending the loudest gold on something that never
 * changes is what stops a state colour reading as state.
 *
 * `mono` (white knockout) is the fallback if the gold mark and the gold
 * active-nav underline ever compete in the same bar. `full` is the cyan
 * original — the most saturated thing possible in this palette — and exists
 * only for contexts where Datadorks itself is the subject; nothing in the
 * site chrome qualifies. See `content/brand.ts`.
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
  /**
   * `gold` (default) is `--gold`, never `--gold-bright`. `mono` is the white
   * knockout, kept as the fallback if the gold mark and the gold active-nav
   * underline ever compete. `full` is the cyan original, for contexts where
   * Datadorks itself is the subject.
   */
  tone?: "gold" | "mono" | "full";
};

export function DatadorksMark({
  className,
  monogramOnly = false,
  tone = "gold",
}: DatadorksMarkProps) {
  const mark =
    tone === "full"
      ? datadorks.full
      : tone === "mono"
        ? datadorks.mono
        : datadorks.gold;

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
