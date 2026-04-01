'use strict';
// ╔══════════════════════════════════════════════════════════════╗
// ║           TETRIS — Neon Edition                             ║
// ║   Vanilla JS · Canvas · No external libraries              ║
// ║   Responsive: Desktop + Android/iOS mobile                 ║
// ╚══════════════════════════════════════════════════════════════╝

// ── Constants ─────────────────────────────────────────────────────────────────
const COLS = 10, ROWS = 20;
let BLOCK = 30; // recalculated on resize

const PIECE_COLOR = {
  I: '#00f5ff', O: '#ffe000', T: '#cc00ff',
  S: '#00ff41', Z: '#ff0040', J: '#0066ff', L: '#ff8800'
};

const SHAPES = {
  I: [[[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],
      [[0,0,1,0],[0,0,1,0],[0,0,1,0],[0,0,1,0]],
      [[0,0,0,0],[0,0,0,0],[1,1,1,1],[0,0,0,0]],
      [[0,1,0,0],[0,1,0,0],[0,1,0,0],[0,1,0,0]]],
  O: [[[1,1],[1,1]],[[1,1],[1,1]],[[1,1],[1,1]],[[1,1],[1,1]]],
  T: [[[0,1,0],[1,1,1],[0,0,0]],[[0,1,0],[0,1,1],[0,1,0]],
      [[0,0,0],[1,1,1],[0,1,0]],[[0,1,0],[1,1,0],[0,1,0]]],
  S: [[[0,1,1],[1,1,0],[0,0,0]],[[0,1,0],[0,1,1],[0,0,1]],
      [[0,0,0],[0,1,1],[1,1,0]],[[1,0,0],[1,1,0],[0,1,0]]],
  Z: [[[1,1,0],[0,1,1],[0,0,0]],[[0,0,1],[0,1,1],[0,1,0]],
      [[0,0,0],[1,1,0],[0,1,1]],[[0,1,0],[1,1,0],[1,0,0]]],
  J: [[[1,0,0],[1,1,1],[0,0,0]],[[0,1,1],[0,1,0],[0,1,0]],
      [[0,0,0],[1,1,1],[0,0,1]],[[0,1,0],[0,1,0],[1,1,0]]],
  L: [[[0,0,1],[1,1,1],[0,0,0]],[[0,1,0],[0,1,0],[0,1,1]],
      [[0,0,0],[1,1,1],[1,0,0]],[[1,1,0],[0,1,0],[0,1,0]]]
};

// SRS wall-kick offsets [from_state] (+y = up in SRS)
const KICKS = {
  JLSTZ: [
    [[0,0],[-1,0],[-1,1],[0,-2],[-1,-2]],
    [[0,0],[1,0],[1,-1],[0,2],[1,2]],
    [[0,0],[1,0],[1,1],[0,-2],[1,-2]],
    [[0,0],[-1,0],[-1,-1],[0,2],[-1,2]]
  ],
  I: [
    [[0,0],[-2,0],[1,0],[-2,-1],[1,2]],
    [[0,0],[-1,0],[2,0],[-1,2],[2,-1]],
    [[0,0],[2,0],[-1,0],[2,1],[-1,-2]],
    [[0,0],[1,0],[-2,0],[1,-2],[-2,1]]
  ]
};

const SCORE_TABLE  = [0, 100, 300, 500, 800];
const LINES_PER_LV = 10;
const DROP_MS = [0,800,650,500,400,300,220,160,120,100,80,70,60,55,50,45,40,38,35,32,30];
const AI_W    = { h: -0.51, lines: 0.76, holes: -0.36, bumpy: -0.18 };
const AI_STEP_MS = 75;
const DAS = 167, ARR = 33, LOCK_DELAY = 500;
const TIME_LEVEL_MS = 60000; // forced level-up every 60 seconds

// ── Haptic feedback ────────────────────────────────────────────────────────────
function haptic(ms) {
  if ('vibrate' in navigator) navigator.vibrate(ms);
}
function hapticTap()     { haptic(12); }
function hapticRotate()  { haptic([8, 10, 12]); }
function hapticDrop()    { haptic([10, 15, 20]); }
function hapticLock()    { haptic([15, 20, 15]); }
function hapticClear()   { haptic([20, 10, 20, 10, 20]); }
function hapticGameOver(){ haptic([30, 50, 30, 50, 30]); }

// ── Audio (Web Audio API — zero external files) ────────────────────────────────
let audioCtx = null;
function ensureAudio() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
  } catch(e) {}
}
function tone(freq, type, startOff, dur, vol, freqEnd) {
  if (!audioCtx || muted) return;
  try {
    const ac = audioCtx, t = ac.currentTime + startOff;
    const osc = ac.createOscillator(), g = ac.createGain();
    osc.connect(g); g.connect(ac.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (freqEnd) osc.frequency.exponentialRampToValueAtTime(freqEnd, t + dur);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.start(t); osc.stop(t + dur + 0.06);
  } catch(e) {}
}
const sfxRotate   = () => tone(440, 'square', 0, 0.05, 0.04);
const sfxHold     = () => { tone(320,'triangle',0,0.09,0.07); tone(500,'triangle',0.06,0.08,0.05); };
const sfxDrop     = () => tone(100, 'sawtooth', 0, 0.14, 0.10, 55);
const sfxLock     = () => tone(180, 'square', 0, 0.07, 0.06, 90);
const sfxGameOver = () => [440,349,294,247,196].forEach((f,i) => tone(f,'sawtooth',i*0.11,0.22,0.09));
const sfxLevelUp  = () => [523,659,784,1047].forEach((f,i) => tone(f,'sine',i*0.09,0.20,0.14));
function sfxLineClear(n) {
  const m = [[523,659,784],[587,740,880],[659,831,988,1175],[698,880,1047,1319,1568]];
  (m[n-1] || m[0]).forEach((f,i) => tone(f,'sine',i*0.055,0.16,0.12));
}

// ── Particles ─────────────────────────────────────────────────────────────────
const particles = [];
function spawnClearParticles(row, colors) {
  for (let c = 0; c < COLS; c++) {
    const col = colors[c] || '#00f5ff';
    for (let k = 0; k < 5; k++)
      particles.push({ x:(c+Math.random())*BLOCK, y:(row+Math.random())*BLOCK,
        vx:(Math.random()-0.5)*8, vy:-Math.random()*6-1,
        col, life:1, decay:0.024+Math.random()*0.022, r:2+Math.random()*3.5 });
  }
}
function spawnLockParticles(piece) {
  const m = mat(piece), col = PIECE_COLOR[piece.type];
  for (let r = 0; r < m.length; r++)
    for (let c = 0; c < m[r].length; c++)
      if (m[r][c] && piece.y + r >= 0)
        for (let k = 0; k < 2; k++)
          particles.push({ x:(piece.x+c+Math.random())*BLOCK, y:(piece.y+r+Math.random())*BLOCK,
            vx:(Math.random()-0.5)*2, vy:(Math.random()-0.5)*2,
            col:'#ffffff', life:0.65, decay:0.09, r:BLOCK*0.28 });
}
function updateParticles(dt) {
  const s = dt / 16;
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx*s; p.y += p.vy*s; p.vy += 0.28*s; p.life -= p.decay*s;
    if (p.life <= 0) particles.splice(i, 1);
  }
}
function renderParticles() {
  for (const p of particles) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, p.life) * 0.85;
    ctx.fillStyle = ctx.shadowColor = p.col;
    ctx.shadowBlur = p.r * 2;
    ctx.fillRect(p.x - p.r/2, p.y - p.r/2, p.r, p.r);
    ctx.restore();
  }
}

