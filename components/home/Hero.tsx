"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";

import { Parallax } from "@/components/motion/Parallax";
import { plate } from "@/content/brand";
import { film } from "@/content/film";
import { registerGsap } from "@/lib/gsap";
import {
  DISTANCE,
  DUR,
  PARALLAX_SPEED,
  SCRUB,
  STAGGER,
  demote,
  ease,
  motionDuration,
  promote,
  useIsomorphicLayoutEffect,
  useReducedMotion,
} from "@/lib/motion";

/**
 * The Landing hero. Full-bleed key art, a four-beat title sequence, and a
 * scroll-scrub that parallaxes the image while the title scales up and fades.
 *
 * ── Why `wordmark` is a prop, not an import ─────────────────────────────────
 * `VipakaWordmark` is a server component — it reads the SVG off disk at
 * module scope via `node:fs`. A "use client" file cannot import and render a
 * server component directly; Next would try to bundle `node:fs` for the
 * browser and fail. `app/page.tsx` (a server component) renders the mark and
 * passes it down, the same pattern `Preloader` already uses for the same
 * reason.
 *
 * ── The backdrop is `plate`, not `banner` ───────────────────────────────────
 * `vipaka-banner.png` turned out to be a fully composed poster — its own
 * wordmark, its own subtitle, its own eyebrow — not a plain backdrop. Laying
 * this component's live type sequence over it double-exposed both, and its
 * baked eyebrow read "A DATADORKS FILM" while `content/film.ts` said
 * "A DATADORKS PRODUCTION" — the mockup's wording, not the confirmed one.
 * `plate` is the same key art with that baked text removed by masked
 * reconstruction (see the TODO in `content/brand.ts`); `banner` now serves
 * only the OG image, where a fully composed poster is exactly right.
 *
 * ── LCP: what is and is not allowed to gate the image ───────────────────────
 * The hero image is the LCP candidate — full-bleed, above everything else at
 * first paint. Two rules follow from that, both load-bearing:
 *
 *   1. The image never has a Framer `initial={{ opacity: 0 }}`. Only the TEXT
 *      block gets the staggered entrance; the image is visible the instant it
 *      decodes, full stop. An opacity-0-then-fade-in on the image itself would
 *      make LCP wait on React hydration and a `--dur-cinema` transition before
 *      the "largest paint" the browser can point to even exists.
 *   2. The ambient scale is a plain CSS animation (`animate-ambient-scale`,
 *      defined once in globals.css), not a Framer/GSAP-driven one. CSS
 *      animations run on the compositor from the first frame with no JS
 *      dependency — the image paints at `scale(1)` immediately whether or not
 *      React has hydrated yet, and the animation is simply already running by
 *      the time anyone would notice.
 *
 * ── Two transform systems, two elements ─────────────────────────────────────
 * The image needs two independent motions: GSAP's scroll-scrubbed parallax
 * (`translateY`, via `Parallax`) and the CSS ambient scale (`scale`). Both are
 * `transform`. Putting both on one element means the later write wins and the
 * other is silently dropped — GSAP sets `transform` via inline style on
 * `Parallax`'s own layer div; the ambient-scale class lives on the `<Image>`
 * nested inside it. Two elements, two independent `transform`s, and the
 * browser composites them together exactly as you'd expect from nested
 * transformed boxes.
 *
 * ── The vignette is not inside the parallax layer ───────────────────────────
 * "So type always has contrast regardless of what image sits behind it later"
 * means the contrast guarantee cannot travel with the image. The vignette and
 * the bottom gradient are siblings of `Parallax`, not children of it — fixed
 * to the hero's own box, never translated.
 *
 * ── The title's scale/fade is GSAP, not Framer ──────────────────────────────
 * "Scales to 1.08 and fades as you scroll past it" is continuous, driven by
 * scroll position — a scrub, not a threshold. Framer's `whileInView` is a
 * binary flip; it cannot express this. The title block gets its own
 * `ScrollTrigger`, separate from `Parallax`'s (different trigger, different
 * shape of motion), following the same promote-on-activate /
 * demote-on-deactivate discipline as `Parallax` itself.
 */

export type HeroProps = {
  wordmark: React.ReactNode;
};

export function Hero({ wordmark }: HeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useIsomorphicLayoutEffect(() => {
    const section = sectionRef.current;
    const title = titleRef.current;
    if (reduced || !section || !title) return;

    const gsap = registerGsap();

    const ctx = gsap.context(() => {
      gsap.fromTo(
        title,
        { scale: 1, opacity: 1 },
        {
          scale: 1.08,
          opacity: 0,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "bottom top",
            scrub: SCRUB,
            onToggle: ({ isActive }) =>
              isActive ? promote(title) : demote(title),
          },
        },
      );
    }, section);

    return () => {
      ctx.revert();
      demote(title);
    };
  }, [reduced]);

  const seq = (beat: number) => ({
    initial: reduced
      ? { opacity: 1, y: 0 }
      : { opacity: 0, y: DISTANCE.reveal },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: motionDuration(DUR.slow, reduced),
      delay: motionDuration(STAGGER.sequence * beat, reduced),
      ease: ease("cinema"),
    },
  });

  return (
    <section
      ref={sectionRef}
      className="relative h-dvh min-h-[640px] w-full overflow-hidden"
    >
      <Parallax className="absolute inset-0" speed={PARALLAX_SPEED}>
        <Image
          src={plate.src}
          alt={plate.alt}
          fill
          priority
          placeholder="blur"
          blurDataURL={plate.blurDataURL}
          sizes="100vw"
          quality={68}
          className="motion-safe:animate-ambient-scale object-cover"
        />
      </Parallax>

      {/* Vignette + gradient-to-black. Fixed to the hero's own box — see the
          note above on why this cannot live inside the parallax layer. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 38%, transparent 40%, rgb(3 3 4 / 0.55) 100%)",
        }}
      />
      <div
        aria-hidden="true"
        className="from-void via-void/70 pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t to-transparent"
      />

      <div
        ref={titleRef}
        className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center"
      >
        <motion.p
          className="font-eyebrow text-eyebrow text-hi uppercase"
          {...seq(0)}
        >
          {film.heroEyebrow}
        </motion.p>

        <motion.div className="mt-8 w-[220px] sm:w-[300px] md:w-[380px]" {...seq(1)}>
          {wordmark}
        </motion.div>

        <motion.p
          className="font-display text-display-sm text-hi mt-6 uppercase"
          {...seq(2)}
        >
          — {film.subtitle}
        </motion.p>

        <motion.p
          className="text-gold-bright font-display text-display-sm mt-10 tracking-[0.3em]"
          {...seq(3)}
        >
          {film.releaseDateDisplay}
        </motion.p>
      </div>

      <ScrollCue />
    </section>
  );
}

/** Thin gold line, pulsing downward. Decorative — always aria-hidden. */
function ScrollCue() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-x-0 bottom-8 z-10 flex justify-center"
    >
      <span className="motion-safe:animate-scroll-cue from-gold block h-10 w-px bg-gradient-to-b to-transparent" />
    </div>
  );
}

export default Hero;
