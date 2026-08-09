/**
 * Every fact about the film. No component may hardcode a title, runtime,
 * date or line of copy — CLAUDE.md §6.
 *
 * Fields marked TODO are placeholders awaiting confirmation. They are typed
 * and present so layout work is never blocked on copy.
 */

import type { StillId } from "@/content/stills";

/**
 * Release, as an absolute instant.
 *
 * `+05:30` is hardcoded on purpose. The film releases at midnight in Kolkata,
 * not at midnight wherever the visitor happens to be — a countdown built from
 * the browser's local midnight would show a different number to every timezone
 * and hit zero at the wrong moment for all but one of them.
 *
 * The single source for BOTH the countdown and the review lock. Two
 * independent date checks are two things that can drift apart, and the one
 * that drifts is always the one nobody is looking at. The database's insert
 * policy carries the same instant (`now() >= '2026-08-15 00:00:00+05:30'`) —
 * that one is the actual enforcement; this one is only the experience.
 */
export const RELEASE_AT = new Date("2026-08-15T00:00:00+05:30");

export type FilmInfo = {
  studio: string;
  title: string;
  subtitle: string;
  /**
   * The hero eyebrow, verbatim from the key art (`vipaka-banner.png`) — that
   * artefact is the confirmed brand line; the Landing mockup's "A DATADORKS
   * PRODUCTION" was placeholder, same as its title.
   */
  heroEyebrow: string;
  /** One line, spoiler-free. Used for <meta description> and the hero. */
  logline: string;
  genre: string;
  /** Human-readable, as shown in the About info strip. */
  runtime: string;
  /** Minutes — the info strip counts this up on scroll-in. */
  runtimeMinutes: number;
  language: string;
  /** ISO 8601, for <time> and JSON-LD. */
  releaseDate: string;
  /** As typeset in the hero. */
  releaseDateDisplay: string;
  /** Long form, for prose and the server-rendered pre-hydration line. */
  releaseDateLong: string;
  releaseYear: number;
  /** Sanskrit epigraph on the banner. */
  epigraph: {
    text: string;
    translation: string;
    source: string;
  };
  /** Film page pull-quote. */
  pullQuote: string;
  /** Long-form copy for the About page Story Summary block. */
  summary: readonly string[];
};

export const film: FilmInfo = {
  studio: "DATADORKS",
  title: "Vipāka",
  subtitle: "Till Understood",
  heroEyebrow: "A DATADORKS FILM",

  // TODO(copy): confirm with Datadorks.
  logline:
    "Every action ripens. A short film about the long silence between what we do and what it costs us.",

  // TODO(facts): confirm genre, runtime and language.
  genre: "Drama",
  runtime: "TBC",
  runtimeMinutes: 0,
  language: "TBC",

  releaseDate: "2026-08-15",
  releaseDateDisplay: "15 · 08 · 2026",
  releaseDateLong: "15 August 2026",
  releaseYear: 2026,

  epigraph: {
    text: "Karmany akarma yah paśyedakarmani ca karma yah",
    // TODO(copy): confirm the translation Datadorks want to use, if any.
    translation:
      "One who sees inaction in action, and action in inaction…",
    source: "Bhagavad Gita 4.18",
  },

  pullQuote: "Every story finds its roots in a moment of silence.",

  // TODO(copy): placeholder body copy. Structure is right, words are not.
  summary: [
    "Vipāka means the ripening — the moment a thing done long ago finally arrives at its consequence.",
    "The film sits in that gap. Not in the act, and not in the reckoning, but in the quiet stretch between them, where a person still believes nothing has happened.",
  ],
} as const;

/**
 * Synopsis page beats — a centred vertical timeline with a gold spine that
 * fills as you scroll (Phase 4). Spoiler-free by design.
 */
export type StoryBeat = {
  id: string;
  /** Bebas eyebrow, e.g. "ONE". */
  index: string;
  title: string;
  body: string;
  /**
   * A production still, by key in `content/stills.ts`. Deliberately set on
   * two beats out of four and left off the others — an image under every beat
   * flattens the timeline into a gallery and the rhythm of the scroll is the
   * only thing carrying a spoiler-free synopsis.
   */
  image?: StillId;
};

// TODO(copy): all four beats are placeholders.
export const storyBeats: readonly StoryBeat[] = [
  {
    id: "beat-1",
    index: "ONE",
    title: "The Act",
    body: "A decision made quickly, in a room nobody else remembers being in.",
    // DECISION: beats one and four, not two adjacent ones. They sit on
    // opposite sides of the spine and at opposite ends of the scroll, so the
    // two images bookend the timeline instead of clustering into a block.
    image: "doorway",
  },
  {
    id: "beat-2",
    index: "TWO",
    title: "The Silence",
    body: "Years pass without incident. This is the part the film is actually about.",
  },
  {
    id: "beat-3",
    index: "THREE",
    title: "The Ripening",
    body: "Something surfaces that should have stayed buried, and will not be argued with.",
  },
  {
    id: "beat-4",
    index: "FOUR",
    title: "Till Understood",
    body: "Consequence is not punishment. It waits until it is understood.",
    image: "street",
  },
] as const;
