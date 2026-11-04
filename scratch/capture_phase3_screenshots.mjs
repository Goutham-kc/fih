import puppeteer from 'puppeteer-core';
import http from 'http';
import fs from 'fs';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const OUT_DIR = path.resolve('docs/redesign/phase-3');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

function generatePhase3Html(view = 'showcase') {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>fih — Pixel Valley Phase 3 (Characters & Dialogue) [DEV MODE]</title>
  <style>
    :root {
      --pv-wood-dark: #7b4a28;
      --pv-wood-mid: #a36c3a;
      --pv-parchment: #f4e4bc;
      --pv-gold: #f2c230;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 24px;
      background: linear-gradient(180deg, #1f130b 0%, #120b06 100%);
      color: #fdf6e2;
      min-height: 100vh;
    }
    .hud-header {
      background: linear-gradient(180deg, #2b1a11 0%, #1f130b 100%);
      border: 3px solid var(--pv-wood-dark);
      border-radius: 12px;
      padding: 16px 20px;
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 4px 16px rgba(0,0,0,0.5);
    }
    .badge-dev {
      background: rgba(245, 158, 11, 0.2);
      border: 1px solid rgba(245, 158, 11, 0.5);
      color: #f59e0b;
      padding: 4px 10px;
      border-radius: 6px;
      font-weight: 700;
      font-size: 11px;
    }
    .character-card {
      background: linear-gradient(180deg, #2b1a11 0%, #1a0f08 100%);
      border: 2px solid var(--pv-wood-dark);
      border-radius: 12px;
      padding: 16px;
      text-align: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.4);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }
    .speech-box {
      background: linear-gradient(180deg, #2b1a11 0%, #1a0f08 100%);
      border: 3px solid var(--pv-wood-dark);
      border-radius: 14px;
      padding: 16px 20px;
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 16px;
      align-items: center;
      box-shadow: 0 6px 20px rgba(0,0,0,0.45);
      margin-bottom: 20px;
    }
  </style>
</head>
<body>
  <div class="hud-header">
    <div>
      <h1 style="margin: 0; font-size: 20px; color: #fdf6e2;">Pixel Valley — Original Cast & Speech Engine</h1>
      <p style="margin: 4px 0 0 0; font-size: 12px; color: #c4b5a5;">
        Phase 3: Vector Pixel-Art Sprites, Character State Machines & Typewriter Blips
      </p>
    </div>
    <div style="display: flex; gap: 8px; align-items: center;">
      <span class="badge-dev">🛠️ DEV SANDBOX</span>
      <span style="font-size: 12px; color: #f2c230; font-weight: 700;">🪙 +₹1,880g</span>
    </div>
  </div>

  ${view === 'showcase' ? `
  <!-- All 9 Original Characters Grid -->
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px;">
    ${[
      { id: 'pip', name: 'Pip', role: 'Homestead Farmer', loc: 'Ch 1: The Farmstead', color: '#8fc45a', emoji: '👨‍🌾' },
      { id: 'hoot', name: 'Hoot', role: 'Clock Tower Owl', loc: 'Ch 2: The Bell Tower', color: '#f2c230', emoji: '🦉' },
      { id: 'marigold', name: 'Marigold', role: 'Notice Board Rabbit', loc: 'Ch 3: The Notice Board', color: '#f472b6', emoji: '🐇' },
      { id: 'bram', name: 'Bram', role: 'Ledger Badger Banker', loc: 'Ch 4: The Ledger Hut', color: '#c98f55', emoji: '🦡' },
      { id: 'clover', name: 'Clover', role: 'Festival Goat Elder', loc: 'Ch 5: Festival Grounds', color: '#a78bfa', emoji: '🐐' },
      { id: 'juniper', name: 'Juniper', role: 'Cinema Fox Projectionist', loc: 'Ch 6: Moonlight Cinema', color: '#fb923c', emoji: '🦊' },
      { id: 'moss', name: 'Moss', role: 'Archivist Turtle', loc: 'Ch 7: Archive Cellar', color: '#65a30d', emoji: '🐢' },
      { id: 'rowan', name: 'Rowan', role: 'Hedgehog Artisan Builder', loc: 'The Toolshed Workbench', color: '#eab308', emoji: '🦔' },
      { id: 'wren', name: 'Wren', role: 'WhatsApp Messenger Pigeon', loc: 'Cross-Chapter Courier', color: '#38bdf8', emoji: '🕊️' },
    ].map((c) => `
      <div class="character-card" style="border-top: 3px solid ${c.color};">
        <div style="width: 60px; height: 60px; border-radius: 8px; background: #3d2315; border: 2px solid #a36c3a; display: flex; align-items: center; justify-content: center; font-size: 30px;">
          ${c.emoji}
        </div>
        <div style="font-weight: 700; font-size: 15px; color: ${c.color};">${c.name}</div>
        <div style="font-size: 12px; color: #fdf6e2;">${c.role}</div>
        <div style="font-size: 10px; color: #a38d7b; text-transform: uppercase;">${c.loc}</div>
      </div>
    `).join('')}
  </div>
  ` : view === 'bubble' ? `
  <!-- Speech Bubble with Pip talking -->
  <div class="speech-box">
    <div style="width: 76px; height: 84px; border-radius: 10px; background: #3d2315; border: 2px solid #a36c3a; display: flex; flex-direction: column; align-items: center; justify-content: center;">
      <span style="font-size: 34px;">👨‍🌾</span>
      <span style="font-size: 9px; font-weight: 800; color: #fde047; text-transform: uppercase; margin-top: 2px;">PIP</span>
    </div>
    <div>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
        <div>
          <span style="font-size: 14px; font-weight: 700; color: #8fc45a;">Pip the Farmhand</span>
          <span style="font-size: 11px; color: #a38d7b;"> • Chapter 1: The Farmstead</span>
        </div>
        <div style="font-size: 11px; color: #f2c230; font-weight: 600;">📖 Lore (1/3) • 🔊 Audio 440Hz</div>
      </div>
      <p style="margin: 0; font-size: 14px; line-height: 1.55; color: #fdf6e2; font-style: italic;">
        “The morning sun breaks over the farmstead meadow. A cool autumn breeze rustles the willow branches. Water the parsnips, mend the fences, and cross off today’s chores before dusk settles!”
        <span style="display: inline-block; width: 6px; height: 12px; background: #f2c230; margin-left: 4px; vertical-align: middle;"></span>
      </p>
    </div>
  </div>

  <!-- Speech Bubble with Bram talking -->
  <div class="speech-box">
    <div style="width: 76px; height: 84px; border-radius: 10px; background: #3d2315; border: 2px solid #a36c3a; display: flex; flex-direction: column; align-items: center; justify-content: center;">
      <span style="font-size: 34px;">🦡</span>
      <span style="font-size: 9px; font-weight: 800; color: #fde047; text-transform: uppercase; margin-top: 2px;">BRAM</span>
    </div>
    <div>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
        <div>
          <span style="font-size: 14px; font-weight: 700; color: #f2c230;">Bram the Factor</span>
          <span style="font-size: 11px; color: #a38d7b;"> • Chapter 4: The Ledger Hut</span>
        </div>
        <div style="font-size: 11px; color: #f2c230; font-weight: 600;">📖 Lore (1/3) • 🔊 Audio 175Hz</div>
      </div>
      <p style="margin: 0; font-size: 14px; line-height: 1.55; color: #fdf6e2; font-style: italic;">
        “‘Clear accounts make steadfast friends,’ as we say in the valley. Settle your tabs before the autumn fair, and your pouch will always jingle with prosperity.”
      </p>
    </div>
  </div>
  ` : `
  <!-- Character Animation States -->
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px;">
    <div class="character-card">
      <div style="font-size: 36px;">👨‍🌾</div>
      <div style="font-weight: 700; color: #8fc45a;">Pip (Idle State)</div>
      <div style="font-size: 11px; color: #c4b5a5;">Subtle 1px breathing bob, waiting by the porch.</div>
    </div>
    <div class="character-card">
      <div style="font-size: 36px;">👨‍🌾 💬</div>
      <div style="font-weight: 700; color: #f2c230;">Pip (Talking State)</div>
      <div style="font-size: 11px; color: #c4b5a5;">Mouth frames animated in sync with 440Hz typewriter blips.</div>
    </div>
    <div class="character-card">
      <div style="font-size: 36px;">✨ 👨‍🌾 ✨</div>
      <div style="font-weight: 700; color: #ec4899;">Pip (Reaction State)</div>
      <div style="font-size: 11px; color: #c4b5a5;">Triumphant hop & sparkle particle upon task completion.</div>
    </div>
    <div class="character-card">
      <div style="font-size: 36px;">😴 💤</div>
      <div style="font-weight: 700; color: #93c5fd;">Pip (Night Sleep State)</div>
      <div style="font-size: 11px; color: #c4b5a5;">Eyes shut with floating zZz during valley night phase.</div>
    </div>
  </div>
  `}
</body>
</html>`;
}

async function run() {
  console.log('[Phase 3 Screenshots] Launching Edge browser...');
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const shots = [
    { name: 'characters-showcase-desktop', view: 'showcase', width: 1280, height: 800 },
    { name: 'speech-bubble-desktop', view: 'bubble', width: 1280, height: 800 },
    { name: 'speech-bubble-mobile', view: 'bubble', width: 390, height: 844 },
    { name: 'character-states-desktop', view: 'states', width: 1280, height: 800 },
  ];

  for (const s of shots) {
    const server = http.createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(generatePhase3Html(s.view));
    });

    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    const port = server.address().port;

    const page = await browser.newPage();
    await page.setViewport({ width: s.width, height: s.height, deviceScaleFactor: 2 });
    await page.goto(`http://127.0.0.1:${port}`, { waitUntil: 'load' });

    const filePath = path.join(OUT_DIR, `${s.name}.png`);
    await page.screenshot({ path: filePath, fullPage: false });
    console.log(`[Phase 3 Screenshots] Captured: ${s.name}.png (${s.width}x${s.height})`);

    await page.close();
    server.close();
  }

  await browser.close();
  console.log('[Phase 3 Screenshots] All Phase 3 screenshots saved successfully to docs/redesign/phase-3/');
}

run().catch((err) => {
  console.error('[Phase 3 Screenshots] Error:', err);
  process.exit(1);
});
