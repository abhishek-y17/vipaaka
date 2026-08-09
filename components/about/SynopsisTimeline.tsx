"use client";

import Image from "next/image";
import { useRef } from "react";

import { Reveal } from "@/components/motion/Reveal";
import { storyBeats } from "@/content/film";
import { stills } from "@/content/stills";
import { loadGsap } from "@/lib/gsap";
import {
  SCRUB,
  STAGGER,
  demote,
  promote,
  useIsomorphicLayoutEffect,
  useReducedMotion,
} from "@/lib/motion";

/**
 * Synopsis — a section on About, not a route (CLAUDE.md §0 scope cuts).
 *
 * A centred vertical spine whose gold fill tracks scroll position, with beats
 * alternating left and right. The fill is GSAP because it is scroll-scrubbed;
 * the beats are `Reveal` because they are threshold entrances. Same split as
 * everywhere else — never both libraries on one element.
 */
export function SynopsisTimeline() {
  const scope = useRef<HTMLDivElement>(null);
  const fill = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useIsomorphicLayoutEffect(() => {
    const scopeEl = scope.current;
    const fillEl = fill.current;
    if (reduced || !scopeEl || !fillEl) return;

    // Loaded on demand — see lib/gsap.ts. The spine renders at scaleY(0) from
    // the inline style below, which is exactly where the animation starts, so
    // there is nothing to see while the library is in flight.
    let cancelled = false;
    let ctx: gsap.Context | undefined;

    void loadGsap().then(({ gsap }) => {
      if (cancelled) return;
      ctx = gsap.context(() => {
        gsap.fromTo(
          fillEl,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: {
              trigger: scopeEl,
              start: "top 75%",
              end: "bottom 60%",
              scrub: SCRUB,
              onToggle: ({ isActive }) =>
                isActive ? promote(fillEl) : demote(fillEl),
            },
          },
        );
      }, scopeEl);
    });

    return () => {
      cancelled = true;
      ctx?.revert();
      demote(fillEl);
    };
  }, [reduced]);

  return (
    <div ref={scope} className="relative mx-auto max-w-4xl">
      {/* The spine. Track always visible; gold fill scrubs with scroll.
          Left-aligned on mobile, centred from sm up. */}
      <div
        aria-hidden="true"
        className="absolute inset-y-0 left-[7px] w-px bg-white/10 sm:left-1/2 sm:-translate-x-1/2"
      >
        <div
          ref={fill}
          className="from-gold to-gold-bright h-full w-full origin-top bg-gradient-to-b"
          style={reduced ? undefined : { transform: "scaleY(0)" }}
        />
      </div>

      <ol className="space-y-14 sm:space-y-20">
        {storyBeats.map((beat, i) => {
          const right = i % 2 === 1;
          return (
            <li key={beat.id} className="relative">
              {/* Node on the spine. */}
              <span
                aria-hidden="true"
                className="bg-gold absolute top-2 left-[3px] size-2.5 rotate-45 sm:left-1/2 sm:-translate-x-1/2"
              />
              <Reveal
                delay={i * STAGGER.children}
                direction={right ? "left" : "right"}
                className={
                  right
                    ? "pl-8 sm:ml-[52%] sm:pl-0"
                    : "pl-8 sm:mr-[52%] sm:pl-0 sm:text-right"
                }
              >
                <p className="font-eyebrow text-eyebrow-sm text-gold-bright uppercase">
                  {beat.index}
                </p>
                <h3 className="font-display text-display-sm text-hi mt-3 uppercase">
                  {beat.title}
                </h3>
                <p className="text-mid text-body-sm mt-3">{beat.body}</p>

                {beat.image ? (
                  <figure className="border-gold-dim/50 mt-5 overflow-hidden rounded-lg border">
                    <Image
                      src={stills[beat.image].src}
                      alt={stills[beat.image].alt}
                      width={stills[beat.image].width}
                      height={stills[beat.image].height}
                      placeholder="blur"
                      blurDataURL={stills[beat.image].blurDataURL}
                      sizes="(max-width: 640px) calc(100vw - 3.5rem), 430px"
                      className="h-auto w-full"
                    />
                  </figure>
                ) : null}
              </Reveal>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export default SynopsisTimeline;
