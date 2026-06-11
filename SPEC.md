# Nuro Marketing Site — Build Spec

**Target repo:** `~/nuro-site` (existing skeleton: Next 15 App Router, React 19, Tailwind v4, TypeScript, `src/app`, dev port 3300)
**Harness:** claude-harness, GitHub Issues tracker, cards below map 1:1 to issues.
**Date:** 2026-06-11

---

## 1. What we are building

A single-page marketing site for Nuro that is a 1:1 **content** port of the live site (nuroai.dev), a 1:1 **layout/structure** port of the approved design (`~/nuro-website-design/Nuro.html` + `nuro-site/*.css`), with the **motion system** upgraded to match the Nuro webapp (`~/nuro`) aesthetic:

1. **Blur scroll reveals on ALL content** — every element starts blurred + translated down; as it scrolls into view it smoothly animates up and unblurs. This is the signature motion of the whole site.
2. **Holographic gradient animations** — large, heavily blurred aurora blobs that drift and shift together behind sections; animated 5-stop holographic gradients on text, buttons, and accents.
3. Overall feel: smooth, holographic, clean, minimal, modern. Calm motion, no harshness.

### Source-of-truth hierarchy (when sources conflict)
| Concern | Source of truth |
|---|---|
| Copy, data, stats, video, form fields | Live site nuroai.dev (inventory in §4 — use verbatim) |
| Section structure, layout, spacing, type scale | `~/nuro-website-design` (HTML/CSS reference) |
| Motion tokens, gradient/blob implementations | `~/nuro` webapp (`app/globals.css`, `components/brand/*`) |

Both reference projects are on local disk. Implementers SHOULD read the reference files directly when building a card.

---

## 2. Tech & conventions

- Next 15 App Router, static-first (the whole page is a server component except interactive islands: nav scroll state, video play, waitlist form, reveal/aurora observers).
- Tailwind v4 CSS-first config: all design tokens live in `src/app/globals.css` under `@theme` / `:root`. No `tailwind.config`.
- **No animation library.** CSS keyframes + IntersectionObserver only (this is how both references do it). No framer-motion, no GSAP.
- Fonts via `next/font/google`: Inter Tight (400–800, display), Inter (400–700, body), JetBrains Mono (400–600, eyebrows/meta).
- Animate **only `transform`, `opacity`, `filter`**. Never `transition: all`. Entrances use ease-out family curves.
- `prefers-reduced-motion: reduce` globally disables reveals, blob drift, and gradient drift (content must be fully visible/sharp with no JS and no motion).
- Validation gate for every card: `pnpm typecheck && pnpm lint && pnpm build` must pass (see §7).

---

## 3. Design system (exact values)

### 3.1 Colors

```css
/* Surfaces (light, cream — never pure white page bg) */
--bg: #FAF7F2;        /* page */
--bg-2: #F4EFE8;
--surface: #ffffff;   /* cards */
--ink: #16161C;       /* primary text + dark buttons */
--ink-2: #3A3F45;     /* secondary */
--ink-3: #6B7177;     /* muted */
--hair: rgba(22,22,28,.08);   /* hairline borders */
--hair-2: rgba(22,22,28,.14);

/* Dark band + footer */
--night: #08080D;
--night-2: #0E0E16;
--night-card: rgba(255,255,255,.045);
--night-text: #F4F3F7;
--night-dim: rgba(244,243,247,.62);

/* Holographic stops (the brand) */
--holo-1: #A7C7FF;  /* sky */
--holo-2: #C9B8FF;  /* lavender */
--holo-3: #E8BFE6;  /* mauve */
--holo-4: #FFC9E3;  /* pink */
--holo-5: #FFD9C2;  /* peach */
--holo-linear: linear-gradient(120deg, var(--holo-1) 0%, var(--holo-2) 32%, var(--holo-3) 58%, var(--holo-4) 80%, var(--holo-5) 100%);

/* Aurora blob tints */
--blob-blue: #9CC0FF; --blob-purple: #BAA4FF; --blob-violet: #C9AAFF;
--blob-pink: #FFB6D9; --blob-magenta: #F891FF; --blob-peach: #FFD9C2;
```

