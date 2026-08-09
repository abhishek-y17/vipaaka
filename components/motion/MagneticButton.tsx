"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useCallback, useEffect, useRef } from "react";

import {
  DISTANCE,
  MAGNET_RADIUS,
  SPRING,
  demote,
  promote,
  useFinePointer,
  useReducedMotion,
} from "@/lib/motion";
import { clamp, cn } from "@/lib/utils";

/**
 * Pulls toward the cursor as it approaches, springs back on leave.
 * Used on the Contact page's four social buttons.
 *
 * A wrapper, not a button: put a real `<button>` or `<a>` inside it. Keeping
 * the semantics in the child means focus, keyboard and screen readers behave
 * normally and this stays a pure motion concern.
 *
 * Three implementation notes that matter:
 *
 * - **The listener is on `window`, not the element.** The effect has to start
 *   before the pointer arrives, and an element only receives `pointermove`
 *   once the pointer is already over it. The alternative — an oversized
 *   invisible padded hit area — would swallow hover on whatever sits nearby.
 *
 * - **The rect is cached**, refreshed on scroll and resize. Calling
 *   `getBoundingClientRect()` on every pointer frame forces layout on every
 *   frame, times however many magnetic buttons are on screen.
 *
 * - **Disabled entirely on coarse pointers.** There is no cursor to be
 *   magnetic toward on a phone, so this does no work there at all — no
 *   listener, no springs, no layer promotion.
 */

export type MagneticButtonProps = {
  children: React.ReactNode;
  /** Max pull in px. Defaults to `DISTANCE.magnetic` (8px). */
  strength?: number;
  /** Distance from the element's edge at which it starts responding. */
  radius?: number;
  className?: string;
};

export function MagneticButton({
  children,
  strength = DISTANCE.magnetic,
  radius = MAGNET_RADIUS,
  className,
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const rect = useRef<DOMRect | null>(null);
  const frame = useRef<number | null>(null);
  const engaged = useRef(false);

  const reduced = useReducedMotion();
  const fine = useFinePointer();
  const active = fine && !reduced;

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, SPRING.magnetic);
  const springY = useSpring(y, SPRING.magnetic);

  const measure = useCallback(() => {
    rect.current = ref.current?.getBoundingClientRect() ?? null;
  }, []);

  useEffect(() => {
    if (!active) {
      x.set(0);
      y.set(0);
      return;
    }

    // Captured for cleanup: `ref.current` may already be null by unmount.
    const el = ref.current;
    measure();

    const apply = (clientX: number, clientY: number) => {
      const r = rect.current;
      if (!r) return;

      const dx = clientX - (r.left + r.width / 2);
      const dy = clientY - (r.top + r.height / 2);

      // Distance from the element's edge, not its centre — otherwise a wide
      // button reacts to a pointer that is visually nowhere near it.
      const gapX = Math.max(0, Math.abs(dx) - r.width / 2);
      const gapY = Math.max(0, Math.abs(dy) - r.height / 2);
      const gap = Math.hypot(gapX, gapY);

      if (gap > radius) {
        if (engaged.current) {
          engaged.current = false;
          x.set(0);
          y.set(0);
          demote(el);
        }
        return;
      }

      if (!engaged.current) {
        engaged.current = true;
        promote(el);
      }

      const falloff = 1 - gap / radius;
      x.set(clamp(dx / (r.width / 2), -1, 1) * strength * falloff);
      y.set(clamp(dy / (r.height / 2), -1, 1) * strength * falloff);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (frame.current !== null) return;
      frame.current = requestAnimationFrame(() => {
        frame.current = null;
        apply(event.clientX, event.clientY);
      });
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure, { passive: true });

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      frame.current = null;
      engaged.current = false;
      demote(el);
      x.set(0);
      y.set(0);
    };
  }, [active, measure, radius, strength, x, y]);

  return (
    <motion.div
      ref={ref}
      className={cn("inline-flex", className)}
      style={active ? { x: springX, y: springY } : undefined}
    >
      {children}
    </motion.div>
  );
}

export default MagneticButton;
