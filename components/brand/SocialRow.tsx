import { SOCIAL_GLYPH } from "@/components/brand/SocialIcons";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { isSocialConfigured, socials } from "@/content/crew";
import { cn } from "@/lib/utils";

/**
 * The four social buttons, in one place.
 *
 * Footer, MobileMenu and Contact each had their own copy of this loop, which
 * meant every change to how a social link behaves had to be made three times
 * and stayed correct only until someone missed one. The `mailto:` handling and
 * the `/go/whatsapp` redirect are both behavioural, both easy to get subtly
 * wrong per-copy, and both now live here once.
 *
 * No `"use client"`. It renders anchors and nothing else — no state, no
 * effects — so it works as a server component on Contact and is folded into
 * the client bundle where Footer and MobileMenu import it.
 *
 * ── Per-link behaviour, decided once ────────────────────────────────────────
 * - `mailto:` gets no `target`/`rel`. It is a protocol handoff, not a
 *   navigation, and `_blank` strands an empty tab on machines where the OS
 *   does have a mail client registered.
 * - `/go/whatsapp` is same-origin and also gets no `target`: it is a redirect
 *   we own, and the whole reason it exists is to keep the phone number out of
 *   the hover preview. Opening it in a tab would work, but the tab would then
 *   show the `wa.me` URL anyway.
 * - Everything else opens in a new tab with `noopener noreferrer`.
 *
 * Placeholder entries render as an inert mark: dim, no href, out of the tab
 * order, hidden from assistive tech. Announcing "Instagram, link" for
 * something that goes nowhere is the same lie in audio.
 */

export type SocialRowProps = {
  /** Classes for the `<ul>` — this is where the gap lives. */
  className?: string;
  /** Classes for each link's ring. Defaults to the footer's treatment. */
  linkClassName?: string;
  /** Wrap each link in `MagneticButton`. Contact only. */
  magnetic?: boolean;
};

const RING_BASE =
  "flex size-16 items-center justify-center rounded-full border transition-colors";

export function SocialRow({
  className,
  linkClassName = "border-hairline text-hi hover:border-gold-dim hover:text-gold-bright ease-cinema dur-base",
  magnetic = false,
}: SocialRowProps) {
  return (
    <ul className={cn("flex items-center justify-center gap-5", className)}>
      {socials.map((social) => {
        const Glyph = SOCIAL_GLYPH[social.id];

        if (!isSocialConfigured(social.href)) {
          return (
            <li key={social.id} aria-hidden="true">
              <span
                className={cn(RING_BASE, "border-hairline/60 text-low/50")}
              >
                <Glyph className="size-6" />
              </span>
            </li>
          );
        }

        // Same-origin or protocol handoff — see the note above.
        const external =
          social.id !== "email" && !social.href.startsWith("/");

        const link = (
          <a
            href={social.href}
            aria-label={social.label}
            target={external ? "_blank" : undefined}
            rel={external ? "noopener noreferrer" : undefined}
            className={cn(RING_BASE, linkClassName)}
          >
            <Glyph className="size-6" />
          </a>
        );

        return (
          <li key={social.id}>
            {magnetic ? <MagneticButton>{link}</MagneticButton> : link}
          </li>
        );
      })}
    </ul>
  );
}

export default SocialRow;