### 3.2 Motion tokens

```css
--dur-fast: 180ms;
--dur: 320ms;
--dur-slow: 620ms;
--ease: cubic-bezier(0.22, 1, 0.36, 1);         /* default — soft spring exit */
--ease-spring: cubic-bezier(0.34, 1.4, 0.64, 1); /* overshoot, sparing use */
```

### 3.3 Type scale

| Use | Font | Size | Weight | Tracking |
|---|---|---|---|---|
| H1 hero | Inter Tight | `clamp(46px, 7.5vw, 92px)` | 700 | -0.035em, lh 1.0 |
| H2 section | Inter Tight | `clamp(34px, 4.6vw, 62px)` | 700 | -0.032em, lh 1.02 |
| Lead | Inter | `clamp(17px, 1.6vw, 20px)` | 400 | lh 1.55 |
| Body | Inter | 15–17px | 400 | lh 1.5–1.62 |
| Eyebrow | JetBrains Mono | 12px | 500 | 0.18em, uppercase |
| Stat source | JetBrains Mono | 10.5px | 400 | 0.06em, uppercase |
| Nav link | Inter Tight | 11.5px | 500 | 0.16em, uppercase |

### 3.4 Layout

- Container max-width **1160px**, padding 40px desktop / 22px mobile.
- Section vertical padding **118px** desktop / **80px** ≤920px.
- Radii: 12px (inputs/small buttons), 22–26px (cards), 999px (pills).
- Shadows: `--shadow-holo: 0 12px 40px rgba(167,199,255,.35), 0 4px 14px rgba(232,191,230,.25)` for gradient CTAs; soft ink shadows elsewhere (see `~/nuro` `--shadow-s/m/l`).
- Single breakpoint: **920px** — all 2/3-col grids collapse to 1 col, nav left links hide.

---

## 4. Content inventory (verbatim — from live nuroai.dev)

> Copy below is the source of truth. Do not rewrite, "improve", or paraphrase it.

### Nav (fixed, frosted glass)
Left links (smooth-scroll): **The Problem** → `#problem` · **Business Case** → `#business-case` · **Solution** → `#features`. Center: Nuro symbol logo (click = scroll top). Right: Instagram + LinkedIn icons, pill button **"Join waitlist"** → `#waitlist`.
Social URLs: `https://www.instagram.com/nuroai.dev/` · `https://www.linkedin.com/company/nuroaidev/`

### Hero (min 100vh, aurora background)
- H1: **"The missing tool for neurodivergent students."** — gradient text on the word "neurodivergent".
- Sub: "Learning that finally works for the 1 in 6, bringing teachers, students and parents together so no child falls through the cracks again."
- CTA: "Join the waiting list" (arrow icon) → `#waitlist`.
- Demo video: click-to-play. Thumbnail `https://img.youtube.com/vi/y2jKMmFu-E8/maxresdefault.jpg`, on click swap in iframe `https://www.youtube-nocookie.com/embed/y2jKMmFu-E8?autoplay=1&rel=0&modestbranding=1`. Aria: "Play Nuro demo video" / "Nuro demo video thumbnail". Centered play button, scale 1.07 on hover.

### Problem `#problem`
- Eyebrow: "The Problem" · chip: "🇸🇪 Initial market, Sweden"
- H2: **"The system is failing our most vulnerable students."** (gradient on "most vulnerable students.")
- Sub 1: "And it's costing EVERYONE, teachers, families and schools." (EVERYONE bold)
- Sub 2: "225,000+ neurodivergent students in Sweden have a legal right to support they are not receiving."
- 3 stat cards:
  - **94%** (blue accent) — "of teachers say they do not have the right tools to support neurodivergent students." — Karolinska Institute, Emma Leifler (2022)
  - **82%** (purple accent) — "of teachers say they do not have enough time to properly support students with additional needs." — Skolverket, 2018
  - **51%** (pink accent) — "of schools admit that students with NDD diagnoses are NOT getting the support they are legally entitled to." — Lärarnas Riksförbund

