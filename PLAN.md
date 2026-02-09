# Vinyl Wrapped – Where to Start

A Spotify Wrapped–style site for your vinyl: full-screen sections, spinning records, music, and stories.

---

## 1. What You’re Building

- **Full-screen sections** – One “moment” per vinyl (or group of vinyl).
- **Vinyl animation** – A record that spins (CSS or canvas).
- **Music** – Play/pause per section; one track (or side) per record.
- **Content** – Short explanation + image(s) per record.
- **Navigation** – Scroll or tap/click to move between sections (Wrapped-style).

---

## 2. Tech Stack (Recommended)

- **React + Vite** – Fast, simple, good for components and state (which section, which track is playing).
- **CSS** – Animations (spinning vinyl), layout, scroll-snap.
- **HTML5 Audio** – One `<audio>` per track; control from React.

No backend needed unless you add auth or dynamic content later.

---

## 3. Order of Work

| Step | What | Why first |
|------|------|-----------|
| 1 | One full-screen section with a spinning vinyl (image or CSS shape) | Proves the main visual and layout |
| 2 | Add one audio track: play when section is in view, pause when leaving | Core “play with the record” behavior |
| 3 | Add copy + one image per section | Content structure before styling |
| 4 | Second section (second record + second track) | Reuse same pattern for all records |
| 5 | Navigation: scroll-snap or next/prev buttons | Wrapped-like flow |
| 6 | Styling: typography, colours, gradients, transitions | Make it feel like “Wrapped” |
| 7 | Optional: cover image on the vinyl, needle, more images | Polish |

---

## 4. Content You’ll Need

- **Per record:**  
  - Cover image (or artwork).  
  - Audio file (e.g. MP3): one file per side or per track you want to feature.  
  - Short explanation (1–3 sentences).  
  - Optional: extra images (sleeve, making-of, etc.).

- **Global:**  
  - Intro line (e.g. “Your 2024 vinyl, by [your name]”).  
  - Outro / thank-you line.

Keep text in a single JSON or in the React components at first; you can move to a CMS later if needed.

---

## 5. Where to Start in Code

1. **Run the starter** (see README) and get one section with a spinning vinyl on screen.
2. **Add one `<audio>`** and play it when that section is active; pause when you scroll away.
3. **Add your first real content**: one image, one paragraph, one MP3.
4. **Duplicate that section** for the second record and adjust content and audio.
5. **Add navigation** (scroll-snap or buttons) so moving between sections feels intentional.
6. **Iterate on design** (fonts, colours, spacing) once the flow works.

The starter in this repo gives you (1) and the structure for (2)–(4). Use PLAN.md as a checklist and README for run instructions.
