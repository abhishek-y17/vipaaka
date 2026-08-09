# CLAUDE.md — Vipāka (A Datadorks Film)

> Drop this at the repo root. Claude Code reads it automatically on every session.
> It is the single source of truth for design, motion, and architecture rules.

---

## §0 RAPID MODE — ACTIVE

This project ships in 2 days. Phases 0–2 (tokens, motion primitives, shell) are
complete and are not to be revisited. §0 overrides any process instruction
elsewhere in this file that conflicts with it.

### Stop doing these
- **No per-sprint profiling.** No frame-number tables, no ablation studies, no
  CPU-throttle runs. There is one perf pass, in Sprint D. The motion primitives
  were already profiled at 60fps in Phase 1; trust them.
- **No pushback rounds.** Previously you flagged and waited. Now: if something is
  ambiguous, pick the option that ships, add `// DECISION:` with one line of
  reasoning, and keep going. Only stop for a true blocker — a missing asset you
  cannot synthesise, or a choice that is expensive to reverse later.
- **No new abstractions.** If a thing is used twice, inline it twice. Extracting a
  component is a Sprint D activity if it happens at all.
- **No demo or kitchen-sink routes.** Build the real page.
- **No exploratory reading.** You know this codebase. Open the file you need.

### Keep doing these — they are cheap and they are why it looks good
- Tokens only. No inline beziers, durations, colours, or stagger values. This costs
  nothing and is the single thing preventing visual drift.
- The gold rule: gold marks skeleton, state, and one CTA. White carries content and
  operates the site. Check the withheld list before adding gold to anything.
- `prefers-reduced-motion` returns plain DOM. Already handled inside the primitives
  — just use them and don't hand-roll animation.
- `next/image` with explicit dimensions everywhere. CLS is not recoverable later.

### Scope cuts — already decided, do not re-litigate
- **Synopsis is a section on About, not a route.** Six nav items become five.
- **Chapters are cut.** `content/chapters.ts` ships empty, rail never renders.
- **Reviews: no profanity filter, no display names.** Rating, sentiment, body,
  honeypot. The RLS policies and rate-limit trigger you already wrote stay.
- **Trailers: no per-trailer FLIP origin.** One shared theater modal.

### Definition of done in rapid mode
`npm run build` clean · renders at 390 and 1440 · no console errors · reduced-motion
shows all content. That is the whole gate. Lighthouse and a11y are Sprint D.

### Time boxes — these are hard
If a thing exceeds its box, ship the fallback and add `// TODO(polish)`. Do not
spend a sprint perfecting one interaction.
- Theater FLIP morph: 45 min. Fallback: scale-from-0.96 + cross-fade. Nobody will
  know, and it is 90% of the feeling for 10% of the work.
- Custom player control bar: 90 min. Fallback: play/pause, scrubber, volume,
  fullscreen only. Cut quality/speed/captions/lock/loop.
- Any single animation: 20 min. Fallback: use `Reveal` and move on.

---

## 1. What this project is

A cinematic promotional website for **Vipāka — Till Understood**, a short film by **Datadorks**.

- **Vipāka** = the film title. **DATADORKS** = the studio (nav wordmark, top-left).
- Tone: dark, restrained, Sanskrit-noir. Black, gold, silence.
- Goal: the site should feel like a *title sequence you can scroll through*, not a landing page.
- Target quality bar: Apple Tahoe OS / Apple product pages — glossy glass, weighty easing, everything moves with intent, nothing bounces cheaply.

**Pages:** Home · About · Synopsis · Trailers · Film · Contact

---

## 2. Non-negotiable rules

1. **No backend service.** No FastAPI, no Render, no Node server. Next.js on Vercel + Supabase called directly from the browser. That is the whole infrastructure.
2. **Never use `localStorage`/`sessionStorage` as the source of truth for reviews.** Supabase is the store. Identity is a **Supabase Anonymous Auth** session (`signInAnonymously()` → real signed JWT → `auth.uid()`), not a UUID the client invents. localStorage holds only that session and a "has this device already rated" UI flag.
3. **Never expose the Supabase `service_role` key.** Only `NEXT_PUBLIC_SUPABASE_ANON_KEY`, protected by Row Level Security.
4. **Every animation respects `prefers-reduced-motion`.** Wrap all GSAP/Framer entrances in a check; fall back to instant opacity.
5. **Mobile is not a scaled-down desktop.** The mockups show distinct mobile layouts (stacked info rows on About, single-column crew list on Contact, compact control bar on Film). Build mobile from the mobile mockup, not by shrinking desktop.
6. **Never ship a layout shift.** Every image gets explicit `width`/`height` or `fill` + `sizes`. CLS target 0.
7. **Do not invent new sections, nav items, or reorder the nav.** The nav is exactly: Home, About, Synopsis, Trailers, Film, Contact. Logos and section structure from the mockups stay as-is; polish only.

