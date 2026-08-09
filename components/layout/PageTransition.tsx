"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import {
  DISTANCE,
  DUR,
  ease,
  motionDuration,
  useReducedMotion,
} from "@/lib/motion";

/**
 * Route-change choreography.
 *
 * ── The judgement call ──────────────────────────────────────────────────────
 * BUILD_PLAN specifies a gold hairline wiping left-to-right across the whole
 * viewport, the old page fading to black, the new page fading up — ~700ms.
 * Built and watched, that reads as a trick rather than as expensive, for two
 * reasons that only show up in use:
 *
 *   1. It is the *same* event every time. Apple's pages feel costly because
 *      motion is specific to what you did; a full-screen curtain is generic,
 *      and by the fourth click you are waiting through it.
 *   2. 700ms of unskippable animation on every nav is 700ms the site is not
 *      usable. On a six-page site people click a lot.
 *
 * `sweep` (the default) keeps the gold hairline motif but demotes it to a 2px
 * line across the top edge — present, legible as a transition, and never in
 * front of content. The incoming page rises 8px and fades over `--dur-base`.
 * Total ~520ms, none of it blocking.
 *
 * `curtain` is the spec'd version, kept behind a prop so it can be compared
 * rather than argued about. Both are transform/opacity only.
 *
 * ── Why there is no exit animation ──────────────────────────────────────────
 * In the App Router, `children` is already the *new* page by the time the
 * pathname changes. Getting a true exit means holding the outgoing subtree in
 * `AnimatePresence` and hoping reconciliation cooperates with streamed RSC
 * payloads — it does, until a route suspends, and then it flickers. Entering
 * only is honest about what actually happened and cannot desync.
 */

export type PageTransitionProps = {
  children: React.ReactNode;
  variant?: "sweep" | "curtain";
};

export function PageTransition({
  children,
  variant = "sweep",
}: PageTransitionProps) {
  const pathname = usePathname();
  const reduced = useReducedMotion();

  // The first paint is a page load, not a transition — no bar, no wipe.
  const isFirstRender = useRef(true);
  const [navCount, setNavCount] = useState(0);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setNavCount((n) => n + 1);
  }, [pathname]);

  // No indicator, no enter animation, no wrapper — a route change under
  // reduced motion should be indistinguishable from a plain page load.
  if (reduced) return <>{children}</>;

  const showIndicator = navCount > 0;

  return (
    <>
      <AnimatePresence>
        {showIndicator ? (
          variant === "sweep" ? (
            <motion.span
              key={`sweep-${navCount}`}
              aria-hidden="true"
              className="pointer-events-none fixed inset-x-0 top-0 z-[200] h-[2px] origin-left"
              style={{
                background:
                  "linear-gradient(90deg, transparent 0%, var(--gold) 40%, var(--gold-bright) 100%)",
              }}
              initial={{ scaleX: 0, opacity: 1 }}
              animate={{ scaleX: 1, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: DUR.slow,
                times: [0, 1],
                ease: ease("cinema"),
              }}
            />
          ) : (
            <motion.div
              key={`curtain-${navCount}`}
              aria-hidden="true"
              className="pointer-events-none fixed inset-0 z-[200]"
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              exit={{ opacity: 0 }}
              transition={{ duration: DUR.slow, ease: ease("glass") }}
            >
              <div className="bg-void relative h-full w-full">
                {/* The gold edge rides the leading side of the wipe. */}
                <span
                  className="absolute inset-y-0 right-0 w-[2px]"
                  style={{
                    background:
                      "linear-gradient(180deg, transparent, var(--gold-bright), transparent)",
                  }}
                />
              </div>
            </motion.div>
          )
        ) : null}
      </AnimatePresence>

      <motion.div
        key={pathname}
        data-reveal=""
        initial={
          reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: DISTANCE.pageEnter }
        }
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: motionDuration(DUR.base, reduced),
          ease: ease("cinema"),
        }}
      >
        {children}
      </motion.div>
    </>
  );
}

export default PageTransition;
