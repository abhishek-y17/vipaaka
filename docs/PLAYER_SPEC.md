# PLAYER_SPEC.md — Custom YouTube Player

The centerpiece. Read this fully before Phase 5.

---

## 1. Why the IFrame API (and yes, it's free)

You keep hosting videos on YouTube (free bandwidth, free transcoding, free CDN, adaptive quality) but the visitor never sees YouTube's UI. The **YouTube IFrame Player API** is free, has no quota and no API key for playback — you only need a key for the *Data API* (fetching titles/stats), which we avoid by hardcoding metadata in `content/trailers.ts`.

Embedding "via link" works exactly as you asked: you paste a YouTube URL into `content/trailers.ts`, a helper extracts the video ID, and the player does the rest.

```ts
// lib/youtube.ts
export function extractVideoId(url: string): string | null {
  const m = url.match(/(?:youtu\.be\/|v=|\/embed\/|\/shorts\/)([A-Za-z0-9_-]{11})/);
  return m?.[1] ?? null;
}
```

---

## 2. Player parameters

```ts
playerVars: {
  controls: 0,        // hide YouTube's control bar — we draw our own
  rel: 0,             // see below — this does NOT mean "no related videos"
  iv_load_policy: 3,  // no annotations
  disablekb: 1,       // we handle keyboard ourselves
  playsinline: 1,     // critical for iOS — otherwise it hijacks fullscreen
  fs: 0,              // our own fullscreen
  cc_load_policy: 0,
  origin: window.location.origin,
  enablejsapi: 1,
}
```

**What `rel: 0` actually does.** It does not suppress the end-screen video grid — that stopped being possible in **September 2018**. Since then `rel=0` only *restricts* the suggestions to videos from the **same channel** as the one just played. Related videos always appear. Practically this means the Datadorks channel should hold the trailers and the film and little else, because whatever is on that channel is what a viewer is offered when the video ends. Design around it — the `onStateChange` `ENDED` handler should immediately swap our own end card over the frame, which is permitted since playback has stopped.

**Removed, deliberately — do not add them back.**

| Param | Status |
|---|---|
| `showinfo` | Removed **September 2018**. Ignored entirely; the title/uploader chrome it controlled no longer exists. |
| `modestbranding` | Deprecated **August 2023**. Ignored. YouTube logo behaviour is now fixed and not author-controllable. |

Both were in earlier drafts of this spec. They are inert, and leaving them in makes it look as though the player's clean chrome depends on them — it doesn't. It depends on `controls: 0` plus our own control layer.

Load the API script **once** globally (a promise-cached singleton in `lib/youtube.ts`), not per player instance. Multiple players on the Trailers page share it.

---

## 3. Architecture

```
TheaterShell            ← FLIP morph, page dim, Escape, focus trap
 └── YTPlayer           ← API lifecycle + state machine, exposes a clean ref API
      ├── PosterFrame   ← still + play ring, shown until first play
      ├── PlayerControls← your gold UI
      └── ChapterRail   ← dots + timestamp list
```

**`YTPlayer` state machine:** `idle → loading → ready → playing ⇄ paused → buffering → ended`.
Poll `getCurrentTime()` on `requestAnimationFrame` (not `setInterval`) while playing; stop the loop when paused. Sync everything else off `onStateChange`.

Expose via `useImperativeHandle`: `play() pause() seek(t) setVolume(v) setPlaybackRate(r) setQuality(q) toggleCaptions() getState()`.

---

## 4. The control layer (matches `Film page.png`)

**Scrubber** — 4px gold track, unfilled portion `rgba(255,255,255,0.15)`. On hover it grows to 6px and the thumb scales in. Buffered range shown at 30% white. Chapter dots sit on the track. Hovering shows a timestamp tooltip; if you have thumbnail sprites, show a preview frame.

