"use client";

import { ArrowLeft, Clapperboard, Heart, MessageSquare } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { FilmStage } from "@/components/film/FilmStage";
import { HeadphonePrompt } from "@/components/film/HeadphonePrompt";
import { GoldRule } from "@/components/motion/GoldRule";
import { Reveal } from "@/components/motion/Reveal";
import { feature } from "@/content/trailers";
import { RELEASE_AT, film } from "@/content/film";
import { useIsomorphicLayoutEffect } from "@/lib/motion";

/**
 * The review UI, and through it the entire Supabase client, is code-split out
 * of the page bundle and fetched only when the review section is actually
 * approached.
 *
 * The saving is not theoretical. Reviews are locked until 15 August, so these
 * three components currently render nothing at all — but a static import puts
 * them in the route chunk regardless, so every visitor was downloading and
 * parsing an auth-capable database client to look at a poster. `ssr: false`
 * because none of it renders on the server anyway: each one fetches on mount.
 */
const RatingSummary = dynamic(
  () => import("@/components/reviews/RatingSummary").then((m) => m.RatingSummary),
  { ssr: false },
);
const ReviewForm = dynamic(
  () => import("@/components/reviews/ReviewForm").then((m) => m.ReviewForm),
  { ssr: false },
);
const ReviewList = dynamic(
  () => import("@/components/reviews/ReviewList").then((m) => m.ReviewList),
  { ssr: false },
);

/** Every review on this page is for the feature; nothing else is rated yet. */
const REVIEW_TARGET = "film";

/**
 * True once the element has come within a screen of the viewport. Used to
 * delay the review chunk's network request until it is nearly needed —
 * `rootMargin` buys roughly one screen of runway so the fetch overlaps the
 * scroll rather than interrupting it. Fires once and disconnects; this never
 * needs to become false again.
 */
