import puppeteer from 'puppeteer-core';
import http from 'http';
import fs from 'fs';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const OUT_DIR = path.resolve('docs/redesign/rpg-slice');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

const PORT = 4321;

const server = http.createServer((req, res) => {
  const url = req.url.split('?')[0];

  // Static fonts
  if (url.startsWith('/fonts/')) {
    const fontPath = path.resolve('public', url.slice(1));
    if (fs.existsSync(fontPath)) {
      res.writeHead(200, { 'Content-Type': 'font/woff2' });
      return fs.createReadStream(fontPath).pipe(res);
    }
  }

  // Static assets
  if (url.startsWith('/assets/')) {
    const assetPath = path.resolve('public', url.slice(1));
    if (fs.existsSync(assetPath)) {
      res.writeHead(200, { 'Content-Type': 'image/png' });
      return fs.createReadStream(assetPath).pipe(res);
    }
  }

  // HTML page
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(generateHtml());
});

function generateHtml() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
  <title>fih — Pixel Valley 16-Bit Top-Down RPG Vertical Slice [DEV MODE]</title>
  <style>
    @font-face {
      font-family: 'Press Start 2P';
      src: url('/fonts/PressStart2P-Regular.woff2') format('woff2');
      font-weight: normal;
      font-style: normal;
      font-display: swap;
    }
    @font-face {
      font-family: 'Silkscreen';
      src: url('/fonts/Silkscreen-Regular.woff2') format('woff2');
      font-weight: normal;
      font-style: normal;
      font-display: swap;
    }
    @font-face {
      font-family: 'Silkscreen';
      src: url('/fonts/Silkscreen-Bold.woff2') format('woff2');
      font-weight: bold;
      font-style: normal;
      font-display: swap;
    }

    :root {
      --font-pixel-display: 'Press Start 2P', monospace;
      --font-pixel-body: 'Silkscreen', monospace;
      --pv-wood-dark: #452817;
      --pv-wood-light: #8b572a;
      --pv-gold: #f2c230;
      --pv-parchment: #f4e4bc;
      --pv-ink: #2b1a0e;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      background: #120b06;
      font-family: var(--font-pixel-body);
      color: #fdf6e2;
      overflow: hidden;
      width: 100vw;
      height: 100vh;
      position: relative;
      image-rendering: pixelated;
    }

    /* Pixel Stepped Frames */
    .pixel-frame-wood {
      background: #23140c;
      border: 3px solid #5a341a;
      box-shadow: 
        inset 2px 2px 0 #7b4a28,
        inset -2px -2px 0 #120a06,
        0 4px 12px rgba(0,0,0,0.5);
    }

    .pixel-frame-parchment {
      background: #f4e4bc;
      border: 3px solid #784323;
      color: #2b1a0e;
      box-shadow: 
        inset 2px 2px 0 #fff5d9,
        inset -2px -2px 0 #c7a46e,
        0 4px 16px rgba(0,0,0,0.4);
    }

    .pixel-btn {
      background: #5a341a;
      color: #fdf6e2;
      font-family: var(--font-pixel-display);
      font-size: 8px;
      padding: 6px 12px;
      border: 2px solid #8b572a;
      box-shadow: inset 1px 1px 0 #a36c3a, inset -1px -1px 0 #2b140c;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .pixel-btn-gold {
      background: #f2c230;
      color: #2b1a0e;
      border-color: #9c6c10;
      box-shadow: inset 1px 1px 0 #ffe082, inset -1px -1px 0 #7a4f08;
    }

    /* HUD */
    .hud-bar {
      position: fixed;
      top: 12px;
      left: 14px;
      z-index: 100;
      padding: 7px 12px;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .hud-badge-dev {
      background: #78350f;
      border: 2px solid #f59e0b;
      color: #fef3c7;
      font-family: var(--font-pixel-display);
      font-size: 8px;
      padding: 3px 6px;
      letter-spacing: 0.05em;
    }

    /* Hotbar */
    .rpg-hotbar {
      position: fixed;
      bottom: 12px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 100;
      display: flex;
      gap: 6px;
      padding: 6px 10px;
      background: #1b1008;
      border: 3px solid #5a341a;
      box-shadow: inset 2px 2px 0 #7b4a28, inset -2px -2px 0 #0d0704;
    }

    .hotbar-slot {
      width: 44px;
      height: 44px;
      background: #2a180e;
      border: 2px solid #452817;
      box-shadow: inset 1px 1px 0 #120a06, inset -1px -1px 0 #5a341a;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      position: relative;
    }

    .hotbar-slot.active {
      background: #3b2214;
      border: 2px solid #f2c230;
      box-shadow: 0 0 8px rgba(242, 194, 48, 0.4), inset 1px 1px 0 #ffe082;
    }

    .hotbar-slot .key-num {
      position: absolute;
      top: 2px;
      left: 3px;
      font-family: var(--font-pixel-display);
      font-size: 7px;
      color: #a89484;
    }

    .hotbar-slot.active .key-num {
      color: #f2c230;
    }

    /* Dialogue */
    .dialogue-box {
      position: fixed;
      bottom: 74px;
      left: 14px;
      z-index: 90;
      width: 540px;
      max-width: calc(100vw - 28px);
      padding: 12px 14px;
      display: flex;
      gap: 12px;
    }

    .dialogue-portrait {
      width: 48px;
      height: 48px;
      background: #3a2213;
      border: 2px solid #7b4a28;
      box-shadow: inset 1px 1px 0 #120a06, inset -1px -1px 0 #a36c3a;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      overflow: hidden;
    }

    /* Side Parchment Card (Desktop) */
    .parchment-stage {
      position: fixed;
      top: 14px;
      right: 14px;
      bottom: 74px;
      width: 480px;
      max-width: calc(100vw - 28px);
      z-index: 80;
      overflow-y: auto;
      padding: 18px 20px;
    }

    /* Mobile Overrides per Section 4 of Addendum */
    @media (max-width: 768px) {
      #world-canvas {
        height: 38vh !important;
        position: absolute;
        top: 0;
        left: 0;
        width: 100vw !important;
      }
      .hud-bar {
        top: 8px;
        left: 8px;
        padding: 4px 8px;
        gap: 6px;
      }
      .hud-bar .hide-mobile {
        display: none !important;
      }
      .dialogue-box {
        display: none !important;
      }
      .parchment-stage {
        top: 38vh !important;
        right: 8px !important;
        left: 8px !important;
        bottom: 64px !important;
        width: auto !important;
        max-width: none !important;
        padding: 12px 14px;
      }
      .rpg-hotbar {
        bottom: 6px;
        padding: 3px 6px;
        gap: 3px;
      }
      .hotbar-slot {
        width: 34px;
        height: 34px;
        font-size: 14px;
      }
    }
  </style>
