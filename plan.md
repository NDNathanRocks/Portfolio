# Portfolio Build Plan (Phase 1: Architect)

Hybrid of **Option B (Monolith)** layout/color and **Option A (Orbit)** hero typography.
Stack: Next.js 15 (App Router, TypeScript), React 19, Tailwind CSS v4, Framer Motion.

## Open questions (need your answer before Phase 2)

1. **AISmileDetector** is not in PORTFOLIO_SPEC.md or the resume PDF. I have no title-accurate subtitle, stack or dates. Give me a one-line subtitle, or tell me to omit the tile for now. Until then it is a tile with the subtitle `[TBD]`.
2. **Spec vs. resume conflict:** the spec says Panoramic Image Stitching won Mountain Madness 2025 (1st). The resume dates Panoramic Aug-Dec 2022 and lists Mountain Madness (Mar 2025) as a separate hackathon win. I'll follow the resume: no award badge on Panoramic, "SystemHacks 2023 WiCS Award" badge on BinIt!, and Mountain Madness shown in an Awards line. Correct me if the spec is right.
3. `reference-projects/BinIt-summary.md` (CNN+RNN, sensor data) contradicts the resume (Flask, ReactJS, ResNet152, base64). I will use the resume and ignore that file.
4. Optional extra tile: **RFP Utility** (PySide6/pywin32, 30+ hrs to under 5 min) is a strong real project. Include as a 5th tile? Default: no.

(The `[cite: 6]` markers in the spec are stripped; none of that text goes in the UI.)

## Design tokens

- Background `#0a0a0a`, text warm off-white `#f4efe6`, hairlines `rgba(244,239,230,.16)`.
- Fonts via `next/font/google` (self-hosted, no layout shift):
  - **Archivo** (axes `wdth`, `wght`): hero only (name + subtitle).
  - **Bricolage Grotesque** (axes `opsz`, `wdth`): headings and tile titles elsewhere.
  - **DM Mono**: labels and metadata.
- Tile gradient washes (vibrant, one per project):
  - Clarity: violet to magenta
  - BinIt!: emerald to lime
  - Panoramic Image Stitching: orange to coral
  - AISmileDetector: gold to amber
  - Optional RFP Utility: cyan to blue

## File structure

```
app/
  layout.tsx            fonts, metadata, <body> bg #0a0a0a, SideRail + children
  page.tsx              composes sections
  globals.css           @import "tailwindcss"; @theme tokens
components/
  SideRail.tsx          fixed 76px vertical rail: brand, vertical nav, status dot
  Hero.tsx              name + subtitle + tagline layout
  VariableText.tsx      per-letter variable-font hover engine (Framer Motion)
  OrbitObject.tsx       rotating 3D hero element (see Hero object)
  WorkGrid.tsx          asymmetric 12-col grid
  ProjectTile.tsx       tile with corner gradient wash
  Experience.tsx        two Fraser Health roles + SFU, table rows
  Contact.tsx           closing band with mailto + links
lib/
  content.ts            typed content: projects, experience, education, links
```

## Components

**SideRail**: `position: fixed`, left, 76px wide, full height, right hairline. Top: "ND, Portfolio 26" rotated vertical mono text. Middle: Work / Experience / Contact anchor links, vertical, hover to accent. Bottom: accent dot. Below `md`, collapses to a top bar (no vertical rail on phones).

**Hero**: 12-col grid. Left 7 cols: name "Nathan D'Souza" in two lines at large size (Archivo); subtitle "AI/ML & Full-Stack Engineer | Vancouver, BC" below. Right 5 cols: OrbitObject. Staggered rise-in on load.

**VariableText** (the typography play, hero only): splits a string into per-letter `motion.span`s. Each letter has a spring-driven `wght` and `wdth`. Hovering a letter animates it toward max (wght 900, wdth 125) and its neighbours by distance falloff (ripple, ±2 letters), then springs back on leave. Implemented with `useMotionValue` / `useSpring` and `useTransform` into `fontVariationSettings`, so no React re-renders on hover. A layout-stable width: reserve each letter's max width via an invisible sizer, or let the line wrap-safe with `inline-block` and accept slight reflow; I'll pick the sizer approach if reflow looks bad in testing. Respects `prefers-reduced-motion` (static weight) and applies `aria-label` on the wrapper with letters `aria-hidden`. Subtitle uses the same component at a smaller scale and lower max values.

**OrbitObject**: the Orbit rotating 3D element, but built in CSS 3D + Framer Motion `animate` (no WebGL dependency for v1): nested wireframe cubes counter-rotating, accent-lime edge glow. Pauses when off-screen (`useInView`) and disabled under reduced motion. Upgrade path to `react-three-fiber` is possible later if you want true WebGL.

**WorkGrid**: 12-col, `grid-auto-rows: 130px`, gap 20px. Tile spans are assigned from title length so proportions match the real text:

