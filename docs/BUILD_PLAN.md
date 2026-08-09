# Vipāka — Phase-Wise Build Plan

> ## ⛔ PHASES 3–9 ARE SUPERSEDED
> **Phases 3 through 9 below are superseded by `docs/RAPID.md`.** The timeline
> changed to a 2-day ship; those phases are replaced by four sprints (A–D).
> Do not follow them. Phases 0–2 are complete and remain accurate as history.
>
> Read `CLAUDE.md` §0 RAPID MODE and `docs/RAPID.md` instead.

**How to use this:** open the repo in VS Code with Claude Code. Put `CLAUDE.md` at the repo root first. Then run one phase per session — paste the ▶ **Prompt** block, review, commit, move on. Do not run two phases in one session; context bleed is what makes agents drift off-design.

**Commit convention:** `phase-N: <what>`. Tag each finished phase (`git tag p3-done`) so you can roll back a bad phase without losing good ones.

---

## Phase 0 — Foundation & design system
*~1 session. Nothing visual ships yet, but everything after depends on this.*

**Build**
1. `npx create-next-app@latest vipaka --ts --tailwind --app --eslint`
2. Install: `framer-motion gsap @supabase/supabase-js lucide-react clsx tailwind-merge`
3. `npx shadcn@latest init` → dark theme, then add `button dialog input textarea sheet skeleton toast`
4. Load Cinzel / Bebas Neue / Montserrat via `next/font/google` in `app/layout.tsx`
5. Write `globals.css` with the full token block from `CLAUDE.md` §3; mirror tokens into `tailwind.config.ts`
6. `lib/motion.ts` — export `EASE`, `DUR`, and a `useReducedMotion()` guard used by every animation
7. `components/ui/GrainOverlay.tsx` — fixed, `pointer-events-none`, 4% opacity SVG `feTurbulence` grain over the whole app. This single element does more for "cinematic" than any animation.
8. `content/*.ts` — film, crew, trailers, chapters. Placeholders where facts are unknown, typed properly.

**Acceptance:** a black page with grain, correct fonts rendering, tokens usable as `bg-surface-2 text-gold`.

▶ **Prompt**
> Read CLAUDE.md. Execute Phase 0 of BUILD_PLAN.md. Set up the Next.js 15 project, install deps, wire the three Google fonts, write globals.css with every token from CLAUDE.md §3 and mirror them into tailwind.config.ts, build GrainOverlay and lib/motion.ts, and scaffold the typed content/ files. Do not build any page sections yet. Show me the token file and one demo route proving fonts + grain work.

---

## Phase 1 — Motion primitives
*The reusable animation vocabulary. Build once, use on every page. Skipping this is why sites end up with 40 inconsistent animations.*

**Build** (`components/motion/`)
| Component | Behaviour |
|---|---|
| `Reveal` | Wraps children; on scroll-into-view fades + `y: 40 → 0` over `--dur-base` with `--ease-cinema`. Props: `delay`, `direction`, `once` |
| `SplitText` | Splits a heading into chars/words, staggers them in at 40ms. Used on all Cinzel page titles. **Use GSAP's own `SplitText` plugin** — since Webflow made GSAP 100% free (April 2025), every former Club plugin including SplitText, Flip, MorphSVG and ScrollTrigger is free for commercial use, no licence key |
| `GoldRule` | The gold hairline. `scaleX: 0 → 1` from left, `transformOrigin: left` |
| `Parallax` | ScrollTrigger `scrub: 1`, moves child on Y by a `speed` prop |
| `MagneticButton` | Button translates up to 8px toward the cursor within a 60px radius; springs back on leave |
| `Spotlight` | Wrapper that tracks pointer into `--mx`/`--my` CSS vars for the radial gold glow |
| `GlassCard` | The §4 glass recipe + sweeping sheen on hover + optional Spotlight |
| `PageTransition` | Route change: gold hairline wipes L→R across the viewport, old page fades to black, new page fades up. ~700ms total |
| `Preloader` | First load only. Vipāka wordmark draws in, a gold rule fills as assets load, then curtain lifts upward revealing the hero |

**Acceptance:** a `/kitchen-sink` dev route demoing all nine, 60fps under 4× CPU throttle, all silent under reduced-motion.