### Business case `#business-case`
- Eyebrow: "The Business Case"
- H2: **"This isn't just the right thing to do."** · Sub: "It's the smartest investment a school can make."
- Body: "When students with special needs don't get timely support, they become school refusers. Schools then face spiralling costs: specialist programs, home tuition, social services and eventually welfare dependency. Nuro is a preventative intervention that pays for itself many times over."
- Stat card: **15M SEK** (gradient numeral) — "estimated lifetime societal cost of one student dropping out due to lack of support." — Skandia Stiftelse. Card has soft holographic background overlay.

### Solution `#features`
- Eyebrow: "The Solution" · H2: **"One platform."** · Sub: "For every person who cares about the child."
- Two-column comparison:
  - **Before Nuro** (X icons): 1. Individual strengths go unseen, individual needs go unmet. 2. Lessons follow one rigid format that doesn't fit everyone. 3. Teachers firefight instead of adapting support. 4. Parents are left guessing how their child is really doing. 5. Help arrives late, generic, or not at all.
  - **With Nuro** (gradient check icons, card has soft holo tint): 1. Every student gets a profile built around their strengths and needs. 2. Lessons are auto-adapted into clear, structured steps each child can follow. 3. Teachers deliver targeted help without extra planning hours. 4. Parents see exactly how their child is progressing, in real time.

### Audiences (dark indigo/night band, 3 columns)
Each column: frosted product-preview mock card + title + mono eyebrow + 3 bullets with gradient bar separators.
1. **For Students** — "Personalized support". Card: kicker `TUESDAY · APR 21 · 8:42 AM` / "Morning, Maya." + gradient "A gentle start today." / "You have 2 focus blocks and 1 reading assignment scheduled." / pill `▶ Start first block`. Bullets: 24/7 personalized support · Zero overwhelm · Research-backed structure.
2. **For Teachers** — "Adaptive efficiency". Card: kicker `ENGLISH · PERIOD 3` / "24 students." + gradient "Focus score 72." / "Maya Jones · ADHD / Elijah Park · Autism / Sofia Reyes · Dyslexia" / pill `▶ Open class`. Bullets: Automated adaptation · Saves 40+ hours per month · Easier documentation and follow-up.
3. **For Parents** — "Full transparency". Card: kicker `THIS WEEK · MAYA` / "She's had a" + gradient "strong week." / "Maya completed 93% of her focus blocks and finished her English reading two days early." / pill `▶ View full progress`. Bullets: Real-time progress feed · Auto-compliance documentation · Direct connection with teachers.
- Closing line under grid: "By automating support, Nuro doesn't just save time, it prevents the lifetime societal cost of student dropouts due to lack of bandwidth."

### Waitlist `#waitlist` (aurora background)
- Eyebrow: "Let's build this together" · H2: **"Join the Nuro waiting list"** ("Nuro" gradient)
- Sub: "We're building Nuro for schools and families that care. Tell us a bit about yourself and we'll keep you updated."
- Form: Email * (`you@example.com`) · "I am a... *" radio: Parent or guardian / Student / Teacher or school staff · "What age are your students/children?" checkboxes ("Select all that apply — pick multiple if you have more than one child."): 6–9 years (F–3), 10–12 years (4–6), 13–15 years (7–9), 16–19 years (Gymnasiet), Not applicable · textarea "Anything else you'd like us to know?" (placeholder "Tell us about your situation, what challenges you face, or what you'd love to see in Nuro...", max 1000 chars).
- Submit: "Join the waiting list" → loading "Submitting...". Privacy note: "We respect your privacy. No spam, just updates about Nuro."
- States: success "You're on the Nuro waiting list! We'll be in touch." · duplicate "Already on the list! / This email is already on our waiting list." · error "Something went wrong / Please try again later."
- Backend: existing Supabase `waitlist` table (columns: id, email, role, user_type, student_ages, message). See card N-12.

