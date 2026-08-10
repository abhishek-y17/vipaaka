"use client";

import { usePathname } from "next/navigation";

import { SocialRow } from "@/components/brand/SocialRow";
import { GoldRule } from "@/components/motion/GoldRule";
import { Reveal } from "@/components/motion/Reveal";
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
              <SocialRow className="mt-10" />
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
