import puppeteer from 'puppeteer-core';
import http from 'http';
import fs from 'fs';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const OUT_DIR = path.resolve('docs/redesign/chapter-1');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

function generateChapter1Html(view = 'plot') {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>fih — Chapter 1: The Farmstead (Daily Quests) [DEV MODE]</title>
  <style>
    :root {
      --pv-wood-dark: #7b4a28;
      --pv-wood-mid: #a36c3a;
      --pv-wood-light: #c98f55;
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
    .hud-bar {
      background: linear-gradient(180deg, #2b1a11 0%, #1f130b 100%);
      border: 3px solid var(--pv-wood-dark);
      border-radius: 12px;
      padding: 14px 20px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 4px 16px rgba(0,0,0,0.5);
    }
    .badge-dev {
      background: rgba(245, 158, 11, 0.2);
      border: 1px solid rgba(245, 158, 11, 0.5);
      color: #f59e0b;
      padding: 3px 8px;
      border-radius: 6px;
      font-weight: 700;
      font-size: 11px;
    }
    .wood-card {
      background: linear-gradient(180deg, #2b1a11 0%, #1a0f08 100%);
      border: 3px solid var(--pv-wood-dark);
      border-radius: 12px;
      padding: 18px 20px;
      margin-bottom: 20px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.4);
    }
    .speech-box {
      background: linear-gradient(180deg, #2b1a11 0%, #1a0f08 100%);
      border: 3px solid var(--pv-wood-dark);
      border-radius: 14px;
      padding: 14px 18px;
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 16px;
      align-items: center;
      margin-bottom: 20px;
      box-shadow: 0 6px 20px rgba(0,0,0,0.45);
    }
    .plot-card {
      background: linear-gradient(180deg, #3d2315 0%, #24140b 100%);
      border: 2px solid var(--pv-wood-dark);
      border-radius: 10px;
      padding: 14px 16px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.35);
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .btn-pixel {
      background: #7b4a28;
      border: 2px solid #a36c3a;
      color: #fdf6e2;
      border-radius: 6px;
      padding: 6px 14px;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
    }
    .btn-pixel-primary {
      background: #8fc45a;
      border-color: #5e9440;
      color: #1a0f08;
    }
  </style>
</head>
<body>
  <!-- HUD Bar -->
  <div class="hud-bar">
    <div style="display: flex; align-items: center; gap: 10px;">
      <span style="font-size: 20px;">☀️</span>
      <span style="font-weight: 700; font-size: 14px;">Wed. 4 of Fall • 11:10 pm</span>
    </div>
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="font-size: 12px; color: #f2c230; font-weight: 700;">🪙 +₹1,880g</span>
      <span class="badge-dev">🛠️ DEV SANDBOX</span>
      <span style="font-size: 11px; color: #8fc45a; font-weight: 700;">🕊️ Wren: Connected</span>
    </div>
  </div>

  <!-- Pip's Speech Bubble -->
  <div class="speech-box">
    <div style="width: 72px; height: 80px; border-radius: 10px; background: #3d2315; border: 2px solid #a36c3a; display: flex; flex-direction: column; align-items: center; justify-content: center;">
      <span style="font-size: 32px;">👨‍🌾</span>
      <span style="font-size: 9px; font-weight: 800; color: #fde047; text-transform: uppercase; margin-top: 2px;">PIP</span>
    </div>
    <div>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
        <span style="font-size: 14px; font-weight: 700; color: #8fc45a;">Pip the Farmhand • Chapter 1: The Farmstead</span>
        <span style="font-size: 11px; color: #f2c230;">📖 Lore (1/3) • 440Hz Typewriter</span>
      </div>
      <p style="margin: 0; font-size: 13.5px; line-height: 1.55; color: #fdf6e2; font-style: italic;">
        “The morning sun breaks over the farmstead meadow. Water the parsnips, mend the fences, and cross off today’s chores before dusk settles!”
      </p>
    </div>
  </div>

  <!-- Plant a Seed Form -->
  <div class="wood-card">
    <div style="font-size: 12px; font-weight: 700; color: #8fc45a; text-transform: uppercase; margin-bottom: 10px;">
      🌱 Plant a Seed on the Farm
    </div>
    <div style="display: flex; gap: 10px; flex-wrap: wrap;">
      <input
        style="flex: 1; min-width: 260px; background: #24140b; border: 2px solid #7b4a28; padding: 8px 12px; border-radius: 6px; color: #fdf6e2; font-size: 14px;"
        placeholder="What chore will you tackle today on the farm?"
        value="Harvest autumn parsnips and beets"
        readonly
      />
      <button class="btn-pixel btn-pixel-primary">Plant Quest</button>
    </div>
  </div>

  <!-- Header Controls & Toggle -->
  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 12px;">
    <div style="display: flex; align-items: center; gap: 10px;">
      <h2 style="margin: 0; font-size: 18px; color: #fdf6e2;">🌾 The Seedbed (3 growing)</h2>
      <button class="btn-pixel">Refresh</button>
      <div style="display: inline-flex; background: #24140b; border: 1px solid #7b4a28; border-radius: 6px; padding: 2px;">
        <button class="btn-pixel" style="background: ${view === 'plot' ? '#7b4a28' : 'transparent'}; color: ${view === 'plot' ? '#f2c230' : '#c4b5a5'}; padding: 4px 8px; font-size: 11px;">Garden</button>
        <button class="btn-pixel" style="background: ${view === 'ledger' ? '#7b4a28' : 'transparent'}; color: ${view === 'ledger' ? '#f2c230' : '#c4b5a5'}; padding: 4px 8px; font-size: 11px;">Ledger</button>
      </div>
    </div>
    <div style="display: flex; gap: 6px;">
      <button class="btn-pixel btn-pixel-primary">All Crops</button>
      <button class="btn-pixel">⭐ High</button>
      <button class="btn-pixel">🌿 Medium</button>
      <button class="btn-pixel">🌱 Low</button>
    </div>
  </div>

  ${view === 'plot' ? `
  <!-- Garden Plot View -->
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 14px;">
    <div class="plot-card" style="border-color: #8fc45a;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 26px;">🌿</span>
          <div>
            <div style="font-weight: 700; font-size: 14px; color: #fdf6e2;">Water autumn parsnips and beets</div>
            <div style="font-size: 11px; color: #8fc45a; font-weight: 600;">Due in 4 hours • Ripe</div>
          </div>
        </div>
        <span style="font-size: 10px; background: rgba(143,196,90,0.2); border: 1px solid #8fc45a; color: #8fc45a; padding: 2px 6px; border-radius: 4px; font-weight: 700;">MEDIUM</span>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(123,74,40,0.4);">
        <button class="btn-pixel btn-pixel-primary" style="padding: 4px 10px;">Harvest Crop</button>
        <span style="color: #a38d7b; font-size: 11px;">🗑️</span>
      </div>
    </div>

    <div class="plot-card" style="border-color: #f2c230;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 26px;">🌱</span>
          <div>
            <div style="font-weight: 700; font-size: 14px; color: #fdf6e2;">Mend broken coop fence</div>
            <div style="font-size: 11px; color: #f2c230; font-weight: 600;">Due tomorrow 9:00 AM • Sprout</div>
          </div>
        </div>
        <span style="font-size: 10px; background: rgba(242,194,48,0.2); border: 1px solid #f2c230; color: #f2c230; padding: 2px 6px; border-radius: 4px; font-weight: 700;">HIGH</span>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(123,74,40,0.4);">
        <button class="btn-pixel btn-pixel-primary" style="padding: 4px 10px;">Harvest Crop</button>
        <span style="color: #a38d7b; font-size: 11px;">🗑️</span>
      </div>
    </div>

    <div class="plot-card" style="border-color: #4f9bd1;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 26px;">🌱</span>
          <div>
            <div style="font-weight: 700; font-size: 14px; color: #fdf6e2;">Stock firewood by porch</div>
            <div style="font-size: 11px; color: #4f9bd1; font-weight: 600;">Due Friday • Growing</div>
          </div>
        </div>
        <span style="font-size: 10px; background: rgba(79,155,209,0.2); border: 1px solid #4f9bd1; color: #4f9bd1; padding: 2px 6px; border-radius: 4px; font-weight: 700;">LOW</span>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(123,74,40,0.4);">
        <button class="btn-pixel btn-pixel-primary" style="padding: 4px 10px;">Harvest Crop</button>
        <span style="color: #a38d7b; font-size: 11px;">🗑️</span>
      </div>
    </div>
  </div>
  ` : `
  <!-- Classic Ledger View -->
  <div style="display: flex; flexDirection: column; gap: 8px;">
    <div style="background: #2b1a11; border: 2px solid #7b4a28; border-radius: 8px; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center;">
      <div style="display: flex; align-items: center; gap: 10px;">
        <span style="font-size: 16px; color: #8fc45a;">🔲</span>
        <span style="font-weight: 600; font-size: 14px; color: #fdf6e2;">Water autumn parsnips and beets</span>
        <span style="font-size: 10px; background: rgba(143,196,90,0.2); border: 1px solid #8fc45a; color: #8fc45a; padding: 1px 6px; border-radius: 4px;">medium</span>
      </div>
      <span style="font-size: 11px; color: #c4b5a5;">📅 Due: Nov 4, 2026, 05:00 PM</span>
    </div>
    <div style="background: #2b1a11; border: 2px solid #7b4a28; border-radius: 8px; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center;">
      <div style="display: flex; align-items: center; gap: 10px;">
        <span style="font-size: 16px; color: #f2c230;">🔲</span>
        <span style="font-weight: 600; font-size: 14px; color: #fdf6e2;">Mend broken coop fence</span>
        <span style="font-size: 10px; background: rgba(242,194,48,0.2); border: 1px solid #f2c230; color: #f2c230; padding: 1px 6px; border-radius: 4px;">high</span>
      </div>
      <span style="font-size: 11px; color: #c4b5a5;">📅 Due: Nov 5, 2026, 09:00 AM</span>
    </div>
  </div>
  `}
</body>
</html>`;
}

async function run() {
  console.log('[Chapter 1 Screenshots] Launching Edge browser...');
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const shots = [
    { name: 'chapter-1-plot-desktop', view: 'plot', width: 1280, height: 800 },
    { name: 'chapter-1-ledger-desktop', view: 'ledger', width: 1280, height: 800 },
    { name: 'chapter-1-mobile', view: 'plot', width: 390, height: 844 },
  ];

  for (const s of shots) {
    const server = http.createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(generateChapter1Html(s.view));
    });

    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    const port = server.address().port;

    const page = await browser.newPage();
    await page.setViewport({ width: s.width, height: s.height, deviceScaleFactor: 2 });
    await page.goto(`http://127.0.0.1:${port}`, { waitUntil: 'load' });

    const filePath = path.join(OUT_DIR, `${s.name}.png`);
    await page.screenshot({ path: filePath, fullPage: false });
    console.log(`[Chapter 1 Screenshots] Captured: ${s.name}.png (${s.width}x${s.height})`);

    await page.close();
    server.close();
  }

  await browser.close();
  console.log('[Chapter 1 Screenshots] All Chapter 1 screenshots saved successfully to docs/redesign/chapter-1/');
}

run().catch((err) => {
  console.error('[Chapter 1 Screenshots] Error:', err);
  process.exit(1);
});
