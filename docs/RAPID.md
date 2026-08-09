# RAPID MODE — 2-day ship

Phases 0–2 are done. Everything below replaces Phases 3–9 of BUILD_PLAN.md.

**Part 1** goes at the top of `CLAUDE.md`. **Part 2** is four prompts, one per session.

---

# PART 1 — paste at the top of CLAUDE.md

```markdown
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
```

---

# PART 2 — four sprints

Run each as one session. Do not review between steps inside a sprint; review at the end of each.

---

## Sprint A — every content page (Home, About+Synopsis, Contact)

```
Read CLAUDE.md §0 RAPID MODE first — the method has changed. Two days total.
Phases 0–2 are done. Build three pages in this one session, no profiling, no
pushback rounds, decisions inline as // DECISION: comments.

Asset corrections to apply first:
- public/vipaka-plate.png is the hero backdrop (key art with baked type removed).
- public/vipaka-banner.png is now the OG/social image only, never a background.
- Eyebrow copy is "A DATADORKS FILM", not "A DATADORKS PRODUCTION". Fix
  content/film.ts.
- Convert vipaka-plate.png to AVIF+WebP before using it. It's the LCP image.

HOME — docs/design/Landing page.png
Full-bleed hero on the plate, ambient scale 1→1.04 over 8s, vignette and
gradient-to-black at the bottom. Sequence: eyebrow → wordmark (inline the SVG,
it's in the LCP path) → TILL UNDERSTOOD → 15 · 08 · 2026 in gold, ~200ms apart.
Scroll-scrub: image parallaxes, title scales to 1.08 and fades.
The mockup's speech bubbles are annotations, not UI — they become five glass nav
cards. Card monochrome at rest, hairline border, white label, destination word
gold at rest. Hover escalates: border warms, arrow translates, spotlight arrives.
Four cards now, not five — Synopsis is no longer a route.

ABOUT — docs/design/About page.png
Header band, two-column image + copy, then the Genre/Runtime/Language/Release
info strip: 4 columns with gold dividers on desktop, 4 stacked icon-left rows on
mobile per the mobile mockup. Numbers count up on scroll-in.
Then Story Summary, then the pull-quote panel with the oversized gold quote glyph.
Then SYNOPSIS as a section on this same page, not a route: 3–5 beats on a centred
vertical spine, gold rule filling on scroll-scrub, beats alternating left/right.
Update the nav to five items.

CONTACT — docs/design/Contact page.png
Ten crew glass cards, circular gold icon ring, role in Bebas gold, name, phone.
Two columns desktop, one mobile. Staggered wave reveal. Cards stay placeholder —
phone: "" so the call button renders inert. Hover: ring rotates, card lifts,
spotlight follows. "Let's connect" row: four magnetic social buttons, white not
gold.

Gate: build clean, renders at 390 and 1440, no console errors, reduced-motion
shows all content. Then stop and show me all three.
```

---

## Sprint B — player, Trailers, Film

```
CLAUDE.md §0 RAPID MODE. Highest-risk sprint — respect the time boxes literally.

PLAYER — docs/PLAYER_SPEC.md, but scoped down
YouTube IFrame API, controls=0, playsinline=1, rel=0, origin set. Singleton script
loader. State machine, rAF time polling while playing only.
Control bar, 90 min box: play/pause, scrubber with buffered range, current time,
duration, volume, fullscreen. Ship that and stop. Quality, speed, captions, lock
and loop are cut unless the first six took under an hour.
Keyboard: space, arrows, F, M, Escape. Skip the shortcuts panel.
Theater, 45 min box: try GSAP FLIP from the poster. If it fights you at all, fall
back to scale-from-0.96 plus cross-fade and move on — it is 90% of the feeling.
Body scroll lock, focus trap, Escape, pause on exit, restore focus.
Compliance, non-negotiable: controls sit below or at the bottom edge of the video,
never covering it during playback. Poster overlay before first play and while
paused is fine.
No chapters. content/chapters.ts stays empty, rail never renders.

TRAILERS — docs/design/Trailer page.png
Header band, three rows separated by gold hairlines, thumbnail left copy right on
desktop, stacked on mobile. Announcement 01:02, Trailer 1 01:45, Trailer 2 02:10.
Play buttons are WHITE — check the withheld list. Page title white, not gold; the
mockup's gold title is the outlier we're correcting. One shared theater modal, no
per-trailer FLIP origin.

FILM — docs/design/Film page.png
Full-width player, title bar with back arrow above. Review section is a placeholder
div this sprint — Sprint C fills it. Three-up "Love the film / Have feedback /
Help us improve" strip below.

Gate: same as Sprint A. Then show me the player working on a real video.
```