// ── Canvas / context references ───────────────────────────────────────────────
const $ = id => document.getElementById(id);

const canvas = $('game-canvas');
const ctx    = canvas.getContext('2d');

const nextCvs = $('next-canvas'), nCtx  = nextCvs.getContext('2d');
const holdCvs = $('hold-canvas'), hCtx  = holdCvs.getContext('2d');

// Mobile mini-canvases (may be null on desktop)
const nextMEl = $('next-m');
const holdMEl = $('hold-m');
const nCtxM   = nextMEl ? nextMEl.getContext('2d') : null;
const hCtxM   = holdMEl ? holdMEl.getContext('2d') : null;

// ── Responsive sizing ─────────────────────────────────────────────────────────
function calcBlock() {
  const w = window.innerWidth;
  if (w > 1024) return 30; // Desktop: fixed block size
  if (w > 600) {
    // Tablet: HUD ~64px + touch controls ~160px
    const availH = window.innerHeight - 64 - 160 - 10;
    const availW = w - 4;
    const byH = Math.floor(availH / ROWS);
    const byW = Math.floor(availW / COLS);
    return Math.max(Math.min(byH, byW, 40), 14);
  }
  // Mobile: HUD ~56px + touch controls ~138px
  const availH = window.innerHeight - 56 - 138 - 10;
  const availW = w - 4;
  const byH = Math.floor(availH / ROWS);
  const byW = Math.floor(availW / COLS);
  return Math.max(Math.min(byH, byW, 30), 14);
}

