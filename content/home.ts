/**
 * The five destination cards below the Landing hero.
 *
 * Source: `docs/design/Landing page.png`'s speech-bubble annotations, each
 * pointing at a nav item. The bubbles are the mockup's way of noting *why*
 * each link matters — they are not UI to reproduce; BUILD_PLAN Phase 3 calls
 * for them as glass cards instead. `href`/`label` intentionally repeat
 * `content/nav.ts` rather than being derived from it: five short strings do
 * not need a cross-file zip, and this file reads correctly on its own.
 */

export type HomeNavCard = {
  href: string;
  /** The destination word — gold at rest, per the mobile mockup. */
  label: string;
  /** The mockup's speech-bubble line for this destination. */
  prompt: string;
};

// DECISION: five cards. Synopsis stayed cut (it's a section on /about, not a
// route), but /world is a real new route and earns its own card — it's a
// build instruction, not a mockup section to reproduce.
export const homeNavCards: readonly HomeNavCard[] = [
  {
    href: "/about",
    label: "About",
    prompt: "Want to know how this story came to life?",
  },
  {
    href: "/world",
    label: "World",
    prompt: "Where it all began.",
  },
  {
    href: "/trailers",
    label: "Trailers",
    prompt: "Watch the official trailer first.",
  },
  {
    href: "/film",
    label: "Film",
    prompt: "Ready to experience it?",
  },
  {
    href: "/contact",
    label: "Contact",
    prompt: "Questions or collaborations?",
  },
] as const;
