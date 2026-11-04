import puppeteer from 'puppeteer-core';
import http from 'http';
import fs from 'fs';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const OUT_DIR = path.resolve('docs/redesign/overworld-navigation');
const ARTIFACT_DIR = path.resolve('C:\\Users\\gouth\\.gemini\\antigravity\\brain\\7a513e8a-e2f0-4f3b-8051-22e22a3a0e1e\\overworld-navigation');

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
if (!fs.existsSync(ARTIFACT_DIR)) fs.mkdirSync(ARTIFACT_DIR, { recursive: true });

const PORT = 4325;

const tilesetBase64 = fs.readFileSync('public/assets/tilesets/village_tileset.png').toString('base64');
const pipBase64 = fs.readFileSync('public/assets/characters/pip_walk.png').toString('base64');
const bramBase64 = fs.readFileSync('public/assets/characters/bram_factor.png').toString('base64');
const farmhouseBase64 = fs.readFileSync('public/assets/buildings/farmhouse.png').toString('base64');
const noticeBoardBase64 = fs.readFileSync('public/assets/buildings/notice_board.png').toString('base64');

function buildHTML({ activeTab = null, hasInteracted = false, pipPos = { x: 18 * 16, y: 13 * 16, dir: 0 }, nearbyBuilding = null, isMobile = false, panelOnly = false }) {
  const isOverworld = !activeTab;
  const showDialogue = !panelOnly && (activeTab !== null || (!hasInteracted && isOverworld) || nearbyBuilding !== null);
  const hudGuide = activeTab ? null : (!hasInteracted ? '🎮 WASD / Arrows to Walk • [E] Enter • [P] Panel Only' : (nearbyBuilding ? '🚪 [E] Enter • [P] Panel Only' : null));
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Fih Valley Overworld</title>
  <style>
    @font-face {
      font-family: 'PressStart2P';
      src: url('/fonts/PressStart2P-Regular.woff2') format('woff2');
    }
    @font-face {
      font-family: 'Silkscreen';
      src: url('/fonts/Silkscreen-Regular.woff2') format('woff2');
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #120b06;
      color: #fdf6e2;
      font-family: 'Silkscreen', monospace;
      overflow: hidden;
      width: 100vw;
      height: 100vh;
      image-rendering: pixelated;
    }
    .hud {
      position: fixed;
      top: 12px;
      left: 14px;
      right: ${!isOverworld && !isMobile && !panelOnly ? '510px' : '14px'};
      z-index: 80;
      padding: 8px 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 10px;
      background: #2b1a11;
      border: 3px solid #1a0f08;
      box-shadow: inset 2px 2px 0 #7b4a28, inset -2px -2px 0 #120b06, 0 4px 16px rgba(0,0,0,0.6);
    }
    .badge-dev {
      background: #78350f;
      color: #fef08a;
      border: 1px solid #d97706;
      font-family: 'PressStart2P', monospace;
      font-size: 8px;
      padding: 3px 6px;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .controls-pill {
      font-size: 10px;
      color: #fef08a;
      background: rgba(26, 15, 8, 0.85);
      padding: 4px 8px;
      border: 1px solid #784323;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .btn-pixel {
      font-family: 'PressStart2P', monospace;
      font-size: 9px;
      padding: 4px 8px;
      background: #3d2315;
      color: #fdf6e2;
      border: 2px solid #1a0f08;
      box-shadow: inset 2px 2px 0 #7b4a28, inset -2px -2px 0 #120b06;
      cursor: pointer;
    }
    .btn-gold {
      background: #78350f;
      color: #fef08a;
      border-color: #d97706;
    }
    .dialogue-box {
      position: fixed;
      bottom: ${isMobile ? '72px' : '68px'};
      left: 14px;
      right: ${isMobile ? '14px' : 'auto'};
      max-width: ${isMobile ? 'none' : '580px'};
      z-index: 80;
      background: #23140c;
      border: 3px solid #120b06;
      box-shadow: inset 2px 2px 0 #6e3d1b, inset -2px -2px 0 #120b06, 0 8px 24px rgba(0,0,0,0.85);
      padding: 10px 14px;
      display: ${panelOnly ? 'none' : 'flex'};
      gap: 12px;
      align-items: center;
    }
    .portrait {
      width: 44px;
      height: 44px;
      background: #3d2315;
      border: 2px solid #d97706;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      flex-shrink: 0;
    }
    .hotbar {
      position: fixed;
      bottom: 12px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 6px;
      padding: 6px 10px;
      background: #2b1a11;
      border: 3px solid #1a0f08;
      box-shadow: inset 2px 2px 0 #7b4a28, inset -2px -2px 0 #120b06;
      z-index: 90;
    }
    .hotbar-slot {
      width: 44px;
      height: 44px;
      background: #1a0f08;
      border: 2px solid #452817;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      position: relative;
    }
    .hotbar-slot.active {
      border: 2px solid #facc15;
      background: #3d2315;
    }
    .slot-num {
      position: absolute;
      top: 2px;
      left: 3px;
      font-family: 'PressStart2P', monospace;
      font-size: 8px;
      color: #a38d7b;
    }
    .parchment-panel {
      position: fixed;
      top: ${panelOnly ? '60px' : isMobile ? '38vh' : '14px'};
      right: ${panelOnly ? '14px' : isMobile ? '8px' : '14px'};
      bottom: ${panelOnly ? '74px' : isMobile ? '68px' : '74px'};
      left: ${panelOnly ? '14px' : isMobile ? '8px' : 'auto'};
      width: ${panelOnly ? 'auto' : isMobile ? 'auto' : '480px'};
      max-width: ${panelOnly ? '900px' : 'none'};
      margin: ${panelOnly ? '0 auto' : '0'};
      background: #fdf6e2;
      border: 3px solid #452817;
      box-shadow: inset 2px 2px 0 #fff8db, inset -2px -2px 0 #bfa882, 0 8px 30px rgba(0,0,0,0.7);
      padding: 16px;
      color: #2b1a11;
      z-index: 60;
      overflow-y: auto;
    }
  </style>
</head>
<body>
  <!-- HUD -->
  <div class="hud">
    <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
      <div style="display:flex; align-items:center; gap:6px;">
        <span style="font-size:16px;">🌾</span>
        <span style="font-family:'PressStart2P', monospace; font-size:11px; color:#facc15;">FIH VALLEY</span>
      </div>
      <div class="badge-dev"><span>●</span> DEV SANDBOX</div>
      <div style="font-size:12px; color:#fdf6e2;">🌸 Wed. 5 • <span style="color:#facc15;">12:00 am</span></div>
      <div style="font-size:12px; color:#8fc45a; font-weight:700;">🪙 +₹1,580g</div>
      <div style="font-size:11px; color:#60a5fa;">☀️ Clear</div>
    </div>
    <div style="display:flex; align-items:center; gap:8px;">
      ${hudGuide ? `<div class="controls-pill">${hudGuide}</div>` : ''}
      ${!isOverworld ? '<button class="btn-pixel btn-gold">🗺️ Village Map (Esc)</button>' : ''}
      <button class="btn-pixel ${panelOnly ? 'btn-gold' : ''}">${panelOnly ? '🗺️ Show World' : '📜 Panel Only'}</button>
    </div>
  </div>

  <!-- Canvas -->
  ${!panelOnly ? `<canvas id="viewport" width="${isMobile ? 390 : 1280}" height="${isMobile ? (isOverworld ? 844 : 320) : 800}" style="display:block; width:100%; height:${isMobile ? (isOverworld ? '100vh' : '38vh') : '100vh'};"></canvas>` : ''}

  <!-- Side / Fullscreen Parchment Panel (if chapter is active) -->
  ${!isOverworld ? `
  <div class="parchment-panel">
    <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px dashed #452817; padding-bottom:8px; margin-bottom:12px;">
      <div>
        <div style="font-family:'PressStart2P', monospace; font-size:11px; color:#452817; font-weight:700;">THE LEDGER HUT</div>
        <div style="font-size:10px; color:#784323; margin-top:2px;">The Ledger Hut • Bram the Honest Factor</div>
      </div>
      <div style="display:flex; gap:6px;">
        <button class="btn-pixel ${panelOnly ? 'btn-gold' : ''}">${panelOnly ? '🗺️ Split World' : '📜 Panel Only'}</button>
        <button class="btn-pixel btn-gold">✕ Map (Esc)</button>
        <button class="btn-pixel">▼ Min</button>
      </div>
    </div>
    <div style="background:#fef3c7; border:1px solid #d97706; padding:8px; margin-bottom:12px; font-size:11px; color:#78350f;">
      🪙 Net Balance: <strong>+₹1,580g</strong> • 2 Active Tabs Recorded
    </div>
    <div style="display:flex; flex-direction:column; gap:8px;">
      <div style="background:#fff; border:1px solid #bfa882; padding:8px; display:flex; justify-content:space-between;">
        <div>
          <div style="font-weight:700; color:#166534;">Arjun (Owes Me)</div>
          <div style="font-size:10px; color:#6b7280;">Advance for mountain supplies</div>
        </div>
        <div style="font-weight:700; color:#166534;">+₹2,080g</div>
      </div>
      <div style="background:#fff; border:1px solid #bfa882; padding:8px; display:flex; justify-content:space-between;">
        <div>
          <div style="font-weight:700; color:#991b1b;">Rohan (I Owe)</div>
          <div style="font-size:10px; color:#6b7280;">Village tool repair tab</div>
        </div>
        <div style="font-weight:700; color:#991b1b;">-₹500g</div>
      </div>
    </div>
  </div>` : ''}

  <!-- Dialogue Box -->
  ${showDialogue ? `
  <div class="dialogue-box">
    <div class="portrait">${nearbyBuilding === 'The Notice Board' ? '📋' : nearbyBuilding === 'The Farmstead' ? '🧑‍🌾' : (!isOverworld || nearbyBuilding ? '🦡' : '🧑‍🌾')}</div>
    <div>
      <div style="font-family:'PressStart2P', monospace; font-size:9px; color:#facc15; margin-bottom:4px;">
        ${nearbyBuilding === 'The Notice Board' ? 'Marigold the Festival Herald (The Notice Board)' : nearbyBuilding === 'The Farmstead' ? 'Pip the Farmhand (The Farmstead)' : (!isOverworld || nearbyBuilding ? 'Bram the Honest Factor (The Ledger Hut)' : 'Pip the Farmhand (Fih Valley Overworld)')}
      </div>
      <div style="font-size:11px; line-height:1.4; color:#fdf6e2;">
        ${nearbyBuilding === 'The Notice Board'
          ? 'Good morning! The town board has fresh notices pinned with bright festival ribbons. What due dates are ripening? Press [E] to enter or [P] for Panel Only.'
          : nearbyBuilding === 'The Farmstead'
          ? 'The sun is shining over the crops. Check off your chores one by one and watch the farmstead flourish! Press [E] to enter or [P] for Panel Only.'
          : (!isOverworld || nearbyBuilding
            ? 'Clear accounts make steadfast friends! Settle your tabs before the fair. Press [E] to enter or [P] for Panel Only.'
            : 'Welcome to Fih Valley! Use WASD or Arrow Keys to walk. Click any house, press [E] to enter, or [P] for Panel Only view.')}
      </div>
    </div>
  </div>` : ''}

  <!-- Hotbar -->
  <div class="hotbar">
    <div class="hotbar-slot ${isOverworld ? 'active' : ''}"><span class="slot-num" style="color:#60a5fa;">M</span><span style="font-size:18px;">🗺️</span></div>
    <div class="hotbar-slot"><span class="slot-num">1</span><span style="font-size:18px;">🌾</span></div>
    <div class="hotbar-slot"><span class="slot-num">2</span><span style="font-size:18px;">🔔</span></div>
    <div class="hotbar-slot ${activeTab === 'debts' ? 'active' : ''}"><span class="slot-num">3</span><span style="font-size:18px;">🪙</span></div>
    <div class="hotbar-slot"><span class="slot-num">4</span><span style="font-size:18px;">📌</span></div>
    <div class="hotbar-slot"><span class="slot-num">5</span><span style="font-size:18px;">🌸</span></div>
    <div class="hotbar-slot"><span class="slot-num">6</span><span style="font-size:18px;">🎬</span></div>
    <div class="hotbar-slot"><span class="slot-num">7</span><span style="font-size:18px;">📜</span></div>
    <div class="hotbar-slot"><span class="slot-num">8</span><span style="font-size:18px;">🔧</span></div>
  </div>

  <script>
    const canvas = document.getElementById('viewport');
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = false;

      const tilesetImg = new Image();
      const pipImg = new Image();
      const bramImg = new Image();
      const farmhouseImg = new Image();
      const noticeBoardImg = new Image();

      tilesetImg.src = 'data:image/png;base64,${tilesetBase64}';
      pipImg.src = 'data:image/png;base64,${pipBase64}';
      bramImg.src = 'data:image/png;base64,${bramBase64}';
      farmhouseImg.src = 'data:image/png;base64,${farmhouseBase64}';
      noticeBoardImg.src = 'data:image/png;base64,${noticeBoardBase64}';

      let loaded = 0;
      function checkLoaded() {
        loaded++;
        if (loaded === 5) drawWorld();
      }
      tilesetImg.onload = checkLoaded;
      pipImg.onload = checkLoaded;
      bramImg.onload = checkLoaded;
      farmhouseImg.onload = checkLoaded;
      noticeBoardImg.onload = checkLoaded;

      const scale = ${isMobile ? 3 : 4};
      const TILE_SIZE = 16;
      const MAP_W = 38;
      const MAP_H = 26;

      const BUILDINGS = [
        { id: 'todos', label: '🌾 Daily Quests', bx: 8*16, by: 2*16-6 },
        { id: 'reminders', label: '🔔 Belfry Alerts', bx: 18*16, by: 2*16-6 },
        { id: 'debts', label: '🪙 Gold Ledger', bx: 26*16, by: 7*16-6 },
        { id: 'deadlines', label: '📋 Town Deadlines', bx: 18*16, by: 13*16-12 },
        { id: 'dates', label: '🎪 Festival Grounds', bx: 28*16, by: 16*16-6 },
        { id: 'watchlist', label: '🎬 Moonlight Cinema', bx: 6*16, by: 17*16-6 },
        { id: 'audit', label: '📜 Archive Cellar', bx: 28*16, by: 2*16-6 },
        { id: 'settings', label: '🛠️ Toolshed Workshop', bx: 4*16, by: 2*16-6 },
      ];

      function drawWorld() {
        const viewW = Math.floor(canvas.width / scale);
        const viewH = Math.floor(canvas.height / scale);

        const camX = ${isOverworld ? pipPos.x : 26 * 16};
        const camY = ${isOverworld ? pipPos.y : 11 * 16};

        ctx.save();
        ctx.scale(scale, scale);

        const offsetX = Math.floor(viewW / 2 - camX);
        const offsetY = Math.floor(viewH / 2 - camY);
        ctx.translate(offsetX, offsetY);

        function isVillageCobble(tx, ty) {
          if (tx >= 16 && tx <= 20 && ty >= 11 && ty <= 13) return true;
          if (tx >= 24 && tx <= 28 && ty >= 11 && ty <= 13) return true;
          if (tx >= 17 && tx <= 18 && ty >= 4 && ty <= 5) return true;
          if (tx >= 27 && tx <= 28 && ty >= 3 && ty <= 4) return true;
          if (tx >= 17 && tx <= 18 && ty >= 15 && ty <= 16) return true;
          if (tx >= 7 && tx <= 9 && ty >= 3 && ty <= 4) return true;
          if (tx >= 7 && tx <= 9 && ty >= 6 && ty <= 7) return true;
          if (tx >= 5 && tx <= 7 && ty >= 19 && ty <= 20) return true;
          if (tx >= 27 && tx <= 29 && ty >= 19 && ty <= 20) return true;
          return false;
        }

        function isVillagePath(tx, ty) {
          if (ty >= 12 && ty <= 13 && tx >= 6 && tx <= 28) return true;
          if (tx >= 17 && tx <= 18 && ty >= 5 && ty <= 11) return true;
          if (tx >= 17 && tx <= 18 && ty >= 13 && ty <= 20) return true;
          if (tx >= 8 && tx <= 9 && ty >= 7 && ty <= 12) return true;
          if (tx >= 6 && tx <= 7 && ty >= 12 && ty <= 20) return true;
          if (tx >= 27 && tx <= 28 && ty >= 4 && ty <= 12) return true;
          if (tx >= 27 && tx <= 28 && ty >= 12 && ty <= 20) return true;
          return false;
        }

        function isGround(tx, ty) {
          return isVillagePath(tx, ty) || isVillageCobble(tx, ty);
        }

        function getPathTileInfo(tx, ty) {
          const isCobble = isVillageCobble(tx, ty);
          const isPath = isVillagePath(tx, ty);
          if (!isCobble && !isPath) return null;
          if (isCobble) {
            const upGrass = !isGround(tx, ty - 1);
            const downGrass = !isGround(tx, ty + 1);
            if (upGrass && !downGrass) return { col: 6, row: 6 };
            if (downGrass && !upGrass) return { col: 7, row: 6 };
            return { col: 4, row: 1 };
          }
          const upGrass = !isGround(tx, ty - 1);
          const downGrass = !isGround(tx, ty + 1);
          const leftGrass = !isGround(tx - 1, ty);
          const rightGrass = !isGround(tx + 1, ty);
          if (upGrass && leftGrass) return { col: 2, row: 6 };
          if (upGrass && rightGrass) return { col: 3, row: 6 };
          if (downGrass && leftGrass) return { col: 4, row: 6 };
          if (downGrass && rightGrass) return { col: 5, row: 6 };
          if (upGrass) return { col: 5, row: 0 };
          if (downGrass) return { col: 6, row: 0 };
          if (leftGrass) return { col: 0, row: 6 };
          if (rightGrass) return { col: 1, row: 6 };
          return { col: 4, row: 0 };
        }

        // Layer 1: Ground
        for (let ty = 0; ty < MAP_H; ty++) {
          for (let tx = 0; tx < MAP_W; tx++) {
            const isPond = tx >= 12 && tx <= 15 && ty >= 16 && ty <= 18;
            if (isPond) {
              ctx.drawImage(tilesetImg, 0, 16, 16, 16, tx * 16, ty * 16, 16, 16);
              continue;
            }
            const isGarden = tx >= 5 && tx <= 7 && ty >= 9 && ty <= 10;
            if (isGarden) {
              ctx.drawImage(tilesetImg, 7 * 16, 0, 16, 16, tx * 16, ty * 16, 16, 16);
              continue;
            }
            const pTile = getPathTileInfo(tx, ty);
            if (pTile) {
              ctx.drawImage(tilesetImg, pTile.col * 16, pTile.row * 16, 16, 16, tx * 16, ty * 16, 16, 16);
              continue;
            }
            let tileCol = (tx * 7 + ty * 13) % 4;
            ctx.drawImage(tilesetImg, tileCol * 16, 0, 16, 16, tx * 16, ty * 16, 16, 16);
          }
        }

        // Layer 2: Fences
        for (let fx = 4; fx <= 7; fx++) {
          ctx.drawImage(tilesetImg, 2 * 16, 16, 16, 16, fx * 16, 8 * 16, 16, 16);
        }
        ctx.drawImage(tilesetImg, 3 * 16, 16, 16, 16, 10 * 16, 8 * 16, 16, 16);
        for (let fx = 20; fx <= 23; fx++) {
          ctx.drawImage(tilesetImg, 2 * 16, 16, 16, 16, fx * 16, 14 * 16, 16, 16);
        }

        const renderables = [];

        // Farmstead (New Custom House)
        renderables.push({
          y: 7 * 16 + 2,
          render: () => {
            const hW = 76, hH = 79;
            const hX = 5.5 * 16 + 4, hY = 7 * 16 - hH + 4;
            ctx.drawImage(farmhouseImg, hX, hY, hW, hH);
            ctx.drawImage(tilesetImg, 2 * 16, 64, 16, 16, 5 * 16, 9 * 16, 16, 16);
            ctx.drawImage(tilesetImg, 2 * 16, 64, 16, 16, 6 * 16, 9 * 16, 16, 16);
            ctx.drawImage(tilesetImg, 3 * 16, 64, 16, 16, 7 * 16, 10 * 16, 16, 16);
            ctx.drawImage(tilesetImg, 7 * 16, 80, 16, 16, 9 * 16, 12 * 16, 16, 16);
          }
        });

        // Ledger Hut
        renderables.push({
          y: 10 * 16,
          render: () => {
            const hx = 24 * 16, hy = 7 * 16;
            for (let rx = 0; rx < 5; rx++) {
              ctx.drawImage(tilesetImg, 0, 32, 16, 16, hx + rx * 16, hy, 16, 16);
              ctx.drawImage(tilesetImg, 0, 32, 16, 16, hx + rx * 16, hy + 16, 16, 16);
              const wallTile = (rx === 3 ? 3 : rx === 0 || rx === 4 ? 2 : 1);
              ctx.drawImage(tilesetImg, wallTile * 16, 32, 16, 16, hx + rx * 16, hy + 32, 16, 16);
            }
            ctx.drawImage(tilesetImg, 4 * 16, 32, 16, 16, hx + 4 * 16, hy + 32, 16, 16);
          }
        });

        // Bram
        renderables.push({
          y: 11 * 16 + 2,
          render: () => {
            ctx.drawImage(bramImg, 0, 0, 24, 32, 26 * 16 - 4, 10 * 16, 24, 32);
          }
        });

        // Ledger Counter
        renderables.push({
          y: 11 * 16 + 8,
          render: () => {
            const cx = 25 * 16, cy = 11 * 16;
            ctx.drawImage(tilesetImg, 5 * 16, 16, 16, 16, cx, cy, 16, 16);
            ctx.drawImage(tilesetImg, 5 * 16, 16, 16, 16, cx + 16, cy, 16, 16);
            ctx.drawImage(tilesetImg, 5 * 16, 16, 16, 16, cx + 32, cy, 16, 16);
            ctx.drawImage(tilesetImg, 6 * 16, 16, 16, 16, cx + 16, cy, 16, 16);
            ctx.drawImage(tilesetImg, 7 * 16, 16, 16, 16, cx + 2, cy - 2, 16, 16);
            ctx.drawImage(tilesetImg, 7 * 16, 16, 16, 16, cx + 8, cy - 2, 16, 16);
          }
        });

        // Bell Tower
        renderables.push({
          y: 7 * 16,
          render: () => {
            const tx = 17 * 16, ty = 2 * 16;
            ctx.drawImage(tilesetImg, 0, 48, 16, 16, tx, ty, 16, 16);
            ctx.drawImage(tilesetImg, 0, 48, 16, 16, tx + 16, ty, 16, 16);
            ctx.drawImage(tilesetImg, 16, 48, 16, 16, tx, ty + 16, 16, 16);
            ctx.drawImage(tilesetImg, 2 * 16, 48, 16, 16, tx + 16, ty + 16, 16, 16);
            ctx.drawImage(tilesetImg, 5 * 16, 32, 16, 16, tx, ty + 32, 16, 16);
            ctx.drawImage(tilesetImg, 5 * 16, 32, 16, 16, tx + 16, ty + 32, 16, 16);
          }
        });

        // Notice Board (New Custom Notice Board)
        renderables.push({
          y: 15 * 16 + 6,
          render: () => {
            const bW = 52, bH = 46;
            const bX = 18 * 16 - bW / 2;
            const bY = 15 * 16 - bH + 6;
            ctx.drawImage(noticeBoardImg, bX, bY, bW, bH);
          }
        });

        // Fountain
        renderables.push({
          y: 13 * 16,
          render: () => {
            ctx.drawImage(tilesetImg, 5 * 16, 64, 16, 16, 18 * 16, 11 * 16, 16, 16);
          }
        });

        // Pip
        renderables.push({
          y: ${pipPos.y} + 30,
          render: () => {
            ctx.drawImage(pipImg, 0, ${pipPos.dir} * 32, 16, 32, ${pipPos.x}, ${pipPos.y}, 16, 32);
          }
        });

        renderables.sort((a, b) => a.y - b.y);
        renderables.forEach(r => r.render());

        // Floating signposts
        BUILDINGS.forEach(b => {
          ctx.save();
          ctx.font = '7px monospace';
          const tw = ctx.measureText(b.label).width;
          const pad = 4;
          const bw = tw + pad * 2;
          const bh = 10;
          const bx = Math.floor(b.bx - bw / 2);
          const by = Math.floor(b.by);

          ctx.fillStyle = 'rgba(28, 17, 10, 0.9)';
          ctx.fillRect(bx, by, bw, bh);
          ctx.strokeStyle = '#d97706';
          ctx.lineWidth = 1;
          ctx.strokeRect(bx, by, bw, bh);

          ctx.fillStyle = '#fef08a';
          ctx.fillText(b.label, bx + pad, by + 7);
          ctx.restore();
        });

        // Proximity bubble
        ${nearbyBuilding ? `
        ctx.save();
        ctx.font = 'bold 7px monospace';
        const promptText = '[E] Enter  •  [P] Panel Only';
        const pw = ctx.measureText(promptText).width;
        const bw = pw + 8;
        const bh = 12;
        const bx = Math.floor(${pipPos.x} + 8 - bw / 2);
        const by = Math.floor(${pipPos.y} - 14);

        ctx.fillStyle = '#fef3c7';
        ctx.fillRect(bx, by, bw, bh);
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 1;
        ctx.strokeRect(bx, by, bw, bh);

        ctx.fillStyle = '#78350f';
        ctx.fillText(promptText, bx + 4, by + 8);
        ctx.restore();
        ` : ''}

        ctx.restore();
      }
    }
  </script>
</body>
</html>`;
}

// Server to serve html and woff2 fonts
let currentHTML = '';
const server = http.createServer((req, res) => {
  if (req.url.startsWith('/fonts/')) {
    const fontPath = path.join('public', req.url);
    if (fs.existsSync(fontPath)) {
      res.writeHead(200, { 'Content-Type': 'font/woff2' });
      res.end(fs.readFileSync(fontPath));
      return;
    }
  }
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(currentHTML);
});

server.listen(PORT, async () => {
  console.log(`Test server running on http://localhost:${PORT}`);
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();


  // 0a. Initial Login/Refresh: Shows Welcome Dialogue & Controls Pill
  currentHTML = buildHTML({ activeTab: null, hasInteracted: false, pipPos: { x: 18 * 16, y: 13 * 16, dir: 0 }, nearbyBuilding: null, isMobile: false, panelOnly: false });
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(OUT_DIR, 'overworld-welcome-desktop.png') });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'overworld-welcome-desktop.png') });
  console.log('✓ Captured overworld-welcome-desktop.png (initial login view)');

  // 0b. Open World Roaming (interacted, walking path): Welcome and controls hidden, clean view
  currentHTML = buildHTML({ activeTab: null, hasInteracted: true, pipPos: { x: 21 * 16, y: 12 * 16, dir: 2 }, nearbyBuilding: null, isMobile: false, panelOnly: false });
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(OUT_DIR, 'overworld-map-desktop.png') });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'overworld-map-desktop.png') });
  console.log('✓ Captured updated overworld-map-desktop.png (roaming unobstructed)');

  // 0c. Default Overworld Map Mobile
  currentHTML = buildHTML({ activeTab: null, hasInteracted: true, pipPos: { x: 18 * 16, y: 13 * 16, dir: 0 }, nearbyBuilding: null, isMobile: true, panelOnly: false });
  await page.setViewport({ width: 390, height: 844 });
  await page.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(OUT_DIR, 'overworld-map-mobile.png') });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'overworld-map-mobile.png') });
  console.log('✓ Captured updated overworld-map-mobile.png');

  // 0d. Pip outside the new custom Farmstead House
  currentHTML = buildHTML({ activeTab: null, hasInteracted: true, pipPos: { x: 8 * 16, y: 7 * 16 + 4, dir: 3 }, nearbyBuilding: 'The Farmstead', isMobile: false, panelOnly: false });
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(OUT_DIR, 'overworld-farmstead-custom-house-desktop.png') });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'overworld-farmstead-custom-house-desktop.png') });
  console.log('✓ Captured overworld-farmstead-custom-house-desktop.png');

  // 0e. Pip outside the new custom Notice Board
  currentHTML = buildHTML({ activeTab: null, hasInteracted: true, pipPos: { x: 18 * 16, y: 16 * 16, dir: 3 }, nearbyBuilding: 'The Notice Board', isMobile: false, panelOnly: false });
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(OUT_DIR, 'overworld-notice-board-custom-desktop.png') });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'overworld-notice-board-custom-desktop.png') });
  console.log('✓ Captured overworld-notice-board-custom-desktop.png');

  // 1. Proximity prompt with [E] Enter & [P] Panel Only (interacting with Ledger Hut)
  currentHTML = buildHTML({ activeTab: null, hasInteracted: true, pipPos: { x: 26 * 16, y: 11 * 16 + 8, dir: 3 }, nearbyBuilding: 'The Ledger Hut', isMobile: false, panelOnly: false });
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(OUT_DIR, 'overworld-walk-proximity-desktop.png') });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'overworld-walk-proximity-desktop.png') });
  console.log('✓ Captured updated overworld-walk-proximity-desktop.png');

  // 2. Entered Ledger Hut in Split World View (with Panel Only toggle in header)
  currentHTML = buildHTML({ activeTab: 'debts', hasInteracted: true, pipPos: { x: 24 * 16, y: 11 * 16 + 8, dir: 2 }, nearbyBuilding: null, isMobile: false, panelOnly: false });
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(OUT_DIR, 'overworld-entered-ledger-desktop.png') });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'overworld-entered-ledger-desktop.png') });
  console.log('✓ Captured updated overworld-entered-ledger-desktop.png');

  // 3. Entered in Fullscreen "Panel Only" View
  currentHTML = buildHTML({ activeTab: 'debts', hasInteracted: true, pipPos: { x: 24 * 16, y: 11 * 16 + 8, dir: 2 }, nearbyBuilding: null, isMobile: false, panelOnly: true });
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(OUT_DIR, 'overworld-panel-only-desktop.png') });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'overworld-panel-only-desktop.png') });
  console.log('✓ Captured overworld-panel-only-desktop.png');

  await browser.close();
  server.close();
  console.log('All captures complete!');
  process.exit(0);
});
