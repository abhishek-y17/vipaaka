"use client";

import Image from "next/image";
import { useState } from "react";

import { ReleaseCountdown } from "@/components/film/ReleaseCountdown";
import { YTPlayer } from "@/components/player/YTPlayer";
import { RELEASE_AT } from "@/content/film";
import { stills } from "@/content/stills";
import { useIsomorphicLayoutEffect } from "@/lib/motion";
import { extractVideoId } from "@/lib/youtube";

/**
 * The film frame: the poster and its countdown until there is something to
 * play, the player the moment there is.
 *
 * Entirely data-driven off `feature.url` in content/trailers.ts. Pasting a
 * real YouTube URL there swaps the poster for the player and takes the
 * countdown with it — no component is edited to release the film.
 *
 * The poster is 1280×720, exactly the player's aspect, so it fills the same
 * box with no crop and no letterbox and the page does not move when the swap
 * happens.
 *
 * Two things are deliberately absent:
 *
 *   · **Any text over the poster.** The title, the wordmark, "Till
 *     Understood" and the date are already in the pixels. Setting live type
 *     on top is exactly the double-exposure CLAUDE.md §6a records against
 *     vipaka-banner.png, and it is the same mistake twice if it happens here.
 *   · **A play button.** There is nothing to play. A play ring on a still is
 *     an affordance that lies, and a dead control is worse than no control.
 */
export function FilmStage({ url }: { url: string }) {
  const hasVideo = Boolean(extractVideoId(url));

  /**
   * TWO conditions, not one. A real `feature.url` is necessary but not
   * sufficient — pasting the URL in must not publish the film early, so the
   * clock has to agree.
   *
   * `released` starts `false` and is corrected in a layout effect, exactly as
   * the review lock in `page.tsx` does, and for the same reason recorded
   * there: reading `Date.now()` in the render body of a prerendered route
   * evaluates it at BUILD time. That would bake "not released" into the HTML
   * and keep the film hidden after 11:11 with nothing on the page to say why
   * — the worst failure available today. Starting from a constant makes the
   * first client render identical to the server's by construction, and the
   * correction lands before paint.
   *
   * `ReleaseCountdown` is driven by the same `RELEASE_AT`, so the countdown
   * cannot reach zero while the poster is still showing: the tick that takes
   * the clock past the instant is the same one that flips this.
   */
  const [released, setReleased] = useState(false);
  useIsomorphicLayoutEffect(() => {
    const now = Date.now();
    const ms = RELEASE_AT.getTime() - now;
    if (ms <= 0) {
      setReleased(true);
      return;
    }
    // Someone already on the page when the clock rolls over gets the player
    // without refreshing — a spent countdown sitting at 00:00:00 above a
    // poster is the one state this page must never be caught in.
    const id = window.setTimeout(() => setReleased(true), ms + 250);
    return () => window.clearTimeout(id);
  }, []);

  if (hasVideo && released) return <YTPlayer url={url} />;

  return (
    <div>
      <div className="border-hairline relative aspect-video w-full overflow-hidden rounded-t-lg border border-b-0 bg-black">
        <Image
          src={stills.poster.src}
          alt={stills.poster.alt}
          fill
          priority
          placeholder="blur"
          blurDataURL={stills.poster.blurDataURL}
          sizes="(max-width: 1024px) 100vw, 944px"
          className="object-cover"
        />
      </div>

      {/* The strip the control bar occupies once a video exists, so the
          countdown lands where the eye already expects a row of controls. */}
      <div className="bg-surface-1 border-hairline rounded-b-lg border px-4 py-5">
        <ReleaseCountdown />
      </div>
    </div>
  );
}

export default FilmStage;