function resizeCanvases() {
  BLOCK = calcBlock();
  canvas.width  = COLS * BLOCK;
  canvas.height = ROWS * BLOCK;
  nextCvs.width = nextCvs.height = 4 * BLOCK;
  holdCvs.width = holdCvs.height = 4 * BLOCK;
  // Mobile mini canvases: smaller preview block size
  const mb = Math.max(Math.floor(BLOCK * 0.5), 10);
  if (nextMEl) { nextMEl.width = nextMEl.height = 4 * mb; }
  if (holdMEl) { holdMEl.width = holdMEl.height = 4 * mb; }
}

window.addEventListener('resize',            resizeCanvases);
window.addEventListener('orientationchange', resizeCanvases);

// ── Game state ────────────────────────────────────────────────────────────────
let board, cur, nextPc, heldPc, bag;
let score, level, totalLines, hiScore;
let started, over, paused, holdUsed;
let dropTimer, lastTs, shakeFrames, shakeMag, gameElapsed, levelFlashTimer;
let muted = false;
let lockActive, lockTimer;
let aiOn = false, aiStepTimer = 0, aiTgtRot, aiTgtX;
const keys  = {};
let dasDir  = 0, dasTimer = 0, arrTimer = 0;
let touchSoft = false; // mobile soft-drop hold state

// ── Bag randomizer ────────────────────────────────────────────────────────────
const TYPES = ['I','O','T','S','Z','J','L'];

function pullBag() {
  if (!bag.length) {
    bag = [...TYPES];
    for (let i = 6; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [bag[i], bag[j]] = [bag[j], bag[i]];
    }
  }
  return bag.pop();
}

// ── Piece helpers ─────────────────────────────────────────────────────────────
function mkPiece(type) {
  return { type, rot: 0, x: type === 'O' ? 4 : 3, y: type === 'I' ? -1 : 0 };
}
function mat(p) { return SHAPES[p.type][p.rot]; }

// ── Collision ─────────────────────────────────────────────────────────────────
function hits(m, x, y, b = board) {
  for (let r = 0; r < m.length; r++)
    for (let c = 0; c < m[r].length; c++)
      if (m[r][c]) {
        const nx = x + c, ny = y + r;
        if (nx < 0 || nx >= COLS || ny >= ROWS) return true;
        if (ny >= 0 && b[ny][nx]) return true;
      }
  return false;
}

// ── Movement ──────────────────────────────────────────────────────────────────
function tryMove(dx, dy) {
  if (hits(mat(cur), cur.x + dx, cur.y + dy)) return false;
  cur.x += dx; cur.y += dy;
  if (dy === 0 && lockActive) { lockActive = false; lockTimer = 0; }
  return true;
}

function tryRot(dir) {
  const from = cur.rot, to = (from + dir + 4) % 4;
  const m = SHAPES[cur.type][to];
  const kk = cur.type === 'I' ? KICKS.I : KICKS.JLSTZ;
  const table = dir === 1 ? kk[from] : kk[to].map(([a, b]) => [-a, -b]);
  for (const [dx, dy] of table) {
    if (!hits(m, cur.x + dx, cur.y - dy)) {
      cur.x += dx; cur.y -= dy; cur.rot = to;
      lockActive = false; lockTimer = 0;
      sfxRotate();
      return true;
    }
  }
  return false;
}

function ghostY() {
  let gy = cur.y;
  while (!hits(mat(cur), cur.x, gy + 1)) gy++;
  return gy;
}

function hardDrop() {
  let n = 0;
  while (!hits(mat(cur), cur.x, cur.y + 1)) { cur.y++; n++; }
  score += n * 2;
  sfxDrop();
  lock();
}

