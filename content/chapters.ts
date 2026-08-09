import { parseTimecode } from "@/lib/utils";

/**
 * Chapter markers for the Film page rail.
 *
 * **This ships empty, and that is a complete state, not an unfinished one.**
 * The rail renders only when `chapters.length > 0` — with no entries the Film
 * page lays out correctly without one and the scrubber carries the film alone.
 *
 * An earlier draft carried eight timestamps ending at 1:26:45. They were
 * lifted off the Film page mockup as visual filler and were starting to read
 * as a runtime commitment. **The film's runtime is not locked**, so they are
 * gone from here and from PLAYER_SPEC §7.
 *
 * When real chapters exist, add them with the `chapter()` helper so `start` is
 * always derived from `timecode` rather than typed twice in two units.
 */

export type Chapter = {
  id: string;
  label: string;
  /** As printed in the rail, e.g. "05:12" or "1:04:33". */
  timecode: string;
  /** Seconds — what the player actually seeks to. Derived, never hand-typed. */
  start: number;
};

export function chapter(id: string, label: string, timecode: string): Chapter {
  return { id, label, timecode, start: parseTimecode(timecode) };
}

/**
 * Empty until the edit is locked.
 *
 * @example
 * export const chapters: readonly Chapter[] = [
 *   chapter("opening", "Opening", "00:00"),
 *   chapter("the-act", "The Act", "05:12"),
 * ];
 */
export const chapters: readonly Chapter[] = [];

/** The rail is conditional on this. Never render it against an empty array. */
export const hasChapters = chapters.length > 0;
