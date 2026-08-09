import type { Metadata } from "next";

import { film } from "@/content/film";

export const metadata: Metadata = {
  title: "Foundation",
  description: "Phase 0 specimen sheet — tokens, type scale, grain.",
  robots: { index: false, follow: false },
};

/* ---------------------------------------------------------------------------
   Phase 0 specimen sheet. Not a page of the site — a proof that the design
   system renders. Delete or leave unlinked; it is noindex either way.

   It proves three things:
     1. All three Google fonts load and are visibly distinct.
     2. The grain overlay renders over everything (it is mounted in layout.tsx).
     3. Tokens work as utilities — bg-surface-2, text-gold, ease-cinema.
   ------------------------------------------------------------------------ */

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-eyebrow text-eyebrow text-gold uppercase">{children}</p>
  );
}

function Section({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-hairline border-t py-20">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="font-display text-display-md text-hi mt-5 uppercase">
        {title}
      </h2>
      {/* The recurring gold hairline. GoldRule (Phase 1) animates this in. */}
      <span className="gold-rule mt-6" />
      <div className="mt-12">{children}</div>
    </section>
  );
}

/** Token name, shown in monospace so it can be copied straight into code. */
function Token({ children }: { children: React.ReactNode }) {
  return (
    <code className="text-low text-[0.6875rem] tracking-[0.06em]">
      {children}
    </code>
  );
}

const SURFACES = [
  { name: "void", token: "bg-void", hex: "#030304", note: "page floor" },
  { name: "surface-1", token: "bg-surface-1", hex: "#0A0A0C", note: "section" },
  { name: "surface-2", token: "bg-surface-2", hex: "#121215", note: "cards" },
  { name: "surface-3", token: "bg-surface-3", hex: "#1A1A1F", note: "raised" },
] as const;

const GOLDS = [
  { name: "gold", token: "text-gold", hex: "#D4A24C", note: "the accent" },
  {
    name: "gold-bright",
    token: "text-gold-bright",
    hex: "#F0B429",
    note: "CTA · active · small text",
  },
  {
    name: "gold-dim",
    token: "text-gold-dim",
    hex: "#8A6B32",
    note: "hairlines · dividers",
  },
] as const;

const INKS = [
  { name: "hi", token: "text-hi", hex: "#F5F3EF", note: "headings" },
  { name: "mid", token: "text-mid", hex: "#B8B5AE", note: "body" },
  { name: "low", token: "text-low", hex: "#6E6B66", note: "meta" },
] as const;

const EASES = [
  { name: "ease-cinema", note: "default — heavy, expensive" },
  { name: "ease-glass", note: "panels, overlays" },
  { name: "ease-snap", note: "toggles, small state" },
] as const;