▶ **Prompt**
> Read CLAUDE.md. Execute Phase 1: build all nine motion primitives in components/motion and components/ui per the table in BUILD_PLAN.md Phase 1. Every one must respect prefers-reduced-motion via lib/motion.ts. GSAP only for scroll-driven things (Parallax), Framer Motion for everything else — never both on one element. Create a /kitchen-sink route demoing each. Verify 60fps with CPU throttling before you tell me it's done.

---

## Phase 2 — Shell: nav, mobile menu, footer
**Build**
- Desktop nav: DATADORKS logo left, six links center-right. Active link has a gold underline that **slides** between items using a shared `layoutId` (Framer Motion) — not a fade. This detail is very visible.
- Nav background is transparent at scroll 0, then transitions to glass + hairline bottom border after 80px.
- Mobile: hamburger → full-screen glass overlay, links stagger in at 80ms, backdrop blurs the page behind it.
- Footer: social row (Instagram, Email, YouTube, WhatsApp), copyright, Datadorks mark.

**Acceptance:** nav feels attached to the page, never jumps; mobile menu traps focus and closes on Escape and on route change.

▶ **Prompt**
> Read CLAUDE.md. Execute Phase 2: the app shell. Sliding gold underline via shared layoutId, glass-on-scroll nav, full-screen mobile overlay with focus trap and Escape handling, footer with the four socials. Wire PageTransition into app/layout.tsx.

---

## ~~Phase 3 — Home (Landing)~~ · SUPERSEDED by docs/RAPID.md Sprint A
*Reference: `Landing page.png`. The annotated speech bubbles in that mockup are design notes, not UI — do not build them as bubbles.*

**Build**
- Full-bleed hero: the dark forest-path banner, `object-cover`, with a subtle 8s ambient scale (1 → 1.04, ease-in-out, alternating). Vignette + gradient-to-black at the bottom so text always has contrast.
- Eyebrow `A DATADORKS PRODUCTION` (Bebas, wide tracking) → **VIPĀKA** wordmark → `— TILL UNDERSTOOD` → date `15 · 08 · 2026` in gold. Sequence them: eyebrow → title (SplitText) → tagline → date, ~200ms apart.
- Scroll-scrub: hero image parallaxes down, title scales to 1.08 and fades, next section rises over it.
- Below hero: the mockup's five prompts become **glass nav cards** — "Want to know how this story came to life? → About", "Start your journey here → Synopsis", "Watch the official trailer first → Trailers", "Ready to experience it? → Film", "Questions or collaborations? → Contact". Each is a Spotlight GlassCard with a gold arrow that translates right on hover.
- Scroll cue at the bottom of the hero: thin gold line that pulses downward.

**Acceptance:** hero holds 60fps while scrubbing; LCP under 2.5s (hero image `priority`, AVIF/WebP, blur placeholder).

▶ **Prompt**
> Read CLAUDE.md. Execute Phase 3: the Home page per Landing page.png. Full-bleed hero with ambient scale and scroll-scrub parallax, staggered title sequence using SplitText, and the five prompts rendered as Spotlight glass nav cards linking to each section. The speech bubbles in the mockup are annotations — render them as cards, not bubbles. Hero image must be priority-loaded with a blur placeholder; verify LCP < 2.5s.

---

## ~~Phase 4 — About + Synopsis~~ · SUPERSEDED by docs/RAPID.md Sprint A
*Reference: `About page.png`.*

**About**
- Page hero band with Cinzel `ABOUT THE FILM` + `A STORY WORTH TELLING` eyebrow, still image on the right bleeding into black.
- Two-column: still image left (parallax, slight rotate-on-hover), copy right.
- **Info strip** — Genre / Runtime / Language / Release Year in a 4-up glass bar with Lucide icons. Desktop: 4 columns with gold vertical dividers. Mobile: 4 stacked rows, icon-left, value-right (exactly as the mobile mockup shows). Numbers count up when scrolled into view.
- Story Summary block, then the pull-quote in a glass panel with an oversized gold `"` glyph and gold rules on both sides.

**Synopsis**
- Not in the mockups, so build it consistent with About: a centered vertical timeline of 3–5 beats, gold rule spine that **fills as you scroll** (ScrollTrigger scrub), each beat revealing alternately left/right. Spoiler-free copy from `content/film.ts`.

