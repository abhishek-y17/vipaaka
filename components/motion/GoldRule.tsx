"use client";

import { motion } from "framer-motion";

import {
  DUR,
  IN_VIEW,
  STAGGER,
  ease,
  motionDuration,
  useReducedMotion,
} from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * The gold hairline — the recurring motif under every section heading.
 *
 * **Two variants, because the mockups use two and they are not
 * interchangeable** (CLAUDE.md §3, "The gold rule"):
 *
 *   left    2px, gradient gold → transparent, growing from the left.
 *           Left-aligned headings. `About page.png`.
 *   center  a symmetric hairline pair with a small gold lozenge at the
 *           midpoint, opening outward from the middle.
 *           Centred headings. `Trailer page.png`, `Contact page.png`.
 *
 * The centre variant animates its two arms independently rather than scaling
 * the whole row: a single `scaleX` on the container would squash the lozenge
 * into a sliver on the way in, which is exactly the kind of cheap distortion
 * this design cannot afford.
 *
 * Decorative — always `aria-hidden`.
 */

export type GoldRuleProps = {
  variant?: "left" | "center";
  /** Total width in px. The spec's ~120px is the default. */
  width?: number;
  /** Seconds. */
  delay?: number;
  /** Centre variant only. */
  ornament?: "lozenge" | "none";
  className?: string;
};

export function GoldRule({
  variant = "left",
  width = 120,
  delay = 0,
  ornament = "lozenge",
  className,
}: GoldRuleProps) {
  const reduced = useReducedMotion();

  // Fully drawn, no motion component — a `whileInView` rule below the fold
  // would stay at scaleX(0), i.e. invisible, until scrolled to.
  if (reduced) {
    return variant === "left" ? (
      <span
        aria-hidden="true"
        className={cn("block h-[2px]", className)}
        style={{
          width,
          background: "linear-gradient(90deg, var(--gold) 0%, transparent 100%)",
        }}
      />
    ) : (
      <span
        aria-hidden="true"
        className={cn("flex items-center justify-center gap-2.5", className)}
        style={{ width }}
      >
        <span
          className="h-px flex-1"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, var(--gold) 100%)",
          }}
        />
        {ornament === "lozenge" ? (
          <span className="bg-gold size-[5px] shrink-0 rotate-45" />
        ) : null}
        <span
          className="h-px flex-1"
          style={{
            background:
              "linear-gradient(90deg, var(--gold) 0%, transparent 100%)",
          }}
        />
      </span>
    );
  }

  const transition = {
    duration: motionDuration(DUR.base, reduced),
    ease: ease("cinema"),
  };

  const viewport = {
    once: IN_VIEW.once,
    margin: IN_VIEW.margin,
    amount: IN_VIEW.amount,
  };

  if (variant === "left") {
    return (
      <motion.span
        aria-hidden="true"
        data-reveal=""
        className={cn("block h-[2px] origin-left", className)}
        style={{
          width,
          background:
            "linear-gradient(90deg, var(--gold) 0%, transparent 100%)",
        }}
        initial={{ scaleX: reduced ? 1 : 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={viewport}
        transition={{ ...transition, delay: motionDuration(delay, reduced) }}
      />
    );
  }

  // Arms open outward from the centre; the lozenge lands last.
  const armDelay = motionDuration(delay, reduced);
  const lozengeDelay = motionDuration(delay + STAGGER.children, reduced);

  return (
    <motion.span
      aria-hidden="true"
      data-reveal=""
      className={cn("flex items-center justify-center gap-2.5", className)}
      style={{ width }}
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
    >
      <motion.span
        className="h-px flex-1 origin-right"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, var(--gold) 100%)",
        }}
        variants={{
          hidden: { scaleX: reduced ? 1 : 0 },
          visible: { scaleX: 1, transition: { ...transition, delay: armDelay } },
        }}
      />

      {ornament === "lozenge" ? (
        <motion.span
          className="bg-gold size-[5px] shrink-0 rotate-45"
          variants={{
            hidden: { scale: reduced ? 1 : 0, opacity: reduced ? 1 : 0 },
            visible: {
              scale: 1,
              opacity: 1,
              transition: { ...transition, delay: lozengeDelay },
            },
          }}
        />
      ) : null}

      <motion.span
        className="h-px flex-1 origin-left"
        style={{
          background:
            "linear-gradient(90deg, var(--gold) 0%, transparent 100%)",
        }}
        variants={{
          hidden: { scaleX: reduced ? 1 : 0 },
          visible: { scaleX: 1, transition: { ...transition, delay: armDelay } },
        }}
      />
    </motion.span>
  );
}

export default GoldRule;
