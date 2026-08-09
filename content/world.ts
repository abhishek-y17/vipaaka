/**
 * The five graphic-novel pages on /world — Vipāka's origin story.
 *
 * Everything the page says is baked into the art: captions, years, dialogue.
 * There is deliberately no copy in this file to overlay on top of it. That was
 * the first build's mistake and it is the same one CLAUDE.md §6a records about
 * `vipaka-banner.png` — art that already contains its own type does not want a
 * second, live type layer sitting over it.
 *
 * The art spells VIPAAKA (the company inside the story); the site spells
 * Vipāka (the film). Both are correct — leave both alone.
 */

export type WorldPage = {
  id: string;
  /** 1-indexed, matches the filename. */
  page: number;
  src: string;
};

/** Native size of every page file. Identical across all five — the strip
 *  depends on that being true, otherwise the pages would not stack flush. */
export const WORLD_PAGE_SIZE = { width: 1600, height: 2000 } as const;

/**
 * Max rendered strip width. The art is 1600px native, so this is a comfortable
 * downscale rather than an upscale — going wider than the source is what makes
 * line art look soft, and this stays well inside it.
 */
export const WORLD_STRIP_MAX_WIDTH = 1150;

export const worldPages: readonly WorldPage[] = [
  { id: "page-1", page: 1, src: "/world/world-1.webp" },
  { id: "page-2", page: 2, src: "/world/world-2.webp" },
  { id: "page-3", page: 3, src: "/world/world-3.webp" },
  { id: "page-4", page: 4, src: "/world/world-4.webp" },
  { id: "page-5", page: 5, src: "/world/world-5.webp" },
] as const;
