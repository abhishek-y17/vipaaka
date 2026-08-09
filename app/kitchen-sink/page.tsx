"use client";

import Image from "next/image";
import Link from "next/link";

import { GoldRule } from "@/components/motion/GoldRule";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { Parallax } from "@/components/motion/Parallax";
import { Reveal } from "@/components/motion/Reveal";
import { SplitText } from "@/components/motion/SplitText";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/GlassCard";
import { Spotlight } from "@/components/ui/Spotlight";
import { plate } from "@/content/brand";
import { film } from "@/content/film";
import { STAGGER } from "@/lib/motion";

/* ---------------------------------------------------------------------------
   Phase 1 kitchen sink. All nine primitives, one per section, with the knobs
   that matter exposed side by side. Not a page of the site — noindex, and it
   ships nothing.
   ------------------------------------------------------------------------ */

function Section({
  n,
  name,
  note,
  children,
}: {
  n: string;
  name: string;
  note: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-hairline border-t py-24">
      <p className="font-eyebrow text-eyebrow-sm text-low uppercase">
        {n} · primitive
      </p>
      <h2 className="font-display text-display-md text-hi mt-4 uppercase">
        {name}
      </h2>
      <GoldRule className="mt-5" />
      <p className="text-mid text-body-sm mt-6 max-w-prose">{note}</p>
      <div className="mt-14">{children}</div>
    </section>
  );
}

function Swatch({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-low text-meta mb-4 uppercase">{label}</p>
      {children}
    </div>
  );
}