function doHold() {
  if (holdUsed) return;
  holdUsed = true;
  sfxHold();
  const type = cur.type;
  if (heldPc) { cur = mkPiece(heldPc.type); }
  else { cur = nextPc; nextPc = mkPiece(pullBag()); }
  heldPc = { type };
  dropTimer = 0; lockActive = false; lockTimer = 0;
  updateHoldBtn();
  if (aiOn) planAI();
}

// ── Lock & lines ──────────────────────────────────────────────────────────────
function lock() {
  const m = mat(cur);
  for (let r = 0; r < m.length; r++)
    for (let c = 0; c < m[r].length; c++)
      if (m[r][c]) {
        if (cur.y + r < 0) { endGame(); return; }
        board[cur.y + r][cur.x + c] = PIECE_COLOR[cur.type];
      }
  sfxLock();
  spawnLockParticles(cur);
  clearLines();
  spawn();
}

function clearLines() {
  // Capture row colors BEFORE clearing (for particle burst)
  const cleared = [];
  for (let r = ROWS - 1; r >= 0; r--)
    if (board[r].every(v => v)) cleared.push({ y: r, colors: [...board[r]] });

  let n = 0;
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r].every(v => v)) {
      board.splice(r, 1); board.unshift(new Array(COLS).fill(0)); r++; n++;
    }
  }
  if (!n) return;

  cleared.forEach(({ y, colors }) => spawnClearParticles(y, colors));
  sfxLineClear(n);
  score += SCORE_TABLE[n] * level;
  totalLines += n;
  level = Math.floor(totalLines / LINES_PER_LV) + 1;
  shakeMag = n * 6; shakeFrames = n * 7;
  updateHUD();
}

function spawn() {
  cur = nextPc; nextPc = mkPiece(pullBag());
  holdUsed = false; dropTimer = 0; lockActive = false; lockTimer = 0;
  updateHoldBtn();
  if (hits(mat(cur), cur.x, cur.y)) { endGame(); return; }
  if (aiOn) planAI();
}

function endGame() {
  over = true;
  sfxGameOver();
  if (score > hiScore) { hiScore = score; localStorage.setItem('neon_hi', hiScore); }
  showOverlay('GAME OVER', 'Score: ' + score.toLocaleString() + '\nTAP to restart');
}

// ── AI ────────────────────────────────────────────────────────────────────────
function evalBoard(b) {
  const hs = new Array(COLS).fill(0);
  for (let c = 0; c < COLS; c++)
    for (let r = 0; r < ROWS; r++)
      if (b[r][c]) { hs[c] = ROWS - r; break; }
  const totH = hs.reduce((a, v) => a + v, 0);
  let holes = 0;
  for (let c = 0; c < COLS; c++) {
    let blk = false;
    for (let r = 0; r < ROWS; r++) { if (b[r][c]) blk = true; else if (blk) holes++; }
  }
  let bumpy = 0;
  for (let c = 0; c < COLS - 1; c++) bumpy += Math.abs(hs[c] - hs[c + 1]);
  return { totH, holes, bumpy };
}

function simDrop(b, m, x, startY) {
  let y = startY;
  while (!hits(m, x, y + 1, b)) y++;
  const nb = b.map(r => [...r]);
  for (let r = 0; r < m.length; r++)
    for (let c = 0; c < m[r].length; c++)
      if (m[r][c] && y + r >= 0) nb[y + r][x + c] = 1;
  let lines = 0;
  for (let r = ROWS - 1; r >= 0; r--)
    if (nb[r].every(v => v)) { nb.splice(r, 1); nb.unshift(new Array(COLS).fill(0)); r++; lines++; }
  return { nb, lines };
}

function planAI() {
  let best = -Infinity; aiTgtRot = cur.rot; aiTgtX = cur.x;
  const rots = cur.type === 'O' ? 1 : 4;
  for (let rot = 0; rot < rots; rot++) {
    const m = SHAPES[cur.type][rot];
    for (let x = -2; x < COLS; x++) {
      if (hits(m, x, cur.y)) continue;
      const { nb, lines } = simDrop(board, m, x, cur.y);
      const { totH, holes, bumpy } = evalBoard(nb);
      const s = AI_W.h * totH + AI_W.lines * lines + AI_W.holes * holes + AI_W.bumpy * bumpy;
      if (s > best) { best = s; aiTgtRot = rot; aiTgtX = x; }
    }
  }
}

