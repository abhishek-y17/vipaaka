"use client";

import { usePathname } from "next/navigation";

import { SOCIAL_GLYPH } from "@/components/brand/SocialIcons";
import { GoldRule } from "@/components/motion/GoldRule";
import { Reveal } from "@/components/motion/Reveal";
import { isSocialConfigured, socials } from "@/content/crew";
import { film } from "@/content/film";

/**
 * The social row, copyright, Datadorks mark. Nothing else — CLAUDE.md §2
 * rule 7 forbids inventing sections.
 *
 * The four buttons are **white**, matching CLAUDE.md §3's withheld list: "the
 * four social buttons on Contact" are named explicitly as a place gold does
 * not go, and the footer repeats the same row.
 *
 * // DECISION: the social row is skipped on /contact. That page has its own
 * "Let's Connect" section with the same four icons per the mockup; stacking
 * this footer's identical row directly beneath it read as a mistake, not
 * reinforcement. Copyright still shows everywhere.
 */
export function Footer() {
  const pathname = usePathname();
  const onContact = pathname.startsWith("/contact");

  return (
    <footer className="border-hairline border-t">
      <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8">
        {!onContact ? (
          <>
            <Reveal className="flex justify-center">
              <GoldRule variant="center" width={140} />
            </Reveal>

            <Reveal delay={0.06}>
              <ul className="mt-10 flex items-center justify-center gap-5">
                {socials.map((social) => {
                  const Glyph = SOCIAL_GLYPH[social.id];
                  // Placeholder handles render as an inert mark: dim, no
                  // href, no hover, out of the tab order, and hidden from
                  // assistive tech — announcing "Instagram, link" for
                  // something that goes nowhere is the same lie in audio.
                  if (!isSocialConfigured(social.href)) {
                    return (
                      <li key={social.id} aria-hidden="true">
                        <span className="border-hairline/60 text-low/50 flex size-12 items-center justify-center rounded-full border">
                          <Glyph className="size-5" />
                        </span>
                      </li>
                    );
                  }
                  return (
                    <li key={social.id}>
                      <a
                        href={social.href}
                        aria-label={social.label}
                        target={social.id === "email" ? undefined : "_blank"}
                        rel={
                          social.id === "email"
                            ? undefined
                            : "noopener noreferrer"
                        }
                        className="border-hairline text-hi hover:border-gold-dim hover:text-gold-bright ease-cinema dur-base flex size-12 items-center justify-center rounded-full border transition-colors"
                      >
                        <Glyph className="size-5" />
                      </a>
                    </li>
                  );
                })}
              </ul>
            </Reveal>
          </>
        ) : null}

        <Reveal delay={onContact ? 0 : 0.1}>
          <p className="text-low text-meta mt-10 text-center uppercase">
            © {film.releaseYear} {film.studio} · {film.title} — {film.subtitle}
          </p>
        </Reveal>
      </div>
    </footer>
  );
}

export default Footer;