export default function KitchenSinkPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 pb-40 sm:px-10">
      <header className="py-24">
        <p className="font-eyebrow text-eyebrow text-low uppercase">
          Phase 1 · {film.studio}
        </p>
        <h1 className="font-display text-display-lg text-hi mt-6 uppercase">
          Kitchen Sink
        </h1>
        <GoldRule className="mt-7" />
        <p className="text-mid text-body-lg mt-8 max-w-prose">
          Nine primitives. Scroll for the scroll-driven ones, hover for the
          pointer-driven ones, and watch the counter bottom-right. Every value
          in here comes from <code className="text-low">lib/motion.ts</code> —
          there is not one inline bezier or hand-typed duration in any of them.
        </p>
      </header>

      {/* 1 ------------------------------------------------------------- */}
      <Section
        n="01"
        name="Reveal"
        note="Fade and rise on scroll-into-view. Framer Motion — this is a state change (out of view → in view), not a scrubbed one. Direction is the direction of travel."
      >
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {(["up", "down", "left", "right"] as const).map((direction, i) => (
            <Reveal
              key={direction}
              direction={direction}
              delay={i * STAGGER.children}
            >
              <div className="bg-surface-2 border-hairline rounded-md border p-6">
                <p className="font-eyebrow text-eyebrow-sm text-gold uppercase">
                  {direction}
                </p>
                <p className="text-mid text-body-sm mt-3">
                  delay {(i * STAGGER.children).toFixed(3)}s
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* 2 ------------------------------------------------------------- */}
      <Section
        n="02"
        name="SplitText"
        note="Words and characters staggered at 40ms. Characters are grouped inside their word so a line can only break between words. The real string stays on aria-label — a screen reader hears the heading, not the letters."
      >
        <div className="space-y-14">
          <Swatch label="by chars · the default">
            <SplitText
              as="p"
              text="About the Film"
              className="font-display text-display-md text-hi uppercase"
            />
          </Swatch>

          <Swatch label="by words">
            <SplitText
              as="p"
              by="words"
              text="Three glimpses. One story."
              className="font-eyebrow text-eyebrow-lg text-gold uppercase"
            />
          </Swatch>

          <Swatch label="mask · rises from behind a clipping edge">
            <SplitText
              as="p"
              text="Till Understood"
              mask
              className="font-display text-display-md text-hi uppercase"
            />
          </Swatch>

          <Swatch label="centred, with and without tracking trim">
            <div className="space-y-3 text-center">
              <div className="border-hairline relative border-x">
                <SplitText
                  as="p"
                  text="Contact"
                  className="font-display text-display-md text-low uppercase"
                />
              </div>
              <div className="border-hairline relative border-x">
                <SplitText
                  as="p"
                  text="Contact"
                  trim={0.18}
                  className="font-display text-display-md text-hi uppercase"
                />
              </div>
              <p className="text-low text-meta">
                the lower one is on true centre — the upper sits half a
                tracking-unit left
              </p>
            </div>
          </Swatch>
        </div>
      </Section>

      {/* 3 ------------------------------------------------------------- */}
      <Section
        n="03"
        name="GoldRule"
        note="Two variants, because the mockups use two. Left grows from the left under left-aligned headings; centre opens outward from the middle under centred ones. The centre variant animates its arms independently — scaling the whole row would squash the lozenge on the way in."
      >
        <div className="grid gap-14 sm:grid-cols-2">
          <Swatch label="variant left · About page">
            <GoldRule />
          </Swatch>
          <Swatch label="variant center · Trailers, Contact">
            <div className="flex justify-center">
              <GoldRule variant="center" width={220} />
            </div>
          </Swatch>
          <Swatch label="left · 220px">
            <GoldRule width={220} />
          </Swatch>
          <Swatch label="center · no ornament">
            <div className="flex justify-center">
              <GoldRule variant="center" width={220} ornament="none" />
            </div>
          </Swatch>
        </div>
      </Section>

      {/* 4 ------------------------------------------------------------- */}
      <Section
        n="04"
        name="Parallax"
        note="The one GSAP primitive — its timeline is the scrollbar. scrub: 1, not true; the one-second lag is the effect. will-change goes on when the trigger activates and comes off when it leaves."
      >
        <div className="grid gap-6 sm:grid-cols-2">
          <Swatch label="speed 15 · the default">
            <Parallax className="h-[280px] rounded-lg">
              <Image
                src={plate.src}
                alt=""
                width={plate.width}
                height={plate.height}
                sizes="(max-width: 640px) 100vw, 50vw"
                className="h-[130%] w-full object-cover"
              />
            </Parallax>
          </Swatch>
          <Swatch label="speed 40 · exaggerated, to see it">
            <Parallax speed={40} className="h-[280px] rounded-lg">
              <Image
                src={plate.src}
                alt=""
                width={plate.width}
                height={plate.height}
                sizes="(max-width: 640px) 100vw, 50vw"
                className="h-[150%] w-full object-cover"
              />
            </Parallax>
          </Swatch>
        </div>
      </Section>

      {/* 5 ------------------------------------------------------------- */}
      <Section
        n="05"
        name="MagneticButton"
        note="Pulls toward the cursor within 60px of its edge, springs back on leave. Listens on window because an element only hears pointermove once the pointer is already on it; the rect is cached and refreshed on scroll and resize. Does nothing at all on touch."
      >
        <div className="flex flex-wrap items-center gap-10">
          <MagneticButton>
            <Button>Submit Review</Button>
          </MagneticButton>
          <MagneticButton>
            <Button variant="outline">Watch Trailer</Button>
          </MagneticButton>
          <MagneticButton strength={16} radius={110}>
            <Button variant="secondary">Exaggerated</Button>
          </MagneticButton>
          <MagneticButton>
            <span className="border-gold-dim/60 text-gold hover:border-gold ease-cinema dur-base flex size-12 items-center justify-center rounded-full border transition-colors">
              ★
            </span>
          </MagneticButton>
        </div>
      </Section>

      {/* 6 ------------------------------------------------------------- */}
      <Section
        n="06"
        name="Spotlight"
        note="Gold light that follows the pointer. The glow is a fixed gradient on its own layer moved by translate3d — feeding --mx/--my into a radial-gradient background instead would repaint the element every frame, which is the thing §4 exists to forbid. Silent on touch, under 768px, and under reduced motion."
      >
        <Spotlight className="border-hairline bg-surface-1 overflow-hidden rounded-lg">
          <div className="p-16 text-center">
            <p className="font-display text-display-sm text-hi uppercase">
              Move the cursor across this panel
            </p>
            <p className="text-low text-body-sm mt-4">
              nothing repaints — open DevTools › Rendering › Paint flashing
            </p>
          </div>
        </Spotlight>
      </Section>

      {/* 7 ------------------------------------------------------------- */}
      <Section
        n="07"
        name="GlassCard"
        note="The §4 recipe, a sheen that sweeps on hover, an optional Spotlight, and a 4px lift. Hover is CSS, not Framer — it costs nothing until the pointer arrives and cannot desync from :hover. Three here; the backdrop-filter budget is about six on screen."
      >
        <div className="relative overflow-hidden rounded-xl">
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(60% 80% at 15% 20%, rgb(212 162 76 / 0.22), transparent 60%), radial-gradient(50% 60% at 85% 75%, rgb(255 255 255 / 0.08), transparent 60%)",
              backgroundColor: "#0A0A0C",
            }}
          />
          <div className="relative grid gap-5 p-8 sm:grid-cols-3">
            <GlassCard spotlight>
              <div className="p-7">
                <p className="font-eyebrow text-eyebrow-sm text-gold uppercase">
                  Spotlight + sheen
                </p>
                <p className="text-hi text-body mt-3">{film.pullQuote}</p>
              </div>
            </GlassCard>
            <GlassCard>
              <div className="p-7">
                <p className="font-eyebrow text-eyebrow-sm text-gold uppercase">
                  Sheen only
                </p>
                <p className="text-mid text-body-sm mt-3">
                  The default. Watch the highlight cross on hover.
                </p>
              </div>
            </GlassCard>
            <GlassCard sheen={false} lift={false}>
              <div className="p-7">
                <p className="font-eyebrow text-eyebrow-sm text-gold uppercase">
                  Inert
                </p>
                <p className="text-mid text-body-sm mt-3">
                  Glass with no hover behaviour, for static panels.
                </p>
              </div>
            </GlassCard>
          </div>
        </div>
      </Section>

      {/* 8 ------------------------------------------------------------- */}
      <Section
        n="08"
        name="PageTransition"
        note="Mounted in this route's layout. The default sweep keeps the gold hairline motif but demotes it to a 2px line on the top edge — present, never in front of content, ~520ms and non-blocking. The spec'd full-viewport curtain is behind a prop; see the note in the component."
      >
        <div className="flex flex-wrap gap-4">
          <Link href="/kitchen-sink/a">
            <Button variant="outline">Navigate to Route A</Button>
          </Link>
          <Link href="/kitchen-sink/b">
            <Button variant="outline">Navigate to Route B</Button>
          </Link>
        </div>
        <p className="text-low text-body-sm mt-6 max-w-prose">
          Click a few times in a row. That repetition is the argument against
          the curtain — a generic full-screen event you cannot skip becomes a
          toll on the fourth click.
        </p>
      </Section>

      {/* 9 ------------------------------------------------------------- */}
      <Section
        n="09"
        name="Preloader"
        note="First visit per session only, and usually invisible: the wordmark fades in only after 180ms, so a fast load shows a black screen — which is what this site looks like anyway. Hard ceiling at 1.4s."
      >
        <Button
          variant="outline"
          onClick={() => {
            sessionStorage.removeItem("vipaka:preloaded");
            window.location.reload();
          }}
        >
          Replay preloader
        </Button>
        <p className="text-low text-body-sm mt-6 max-w-prose">
          The spec asks for the wordmark to &ldquo;draw in&rdquo;. It is a
          raster PNG — there is no path to stroke. It fades and settles from
          1.04 instead. A drawn-on title is a request for an SVG wordmark, not
          a change to this component.
        </p>
      </Section>
    </main>
  );
}
