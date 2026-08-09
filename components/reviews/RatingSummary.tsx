"use client";

import { motion, useInView, useMotionValue, useSpring } from "framer-motion";
import { Star } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { DUR, IN_VIEW, useReducedMotion } from "@/lib/motion";
import { getSupabase, supabaseConfigured } from "@/lib/supabase";
import { cn } from "@/lib/utils";

/**
 * The "4.6 ★★★★★ (128 Reviews)" line, sourced from the `review_stats` view
 * (docs/SUPABASE_SCHEMA.sql) rather than aggregating client-side — one cheap
 * request instead of pulling every row to average it.
 *
 * `refreshKey` is bumped by the parent after a successful submit so this
 * refetches without the two components needing to share a store.
 */
export type RatingSummaryProps = {
  target: string;
  refreshKey: number;
};

type Stats = { average: number; count: number };

function CountUp({ to, decimals = 0 }: { to: number; decimals?: number }) {
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
      if (ref.current) ref.current.textContent = v.toFixed(decimals);
    });
  }, [spring, decimals, reduced]);

  return <span ref={ref}>{reduced ? to.toFixed(decimals) : (0).toFixed(decimals)}</span>;
}

export function RatingSummary({ target, refreshKey }: RatingSummaryProps) {
  const [stats, setStats] = useState<Stats | null>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!supabaseConfigured) return;
    let cancelled = false;

    getSupabase()
      .from("review_stats")
      .select("average_rating, review_count")
      .eq("target", target)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        setStats({
          average: data?.average_rating ?? 0,
          count: data?.review_count ?? 0,
        });
      });

    return () => {
      cancelled = true;
    };
  }, [target, refreshKey]);

  // Nothing to summarise yet — the form is the whole story until review #1.
  if (!supabaseConfigured || !stats || stats.count === 0) return null;

  const filled = Math.round(stats.average);

  return (
    <motion.div
      data-reveal=""
      className="flex items-center gap-4"
      initial={reduced ? { opacity: 1 } : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: IN_VIEW.once, amount: IN_VIEW.amount, margin: IN_VIEW.margin }}
      transition={{ duration: reduced ? 0 : DUR.base }}
    >
      <span className="font-display text-display-md text-gold tabular-nums">
        <CountUp to={stats.average} decimals={1} />
      </span>
      <div className="flex flex-col gap-1">
        <div className="flex gap-0.5" aria-hidden="true">
          {[1, 2, 3, 4, 5].map((n) => (
            <Star
              key={n}
              className={cn(
                "size-4",
                n <= filled ? "fill-gold-bright text-gold-bright" : "fill-transparent text-mid",
              )}
            />
          ))}
        </div>
        <span className="text-mid text-body-sm tabular-nums">
          (<CountUp to={stats.count} /> {stats.count === 1 ? "Review" : "Reviews"})
        </span>
      </div>
    </motion.div>
  );
}

export default RatingSummary;
