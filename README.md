# eDamana — Ministerial Briefing

Browser-based presentation. **`index.html` is the deck** — open it directly or serve it from GitHub Pages.

## Deploy on GitHub Pages
1. Push this folder to a repository (keep `index.html` at the repository root).
2. Settings → Pages → Source: `main` branch, `/ (root)`.
3. The deck is live at `https://<user>.github.io/<repo>/`.

## Presenting
Click **PRESENT** (bottom right) to go fullscreen. Browsers require that click, so the deck cannot auto-fullscreen on load.

| Key | Action |
| --- | --- |
| Right arrow / Space | Finish the current slide's build, then go to the next slide |
| Left arrow | Previous slide |
| Esc | Leave fullscreen / present mode |

Clicking the right side of the screen while presenting advances; the far left goes back.

The deck holds its 1920×1080 composition and letterboxes to fit any 16:9 or non-16:9 screen (1920×1080, 2560×1440, laptops). Nothing stretches and no element moves.

## Files
- `index.html` — the presentation (all 7 slides, inline-styled exactly as designed)
- `js/deck-stage.js` — slide stage: scaling, navigation, print
- `js/present.js` — PRESENT button, fullscreen, presenter keys and click zones
- `assets/` — logos and the Sanad screenshot
- `eDamana Ministerial Briefing.dc.html` — editable design source (not needed to present)

## Fonts
Figtree and IBM Plex Sans Arabic load from Google Fonts. With no internet the deck still runs, but falls back to a system sans-serif. For a guaranteed-offline room, install both fonts locally on the presenting machine.