---

## 3. Design tokens

Define all tokens in a single `@theme` block in `app/globals.css` — Tailwind v4 is CSS-first, there is no `tailwind.config.ts` in this repo.

`@theme` does both jobs at once: it generates the utilities (`bg-surface-2`, `text-gold`, `ease-cinema`) *and* emits the values as CSS custom properties. A `:root` block below it re-exports them under the exact names used here (`var(--gold)`, `var(--ease-cinema)`, `var(--dur-base)`) so raw CSS matches this spec verbatim. Those are aliases — never redefine a literal value in two places.

```css
:root {
  /* Surfaces — layered blacks, never pure #000 except the page floor */
  --void:        #030304;   /* page background */
  --surface-1:   #0A0A0C;   /* section bg */
  --surface-2:   #121215;   /* cards */
  --surface-3:   #1A1A1F;   /* raised / hover */

  /* Gold — the only accent. Use sparingly; scarcity is what makes it luxurious */
  --gold:        #D4A24C;
  --gold-bright: #F0B429;   /* CTAs, active state, star fill */
  --gold-dim:    #8A6B32;   /* hairline borders, dividers */
  --gold-glow:   rgba(212, 162, 76, 0.35);

  /* Text */
  --text-hi:     #F5F3EF;   /* headings — warm white, never #FFF */
  --text-mid:    #B8B5AE;   /* body */
  --text-low:    #6E6B66;   /* meta, timestamps */

  /* Glass */
  --glass-bg:     rgba(255, 255, 255, 0.04);
  --glass-border: rgba(255, 255, 255, 0.08);
  --glass-blur:   20px;

  /* Motion */
  --ease-cinema: cubic-bezier(0.22, 1, 0.36, 1);   /* default: heavy, expensive */
  --ease-glass:  cubic-bezier(0.16, 1, 0.30, 1);   /* panels, overlays */
  --ease-snap:   cubic-bezier(0.65, 0, 0.35, 1);   /* toggles, small state */
  --dur-fast:    240ms;
  --dur-base:    520ms;
  --dur-slow:    900ms;
  --dur-cinema:  1400ms;    /* hero reveals only */
}
```

### Typography

| Role | Font | Usage |
|---|---|---|
| Main headings | **Cinzel** | Page titles, section headings, **and all navigation at every breakpoint** — including the five large links in the mobile overlay |
| Small-caps labels | **Bebas Neue** | Section eyebrows, crew roles, stat labels. **Labels only — never navigation.** |
| Body / UI | **Montserrat** | All paragraphs, buttons, form fields, timestamps |

Bebas is a labelling face. The moment it is used for something a visitor clicks to go somewhere, the distinction between "this names a thing" and "this takes you somewhere" collapses, and the mobile overlay stops matching the desktop nav it replaces.

Load via `next/font/google` with `display: 'swap'` and subset `latin`. Never `@import` in CSS — it blocks render.

**Letter-spacing is the whole aesthetic.** Cinzel headings: `tracking-[0.18em]`. Eyebrows/small caps: `tracking-[0.35em]`. Body: normal.

### The gold ratio — where gold goes, and where it is withheld

Read off the five mockups in `docs/design/`. Gold is not decoration and it is not evenly rationed; it marks the **skeleton** of a page. Density rises as you go deeper into the site — Landing is almost monochrome, Contact is dense — and that gradient is deliberate. It is what makes the Landing page land.

**Gold is used for:**
- The active nav item and its underline. Always exactly one.
- In-content section headings and their rule (`ABOUT THE FILM`, `STORY SUMMARY`, `THE TEAM`, trailer row titles, crew roles).
- Icons that label data — the About info strip, the Contact crew rings and call buttons.
- State, progress and value — scrubber fill, chapter dots, star fill, the `4.6`.
- Exactly **one** primary CTA per page (`Submit Review`). Solid gold, black text. If a second one appears, one of them is wrong.
- The hero release date.
- Ornament rules and dividers.

**Gold is withheld from — and this list is the harder half:**
- Body copy. Always.
- **Page titles. Every page, no exceptions.** A page title is content; gold marks skeleton. This also protects the gradient — gold accumulates *down* a page, it must not front-load at the top of one. `Trailer page.png` renders `TRAILERS` in gold; that mockup is the outlier to correct, not a pattern to follow.
- Every player transport control — play, skip, volume, captions, settings, lock, loop, fullscreen are all white.
- Trailer play buttons. White ring, white triangle, on the most obviously "clickable" thing on the page.
- The four social buttons on Contact.
- Eyebrows over hero imagery (`A DATADORKS PRODUCTION`, `THREE GLIMPSES. ONE STORY.`, `A STORY WORTH TELLING`) — all white.

