"use client";

import { Clapperboard, Clock, Globe, CalendarDays } from "lucide-react";
import { motion, useInView, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useRef } from "react";

import { film } from "@/content/film";
import { DUR, IN_VIEW, useReducedMotion } from "@/lib/motion";

/**
 * Genre / Runtime / Language / Release Year.
 *
 * Desktop: four columns with gold vertical dividers.
 * Mobile: four stacked rows, icon-left / value-right — a distinct layout from
 * the mobile mockup, not a squeezed grid (CLAUDE.md §2 rule 5).
 *
 * Numbers count up on scroll-in. Only the two numeric fields animate; "Drama"
 * and "Kannada" have nothing to count, so they just reveal.
 */

// DECISION: runtime/year count up, genre/language don't — counting a string is
// meaningless, and faking it with a scramble effect would be noise.
const ITEMS = [
  { icon: Clapperboard, label: "Genre", value: film.genre, numeric: null },
  { icon: Clock, label: "Runtime", value: film.runtime, numeric: film.runtimeMinutes || null, suffix: " mins" },
  { icon: Globe, label: "Language", value: film.language, numeric: null },
  { icon: CalendarDays, label: "Release Year", value: String(film.releaseYear), numeric: film.releaseYear, suffix: "" },
] as const;

function CountUp({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  const inView = useInView(ref, { once: IN_VIEW.once, amount: IN_VIEW.amount });
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { duration: DUR.slow * 1000, bounce: 0 });

  useEffect(() => {
    if (inView) mv.set(to);
  }, [inView, mv, to]);

  useEffect(() => {
    if (reduced) return;
    return spring.on("change", (v) => {
      if (ref.current) ref.current.textContent = `${Math.round(v)}${suffix}`;
    });
  }, [spring, suffix, reduced]);

  // Reduced motion: the final value is simply present, no counting.
  return <span ref={ref}>{reduced ? `${to}${suffix}` : `0${suffix}`}</span>;
}

export function InfoStrip() {
  const reduced = useReducedMotion();

  return (
    <motion.div
      data-reveal=""
      className="glass rounded-lg"
      initial={reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: IN_VIEW.once, amount: IN_VIEW.amount, margin: IN_VIEW.margin }}
      transition={{ duration: reduced ? 0 : DUR.base }}
    >
      {/* Mobile: stacked rows. Desktop: four columns with gold dividers. */}
      <ul className="divide-gold-dim/25 sm:divide-gold-dim/25 divide-y sm:grid sm:grid-cols-4 sm:divide-x sm:divide-y-0">
        {ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <li
              key={item.label}
              className="flex items-center gap-4 px-5 py-4 sm:flex-col sm:gap-2 sm:px-4 sm:py-6 sm:text-center"
            >
              <Icon
                className="text-gold size-5 shrink-0"
                strokeWidth={1.5}
                aria-hidden="true"
              />
              <span className="font-eyebrow text-eyebrow-sm text-mid uppercase sm:mt-1">
                {item.label}
              </span>
              <span className="text-hi text-body-sm ml-auto sm:ml-0">
                {item.numeric ? (
                  <CountUp to={item.numeric} suffix={item.suffix ?? ""} />
                ) : (
                  item.value
                )}
              </span>
            </li>
          );
        })}
      </ul>
    </motion.div>
  );
}

export default InfoStrip;