### Footer (dark `--night`)
Pastel logo + "Nuro" wordmark · Instagram + LinkedIn icons · "© 2026 Nuro. All rights reserved."

### Meta
- Title: `Nuro — Inclusive Education for Swedish Schools`
- Description: `Nuro helps Swedish schools support neurodiverse students with ADHD, Autism, and Dyslexia. AI-powered lesson adaptation that meets Skollagen requirements.`
- OG image on the live site is an **expired** signed URL — generate a fresh self-hosted `/og.png` (1200×630, cream bg, aurora blobs, wordmark + H1). twitter:card `summary_large_image`.

### Assets to vendor into `/public`
Download once and self-host (live URLs, all currently 200):
- `https://nuroai.dev/assets/nuro-logo-Bn34_o1L.png` → `/public/logo.png`
- `https://nuroai.dev/assets/nuro-logo-pastel-DT9uP15o.png` → `/public/logo-pastel.png`
- `https://nuroai.dev/assets/nuro-logo-symbol-CUQWM_Kf.png` → `/public/logo-symbol.png`
- `https://nuroai.dev/favicon.ico` → `/src/app/favicon.ico`
- SVGs from `~/nuro-website-design/nuro-site/assets/`: `wordmark.svg`, `logo-n.svg`, `logo-dots.svg` → `/public/brand/`

---

## 5. Motion system (the core of this build)

### 5.1 `<Reveal>` — blur scroll reveal (applies to ALL content)

Every meaningful element on the page (headings, paragraphs, cards, form fields, media frames, footer rows) is wrapped in or marked for reveal. **Nothing pops in sharp.**

Behavior (port of `~/nuro-website-design/nuro.js` reveal + `~/nuro` conventions):

- Initial state: `opacity: 0; transform: translate3d(0, 22px, 0); filter: blur(9px);`
- On intersect: animate to `opacity: 1; translate3d(0,0,0); blur(0)` — **0.9s**, easing `cubic-bezier(.22, 1, .36, 1)`. Blur reaches 0 at ~60% of the timeline (use a keyframe animation, not a plain transition, so the blur resolves before the translate finishes).
- Trigger: IntersectionObserver, fire when element top is within 105% of viewport height (`rootMargin: "0px 0px -5% 0px"` approx). Fire once (no re-blur on scroll up).
- Stagger: siblings within a group get `transition-delay` steps of **0.08s** (0 / .08 / .16 / .24…). Expose as `<Reveal delay={n}>` or `data-reveal-order`.
- Cleanup: remove `will-change` and drop the animation ~1.2s after completion so throttled tabs can't wedge mid-blur and GPU layers are released.
- Implementation shape: ONE shared observer in a small client component/hook (`src/components/motion/reveal.tsx`); elements opt in via component wrapper. Server-rendered content must be present in the HTML (SEO) — the hidden initial state is applied via a `js`-gated class (e.g. set `data-js` on `<html>` in a tiny inline script) so no-JS users see everything sharp.
- `prefers-reduced-motion: reduce` → reveal class is inert (fully visible, no blur, no transform).

### 5.2 `<Aurora>` — holographic blurred blob fields

Large soft blobs drifting together behind hero + waitlist (and a subtle variant behind the business-case stat card). Port of `~/nuro/components/brand/aurora.tsx`:

- 4 blobs per field, each a `radial-gradient(closest-side, <tint>, transparent)` div, sizes 50–70% of the section, `filter: blur(60–80px)`, opacities 0.7–0.9, `willChange: transform`.
- Tints from blob palette: blue `rgba(167,199,255,.7)`, violet, pink, peach.
- Keyframes (translate+scale only, GPU-composited):
  ```css
  @keyframes aurora-a { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(6%,4%) scale(1.1); } }
  @keyframes aurora-b { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-5%,6%) scale(1.15); } }
  @keyframes aurora-c { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(4%,-6%) scale(1.1); } }
  @keyframes aurora-d { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-6%,-4%) scale(1.2); } }
  ```
  Durations staggered 18s / 22s / 26s / 20s, `ease-in-out infinite` — staggering keeps the blobs "shifting together" without syncing.
