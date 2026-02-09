# Vinyl Wrapped

A Spotify Wrapped-style site: full-screen sections, spinning vinyl, music playback, and short explanations per record.

## Run locally

This project uses **pnpm** (lockfile is `pnpm-lock.yaml`). Use npm and you may see install errors.

```bash
pnpm install
pnpm run dev
```

Open the URL shown (usually `http://localhost:5173`).

## What’s in the starter

- **Scroll-snap** full-screen sections (intro, record 1, record 2, outro).
- **Spinning vinyl** – CSS-only disc that spins when that section is in view.
- **Audio** – When a section with a `trackSrc` is in view, that track plays; when you scroll away, it pauses.
- **Placeholder content** – Edit `src/App.jsx`: update `SECTIONS` with your titles, explanations, and image URLs. Put MP3s in `public/` and set `trackSrc` to `/yourfile.mp3`.

## Add your content

1. **Audio:** Add MP3 files to the `public/` folder (e.g. `public/track1.mp3`). In `SECTIONS`, set `trackSrc: '/track1.mp3'`.
2. **Images:** Add images to `public/` (e.g. `public/cover1.jpg`). In `SECTIONS`, set `imageUrl: '/cover1.jpg'`.
3. **Copy:** Change `title`, `subtitle`, and `explanation` in `SECTIONS` in `src/App.jsx`.
4. **More records:** Duplicate a record object in `SECTIONS` and give it its own `trackSrc`, `explanation`, and `imageUrl`.

## Build for production

```bash
npm run build
```

Output is in `dist/`. Host that folder on any static host (Vercel, Netlify, GitHub Pages, etc.).

## Background

The app uses a **liquid/ether-style** full-page background (CSS gradient blobs) in `src/LiquidBackground.jsx`. The **Beams** component (`src/components/Beams.jsx`) is present but not used: it depends on @react-three/fiber, which with React 18 causes a reconciler error. To use Beams, upgrade to React 19 and @react-three/fiber 9.x, then in `App.jsx` replace `<LiquidBackground />` with the Beams wrapper (see git history). You wanted `@react-bits/LiquidEther-JS-CSS`; the shadcn CLI currently fails when applying that registry item ("Unexpected token" when updating files). To try again later:

```bash
pnpm dlx shadcn@latest add @react-bits/LiquidEther-JS-CSS
```

If it installs, replace `<LiquidBackground />` in `App.jsx` with the React Bits LiquidEther component and use it as the background layer.

## Plan

See `PLAN.md` for the step-by-step order of work and what to build next.
