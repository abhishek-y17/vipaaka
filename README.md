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

Then open **http://localhost:3000**.

`npm run dev` uses Turbopack. The first request to each route compiles on
demand, so the initial load of a page is slower than every load after it.

### Environment variables

The site runs fully without any env vars until the review system lands
(Sprint C). At that point, copy the example file and fill it in:

```bash
cp .env.local.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Both are public by design and protected by Row Level Security. **Never put the
Supabase `service_role` key in this file, or in any `NEXT_PUBLIC_*` variable.**

### All commands

| Command | What it does |
|---|---|
| `npm run dev` | Dev server with Turbopack, on :3000 |
| `npm run build` | Production build — the primary gate |
| `npm run start` | Serve the production build (run `build` first) |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |

Before considering anything done: `npm run build`, `npm run lint` and
`npm run typecheck` all clean, page renders at 390px and 1440px, no console
errors, and `prefers-reduced-motion` still shows all content.

### Testing reduced motion

Every animation must degrade to a complete static page. In Chrome DevTools:
**Rendering → Emulate CSS media feature prefers-reduced-motion → reduce**.
Content must all still be visible — no element stuck at `opacity: 0`.

---

## Tech stack

| Layer | Choice | Note |
|---|---|---|
| Framework | Next.js 15 (App Router) + TypeScript | React 19 |
| Styling | Tailwind CSS v4 | CSS-first; **no `tailwind.config.ts`** |
| Components | shadcn/ui | Restyled to dark/gold; the default zinc theme is never shipped |
| Animation | Framer Motion + GSAP/ScrollTrigger | Split by role, see below |
| Icons | Lucide React | Brand glyphs are hand-drawn — Lucide dropped them |
| Video | YouTube IFrame Player API + custom skin | Free, no quota for embedded playback |
| Data | Supabase JS, browser-direct | No API routes, no server |
| Identity | Supabase Anonymous Auth | A real signed JWT; RLS keys off `auth.uid()` |
| Hosting | Vercel | |

**There is no backend service.** Next.js on Vercel plus Supabase called
directly from the browser is the entire infrastructure. A separate API server
was dropped deliberately: Supabase's REST layer plus RLS does the same job with
nothing to keep warm.

### The two animation libraries do not overlap

- **GSAP/ScrollTrigger** — anything whose timeline is the scrollbar. Parallax,
  the hero's scale-and-fade, the Synopsis spine fill. Always `scrub: 1`, never
  `scrub: true`; the one-second lag is the effect.
- **Framer Motion** — anything driven by state. Entrances, the nav's sliding
  underline, the mobile overlay.

**Never both on one element.** They fight over `transform` and the later write
silently wins. If a component seems to need both, it is doing two jobs and
should be split.

---

## Project layout

```
app/                 routes; globals.css holds every design token
components/
  brand/             wordmark, studio mark, social glyphs
  layout/            Nav, MobileMenu, Footer, PageTransition
  motion/            Reveal, SplitText, GoldRule, Parallax, MagneticButton
  ui/                GlassCard, Spotlight, Preloader, GrainOverlay, shadcn
  home/ about/ contact/   page sections
content/             ALL copy and facts — see below
lib/                 motion tokens, gsap registration, utils
docs/                CLAUDE.md's companions: RAPID.md, PLAYER_SPEC.md, design/
public/              brand assets
```

### Two rules that matter more than they look

**All copy and facts live in `content/`.** Never hardcode a name, phone number,
runtime or date inside a component.

**All brand assets are referenced through `content/brand.ts`.** Never write a
raw path to an image in a component — the registry is what stops the three
marks being swapped for one another. They are not interchangeable:

- `vipaka-wordmark.svg` — the film title. Inlined, not `<img>`'d, because its
  fills are driven by CSS custom properties that do not cross into an image
  document.
- `vipaka-badge*.png` — black disc. Favicon and app icons. **Never the title.**
- `vipaka-plate.*` — the hero backdrop: key art with its baked-in type removed.
- `vipaka-banner.png` — the composed poster, title baked in. **OG image only**,
  never a background.

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

---

## Documentation

- **`CLAUDE.md`** — the single source of truth for design, motion and
  architecture. §0 declares the current working mode; read it first.
- **`docs/RAPID.md`** — the active 2-day sprint plan. Supersedes Phases 3–9 of
  the build plan.
- **`docs/BUILD_PLAN.md`** — original phase plan. Phases 0–2 are accurate
  history; **3–9 are superseded**.
- **`docs/PLAYER_SPEC.md`** — the custom YouTube player.
- **`docs/SUPABASE_SCHEMA.sql`** — reviews schema, RLS policies, rate limiting.
- **`docs/design/`** — the five page mockups. Authoritative for layout, spacing
  and hierarchy. **Not authoritative for the title** — all five predate the
  rename and show "Echoes of Silence".