function aiStep(dt) {
  if (!aiOn || over || paused || !started) return;
  aiStepTimer += dt;
  if (aiStepTimer < AI_STEP_MS) return;
  aiStepTimer = 0;
  if (cur.rot !== aiTgtRot) { tryRot(1); return; }
  if (cur.x < aiTgtX)       { tryMove(1, 0); return; }
  if (cur.x > aiTgtX)       { tryMove(-1, 0); return; }
  hardDrop();
}

// ── Game loop ─────────────────────────────────────────────────────────────────
function dropInterval() { return DROP_MS[Math.min(level, DROP_MS.length - 1)]; }

function update(dt) {
  if (!started || over || paused) return;
  aiStep(dt);

  // Time-based level progression: +1 level every 60 seconds
  const prevIntervals = Math.floor(gameElapsed / TIME_LEVEL_MS);
  gameElapsed += dt;
  if (Math.floor(gameElapsed / TIME_LEVEL_MS) > prevIntervals) {
    level++;
    levelFlashTimer = 1800;
    sfxLevelUp();
    shakeMag = 5; shakeFrames = 12;
    updateHUD();
  }
  if (levelFlashTimer > 0) levelFlashTimer = Math.max(0, levelFlashTimer - dt);
  updateParticles(dt);

  if (!aiOn && dasDir !== 0) {
    dasTimer += dt;
    if (dasTimer >= DAS) {
      arrTimer += dt;
      while (arrTimer >= ARR) { arrTimer -= ARR; tryMove(dasDir, 0); }
    }
  }

  const soft = !aiOn && (keys['ArrowDown'] || keys['KeyS'] || touchSoft);
  const intv = soft ? Math.min(50, dropInterval()) : dropInterval();
  dropTimer += dt;

  if (dropTimer >= intv) {
    dropTimer -= intv;
    if (!hits(mat(cur), cur.x, cur.y + 1)) {
      cur.y++;
      if (soft) score++;
      if (lockActive) { lockActive = false; lockTimer = 0; }
    } else {
      if (!lockActive) { lockActive = true; lockTimer = 0; }
    }
  }

  if (lockActive) {
    lockTimer += dt;
    const thresh = aiOn ? 80 : LOCK_DELAY;
    if (lockTimer >= thresh) { lockActive = false; lock(); }
  }
}

// ── Rendering ─────────────────────────────────────────────────────────────────
// blk parameter lets mini-canvases use a different block size
function drawBlock(cx, bx, by, color, alpha = 1, blk = BLOCK) {
  const px = bx * blk, py = by * blk;
  cx.save();
  cx.globalAlpha = alpha;
  cx.shadowColor = color; cx.shadowBlur = Math.max(blk * 0.5, 6);
  cx.fillStyle   = color;
  cx.fillRect(px + 1, py + 1, blk - 2, blk - 2);
  cx.shadowBlur = 0;
  cx.fillStyle  = 'rgba(255,255,255,0.18)';
  cx.fillRect(px + 2, py + 2, blk - 4, Math.max(3, Math.floor(blk * 0.14)));
  cx.fillRect(px + 2, py + 2, Math.max(3, Math.floor(blk * 0.14)), blk - 4);
  cx.restore();
}

// drawMini derives block size from the canvas dimensions
function drawMini(cx, type) {
  const cvs = cx.canvas;
  const blk = Math.floor(cvs.width / 4);
  cx.clearRect(0, 0, cvs.width, cvs.height);
  if (!type) return;
  const m = SHAPES[type][0], col = PIECE_COLOR[type];
  const ox = Math.floor((4 - m[0].length) / 2);
  const oy = Math.floor((4 - m.length) / 2);
  for (let r = 0; r < m.length; r++)
    for (let c = 0; c < m[r].length; c++)
      if (m[r][c]) drawBlock(cx, ox + c, oy + r, col, 1, blk);
}

