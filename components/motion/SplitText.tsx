"use client";

import { motion, type Variants } from "framer-motion";

import {
  DISTANCE,
  DUR,
  IN_VIEW,
  STAGGER,
  ease,
  motionDuration,
  useReducedMotion,
} from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Splits a heading into words or characters and staggers them in.
 * Used on Cinzel page titles.
 *
 * ── Why this is not GSAP's SplitText ────────────────────────────────────────
 * BUILD_PLAN specifies GSAP's SplitText plugin (which is genuinely free in
 * GSAP 3.15 — no Club licence). Two reasons this hand-rolls the split instead:
 *
 *   1. The project rule is Framer Motion for state-driven animation. A heading
 *      entrance is state-driven. Splitting with GSAP and animating with Framer
 *      would put both libraries on one element, which is the thing we are not
 *      allowed to do; splitting AND animating with GSAP would mean the whole
 *      motion vocabulary of the site has two dialects.
 *   2. SplitText's real advantage is *line* splitting — correct re-wrapping,
 *      resize handling, RTL. This project splits words and characters of short
 *      uppercase titles, where that machinery buys nothing and its `autoSplit`
 *      re-split on resize would silently invalidate Framer's element refs.
 *
 * If a future layout needs line-level splitting, that is the moment to bring
 * SplitText in — for that component only.
 *
 * ── Wrapping ────────────────────────────────────────────────────────────────
 * Characters are grouped inside their word, so a line break can only happen
 * between words. Splitting a title into a flat list of inline-block chars is
 * the classic bug: "UNDERSTOOD" wraps after the "U".
 *
 * ── Accessibility ───────────────────────────────────────────────────────────
 * The real string lives on `aria-label`; every fragment is `aria-hidden`. A
 * screen reader gets "About the film", not "A. b. o. u. t."
 *
 * ── Tracking ────────────────────────────────────────────────────────────────
 * Letter-spacing is applied after *every* glyph including the last, so a
 * centred all-caps heading sits half a tracking-unit left of true centre. Pass
 * `trim` with the em value from the size token — `text-display-xl` is 0.13em,
 * `text-display-md` is 0.18em — and the element becomes inline-block with a
 * matching negative end margin, which is the only place the correction
 * actually works. On a block element a negative margin does not shrink the
 * line box and does nothing.
 *
 * Static, not measured at runtime: reading computed letter-spacing after mount
 * and adjusting would re-centre the heading after hydration, which is a layout
 * shift, and CLS target is 0.
 */

const TAGS = {
  h1: motion.h1,
  h2: motion.h2,
  h3: motion.h3,
  h4: motion.h4,
  p: motion.p,
  span: motion.span,
  div: motion.div,
} as const;

export type SplitTextProps = {
  /** The real string. Kept intact for `aria-label`. */
  text: string;
  by?: "chars" | "words";
  as?: keyof typeof TAGS;
  /** Seconds before the first fragment moves. */
  delay?: number;
  /** Per-fragment stagger. Defaults to `STAGGER.letters` (40ms). */
  stagger?: number;
  /**
   * Fragments rise from behind a clipping edge instead of fading up. Reads as
   * a title card. Only safe on text with no descenders — i.e. our uppercase
   * Cinzel — so it is off by default.
   */
  mask?: boolean;
  /** `inView` waits for scroll; `mount` fires immediately, for heroes. */
  trigger?: "inView" | "mount";
  duration?: number;
  /**
   * Em value matching the size token's letter-spacing, to cancel the trailing
   * gap on centred headings. `0.13` for display-xl, `0.18` for display-md.
   * Omit for left-aligned text, where the gap is invisible.
   */
  trim?: number;
  className?: string;
};

export function SplitText({
  text,
  by = "chars",
  as = "span",
  delay = 0,
  stagger = STAGGER.letters,
  mask = false,
  trigger = "inView",
  duration = DUR.base,
  trim,
  className,
}: SplitTextProps) {
  const reduced = useReducedMotion();
  const Tag = TAGS[as];

  const trimStyle =
    trim !== undefined ? { marginInlineEnd: `-${trim}em` } : undefined;

  // Under reduced motion the text is not split at all. Beyond skipping the
  // animation this is simply better markup — one text node instead of forty
  // aria-hidden spans standing in for it.
  if (reduced) {
    const Plain = as as React.ElementType;
    return (
      <Plain
        className={cn(trim !== undefined && "inline-block", className)}
        style={trimStyle}
      >
        {text}
      </Plain>
    );
  }

  const words = text.split(/\s+/).filter(Boolean);

  const container = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: reduced ? 0 : stagger,
        delayChildren: motionDuration(delay, reduced),
      },
    },
  };

  const fragment = {
    hidden: reduced
      ? { opacity: 1, y: 0 }
      : { opacity: 0, y: mask ? "100%" : DISTANCE.reveal / 2 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: motionDuration(duration, reduced),
        ease: ease("cinema"),
      },
    },
  };

  const motionProps =
    trigger === "mount"
      ? { initial: "hidden" as const, animate: "visible" as const }
      : {
          initial: "hidden" as const,
          whileInView: "visible" as const,
          viewport: {
            once: IN_VIEW.once,
            margin: IN_VIEW.margin,
            amount: IN_VIEW.amount,
          },
        };

  return (
    <Tag
      aria-label={text}
      data-reveal=""
      className={cn(trim !== undefined && "inline-block", className)}
      style={trimStyle}
      variants={container}
      {...motionProps}
    >
      <span aria-hidden="true">
        {words.map((word, wordIndex) => (
          <span key={`${word}-${wordIndex}`}>
            {/* The word is the unbreakable unit; chars sit inside it. */}
            <span className="inline-block whitespace-nowrap">
              {by === "words" ? (
                <Fragment variants={fragment} mask={mask}>
                  {word}
                </Fragment>
              ) : (
                Array.from(word).map((char, charIndex) => (
                  <Fragment
                    key={`${char}-${charIndex}`}
                    variants={fragment}
                    mask={mask}
                  >
                    {char}
                  </Fragment>
                ))
              )}
            </span>
            {/* A real space, so lines can break between words. */}
            {wordIndex < words.length - 1 ? " " : null}
          </span>
        ))}
      </span>
    </Tag>
  );
}

function Fragment({
  children,
  variants,
  mask,
}: {
  children: React.ReactNode;
  variants: Variants;
  mask: boolean;
}) {
  const span = (
    <motion.span variants={variants} className="inline-block">
      {children}
    </motion.span>
  );

  // The clipping edge has to be a separate, non-animated element — putting
  // overflow:hidden on the moving span would clip nothing.
  return mask ? (
    <span className="inline-block overflow-hidden align-bottom">{span}</span>
  ) : (
    span
  );
}

export default SplitText;
