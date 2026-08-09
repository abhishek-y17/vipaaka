"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * GSAP plugin registration, done once.
 *
 * This lives apart from lib/motion.ts on purpose. motion.ts is imported by
 * every primitive, including the Framer-only ones; if GSAP were imported
 * there, `Reveal` would pull a scroll library into its bundle just to read an
 * easing curve. Only the scroll-driven primitives import this file.
 *
 * GSAP 3.15. Since Webflow made GSAP fully free in April 2025, ScrollTrigger,
 * Flip, SplitText and Observer all ship inside the public `gsap` package — no
 * Club membership, no licence key, commercial use included.
 */

let registered = false;

export function registerGsap(): typeof gsap {
  if (!registered && typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
    registered = true;
  }
  return gsap;
}

export { gsap, ScrollTrigger };