function render() {
  ctx.fillStyle = '#08080f';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.save();

  // Screen shake
  if (shakeFrames > 0) {
    const mag = shakeMag * (shakeFrames / (shakeMag * 1.2));
    ctx.translate((Math.random() - 0.5) * mag, (Math.random() - 0.5) * mag);
    shakeFrames--;
  }

  // Grid
  ctx.strokeStyle = 'rgba(255,255,255,0.04)';
  ctx.lineWidth = 0.5;
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++)
      ctx.strokeRect(c * BLOCK, r * BLOCK, BLOCK, BLOCK);

  // Board
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++)
      if (board[r][c]) drawBlock(ctx, c, r, board[r][c]);

  // Ghost + active piece
  if (started && !over && cur) {
    const m = mat(cur), col = PIECE_COLOR[cur.type], gy = ghostY();
    for (let r = 0; r < m.length; r++)
      for (let c = 0; c < m[r].length; c++) {
        if (!m[r][c]) continue;
        if (gy !== cur.y) drawBlock(ctx, cur.x + c, gy + r, col, 0.18);
        drawBlock(ctx, cur.x + c, cur.y + r, col);
      }
  }

  ctx.restore();

  renderParticles();

  // Level-up flash overlay
  if (levelFlashTimer > 0) {
    const t = levelFlashTimer / 1800;
    ctx.save();
    ctx.globalAlpha = t * 0.12;
    ctx.fillStyle = '#00f5ff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = Math.min(1, t * 2.5);
    ctx.fillStyle = '#00f5ff';
    ctx.shadowColor = '#00f5ff';
    ctx.shadowBlur = 22;
    ctx.font = `bold ${Math.max(13, Math.floor(BLOCK * 0.85))}px 'Courier New',monospace`;
    ctx.textAlign = 'center';
    ctx.fillText('LEVEL UP!', canvas.width / 2, canvas.height / 2);
    ctx.restore();
  }

  // Desktop mini previews
  drawMini(nCtx, nextPc ? nextPc.type : null);
  drawMini(hCtx, heldPc ? heldPc.type : null);
  // Mobile mini previews
  if (nCtxM) drawMini(nCtxM, nextPc ? nextPc.type : null);
  if (hCtxM) drawMini(hCtxM, heldPc ? heldPc.type : null);
}

// ── HUD ───────────────────────────────────────────────────────────────────────
function updatePauseBtn() {
  const btn = $('btn-pause');
  if (btn) btn.textContent = paused ? '▶' : '⏸';
}

function updateHoldBtn() {
  const btn = $('btn-hold');
  if (btn) btn.classList.toggle('hold-used', holdUsed);
}

function updateHUD() {
  const sc = score.toLocaleString();
  const hi = hiScore.toLocaleString();
  $('score').textContent      = sc;
  $('high-score').textContent = hi;
  $('level').textContent      = level;
  $('lines').textContent      = totalLines;
  // Mobile/tablet mirrors
  const sm = $('score-m'), hm = $('high-m'), lm = $('level-m'), lim = $('lines-m');
  if (sm)  sm.textContent  = sc;
  if (hm)  hm.textContent  = hi;
  if (lm)  lm.textContent  = level;
  if (lim) lim.textContent = totalLines;
}

function showOverlay(title, msg) {
  $('overlay-title').textContent   = title;
  $('overlay-message').textContent = msg;
  $('overlay').classList.remove('hidden');
}
function hideOverlay() { $('overlay').classList.add('hidden'); }

// ── Init & start ──────────────────────────────────────────────────────────────
function init() {
  board = Array.from({ length: ROWS }, () => new Array(COLS).fill(0));
  bag = []; score = 0; level = 1; totalLines = 0;
  over = false; paused = false; holdUsed = false; heldPc = null;
  shakeFrames = 0; shakeMag = 0; dropTimer = 0;
  lockActive = false; lockTimer = 0; aiStepTimer = 0; touchSoft = false;
  gameElapsed = 0; levelFlashTimer = 0; particles.length = 0;
  hiScore = parseInt(localStorage.getItem('neon_hi') || '0');
  nextPc = mkPiece(pullBag());
  spawn();
  updateHUD();
}

function startGame() {
  ensureAudio();
  init(); started = true; hideOverlay();
  if (aiOn) planAI();
}

