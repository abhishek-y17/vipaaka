"use client";

import { useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { forwardRef } from "react";

import { extractVideoId, loadYouTubeApi, type YTPlayerInstance } from "@/lib/youtube";
import { cn } from "@/lib/utils";

/**
 * The player — YouTube's own, unskinned.
 *
 * ── Why there is no custom control bar here ──────────────────────────────────
 * There was one, and it was good on desktop: play/pause, ±5s skips with a
 * spin and a floating label, scrubber with buffered range, volume,
 * fullscreen, all in white per CLAUDE.md §3's withheld list. It is gone on
 * purpose, and the reason is worth keeping so nobody rebuilds it.
 *
 * Two features can only come from YouTube's own chrome:
 *
 *   1. **Quality.** Measured against the real video, not read off the docs:
 *      `setPlaybackQuality("tiny")` on a 1280×720 stage sitting at `hd720`
 *      was still `hd720` five seconds later — a downgrade, on a level
 *      `getAvailableQualityLevels()` itself reported as available, with room
 *      to take effect. `?vq=` in the embed URL was ignored the same way, in
 *      both directions. YouTube's adaptive bitrate owns the decision and no
 *      longer takes instruction from an embed. A quality menu of ours would
 *      be switches wired to nothing.
 *
 *   2. **Fullscreen on iPhone.** iOS implements the Fullscreen API only for
 *      real `<video>` elements — never a div, never a cross-origin iframe.
 *      `requestFullscreen()` on our container had nothing to attach to, so
 *      the browser's own bars never went away no matter what we did. The one
 *      element iOS will fullscreen is the `<video>` inside YouTube's
 *      document, reachable only from YouTube's own fullscreen button.
 *
 * Running both chromes at once was tried and is what killed the idea: two
 * scrubbers, two pause buttons, two gears, two fullscreen buttons, and our
 * exit control sitting on top of YouTube's settings gear. One bar or the
 * other — and only one of them can offer everything.
 *
 * So this component is now a mount point and a `pause()` handle. `controls: 1`
 * brings the transport, the quality menu, captions, speed and a fullscreen
 * button that works on every platform including iOS; `disablekb: 0` brings
 * the keyboard shortcuts with it.
 *
 * ── What we still own ────────────────────────────────────────────────────────
 * The frame. Black, 16:9, height-capped so a phone in landscape letterboxes
 * inside the viewport instead of overflowing a flex-centred dialog and losing
 * its top and bottom. And the blocked-API fallback, which is ours because
 * YouTube cannot render an error for a script that never loaded.
 *
 * ── One imperative escape hatch ──────────────────────────────────────────────
 * `pause()` is exposed via ref for exactly one caller: `TheaterShell`, which
 * must stop playback the instant its close animation starts, not ~500ms later
 * when the exit transition finishes unmounting this component.
 */

export type YTPlayerHandle = {
  pause: () => void;
};

export type YTPlayerProps = {
  /** Full YouTube URL — any form (watch, youtu.be, /embed/, /shorts/). */
  url: string;
  className?: string;
  onEnded?: () => void;
};

const API_TIMEOUT_MS = 8000;

/**
 * Whether a player instance is usable right now. `new YT.Player()` returns an
 * object immediately but it carries no methods until the iframe handshake
 * completes, and `destroy()` takes them away again — so a truthiness check is
 * not enough, the method has to actually be there. Closing the theater during
 * the handshake is the case that found this.
 */
function isLive(p: YTPlayerInstance | null): p is YTPlayerInstance {
  return typeof p?.pauseVideo === "function";
}

export const YTPlayer = forwardRef<YTPlayerHandle, YTPlayerProps>(function YTPlayer(
  { url, className, onEnded },
  ref,
) {
  const videoId = extractVideoId(url);

  const containerRef = useRef<HTMLDivElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayerInstance | null>(null);

  const [blocked, setBlocked] = useState(false);

  useImperativeHandle(ref, () => ({
    pause: () => {
      const p = playerRef.current;
      if (isLive(p)) p.pauseVideo();
    },
  }));

  const handleEnded = useCallback(() => onEnded?.(), [onEnded]);

  useEffect(() => {
    if (!videoId || !mountRef.current) return;
    let cancelled = false;
    let timeoutId: number;

    loadYouTubeApi().then((YT) => {
      if (cancelled || !mountRef.current) return;

      // Never a blank box if the API script is blocked by an extension or a
      // network. YouTube cannot draw an error for a script that never ran.
      timeoutId = window.setTimeout(() => setBlocked(true), API_TIMEOUT_MS);

      playerRef.current = new YT.Player(mountRef.current, {
        videoId,
        playerVars: {
          controls: 1,
          fs: 1,
          disablekb: 0,
          rel: 0,
          iv_load_policy: 3,
          playsinline: 1,
          cc_load_policy: 0,
          origin: window.location.origin,
          enablejsapi: 1,
        },
        events: {
          onReady: () => {
            window.clearTimeout(timeoutId);
            setBlocked(false);
            // Keyboard users have to be able to reach the transport now that
            // YouTube owns it, and TheaterShell's focus trap only collects
            // elements matching `[tabindex]:not([tabindex="-1"])` — a bare
            // iframe is natively focusable but matches nothing, so the trap
            // would skip it and Tab would walk straight out of the dialog.
            containerRef.current
              ?.querySelector("iframe")
              ?.setAttribute("tabindex", "0");
          },
          onStateChange: (e) => {
            if (e.data === 0) handleEnded();
          },
          onError: () => setBlocked(true),
        },
      });
    });

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
      const p = playerRef.current;
      if (isLive(p)) p.destroy();
      playerRef.current = null;
    };
  }, [videoId, handleEnded]);

  if (!videoId) {
    return (
      <div
        className={cn(
          "bg-surface-2 border-hairline flex aspect-video items-center justify-center rounded-lg border",
          className,
        )}
      >
        <p className="text-mid text-body-sm">No video configured.</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={className}>
      {/* `bg-black` so our letterbox matches the bars YouTube draws inside
          the frame, and `max-h` so a phone in landscape ends up with a box
          wider than 16:9 rather than a stack taller than the screen — a
          flex-centred dialog with no room clips top and bottom equally, which
          is what "the dimensions are getting cropped" looked like. */}
      <div className="relative aspect-video max-h-[calc(100dvh-7rem)] w-full overflow-hidden rounded-lg bg-black">
        {/* `mountRef` is where the YT API REPLACES our div with its iframe —
            never put anything else inside it. */}
        <div ref={mountRef} className="absolute inset-0 h-full w-full" />

        {blocked ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
            <p className="text-mid text-body-sm">
              The player could not load.
            </p>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gold text-void ease-cinema dur-fast hover:bg-gold-bright rounded-sm px-5 py-2 text-xs font-semibold tracking-[0.14em] uppercase transition-colors"
            >
              Watch on YouTube
            </a>
          </div>
        ) : null}
      </div>
    </div>
  );
});

export default YTPlayer;
