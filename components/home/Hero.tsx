"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";

import { Parallax } from "@/components/motion/Parallax";
import { plate } from "@/content/brand";
import { film } from "@/content/film";
import { loadGsap } from "@/lib/gsap";
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

    // Loaded on demand — see lib/gsap.ts. This is the strongest case for it
    // on the site: the hero's LCP rules above go to some length to keep the
    // image off React's critical path, and then 111 kB of scroll library was
    // sitting in the same route chunk that has to parse before hydration.
    // The title's start state (`scale: 1, opacity: 1`) is what it already
    // renders as, so nothing moves until the visitor scrolls anyway.
    let cancelled = false;
    let ctx: gsap.Context | undefined;

    void loadGsap().then(({ gsap }) => {
      if (cancelled) return;
      ctx = gsap.context(() => {
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
    });

    return () => {
      cancelled = true;
      ctx?.revert();
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
          /**
           * NOT `100vw`, even though the image is full-bleed.
           *
           * `sizes` declares the image's LAID-OUT width, and under
           * `object-cover` that is not the width of the box. The plate is
           * 2.5:1; a phone is roughly 1:2. Covering a portrait box means
           * scaling to its HEIGHT and cropping the sides, so the laid-out
           * width is `viewportHeight × 2.5` — about 2100 CSS px on a 390×844
           * phone, of which only 391 is visible.
           *
           * Declaring `100vw` therefore under-requested by roughly 5×.
           * Measured on a 390px DPR-3 viewport: the browser picked the 1200w
           * candidate, so ~222 source pixels were being stretched across 1173
           * device pixels. The hero — the first thing anyone sees — was soft
           * on every phone.
           *
           * The laid-out width always exceeds the viewport here, and the
           * master is 1983px, so the honest declaration is simply "as much as
           * the source has". The optimiser caps at the source width, so this
           * costs ~13 kB instead of ~3 kB and cannot over-fetch.
           */
          sizes="2048px"
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

        {/* The subtitle lives INSIDE the wordmark's box so it can right-align
            to the logotype's own right edge, the way the key art sets it —
            rather than centring on the page and ending up wider than the mark
            it belongs to. Sized well below the wordmark for the same reason:
            it is a qualifier, not a second title.

            // DECISION: the reference art runs the subtitle at roughly a
            // third of the wordmark's width. That ratio is only reachable on
            // a wide banner — at the 220px mobile wordmark a third would be
            // ~4.5px type. These sizes hold it near half instead, which keeps
            // the subordinate relationship at every breakpoint without going
            // under a legible size. */}
        <motion.div className="mt-8 w-[220px] sm:w-[300px] md:w-[380px]" {...seq(1)}>
          {wordmark}

          <motion.p
            className="font-display text-hi mt-3 text-right text-[0.5rem] tracking-[0.3em] whitespace-nowrap uppercase sm:mt-4 sm:text-[0.625rem] md:text-[0.75rem]"
            {...seq(2)}
          >
            — {film.subtitle}
          </motion.p>
        </motion.div>

        <motion.p
          className="text-gold-bright font-display text-display-sm mt-10 tracking-[0.3em]"
          {...seq(3)}
        >
          {film.releaseDateDisplay}
        </motion.p>

        {/* Gita 4.17 — the last beat of the hero sequence, arriving once the
            title, date and everything above it have settled. `seq(4)` is one
            `STAGGER.sequence` (200ms) after the date by construction, so the
            timing is a token rather than a hand-typed delay.

            The quote marks are the About pull-quote's treatment: Cinzel,
            oversized, gold, held back to 60% so they frame the line rather
            than competing with it. They are `aria-hidden` and the real
            quotation lives in a `<blockquote>`, so a screen reader gets the
            verse once and not a pair of stray punctuation marks.

            Width is set in `ch`, not with hard breaks — a `<br>` that lands
            beautifully at 1440 snaps in the wrong place at 390. This wraps to
            roughly three lines on desktop and four on a phone, on its own. */}
        <motion.figure
          className="relative mt-10 max-w-[34ch] px-8 sm:mt-12 sm:px-10"
          {...seq(4)}
        >
          <span
            aria-hidden="true"
            className="text-gold font-display absolute top-0 left-0 text-[3rem] leading-none opacity-60 select-none sm:text-[4rem]"
          >
            &ldquo;
          </span>
          <blockquote className="text-mid text-body-sm relative leading-[2] italic sm:text-[0.9375rem]">
            {film.heroVerse.text}
          </blockquote>
          {/* `translate-y` is doing real work here, not nudging.

              Both curly quote glyphs sit near the TOP of their em box — the
              ink centre lands about 0.22em down, not at 0.5em. The opening
              mark is therefore correct for free: at `top-0` its ink falls
              exactly on line one's centre, measured 594 against 594.

              The closing mark gets no such luck. At `bottom-0` the BOX bottom
              aligns with the text, which puts the ink a full box-height up —
              two lines at this size — leaving it stranded beside line three
              while the sentence finished below it.

              Aligning the box centre is not enough either; that was the first
              attempt and it still read as line three, because a centred box
              still has its ink 0.28em high. 0.5em is what puts the *ink* on
              the last line's centre, and being in `em` it holds at both the
              3rem and 4rem steps without a second hand-tuned value. */}
          <span
            aria-hidden="true"
            className="text-gold font-display absolute right-0 bottom-0 translate-y-[0.5em] text-[3rem] leading-none opacity-60 select-none sm:text-[4rem]"
          >
            &rdquo;
          </span>
        </motion.figure>
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