// ── AI toggle (shared logic for both buttons) ─────────────────────────────────
function toggleAI() {
  aiOn = !aiOn;
  [$('ai-toggle'), $('ai-toggle-m')].forEach(btn => {
    if (!btn) return;
    btn.textContent = aiOn ? 'AI: ON' : (btn.id === 'ai-toggle-m' ? 'AI' : 'AI: OFF');
    btn.classList.toggle('active', aiOn);
    // Restore full label for desktop button
    if (btn.id === 'ai-toggle') btn.textContent = aiOn ? 'AI: ON' : 'AI: OFF';
  });
  if (aiOn && started && !over && !paused && cur) planAI();
}

// ── Keyboard input ────────────────────────────────────────────────────────────
document.addEventListener('keydown', e => {
  if (keys[e.code]) return;
  keys[e.code] = true;

  if (!started || over) {
    if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); startGame(); }
    return;
  }
  if (e.code === 'KeyP') {
    paused = !paused;
    if (paused) showOverlay('PAUSED', 'TAP  ·  P to resume');
    else hideOverlay();
    updatePauseBtn();
    return;
  }
  if (paused || aiOn) return;

  switch (e.code) {
    case 'ArrowLeft':  case 'KeyA':
      tryMove(-1, 0); dasDir = -1; dasTimer = 0; arrTimer = 0; break;
    case 'ArrowRight': case 'KeyD':
      tryMove(1, 0);  dasDir =  1; dasTimer = 0; arrTimer = 0; break;
    case 'ArrowUp':    case 'KeyX': tryRot(1);  break;
    case 'KeyZ':                    tryRot(-1); break;
    case 'ArrowDown':  case 'KeyS':
      if (!hits(mat(cur), cur.x, cur.y + 1)) { cur.y++; score++; dropTimer = 0; }
      break;
    case 'Space': e.preventDefault(); hardDrop(); break;
    case 'KeyC':  doHold(); break;
  }
});

document.addEventListener('keyup', e => {
  keys[e.code] = false;
  if (['ArrowLeft','KeyA','ArrowRight','KeyD'].includes(e.code)) {
    if (!keys['ArrowLeft'] && !keys['KeyA'] && !keys['ArrowRight'] && !keys['KeyD']) {
      dasDir = 0; dasTimer = 0; arrTimer = 0;
    }
  }
});

// ── Desktop AI toggle ─────────────────────────────────────────────────────────
$('ai-toggle').addEventListener('click', toggleAI);

// ── Touch helpers ─────────────────────────────────────────────────────────────
function bindTouchBtn(id, onPress, onRelease) {
  const el = $(id);
  if (!el) return;
  el.addEventListener('touchstart', e => {
    e.preventDefault();
    el.classList.add('pressed');
    if (started && !over && !paused && !aiOn) onPress();
  }, { passive: false });
  const up = e => {
    e.preventDefault();
    el.classList.remove('pressed');
    if (onRelease) onRelease();
  };
  el.addEventListener('touchend',    up, { passive: false });
  el.addEventListener('touchcancel', up, { passive: false });
  // Mouse / pointer fallback (desktop testing, stylus)
  el.addEventListener('click', () => {
    if (started && !over && !paused && !aiOn) onPress();
  });
}

// ── Touch buttons ─────────────────────────────────────────────────────────────
bindTouchBtn('btn-left',
  () => { tryMove(-1, 0); dasDir = -1; dasTimer = 0; arrTimer = 0; },
  () => { if (dasDir === -1) { dasDir = 0; dasTimer = 0; arrTimer = 0; } }
);
bindTouchBtn('btn-right',
  () => { tryMove(1, 0); dasDir = 1; dasTimer = 0; arrTimer = 0; },
  () => { if (dasDir === 1) { dasDir = 0; dasTimer = 0; arrTimer = 0; } }
);
bindTouchBtn('btn-soft',
  () => { touchSoft = true; },
  () => { touchSoft = false; }
);
bindTouchBtn('btn-cw',   () => tryRot(1));
bindTouchBtn('btn-ccw',  () => tryRot(-1));
bindTouchBtn('btn-drop', () => hardDrop());
bindTouchBtn('btn-hold', () => doHold());

// Mobile AI toggle
const aiToggleM = $('ai-toggle-m');
if (aiToggleM) aiToggleM.addEventListener('click', toggleAI);

// ── Mobile/Tablet pause & mute buttons ───────────────────────────────────────
function togglePause() {
  if (!started || over) return;
  paused = !paused;
  if (paused) showOverlay('PAUSED', 'TAP  ·  P to resume');
  else hideOverlay();
  updatePauseBtn();
}

