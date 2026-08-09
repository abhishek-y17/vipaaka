import type { Metadata } from "next";
import Image from "next/image";

import { InfoStrip } from "@/components/about/InfoStrip";
import { SynopsisTimeline } from "@/components/about/SynopsisTimeline";
import { GoldRule } from "@/components/motion/GoldRule";
import { Parallax } from "@/components/motion/Parallax";
import { Reveal } from "@/components/motion/Reveal";
import { SplitText } from "@/components/motion/SplitText";
import { plate } from "@/content/brand";
import { film } from "@/content/film";
import { stills } from "@/content/stills";
import { OG_IMAGES, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "About",
  description: `${film.logline} Story summary, synopsis and production detail for ${film.title} — ${film.subtitle}.`,
  path: "/about",
  // A production still, not the key art: this page's preview should look like
  // the film rather than like the poster every other route already shares.
  image: OG_IMAGES.about,
});

/**
 * About, with Synopsis as a section rather than its own route
 * (CLAUDE.md §0 scope cuts).
 *
 * Two production stills land here, both framed and hairlined, neither
 * full-bleed. The header band keeps `plate`: the stills are warm amber and a
 * scrim under a Cinzel title turns that to mud — see content/stills.ts.
 */
export default function AboutPage() {
  return (
    <main>
      {/* ---- Header band ------------------------------------------------ */}
      <section className="relative flex h-[52vh] min-h-[380px] items-center justify-center overflow-hidden">
        <Parallax className="absolute inset-0">
          <Image
            src={plate.src}
            alt=""
            fill
            priority
            placeholder="blur"
            blurDataURL={plate.blurDataURL}
            sizes="100vw"
            quality={68}
            className="object-cover opacity-70"
          />
        </Parallax>
        <div
          aria-hidden="true"
          className="from-void via-void/60 pointer-events-none absolute inset-0 bg-gradient-to-t to-transparent"
        />

        <div className="relative z-10 px-6 text-center">
          <SplitText
            as="h1"
            text="About the Film"
            trim={0.16}
            trigger="mount"
            className="font-display text-display-lg text-hi uppercase"
          />
          <Reveal delay={0.25}>
            <p className="font-eyebrow text-eyebrow text-hi mt-5 uppercase">
              A Story Worth Telling
            </p>
          </Reveal>
        </div>
      </section>

      {/* ---- Two-column: still + copy ------------------------------------ */}
      <section className="mx-auto max-w-6xl px-6 py-20 sm:px-10 sm:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          {/* // DECISION: not wrapped in `Reveal` — Lighthouse identified this
              as the page's actual LCP element (it's taller than the header
              band's image once laid out in the two-column grid), so it gets
              the same treatment Hero.tsx documents for its own backdrop:
              never an opacity-0 initial state, because that makes LCP wait
              on hydration plus a transition before the "largest paint" can
              even exist. */}
          {/* `border-gold-dim/50` rather than the usual white hairline: a
              translucent white edge disappears into the still's own warm
              highlights, and the point of the frame is to hold the image off
              the void. Gold at 50% reads as a deliberate edge against amber
              without becoming an accent in its own right. */}
          <div className="border-gold-dim/50 overflow-hidden rounded-lg border">
            <Image
              src={stills.stairwell.src}
              alt={stills.stairwell.alt}
              width={stills.stairwell.width}
              height={stills.stairwell.height}
              priority
              placeholder="blur"
              blurDataURL={stills.stairwell.blurDataURL}
              // Measured, not assumed: at 1440 this column renders 502px, not
              // the 720 that `50vw` claims. The container is max-w-6xl minus
              // px-10 minus a gap-16, halved — so the declared size is a
              // constant, and the browser stops fetching a size larger than
              // the slot can ever be.
              sizes="(max-width: 640px) calc(100vw - 3rem), (max-width: 1024px) calc(100vw - 5rem), 504px"
              className="h-full w-full object-cover"
            />
          </div>

          <div>
            <Reveal>
              <h2 className="font-display text-display-md text-gold uppercase">
                About the Film
              </h2>
            </Reveal>
            <GoldRule className="mt-5" />
            <Reveal delay={0.1}>
              <p className="text-mid text-body-lg mt-7">{film.logline}</p>
            </Reveal>
            <Reveal delay={0.16}>
              <div className="mt-8">
                <InfoStrip />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---- Story summary ----------------------------------------------- */}
      <section className="mx-auto max-w-4xl px-6 pb-20 sm:px-10 sm:pb-24">
        <Reveal>
          <h2 className="font-display text-display-md text-gold uppercase">
            Story Summary
          </h2>
        </Reveal>
        <GoldRule className="mt-5" />
        <div className="mt-7 space-y-5">
          {film.summary.map((para, i) => (
            <Reveal key={para.slice(0, 24)} delay={0.08 * (i + 1)}>
              <p className="text-mid text-body-lg">{para}</p>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.24}>
          <figure className="border-gold-dim/50 mt-10 overflow-hidden rounded-lg border">
            <Image
              src={stills.restaurant.src}
              alt={stills.restaurant.alt}
              width={stills.restaurant.width}
              height={stills.restaurant.height}
              placeholder="blur"
              blurDataURL={stills.restaurant.blurDataURL}
              // max-w-4xl (896) less px-10 either side = 816, measured 814.
              sizes="(max-width: 640px) calc(100vw - 3rem), (max-width: 896px) calc(100vw - 5rem), 816px"
              className="h-auto w-full"
            />
          </figure>
        </Reveal>
      </section>

      {/* ---- Pull quote --------------------------------------------------- */}
      <section className="mx-auto max-w-4xl px-6 pb-24 sm:px-10">
        <Reveal>
          <figure className="glass relative rounded-lg px-8 py-12 text-center sm:px-14">
            <span
              aria-hidden="true"
              className="text-gold font-display absolute top-3 left-6 text-[4rem] leading-none opacity-60 select-none sm:text-[5rem]"
            >
              &ldquo;
            </span>
            <blockquote className="font-display text-display-sm text-hi relative italic">
              {film.pullQuote}
            </blockquote>
            <div className="mt-6 flex justify-center">
              <GoldRule variant="center" width={180} />
            </div>
          </figure>
        </Reveal>
      </section>

      {/* ---- Synopsis, as a section --------------------------------------- */}
      <section className="border-hairline border-t px-6 py-20 sm:px-10 sm:py-28">
        <div className="mx-auto max-w-4xl text-center">
          <SplitText
            as="h2"
            text="Synopsis"
            trim={0.18}
            className="font-display text-display-md text-hi uppercase"
          />
          <Reveal delay={0.1}>
            <p className="font-eyebrow text-eyebrow-sm text-mid mt-4 uppercase">
              Spoiler free
            </p>
          </Reveal>
          <div className="mt-6 flex justify-center">
            <GoldRule variant="center" width={180} />
          </div>
        </div>

        <div className="mt-16 sm:mt-20">
          <SynopsisTimeline />
        </div>
      </section>
    </main>
  );
}
