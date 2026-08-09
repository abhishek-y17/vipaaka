"use client";

import { Star } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

/**
 * 5 gold stars. Hover fills L->R because a star is filled whenever its index
 * is <= the hovered (or, with no hover, the selected) index — no separate
 * "sweep" animation needed. The hovered star itself pops via a hover scale.
 * Tap-to-rate on mobile falls out of the same onClick; there is no separate
 * touch path. // DECISION: kept to CSS transitions only, no Framer/GSAP — a
 * hover micro-interaction on 5 buttons doesn't earn a JS animation driver,
 * and this is the 20-minute box.
 */
export type StarRatingProps = {
  value: number;
  onChange: (value: number) => void;
  size?: "sm" | "lg";
  disabled?: boolean;
};

const SIZE = { sm: "size-4", lg: "size-7" } as const;

export function StarRating({ value, onChange, size = "lg", disabled = false }: StarRatingProps) {
  const [hover, setHover] = useState<number | null>(null);
  const shown = hover ?? value;

  return (
    <div
      role="radiogroup"
      aria-label="Rating, 1 to 5 stars"
      className="flex items-center gap-1"
      onPointerLeave={() => setHover(null)}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} star${n === 1 ? "" : "s"}`}
          disabled={disabled}
          onPointerEnter={() => setHover(n)}
          onFocus={() => setHover(n)}
          onBlur={() => setHover(null)}
          onClick={() => onChange(n)}
          className="ease-snap dur-fast rounded-xs transition-transform hover:scale-110 focus-visible:scale-110 disabled:pointer-events-none disabled:opacity-50"
        >
          <Star
            className={cn(
              SIZE[size],
              "ease-snap dur-fast transition-colors",
              n <= shown ? "fill-gold-bright text-gold-bright" : "fill-transparent text-mid",
            )}
          />
        </button>
      ))}
    </div>
  );
}

export default StarRating;
