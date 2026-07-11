# Repository Context — Vishnu Tech Hub Website

> Generated via codebase-memory-mcp indexing (full mode: 38 nodes, 64 edges) + manual review.
> Last updated: 2026-07-11.

## 1. Project Summary

A single-page marketing/informational website for **Vishnu Tech Hub**, the student
software-development wing of **Sri Vishnu Educational Society**. The page presents
the hub's mission, service offerings, leadership team, and contact/CTA information.

Tagline: *"Code Today, Create Tomorrow."*

## 2. Tech Stack

Plain static frontend — **no framework, no build step, no package manager**.

| Layer | Technology |
|---|---|
| Markup | Hand-written semantic HTML5 (`index.html`) |
| Styling | Vanilla CSS3 with custom properties / design tokens (`styles.css`) |
| Behavior | Vanilla ES6 JavaScript, no dependencies (`script.js`) |
| Fonts | Google Fonts — Space Grotesk (display), Inter (body), JetBrains Mono (code/mono accents) |
| Hosting | Static hosting (Vercel — see recent commit "Fix logo src path for Vercel deployment") |

There is no `package.json`, bundler, or transpilation. Files are served as-is.

## 3. Repository Layout

```
index.html              Single-page HTML document (all sections)
styles.css               All styling: tokens, layout, components, responsive rules
script.js                All client-side behavior (IIFEs + top-level listeners)
Vishnulogo.png            Site logo (nav)
hero_students.png         Hero section illustration
leader_founder.png        Leadership carousel photo — Dr. B V Raju
leader_chairman.png       Leadership carousel photo — K.V. Vishnu Raju
leader_vice.jpg           Leadership carousel photo — Ravichandran Rajagopal
leader_secretary.jpg      Leadership carousel photo — K. Aditya Vissam
leader_director.jpg       Leadership carousel photo — Dr. Pericharla Srinivasa Raju
```

No `src/`, `assets/`, `public/`, or `dist/` directories — everything lives at repo root
and is referenced with relative paths directly from `index.html`.

## 4. Page Architecture (`index.html`)

Single document, top to bottom:

1. **Custom cursor element** (`#cursor-fluid`) + **scroll progress bar** (`#scrollProgress`)
2. **Header/Nav** (`#site-header`) — logo, desktop nav links, mobile hamburger button
3. **Mobile nav overlay** (`#mobileNav`) — full-screen drawer, hidden by default
4. **`<main>`** containing the sections:
   - `#hero` — headline, description, CTA link, illustration, decorative SVG doodles/blobs
   - `#about` — mission statement + service-area icon list
   - `#services` — 5-card grid (Web Dev, Mobile, UI/UX, AI & ML, Cloud Architecture)
   - `#leadership` — carousel of 5 leadership cards (founder, chairman, vice chairman,
     secretary, director), with prev/next buttons and dot indicators
   - `#cta` — "Let's Build Something Amazing" panel with Email/LinkedIn buttons and a
     decorative fake terminal window
5. **Footer** (`#site-footer`) — brand, contact links (email, LinkedIn, address), copyright

All navigation is anchor-based (`#hero`, `#about`, `#services`, `#leadership`, `#cta`) —
there is no routing/SPA framework.

## 5. Client-Side Behavior (`script.js`)

Organized as 11 numbered, independent feature blocks operating on the same DOM
(no module system — one file, top-level `'use strict'`):

1. **Scroll progress bar** — `updateScrollProgress()` sets width % based on scroll position.
2. **Sticky header** — `updateHeader()` toggles `.scrolled` class past 40px scroll.
3. **Mobile nav toggle** — `openMobileNav()` / `closeMobileNav()`, closes on link click or Escape.
4. **Scroll-reveal** — `IntersectionObserver` adds `.revealed` to `.reveal`/`.reveal-left`/`.reveal-right` elements once, then unobserves.
5. **Leadership carousel** — IIFE `initCarousel()`, the largest/most complex unit:
   - `getVisibleCount()` — responsive cards-per-view (1 / 2 / 3 based on viewport width)
   - `buildDots()`, `updateDots()` — dot indicator management
   - `applyPosition()` — CSS transform-based slide positioning
   - `goToIndex()` — clamped navigation (hotspot: fan-in 3, called by dots, arrows, swipe, keyboard, auto-advance)
   - `startAutoAdvance()` / `resetAutoAdvance()` — 3s auto-rotate timer, reset on manual interaction
   - Touch swipe (`touchstart`/`touchend`), keyboard arrows, and window `resize` (debounced) handling
