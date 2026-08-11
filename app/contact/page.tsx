import type { Metadata } from "next";
import Image from "next/image";

import { SocialRow } from "@/components/brand/SocialRow";
import { CrewCard } from "@/components/contact/CrewCard";
import { GoldRule } from "@/components/motion/GoldRule";
import { Parallax } from "@/components/motion/Parallax";
import { Reveal } from "@/components/motion/Reveal";
import { SplitText } from "@/components/motion/SplitText";
import { plate } from "@/content/brand";
import { crew } from "@/content/crew";
import { film } from "@/content/film";
import { STAGGER } from "@/lib/motion";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Contact",
  description: `The team behind ${film.title} — ${film.subtitle}. Cast, crew and how to reach ${film.studio}.`,
  path: "/contact",
});

/**
 * Contact — the six-person team, then the "Let's connect" social row.
 *
 * // DECISION: two columns from `lg`, one below it. Three columns fitted six
 * cards evenly but made each narrow enough that the longest role, "Story,
 * Screenplay, Direction & Editing", wrapped to two cramped lines between the
 * icon ring and the call button. Two columns give it one line at 1440.
 *
 * The breakpoint is `lg`, not `sm`, because two columns at 768 produced 327px
 * cards — narrower than the 342px single column at 390 — and shredded that
 * same role into four ragged fragments. Tablet keeps the full-width card.
 *
 * ── The header band is sized by its content, not by the viewport ────────────
 * It used to be `h-[40vh]` (52vh before that) with vertically centred
 * content. Measured: 85px of content in a 360px box at a 900px viewport, so
 * 137px of dead space fell below it — and because the height was
 * viewport-proportional, that grew to 173px at 1080px tall. It read as a
 * broken layout precisely on the big monitors where the site should look most
 * expensive.
 *
 * Padding instead of a `vh` height means there is no surplus to distribute,
 * so the gap is the same on every screen. Nothing here uses a negative margin
 * to claw the space back.
 */
export default function ContactPage() {
  return (
    <main>
      {/* ---- Header band ------------------------------------------------- */}
      <section className="relative flex items-center justify-center overflow-hidden pt-28 pb-14 sm:pt-32 sm:pb-16">
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
          <Reveal delay={0.32}>
            <div className="mt-5 flex justify-center">
              <GoldRule variant="center" width={180} />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---- Intro -------------------------------------------------------- */}
      <section className="mx-auto max-w-3xl px-6 pt-10 pb-14 text-center sm:px-10">
        <Reveal>
          <p className="text-mid text-body-lg">
            Every frame, every sound, every detail — crafted by a passionate
            team. Reach out to the people who made it possible.
          </p>
        </Reveal>
      </section>

      {/* ---- The team ------------------------------------------------------ */}
      <section className="mx-auto max-w-6xl px-6 pb-20 sm:px-10">
        {/* Promoted from the eyebrow that used to sit under CONTACT in the
            header band. It is the section's real heading now, so it is an
            <h2> at a heading size — and gold, per CLAUDE.md §3, which puts
            in-content section headings on the "gold is used for" list.

            The "— THE TEAM —" rule that used to sit here is gone: it labelled
            a section this line already names, and for six people two headings
            stacked together read as filler. */}
        <h2 className="font-eyebrow text-eyebrow-xl sm:text-eyebrow-2xl text-gold text-center uppercase">
          Our Team Behind the Film
        </h2>

        {/* `items-stretch` is grid's default and `CrewCard` carries `h-full`,
            so a card whose role wraps on a narrow screen does not leave the
            one beside it short. */}
        <ul className="mt-12 grid gap-5 lg:grid-cols-2 lg:gap-6">
          {crew.map((member, i) => (
            <li key={member.id}>
              <Reveal
                delay={(i % 2) * STAGGER.wave + Math.floor(i / 2) * STAGGER.wave}
              >
                <CrewCard member={member} />
              </Reveal>
            </li>
          ))}
        </ul>
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
