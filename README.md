# Nathan D'Souza | AI & Full-Stack Engineer Portfolio

A premium, highly interactive developer portfolio built with Next.js 15. The UI features a hybrid "Monolith-Orbit" design aesthetic, characterized by editorial typography, smooth inertial scrolling, and a dark-mode WebGL-inspired aesthetic. 

Live Deployment: [Your Vercel Link Here]

## 🚀 Key Features

* **Scroll-Driven 3D Story ("The Descent"):** The home page plays as one camera move in six acts. A pinned hero dives through the cube, projects fly past in a perspective corridor, experience cards rise out of depth, the stack runs across a tilted plane, and the contact block opens like an aperture as the cube reassembles. A canvas starfield streaks with scroll velocity behind it all, and the side rail shows the current act. Phones and `prefers-reduced-motion` get the static layout. Code lives in `components/story/`, tuning in `lib/story.ts`.
* **Interactive 3D Hero:** A drag-to-rotate CSS 3D cube with release inertia, cursor-tracking lean, and click-to-burst interactions built completely without heavy WebGL libraries.
* **Dynamic Typography:** Variable-font hover engine (Archivo) that fluidly scales weight and width on interaction using Framer Motion springs.
* **Smooth Inertial Scrolling:** Powered by Lenis. Includes staggered scroll-reveals, parallaxing project art, and velocity-reactive marquee text.
* **Multilingual Greeting:** An IntersectionObserver-triggered rotator that cycles through 26 languages, dynamically loading specific Noto font subsets (like Devanagari for Hindi/Nepali/Konkani) only when needed to optimize performance.
* **Client-Side AI Demos (Coming Soon):** Project pages feature isolated demo stages designed to run machine learning inference directly in the browser (TensorFlow.js / ONNX) to protect user data and eliminate server costs.
* **Serverless Contact API:** Fully validated contact form using Zod and the Resend API, complete with spam honeypots, rate limiting, and priority inbox headers.

## 🛠️ Tech Stack

* **Framework:** Next.js 15 (App Router, React 19)
* **Language:** TypeScript
* **Styling:** Tailwind CSS v4
* **Animation:** Framer Motion & CSS3
* **Scroll Engine:** Lenis
* **Email & Validation:** Resend & Zod