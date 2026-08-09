"use client";

import { useEffect, useState } from "react";

import { RELEASE_AT } from "@/content/film";
import { useReducedMotion } from "@/lib/motion";

/**
 * Counts down to `RELEASE_AT` — the one constant that also gates the review
 * form, so the two can never disagree about whether the film is out.
 *
 * Sits in the strip below the player frame, where the control bar lives once
 * a video exists. Cinzel numerals in gold, Bebas labels in white: the About
 * info strip's language, because this is the same kind of thing — a value
 * with a name under it.
 *
 * Units change as the wait shrinks. Days/Hours/Minutes reads as "a while
 * away"; inside the last day that is useless and it becomes
 * Hours/Minutes/Seconds. Past the date it stops counting entirely and says so
 * — a countdown that has reached zero and keeps rendering three zeroes, or
 * worse counts negative, is the most obviously broken thing a release page
 * can do.
 */

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

type Remaining = {
  total: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function remainingFrom(now: number): Remaining {
  const total = Math.max(0, RELEASE_AT.getTime() - now);
  return {
    total,
    days: Math.floor(total / DAY),
    hours: Math.floor((total % DAY) / HOUR),
    minutes: Math.floor((total % HOUR) / MINUTE),
    seconds: Math.floor((total % MINUTE) / SECOND),
  };
}

function Unit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="font-display text-display-sm text-gold tabular-nums">
        {String(value).padStart(2, "0")}
      </span>
      <span className="font-eyebrow text-eyebrow-sm text-hi uppercase">{label}</span>
    </div>
  );
}

export function ReleaseCountdown() {
  const reduced = useReducedMotion();
  /**
   * `null` until mounted, not "now" — the server has a different clock to the
   * visitor and rendering a real figure on both sides guarantees a hydration
   * mismatch on a value that changes every second by definition.
   */
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const left = RELEASE_AT.getTime() - Date.now();
    // Reduced motion means no ticking digits — the seconds column is the part
    // that reads as animation. It still updates, just once a minute, so the
    // page is never wrong for long without ever being in visible motion.
    const step = reduced ? MINUTE : left < DAY ? SECOND : MINUTE;
    const id = window.setInterval(() => setNow(Date.now()), step);
    return () => window.clearInterval(id);
  }, [reduced]);

  if (now === null) return null;

  const r = remainingFrom(now);

  // Past the date with no film to show yet. Never a zeroed or negative clock.
  if (r.total <= 0) {
    return (
      <p className="font-eyebrow text-eyebrow text-gold text-center uppercase">
        Out now
      </p>
    );
  }

  const finalDay = r.total < DAY;

  return (
    <div className="flex items-start justify-center gap-8 sm:gap-12">
      {finalDay ? (
        <>
          <Unit value={r.hours} label="Hours" />
          <Unit value={r.minutes} label="Minutes" />
          <Unit value={r.seconds} label="Seconds" />
        </>
      ) : (
        <>
          <Unit value={r.days} label="Days" />
          <Unit value={r.hours} label="Hours" />
          <Unit value={r.minutes} label="Minutes" />
        </>
      )}
    </div>
  );
}

export default ReleaseCountdown;
