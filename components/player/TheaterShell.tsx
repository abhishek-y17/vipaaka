"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useRef } from "react";

import { YTPlayer, type YTPlayerHandle } from "@/components/player/YTPlayer";
import { DUR, ease, motionDuration, useReducedMotion } from "@/lib/motion";

/**
 * The one shared theater modal — every trailer opens the same instance
 * (RAPID §0 scope cut: "no per-trailer FLIP origin").
 *
 * // DECISION: ships the PLAYER_SPEC §6 fallback directly — scale-from-0.96 +
 * cross-fade — rather than attempting GSAP Flip first. Flip's entire value is
 * flying from the SPECIFIC thumbnail that was clicked; a shared modal with one
 * uniform open animation regardless of origin is exactly the case Flip has
 * nothing to offer. Spec's own words: the fallback is "90% of the feeling for
 * 10% of the work." TODO(polish): true per-origin FLIP, if it turns out to
 * matter more than it looks like it will. Est. cost 60–90 min: needs GSAP's
 * Flip plugin, a bounding-rect capture on each thumbnail at click time, and
 * swapping this element's entrance off Framer's AnimatePresence onto GSAP
 * outright — Flip has to own the transform for the whole open, and the two
 * libraries never share one element (CLAUDE.md §5).
 *
 * Focus trap follows the same shape as `MobileMenu` — Tab/Shift+Tab cycle
 * inside the dialog only. Body scroll locks while open. Escape and the
 * backdrop both close it. Closing calls `pause()` on the player via ref
 * immediately, rather than waiting ~500ms for the exit animation to finish
 * unmounting it — otherwise audio keeps playing under the fade.
 */

export type TheaterShellProps = {
  open: boolean;
  onClose: () => void;
  url: string;
  title: string;
};

// No `poster`: the player shows YouTube's own thumbnail behind YouTube's own
// play button. `Trailer.poster` is still used — by the rows on the Trailers
// page, which is where a local still actually earns its place.
export function TheaterShell({ open, onClose, url, title }: TheaterShellProps) {
  const reduced = useReducedMotion();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<Element | null>(null);
  const playerRef = useRef<YTPlayerHandle>(null);

  const handleClose = () => {
    playerRef.current?.pause();
    onClose();
  };

  useEffect(() => {
    if (!open) return;

    openerRef.current = document.activeElement;
    closeRef.current?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        // No maximised-state guard needed: fullscreen belongs to YouTube now,
        // and the browser consumes the Escape that leaves it before the event
        // can reach this document.
        e.preventDefault();
        handleClose();
        return;
      }
      if (e.key !== "Tab") return;

      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable || focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      if (openerRef.current instanceof HTMLElement) openerRef.current.focus();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={title}
          className="fixed inset-0 z-[150] flex items-center justify-center bg-black/92 p-4 sm:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: motionDuration(DUR.base, reduced) }}
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose();
          }}
        >
          <motion.div
            // `max-h-full` + column flow so a phone in landscape clips
            // nothing: the title row and the transport keep their height and
            // the video frame gives way, rather than the whole stack
            // overflowing a flex-centred box and losing its top and bottom.
            className="flex max-h-full w-full max-w-4xl flex-col"
            initial={reduced ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reduced ? { opacity: 1 } : { opacity: 0, scale: 0.96 }}
            transition={{
              duration: motionDuration(DUR.base, reduced),
              ease: ease("glass"),
            }}
          >
            <div className="mb-3 flex shrink-0 items-center justify-between">
              <p className="font-eyebrow text-eyebrow-sm text-mid uppercase">
                {title}
              </p>
              <button
                ref={closeRef}
                type="button"
                onClick={handleClose}
                aria-label="Close"
                className="text-hi ease-cinema dur-fast flex size-9 items-center justify-center transition-colors hover:text-white/70"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>

            <YTPlayer ref={playerRef} url={url} />

            {/* Focus guard. The Tab handler above cannot see keystrokes that
                happen inside a cross-origin iframe, so once focus is on
                YouTube's controls our trap is blind and Tab walks straight
                out of the dialog into the page behind it. This catches focus
                the moment it leaves the player forwards and sends it back to
                Close, which closes the loop without needing to intercept
                anything inside the frame. */}
            <div
              tabIndex={0}
              onFocus={() => closeRef.current?.focus()}
              className="h-0 w-0 overflow-hidden outline-none"
            />
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export default TheaterShell;
