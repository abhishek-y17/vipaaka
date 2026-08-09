"use client";

import type { gsap as GsapNamespace } from "gsap";

/**
 * GSAP, loaded on demand rather than bundled into the route.
 *
 * This lives apart from lib/motion.ts on purpose. motion.ts is imported by
 * every primitive, including the Framer-only ones; if GSAP were imported
 * there, `Reveal` would pull a scroll library into its bundle just to read an
 * easing curve. Only the scroll-driven primitives import this file.
 *
 * ── Why the import is dynamic ───────────────────────────────────────────────
 * Measured on the deployed build: gsap + ScrollTrigger is ~111 kB across two
 * chunks, and it was essentially the *entire* non-shared payload of Home,
 * About and Contact — 213 kB First Load against 103 kB shared. It was already
 * correctly scoped (it never reached /world, /trailers or /film), but on the
 * three routes that do use it, it was blocking first paint to power effects
 * that cannot run until after first paint anyway: a parallax that needs a
 * scroll, a spine that fills on scroll, a title that scales on scroll.
 *
 * Nothing here is load-bearing for layout. Every consumer renders its resting
 * state in the initial HTML and GSAP only ever animates away from it, so
 * arriving a few hundred milliseconds late costs a late first scrub, not a
 * flash of unstyled content.
 *
 * GSAP 3.15. Since Webflow made GSAP fully free in April 2025, ScrollTrigger,
 * Flip, SplitText and Observer all ship inside the public `gsap` package — no
 * Club membership, no licence key, commercial use included.
 */

export type Gsap = typeof GsapNamespace;
export type GsapBundle = {
  gsap: Gsap;
  ScrollTrigger: typeof import("gsap/ScrollTrigger").ScrollTrigger;
};

/** One in-flight promise for the whole app — the second caller waits on the
 *  first caller's network request rather than starting another. */
let bundle: Promise<GsapBundle> | null = null;

export function loadGsap(): Promise<GsapBundle> {
  bundle ??= (async () => {
    const [core, scroll] = await Promise.all([
      import("gsap"),
      import("gsap/ScrollTrigger"),
    ]);
    core.gsap.registerPlugin(scroll.ScrollTrigger);
    return { gsap: core.gsap, ScrollTrigger: scroll.ScrollTrigger };
  })();
  return bundle;
}
