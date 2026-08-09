/**
 * Production stills. The first real footage in the repo — everything before
 * this was key art (`content/brand.ts`) or a mockup placeholder.
 *
 * These are warm amber against a palette built out of cold blacks, and that
 * contrast is the whole reason they work. It only holds while they are
 * *contained*: framed, hairlined, sitting beside copy. Scrimmed full-bleed
 * under a Cinzel title the amber goes muddy and the title loses its edge, so
 * none of them belongs in a header band. The Home hero keeps the Door of
 * Memories plate; `still-l3`'s bright top would fight the Trailers and
 * Contact titles.
 *
 * No grade, no desaturation, no duotone. The warmth is the point.
 *
 * Dimensions are the real intrinsic ones — CLAUDE.md §2 rule 6, CLS is not
 * recoverable later. `blurDataURL` is generated per file (16px wide, JPEG
 * q40) because images served from `public/` cannot use next/image's
 * automatic static-import placeholder.
 */

export type Still = {
  src: string;
  width: number;
  height: number;
  alt: string;
  blurDataURL: string;
};

export const stills = {
  /** About, two-column block. Portrait 4:5, and the most narratively loaded of the four. */
  stairwell: {
    src: "/stills/still-p3.webp",
    width: 1122,
    height: 1402,
    alt: "A figure on a stairwell landing, mid-handoff",
    blurDataURL:
      "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAUABADASIAAhEBAxEB/8QAGQAAAgMBAAAAAAAAAAAAAAAAAAMBAgQF/8QAJBAAAgEDAwMFAAAAAAAAAAAAAQIEAAMRBRIhEyJRMTNBYcH/xAAWAQEBAQAAAAAAAAAAAAAAAAAEAQL/xAAaEQACAgMAAAAAAAAAAAAAAAAAAQIREjJC/9oADAMBAAIRAxEAPwCI0xr1y9bC46bbe05NVmag0O/GLkBGY7hjkj8rkaVfuR7j3c5ZzzuYjNO1LbIlxna26d2Dly2Rx59Pmi4pSoRbcbM8Q+59mkSgVVSGOd3miitrZk5P/9k=",
  },

  /** About, Story Summary. Dark and even, so it sits calmly beside body copy. */
  restaurant: {
    src: "/stills/still-l2.webp",
    width: 1672,
    height: 941,
    alt: "Two figures across a restaurant table, low warm light",
    blurDataURL:
      "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAJABADASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABAEG/8QAIBAAAgEEAQUAAAAAAAAAAAAAAQIAAxExQXEEEyFRwf/EABQBAQAAAAAAAAAAAAAAAAAAAAP/xAAVEQEBAAAAAAAAAAAAAAAAAAAAEf/aAAwDAQACEQMRAD8AzblQFJXejEnpwVv30RiCwvf3jHgwdbNHiXT8fYMM/9k=",
  },

  /** Synopsis beat. Portrait 4:5. */
  doorway: {
    src: "/stills/still-p1.webp",
    width: 1122,
    height: 1402,
    alt: "A figure framed in a doorway",
    blurDataURL:
      "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAUABADASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABAAG/8QAJBAAAgICAQIHAQAAAAAAAAAAAQMCEQAEEjEyBRQhIkFRccH/xAAVAQEBAAAAAAAAAAAAAAAAAAABA//EABgRAQEBAQEAAAAAAAAAAAAAAAEAETEC/9oADAMBAAIRAxEAPwAW7vbKNpatUQqvXkO430xHhmy5y3Q3e8GwSKFH4GZ1r3s2uU+XK7jRqvz6xi2zZGKWuBjHuo/3IPnCsOsRw9wFmjKiMb5dUYRpcemWWLyDt//Z",
  },

  /** Synopsis beat. Bright at the top — fine framed, wrong under a title. */
  street: {
    src: "/stills/still-l3.webp",
    width: 1672,
    height: 941,
    alt: "A street exterior in warm daylight",
    blurDataURL:
      "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAJABADASIAAhEBAxEB/8QAFwAAAwEAAAAAAAAAAAAAAAAAAQIEBf/EACIQAAEDAwMFAAAAAAAAAAAAAAIBAxEABDEFEkETIXKCwf/EABQBAQAAAAAAAAAAAAAAAAAAAAP/xAAZEQACAwEAAAAAAAAAAAAAAAAAAQIREiH/2gAMAwEAAhEDEQA/AJnNZaA7m1cU+kSbRcGE29uIzQsNQtmtNJtHVM25WCzHEVgXWfZaRjJ+P1KHCoVy6f/Z",
  },

  /** Film page. EXACTLY the player aspect (1280x720), so it fills the frame with no crop and no letterbox. Title, wordmark and date are BAKED IN — never overlay type on it, and never put a play control on it. Same trap as vipaka-banner.png (CLAUDE.md §6a). */
  poster: {
    src: "/stills/film-poster.webp",
    width: 1280,
    height: 720,
    alt: "Vipāka — Till Understood. A Datadorks Film. Releasing 15 August 2026.",
    blurDataURL:
      "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAJABADASIAAhEBAxEB/8QAFwAAAwEAAAAAAAAAAAAAAAAAAQMEBf/EAB4QAAIBBAMBAAAAAAAAAAAAAAECAwAEEUESMnFR/8QAFAEBAAAAAAAAAAAAAAAAAAAAAv/EABYRAQEBAAAAAAAAAAAAAAAAAAABMf/aAAwDAQACEQMRAD8AwI1tipMjSK2CRw18oTm0KExtKWAHfBGd0pO58NTyb8FG6Uf/2Q==",
  },
} as const satisfies Record<string, Still>;

export type StillId = keyof typeof stills;
