import type { Metadata } from "next";
import Image from "next/image";

import { SocialRow } from "@/components/brand/SocialRow";
import { GoldRule } from "@/components/motion/GoldRule";
import { Parallax } from "@/components/motion/Parallax";
import { Reveal } from "@/components/motion/Reveal";
import { SplitText } from "@/components/motion/SplitText";
import { plate } from "@/content/brand";
import { film } from "@/content/film";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Contact",
  description: `The team behind ${film.title} — ${film.subtitle}. Cast, crew and how to reach ${film.studio}.`,
  path: "/contact",
});

/**
 * Contact — a placeholder note where the crew grid will go, then the
 * "Let's connect" social row.
 *
 * The ten crew cards are written and working but not rendered: every name and
 * number is still a placeholder, and ten cards reading "Name / +91 00000
 * 00000" look like a mistake rather than like work in progress. See the note
 * in the team section, and `crewIsPlaceholder` in `content/crew.ts`.
 */
export default function ContactPage() {
  return (
    <main>
      {/* ---- Header band ------------------------------------------------- */}
      <section className="relative flex h-[52vh] min-h-[380px] items-center justify-center overflow-hidden">
        <Parallax className="absolute inset-0">
          <Image
            src={plate.src}
            alt=""
            fill
            priority
            placeholder="blur"
            blurDataURL={plate.blurDataURL}
            sizes="100vw"
            quality={68}
            className="object-cover opacity-70"
          />
        </Parallax>
        <div
          aria-hidden="true"
          className="from-void via-void/60 pointer-events-none absolute inset-0 bg-gradient-to-t to-transparent"
        />

        <div className="relative z-10 px-6 text-center">
          <SplitText
            as="h1"
            text="Contact"
            trim={0.16}
            trigger="mount"
            className="font-display text-display-lg text-hi uppercase"
          />
          <Reveal delay={0.25}>
            {/* // DECISION: white, not gold — CLAUDE.md §3's withheld list is
                explicit that eyebrows over hero imagery are white; this one
                was the outlier, same class as the Trailers-page gold-title
                correction. */}
            <p className="font-eyebrow text-eyebrow text-hi mt-5 uppercase">
              Our Team Behind the Film
            </p>
          </Reveal>
          <Reveal delay={0.32}>
            <div className="mt-5 flex justify-center">
              <GoldRule variant="center" width={180} />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---- Intro -------------------------------------------------------- */}
      <section className="mx-auto max-w-3xl px-6 py-16 text-center sm:px-10">
        <Reveal>
          <p className="text-mid text-body-lg">
            Every frame, every sound, every detail — crafted by a passionate
            team. Reach out to the people who made it possible.
          </p>
        </Reveal>
      </section>

      {/* ---- The team ------------------------------------------------------ */}
      <section className="mx-auto max-w-6xl px-6 pb-20 sm:px-10">
        <div className="flex items-center justify-center gap-4">
          <GoldRule variant="center" width={90} ornament="none" />
          <h2 className="font-display text-display-sm text-gold shrink-0 uppercase">
            The Team
          </h2>
          <GoldRule variant="center" width={90} ornament="none" />
        </div>

        {/* The ten crew cards are held back until the names and numbers are
            real. They rendered as "Name / +91 00000 00000" ten times over,
            which does not read as "coming soon" — it reads as a page shipped
            without checking. One honest line is better than ten
            filled-in-looking blanks.

            `content/crew.ts` and `components/contact/CrewCard.tsx` are both
            untouched and still typed, so restoring the grid is re-adding the
            imports and the map — not rebuilding it. `crewIsPlaceholder` in
            crew.ts remains the tripwire for when that is safe. */}
        <Reveal delay={0.06}>
          <p className="text-mid text-body-lg mt-10 text-center">
            Individual crew details will be added soon.
          </p>
        </Reveal>
      </section>

      {/* ---- Let's connect -------------------------------------------------- */}
      <section className="mx-auto max-w-3xl px-6 pb-28 text-center sm:px-10">
        <div className="flex items-center justify-center gap-4">
          <GoldRule variant="center" width={90} ornament="none" />
          <h2 className="font-display text-display-sm text-gold shrink-0 uppercase">
            Let&rsquo;s Connect
          </h2>
          <GoldRule variant="center" width={90} ornament="none" />
        </div>

        {/* Same row as the Footer's, from the same component — so the mailto
            handling and the /go/whatsapp redirect can never drift between the
            two. White hover, not gold: CLAUDE.md §3's withheld list names the
            Contact social buttons explicitly. */}
        <Reveal delay={0.1}>
          <SocialRow
            className="mt-10 gap-6"
            linkClassName="border-hairline text-hi hover:border-hi/40 ease-cinema dur-base"
            magnetic
          />
        </Reveal>
      </section>
    </main>
  );
}
