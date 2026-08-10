/**
 * The ten crew cards on the Contact page — 2 columns desktop, 1 mobile,
 * in the reading order shown in `docs/design/Contact page.png`.
 *
 * Names and numbers are placeholders and are meant to be, exactly as the
 * mockup has them: role in gold, `Name`, `+91 00000 00000`. They are here so
 * layout, stagger and hover work can be built and reviewed against something
 * that looks right, not so they can ship.
 *
 * ⚠ The privacy question these raise is **deferred, not resolved** — see the
 * note at the bottom of this file. It must be answered before launch.
 */

/** Keys map to Lucide icons in the Contact card (Phase 8). */
export type CrewIcon =
  | "armchair"
  | "clapperboard"
  | "video"
  | "pencil"
  | "film"
  | "house"
  | "music"
  | "shirt"
  | "volume-2"
  | "box";

export type CrewMember = {
  id: string;
  /** Gold, small caps. The role leads the card — the name is secondary. */
  role: string;
  name: string;
  /** E.164 for the `tel:` href. Empty while placeholder — renders inert. */
  phone: string;
  /** As printed on the card. */
  phoneDisplay: string;
  icon: CrewIcon;
};

const PLACEHOLDER_NAME = "Name";
const PLACEHOLDER_PHONE = "+91 00000 00000";

function placeholder(
  id: string,
  role: string,
  icon: CrewIcon,
): CrewMember {
  return {
    id,
    role,
    name: PLACEHOLDER_NAME,
    // Deliberately empty: an inert card is honest, a `tel:+910000000000`
    // link is a button that dials nothing.
    phone: "",
    phoneDisplay: PLACEHOLDER_PHONE,
    icon,
  };
}

// TODO(facts): all ten names and numbers are placeholders awaiting Datadorks.
export const crew: readonly CrewMember[] = [
  placeholder("director", "Director", "armchair"),
  placeholder("producer", "Producer", "clapperboard"),
  placeholder("cinematographer", "Cinematographer", "video"),
  placeholder("screenplay-writer", "Screenplay Writer", "pencil"),
  placeholder("editor", "Editor", "film"),
  placeholder("production-designer", "Production Designer", "house"),
  placeholder("music-director", "Music Director", "music"),
  placeholder("costume-designer", "Costume Designer", "shirt"),
  placeholder("sound-designer", "Sound Designer", "volume-2"),
  placeholder("vfx-supervisor", "VFX Supervisor", "box"),
] as const;

/** True while any card is still placeholder — gates the pre-launch check. */
export const crewIsPlaceholder = crew.some(
  (m) => m.name === PLACEHOLDER_NAME || m.phone === "",
);

/* ---------------------------------------------------------------------------
   Socials — the "Let's connect" row (Phase 8).
   White icons, dark circular buttons. The mockup withholds gold here, on
   purpose — see CLAUDE.md §3, "gold is withheld from".
   ------------------------------------------------------------------------ */

export type SocialLink = {
  id: "instagram" | "email" | "youtube" | "whatsapp";
  label: string;
  href: string;
};

/**
 * Real, confirmed. All four pass `isSocialConfigured`, so the inert treatment
 * in Footer / MobileMenu / Contact falls away on its own with no edit there.
 *
 * URLs are stored clean. The Instagram and YouTube links arrived carrying
 * share-sheet tracking (`?utm_source=…`, `?si=…`) — those identify the share,
 * not the destination, they are dead weight in the markup, and once indexed
 * they become the canonical URL other people copy. Stripped.
 */
/**
 * The real WhatsApp destination. Lives here rather than in the route handler
 * because every fact belongs in `content/` — the route is plumbing, this is
 * the number.
 *
 * It is deliberately NOT the rendered href. `wa.me/<number>` puts a personal
 * phone number in the browser's status bar on hover, in the DOM for any
 * scraper, and in the copied text of "copy link address" — all before anyone
 * has chosen to contact anybody. `/go/whatsapp` redirects to this, so the
 * hover preview shows our own domain instead.
 *
 * This masks the preview, not the number: it is still visible once the
 * redirect is followed. That is expected and is the whole scope of it.
 */
export const WHATSAPP_URL = "https://wa.me/918147092570";

export const socials: readonly SocialLink[] = [
  {
    id: "instagram",
    label: "Instagram",
    href: "https://www.instagram.com/vipaaka_themovie",
  },
  { id: "email", label: "Email", href: "mailto:vipaakathemovie@gmail.com" },
  { id: "youtube", label: "YouTube", href: "https://youtube.com/@vipaaka" },
  // Local redirect — see WHATSAPP_URL above and app/go/whatsapp/route.ts.
  { id: "whatsapp", label: "WhatsApp", href: "/go/whatsapp" },
] as const;

/**
 * Whether a social entry points at an actual account.
 *
 * All four entries above are real now, so this currently returns true for
 * every one of them and no icon renders inert. It stays because the failure
 * it guards against is silent and recurs: a placeholder here is not blank, it
 * is a bare domain — a perfectly valid URL that renders as a perfectly
 * working link to somebody else's front page. That is worse than no icon. It
 * looks deliberate, and a visitor who taps it lands on instagram.com logged
 * into their own account with no idea what went wrong.
 *
 * The test is "is there anything after the domain", not a list of known
 * placeholder strings — so a handle that is emptied or reset to a bare domain
 * turns its own icon off again, in every footer, menu and contact row, with
 * no other edit.
 */
export function isSocialConfigured(href: string): boolean {
  const value = href.trim();
  if (!value) return false;

  // `mailto:` / `tel:` carry their target in the path, not a host.
  const scheme = value.match(/^(mailto|tel):(.*)$/i);
  if (scheme) return scheme[2].trim().length > 0;

  // Root-relative, e.g. the `/go/whatsapp` redirect. `new URL()` throws on
  // these for want of a base, which would have classed a perfectly good
  // internal link as unset and rendered the icon inert — the exact failure
  // this function exists to produce for genuine placeholders.
  if (value.startsWith("/")) return value.replace(/\/+$/, "").length > 1;

  try {
    const url = new URL(value);
    // "https://instagram.com/" → pathname "/", nothing else. A real profile
    // always has a handle, a query, or both.
    return url.pathname.replace(/\/+$/, "").length > 0 || url.search.length > 0;
  } catch {
    // Not parseable as a URL at all — treat as unset rather than render it.
    return false;
  }
}

/* ---------------------------------------------------------------------------
   ⚠ STILL OPEN — must be answered before launch, not at launch.

   Ten personal mobile numbers behind `tel:` links on a public page will be
   scraped within days. Unlike an email there is no filtering layer in front of
   a phone, and unlike an email you cannot rotate it.

   Three options, in order of preference. All three keep the mockup's layout:

     1. One production contact number for the whole film, plus per-person
        email. Same ten cards, one `tel:` link instead of ten.
     2. Keep all ten behind a "Show number" tap, so a crawler that does not
        execute JS gets nothing. Costs one interaction.
     3. Publish all ten as designed, with every person's informed consent
        recorded — not assumed because they are on the crew.

   `crewIsPlaceholder` above is the tripwire: while it is true, this decision
   has not been made. This is the film-maker's call, not the developer's, but
   it has to be an actual call, and it is far cheaper now than after the
   numbers are indexed.
   ------------------------------------------------------------------------ */
