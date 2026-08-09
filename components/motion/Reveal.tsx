"use client";

import { motion } from "framer-motion";

import {
  DISTANCE,
  DUR,
  IN_VIEW,
  ease,
  motionDuration,
  useReducedMotion,
} from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * The house entrance. Wraps anything; on scroll-into-view it fades up over
 * `--dur-base` with `--ease-cinema`.
 *
 * Framer Motion, not GSAP — this is a state transition (out of view → in
 * view), not a scroll-scrubbed one. Nothing here is tied to scroll position.
 *
 * `direction` is the direction of travel: `up` (the default) starts below and
 * rises. Under reduced motion the element is simply present, at full opacity,
 * with no transform.
 */

export type RevealDirection = "up" | "down" | "left" | "right" | "none";

const OFFSET: Record<RevealDirection, { x: number; y: number }> = {
  up: { x: 0, y: DISTANCE.reveal },
  down: { x: 0, y: -DISTANCE.reveal },
  left: { x: DISTANCE.reveal, y: 0 },
  right: { x: -DISTANCE.reveal, y: 0 },
  none: { x: 0, y: 0 },
};

export type RevealProps = {
  children: React.ReactNode;
  /** Seconds. Prefer `STAGGER` tokens over hand-picked values. */
  delay?: number;
  direction?: RevealDirection;
  /** Replay every time it re-enters the viewport. Default: reveal once. */
  once?: boolean;
  /** Override the travel distance. Defaults to `DISTANCE.reveal`. */
  distance?: number;
  /** Slower entrance for hero-weight content. */
  duration?: number;
  className?: string;
};

export function Reveal({
  children,
  delay = 0,
  direction = "up",
  once = IN_VIEW.once,
  distance,
  duration = DUR.base,
  className,
}: RevealProps) {
  const reduced = useReducedMotion();

  // Not "animate to the same value" — no motion component at all. A
  // `whileInView` element still waits for the viewport before settling, which
  // would leave everything below the fold hidden until scrolled to. Static
  // but *complete* is the requirement (CLAUDE.md §2 rule 4).
  if (reduced) {
    return (
      <div data-reveal="" className={cn(className)}>
        {children}
      </div>
    );
  }

  const base = OFFSET[direction];
  const scale = distance === undefined ? 1 : distance / DISTANCE.reveal;
  const from = { x: base.x * scale, y: base.y * scale };

  return (
    <motion.div
      // Paired with the <noscript> rule in globals.css: if JS never runs,
      // Framer's SSR'd `opacity: 0` would leave the page blank.
      data-reveal=""
      className={cn(className)}
      initial={reduced ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, ...from }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once, margin: IN_VIEW.margin, amount: IN_VIEW.amount }}
      transition={{
        duration: motionDuration(duration, reduced),
        delay: motionDuration(delay, reduced),
        ease: ease("cinema"),
      }}
    >
      {children}
    </motion.div>
  );
}

export default Reveal;