The shorthand: **gold tells you where you are and what something is worth. White is how you operate the site.** When in doubt, withhold — a heading can carry gold, a control almost never should.

### The gold rule

Recurring motif under every section heading. **Two variants**, both in one component — the mockups use both and they are not interchangeable:

```
left    2px tall, ~120px, linear-gradient(90deg, var(--gold) 0%, transparent 100%)
        For left-aligned headings. About page.
center  symmetric hairline pair with a small gold lozenge at the midpoint,
        optionally arrow-tipped. For centred headings. Trailers, Contact.
```
On scroll-into-view the left variant animates `scaleX: 0 → 1` from the left over `--dur-base` with `--ease-cinema`; the centre variant scales from the middle outward.

---

## 4. Motion system — "how it should feel"

The Apple feel comes from four things. Apply all four or it won't land.

**a) Weight.** Nothing moves linearly. Default to `--ease-cinema`. Entrances are slow-out; exits are fast. If it feels snappy, it's wrong — if it feels *inevitable*, it's right.

**b) Stagger.** Elements never appear together. Children stagger `60–90ms`. Letters in hero titles stagger `40ms`.

**c) Scroll is the timeline.** Use GSAP ScrollTrigger with `scrub: 1` (not `true` — the 1s lag is the luxury). Backgrounds parallax at `y: -15%` while foreground text moves `y: 0`. Hero title scales `1 → 1.08` and fades as you scroll past it.

**d) Light responds to the cursor.** Cards get a radial gold glow that follows the pointer (`--mx`/`--my` CSS vars updated on `pointermove`, throttled to `requestAnimationFrame`).

### The glossy/glass recipe

```css
.glass {
  background: linear-gradient(145deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02));
  backdrop-filter: blur(20px) saturate(140%);
  border: 1px solid var(--glass-border);
  box-shadow: 0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08);
}
```
The `inset 0 1px 0` top highlight is what reads as "glass". Do not omit it.
Add a `::before` sheen — a 20°-rotated white gradient at 6% opacity that sweeps across on hover over 800ms.

### Performance guardrails

- Animate **only** `transform` and `opacity`. Never `top`, `left`, `width`, `height`, `box-shadow` in a loop.
- `will-change` is applied on hover-intent and removed after — never left on permanently.
- `backdrop-filter` is expensive: max ~6 glass elements visible at once. On mobile, drop blur to `12px`.
- Any element with a persistent glow must not also be inside a `scrub` ScrollTrigger — pick one.
- Target: 60fps scroll on a mid-range Android. Test with CPU 4× throttle in DevTools.

---

## 5. Tech stack (final — differs from the original PDF)

| Layer | Choice | Note |
|---|---|---|
| Framework | Next.js 15 (App Router) + TypeScript | |
| Styling | Tailwind CSS v4 | |
| Components | shadcn/ui | Restyle to dark/gold; do not ship default zinc theme |
| Animation | Framer Motion (component state) + GSAP/ScrollTrigger (scroll) | Do not use both on the same element |
| Icons | Lucide React | |
| Video | **YouTube IFrame Player API** + custom skin | Replaces Vidstack |
| Data | **Supabase JS client, browser-direct** | Replaces FastAPI + Render + SQLAlchemy |
| Identity | **Supabase Anonymous Auth** | No login screen, but a real signed JWT. RLS keys off `auth.uid()` — never a client-supplied header |
| Hosting | Vercel free tier | |

**Dropped from the PDF and why:** FastAPI, Render, SQLAlchemy, Postman — a separate backend is unnecessary when Supabase's REST layer + RLS does the same job with zero servers to keep warm (Render free tier also cold-starts ~50s, which would be fatal on a review submit). Vidstack — dropped because the film plays from YouTube, and the IFrame API gives full control anyway.

---

## 6. File structure

```
app/
  layout.tsx                 # fonts, <Preloader>, <Nav>, <Grain>, <PageTransition>
  page.tsx                   # Home
  about/page.tsx
  synopsis/page.tsx
  trailers/page.tsx
  film/page.tsx
  contact/page.tsx
  globals.css
components/
  layout/      Nav.tsx  MobileMenu.tsx  Footer.tsx  PageTransition.tsx
  motion/      Reveal.tsx  SplitText.tsx  Parallax.tsx  GoldRule.tsx  MagneticButton.tsx
  ui/          GlassCard.tsx  Preloader.tsx  GrainOverlay.tsx  Spotlight.tsx
  player/      YTPlayer.tsx  PlayerControls.tsx  ChapterRail.tsx  TheaterShell.tsx
  reviews/     ReviewForm.tsx  StarRating.tsx  ReviewList.tsx  RatingSummary.tsx
lib/
  supabase.ts    anon-id.ts    youtube.ts    motion.ts    utils.ts
content/
  film.ts        # title, genre, runtime, language, release date, synopsis
  crew.ts        # 10 crew members from the Contact mockup
  trailers.ts    # YouTube IDs, titles, taglines, durations
  chapters.ts    # chapter timestamps for the Film page
public/
  vipaka-wordmark.png  vipaka-badge*.png  vipaka-banner.png  posters/
```