| Tile | Subtitle | Span |
|---|---|---|
| Panoramic Image Stitching (longest) | ORB feature detection, optimized 14x | 12 cols x 3 rows (wide) |
| Clarity | AI time awareness assistant | 7 cols x 4 rows (feature) |
| BinIt! | AI-powered trash sorter | 5 cols x 2 rows |
| AISmileDetector | [TBD] | 5 cols x 2 rows |

(Spans are tuned visually in Phase 2; the exact numbers may shift.) Under `md` the grid collapses to one column.

**ProjectTile**: title (Bricolage), one-line subtitle, year, tag line (stack in mono). Hover: a full-bleed vivid gradient layer animates `clipPath: circle(0% at <corner>)` to `circle(150% at <corner>)` via Framer Motion variants (origin corner varies per tile), text color flips for contrast, the underlying art scales slightly. Entry: staggered fade/rise on scroll (`whileInView`, `viewport once`). Keyboard focus triggers the same state as hover. Real `<a>` or `<button>` with visible focus ring; no project links until you supply URLs (resume links exist but are not in the PDF text), so tiles are non-navigating for now.

**Experience, Contact**: Monolith styling. Experience rows: role, org, dates only (no long descriptions, per your instruction). Contact: giant "Say hello" mailto, GitHub / LinkedIn links (URLs needed; placeholders until provided). Email `naythandsouza@gmail.com` from the resume.

## Content (lib/content.ts)

Real data only, from resume and spec: name, subtitle, 3-4 projects as above, 2 Fraser Health roles + SFU degree with dates, awards (Mountain Madness 2025 1st, SystemHacks 2023 WiCS), skills grouped as on the resume. Phone number is NOT included on the public site.

## Steps (Phase 2)

1. Scaffold Next.js 15 + TS + Tailwind in a temp folder and move into the repo root (the directory is non-empty, so `create-next-app .` would refuse). Install `framer-motion`. Add `.gitignore` entries.
2. Tokens, fonts, layout shell, SideRail.
3. `lib/content.ts`.
4. VariableText, then Hero, then OrbitObject.
5. ProjectTile and WorkGrid; tune spans against real titles.
6. Experience, Contact.
7. Responsive pass (rail to top bar, grid to single column), reduced-motion pass.
8. `npm run build` and `npm run lint`, fix errors; run dev server and use Puppeteer MCP (added earlier) for screenshots at 1440 and 390 widths.

## Phase 3 review checklist

Accessibility (contrast on gradient hover states, focus, reduced motion), performance (animation off main thread where possible, offscreen pause, font loading), no dummy text left, no personal data beyond what you approve (phone excluded), console clean.

## Out of scope for now

CMS, analytics, deployment.

---

# Iteration 2 Plan (Phase 1: Architect)

Goals: scroll depth, interactive cube, rotating multilingual "Say hello", a real contact form, a livelier Experience section, and project pages ready to host interactive demos.

## Open questions (need your answer)

1. **Email delivery.** The site needs a server-side sender. Recommendation: **Resend** (free tier, one API key). You create the account and put `RESEND_API_KEY` and `CONTACT_TO_EMAIL` in `.env.local` yourself; I never see the key. Without a verified domain, Resend can only send to the email you signed up with, which is fine for your own inbox. Alternative: Formspree/Web3Forms (no backend code, but third-party form handling). OK to use Resend?
2. **Phone number.** "Include contact details" currently means email, LinkedIn, GitHub, Vancouver BC. Publishing your phone (+1-647-939-9673) invites spam and scraping. Default: leave it off. Include it?
3. **Languages.** Hindi, Nepali and Konkani all use Devanagari and "namaste" is the same word in Hindi and Nepali. To keep them visibly distinct I'll use Hindi नमस्ते, Nepali नमस्कार, Konkani देव बरें दिस दिवं ("God give you a good day", the traditional greeting). Order: English, Hindi, Arabic, French, Chinese, Spanish, Punjabi, Korean, Nepali, Konkani, Japanese, Gujarati, then Portuguese, Bengali, Russian, German, Tamil, Urdu, Italian, Turkish, Swahili, Vietnamese, Thai, Indonesian, Greek, Tagalog, looping back to English. Please sanity-check any you can read; I'm confident on the common ones but you know Punjabi, Gujarati and Konkani better than I do.
4. **Demos.** Python/Flask/Django/MATLAB projects cannot run inside Next.js on a typical host. Plan per project (final choice when you supply code):
   - **AISmileDetector, BinIt!**: port inference to the browser (TensorFlow.js / ONNX Runtime Web / OpenCV.js). Webcam and uploaded images never leave the visitor's device.
   - **Panoramic Stitching**: OpenCV.js ORB feature detection and matching on sample images, shown step by step.
   - **Clarity**: Expo web build or hosted Django API in a sandboxed iframe.
   - **RFP Utility**: a scripted interactive simulation using synthetic invoices only. No real Fraser Health data should ever be on the public site.

## 1. Scroll depth

