"use client";

import { useCallback } from "react";

import { DISTANCE, DUR_MS, demote, promote } from "@/lib/motion";
import { cn } from "@/lib/utils";

import { Spotlight, SpotlightGlow } from "./Spotlight";

/**
 * The §4 glass recipe, plus the sheen that sweeps across on hover, plus an
 * optional cursor-following Spotlight.
 *
 * **No Framer Motion here.** Hover is the one state a CSS transition handles
 * better than a JS animation library: it costs nothing until the pointer
 * arrives, it cannot desync from `:hover`, and across a grid of cards that
 * difference is the frame budget. Framer earns its place on entrances and
 * exits, not on hover.
 *
 * Everything animated is `transform` or `opacity` — the lift is a translate,
 * the sheen is a translate, the glow is a translate. No `box-shadow`
 * transitions, which is the usual reason "premium" cards drop frames.
 *
 * The glow is rendered *inside* the card rather than by the `Spotlight`
 * wrapper: the card's `backdrop-filter` surface would otherwise paint straight
 * over it. `Spotlight` still owns the pointer tracking, and `--mx`/`--my`
 * inherit down to the glow.
 *
 * Budget note: `backdrop-filter` caps at ~6 visible instances (§4). This
 * component cannot know what else is on screen, so count them per layout.
 */

export type GlassCardProps = {
  children: React.ReactNode;
  /** Cursor-following gold glow. Self-disables on touch and under 768px. */
  spotlight?: boolean;
  /** The sweeping highlight on hover. */
  sheen?: boolean;
  /** Rise on hover. */
  lift?: boolean;
  className?: string;
};

export function GlassCard({
  children,
  spotlight = false,
  sheen = true,
  lift = true,
  className,
}: GlassCardProps) {
  const onEnter = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => promote(e.currentTarget),
    [],
  );
  const onLeave = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => demote(e.currentTarget),
    [],
  );

  const card = (
    <div
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      className={cn(
        "glass group ease-cinema dur-base relative overflow-hidden rounded-lg transition-transform",
        lift && "hover:-translate-y-(--lift)",
        className,
      )}
      style={{ "--lift": `${DISTANCE.lift}px` } as React.CSSProperties}
    >
      {spotlight ? <SpotlightGlow /> : null}

      {sheen ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
        >
          {/* Rotated 20°, oversized vertically so the corners stay covered
              through the sweep. Starts fully off the left edge. */}
          <span
            className="ease-cinema absolute -inset-y-1/2 -left-1/2 w-1/3 rotate-[20deg] bg-gradient-to-r from-transparent via-white/[0.06] to-transparent transition-transform group-hover:translate-x-[420%]"
            style={{ transitionDuration: `${DUR_MS.slow}ms` }}
          />
        </span>
      ) : null}

      <div className="relative">{children}</div>
    </div>
  );

  // The wrapper only tracks the pointer; the glow above consumes --mx/--my.
  return spotlight ? <Spotlight glow={false}>{card}</Spotlight> : card;
}

export default GlassCard;