▶ **Prompt**
> Read CLAUDE.md. Execute Phase 4: About and Synopsis pages. About follows About page.png exactly, including the distinct mobile layout for the info strip (stacked rows, not a squeezed 4-column grid). Numbers count up on scroll-in. Synopsis is a scroll-filled vertical timeline in the same visual language. All copy from content/film.ts.

---

## ~~Phase 5 — The YouTube player~~ · SUPERSEDED by docs/RAPID.md Sprint B
*Reference: `Film page.png` + `PLAYER_SPEC.md`. Read PLAYER_SPEC.md before writing code.*

Short version: a `YTPlayer` component wraps the YouTube IFrame API with `controls=0 modestbranding=1 rel=0 playsinline=1`, and your own gold control layer sits **below/around** the video — never covering it. A GSAP FLIP transition morphs the poster card into a full-viewport theater.

**Build:** `YTPlayer` (API loader + state machine) → `PlayerControls` (play/pause, ±10s, volume, quality, speed, captions, fullscreen — all matching the mockup's icon row) → `ChapterRail` (dots on the scrubber, expandable timestamp list) → `TheaterShell` (FLIP morph + page dim + Escape to exit).

**Yes, it's free** — the IFrame API has no cost and no quota for embedded playback.

▶ **Prompt**
> Read CLAUDE.md and PLAYER_SPEC.md. Execute Phase 5: build the custom YouTube player. Follow PLAYER_SPEC.md exactly, especially the compliance constraints — controls go around the video, never as an overlay covering it during playback. Match the control icon row and chapter rail from Film page.png. Include the GSAP FLIP theater transition and full keyboard shortcuts.

---

## ~~Phase 6 — Trailers + Film pages~~ · SUPERSEDED by docs/RAPID.md Sprint B
*References: `Trailer page.png`, `Film page.png`.*

**Trailers**
- Header band with the projector image, Cinzel `TRAILERS`, eyebrow `THREE GLIMPSES. ONE STORY.`
- Three rows (thumbnail left / copy right on desktop; stacked on mobile), separated by gold hairlines. Announcement 01:02, Trailer 1 01:45, Trailer 2 02:10.
- Hover: thumbnail brightens, scales 1.03, play button ring rotates, and the row's hairline glows.
- Click → TheaterShell morph from that exact thumbnail.

**Film**
- Full-width player, film title bar above it with a back arrow, chapter rail beneath with the eight timestamps from the mockup.
- Below: the review section (Phase 7 fills it in) and the three-up "Love the film? / Have feedback? / Help us improve" strip.

▶ **Prompt**
> Read CLAUDE.md. Execute Phase 6: Trailers and Film pages per their mockups, using the Phase 5 player. Each trailer thumbnail morphs into the theater via FLIP from its own position. Chapter rail on Film uses content/chapters.ts.

---

## ~~Phase 7 — Reviews~~ · SUPERSEDED by docs/RAPID.md Sprint C
*Reference: `Film page.png` review block + `SUPABASE_SCHEMA.sql`.*

**Build**
1. Supabase project → run `SUPABASE_SCHEMA.sql` in the SQL editor. Confirm RLS is on and the anon key can insert but not update/delete.
2. `lib/anon-id.ts` — generate a UUID on first visit, store in localStorage, send with every write.
3. `StarRating` — 5 gold stars, fill sweeps L→R on hover with a slight scale-pop on the hovered star; tap-to-rate on mobile.
4. `ReviewForm` — Like/Dislike pills, stars, optional 1000-char textarea with live counter, gold Submit. **Optimistic UI**: the review appears instantly with a subtle shimmer, then settles or rolls back with a toast on failure.
5. `RatingSummary` — average + count, matching the mockup's `4.6 ★★★★★ (128 Reviews)`. Average animates from 0 on scroll-in.
6. `ReviewList` — "View All Reviews" opens a glass dialog, paginated 10 at a time.
7. Guards: one review per anon ID (upsert on conflict), honeypot field, client-side rate limit, profanity filter, `maxlength` enforced both client and DB side.

**Acceptance:** submit a review, hard-refresh, it's still there; open in a different browser, it's visible there too. Attempt an UPDATE from the browser console — it must fail.

▶ **Prompt**
> Read CLAUDE.md and SUPABASE_SCHEMA.sql. Execute Phase 7: the review system on Supabase called directly from the browser with the anon key and RLS — no API routes, no server. Anonymous UUID identity, optimistic UI with rollback, one-review-per-device via upsert, honeypot + rate limit + length caps. Match the review block in Film page.png. Then prove RLS works by trying to UPDATE someone else's row from the console and showing it's rejected.

---

## ~~Phase 8 — Contact~~ · SUPERSEDED by docs/RAPID.md Sprint A
*Reference: `Contact page.png`.*

- Header band with the spotlight/chair image, Cinzel `CONTACT`, eyebrow `OUR TEAM BEHIND THE FILM`.
- 10 crew glass cards: circular gold icon ring left, role (Bebas, gold) + name + phone, `tel:` call button right. 2 columns desktop, 1 mobile.
- Card hover: icon ring rotates slowly, card lifts 4px, gold border brightens, Spotlight glow follows the cursor.
- Cards reveal in a staggered wave (60ms, alternating column offsets).
- "Let's connect" row: four circular social buttons, MagneticButton behaviour, gold ring draws on hover.

▶ **Prompt**
> Read CLAUDE.md. Execute Phase 8: Contact page per Contact page.png. All 10 crew members from content/crew.ts, tel: links, staggered wave reveal, magnetic social buttons. Keep the layout and icons exactly as designed.

---

## ~~Phase 9 — Polish, SEO, ship~~ · SUPERSEDED by docs/RAPID.md Sprint D
**Build**
- Metadata + OpenGraph/Twitter cards per route; OG image = the Vipāka banner. Add `Movie` JSON-LD schema.
- `sitemap.ts`, `robots.ts`, favicon set from the circular Vipāka logo.
- Convert all stills to AVIF + WebP, correct `sizes`, blur placeholders everywhere.
- Custom 404 in-theme ("This scene doesn't exist").
- Accessibility sweep: focus rings, alt text, contrast check on gold-on-black (`#D4A24C` on `#030304` passes AA for large text — use `--gold-bright` for small text).
- Deploy: push to GitHub → import to Vercel → set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` → add your Vercel domain to Supabase's allowed origins.
- Add `vercel.json` with a weekly cron hitting `/api/keepalive`, a tiny route that runs one Supabase `select count(*)` — this is what stops the free project from pausing.
- Final: Lighthouse on mobile, real-device test on a mid-range Android.

▶ **Prompt**
> Read CLAUDE.md. Execute Phase 9: metadata and OG cards per route, Movie JSON-LD, sitemap, robots, favicons from the circular Vipāka logo, image format conversion, themed 404, full a11y sweep, and Vercel deploy config. Run Lighthouse mobile and fix anything under 85 performance or 95 accessibility.

---

## Sequencing

```
Phase 0 ──▶ 1 ──▶ 2 ──┬──▶ 3 ──▶ 4 ──────────────┐
                       └──▶ 5 ──▶ 6 ──▶ 7 ──▶ 8 ──┴──▶ 9
```
Phase 5 is the highest-risk item — if you have limited time, do 0→1→2→5 first and prove the player works before building the marketing pages around it.

---

## Risks, honestly

| Risk | Reality | Mitigation |
|---|---|---|
| YouTube ToS on custom controls | Custom controls via the IFrame API are permitted; **covering the video with your own UI during playback is not** | Controls live below/beside the video; overlay only when paused. See PLAYER_SPEC.md §5 |
| Heavy motion tanks mobile perf | `backdrop-filter` + `scrub` + glow together will drop frames on mid-range Android | Token-level mobile downgrades (blur 20→12px, disable Spotlight under 768px), and the CPU-throttle test gate in every phase |
| Review spam | Anon writes with no auth are open by definition | RLS insert-only, one-per-UUID upsert, honeypot, rate limit, length cap. Add Supabase Edge Function + Turnstile only if abuse actually appears |
| Supabase free tier pauses after 7 days idle | Confirmed: no API request / DB query / Edge Function call for 7 days = project paused. Opening the *dashboard* does **not** count — it watches real API traffic | A weekly Vercel cron hitting the REST endpoint. Data is preserved while paused, just unreachable until you restore it |
| Vercel free tier is non-commercial | If Vipāka is ever monetized, the Hobby plan is technically out of scope | Fine for a promotional short-film site; upgrade if you sell anything |
| Autoplay with sound is blocked everywhere | Hero video/audio won't start on its own | Hero is a still image with ambient motion — no autoplay dependency. Player starts muted if it ever autoplays |
