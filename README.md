# Vipāka — Till Understood

Promotional site for **Vipāka — Till Understood**, a short film by **Datadorks**.

Dark, restrained, Sanskrit-noir. The goal is a title sequence you can scroll
through, not a landing page.

---

## Running the project

### Requirements

- **Node.js 20.19+ or 22.13+** — the toolchain runs on older 22.x, but ESLint 9
  emits an engine warning below those versions.
- **npm 10+** (ships with the above).

### First run

```bash
npm install
npm run dev
```

The dev server starts on port **3000**. It uses Turbopack, and each route
compiles on first request, so the first load of a page is slower than every
load after it.

### Environment variables

Copy the example file and fill it in:

```bash
cp .env.local.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Both are public by design and protected by Row Level Security. **Never put the
Supabase `service_role` key in this file, or in any `NEXT_PUBLIC_*` variable.**

The site builds and runs with these unset — every review component degrades to
an inert state rather than throwing. Reviews simply do not appear.

### Commands

| Command | What it does |
|---|---|
| `npm run dev` | Dev server with Turbopack |
| `npm run build` | Production build — the primary gate |
| `npm run start` | Serve the production build (run `build` first) |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |

### Definition of done

Before considering anything finished:

- `npm run build`, `npm run lint` and `npm run typecheck` all clean
- renders correctly at **390px, 768px and 1440px**
- no console errors or warnings
- `prefers-reduced-motion: reduce` produces a static but **complete** page
- keyboard-navigable, with a visible gold focus ring on every control

To test reduced motion in Chrome DevTools: **Rendering → Emulate CSS media
feature prefers-reduced-motion → reduce**. Every element must still be
visible — nothing stuck at `opacity: 0`.

---

## Architecture

**There is no backend service.** Next.js plus Supabase called directly from the
browser is the entire infrastructure. A separate API server was dropped
deliberately: Supabase's REST layer plus RLS does the same job with nothing to
keep warm, and a cold start on a review submit would be fatal.

| Layer | Choice | Note |
|---|---|---|
| Framework | Next.js 15 (App Router) + TypeScript | React 19 |
| Styling | Tailwind CSS v4 | CSS-first; **no `tailwind.config.ts`** |
| Components | shadcn/ui | Restyled to dark/gold; the default zinc theme is never shipped |
| Animation | Framer Motion + GSAP/ScrollTrigger | Split by role, see below |
| Icons | Lucide React | Brand glyphs are hand-drawn — Lucide dropped its brand set |
| Video | YouTube IFrame Player API | Native YouTube controls, see below |
| Data | Supabase JS, browser-direct | No API routes, no server |
| Identity | Supabase Anonymous Auth | A real signed JWT; RLS keys off `auth.uid()` |

### The two animation libraries do not overlap

- **GSAP/ScrollTrigger** — anything whose timeline is the scrollbar. Parallax,
  the hero's scale-and-fade, the Synopsis spine fill. Always `scrub: 1`, never
  `scrub: true`; the one-second lag is the effect.
- **Framer Motion** — anything driven by state. Entrances, the nav's sliding
  underline, the mobile overlay.

**Never both on one element.** They fight over `transform` and the later write
silently wins. If a component seems to need both, it is doing two jobs and
should be split.

GSAP is loaded on demand through `lib/gsap.ts`, not imported directly — it is
~111 kB that cannot do anything until the visitor scrolls, so it must not block
first paint. Every consumer renders its resting state in the initial HTML and
GSAP only ever animates away from it.

### The player uses YouTube's own controls

An earlier version wrapped the embed in a custom transport bar. It was removed
after measurement, and the reasons are recorded in `components/player/YTPlayer.tsx`:
the quality API it existed to expose is inert in both directions, iOS implements
the Fullscreen API only for real `<video>` elements so the fullscreen button
could not work there, and running both chromes at once gave every video two
scrubbers and two fullscreen buttons.

### Anonymous auth is lazy, and that is load-bearing

`ensureAnonSession()` must never run on page load, in a layout, in a provider,
or on mount. It fires on the first real interaction with the review form — first
star, first pill, first keystroke — once per device. **Every sign-in is a
monthly active user against a 50,000 free-tier cap**, so a session created on
page load would bill every passing visitor for a form they never touched.

---

## Project layout

```
app/                 routes; globals.css holds every design token
components/
  brand/             wordmark, studio mark, social glyphs
  layout/            Nav, MobileMenu, Footer, PageTransition
  motion/            Reveal, SplitText, GoldRule, Parallax, MagneticButton
  player/            YTPlayer, TheaterShell
  reviews/           ReviewForm, ReviewList, StarRating, RatingSummary
  ui/                GlassCard, Spotlight, Preloader, GrainOverlay, shadcn
  home/ about/ contact/ film/ world/   page sections
content/             ALL copy and facts
lib/                 motion tokens, gsap loader, supabase, seo, utils
public/              brand assets, production stills, world art
```

### Two rules that matter more than they look

**All copy and facts live in `content/`.** Never hardcode a name, phone number,
runtime or date inside a component. That includes durations, social handles and
release dates.

**All brand assets are referenced through `content/brand.ts`.** Never write a
raw path to an image in a component — the registry is what stops the marks being
swapped for one another. They are not interchangeable:

- `vipaka-wordmark.svg` — the film title. Inlined rather than `<img>`'d, because
  its fills come from CSS custom properties, and those do not cross into an
  image document.
- `vipaka-badge*.png` — black disc. Favicon and app icons. **Never the title.**
- `vipaka-plate.png` — the hero backdrop: the key art with its baked-in type
  removed.
- `vipaka-banner.png` — the composed poster, title baked in. **Social card
  only**, never a background; laying live type over it double-exposes both.
- `brand/datadorks-mark-mono.png` — the studio mark, white knockout. Used in the
  site chrome. The full-colour original is cyan, which in a black-and-gold
  palette becomes the highest-chroma thing on screen and pulls focus off the
  film.

---

## Design system

Every token is defined once in a single `@theme` block in `app/globals.css`.
Tailwind v4 is CSS-first, so there is no `tailwind.config.ts` — that file's
absence is deliberate, not an oversight.

**If a value is not a token, it does not go in a component.** No inline
cubic-beziers, no magic durations, no hand-typed stagger. This is the single
cheapest thing preventing visual drift across pages.

### The gold rule

Gold is the only accent, and the withheld list matters more than the used list.

**Gold marks skeleton, state, and value** — the active nav item, in-content
section headings and their rules, data-labelling icons, progress and ratings,
and exactly one primary CTA per page.

**White operates the site** — body copy, every page title, all player transport
controls, trailer play buttons, the social buttons.

Density rises with depth: Home is nearly monochrome, Contact is dense. That
gradient is deliberate and is what makes the landing page land.

### Typography

| Role | Font |
|---|---|
| Headings and **all navigation** | Cinzel |
| Small-caps labels and eyebrows | Bebas Neue |
| Body and UI | Montserrat |

Bebas is a labelling face and never navigates. Letter-spacing carries the
aesthetic — it is part of the type scale, not a per-component decision, and it
tightens as the scale goes up.

---

## Database

`docs/SUPABASE_SCHEMA.sql` is the whole of it: the reviews table, its RLS
policies, the sentiment ordering column and the rate-limit trigger. Running that
file against a fresh Supabase project reproduces the backend exactly.

Two things are enforced in the database rather than the UI, and the UI checks
are experience only — never treat them as the security boundary:

- reviews cannot be inserted before the film's release timestamp
- a row can only be updated by the `auth.uid()` that created it