**Desktop control row (left → right):** Play/Pause · Previous · −10s · +10s · Volume (slider expands on hover) — then right-aligned: Captions · Settings (quality + speed) · Lock · Loop · Fullscreen. Current time left of the bar, duration right.

**Mobile control row:** big centered Play with −10s / +10s flanking it over the poster; below the scrubber, a 6-icon strip with labels: Quality · Speed · Subtitles · Audio · Lock · More. Exactly as the mobile mockup shows.

**Micro-interactions that sell it**
- Play↔Pause icons morph via SVG path interpolation, not a swap
- ±10s taps spin the arrow 360° and float a `+10` label upward
- Controls auto-hide after 2.5s idle during playback; any pointer move or key brings them back with a 200ms fade
- Double-tap left/right thirds on mobile = skip, with a ripple
- Volume slider is a gold gradient fill; muting collapses it with a spring
- Settings opens as a glass popover that grows from the gear icon

**Keyboard:** `Space`/`K` play-pause · `←`/`→` ±5s · `J`/`L` ±10s · `↑`/`↓` volume · `M` mute · `F` fullscreen · `C` captions · `0-9` seek to % · `Esc` exit theater. Show a `?` shortcuts panel.

---

## 5. Compliance constraints — read this

YouTube's Terms of Service permit building custom controls on the IFrame API, but **not** obscuring the video during playback. So:

- ✅ Controls sit **below or beside** the video frame, or fade in over the *bottom edge* only, the way native players do.
- ✅ A poster/play overlay covering the frame **before first play** and **while paused** is fine.
- ❌ Do not put persistent branding, watermarks, or panels over the video while it plays.
- ❌ Do not strip ads if any appear, and do not proxy the stream.
- ✅ Keep the player at least 200×200px and visible in the viewport when playing.

This is why the mockup's layout — video on top, chapter rail and controls beneath — is the right call, not just aesthetically.

---

## 6. The theater transition

GSAP **FLIP** (`gsap/Flip`, free in the public GSAP release):

1. Record the thumbnail card's rect with `Flip.getState()`.
2. Reparent the element into the fullscreen theater container.
3. `Flip.from(state, { duration: 0.8, ease: 'power3.inOut', absolute: true })`.
4. In parallel: page content scales to 0.96 and blurs 8px; a black scrim fades to 92%; controls fade in 300ms after the morph settles.
5. Exit reverses it, returning to the exact card you came from.

Guards: lock body scroll while open, trap focus, restore focus to the originating card on close, and pause the video on exit.

---

## 7. Chapters

**Chapters are data, not spec.** `content/chapters.ts` ships **empty**, and the rail renders only when it has entries — no entries, no rail, and the Film page lays out correctly without one.

Earlier drafts of this section listed eight timestamps ending at `1:26:45`. Those were lifted off the Film page mockup as visual filler and were being read as a runtime commitment. They have been removed. **The film's runtime is not locked**, and nothing in this repo should imply it is.

When real chapters exist, each is `{ id, label, timecode }` with `start` derived from `timecode` — never hand-typed in two units. The rail's behaviour is unchanged: the active chapter's dot fills gold and its label brightens as playback passes it, clicking seeks, and "Hide Chapters" collapses the rail with a height animation.

Two design notes for whoever fills this in:

- Chapter count should follow the film, not the mockup. Eight markers is right for a feature and absurd for a fifteen-minute short — at that length the scrubber alone carries the whole film and the rail is UI pretending to be a feature.
- If the film ends up short enough that chapters aren't meaningful, leaving the array empty is a complete and correct outcome, not an unfinished one.

---

## 8. Fallbacks

- API script blocked (adblock/network): show the poster with a "Watch on YouTube" gold button linking out. Never a blank box.
- Reduced motion: no FLIP morph — the theater cross-fades instead.
- No JS: `<noscript>` with a plain link to the video.
- Slow connection: skeleton shimmer on the poster; don't block the rest of the page on the API script (`strategy="lazyOnload"`).