- **Lenis** for inertial smooth scrolling (also in your original spec); disabled under `prefers-reduced-motion`. New dep: `lenis`.
- Framer Motion `useScroll`/`useTransform`:
  - Hero: the three name lines drift at different speeds, the subtitle fades, the cube scales and spins faster with scroll (hero recedes as Work arrives).
  - Work: tile art layers parallax inside their frames; "Work" heading slides up through a mask; a large outlined word strip ("AI / FULL-STACK / VISION / DATA") scrolls sideways and speeds up with scroll velocity.
  - Section headings: mask-reveal on entry.
- **Side rail becomes a live progress bar:** the bottom dot turns into a vertical progress track, and the active section's nav label lights up (IntersectionObserver).

## 2. Interactive cube

Stays CSS 3D (WebGL not needed). `OrbitObject` gains:
- Drag to rotate on both axes (pointer events with capture, `touch-action: pan-y` so vertical page scroll still works on phones), with release inertia, then the auto-spin eases back in.
- Hover without dragging: the cube leans toward the cursor.
- Click: faces burst outward ("explode") and snap back with a spring; inner cube counter-spins.
- `cursor: grab/grabbing`, keyboard-inert (decorative, `aria-hidden`), fully static under reduced motion.
- Wrapper stops being `pointer-events-none`; only the cube's own box takes events so the name text stays hoverable.

## 3. Say hello (rotating greetings)

- Starts at "Hello" in English. Only after the section has been fully seen once (IntersectionObserver, 60% visible) does a 3-second timer begin. Pauses when scrolled away; resumes on return.
- Transition: letters swap with a variable-font weight flicker and a masked slide, language label (e.g. "Hindi") in mono beneath. Arabic/Urdu set `dir="rtl"`.
- Non-Latin glyphs: Bricolage has none, so per-script **Noto** families via `next/font/google` with `preload: false` (loaded only when that script first appears; browsers fetch by unicode-range).
- Accessibility: visible text is `aria-hidden`; screen readers get a static "Say hello" and the link label stays English. Reduced motion: no animation, static "Hello".
- The heading remains the mailto link.

## 4. Contact section

- Form: name, email (required, used as reply-to), optional "how else to reach you" (phone/LinkedIn), message. Real `<label>`s, inline validation, loading and success/error states, focus management.
- Send animation: on submit the note card folds into a paper plane and flies off (Framer Motion); a clear success message follows. Error state keeps the text intact.
- Server: `app/api/contact/route.ts` (Node runtime).
  - Validation with `zod` (length caps, email format), plain-text email body only (no HTML injection), sender controlled server-side, visitor address used only as `replyTo`.
  - Spam: hidden honeypot field, minimum-time-to-submit check, per-IP in-memory rate limit (best effort on serverless; upgrade to Upstash later if needed).
  - Secrets only in `.env.local` / host env vars; `.env*` already git-ignored; add `.env.example`.
  - No logging of message content.
- Direct details block beside the form: email, LinkedIn, GitHub, Vancouver BC (phone only if you say yes). New deps: `zod`, `resend`.

## 5. Experience, with more spice (content unchanged)

- Sticky timeline: a vertical line draws as you scroll; a dot lights up per role.
- **Impact numbers count up** when they enter view, taken from your resume only: `30+ hrs -> <5 min` (RFP Utility), `60%` faster UKG WFM migration, `100%` of agency contracts digitized, `8-week` staffing trend dashboards.
- Role rows use the same corner-wash hover as the project tiles for consistency.
- Stack becomes two opposing marquee rows of chips that drift with scroll velocity and pause on hover.

## 6. Project pages (demo-ready)

- Routes: `app/projects/[slug]/page.tsx`, statically generated from `lib/content.ts` (`generateStaticParams`), with `notFound()` for unknown slugs and per-project metadata.
- Tiles link internally to `/projects/<slug>`; GitHub becomes a secondary button on the page. Page: title, subtitle, stack, year, back link, prev/next project, and a **Demo stage**.
- `components/demos/DemoStage.tsx` is a generic frame with a click-to-launch gate ("Launch demo") so heavy models and the webcam never load until the visitor opts in. It renders either a lazily imported client component (`next/dynamic`, `ssr: false`, registry in `components/demos/registry.ts`) or a sandboxed iframe (`sandbox` attribute, `frame-src` allowlist). Until you drop code in, each stage shows a styled "Demo coming soon" placeholder.
- Longer descriptions stay out until you want them.

## Steps (Phase 2)

1. Deps: `lenis`, `zod`, `resend`. Lenis provider, scroll progress rail.
2. Hero parallax + interactive `OrbitObject`.
3. Work section scroll effects (mask headings, tile parallax, velocity marquee).
4. Experience timeline, count-ups, chip marquee.
5. Greeting rotator + Noto fonts, then Contact form, send animation, API route, `.env.example`.
6. Project routes, `DemoStage`, registry, tile links.
7. Build, lint, Puppeteer screenshots; test the API route with the key absent (graceful error) and with a mocked sender.

## Phase 3 review checklist (additions)

Contact route abuse cases (empty/oversized/malformed payloads, honeypot, rate limit), no secrets in the client bundle, Lenis vs. anchor links and focus, reduced-motion across every new animation, mobile drag-vs-scroll conflict on the cube, font payload from the Noto families, iframe sandbox settings.