- IntersectionObserver pauses the field when off-screen: set `data-paused="true"` and CSS `[data-paused="true"] [data-aurora-blob] { animation-play-state: paused !important; }`.
- Props: `intensity` (multiplies opacities), `variant` (hero / waitlist / card).

### 5.3 Holographic gradient drift

The animated gradient treatment for text, buttons, accents (port of `~/nuro` `holo-drift`):

```css
@keyframes holo-drift { 0%,100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
```
Applied as `background: var(--holo-linear); background-size: 200% 200%; animation: holo-drift <dur> ease-in-out infinite;`
- Gradient text (`.holo-text`): add `background-clip: text; color: transparent;`, drift 8s. Used on the gradient words in H1/H2s and stat numerals.
- Primary CTA button: drift 14s + `--shadow-holo`; hover lifts `-1px` with shadow bloom (transform 160ms ease-out, shadow 320ms var(--ease)); `:active { transform: scale(0.97); }`.
- Card glow (With-Nuro card, 15M SEK card): absolutely-positioned pseudo/`<span>` at `inset: -14px`, holo-linear bg, `blur(18px)`, opacity .45, drift 6s, `z-index: -1`.
- Focus ring on form fields: `.focusable:focus-visible::after` — inset -4px, holo gradient, `blur(6px)`, opacity .8, drift 4s (accessibility-as-aesthetic, from `~/nuro` globals).

### 5.4 Micro-interactions

- All pressables: `active:scale-[0.97]`, transform 160ms ease-out.
- Card hover: `-translate-y-px` + border tint + soft shadow, 180ms var(--ease).
- Nav: transparent at top; after 24px scroll → `color-mix(in srgb, var(--bg) 88%, transparent)` background + `backdrop-filter: blur(10px)` (+ webkit prefix), padding tightens; 0.5s var(--ease).
- Link hover: opacity 0.3s linear.

---

## 6. Cards (GitHub issues for claude-harness)

> Wave discipline (lesson from previous runs): **N-01 and N-02 must merge before anything else starts** — shared tokens/primitives landing late means every consumer recreates them and conflicts. Use `Blocked by #<n>` lines verbatim so the harness auto-unblocks.

### Wave 0 — foundation (serial)

**N-01 — Design tokens, fonts, global CSS foundation**
Replace skeleton `globals.css` with the full token set from §3 (colors, motion tokens, radii, shadows, container/section utilities) as Tailwind v4 `@theme`/`:root`. Wire Inter Tight / Inter / JetBrains Mono via `next/font/google` in `layout.tsx` with CSS variable names `--font-display/--font-sans/--font-mono`. Add keyframes: `holo-drift`, `aurora-a/b/c/d`, the reveal keyframe. Add `.holo-text`, `.focusable` focus-ring, reduced-motion global override, `data-js` inline script in layout. Set metadata (title/description from §4 Meta) and viewport. Vendor all assets from §4 into `/public`.
*AC:* `pnpm build` passes; page renders cream bg with correct fonts; all CSS vars resolvable; reduced-motion query present; assets exist in `/public`.

**N-02 — Motion primitives: `<Reveal>` and `<Aurora>`**
Implement `src/components/motion/reveal.tsx` and `src/components/motion/aurora.tsx` exactly per §5.1–5.2 (shared observer, stagger via delay prop, fire-once, will-change cleanup, no-JS and reduced-motion safe; aurora with 4 blobs, pause-offscreen observer, intensity/variant props). Add a temporary `/dev/motion` route demoing both (removed in N-14).
*AC:* demo route shows blur-up reveals with stagger and drifting blurred blobs; elements are visible without JS (check `curl` HTML has content and no inline `opacity:0` on SSR output); reduced-motion shows everything static and sharp; typecheck/lint/build green.
`Blocked by N-01`

### Wave 1 — sections (parallel, all blocked by N-02)