export default function FoundationPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-24 sm:px-10">
      {/* ---------------------------------------------------------------- */}
      <header>
        <Eyebrow>{film.studio} · Phase 0</Eyebrow>
        <h1 className="font-display text-display-lg text-hi mt-6 uppercase">
          Foundation
        </h1>
        <span className="gold-rule mt-7" />
        <p className="text-mid text-body-lg mt-8 max-w-prose">
          The design system, rendered. If the three specimens below look like
          one typeface, font loading has failed. If the black looks perfectly
          flat, the grain overlay is not mounting.
        </p>
      </header>

      {/* --- 1. Fonts ---------------------------------------------------- */}
      <Section eyebrow="Proof one" title="Three typefaces">
        <div className="space-y-14">
          <div>
            <div className="flex items-baseline gap-3">
              <Token>font-display</Token>
              <span className="text-low text-meta">Cinzel · variable 400–900</span>
            </div>
            <p className="font-display text-display-lg text-hi mt-4 uppercase">
              Vipāka
            </p>
            <p className="text-low text-body-sm mt-3">
              Page titles and section headings. Serif, engraved, wide. Never
              below <Token>text-display-sm</Token> — under wide tracking it stops
              being legible, and that is what Bebas is for.
            </p>
          </div>

          <div>
            <div className="flex items-baseline gap-3">
              <Token>font-eyebrow</Token>
              <span className="text-low text-meta">Bebas Neue · 400 only</span>
            </div>
            <p className="font-eyebrow text-eyebrow-lg text-gold mt-4 uppercase">
              A Datadorks Production
            </p>
            <p className="text-low text-body-sm mt-3">
              Eyebrows, crew roles, stat labels, mobile nav. Condensed sans.
              Always smaller, wider-tracked and dimmer than the Cinzel it
              annotates — two all-caps faces coexist only if they never share a
              size class.
            </p>
          </div>

          <div>
            <div className="flex items-baseline gap-3">
              <Token>font-body</Token>
              <span className="text-low text-meta">Montserrat · variable</span>
            </div>
            <p className="text-mid text-body-lg mt-4 max-w-prose">
              {film.epigraph.text}
            </p>
            <p className="text-low text-body-sm mt-3">
              Everything you actually read: paragraphs, buttons, form fields,
              timestamps. Normal tracking — the letter-spacing aesthetic stops
              at the headings.
            </p>
          </div>
        </div>
      </Section>

      {/* --- 2. Type scale ----------------------------------------------- */}
      <Section eyebrow="Proof two" title="Type scale">
        <p className="text-mid text-body max-w-prose">
          Tracking is not one number. For all-caps it must loosen as size drops
          — 0.13em at 6rem, 0.20em at 1.375rem. The scale carries its own
          letter-spacing and line-height so no component ever pastes{" "}
          <Token>tracking-[0.18em]</Token> at the wrong size.
        </p>

        <div className="mt-12 space-y-10">
          {[
            { cls: "text-display-xl", ls: "0.13em", label: "Vipāka" },
            { cls: "text-display-lg", ls: "0.16em", label: "About the Film" },
            { cls: "text-display-md", ls: "0.18em", label: "Trailers" },
            { cls: "text-display-sm", ls: "0.20em", label: "Story Summary" },
          ].map((step) => (
            <div key={step.cls}>
              <div className="flex items-baseline gap-3">
                <Token>{step.cls}</Token>
                <span className="text-low text-meta">
                  letter-spacing {step.ls}
                </span>
              </div>
              <p
                className={`font-display ${step.cls} text-hi mt-3 uppercase`}
              >
                {step.label}
              </p>
            </div>
          ))}

          <div className="border-hairline border-t pt-10">
            <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
              <Token>text-eyebrow-lg</Token>
              <Token>text-eyebrow</Token>
              <Token>text-eyebrow-sm</Token>
            </div>
            <div className="mt-4 space-y-3">
              <p className="font-eyebrow text-eyebrow-lg text-gold uppercase">
                Three glimpses. One story.
              </p>
              <p className="font-eyebrow text-eyebrow text-gold uppercase">
                Our team behind the film
              </p>
              <p className="font-eyebrow text-eyebrow-sm text-low uppercase">
                Runtime · Language · Release
              </p>
            </div>
          </div>

          <div className="border-hairline border-t pt-10">
            <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
              <Token>text-body-lg</Token>
              <Token>text-body</Token>
              <Token>text-body-sm</Token>
              <Token>text-meta</Token>
            </div>
            <div className="mt-4 max-w-prose space-y-3">
              <p className="text-hi text-body-lg">{film.summary[0]}</p>
              <p className="text-mid text-body">{film.summary[1]}</p>
              <p className="text-mid text-body-sm">
                {film.epigraph.translation}
              </p>
              <p className="text-low text-meta uppercase">
                {film.epigraph.source}
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* --- 3. Colour --------------------------------------------------- */}
      <Section eyebrow="Proof three" title="Colour">
        <p className="text-mid text-body max-w-prose">
          Gold is the only accent, and the budget is roughly one gold element
          per viewport. Note how little of it appears on this page — that
          scarcity is the entire effect, and it is the first thing that erodes
          once real sections get built.
        </p>

        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {SURFACES.map((s) => (
            <div
              key={s.name}
              className="border-hairline overflow-hidden rounded-md border"
            >
              <div className={`${s.token} h-20`} />
              <div className="bg-surface-1 px-3 py-3">
                <p className="text-hi text-body-sm">{s.name}</p>
                <p className="text-low text-meta mt-1">{s.hex}</p>
                <p className="text-low text-meta">{s.note}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {GOLDS.map((g) => (
            <div
              key={g.name}
              className="bg-surface-1 border-hairline rounded-md border p-5"
            >
              <p className={`${g.token} font-display text-display-sm uppercase`}>
                {g.name}
              </p>
              <p className="text-low text-meta mt-3">{g.hex}</p>
              <p className="text-low text-meta">{g.note}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {INKS.map((t) => (
            <div
              key={t.name}
              className="bg-surface-1 border-hairline rounded-md border p-5"
            >
              <p className={`${t.token} text-body-lg`}>The ripening</p>
              <p className="text-low text-meta mt-3">
                {t.hex} · {t.note}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* --- 4. Glass ---------------------------------------------------- */}
      <Section eyebrow="Proof four" title="Glass">
        <p className="text-mid text-body max-w-prose">
          The <Token>glass</Token> utility. The <Token>inset 0 1px 0</Token> top
          highlight is what reads as glass — cover the top edge with your thumb
          and the panel immediately looks like flat grey. Blur drops from 20px
          to 12px under 768px; no more than six of these may be visible at once.
        </p>

        <div className="relative mt-12 overflow-hidden rounded-xl">
          {/* Something with structure behind it, so the blur has work to do. */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(60% 80% at 20% 20%, rgb(212 162 76 / 0.28), transparent 60%), radial-gradient(50% 60% at 85% 70%, rgb(255 255 255 / 0.10), transparent 60%)",
              backgroundColor: "#0A0A0C",
            }}
          />
          <div className="relative grid gap-5 p-8 sm:grid-cols-2">
            <div className="glass rounded-lg p-6">
              <p className="font-eyebrow text-eyebrow-sm text-gold uppercase">
                Glass card
              </p>
              <p className="text-hi text-body mt-3">{film.pullQuote}</p>
            </div>
            <div className="glass rounded-lg p-6">
              <p className="font-eyebrow text-eyebrow-sm text-gold uppercase">
                Release
              </p>
              <p className="font-display text-display-sm text-hi mt-3">
                {film.releaseDateDisplay}
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* --- 5. Motion --------------------------------------------------- */}
      <Section eyebrow="Proof five" title="Motion">
        <p className="text-mid text-body max-w-prose">
          Hover each row. The difference is subtle by design — if an easing
          curve announces itself, it is the wrong curve. Under{" "}
          <Token>prefers-reduced-motion: reduce</Token> every one of these
          arrives instantly and the page stays complete.
        </p>

        <div className="mt-12 space-y-3">
          {EASES.map((e) => (
            <div
              key={e.name}
              className="group bg-surface-1 border-hairline hover:border-gold-dim dur-base overflow-hidden rounded-md border transition-colors"
            >
              <div className="flex items-center justify-between px-5 py-4">
                <div>
                  <Token>{e.name}</Token>
                  <p className="text-low text-meta mt-1">{e.note}</p>
                </div>
                <div className="bg-surface-3 relative h-1 w-32 overflow-hidden rounded-full sm:w-56">
                  <span
                    className={`bg-gold absolute inset-y-0 left-0 w-full origin-left scale-x-[0.08] transition-transform ${e.name} dur-slow group-hover:scale-x-100`}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-low text-meta mt-10 flex flex-wrap gap-x-6 gap-y-2">
          <span>dur-fast 240ms</span>
          <span>dur-base 520ms</span>
          <span>dur-slow 900ms</span>
          <span>dur-cinema 1400ms</span>
        </div>
      </Section>

      {/* --- 6. Grain ---------------------------------------------------- */}
      <Section eyebrow="Proof six" title="Grain">
        <p className="text-mid text-body max-w-prose">
          Mounted globally in <Token>app/layout.tsx</Token>, so it is already
          over this text. Easiest way to confirm: put your face close to the
          flat panel below. It should crawl very slightly — a 160px{" "}
          <Token>feTurbulence</Token> tile at 4%, drifting on a six-step
          transform loop. It stops moving under reduced motion.
        </p>

        <div className="bg-surface-2 mt-12 h-48 rounded-lg" />

        <p className="text-low text-body-sm mt-6 max-w-prose">
          Rendering the turbulence across the whole viewport instead of tiling
          it is the obvious implementation and the expensive one — it makes the
          browser rasterise a screen-sized SVG filter. Tiling is visually
          identical and effectively free.
        </p>
      </Section>

      <footer className="border-hairline text-low text-meta border-t py-16 uppercase">
        {film.studio} · {film.title} — {film.subtitle} ·{" "}
        {film.releaseDateDisplay}
      </footer>
    </main>
  );
}
