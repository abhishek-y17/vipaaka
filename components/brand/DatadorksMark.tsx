import { film } from "@/content/film";
import { cn } from "@/lib/utils";

/**
 * The studio lockup, top-left of the nav on every page: a `D` monogram in a
 * rounded square, then the DATADORKS wordmark.
 *
 * ⚠ **This is a typographic stand-in, not the real logo.** There is no
 * Datadorks logo file in the repo — `public/` holds only the Vipāka wordmark,
 * badge and banner. The mockups show a specific monogram with a bevelled `D`
 * that this does not reproduce.
 *
 * It matches the mockup's *composition* — square mark, then wordmark, same
 * proportions and spacing — so the nav is correct in every respect except the
 * glyph itself, and swapping in the real asset is a one-file change. CLAUDE.md
 * §2 rule 7 says logos stay as-is, so nothing here tries to reinterpret it.
 *
 * TODO(brand): request `logo-datadorks.svg` from Datadorks.
 */

export type DatadorksMarkProps = {
  className?: string;
  /** Hide the wordmark and show the monogram alone. */
  monogramOnly?: boolean;
};

export function DatadorksMark({
  className,
  monogramOnly = false,
}: DatadorksMarkProps) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <span
        aria-hidden="true"
        className="border-hairline bg-surface-2 text-hi font-display flex size-8 shrink-0 items-center justify-center rounded-md border text-[1.0625rem] leading-none"
      >
        D
      </span>
      {monogramOnly ? null : (
        <span className="text-hi text-[0.9375rem] leading-none font-semibold tracking-[0.14em]">
          {film.studio}
        </span>
      )}
      <span className="sr-only">{film.studio} — home</span>
    </span>
  );
}

export default DatadorksMark;
