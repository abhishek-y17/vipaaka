"use client";

import { useCallback, useEffect, useRef } from "react";

import { DUR_MS, useSpotlightEnabled } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Light that responds to the cursor — CLAUDE.md §4d. Tracks the pointer into
 * `--mx` / `--my` on the wrapper, throttled to one update per frame.
 *
 * **The glow is moved with `transform`, not by repositioning a gradient.**
 * The obvious implementation feeds `--mx`/`--my` straight into a
 * `radial-gradient(circle at var(--mx) var(--my), …)` background, which
 * repaints the whole element every frame — precisely what §4's "animate only
 * transform and opacity" exists to forbid. Here the gradient is a fixed circle
 * on its own layer and only its `translate3d` changes, so each frame is a
 * composite with no paint.
 *
 * **Tracking and glowing are separate on purpose.** Custom properties inherit,
 * so `Spotlight` can set `--mx`/`--my` on a wrapper while the glow itself is
 * rendered deeper in the tree by whoever owns the stacking context. That is
 * what `GlassCard` does — a glow painted outside the card would be hidden
 * behind the card's own backdrop-filtered surface. Pass `glow={false}` and
 * place a `<SpotlightGlow>` where it should actually appear.
 *
 * Disabled outright when there is no fine pointer, under 768px, or under
 * reduced motion — asked once in `useSpotlightEnabled` so no caller has to
 * remember all three. When disabled, no listener is attached and no glow layer
 * is rendered at all.
 */

export type SpotlightProps = {
  children: React.ReactNode;
  /** Render the glow here. Off when a descendant renders its own. */
  glow?: boolean;
  /** Diameter of the glow in px. */
  size?: number;
  /** Any CSS colour. Defaults to the `--gold-glow` token. */
  color?: string;
  className?: string;
};

export function Spotlight({
  children,
  glow = true,
  size = 340,
  color = "var(--gold-glow)",
  className,
}: SpotlightProps) {
  const scope = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const frame = useRef<number | null>(null);
  const enabled = useSpotlightEnabled();

  const track = useCallback((clientX: number, clientY: number) => {
    const el = scope.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${clientX - r.left}px`);
    el.style.setProperty("--my", `${clientY - r.top}px`);
  }, []);

  const onPointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (frame.current !== null) return;
      const { clientX, clientY } = event;
      frame.current = requestAnimationFrame(() => {
        frame.current = null;
        track(clientX, clientY);
      });
    },
    [track],
  );

  const onPointerEnter = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      // Position before fading in, or the glow visibly slides in from 0,0.
      track(event.clientX, event.clientY);
      if (glowRef.current) glowRef.current.dataset.active = "true";
    },
    [track],
  );

  const onPointerLeave = useCallback(() => {
    if (glowRef.current) glowRef.current.dataset.active = "false";
  }, []);

  useEffect(() => {
    return () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    };
  }, []);

  return (
    <div
      ref={scope}
      className={cn("relative", className)}
      onPointerMove={enabled ? onPointerMove : undefined}
      onPointerEnter={enabled ? onPointerEnter : undefined}
      onPointerLeave={enabled ? onPointerLeave : undefined}
    >
      {enabled && glow ? (
        <SpotlightGlow ref={glowRef} size={size} color={color} />
      ) : null}
      {children}
    </div>
  );
}

/**
 * The glow layer itself. Absolutely positioned at the wrapper's origin and
 * translated to the pointer, so it must sit inside something `relative`.
 *
 * Visibility is driven by `data-active` when a `Spotlight` owns it directly,
 * or by `group-hover` when a card owns it — hence both selectors below.
 */
export const SpotlightGlow = function SpotlightGlow({
  ref,
  size = 340,
  color = "var(--gold-glow)",
  className,
}: {
  ref?: React.Ref<HTMLDivElement>;
  size?: number;
  color?: string;
  className?: string;
}) {
  return (
    <div
      ref={ref}
      aria-hidden="true"
      data-active="false"
      className={cn(
        "pointer-events-none absolute top-0 left-0 opacity-0 transition-opacity",
        "data-[active=true]:opacity-100 group-hover:opacity-100",
        className,
      )}
      style={{
        width: size,
        height: size,
        marginLeft: -size / 2,
        marginTop: -size / 2,
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        transform: "translate3d(var(--mx, 0px), var(--my, 0px), 0)",
        transitionDuration: `${DUR_MS.base}ms`,
      }}
    />
  );
};

export default Spotlight;