function updateMuteBtn() {
  const btn = $('btn-mute');
  if (btn) btn.textContent = muted ? '🔇' : '🔊';
}

// Debounced binder for HUD icon buttons — prevents touchstart+click double-fire
function bindHudBtn(id, handler) {
  const el = $(id);
  if (!el) return;
  let last = 0;
  function onTap(e) {
    e.preventDefault();
    e.stopPropagation();
    const now = Date.now();
    if (now - last < 350) return;
    last = now;
    handler();
  }
  el.addEventListener('touchstart', onTap, { passive: false });
  el.addEventListener('click',      onTap);
}

bindHudBtn('btn-pause', togglePause);
bindHudBtn('btn-mute', () => { muted = !muted; updateMuteBtn(); });

// ── Overlay tap (mobile start / resume) ───────────────────────────────────────
$('overlay').addEventListener('touchstart', e => {
  e.preventDefault();
  if (!started || over) startGame();
  else if (paused) { paused = false; hideOverlay(); updatePauseBtn(); }
}, { passive: false });

// ── Canvas swipe gestures (alternative mobile controls) ───────────────────────
{
  let tx0 = 0, ty0 = 0, moved = false;
  const THRESHOLD = 28;

  canvas.addEventListener('touchstart', e => {
    e.preventDefault();
    const t = e.touches[0];
    tx0 = t.clientX; ty0 = t.clientY; moved = false;
  }, { passive: false });

  canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    const t = e.touches[0];
    if (Math.abs(t.clientX - tx0) > THRESHOLD || Math.abs(t.clientY - ty0) > THRESHOLD)
      moved = true;
  }, { passive: false });

  canvas.addEventListener('touchend', e => {
    e.preventDefault();
    // Overlay is on top when game not running — let overlay handler deal with it
    if (!started || over) return;
    if (paused) { paused = false; hideOverlay(); updatePauseBtn(); return; }
    if (aiOn) return;

    const t = e.changedTouches[0];
    const dx = t.clientX - tx0, dy = t.clientY - ty0;
    const absDx = Math.abs(dx), absDy = Math.abs(dy);

    if (!moved) {
      // Tap: rotate CW
      tryRot(1);
    } else if (absDx > absDy) {
      // Horizontal swipe: move
      if (dx < 0) tryMove(-1, 0); else tryMove(1, 0);
    } else {
      // Vertical swipe: down = hard drop, up = hold
      if (dy > 0) hardDrop(); else doHold();
    }
  }, { passive: false });
}

// Prevent browser scroll/zoom on touch within game area
document.addEventListener('touchmove', e => e.preventDefault(), { passive: false });

// ── Bootstrap ─────────────────────────────────────────────────────────────────
board = Array.from({ length: ROWS }, () => new Array(COLS).fill(0));
bag = []; cur = null; nextPc = null; heldPc = null;
score = 0; level = 1; totalLines = 0; shakeFrames = 0; shakeMag = 0;
started = false; over = false; paused = false;
hiScore = parseInt(localStorage.getItem('neon_hi') || '0');
$('high-score').textContent = hiScore.toLocaleString();
const highMEl = $('high-m'); if (highMEl) highMEl.textContent = hiScore.toLocaleString();

// Size canvases before first render
resizeCanvases();
updateHUD();
showOverlay('TETRIS', 'TAP or SPACE to play');

// ── iOS / Android Web Audio unlock ────────────────────────────────────────────
// Mobile browsers suspend AudioContext until a direct user gesture plays audio.
// Playing a 1-sample silent buffer on the first touch permanently unlocks it.
function unlockAudio() {
  ensureAudio();
  if (audioCtx) {
    try {
      const buf = audioCtx.createBuffer(1, 1, 22050);
      const src = audioCtx.createBufferSource();
      src.buffer = buf;
      src.connect(audioCtx.destination);
      src.start(0);
    } catch(e) {}
  }
}
document.addEventListener('touchstart', unlockAudio, { once: true, passive: true });
document.addEventListener('click',      unlockAudio, { once: true, passive: true });

// Main loop
(function loop(ts) {
  const dt = ts - (lastTs || ts);
  lastTs = ts;
  update(dt);
  render();
  requestAnimationFrame(loop);
})(performance.now());
