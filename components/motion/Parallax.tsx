"use client";

import { useRef } from "react";

import { registerGsap } from "@/lib/gsap";
import {
  PARALLAX_SPEED,
  SCRUB,
  demote,
  promote,
  useIsomorphicLayoutEffect,
  useReducedMotion,
} from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Scroll-scrubbed parallax. **The one primitive that uses GSAP**, because it
 * is the one whose timeline is the scrollbar rather than a state change.
 *
 * `scrub: 1` and not `true` — CLAUDE.md §4c is explicit that the one-second
 * lag between the scroll and the layer catching up is the whole luxury.
 * `ease: "none"` because the scrub supplies the easing; adding a curve on top
 * makes the layer overshoot and then crawl back, which reads as a bug.
 *
 * The moving layer travels ±speed/2 percent of its own height, so it must be
 * taller than its frame or the ends will show. Give the child ~130% height, or
 * let the default `clip` frame hide the overshoot.
 *
 * `will-change` goes on only while the trigger is active and comes off after —
 * a permanently promoted full-bleed image layer costs real memory on mobile.
 *
 * Under reduced motion GSAP is never loaded into the timeline at all: the
 * child renders in its natural position and nothing observes the scroll.
 */

export type ParallaxProps = {
  children: React.ReactNode;
  /** Total travel as a percentage of the layer's height. */
  speed?: number;
  /** Frame the movement so overshoot is hidden. Off for text. */
  clip?: boolean;
  className?: string;
  /** Class applied to the moving layer itself. */
  layerClassName?: string;
};

export function Parallax({
  children,
  speed = PARALLAX_SPEED,
  clip = true,
  className,
  layerClassName,
}: ParallaxProps) {
  const scope = useRef<HTMLDivElement>(null);
  const layer = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useIsomorphicLayoutEffect(() => {
    const scopeEl = scope.current;
    const layerEl = layer.current;
    if (reduced || !scopeEl || !layerEl) return;

    const gsap = registerGsap();

    const ctx = gsap.context(() => {
      gsap.fromTo(
        layerEl,
        { yPercent: -speed / 2 },
        {
          yPercent: speed / 2,
          ease: "none",
          scrollTrigger: {
            trigger: scopeEl,
            start: "top bottom",
            end: "bottom top",
            scrub: SCRUB,
            onToggle: ({ isActive }) =>
              isActive ? promote(layerEl) : demote(layerEl),
          },
        },
      );
    }, scopeEl);

    return () => {
      ctx.revert();
      demote(layerEl);
    };
  }, [reduced, speed]);

  return (
    <div
      ref={scope}
      className={cn("relative", clip && "overflow-hidden", className)}
    >
      <div ref={layer} className={cn("h-full w-full", layerClassName)}>
        {children}
      </div>
    </div>
  );
}

export default Parallax;
