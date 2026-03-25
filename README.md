# TETRIS — Neon Edition

A fully-featured Tetris clone with a neon aesthetic, built with vanilla JavaScript and Canvas API. No libraries, no build step — just open `index.html` and play.

Fully responsive: works on **desktop**, **tablet**, and **mobile**.

---

## Features

- **Classic Tetris gameplay** on a 10×20 grid with all 7 tetrominoes
- **SRS rotation system** with full wall-kick tables
- **Ghost piece** — shows where the piece will land
- **Hold piece** — swap the current piece (C / HOLD button)
- **7-bag randomizer** — fair piece distribution
- **DAS/ARR** — smooth delayed auto-shift for horizontal movement
- **Leveling system** — speed increases every 10 lines
- **High score** — persisted in `localStorage`
- **AI autoplay** — heuristic-based AI that plays the game automatically
- **Screen shake** on line clears (scales with number of lines)
- **Responsive design** — adapts to desktop, tablet, and mobile screens
- **Touch gamepad** — full on-screen controls for tablet and mobile

---

## How to Play

1. Clone or download the repository
2. Open `index.html` in any modern browser
3. Press **Space** or tap the screen to start

No server required — runs entirely in the browser.

---

## Controls

### Keyboard

| Key | Action |
|-----|--------|
| `← →` / `A D` | Move left / right |
| `↑` / `X` | Rotate clockwise |
| `Z` | Rotate counter-clockwise |
| `↓` / `S` | Soft drop |
| `Space` | Hard drop |
| `C` | Hold piece |
| `P` | Pause |

### Mobile / Tablet

On-screen touch buttons are shown automatically on touch-capable screens.
You can also use **swipe gestures** on the game canvas:

| Gesture | Action |
|---------|--------|
| Tap | Rotate clockwise |
| Swipe left / right | Move |
| Swipe down | Hard drop |
| Swipe up | Hold piece |

---

## Scoring

| Lines cleared | Points (× level) |
|--------------|------------------|
| 1 (Single)   | 100              |
| 2 (Double)   | 300              |
| 3 (Triple)   | 500              |
| 4 (Tetris)   | 800              |

- Soft drop: +1 point per row
- Hard drop: +2 points per row

---

## Browser Compatibility

Works in all modern browsers:

- Chrome / Edge 80+
- Firefox 75+
- Safari 13+
- Mobile Chrome and Safari

---

## Project Structure

```
tetris/
├── index.html   — Main HTML (desktop + tablet + mobile layout)
├── game.js      — All game logic (vanilla JS, ~610 lines)
├── style.css    — Responsive styles (desktop / tablet / mobile)
└── CLAUDE.md    — Project specification
```

---

## License

MIT — see [LICENSE](LICENSE)
