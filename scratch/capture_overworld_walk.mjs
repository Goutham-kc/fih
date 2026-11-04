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
const bankBase64 = fs.readFileSync('public/assets/buildings/bank.png').toString('base64');
const bellTowerBase64 = fs.readFileSync('public/assets/buildings/bell_tower.png').toString('base64');
const festivalGroundsBase64 = fs.readFileSync('public/assets/buildings/festival_grounds.png').toString('base64');
const moonlightCinemaBase64 = fs.readFileSync('public/assets/buildings/moonlight_cinema.png').toString('base64');

function buildHTML({ activeTab = null, hasInteracted = false, pipPos = { x: 18 * 16, y: 13 * 16, dir: 0 }, nearbyBuilding = null, isMobile = false, panelOnly = false }) {
  const currentTab = isMobile ? (activeTab || 'todos') : activeTab;
  const isOverworld = !currentTab;
  const effectivePanelOnly = isMobile ? true : panelOnly;
  const showDialogue = !effectivePanelOnly && (currentTab !== null || (!hasInteracted && isOverworld) || nearbyBuilding !== null);
  const hudGuide = activeTab ? null : (!hasInteracted ? '🎮 WASD / Arrows to Walk • [E] Enter • [P] Panel Only' : (nearbyBuilding ? '🚪 [E] Enter • [P] Panel Only' : null));
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Fih Valley ${isMobile ? 'Mobile Panel' : 'Overworld'}</title>
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
      top: ${isMobile ? '6px' : '12px'};
      left: ${isMobile ? '6px' : '14px'};
      right: ${isMobile ? '6px' : (!isOverworld && !panelOnly ? '510px' : '14px')};
      z-index: 80;
      padding: ${isMobile ? '6px 8px' : '8px 12px'};
      display: flex;
      align-items: center;
      justifyContent: space-between;
      flex-wrap: wrap;
      gap: ${isMobile ? '6px' : '10px'};
      background: #2b1a11;
      border: ${isMobile ? '2px' : '3px'} solid #1a0f08;
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
      bottom: 68px;
      left: 14px;
      max-width: 580px;
      z-index: 80;
      background: #23140c;
      border: 3px solid #120b06;
      box-shadow: inset 2px 2px 0 #6e3d1b, inset -2px -2px 0 #120b06, 0 8px 24px rgba(0,0,0,0.85);
      padding: 10px 14px;
      display: ${effectivePanelOnly ? 'none' : 'flex'};
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
      bottom: ${isMobile ? '8px' : '12px'};
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: ${isMobile ? '4px' : '6px'};
      padding: ${isMobile ? '4px 6px' : '6px 10px'};
      background: #2b1a11;
      border: ${isMobile ? '2px' : '3px'} solid #1a0f08;
      box-shadow: inset 2px 2px 0 #7b4a28, inset -2px -2px 0 #120b06;
      z-index: 90;
      max-width: ${isMobile ? 'calc(100vw - 12px)' : 'none'};
      overflow-x: ${isMobile ? 'auto' : 'visible'};
    }
    .hotbar-slot {
      width: ${isMobile ? '38px' : '44px'};
      height: ${isMobile ? '38px' : '44px'};
      min-width: ${isMobile ? '38px' : '44px'};
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
      font-size: ${isMobile ? '7px' : '8px'};
      color: #a38d7b;
    }
    .parchment-panel {
      position: fixed;
      top: ${isMobile ? '52px' : (effectivePanelOnly ? '60px' : '14px')};
      right: ${isMobile ? '6px' : (effectivePanelOnly ? '14px' : '14px')};
      bottom: ${isMobile ? '64px' : (effectivePanelOnly ? '74px' : '74px')};
      left: ${isMobile ? '6px' : (effectivePanelOnly ? '14px' : 'auto')};
      width: ${isMobile ? 'auto' : (effectivePanelOnly ? 'auto' : '480px')};
      max-width: ${effectivePanelOnly && !isMobile ? '900px' : 'none'};
      margin: ${effectivePanelOnly && !isMobile ? '0 auto' : '0'};
      background: #fdf6e2;
      border: 3px solid #452817;
      box-shadow: inset 2px 2px 0 #fff8db, inset -2px -2px 0 #bfa882, 0 8px 30px rgba(0,0,0,0.7);
      padding: ${isMobile ? '12px 10px' : '16px'};
      color: #2b1a11;
      z-index: 60;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
    }
  </style>