**All copy lives in `content/`.** Never hardcode a name, phone number, or runtime inside a component.

**All brand assets are referenced through `content/brand.ts`.** Never write a raw path to a logo file in a component — the registry is what stops the three marks getting swapped for one another.

---

## 6a. Brand assets — three files, three jobs

They are not interchangeable, and substituting one for another is the single most visible way to make this look amateur.

| File | Native | Job | Never |
|---|---|---|---|
| `vipaka-wordmark.svg` | vector | **Primary.** The film title. Hero, preloader, anywhere the title sits over imagery. | Never as a favicon or small mark |
| `vipaka-wordmark.png` | 463×159 | Raster fallback for the same job, capped at 463px. | Never above 463px displayed |
| `vipaka-badge*.png` | 626 / 512 / 192 / 180 / 32 | Black disc, transparent outside. Favicon, app icons, OG avatar, small footer mark. | **Never the hero title** |
| `vipaka-plate.avif` / `.webp` | 1983×793 | **Hero backdrop**, section backgrounds. Same collage key art as `vipaka-banner.png` with its baked-in title, epigraph and eyebrow removed. AVIF is the source `next/image` optimises from. | Never as a logo; never expect it to carry any text |
| `vipaka-banner-og.jpg` | 1200×630 | OpenGraph / Twitter card only, generated from `vipaka-banner.png`. Social scrapers do not reliably decode AVIF or WebP. | Never rendered in-page |
| `vipaka-banner.png` | 1983×793 | The composed poster — title, subtitle and epigraph baked in. Source for the OG image only. 1.5MB. | **Never the hero backdrop** — see the note below |

**`vipaka-banner.png` is not a background plate.** Phase 3 built the hero against it directly and got a double-exposed title — the file is a fully composed poster with its own wordmark, subtitle and epigraph already in the pixels, plus an eyebrow (`A DATADORKS FILM`) that turned out to be the *correct* one, catching a placeholder in `content/film.ts`. `vipaka-plate.*` is the same art with that baked text removed by masked reconstruction, not a re-export — there is a faint flattened patch roughly where the wordmark was (`TODO(brand)` in `content/brand.ts`, alongside the wordmark's own). Use `banner.png` only as the OG source; use `plate.*` for anything the hero's live type sits on top of.

**Never composite the wordmark onto a disc to fake the badge.** The badge exists; use it.

**The raster wordmark has a hard ceiling of 463px displayed width** — that is all the detail the extraction contains. `assertWordmarkWidth()` throws in development above it. The SVG is exempt from that ceiling.

**Wordmark colour is token-driven.** The SVG's two paths take their fills from `--wordmark-face` and `--wordmark-shadow`. The shadow points at `--gold-bright`, *not* at the source logo's `#FBDE2D` — that yellow is far more saturated than the palette and would read as a second gold sitting beside the hero release date.

**Do not letter-set the title in Cinzel as a substitute.** The wordmark is a logotype, not type.

---

## 7. Content facts

> **The mockups in `docs/design/` are stale on the title.** All five render the film as *Echoes of Silence*, including the Film page title bar. That was placeholder. The film is **Vipāka — Till Understood**; the studio is **Datadorks**. Take every title, subtitle and label from `content/film.ts` and never from a mockup. The mockups remain authoritative for layout, spacing and hierarchy — nothing else.

- Studio: **DATADORKS** · Film: **Vipāka — Till Understood**
- Tagline on banner: *"Karmany akarma yah paśyedakarmani ca karma yah"* (Bhagavad Gita 4.18)
- Release date shown in hero: **15-08-2026**
- Crew roles (Contact page, 10 cards, 2 columns desktop / 1 mobile): Director, Producer, Cinematographer, Screenplay Writer, Editor, Production Designer, Music Director, Costume Designer, Sound Designer, VFX Supervisor
- Social: Instagram, Email, YouTube, WhatsApp
- Trailers page: 3 items — Announcement Video (01:02), Trailer 1 (01:45), Trailer 2 (02:10)
- Film page pull-quote: *"Every story finds its roots in a moment of silence."*

---

## 8. Definition of done (every phase)

- [ ] `npm run build` passes with zero TS errors
- [ ] Renders correctly at 390px, 768px, 1440px
- [ ] `prefers-reduced-motion: reduce` produces a static but complete page
- [ ] Keyboard-navigable; visible gold focus ring on every interactive element
- [ ] No console errors/warnings
- [ ] Lighthouse: Performance ≥ 85 mobile, Accessibility ≥ 95
