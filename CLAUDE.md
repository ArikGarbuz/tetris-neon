# Tetris — Neon Edition · Project Rules

## Stack
- **Language**: Vanilla JavaScript (ES6+) — no frameworks, no transpilers
- **Rendering**: HTML5 Canvas API only
- **Styling**: Plain CSS3 — no preprocessors, no utility libraries
- **Dependencies**: Zero external libraries or CDN imports

## Visual Theme
Neon / synthwave aesthetic:
- Near-black background (`#08080f`)
- Neon piece colors: cyan, magenta, green, yellow, red, blue, orange
- Glow via Canvas `shadowBlur` and CSS `text-shadow` / `box-shadow`
- Subtle scanline overlay and grid pattern

## Required Features
- **SRS rotation** with full wall-kick tables (JLSTZ & I pieces)
- **Ghost piece** — semi-transparent drop preview
- **Leveling** — speed increases every 10 lines cleared
- **Screen shake** — canvas translate jitter on line clears (intensity ∝ lines cleared)
- **AI Autoplay** — heuristic engine (aggregate height, holes, bumpiness, complete lines)
- **Hold piece** — swap with C key, once per piece
- **DAS/ARR** — delayed auto-shift / auto-repeat for smooth horizontal movement
- **7-bag randomizer** — fair piece distribution

## Code Conventions
- Single game logic file: `game.js`
- Section headers: `// ── Section Name ──────────`
- Plain objects + functions (no classes)
- No build step — open `index.html` directly in browser
- High score persisted in `localStorage` under key `neon_hi`
