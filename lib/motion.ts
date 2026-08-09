"use client";

import { useEffect, useLayoutEffect, useSyncExternalStore } from "react";

/**
 * The motion vocabulary. Every animation in the app — Framer Motion, GSAP, or
 * raw CSS — pulls its easing, duration, distance and stagger from here.
 *
 * The rule this file exists to enforce: **if a value is not a token, it does
 * not go in a component.** No inline cubic-beziers, no magic durations, no
 * hardcoded stagger, no `y: 40` typed into a page. That is what stops Phase 6
 * from looking like a different site than Phase 3.
 *
 * Values mirror the CSS custom properties in app/globals.css. They are
 * duplicated in JS only because Framer Motion and GSAP need numbers, not
 * `var()` strings; globals.css remains the design source of truth.
 *
 * Note this module deliberately does **not** import GSAP — see lib/gsap.ts.
 * Reveal only needs `EASE`, and it should not drag a scroll library into its
 * bundle to get it.
 */

/* -------------------------------------------------------------------------- */
/*  Easing                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Cubic-bezier control points, in the tuple form Framer Motion accepts.
 * Nothing in this project moves linearly.
 */
export const EASE = {
  /** Default. Heavy, expensive, slow-out. If it feels snappy it is wrong. */
  cinema: [0.22, 1, 0.36, 1],
  /** Panels, overlays, theater morph. */
  glass: [0.16, 1, 0.3, 1],
  /** Toggles and small state changes only. */
  snap: [0.65, 0, 0.35, 1],
} as const satisfies Record<string, readonly [number, number, number, number]>;

export type EaseName = keyof typeof EASE;

/** Bezier tuple for Framer's `transition.ease`, which wants it mutable. */
export const ease = (name: EaseName): [number, number, number, number] => [
  ...EASE[name],
];

/** The same curves as CSS strings, for inline styles and CSS transitions. */
export const EASE_CSS = {
  cinema: "cubic-bezier(0.22, 1, 0.36, 1)",
  glass: "cubic-bezier(0.16, 1, 0.30, 1)",
  snap: "cubic-bezier(0.65, 0, 0.35, 1)",
} as const satisfies Record<EaseName, string>;

/** GSAP's built-in equivalents, close enough to the curves above. */
export const EASE_GSAP = {
  cinema: "power4.out",
  glass: "power3.inOut",
  snap: "power2.inOut",
} as const satisfies Record<EaseName, string>;

/* -------------------------------------------------------------------------- */
/*  Duration                                                                   */
/* -------------------------------------------------------------------------- */

/** Seconds — Framer Motion and GSAP both work in seconds. */
export const DUR = {
  fast: 0.24,
  base: 0.52,
  slow: 0.9,
  /** Hero reveals only. Nothing else earns 1.4s. */
  cinema: 1.4,
} as const;

export type DurName = keyof typeof DUR;

/** Milliseconds, for `setTimeout` and CSS-in-JS. */
export const DUR_MS = {
  fast: 240,
  base: 520,
  slow: 900,
  cinema: 1400,
} as const satisfies Record<DurName, number>;

/* -------------------------------------------------------------------------- */
/*  Stagger                                                                    */
/* -------------------------------------------------------------------------- */

/** Elements never appear together. Seconds. */
export const STAGGER = {
  /** Children of a revealed group. CLAUDE.md §4b: 60–90ms. */
  children: 0.075,
  /** Characters in a SplitText heading. */
  letters: 0.04,
  /** Full-screen mobile menu links. */
  menu: 0.08,
  /** Beat between distinct phases of a hero sequence. */
  sequence: 0.2,
  /** Contact's staggered card wave. */
  wave: 0.06,
} as const;

/* -------------------------------------------------------------------------- */
/*  Distance & geometry                                                        */
/* -------------------------------------------------------------------------- */

/** Pixels. Every translate in the app comes from here. */
export const DISTANCE = {
  /** Reveal's rise. */
  reveal: 40,
  /** Max magnetic pull toward the cursor. */
  magnetic: 8,
  /** Card lift on hover. */
  lift: 4,
  /** PageTransition's incoming rise — small on purpose, see the component. */
  pageEnter: 8,
} as const;

/** Radius within which MagneticButton starts responding, in pixels. */
export const MAGNET_RADIUS = 60;

/**
 * Preloader timing, in seconds.
 *
 * `grace` — if the page is ready inside this, the preloader never appears at
 * all. A loading screen that flashes for 90ms is worse than none.
 * `max` — hard ceiling. Past this we lift regardless of what is still loading,
 * because a preloader that outlives its content is just a delay.
 */
export const PRELOAD = {
  grace: 0.18,
  max: 1.4,
} as const;

/**
 * ScrollTrigger scrub, in seconds. CLAUDE.md §4c is explicit that this is `1`
 * and not `true` — the one-second lag between the scroll and the element
 * catching up is the entire luxury of the effect.
 */
export const SCRUB = 1;

/** Default parallax travel, in percent of the element's own height. */
export const PARALLAX_SPEED = 15;

/* -------------------------------------------------------------------------- */
/*  Springs                                                                    */
/* -------------------------------------------------------------------------- */

/** Framer spring configs. Springs are for pointer-following only. */
export const SPRING = {
  /** MagneticButton: catches up quickly, settles without wobble. */
  magnetic: { type: "spring", stiffness: 260, damping: 22, mass: 0.6 },
  /** Slower return once the pointer leaves. */
  settle: { type: "spring", stiffness: 180, damping: 26, mass: 0.8 },
} as const;

/* -------------------------------------------------------------------------- */
/*  Media queries                                                              */
/* -------------------------------------------------------------------------- */

