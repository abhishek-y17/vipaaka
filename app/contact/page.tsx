import type { Metadata } from "next";
import Image from "next/image";

import { SOCIAL_GLYPH } from "@/components/brand/SocialIcons";
import { CrewCard } from "@/components/contact/CrewCard";
import { GoldRule } from "@/components/motion/GoldRule";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { Parallax } from "@/components/motion/Parallax";
import { Reveal } from "@/components/motion/Reveal";
import { SplitText } from "@/components/motion/SplitText";
import { plate } from "@/content/brand";
import { crew, socials } from "@/content/crew";
import { film } from "@/content/film";
import { STAGGER } from "@/lib/motion";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Contact",
  description: `The team behind ${film.title} — ${film.subtitle}. Cast, crew and how to reach ${film.studio}.`,
  path: "/contact",
});

/**
 * Contact — ten crew cards, two columns on desktop and one on mobile, then the
 * "Let's connect" social row.
 *
 * // DECISION: the wave stagger uses column index, not list index, so the two
 * columns offset against each other instead of the right column trailing the
 * left by a full row's worth of delay.
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

        <ul className="mt-12 grid gap-5 lg:grid-cols-2">
          {crew.map((member, i) => (
            <li key={member.id}>
              <Reveal delay={(i % 2) * STAGGER.wave + Math.floor(i / 2) * STAGGER.wave}>
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

        <Reveal delay={0.1}>
          <ul className="mt-10 flex items-center justify-center gap-6">
            {socials.map((social) => {
              const Glyph = SOCIAL_GLYPH[social.id];
              return (
                <li key={social.id}>
                  {/* White, not gold — CLAUDE.md §3 withheld list names the
                      Contact social buttons explicitly. */}
                  <MagneticButton>
                    <a
                      href={social.href}
                      aria-label={social.label}
                      target={social.id === "email" ? undefined : "_blank"}
                      rel={
                        social.id === "email"
                          ? undefined
                          : "noopener noreferrer"
                      }
                      className="border-hairline text-hi hover:border-hi/40 ease-cinema dur-base flex size-16 items-center justify-center rounded-full border transition-colors"
                    >
                      <Glyph className="size-6" />
                    </a>
                  </MagneticButton>
                </li>
              );
            })}
          </ul>
        </Reveal>
      </section>
    </main>
  );
}