6. **Throttled scroll handler** — `requestAnimationFrame`-gated combination of #1 and #2.
7. **Smooth-scroll polyfill** — intercepts `a[href^="#"]` clicks, calls `scrollIntoView`.
8. **Hero entrance animation** — `heroEntrance()` IIFE staggers opacity/transform on load.
9. **Footer year** — regex-replaces the copyright year with `new Date().getFullYear()`.
10. **Service card micro-interaction** — a second `IntersectionObserver` staggers card reveal.
11. **Fluid custom cursor** — `animateCursor()` runs an eased/velocity-based `requestAnimationFrame`
    loop to drive a custom cursor element (`#cursor-fluid`), gated behind
    `matchMedia("(any-hover: hover)")` so it's skipped on touch devices.

**Call graph hotspots** (from graph analysis): `goToIndex` (fan-in 3), `startAutoAdvance`
(fan-in 2), `applyPosition` (fan-in 2) — these anchor the carousel's internal call cluster.

## 6. Styling System (`styles.css`)

Token-driven design system defined in `:root` custom properties, then applied by section.

- **Color tokens**: `--color-primary` (deep teal `#38686A`), `--color-text` (near-black
  plum `#1F0322`), `--color-secondary` (sage `#BCBD8B`), `--color-tertiary` (coral
  `#F6828C`), `--color-bg` (warm off-white `#FBF7F0`), plus light/dark variants,
  surface colors, border/shadow rgba tokens.
- **Typography tokens**: `--font-display` (Space Grotesk), `--font-body` (Inter),
  `--font-mono` (JetBrains Mono).
- **Spacing scale**: `--space-xs` through `--space-4xl` (0.25rem – 6rem).
- **Radius, transition, and shadow scales** as tokens.
- **Sections numbered 1–16** in file comments: reset/base, utilities, buttons, nav, hero,
  about, services, leadership carousel, CTA, footer, shared section styles, scroll
  progress bar, then responsive breakpoints (1024px, 768px, 480px), and custom cursor.
- Reveal-on-scroll animation classes (`.reveal`, `.reveal-left`, `.reveal-right` +
  `.delay-1..5`) pair directly with the `IntersectionObserver` logic in `script.js`.
- Global `* { cursor: none !important; }` — the entire site hides the native cursor in
  favor of the custom fluid cursor element (desktop/hover-capable devices only, per the
  JS media-query gate; touch devices fall back to no visible cursor override since the
  JS block is skipped, but the CSS still hides the native cursor unconditionally).

## 7. Data Flow

There is no backend, no API, and no external data fetching. All content (leadership
bios, service descriptions, copy) is static and hard-coded directly into `index.html`.
"Data flow" is limited to:

- DOM state mutated by `script.js` (carousel index, nav open/closed, scroll position,
  reveal classes) — all ephemeral, in-memory, no persistence (no localStorage/cookies).
- Outbound links only: `mailto:vishnutechhub@srivishnu.edu.in` (Email Us / footer) and
  `https://www.linkedin.com/company/vishnu-tech-hub` (LinkedIn, `target="_blank"`).
- Google Fonts loaded via `@import` in CSS + `<link rel="preconnect">` in HTML head.

## 8. Notable Conventions / Gotchas

- Leadership photos use `onerror="this.style.display='none'"` inline fallback — if an
  image fails to load, it silently hides rather than showing a broken-image icon.
- The carousel's `getVisibleCount()` breakpoints (≤768px → 1, ≤1024px → 2, else 3) are
  independently defined in JS and must stay in sync with the CSS breakpoints in section
  14/15 of `styles.css` (`.leader-card` flex-basis changes at the same widths).
- No `.gitignore`, no CI config, no tests — this is a hand-authored static marketing
  site, not an application with a build pipeline.

## 9. Git Context

- Branch: `main`
- Recent history: initial import from Antigravity IDE, followed by a fix for the logo
  path specifically for Vercel deployment — confirms Vercel as the deployment target.
