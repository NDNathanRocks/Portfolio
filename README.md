# CS Portfolio Timeline (Next.js + Tailwind + Vercel Postgres)

Single-page portfolio with a **center vertical timeline**. Projects **animate (float) into view** as you scroll, and the site supports **light/dark mode**.

## Tech
- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Vercel Postgres (`@vercel/postgres`)
- Optional: React Bits components for spicy interactive effects

## Getting Started (Local)
```bash
pnpm i   # or npm i / yarn
cp .env.example .env.local
# Set POSTGRES_URL in .env.local
pnpm dev
```

## Database
Create the `projects` table and seed demo rows (dev):
```bash
pnpm seed
```

## Deploy (Vercel)
1. Create a Postgres (Neon) database from Vercel dashboard.
2. Add `POSTGRES_URL` env var in Project Settings → Environment Variables.
3. `vercel` then `vercel env pull .env.local` for local dev.
4. Push your repo and deploy.

## React Bits (Optional)
React Bits provides copy-paste or CLI-installable animated components. Use e.g. a **Scroll Reveal** wrapper on each `<ProjectCard/>` or add **Scroll Stack** for section-based scroll effects.

Docs: reactbits.dev (Get Started → Installation)

### Where to plug it in
- Replace the simple `InView` component in `components/InView.tsx` with a React Bits **Scroll Reveal** snippet.
- Or wrap the `<Timeline/>` sections with a React Bits scroll component.

## Customize
- Edit `scripts/seed.ts` with your real projects (image/gif URLs, titles, descriptions, links).
- Tweak styles in `tailwind.config.ts` and global tokens in `globals.css`.
- Update contact email in `components/Contact.tsx`.