function makeMediaStore(query: string) {
  return {
    subscribe(onChange: () => void): () => void {
      if (typeof window === "undefined" || !window.matchMedia) return () => {};
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    get(): boolean {
      if (typeof window === "undefined" || !window.matchMedia) return false;
      return window.matchMedia(query).matches;
    },
  };
}

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
/** Spotlight and MagneticButton are meaningless without a hoverable pointer. */
const FINE_POINTER = "(pointer: fine)";
/** CLAUDE.md risk table: disable Spotlight under 768px. */
const SPOTLIGHT_VIEWPORT = "(min-width: 768px)";

const stores = {
  reducedMotion: makeMediaStore(REDUCED_MOTION),
  finePointer: makeMediaStore(FINE_POINTER),
  spotlightViewport: makeMediaStore(SPOTLIGHT_VIEWPORT),
};

/**
 * Server always reports `false` so the markup Next renders is the animated
 * one; the client corrects on hydration. Returning `true` on the server would
 * make every reduced-motion user hydrate through a mismatch.
 */
const serverSnapshot = () => false;

/**
 * The single reduced-motion guard. Every entrance animation in the app is
 * wrapped in this — CLAUDE.md §2 rule 4.
 *
 * Reactive: if the user flips the OS setting mid-session, components re-render.
 */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(
    stores.reducedMotion.subscribe,
    stores.reducedMotion.get,
    serverSnapshot,
  );
}

/** True on devices with a precise, hoverable pointer. False on touch. */
export function useFinePointer(): boolean {
  return useSyncExternalStore(
    stores.finePointer.subscribe,
    stores.finePointer.get,
    serverSnapshot,
  );
}

/**
 * Whether cursor-following light should run at all: fine pointer, viewport
 * wide enough, and motion not suppressed. Three separate reasons to say no,
 * asked once so no component has to remember all three.
 */
export function useSpotlightEnabled(): boolean {
  const fine = useSyncExternalStore(
    stores.finePointer.subscribe,
    stores.finePointer.get,
    serverSnapshot,
  );
  const wide = useSyncExternalStore(
    stores.spotlightViewport.subscribe,
    stores.spotlightViewport.get,
    serverSnapshot,
  );
  const reduced = useReducedMotion();
  return fine && wide && !reduced;
}

/**
 * Imperative read, for GSAP setup and event handlers that run outside render.
 * Prefer `useReducedMotion()` inside components — it reacts to changes.
 */
export function prefersReducedMotion(): boolean {
  return stores.reducedMotion.get();
}

/**
 * Collapses a duration to zero when the user has asked for reduced motion, so
 * the end state still applies but arrives instantly.
 */
export function motionDuration(seconds: number, reduced: boolean): number {
  return reduced ? 0 : seconds;
}

/** `useLayoutEffect` that does not warn during SSR. GSAP setup needs it. */
export const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/* -------------------------------------------------------------------------- */
/*  will-change                                                                */
/* -------------------------------------------------------------------------- */

/**
 * CLAUDE.md §4: `will-change` goes on at hover-intent and comes off after —
 * never left on permanently, because a permanently promoted layer costs memory
 * on every composite whether or not anything is moving.
 */
export function promote(el: HTMLElement | null): void {
  if (el) el.style.willChange = "transform";
}

export function demote(el: HTMLElement | null): void {
  if (el) el.style.willChange = "";
}

/* -------------------------------------------------------------------------- */
/*  Shared Framer Motion variants                                              */
/* -------------------------------------------------------------------------- */

/**
 * The house entrance: fade + rise. `Reveal` wraps this; use it directly only
 * for one-offs Reveal cannot express.
 */
export function fadeUp(reduced: boolean, distance = DISTANCE.reveal) {
  return {
    hidden: { opacity: 0, y: reduced ? 0 : distance },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: motionDuration(DUR.base, reduced),
        ease: EASE.cinema,
      },
    },
  } as const;
}

/** Parent variant that staggers its children. Pair with `fadeUp` on each child. */
export function staggerChildren(reduced: boolean, stagger = STAGGER.children) {
  return {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: reduced ? 0 : stagger,
        delayChildren: reduced ? 0 : 0.06,
      },
    },
  } as const;
}

/**
 * Viewport config used by every scroll-triggered Framer entrance.
 *
 * `margin` is `0px` — no shrink on the observed root. This took two attempts
 * to get right, both empirical:
 *
 *   1. The original value, a `-15%` bottom margin, is meant to fire an
 *      entrance a beat before the element is flush against the viewport edge.
 *      `whileInView`'s `margin` shrinks the *observed root* permanently,
 *      independent of scroll position — so on any page short enough that
 *      max-scroll cannot lift the element past that shrunk boundary, it never
 *      fires. Not eventually, not on resize. Reproduced on the Phase 2 shell:
 *      the footer's social row sat at `775px` at max scroll against a `765px`
 *      boundary (`-15%` of a 900px viewport) — missed by 10px, forever.
 *   2. A fixed `-64px` looked safe against that repro, but the very next
 *      element down — the copyright line, the last thing on the page — missed
 *      the *new* boundary by 23px. Any negative bottom margin has the same
 *      failure shape, just a different page height; there is no constant
 *      short of zero that a short-enough page cannot still defeat.
 *
 * `0px` is the only value where the observed root equals the real viewport,
 * which max-scroll is mathematically guaranteed to satisfy — the element
 * fires the instant any part of it is genuinely on screen. The "settles in a
 * beat early" nicety is gone; on today's mostly-stub pages there was no
 * scroll room for it to have been visible anyway, and content this thin is
 * the site's current reality, not a hypothetical edge case.
 */
export const IN_VIEW = {
  once: true,
  amount: 0,
  margin: "0px",
} as const;