**N-03 — Fixed nav header**
Per §4 Nav + §5.4 nav behavior. Smooth-scroll anchors, frosted glass after 24px scroll, mobile: left links hidden ≤920px. Social icons inline SVG.
*AC:* anchors scroll smoothly to sections; backdrop blur appears on scroll; keyboard navigable; pill CTA uses holo hover variant.

**N-04 — Hero section**
100vh hero per §4 with `<Aurora variant="hero">`, H1 with `.holo-text` on "neurodivergent", lead, CTA button (primary holo drift + shadow-holo), and the click-to-play YouTube facade (thumbnail img → swap to youtube-nocookie iframe on click; play button scale 1.07 hover; no YouTube JS loaded before click). Everything wrapped in `<Reveal>` with staggered delays.
*AC:* video plays on click with autoplay param; no iframe in DOM before click; LCP element is the H1 or thumbnail (not blocked by blur — hero reveal delay 0); content present in SSR HTML.
`Blocked by N-02`

**N-05 — Problem section**
Per §4 Problem: eyebrow, chip, H2 with gradient span, two subs, 3-col stat grid (1-col ≤920px). Stat numerals use `.holo-text` variants tinted per card (blue/purple/pink — use single-stop-shifted holo gradients). Sources in mono caps. Cards reveal with 0.08s stagger.
*AC:* copy verbatim incl. sources; grid collapses at 920px; stagger visible.
`Blocked by N-02`

**N-06 — Business case section**
Per §4: two-column (text left, 15M SEK stat card right with soft aurora/holo overlay + card glow per §5.3), 1-col ≤920px.
*AC:* copy verbatim; gradient numeral drifts; glow does not capture pointer events.
`Blocked by N-02`

**N-07 — Solution before/after section**
Per §4 Solution: two white cards, X-icon list vs gradient-check list, With-Nuro card gets holo tint overlay + glow. Inline SVG icons.
*AC:* copy verbatim; 5 vs 4 items exactly; collapses ≤920px.
`Blocked by N-02`

**N-08 — Audiences dark band**
Per §4 Audiences: `--night` gradient band, 3 columns each with frosted preview mock card (`--night-card` bg, backdrop blur, holo gradient accents on the gradient line of each card heading), mono kickers, pill buttons (decorative), bullet lists with gradient bar separators, closing paragraph. Reveals stagger per column.
*AC:* copy verbatim incl. kickers and pills; readable contrast on dark (check ink/dim values); 1-col ≤920px.
`Blocked by N-02`

**N-09 — Waitlist section UI**
Per §4 Waitlist: `<Aurora variant="waitlist">` background, form card with email/radio/checkbox/textarea fields styled per design (12px radii, holo focus rings via `.focusable`, selected choice states tinted with holo gradient + gradient checkmark). Client-side validation (email format, role required). Submits to `POST /api/waitlist` (stub until N-12 — render success state from response). Success overlay, duplicate and error toasts with §4 verbatim strings.
*AC:* all fields/labels/placeholders verbatim; invalid email blocks submit with error styling (`#c46a8a` family); success state renders; works keyboard-only.
`Blocked by N-02`

**N-10 — Footer**
Per §4 Footer: dark, pastel logo + wordmark, social icons, copyright.
*AC:* copy verbatim; links correct; reveal applies.
`Blocked by N-02`

### Wave 2 — backend + assembly (after wave 1)

**N-11 — Page assembly + section ordering**
Compose all sections in `page.tsx` in order: Nav, Hero, Problem, Business case, Solution, Audiences, Waitlist, Footer. Anchor ids `#problem`, `#business-case`, `#features`, `#waitlist`. Remove skeleton placeholder content. Verify reveal cadence across full-page scroll (no section appears sharp without animating).
*AC:* full page scrolls correctly; all anchors land with fixed-nav offset (scroll-margin-top); build green.
`Blocked by N-03` `Blocked by N-04` `Blocked by N-05` `Blocked by N-06` `Blocked by N-07` `Blocked by N-08` `Blocked by N-09` `Blocked by N-10`

