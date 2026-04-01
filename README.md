# 🎮 TETRIS NEON — Ultimate Edition v2.0

<div align="center">
  <img src="https://img.shields.io/badge/JavaScript-ES6+-yellow?style=for-the-badge&logo=javascript" alt="JavaScript"/>
  <img src="https://img.shields.io/badge/HTML5-Canvas-blue?style=for-the-badge&logo=html5" alt="HTML5 Canvas"/>
  <img src="https://img.shields.io/badge/CSS3-Responsive-orange?style=for-the-badge&logo=css3" alt="CSS3"/>
  <img src="https://img.shields.io/badge/Mobile--First-Ready-green?style=for-the-badge&logo=mobile" alt="Mobile First"/>
  <br>
  <img src="https://img.shields.io/badge/Version-2.0-red?style=for-the-badge" alt="Version"/>
  <img src="https://img.shields.io/badge/Platform-Web-purple?style=for-the-badge&logo=web" alt="Web Platform"/>
</div>

---

## 🌟 What's New in v2.0

### ✨ **Major Enhancements**
- 🎨 **4 Beautiful Themes**: Synthwave Neon, Dark Matrix, Retro Arcade, Neon Sunset
- 🏆 **Achievement System**: 8 unlockable achievements with progress tracking
- 📱 **Mobile-First Design**: Optimized touch controls with haptic feedback
- 🎆 **Enhanced Particles**: Advanced particle effects with theme-aware colors
- 🎵 **Immersive Audio**: Web Audio API with procedural sound generation
- 📊 **Performance Monitoring**: Built-in FPS counter and optimization

### 🎮 **Gameplay Features**
- **Classic Tetris** with SRS rotation and wall-kick system
- **Ghost Piece** preview for precise placement
- **Hold System** for strategic piece management
- **7-Bag Randomizer** for fair piece distribution
- **AI Opponent** with heuristic-based gameplay
- **Progressive Difficulty** with time-based level advancement
- **Persistent High Scores** and achievement progress

### 📱 **Mobile Experience**
- **Touch-Optimized Controls** with 66px minimum touch targets
- **Haptic Feedback** for all interactions (vibration API)
- **Responsive HUD** that adapts to screen size
- **Gesture Support** with proper touch event handling
- **Battery-Friendly** performance optimizations

---

## 🚀 Quick Start

### Option 1: Play Online (Recommended)
🎯 **Just open**: [`tetris-neon-upgraded.html`](tetris-neon-upgraded.html) in your browser!

### Option 2: Local Development
```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/tetris-neon.git
cd tetris-neon

# Open in browser
open tetris-neon-upgraded.html
```

**No server required** — runs entirely in the browser! 🌐

---

## 🎯 How to Play

1. **Start**: Press **Space** or tap the screen
2. **Move**: Arrow keys or touch controls
3. **Rotate**: ↑/X (clockwise) or Z (counter-clockwise)
4. **Drop**: Space (hard drop) or ↓ (soft drop)
5. **Hold**: C key or HOLD button
6. **Pause**: P key or pause button

### 📱 Mobile Controls
- **Touch buttons** for all actions
- **Swipe gestures** for movement
- **Haptic feedback** on interactions
- **Responsive layout** for all screen sizes

---

## 🎨 Themes

Switch between 4 stunning themes:
- 🌃 **Synthwave Neon** (Default) - Classic cyberpunk aesthetic
- 🌑 **Dark Matrix** - Green-on-black terminal style
- 🕹️ **Retro Arcade** - Classic gaming nostalgia
- 🌅 **Neon Sunset** - Warm orange and pink gradients

**Theme changes persist** across sessions! 🎨

---

## 🏆 Achievements

Unlock 8 achievements as you play:

| Achievement | Description | Icon |
|-------------|-------------|------|
| 🎯 First Clear | Clear your first line | Target |
| ⚡ Speed Demon | Reach level 10 | Lightning |
| 🏆 Line Master | Clear 100 lines | Trophy |
| 💎 Perfect Clear | Clear board with no pieces | Diamond |
| ⭐ High Scorer | Score 10,000 points | Star |
| 👑 Combo King | Clear 4 lines at once | Crown |
| ⏰ Survivor | Play for 5 minutes | Clock |
| 🎲 Piece Master | Use hold 50 times | Die |

---

## 🛠️ Technical Features

### **Performance Optimized**
- **Canvas Rendering** with hardware acceleration
- **Smart Particle Management** with automatic cleanup
- **Efficient Event Handling** with passive listeners
- **Memory Management** with proper object pooling

### **Cross-Platform Compatible**
- **Desktop Browsers**: Chrome, Firefox, Safari, Edge
- **Mobile Browsers**: iOS Safari, Chrome Mobile, Samsung Internet
- **Progressive Enhancement**: Works without modern features

### **Developer Friendly**
- **Vanilla JavaScript** - No dependencies
- **Modular Code** - Easy to understand and modify
- **Well Commented** - Comprehensive documentation
- **ES6+ Features** - Modern JavaScript patterns

---

## 📁 Project Structure

```
tetris-neon/
├── tetris-neon-upgraded.html    # 🚀 Main game file (self-contained)
├── index.html                   # Original version
├── style.css                    # Original styles
├── game.js                      # Original game logic
├── design-system.html          # 🎨 Design documentation
├── design-tokens.json          # 🎨 Theme specifications
├── README.md                    # 📖 This file
└── LICENSE                      # 📄 MIT License
```

---

## 🎵 Audio Features

- **Procedural Sound Generation** using Web Audio API
- **Contextual Audio Feedback** for all game actions
- **Theme-Aware Sound Design** that adapts to current theme
- **Performance Optimized** audio processing

---

## 🔧 Customization

### Adding New Themes
1. Add theme object to `themes` in `tetris-neon-upgraded.html`
2. Include colors for: `bg`, `panelBg`, `border`, `cyan`, `magenta`, `green`, `yellow`, `red`, `text`
3. Add `gridPattern` and `particleColors` arrays
4. Theme automatically appears in theme selector!

### Modifying Achievements
Edit the `achievements` object with new achievement definitions.

---

## 📊 Performance

- **60 FPS** target with smooth animations
- **< 50KB** total file size (gzipped)
- **Zero Dependencies** - pure vanilla JS
- **Battery Efficient** on mobile devices

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

## 📄 License

**MIT License** - Free to use, modify, and distribute.

---

<div align="center">

**Enjoy the game! 🎮✨**

*Built with ❤️ using vanilla JavaScript*

</div>
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
