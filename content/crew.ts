/**
 * The six people on the Contact page.
 *
 * Real names, real roles, real numbers — supplied and cleared for publication
 * by the team. This file used to carry ten placeholder cards plus an open
 * privacy question about publishing personal mobile numbers; that question has
 * been answered by the people whose numbers they are, so both the placeholders
 * and the tripwire that guarded them are gone.
 *
 * Order is the running order given by the team and is not alphabetical or
 * hierarchical — do not "tidy" it.
 */

/** Keys map to Lucide icons in the Contact card. */
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
  | "box"
  | "user";

export type CrewMember = {
  id: string;
  /**
   * Gold, small caps. The role leads the card — the name is secondary.
   *
   * Optional: one member has no role yet, and the card omits the line
   * entirely rather than reserving an empty label, which would read as a
   * rendering fault rather than as an absence.
   */
  role?: string;
  name: string;
  /** E.164, for the `tel:` href. */
  phone: string;
  /** As printed on the card. */
  phoneDisplay: string;
  icon: CrewIcon;
};

export const crew: readonly CrewMember[] = [
  {
    id: "vikram-srinivas",
    role: "Story, Screenplay, Direction & Editing",
    name: "Vikram Srinivas",
    phone: "+918147092570",
    phoneDisplay: "+91 81470 92570",
    icon: "armchair",
  },
  {
    id: "varun-r-yattinahalli",
    role: "Cinematography & Lyrics",
    name: "Varun R Yattinahalli",
    phone: "+916363454570",
    phoneDisplay: "+91 63634 54570",
    icon: "video",
  },
  {
    id: "abhishek-yogesh",
    role: "Creative Head",
    name: "Abhishek Yogesh",
    phone: "+916362910028",
    phoneDisplay: "+91 63629 10028",
    icon: "pencil",
  },
  {
    id: "vikas-gowda",
    role: "Male Lead",
    name: "Vikas Gowda",
    phone: "+918217533409",
    phoneDisplay: "+91 82175 33409",
    icon: "user",
  },
  {
    id: "pooja-c",
    role: "Female Lead",
    name: "Pooja C",
    phone: "+919606489837",
    phoneDisplay: "+91 96064 89837",
    icon: "user",
  },
  {
    // No role supplied. `CrewCard` omits the label rather than rendering an
    // empty one — see the note on `role` above.
    id: "samarth-maidaragi",
    name: "Samarth Maidaragi",
    phone: "+919341068805",
    phoneDisplay: "+91 93410 68805",
    icon: "film",
  },
] as const;

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