**N-12 — Waitlist API route (stub — backend wired later)**
`POST /api/waitlist`: validate body `{ email, role, student_ages: string[], message? }` (email format, role required) → 400 on invalid, otherwise log the payload server-side and return 200 `{ ok: true }`. Structure the handler so a real persistence call can be dropped in later (single `saveWaitlistEntry()` function with the stub implementation). NO Supabase, no external deps, no env vars.
*AC:* 200 on valid, 400 on invalid; handler isolated behind `saveWaitlistEntry()`; UI success state works end-to-end against it.
`Blocked by N-09`

**N-13 — SEO, OG image, metadata polish**
Generate self-hosted `/public/og.png` 1200×630 (cream bg, aurora blobs, Nuro wordmark, H1 line) — use `next/og` ImageResponse or a checked-in static render. Full metadata export: title, description, OG/twitter tags (`summary_large_image`), canonical, favicon. Add `robots.txt` + `sitemap.xml`.
*AC:* `curl` of `/` shows complete meta; og.png 200 and correct size; no expired/external OG references.
`Blocked by N-11`

### Wave 3 — polish (after N-11)

**N-14 — Motion & performance QA pass**
Full-page pass: verify every visible element reveals (no orphans popping in sharp), stagger ordering reads top-to-bottom, hero LCP not degraded by blur (hero text delay 0, animation starts immediately on load for above-fold), blobs pause off-screen, `will-change` cleanup occurs, no layout shift from aurora fields (absolute + overflow-hidden sections), scrolling stays smooth (blur filters only on composited layers; **never** put `filter: blur` transitions on large containers — only on leaf elements). Remove `/dev/motion`. Lighthouse: Performance ≥ 90 desktop, CLS < 0.05.
*AC:* documented before/after Lighthouse numbers in PR body; reduced-motion full-page check; no console errors.
`Blocked by N-11`

**N-15 — Responsive + accessibility pass**
≤920px audit of every section per §3.4 (grids 1-col, nav links hidden, paddings 80px/22px, hero clamp behaves at 360px wide). A11y: heading order, landmark roles, form labels/aria, focus visible everywhere (holo ring), color contrast on cream + night surfaces (muted text must pass AA), gradient text has accessible fallback contrast, video facade keyboard-operable, `aria-live` on form status.
*AC:* no horizontal scroll at 360/768/920/1440; axe scan clean; keyboard-only walkthrough completes waitlist signup.
`Blocked by N-11`

---

## 7. Harness setup (operator steps, before firing cards)

1. Create GitHub repo (e.g. `dumplingsol/nuro-site`), push the existing skeleton on `main`.
2. `~/claude-harness/init.sh ~/nuro-site`, then edit `.claude-harness/harness.config.sh`:
   - `HARNESS_TRACKER="github"`, `HARNESS_REPO="dumplingsol/nuro-site"`
   - `HARNESS_VALIDATE='pnpm typecheck && pnpm lint && pnpm build'`
   - `HARNESS_BASE_BRANCH="main"`
3. Add `typecheck` script to package.json (`tsc --noEmit`) — skeleton lacks it (do in N-01 or pre-seed).
4. File N-01…N-15 as GitHub issues. Body = the card text above + the relevant spec sections inlined or referenced as `SPEC.md §n` (SPEC.md is committed to the repo root, so implementers can read it). Translate `Blocked by N-xx` → actual issue numbers. Label wave-0 cards `ready`; later waves get `ready` via the harness auto-unblock when blockers close.
5. Run: `cd ~/nuro-site && /card-auto-merge <N-01 issue#>`, then `/loop /card-wave` once N-02 merges.

## 8. Out of scope

- The `/auth` + dashboard app on nuroai.dev (product app, not marketing).
- **Waitlist backend persistence (Supabase) — deferred.** N-12 ships a stub API route; real Supabase insert + confirmation email get wired in a follow-up once the backend decision is made.
- Legal/privacy pages (live site doesn't have them either — flag for a future card, the form collects PII).
- i18n / Swedish version.
