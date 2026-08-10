/**
 * The three items on the Trailers page.
 *
 * Paste a full YouTube URL into `url` — any format works. `lib/youtube.ts`
 * (Phase 5) extracts the ID. Metadata is hardcoded here on purpose: it means
 * the site never calls the YouTube Data API, so there is no API key and no
 * quota to manage. Only the free IFrame Player API is used.
 */

export type Trailer = {
  id: string;
  title: string;
  /** One line under the title, Montserrat, text-mid. */
  tagline: string;
  /** As printed on the row. */
  duration: string;
  /** Any YouTube URL form — watch, youtu.be, /embed/, /shorts/. */
  url: string;
  /**
   * Local poster in /public/posters. Falls back to the YouTube thumbnail if
   * absent. A local still is preferred — YouTube's maxres frame is 16:9 with
   * baked-in compression and rarely matches the film's grade.
   */
  poster: string | null;
};

// TODO(facts): taglines still needed. All three URLs are now real.
// Durations are confirmed by the client and supersede the mockup's, which were
// all wrong. The announcement's 02:37 matches what the player reports for the
// real video, so these are the runtimes, not estimates.
export const trailers: readonly Trailer[] = [
  {
    id: "announcement",
    title: "Announcement Video",
    // TODO(facts): placeholder. Deliberately no longer states a length — the
    // old line said "sixty-two seconds", which the real runtime contradicts.
    tagline: "The first look at what is coming.",
    duration: "02:37",
    // Real, confirmed.
    url: "https://youtu.be/UROXo3yGQF8?si=EcOZFVY25E3ZtWM9",
    poster: null,
  },
  {
    id: "trailer-1",
    title: "Trailer 1",
    tagline: "An act, and the years that follow it.",
    duration: "02:01",
    // Real, confirmed.
    url: "https://youtu.be/dGBwO_VvzQc?si=6WiKfmQKeh6s0BtK",
    poster: null,
  },
  {
    id: "trailer-2",
    title: "Trailer 2",
    tagline: "Everything ripens. Nothing is forgotten.",
    // Confirmed by the client alongside the other two, not taken from the
    // mockup — the mockup's guess was 02:10. It cannot be verified against
    // the player until the premiere completes; see the note on `url`.
    duration: "00:58",
    // Real, confirmed. Scheduled as a YouTube premiere for 11 Aug 2026 11:11
    // IST — until then the embed shows YouTube's own premiere waiting screen
    // with its own countdown, which is a truthful state and needs nothing
    // from us. It starts playing on its own once the premiere runs.
    url: "https://youtu.be/WmMQ1LNjwHw",
    poster: null,
  },
] as const;

/** The feature itself, played on the Film page. */
export type FeaturePresentation = {
  url: string;
  poster: string | null;
};

// TODO(facts): the film's YouTube URL.
export const feature: FeaturePresentation = {
  url: "",
  poster: null,
} as const;
