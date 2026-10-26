# Nathan D'Souza | AI & Full-Stack Engineer Portfolio

A highly interactive developer portfolio built with Next.js 15. The home page plays as one continuous camera move through 3D space, built entirely with CSS 3D and a small canvas (no WebGL libraries), with editorial typography and smooth inertial scrolling.

Live: [nathandsouza.dpdns.org](https://nathandsouza.dpdns.org)

## 🚀 Key Features

* **Scroll-Driven 3D Story ("The Descent"):** Six acts in one scroll. A pinned hero dives through the cube, projects fly past in a perspective corridor, experience is drawn as a road to a vanishing point, the stack runs across a tilted plane, and the contact block opens like an aperture as the cube reassembles. A canvas starfield streaks with scroll velocity and glows under the cursor, and the side rail shows the current act with a clickable act list. Phones and `prefers-reduced-motion` get a static layout. Code lives in `components/story/`, tuning in `lib/story.ts`.
* **Auto-Play Tour:** "▶ Auto-play" in the hero (or a shared `/?tour` link) plays the whole story hands-free in about 50 seconds, slowing at each act. Any scroll, key, touch or click hands control straight back.
* **Navigation That Remembers:** Opening a project and coming back (browser Back or "← All work") returns you to the exact spot you left, with the card you opened briefly ringed. "Back to the surface ↑" at the bottom climbs the story in reverse to the top.
* **Animated Project Previews:** Each corridor card loops a small code-drawn animation of what the project does (SVG/CSS, no videos), running only on the card in focus.
* **Client-Side AI Demos:** Project pages run live demos in the browser: smile detection and panorama stitching with OpenCV.js, waste classification with an ONNX model, and the Clarity task breakdown. Each demo loads only when launched. The flagship Aegis AI Race is embedded live.
* **Interactive 3D Cube:** A drag-to-rotate CSS 3D cube with release inertia, cursor-tracking lean, and click-to-burst, without any WebGL library.
* **Dynamic Typography:** A variable-font hover engine (Archivo) that fluidly scales weight and width using Framer Motion springs.
* **Two Themes:** Dark (lime) by default, and a light sunset theme with a cobalt accent. The visitor's choice is remembered per browser.
* **Multilingual Greeting:** Cycles through 26 languages, loading Noto font subsets (Devanagari, Tamil, Thai and more) only when needed.
* **Serverless Contact API:** Zod-validated contact form on Resend, with a honeypot, rate limiting and an Origin check.
* **Accessible by Default:** Reduced-motion parity, keyboard access to every card, WCAG-checked text contrast in both themes.

## 🛠️ Tech Stack

* **Framework:** Next.js 15 (App Router, React 19)
* **Language:** TypeScript
* **Styling:** Tailwind CSS v4
* **Animation:** Framer Motion & CSS3
* **Scroll Engine:** Lenis
* **Email & Validation:** Resend & Zod

## 🧑‍💻 Running Locally

```bash
npm install
cp .env.example .env.local   # fill in RESEND_API_KEY and CONTACT_TO_EMAIL for the contact form
npm run dev                  # http://localhost:3000
```

`npm run build` makes a production build and `npm run lint` lints the code.

## 📄 Updating the Resume

The resume lives at `public/Nathan_DSouza_Resume.pdf`. Only people who can push to this repo can change it; there is no upload page to attack.

```bash
npm run resume -- ~/Downloads/new-resume.pdf             # check, commit and push
npm run resume -- ~/Downloads/new-resume.pdf --no-push   # commit only
```

The script checks the file really is a PDF under 5 MB, commits only that file, and pushes. The host redeploys from `main`, and the PDF is served with `must-revalidate`, so visitors get the new version right away. From a phone, you can also replace the file on github.com (Add file → Upload files) using the same filename.