</head>
<body>

  <!-- 1. The 16-Bit Tile-Map Canvas World -->
  <canvas id="world-canvas" style="position: absolute; inset: 0; width: 100%; height: 100%; z-index: 1;"></canvas>

  <!-- 2. Persistent HUD with DEV SANDBOX Mode -->
  <header class="hud-bar pixel-frame-wood">
    <div style="display: flex; align-items: center; gap: 5px;">
      <span style="font-size: 13px;">🌾</span>
      <span style="font-family: var(--font-pixel-display); font-size: 9px; color: #facc15;">PIXEL VALLEY</span>
    </div>

    <div class="hud-badge-dev">
      DEV SANDBOX
    </div>

    <div style="font-size: 10px; color: #fdf6e2; display: flex; align-items: center; gap: 4px;">
      <span>🍂 Autumn 4</span>
      <span style="color: #facc15;" class="hide-mobile">• 14:32</span>
    </div>

    <div style="font-size: 10px; color: #8fc45a; font-weight: bold;">
      🪙 +₹1,580g
    </div>

    <div style="font-size: 9px; color: #60a5fa;" class="hide-mobile">
      ☀️ Clear
    </div>
  </header>

  <!-- 3. Side Parchment Data Panel: Chapter 2 The Ledger Hut -->
  <div class="parchment-stage pixel-frame-parchment">
    <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px dashed #784323; padding-bottom: 8px; margin-bottom: 12px;">
      <div>
        <div style="font-family: var(--font-pixel-display); font-size: 11px; color: #452817; letter-spacing: 0.04em;">
          CHAPTER 2: THE LEDGER HUT
        </div>
        <div style="font-size: 10px; color: #784323; margin-top: 3px;">
          Bram's Gold Scale & Village Tabs
        </div>
      </div>
      <button class="pixel-btn pixel-btn-gold" style="font-size: 8px;">
        + RECORD TAB
      </button>
    </div>

    <!-- Scale & Net Position Summary -->
    <div style="background: rgba(120, 67, 35, 0.12); border: 2px solid #a36c3a; padding: 10px 12px; margin-bottom: 14px; display: flex; align-items: center; justify-content: space-between;">
      <div>
        <div style="font-size: 9px; font-family: var(--font-pixel-display); color: #784323;">TOWN NET BALANCE</div>
        <div style="font-size: 16px; font-weight: bold; color: #2e6930; font-family: var(--font-pixel-display); margin-top: 4px;">
          +₹1,580
        </div>
        <div style="font-size: 9px; color: #5a341a; margin-top: 2px;">
          Scale tilted toward your favor (2 tabs active)
        </div>
      </div>
      <div style="font-size: 28px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));">
        ⚖️
      </div>
    </div>

    <!-- Active Debt Items Bound to Live Engine -->
    <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 14px;">
      
      <!-- Item 1: Arjun -->
      <div style="background: #fff9ea; border: 2px solid #8b572a; padding: 8px 10px; display: flex; justify-content: space-between; align-items: center; box-shadow: 1px 1px 0 #c7a46e;">
        <div>
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="font-family: var(--font-pixel-display); font-size: 9px; color: #2b1a0e;">Arjun</span>
            <span style="font-size: 7px; background: #dcfce7; color: #166534; padding: 1px 4px; border: 1px solid #86efac; font-weight: bold;">OWES ME</span>
            <span style="font-size: 7px; background: #e0e7ff; color: #3730a3; padding: 1px 4px; border: 1px solid #a5b4fc;">💬 WHATSAPP</span>
          </div>
          <div style="font-size: 9px; color: #784323; margin-top: 3px;">
            Advance for mountain trek supplies
          </div>
        </div>
        <div style="text-align: right;">
          <div style="font-family: var(--font-pixel-display); font-size: 10px; color: #166534;">₹2,080</div>
          <button class="pixel-btn" style="padding: 2px 6px; font-size: 7px; margin-top: 3px;">SETTLE</button>
        </div>
      </div>

      <!-- Item 2: Hanan -->
      <div style="background: #fff9ea; border: 2px solid #8b572a; padding: 8px 10px; display: flex; justify-content: space-between; align-items: center; box-shadow: 1px 1px 0 #c7a46e;">
        <div>
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="font-family: var(--font-pixel-display); font-size: 9px; color: #2b1a0e;">Hanan</span>
            <span style="font-size: 7px; background: #fee2e2; color: #991b1b; padding: 1px 4px; border: 1px solid #fca5a5; font-weight: bold;">I OWE</span>
            <span style="font-size: 7px; background: #fef3c7; color: #92400e; padding: 1px 4px; border: 1px solid #fde68a;">🌐 WEB</span>
          </div>
          <div style="font-size: 9px; color: #784323; margin-top: 3px;">
            Dinner at the Starlight Saloon
          </div>
        </div>
        <div style="text-align: right;">
          <div style="font-family: var(--font-pixel-display); font-size: 10px; color: #991b1b;">₹500</div>
          <button class="pixel-btn" style="padding: 2px 6px; font-size: 7px; margin-top: 3px;">SETTLE</button>
        </div>
      </div>

      <!-- Item 3: Sarah (Settled) -->
      <div style="background: #f0e2ca; border: 1px dashed #a36c3a; padding: 7px 10px; display: flex; justify-content: space-between; align-items: center; opacity: 0.75;">
        <div>
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="font-family: var(--font-pixel-display); font-size: 8px; color: #5a341a; text-decoration: line-through;">Sarah</span>
            <span style="font-size: 7px; background: #e5e7eb; color: #4b5563; padding: 1px 4px; border: 1px solid #d1d5db;">SETTLED</span>
          </div>
          <div style="font-size: 8px; color: #784323;">Tools loan for harvest season</div>
        </div>
        <div style="font-family: var(--font-pixel-display); font-size: 8px; color: #784323; text-decoration: line-through;">
          ₹300
        </div>
      </div>
    </div>

    <!-- Bram's Ledger Advice Note -->
    <div style="font-size: 9px; color: #784323; border-top: 1px solid #d4b896; padding-top: 8px; font-style: italic;">
      * Bram keeps the physical brass scales in perfect balance. Click any sack on his counter to inspect records.
    </div>
  </div>

  <!-- 4. Bram Dialogue Box (Desktop) -->
  <div class="dialogue-box pixel-frame-wood">
    <div class="dialogue-portrait">
      <img src="/assets/characters/bram_factor.png" style="width: 48px; height: 64px; object-fit: cover; object-position: 0 0; image-rendering: pixelated; margin-top: -4px;" alt="Bram" />
    </div>
    <div style="flex: 1;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
        <span style="font-family: var(--font-pixel-display); font-size: 9px; color: #f2c230;">BRAM THE FACTOR</span>
        <span style="font-size: 9px; color: #a89484;">The Ledger Hut</span>
      </div>
      <div style="font-size: 11px; line-height: 1.5; color: #fdf6e2;">
        “Clear accounts make steadfast friends,” as we say in the valley. Settle your tabs before the autumn fair, and your pouch will always jingle with prosperity!
      </div>
    </div>
    <div style="align-self: flex-end; font-size: 10px; color: #f2c230;">
      ▼
    </div>
  </div>

  <!-- 5. 8-Slot RPG Hotbar -->
  <nav class="rpg-hotbar">
    <div class="hotbar-slot"><span class="key-num">1</span><span>🌾</span></div>
    <div class="hotbar-slot active"><span class="key-num">2</span><span>🪙</span></div>
    <div class="hotbar-slot"><span class="key-num">3</span><span>🔔</span></div>
    <div class="hotbar-slot"><span class="key-num">4</span><span>📌</span></div>
    <div class="hotbar-slot"><span class="key-num">5</span><span>✨</span></div>
    <div class="hotbar-slot"><span class="key-num">6</span><span>🎞️</span></div>
    <div class="hotbar-slot"><span class="key-num">7</span><span>📜</span></div>
    <div class="hotbar-slot"><span class="key-num">8</span><span>⚙️</span></div>
  </nav>

  <!-- 6. Canvas 16-Bit Engine Script (Faithful to PixelWorldCanvas.jsx) -->
  <script>
    const canvas = document.getElementById('world-canvas');
    const ctx = canvas.getContext('2d');

    const images = {};
    const imgList = [
      { key: 'tileset', src: '/assets/tilesets/village_tileset.png' },
      { key: 'pip', src: '/assets/characters/pip_walk.png' },
      { key: 'bram', src: '/assets/characters/bram_factor.png' }
    ];

    let loadedCount = 0;
    imgList.forEach(({ key, src }) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        images[key] = img;
        loadedCount++;
        if (loadedCount === imgList.length) {
          initWorld();
        }
      };
    });

    const TILE_SIZE = 16;
    const MAP_WIDTH = 36;
    const MAP_HEIGHT = 24;

    function resize() {
      const isMobile = window.innerWidth <= 768;
      canvas.width = window.innerWidth;
      canvas.height = isMobile ? Math.floor(window.innerHeight * 0.38) : window.innerHeight;
      ctx.imageSmoothingEnabled = false;
    }
    window.addEventListener('resize', resize);
    resize();

    function initWorld() {
      resize();
      const isMobile = window.innerWidth <= 768;
      const scale = isMobile ? 3 : 4;
      
      // Focus on Bram's Ledger Hut at x: 26, y: 11
      const camX = 26 * TILE_SIZE;
      const camY = 11 * TILE_SIZE;

      ctx.imageSmoothingEnabled = false;
      ctx.fillStyle = '#120b06';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.scale(scale, scale);

      const viewW = canvas.width / scale;
      const viewH = canvas.height / scale;

      const offsetX = Math.floor(viewW / 2 - camX);
      const offsetY = Math.floor(viewH / 2 - camY);
      ctx.translate(offsetX, offsetY);

      const tileset = images.tileset;

      // ── Layer 1: Ground Tiles ──
      for (let ty = 0; ty < MAP_HEIGHT; ty++) {
        for (let tx = 0; tx < MAP_WIDTH; tx++) {
          const wx = tx * TILE_SIZE;
          const wy = ty * TILE_SIZE;

          let tileCol = (tx * 7 + ty * 13) % 4; // Variety grass (0-3)

          // Main horizontal dirt path connecting Farmhouse (x: 8) to Ledger Hut (x: 26) at y: 12-14
          const isMainPath = ty >= 12 && ty <= 13 && tx >= 4 && tx <= 30;
          const isBellPath = tx >= 17 && tx <= 18 && ty >= 6 && ty <= 12;

          if (isMainPath || isBellPath) {
            tileCol = 4; // Dirt center
          }

          // Pond at x: 12-15, y: 15-18
          const isPond = tx >= 12 && tx <= 15 && ty >= 16 && ty <= 18;
          if (isPond) {
            ctx.drawImage(tileset, 0, 1 * TILE_SIZE, TILE_SIZE, TILE_SIZE, wx, wy, TILE_SIZE, TILE_SIZE);
            continue;
          }

          // Tilled soil plots in Farmstead zone (x: 5-7, y: 9-10)
          const isGarden = tx >= 5 && tx <= 7 && ty >= 9 && ty <= 10;
          if (isGarden) {
            ctx.drawImage(tileset, 7 * TILE_SIZE, 0 * TILE_SIZE, TILE_SIZE, TILE_SIZE, wx, wy, TILE_SIZE, TILE_SIZE);
            continue;
          }

          ctx.drawImage(tileset, tileCol * TILE_SIZE, 0, TILE_SIZE, TILE_SIZE, wx, wy, TILE_SIZE, TILE_SIZE);
        }
      }

      // ── Layer 2: Cobblestones & Fences ──
      // Ledger Hut Porch Cobblestone (x: 24-28, y: 11-13)
      for (let cx = 24; cx <= 28; cx++) {
        for (let cy = 11; cy <= 13; cy++) {
          ctx.drawImage(tileset, 4 * TILE_SIZE, 1 * TILE_SIZE, TILE_SIZE, TILE_SIZE, cx * TILE_SIZE, cy * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
      }

      // Wooden Rail Fences along Farmhouse north (y: 8, x: 4-10)
      for (let fx = 4; fx <= 10; fx++) {
        ctx.drawImage(tileset, 2 * TILE_SIZE, 1 * TILE_SIZE, TILE_SIZE, TILE_SIZE, fx * TILE_SIZE, 8 * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      }

      // Wooden Rail Fence south of path (y: 14, x: 18-24)
      for (let fx = 18; fx <= 23; fx++) {
        ctx.drawImage(tileset, 2 * TILE_SIZE, 1 * TILE_SIZE, TILE_SIZE, TILE_SIZE, fx * TILE_SIZE, 14 * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      }

      // ── Depth-Sorted Renderables ──
      const renderables = [];

      // 1. Farmhouse Cabin (x: 6, y: 5)
      renderables.push({
        y: 8 * TILE_SIZE,
        render: () => {
          const bx = 6 * TILE_SIZE;
          const by = 5 * TILE_SIZE;
          for (let rx = 0; rx < 4; rx++) {
            ctx.drawImage(tileset, 0, 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE, bx + rx * TILE_SIZE, by, TILE_SIZE, TILE_SIZE);
            ctx.drawImage(tileset, 0, 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE, bx + rx * TILE_SIZE, by + TILE_SIZE, TILE_SIZE, TILE_SIZE);
            if (rx === 2) {
              ctx.drawImage(tileset, 3 * TILE_SIZE, 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE, bx + rx * TILE_SIZE, by + 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            } else if (rx === 1) {
              ctx.drawImage(tileset, 2 * TILE_SIZE, 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE, bx + rx * TILE_SIZE, by + 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            } else {
              ctx.drawImage(tileset, 1 * TILE_SIZE, 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE, bx + rx * TILE_SIZE, by + 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            }
          }
        }
      });

      // 2. Ledger Hut Cabin (x: 24, y: 7)
      renderables.push({
        y: 10 * TILE_SIZE,
        render: () => {
          const hx = 24 * TILE_SIZE;
          const hy = 7 * TILE_SIZE;
          for (let rx = 0; rx < 5; rx++) {
            ctx.drawImage(tileset, 0, 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE, hx + rx * TILE_SIZE, hy, TILE_SIZE, TILE_SIZE);
            ctx.drawImage(tileset, 0, 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE, hx + rx * TILE_SIZE, hy + TILE_SIZE, TILE_SIZE, TILE_SIZE);
            if (rx === 3) {
              ctx.drawImage(tileset, 3 * TILE_SIZE, 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE, hx + rx * TILE_SIZE, hy + 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            } else if (rx === 0 || rx === 4) {
              ctx.drawImage(tileset, 2 * TILE_SIZE, 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE, hx + rx * TILE_SIZE, hy + 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            } else {
              // High contrast cream plaster wall behind Bram
              ctx.drawImage(tileset, 1 * TILE_SIZE, 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE, hx + rx * TILE_SIZE, hy + 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            }
          }
          // Hanging Wooden Shop Signboard ("LEDGER")
          ctx.drawImage(tileset, 4 * TILE_SIZE, 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE, hx + 4 * TILE_SIZE, hy + 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE);

          // Roof eaves drop-shadow
          ctx.fillStyle = 'rgba(15, 23, 42, 0.35)';
          ctx.fillRect(hx, hy + 2 * TILE_SIZE, 5 * TILE_SIZE, 2);
        }
      });

      // 3. Bram the Badger Factor (Behind the counter at x: 26, y: 10)
      renderables.push({
        y: 11 * TILE_SIZE + 2,
        render: () => {
          const bramImg = images.bram;
          if (bramImg) {
            // Frame 0: idle
            ctx.drawImage(bramImg, 0, 0, 24, 32, 26 * TILE_SIZE - 4, 10 * TILE_SIZE, 24, 32);
          }
        }
      });

      // 4. Ledger Counter Table & Interactive Props (In front of Bram)
      renderables.push({
        y: 11 * TILE_SIZE + 8,
        render: () => {
          const cx = 25 * TILE_SIZE;
          const cy = 11 * TILE_SIZE;
          // 3 Counter Tiles (Col 5, Row 1)
          ctx.drawImage(tileset, 5 * TILE_SIZE, 1 * TILE_SIZE, TILE_SIZE, TILE_SIZE, cx, cy, TILE_SIZE, TILE_SIZE);
          ctx.drawImage(tileset, 5 * TILE_SIZE, 1 * TILE_SIZE, TILE_SIZE, TILE_SIZE, cx + TILE_SIZE, cy, TILE_SIZE, TILE_SIZE);
          ctx.drawImage(tileset, 5 * TILE_SIZE, 1 * TILE_SIZE, TILE_SIZE, TILE_SIZE, cx + 2 * TILE_SIZE, cy, TILE_SIZE, TILE_SIZE);

          // Brass Balance Scale (Col 6, Row 1) tilted toward right (+1)
          ctx.save();
          ctx.translate(cx + TILE_SIZE + 8, cy + 2);
          ctx.rotate(0.12); // ~7 deg tilt
          ctx.drawImage(tileset, 6 * TILE_SIZE, 1 * TILE_SIZE, TILE_SIZE, TILE_SIZE, -8, -8, TILE_SIZE, TILE_SIZE);
          ctx.restore();

          // 2 Coin Sacks (Col 7, Row 1)
          ctx.drawImage(tileset, 7 * TILE_SIZE, 1 * TILE_SIZE, TILE_SIZE, TILE_SIZE, cx + 2, cy - 2, TILE_SIZE, TILE_SIZE);
          ctx.drawImage(tileset, 7 * TILE_SIZE, 1 * TILE_SIZE, TILE_SIZE, TILE_SIZE, cx + 8, cy - 4, TILE_SIZE, TILE_SIZE);
        }
      });

      // 5. Pip the Farmer walking toward counter (x: 22, y: 12)
      renderables.push({
        y: 12 * TILE_SIZE + 30,
        render: () => {
          const pipImg = images.pip;
          if (pipImg) {
            const px = 22 * TILE_SIZE;
            const py = 12 * TILE_SIZE;

            // Ground shadow
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.beginPath();
            ctx.ellipse(px + 8, py + 29, 6, 3, 0, 0, Math.PI * 2);
            ctx.fill();

            // Row 2 (Right walk), Frame 1
            ctx.drawImage(pipImg, 1 * 16, 2 * 32, 16, 32, px, py, 16, 32);
          }
        }
      });

      // Sort and render all entities
      renderables.sort((a, b) => a.y - b.y);
      renderables.forEach(r => r.render());

      ctx.restore();

      // Warm Daytime RPG Sunlight Overlay
      ctx.fillStyle = 'rgba(255, 235, 180, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  </script>
</body>
</html>`;
}

async function capture() {
  server.listen(PORT, async () => {
    console.log(`Server started on http://localhost:${PORT}`);

    try {
      const browser = await puppeteer.launch({
        executablePath: EDGE_PATH,
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none'],
      });

      // 1. Desktop 1280x800
      console.log('Capturing Desktop 1280x800...');
      const pageDesktop = await browser.newPage();
      await pageDesktop.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 });
      await pageDesktop.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle0' });
      await new Promise(r => setTimeout(r, 1200));
      const desktopPath = path.join(OUT_DIR, 'ledger-hut-desktop.png');
      await pageDesktop.screenshot({ path: desktopPath });
      console.log(`Saved Desktop: ${desktopPath}`);
      await pageDesktop.close();

      // 2. Mobile 390x844
      console.log('Capturing Mobile 390x844...');
      const pageMobile = await browser.newPage();
      await pageMobile.setViewport({ width: 390, height: 844, isMobile: true, deviceScaleFactor: 2 });
      await pageMobile.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle0' });
      await new Promise(r => setTimeout(r, 1200));
      const mobilePath = path.join(OUT_DIR, 'ledger-hut-mobile.png');
      await pageMobile.screenshot({ path: mobilePath });
      console.log(`Saved Mobile: ${mobilePath}`);
      await pageMobile.close();

      await browser.close();
      server.close();
      console.log('Done capturing Phase 1 RPG slice screenshots!');
      process.exit(0);
    } catch (err) {
      console.error('Capture failed:', err);
      server.close();
      process.exit(1);
    }
  });
}

capture();