function useNearViewport<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || near) return;
    // No IntersectionObserver (very old browsers, some crawlers): load
    // immediately rather than never.
    if (typeof IntersectionObserver === "undefined") {
      setNear(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: "100% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [near]);

  return { ref, near };
}

/**
 * Player (or poster + countdown), title bar with a back arrow above it,
 * reviews, then the three-up strip.
 */
export default function FilmPage() {
  // Bumped after a successful submit so RatingSummary/ReviewList refetch
  // without the three components needing a shared store (RAPID §0: no new
  // abstractions for something used once, on one page).
  const [refreshKey, setRefreshKey] = useState(0);

  /**
   * Reviews open when the film does — the same `RELEASE_AT` the countdown
   * uses, so the clock on the page and the state of the form can never
   * disagree.
   *
   * This is presentation only. The enforcement is the insert policy, which
   * carries the same instant and returns `42501 new row violates row-level
   * security policy` to anything that tries early — including a hand-rolled
   * fetch from the console. Treating this check as the control would be
   * exactly the mistake the schema header warns about.
   *
   * Starts `true` and is corrected on the client, rather than being read
   * straight from `Date.now()` during render. Two reasons, and the first is
   * a bug this shape actually had:
   *
   *   1. This route is statically prerendered. `Date.now()` in the render
   *      body is evaluated at BUILD time, so `locked: true` would be baked
   *      into the HTML and the page would still be locked on the 16th —
   *      unlocking only on the next deploy. Caught by driving the page with
   *      a faked clock: React threw hydration error #418 because the built
   *      HTML said locked and the client said open.
   *   2. Seeding from the real clock on the client while the server sends
   *      build-time HTML is the same mismatch by another route. Starting
   *      from a constant makes the first client render identical to the
   *      server's by construction, and the correction lands in a layout
   *      effect — before paint, so there is no visible flash of the lock.
   *
   * Read once on mount, never on a timer: the lock lifts on the next page
   * load after the timestamp, never mid-session. A form that materialises
   * under someone at midnight is a worse surprise than one they refresh into.
   */
  const [locked, setLocked] = useState(true);
  useIsomorphicLayoutEffect(() => {
    setLocked(Date.now() < RELEASE_AT.getTime());
  }, []);

  const { ref: reviewsRef, near: nearReviews } = useNearViewport<HTMLDivElement>();

  return (
    <main className="pt-(--nav-h)">
      <div className="mx-auto max-w-5xl px-6 py-10 sm:px-10">
        <Reveal>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              aria-label="Back to Home"
              className="text-mid hover:text-hi ease-cinema dur-fast flex size-9 items-center justify-center transition-colors"
            >
              <ArrowLeft className="size-5" aria-hidden="true" />
            </Link>
            <span className="font-display text-body-lg text-hi">
              {film.title} — {film.subtitle}
            </span>
          </div>
        </Reveal>

        {/* /film only, and mounted here rather than in the layout so it can
            never leak onto another route. Its "seen" flag is localStorage —
            it makes no Supabase call and creates no anonymous session. */}
        <HeadphonePrompt
          onOpen={() => {
            // Pause anything already playing underneath. postMessage rather
            // than an imperative ref because the player may not be mounted at
            // all before release, and a ref threaded through FilmStage would
            // be null on exactly the days this runs most.
            document
              .querySelectorAll<HTMLIFrameElement>('iframe[src*="youtube"]')
              .forEach((f) =>
                f.contentWindow?.postMessage(
                  '{"event":"command","func":"pauseVideo","args":[]}',
                  "*",
                ),
              );
          }}
        />

        {/* Poster + countdown until `feature.url` is real AND the clock has
            passed RELEASE_AT — see FilmStage. */}
        <Reveal delay={0.08}>
          <div className="mt-6">
            <FilmStage url={feature.url} />
          </div>
        </Reveal>

        {/* ---- Reviews --------------------------------------------------- */}
        <div
          id="reviews"
          ref={reviewsRef}
          className="border-hairline mt-16 border-t pt-12"
        >
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <Reveal>
                <h2 className="font-display text-display-md text-gold uppercase">Reviews</h2>
              </Reveal>
              <GoldRule className="mt-5" />
            </div>
            {/* Hidden while locked. "4.6 ★ (0 Reviews)" against an empty
                table reads as a broken feature rather than as an unreleased
                one, and the honest answer to "how is it rated" before anyone
                has seen it is to not ask. */}
            {!locked && nearReviews ? (
              <Reveal direction="left">
                <RatingSummary target={REVIEW_TARGET} refreshKey={refreshKey} />
              </Reveal>
            ) : null}
          </div>

          {locked ? (
            <Reveal delay={0.08}>
              {/* No stars, no pills, no textarea, no submit — and nothing
                  that could call `ensureAnonSession()`. There is no
                  interaction to have, so no MAU should be spent getting
                  ready for one. No second countdown either; the one above
                  the fold is the page's clock. */}
              <div className="glass border-gold-dim/60 mt-8 rounded-lg border p-6 text-center sm:p-8">
                <p className="text-hi text-body-lg">
                  Reviews open when the film does.
                </p>
              </div>
            </Reveal>
          ) : nearReviews ? (
            <>
              <Reveal delay={0.08}>
                <div className="mt-8">
                  <ReviewForm
                    target={REVIEW_TARGET}
                    onSubmitted={() => setRefreshKey((k) => k + 1)}
                  />
                </div>
              </Reveal>

              <Reveal delay={0.12}>
                <div className="mt-6">
                  <ReviewList target={REVIEW_TARGET} refreshKey={refreshKey} />
                </div>
              </Reveal>
            </>
          ) : (
            // Reserves the form's height so the chunk arriving does not shove
            // the page down under the reader. CLS is 0 today and stays 0.
            <div className="mt-8 min-h-[19rem]" aria-hidden="true" />
          )}
        </div>

        <Reveal delay={0.1}>
          <div className="border-hairline mt-16 grid gap-8 border-t pt-12 sm:grid-cols-3">
            <div className="flex items-start gap-4">
              <Heart className="text-mid mt-0.5 size-5 shrink-0" aria-hidden="true" />
              <div>
                <p className="text-hi text-body-sm font-semibold">Love the film?</p>
                <p className="text-mid text-body-sm mt-1">
                  Show your support by liking it.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <MessageSquare className="text-mid mt-0.5 size-5 shrink-0" aria-hidden="true" />
              <div>
                <p className="text-hi text-body-sm font-semibold">Have feedback?</p>
                <p className="text-mid text-body-sm mt-1">We read every review.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Clapperboard className="text-mid mt-0.5 size-5 shrink-0" aria-hidden="true" />
              <div>
                <p className="text-hi text-body-sm font-semibold">Help us improve</p>
                <p className="text-mid text-body-sm mt-1">
                  Your words matter to the crew.
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </main>
  );
}