</head>
<body>
  <!-- HUD -->
  <div class="hud">
    <div style="display:flex; align-items:center; gap:${isMobile ? '6px' : '10px'}; flex-wrap:wrap;">
      <div style="display:flex; align-items:center; gap:6px;">
        <span style="font-size:${isMobile ? '14px' : '16px'};">🌾</span>
        <span style="font-family:'PressStart2P', monospace; font-size:${isMobile ? '10px' : '11px'}; color:#facc15;">FIH VALLEY</span>
      </div>
      <div class="badge-dev"><span>●</span> DEV SANDBOX</div>
      <div style="font-size:${isMobile ? '11px' : '12px'}; color:#fdf6e2;">🌸 Wed. 5 • <span style="color:#facc15;">12:00 am</span></div>
      <div style="font-size:${isMobile ? '11px' : '12px'}; color:#8fc45a; font-weight:700;">🪙 +₹1,580g</div>
      ${!isMobile ? '<div style="font-size:11px; color:#60a5fa;">☀️ Clear</div>' : ''}
    </div>
    ${!isMobile ? `
    <div style="display:flex; align-items:center; gap:8px;">
      ${hudGuide ? `<div class="controls-pill">${hudGuide}</div>` : ''}
      ${!isOverworld ? '<button class="btn-pixel btn-gold">🗺️ Village Map (Esc)</button>' : ''}
      <button class="btn-pixel ${effectivePanelOnly ? 'btn-gold' : ''}">${effectivePanelOnly ? '🗺️ Show World' : '📜 Panel Only'}</button>
    </div>` : ''}
  </div>

  <!-- Canvas (Desktop Only) -->
  ${!isMobile && !effectivePanelOnly ? `<canvas id="viewport" width="1280" height="800" style="display:block; width:100%; height:100vh;"></canvas>` : ''}

  <!-- Parchment Panel -->
  ${!isOverworld ? `
  <div class="parchment-panel">
    <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px dashed #452817; padding-bottom:8px; margin-bottom:10px;">
      <div>
        <div style="font-family:'PressStart2P', monospace; font-size:${isMobile ? '10px' : '11px'}; color:#452817; font-weight:700;">
          ${currentTab === 'todos' ? 'THE FARMSTEAD' : 'THE LEDGER BANK'}
        </div>
        <div style="font-size:${isMobile ? '9px' : '10px'}; color:#784323; margin-top:2px;">
          ${currentTab === 'todos' ? 'Daily Quests • Pip the Farmhand' : 'Gold Ledger • Bram the Badger Factor'}
        </div>
      </div>
      ${!isMobile ? `
      <div style="display:flex; gap:6px;">
        <button class="btn-pixel ${effectivePanelOnly ? 'btn-gold' : ''}">${effectivePanelOnly ? '🗺️ Split World' : '📜 Panel Only'}</button>
        <button class="btn-pixel btn-gold">✕ Map (Esc)</button>
        <button class="btn-pixel">▼ Min</button>
      </div>` : ''}
    </div>

    <!-- Mobile Resident Greeting Quote Card -->
    ${isMobile ? `
    <div style="display:flex; align-items:center; gap:8px; background:rgba(235, 215, 178, 0.65); border:1px solid #784323; padding:6px 8px; border-radius:3px; margin-bottom:10px;">
      <span style="font-size:16px;">${currentTab === 'todos' ? '🧑‍🌾' : '🦡'}</span>
      <div style="font-size:10px; color:#3d2315; font-style:italic; line-height:1.3;">
        <strong style="font-style:normal; color:#452817;">${currentTab === 'todos' ? 'Pip the Farmhand' : 'Bram the Factor'}: </strong>
        ${currentTab === 'todos' ? 'Check off your chores one by one and watch the farmstead flourish!' : 'Clear accounts make steadfast friends! Settle your tabs before the fair.'}
      </div>
    </div>` : ''}

    ${currentTab === 'todos' ? `
    <div style="display:flex; flex-direction:column; gap:8px;">
      <div style="background:#fff; border:1px solid #bfa882; padding:10px; display:flex; align-items:center; justify-content:space-between;">
        <div style="display:flex; align-items:center; gap:8px;">
          <input type="checkbox" style="width:16px; height:16px;" />
          <div>
            <div style="font-weight:700; color:#452817; font-size:12px;">Harvest seasonal wheat crops</div>
            <div style="font-size:10px; color:#784323;">Due today • High Priority</div>
          </div>
        </div>
        <span style="font-size:10px; background:#dcfce7; color:#166534; padding:2px 6px; border-radius:3px;">Farm</span>
      </div>
      <div style="background:#fff; border:1px solid #bfa882; padding:10px; display:flex; align-items:center; justify-content:space-between;">
        <div style="display:flex; align-items:center; gap:8px;">
          <input type="checkbox" style="width:16px; height:16px;" />
          <div>
            <div style="font-weight:700; color:#452817; font-size:12px;">Water flowerbeds by the notice board</div>
            <div style="font-size:10px; color:#784323;">Morning routine</div>
          </div>
        </div>
        <span style="font-size:10px; background:#fef3c7; color:#854d0e; padding:2px 6px; border-radius:3px;">Village</span>
      </div>
    </div>` : `
    <div style="background:#fef3c7; border:1px solid #d97706; padding:8px; margin-bottom:10px; font-size:11px; color:#78350f;">
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
    </div>`}
  </div>` : ''}

  <!-- Hotbar -->
  <div class="hotbar">
    ${!isMobile ? `<div class="hotbar-slot ${isOverworld ? 'active' : ''}"><span class="slot-num" style="color:#60a5fa;">M</span><span style="font-size:18px;">🗺️</span></div>` : ''}
    <div class="hotbar-slot ${currentTab === 'todos' ? 'active' : ''}"><span class="slot-num">1</span><span style="font-size:${isMobile ? '16px' : '18px'};">🌾</span></div>
    <div class="hotbar-slot ${currentTab === 'reminders' ? 'active' : ''}"><span class="slot-num">2</span><span style="font-size:${isMobile ? '16px' : '18px'};">🔔</span></div>
    <div class="hotbar-slot ${currentTab === 'debts' ? 'active' : ''}"><span class="slot-num">3</span><span style="font-size:${isMobile ? '16px' : '18px'};">🪙</span></div>
    <div class="hotbar-slot ${currentTab === 'deadlines' ? 'active' : ''}"><span class="slot-num">4</span><span style="font-size:${isMobile ? '16px' : '18px'};">📌</span></div>
    <div class="hotbar-slot ${currentTab === 'dates' ? 'active' : ''}"><span class="slot-num">5</span><span style="font-size:${isMobile ? '16px' : '18px'};">🌸</span></div>
    <div class="hotbar-slot ${currentTab === 'watchlist' ? 'active' : ''}"><span class="slot-num">6</span><span style="font-size:${isMobile ? '16px' : '18px'};">🎬</span></div>
    <div class="hotbar-slot ${currentTab === 'audit' ? 'active' : ''}"><span class="slot-num">7</span><span style="font-size:${isMobile ? '16px' : '18px'};">📜</span></div>
    <div class="hotbar-slot ${currentTab === 'settings' ? 'active' : ''}"><span class="slot-num">8</span><span style="font-size:${isMobile ? '16px' : '18px'};">🔧</span></div>
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
      const bankImg = new Image();
      const bellTowerImg = new Image();
      const festivalGroundsImg = new Image();
      const moonlightCinemaImg = new Image();

      tilesetImg.src = 'data:image/png;base64,${tilesetBase64}';
      pipImg.src = 'data:image/png;base64,${pipBase64}';
      bramImg.src = 'data:image/png;base64,${bramBase64}';
      farmhouseImg.src = 'data:image/png;base64,${farmhouseBase64}';
      noticeBoardImg.src = 'data:image/png;base64,${noticeBoardBase64}';
      bankImg.src = 'data:image/png;base64,${bankBase64}';
      bellTowerImg.src = 'data:image/png;base64,${bellTowerBase64}';
      festivalGroundsImg.src = 'data:image/png;base64,${festivalGroundsBase64}';
      moonlightCinemaImg.src = 'data:image/png;base64,${moonlightCinemaBase64}';

      let loaded = 0;
      function checkLoaded() {
        loaded++;
        if (loaded === 9) drawWorld();
      }
      tilesetImg.onload = checkLoaded;
      pipImg.onload = checkLoaded;
      bramImg.onload = checkLoaded;
      farmhouseImg.onload = checkLoaded;
      noticeBoardImg.onload = checkLoaded;
      bankImg.onload = checkLoaded;
      bellTowerImg.onload = checkLoaded;
      festivalGroundsImg.onload = checkLoaded;
      moonlightCinemaImg.onload = checkLoaded;

      const scale = ${isMobile ? 3 : 4};
      const TILE_SIZE = 16;
      const MAP_W = 64;
      const MAP_H = 64;

      const BUILDINGS = [
        { id: 'todos', label: '🌾 Daily Quests', bx: 14*16, by: 9*16-6 },
        { id: 'reminders', label: '🔔 Belfry Alerts', bx: 32*16, by: 7*16-6 },
        { id: 'debts', label: '🪙 Gold Ledger', bx: 50*16, by: 9*16-6 },
        { id: 'deadlines', label: '📋 Town Deadlines', bx: 32*16, by: 32*16-6 },
        { id: 'dates', label: '🎪 Festival Grounds', bx: 16*16, by: 44*16-6 },
        { id: 'watchlist', label: '🎬 Moonlight Cinema', bx: 48*16, by: 44*16-6 },
        { id: 'audit', label: '📜 Archive Cellar', bx: 12*16, by: 29*16-6 },
        { id: 'settings', label: '🛠️ Toolshed Workshop', bx: 16*16, by: 20*16-6 },
      ];

      function drawWorld() {
        const viewW = Math.floor(canvas.width / scale);
        const viewH = Math.floor(canvas.height / scale);

        const camX = ${isOverworld ? pipPos.x : 50 * 16};
        const camY = ${isOverworld ? pipPos.y : 14 * 16};

        ctx.save();
        ctx.scale(scale, scale);

        const offsetX = Math.floor(viewW / 2 - camX);
        const offsetY = Math.floor(viewH / 2 - camY);
        ctx.translate(offsetX, offsetY);

        function isVillageCobble(tx, ty) {
          if (tx >= 28 && tx <= 36 && ty >= 28 && ty <= 36) return true;
          if (tx >= 48 && tx <= 52 && ty >= 13 && ty <= 15) return true;
          if (tx >= 30 && tx <= 34 && ty >= 13 && ty <= 15) return true;
          if (tx >= 13 && tx <= 15 && ty >= 13 && ty <= 15) return true;
          if (tx >= 11 && tx <= 13 && ty >= 32 && ty <= 34) return true;
          if (tx >= 15 && tx <= 17 && ty >= 22 && ty <= 24) return true;
          if (tx >= 31 && tx <= 33 && ty >= 35 && ty <= 37) return true;
          if (tx >= 15 && tx <= 17 && ty >= 50 && ty <= 52) return true;
          if (tx >= 47 && tx <= 49 && ty >= 50 && ty <= 52) return true;
          if (tx === 32 && ty >= 40 && ty <= 43) return true;
          return false;
        }

        function isVillagePath(tx, ty) {
          if (tx >= 31 && tx <= 32 && ty >= 14 && ty <= 28) return true;
          if (tx >= 12 && tx <= 28 && ty >= 32 && ty <= 33) return true;
          if (tx >= 31 && tx <= 32 && ty >= 36 && ty <= 40) return true;
          if (ty >= 20 && ty <= 21 && tx >= 14 && tx <= 28) return true;
          if (tx >= 27 && tx <= 28 && ty >= 21 && ty <= 28) return true;
          if (tx >= 14 && tx <= 15 && ty >= 14 && ty <= 21) return true;
          if (ty >= 20 && ty <= 21 && tx >= 36 && tx <= 50) return true;
          if (tx >= 36 && tx <= 37 && ty >= 21 && ty <= 28) return true;
          if (tx >= 49 && tx <= 50 && ty >= 14 && ty <= 21) return true;
          if (tx >= 27 && tx <= 28 && ty >= 36 && ty <= 44) return true;
          if (ty >= 44 && ty <= 45 && tx >= 16 && tx <= 28) return true;
          if (tx >= 16 && tx <= 17 && ty >= 45 && ty <= 51) return true;
          if (tx >= 36 && tx <= 37 && ty >= 36 && ty <= 44) return true;
          if (ty >= 44 && ty <= 45 && tx >= 36 && tx <= 48) return true;
          if (tx >= 47 && tx <= 48 && ty >= 45 && ty <= 51) return true;
          if (tx >= 15 && tx <= 16 && ty >= 21 && ty <= 24) return true;
          if (tx >= 47 && tx <= 48 && ty >= 21 && ty <= 25) return true;
          if (tx >= 31 && tx <= 32 && ty >= 43 && ty <= 48) return true;
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
            const isPondWater = tx >= 30 && tx <= 34 && ty >= 40 && ty <= 43 && tx !== 32;
            if (isPondWater) {
              ctx.drawImage(tilesetImg, 0, 16, 16, 16, tx * 16, ty * 16, 16, 16);
              continue;
            }
            const isGarden = tx >= 11 && tx <= 13 && ty >= 15 && ty <= 16;
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
        for (let fx = 10; fx <= 13; fx++) {
          ctx.drawImage(tilesetImg, 2 * 16, 16, 16, 16, fx * 16, 16 * 16, 16, 16);
        }
        for (let fx = 16; fx <= 17; fx++) {
          ctx.drawImage(tilesetImg, 2 * 16, 16, 16, 16, fx * 16, 16 * 16, 16, 16);
        }
        for (let by = 40; by <= 43; by++) {
          ctx.drawImage(tilesetImg, 2 * 16, 16, 16, 16, 31 * 16, by * 16, 16, 16);
          ctx.drawImage(tilesetImg, 2 * 16, 16, 16, 16, 33 * 16, by * 16, 16, 16);
        }

        const renderables = [];

        // Farmstead (New Custom House)
        renderables.push({
          y: 14 * 16 + 2,
          render: () => {
            const hW = 76, hH = 79;
            const hX = 14 * 16 - hW / 2, hY = 14 * 16 - hH + 4;
            ctx.drawImage(farmhouseImg, hX, hY, hW, hH);
            ctx.drawImage(tilesetImg, 2 * 16, 64, 16, 16, 11 * 16, 15 * 16, 16, 16);
            ctx.drawImage(tilesetImg, 2 * 16, 64, 16, 16, 12 * 16, 15 * 16, 16, 16);
            ctx.drawImage(tilesetImg, 3 * 16, 64, 16, 16, 13 * 16, 16 * 16, 16, 16);
            ctx.drawImage(tilesetImg, 7 * 16, 80, 16, 16, 15 * 16, 14 * 16, 16, 16);
          }
        });

        // Chapter 2: The Bank / Ledger
        renderables.push({
          y: 14 * 16 + 4,
          render: () => {
            const bW = 86, bH = 86;
            const bX = 50 * 16 - bW / 2;
            const bY = 14 * 16 + 4 - bH;
            ctx.drawImage(bankImg, bX, bY, bW, bH);
          }
        });

        // Bram
        renderables.push({
          y: 14 * 16 + 6,
          render: () => {
            ctx.drawImage(bramImg, 0, 0, 24, 32, 52 * 16 - 10, 13 * 16 + 4, 24, 32);
          }
        });

        // Ledger Counter Table / Stand
        renderables.push({
          y: 14 * 16 + 8,
          render: () => {
            const px = 52 * 16 - 4, py = 14 * 16 + 2;
            ctx.drawImage(tilesetImg, 5 * 16, 16, 16, 16, px, py, 16, 16);
            ctx.drawImage(tilesetImg, 6 * 16, 16, 16, 16, px, py, 16, 16);
            ctx.drawImage(tilesetImg, 7 * 16, 16, 16, 16, px - 4, py + 2, 16, 16);
            ctx.drawImage(tilesetImg, 7 * 16, 16, 16, 16, px + 2, py + 2, 16, 16);
          }
        });

        // Chapter 3: Bell Tower (New Custom Bell Tower)
        renderables.push({
          y: 14 * 16,
          render: () => {
            const bW = 46, bH = 98;
            const bX = 32 * 16 - bW / 2;
            const bY = 14 * 16 - bH + 2;
            ctx.drawImage(bellTowerImg, bX, bY, bW, bH);
          }
        });

        // Notice Board (New Custom Notice Board)
        renderables.push({
          y: 35 * 16 + 6,
          render: () => {
            const bW = 52, bH = 46;
            const bX = 32 * 16 - bW / 2;
            const bY = 35 * 16 - bH + 6;
            ctx.drawImage(noticeBoardImg, bX, bY, bW, bH);
          }
        });

        // Central Stone Fountain
        renderables.push({
          y: 32 * 16,
          render: () => {
            ctx.drawImage(tilesetImg, 5 * 16, 64, 16, 16, 32 * 16, 31 * 16, 16, 16);
          }
        });

        // Chapter 5: Festival Grounds (New Custom Festival Grounds)
        renderables.push({
          y: 51 * 16 + 6,
          render: () => {
            const bW = 128, bH = 94;
            const bX = 16 * 16 - bW / 2;
            const bY = 52 * 16 - bH + 4;
            ctx.drawImage(festivalGroundsImg, bX, bY, bW, bH);
          }
        });

        // Chapter 6: Moonlight Cinema (New Custom Moonlight Cinema)
        renderables.push({
          y: 51 * 16 + 6,
          render: () => {
            const bW = 128, bH = 93;
            const bX = 48 * 16 - bW / 2;
            const bY = 52 * 16 - bH + 4;
            ctx.drawImage(moonlightCinemaImg, bX, bY, bW, bH);
          }
        });

        // Archive Cellar
        renderables.push({
          y: 33 * 16,
          render: () => {
            ctx.drawImage(tilesetImg, 5 * 16, 32, 16, 16, 11 * 16, 30 * 16, 16, 16);
            ctx.drawImage(tilesetImg, 5 * 16, 32, 16, 16, 12 * 16, 30 * 16, 16, 16);
            ctx.drawImage(tilesetImg, 5 * 16, 48, 16, 16, 13 * 16, 31 * 16, 16, 16);
          }
        });

        // Toolshed Workbench
        renderables.push({
          y: 23 * 16,
          render: () => {
            ctx.drawImage(tilesetImg, 6 * 16, 32, 16, 16, 15 * 16, 21 * 16, 16, 16);
            ctx.drawImage(tilesetImg, 6 * 16, 48, 16, 16, 17 * 16, 22 * 16, 16, 16);
          }
        });

        // Sky Post
        renderables.push({
          y: 25 * 16,
          render: () => {
            ctx.drawImage(tilesetImg, 7 * 16, 80, 16, 16, 48 * 16, 24 * 16, 16, 16);
            ctx.drawImage(tilesetImg, 6 * 16, 80, 16, 16, 47 * 16, 24 * 16, 16, 16);
          }
        });

        // Plaza Lanterns & Benches
        [{ x: 28, y: 28 }, { x: 36, y: 28 }, { x: 28, y: 36 }, { x: 36, y: 36 }].forEach(lp => {
          renderables.push({
            y: (lp.y + 1) * 16,
            render: () => ctx.drawImage(tilesetImg, 7 * 16, 64, 16, 16, lp.x * 16, lp.y * 16, 16, 16)
          });
        });
        [{ x: 30, y: 31 }, { x: 34, y: 31 }].forEach(bp => {
          renderables.push({
            y: (bp.y + 1) * 16,
            render: () => ctx.drawImage(tilesetImg, 6 * 16, 64, 16, 16, bp.x * 16, bp.y * 16, 16, 16)
          });
        });

        // Trees
        const trees = [
          { x: 9, y: 10, type: 'oak' }, { x: 18, y: 10, type: 'oak' },
          { x: 8, y: 31, type: 'oak' }, { x: 26, y: 22, type: 'oak' }, { x: 38, y: 22, type: 'oak' },
          { x: 29, y: 9, type: 'pine' }, { x: 35, y: 9, type: 'pine' }, { x: 18, y: 21, type: 'pine' },
          { x: 9, y: 34, type: 'blossom' }, { x: 24, y: 12, type: 'blossom' }, { x: 40, y: 12, type: 'blossom' }
        ];
        trees.forEach(tr => {
          if (tr.type === 'pine') {
            renderables.push({
              y: (tr.y + 1) * 16,
              render: () => ctx.drawImage(tilesetImg, 4 * 16, 80, 16, 16, tr.x * 16, tr.y * 16, 16, 16)
            });
          } else if (tr.type === 'blossom') {
            renderables.push({
              y: (tr.y + 1) * 16,
              render: () => {
                ctx.drawImage(tilesetImg, 2 * 16, 80, 16, 16, tr.x * 16, (tr.y - 1) * 16, 16, 16);
                ctx.drawImage(tilesetImg, 3 * 16, 80, 16, 16, tr.x * 16, tr.y * 16, 16, 16);
              }
            });
          } else {
            renderables.push({
              y: (tr.y + 1) * 16,
              render: () => {
                ctx.drawImage(tilesetImg, 0, 80, 16, 16, tr.x * 16, (tr.y - 1) * 16, 16, 16);
                ctx.drawImage(tilesetImg, 1 * 16, 80, 16, 16, tr.x * 16, tr.y * 16, 16, 16);
              }
            });
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


  // 0a. Initial Login/Refresh: Shows Welcome Dialogue & Controls Pill (at Central Plaza Fountain)
  currentHTML = buildHTML({ activeTab: null, hasInteracted: false, pipPos: { x: 32 * 16, y: 33 * 16, dir: 0 }, nearbyBuilding: null, isMobile: false, panelOnly: false });
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(OUT_DIR, 'overworld-welcome-desktop.png') });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'overworld-welcome-desktop.png') });
  console.log('✓ Captured overworld-welcome-desktop.png (initial login view)');

  // 0b. Open World Roaming: Pip walking North Belfry Avenue towards the Bell Tower
  currentHTML = buildHTML({ activeTab: null, hasInteracted: true, pipPos: { x: 32 * 16, y: 22 * 16, dir: 3 }, nearbyBuilding: null, isMobile: false, panelOnly: false });
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(OUT_DIR, 'overworld-map-desktop.png') });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'overworld-map-desktop.png') });
  console.log('✓ Captured updated overworld-map-desktop.png (roaming unobstructed)');

  // 0b-full. Complete 64x64 Forest Village Map Overview (Central Plaza & surrounding Woodland)
  await page.screenshot({ path: path.join(OUT_DIR, 'overworld-forest-village-64x64-desktop.png') });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'overworld-forest-village-64x64-desktop.png') });
  console.log('✓ Captured overworld-forest-village-64x64-desktop.png (full forest village overview)');

  // 0c. Default Overworld Map Mobile
  currentHTML = buildHTML({ activeTab: null, hasInteracted: true, pipPos: { x: 32 * 16, y: 33 * 16, dir: 0 }, nearbyBuilding: null, isMobile: true, panelOnly: false });
  await page.setViewport({ width: 390, height: 844 });
  await page.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(OUT_DIR, 'overworld-map-mobile.png') });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'overworld-map-mobile.png') });
  console.log('✓ Captured updated overworld-map-mobile.png');

  // 0d. Pip outside the new custom Farmstead House (Northwest Clearing)
  currentHTML = buildHTML({ activeTab: null, hasInteracted: true, pipPos: { x: 14 * 16, y: 14 * 16, dir: 3 }, nearbyBuilding: 'The Farmstead', isMobile: false, panelOnly: false });
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(OUT_DIR, 'overworld-farmstead-custom-house-desktop.png') });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'overworld-farmstead-custom-house-desktop.png') });
  console.log('✓ Captured overworld-farmstead-custom-house-desktop.png');

  // 0e. Pip outside the new custom Notice Board (Central Plaza)
  currentHTML = buildHTML({ activeTab: null, hasInteracted: true, pipPos: { x: 32 * 16, y: 36 * 16, dir: 3 }, nearbyBuilding: 'The Notice Board', isMobile: false, panelOnly: false });
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(OUT_DIR, 'overworld-notice-board-custom-desktop.png') });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'overworld-notice-board-custom-desktop.png') });
  console.log('✓ Captured overworld-notice-board-custom-desktop.png');

  // 0f. Pip outside the new custom Bank (Northeast Ledger Clearing)
  currentHTML = buildHTML({ activeTab: null, hasInteracted: true, pipPos: { x: 50 * 16, y: 14 * 16, dir: 3 }, nearbyBuilding: 'The Ledger Hut', isMobile: false, panelOnly: false });
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(OUT_DIR, 'overworld-bank-custom-desktop.png') });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'overworld-bank-custom-desktop.png') });
  console.log('✓ Captured overworld-bank-custom-desktop.png');

  // 0g. Pip outside the new custom Bell Tower (North Landmark)
  currentHTML = buildHTML({ activeTab: null, hasInteracted: true, pipPos: { x: 32 * 16, y: 14 * 16, dir: 3 }, nearbyBuilding: 'The Bell Tower', isMobile: false, panelOnly: false });
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(OUT_DIR, 'overworld-bell-tower-custom-desktop.png') });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'overworld-bell-tower-custom-desktop.png') });
  console.log('✓ Captured overworld-bell-tower-custom-desktop.png');

  // 0h. Pip outside the new custom Festival Grounds (Southwest Clearing)
  currentHTML = buildHTML({ activeTab: null, hasInteracted: true, pipPos: { x: 16 * 16, y: 51 * 16, dir: 3 }, nearbyBuilding: 'The Festival Grounds', isMobile: false, panelOnly: false });
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(OUT_DIR, 'overworld-festival-custom-desktop.png') });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'overworld-festival-custom-desktop.png') });
  console.log('✓ Captured overworld-festival-custom-desktop.png');

  // 0i. Pip outside the new custom Moonlight Cinema (Southeast Woodland Clearing)
  currentHTML = buildHTML({ activeTab: null, hasInteracted: true, pipPos: { x: 48 * 16, y: 51 * 16, dir: 3 }, nearbyBuilding: 'The Moonlight Cinema', isMobile: false, panelOnly: false });
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(OUT_DIR, 'overworld-cinema-custom-desktop.png') });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'overworld-cinema-custom-desktop.png') });
  console.log('✓ Captured overworld-cinema-custom-desktop.png');

  // 1. Proximity prompt with [E] Enter & [P] Panel Only (interacting with Bank)
  currentHTML = buildHTML({ activeTab: null, hasInteracted: true, pipPos: { x: 50 * 16, y: 14 * 16, dir: 3 }, nearbyBuilding: 'The Ledger Hut', isMobile: false, panelOnly: false });
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(OUT_DIR, 'overworld-walk-proximity-desktop.png') });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'overworld-walk-proximity-desktop.png') });
  console.log('✓ Captured updated overworld-walk-proximity-desktop.png');

  // 2. Entered Ledger Hut in Split World View (with Panel Only toggle in header)
  currentHTML = buildHTML({ activeTab: 'debts', hasInteracted: true, pipPos: { x: 48 * 16, y: 14 * 16, dir: 2 }, nearbyBuilding: null, isMobile: false, panelOnly: false });
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(OUT_DIR, 'overworld-entered-ledger-desktop.png') });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'overworld-entered-ledger-desktop.png') });
  console.log('✓ Captured updated overworld-entered-ledger-desktop.png');

  // 3. Entered in Fullscreen "Panel Only" View
  currentHTML = buildHTML({ activeTab: 'debts', hasInteracted: true, pipPos: { x: 48 * 16, y: 14 * 16, dir: 2 }, nearbyBuilding: null, isMobile: false, panelOnly: true });
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
