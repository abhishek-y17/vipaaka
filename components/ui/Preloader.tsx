"use client";

import { AnimatePresence, animate, motion, useMotionValue } from "framer-motion";
import { useCallback, useEffect, useState } from "react";

import {
  DUR,
  DUR_MS,
  PRELOAD,
  ease,
  useIsomorphicLayoutEffect,
  useReducedMotion,
} from "@/lib/motion";

/**
 * First-load curtain.
 *
 * The mark itself is injected rather than imported, so this component owns
 * timing and nothing else — `VipakaWordmark` is a server component and could
 * not be rendered from inside a client one anyway.
 *
 * ── One thing in the spec that is now buildable, and one that is not ────────
 * BUILD_PLAN asks for "the Vipāka wordmark draws in". That needed path
 * geometry, which the raster did not have. `vipaka-wordmark.svg` does — two
 * paths — so a `stroke-dashoffset` draw-on is now possible. It is still not
 * what ships here: the trace is one closed outline per colour rather than
 * letter strokes, so drawing it reads as a shape being wiped in, not a word
 * being written. It fades and settles from 1.04 instead. Worth revisiting only
 * if the designer redraw (TODO(brand) in content/brand.ts) comes back with
 * per-letter paths.
 *
 * It also asks for "a gold rule fills as assets load". Browsers do not expose
 * a meaningful total-bytes figure, so any bar claiming real progress is
 * decoration. This one is explicit about what it is: it eases toward 90% over
 * the cap, then completes when readiness actually fires. It is a *reassurance*,
 * not a measurement, and it is never allowed to outlive the content.
 *
 * ── Why it usually will not appear at all ───────────────────────────────────
 * A loading screen that flashes for 90ms is worse than none, and a preloader
 * that runs on every navigation is a tax. So:
 *
 *   · once per session (`sessionStorage`), removed before paint on repeat views
 *   · the wordmark only fades in after `PRELOAD.grace` — if the page is ready
 *     before that, the visitor saw a black screen, which is what this site
 *     looks like anyway. No flash.
 *   · hard ceiling at `PRELOAD.max`; past it we lift regardless
 *   · reduced motion skips it entirely
 *
 * ── The Lighthouse cost, stated plainly ─────────────────────────────────────
 * An overlay in front of the hero delays LCP, and a lab run always looks like
 * a first visit — so this *will* cost mobile LCP even though most real repeat
 * visitors never see it. The mitigation is that the wordmark is `priority` and
 * becomes the LCP element itself. If Phase 9 cannot hit Performance ≥ 85 with
 * it, this component is the first thing to cut, and the site loses nothing
 * structural.
 */

const SEEN_KEY = "vipaka:preloaded";

export type PreloaderProps = {
  /** The wordmark. Passed in because `VipakaWordmark` is a server component. */
  mark: React.ReactNode;
};

export function Preloader({ mark }: PreloaderProps) {
  const reduced = useReducedMotion();
  // Rendered on the server so there is never a flash of unstyled hero.
  const [visible, setVisible] = useState(true);
  const [revealed, setRevealed] = useState(false);
  const progress = useMotionValue(0);

  const finish = useCallback(() => {
    setVisible(false);
    try {
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      // Private mode / storage disabled. The preloader simply runs again.
    }
  }, []);

  // Before paint, so a repeat visit never sees the curtain at all.
  useIsomorphicLayoutEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(SEEN_KEY) === "1";
    } catch {
      seen = false;
    }
    if (seen || reduced) setVisible(false);
  }, [reduced]);

  useEffect(() => {
    if (!visible || reduced) return;

    let cancelled = false;
    const graceTimer = window.setTimeout(
      () => !cancelled && setRevealed(true),
      PRELOAD.grace * 1000,
    );

    const creep = animate(progress, 0.9, {
      duration: PRELOAD.max,
      ease: ease("cinema"),
    });

    const ready = Promise.race([
      document.fonts.ready,
      new Promise((resolve) => window.setTimeout(resolve, PRELOAD.max * 1000)),
    ]);

    ready.then(() => {
      if (cancelled) return;
      creep.stop();
      animate(progress, 1, { duration: DUR.fast, ease: ease("snap") });
      window.setTimeout(finish, DUR_MS.fast);
    });

    return () => {
      cancelled = true;
      window.clearTimeout(graceTimer);
      creep.stop();
    };
  }, [visible, reduced, progress, finish]);

  // Nothing behind the curtain should scroll while it is up.
  useEffect(() => {
    if (!visible) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [visible]);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          key="preloader"
          aria-hidden="true"
          className="bg-void fixed inset-0 z-[500] flex flex-col items-center justify-center gap-8"
          initial={{ y: 0 }}
          exit={{ y: "-100%" }}
          transition={{ duration: DUR.slow, ease: ease("glass") }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 1.04 }}
            animate={revealed ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: DUR.cinema, ease: ease("cinema") }}
          >
            {mark}
          </motion.div>

          {/* Reassurance, not measurement — see the note above. */}
          <div className="h-px w-[160px] overflow-hidden bg-white/10">
            <motion.div
              className="h-full w-full origin-left"
              style={{
                scaleX: progress,
                background:
                  "linear-gradient(90deg, var(--gold-dim), var(--gold-bright))",
              }}
            />
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export default Preloader;