---

## Sprint C — reviews

```
CLAUDE.md §0 RAPID MODE.

Run docs/SUPABASE_SCHEMA.sql in the Supabase SQL editor — the Anonymous Auth
version with auth.uid() policies and the rate-limit trigger. Enable CAPTCHA on
anonymous sign-in before anything ships; auth.users is the floodable surface.
Env: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY. Never the
service_role key.

Build into the Film page:
- StarRating: 5 gold stars, fill sweeps L→R on hover, pop on the hovered star,
  tap-to-rate on mobile.
- ReviewForm: Like/Dislike pills, stars, optional 1000-char textarea with counter,
  honeypot, gold Submit. Optimistic insert with rollback and a toast on failure.
- RatingSummary: average and count from the review_stats view, matching the
  mockup's 4.6 ★★★★★ (128 Reviews). Average animates from 0 on scroll-in.
- ReviewList: "View All Reviews" opens a glass dialog, 10 per page.
No profanity filter, no display names — cut.

Gate: submit a review, hard-refresh, it persists. Open a different browser, it's
visible. Try to UPDATE another row from the console — it must fail. Show me that
last one actually failing.
```

---

## Sprint D — ship

```
CLAUDE.md §0 RAPID MODE. Final sprint. This is where the deferred work lands.

1. Metadata and OG per route. OG image is vipaka-banner.png — baked-in title is
   correct in a link preview. Movie JSON-LD, sitemap.ts, robots.ts, favicons from
   vipaka-badge-*.png.
2. All images to AVIF+WebP with explicit dimensions and blur placeholders.
3. Themed 404.
4. THE perf pass — the only one. Lighthouse mobile. Fix anything under 85
   performance or 95 accessibility. Focus rings, alt text, gold-on-black contrast
   (use --gold-bright for small text).
5. vercel.json with a weekly cron to /api/keepalive doing one Supabase count, so
   the free project never pauses.
6. Deploy: GitHub → Vercel → env vars → add the Vercel domain to Supabase auth
   URL config.
7. Grep for TODO(polish), TODO(brand), TODO(facts), TODO(copy) and give me the
   list — that's the post-launch backlog, not this sprint's work.

Then tell me what's still placeholder, so I know what to swap before announcing.
```

---

## What I cut, so you can object now rather than later

| Cut | Why it's safe |
|---|---|
| Synopsis route | Wasn't in the mockups — I invented it. Works better as an About section anyway |
| Chapter rail | Runtime isn't locked; a short probably doesn't want one |
| Per-trailer FLIP origin | One shared modal is indistinguishable to a visitor |
| Half the player controls | Quality/speed/captions/lock/loop are YouTube's job on a 15-minute film |
| Profanity filter, display names | Anonymous ratings don't need either on day one |
| Per-sprint profiling | Primitives were profiled once at 60fps; pages reuse them |

## The one real risk

Sprint B. A custom player is the only thing here that can silently eat six hours. If the control bar isn't working by its box, ship play/pause plus scrubber and move on — a plain player on a beautiful site reads as restraint. A half-finished custom player reads as broken.
