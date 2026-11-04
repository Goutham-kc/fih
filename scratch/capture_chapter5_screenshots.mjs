import puppeteer from 'puppeteer-core';
import http from 'http';
import fs from 'fs';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const OUT_DIR = path.resolve('docs/redesign/chapter-5');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

function generateChapter5Html() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>fih — Chapter 5: The Moonlight Cinema (Watchlist) [DEV MODE]</title>
  <style>
    :root {
      --pv-wood-dark: #7b4a28;
      --pv-wood-border: #4d3324;
      --pv-gold: #f2c230;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 24px;
      background: linear-gradient(180deg, #0e1224 0%, #060812 100%);
      color: #fdf6e2;
      min-height: 100vh;
    }
    .hud-dev {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      background: #78350f;
      border: 1.5px solid #f59e0b;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 800;
      color: #fde68a;
      letter-spacing: 0.05em;
      margin-bottom: 16px;
      text-transform: uppercase;
    }
    .wood-card {
      background: linear-gradient(180deg, #2b1a11 0%, #1a0f08 100%);
      border: 3px solid var(--pv-wood-dark);
      border-radius: 12px;
      padding: 16px 18px;
      margin-bottom: 20px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.4);
      position: relative;
    }
    .speech-box {
      background: linear-gradient(180deg, #181d36 0%, #0f1224 100%);
      border: 3px solid #2d386b;
      border-radius: 14px;
      padding: 14px 18px;
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 16px;
      align-items: center;
      margin-bottom: 20px;
      box-shadow: 0 6px 20px rgba(0,0,0,0.5);
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
    .btn-gold {
      background: #f2c230;
      border-color: #a36c3a;
      color: #1a0f08;
    }
    .kanban-col {
      background: rgba(14, 18, 36, 0.7);
      border: 2px solid #2d386b;
      border-radius: 10px;
      padding: 14px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
  </style>
</head>
<body>
  <!-- Persistent Dev Mode HUD Indicator -->
  <div class="hud-dev">
    <span>🌾</span>
    <span>DEV ENVIRONMENT • ISOLATED SANDBOX</span>
  </div>

  <!-- Juniper the Fox's Speech Bubble -->
  <div class="speech-box">
    <div style="width: 72px; height: 80px; border-radius: 10px; background: #23162b; border: 2px solid #6b3d87; display: flex; flex-direction: column; align-items: center; justify-content: center;">
      <span style="font-size: 32px;">🦊</span>
      <span style="font-size: 9px; font-weight: 800; color: #fde047; text-transform: uppercase; margin-top: 2px;">JUNIPER</span>
    </div>
    <div>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
        <span style="font-size: 14px; font-weight: 700; color: #f2c230;">Juniper the Projectionist • Chapter 5: The Moonlight Cinema</span>
        <span style="font-size: 11px; color: #818cf8;">✨ Always Night • 659Hz Typewriter</span>
      </div>
      <p style="margin: 0; font-size: 13.5px; line-height: 1.55; color: #fdf6e2; font-style: italic;">
        “Grab a pouch of sweet corn and take a log bench! The projector beam is warm, and the moths are dancing in the light. What reel shall we screen under the stars tonight?”
      </p>
    </div>
  </div>

  <!-- Cinema Header Summary Cards -->
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px; margin-bottom: 20px;">
    <div class="wood-card" style="margin-bottom: 0; border-color: #f2c230;">
      <div style="font-size: 11px; color: #f2c230; font-weight: 700; text-transform: uppercase;">Reels in Queue</div>
      <div style="font-size: 24px; font-weight: 800; color: #fdf6e2; margin-top: 4px;">3</div>
      <div style="font-size: 11px; color: #c4b5a5; margin-top: 4px;">Waiting for projector slot</div>
    </div>
    <div class="wood-card" style="margin-bottom: 0;">
      <div style="font-size: 11px; color: #8fc45a; font-weight: 700; text-transform: uppercase;">Now Projecting</div>
      <div style="font-size: 24px; font-weight: 800; color: #8fc45a; margin-top: 4px;">1</div>
      <div style="font-size: 11px; color: #a38d7b; margin-top: 4px;">Active on screen beam</div>
    </div>
    <div class="wood-card" style="margin-bottom: 0;">
      <div style="font-size: 11px; color: #c4b5a5; font-weight: 700; text-transform: uppercase;">Watched Archive</div>
      <div style="font-size: 24px; font-weight: 800; color: #c4b5a5; margin-top: 4px;">5</div>
      <div style="font-size: 11px; color: #a38d7b; margin-top: 4px;">Archived cinema classics</div>
    </div>
  </div>

  <!-- 3-Column Cinema Shelves -->
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px;">
    <!-- Shelf 1: Now Showing -->
    <div class="kanban-col">
      <div style="font-size: 12px; font-weight: 800; color: #fdf6e2; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #2d386b; padding-bottom: 6px;">
        🎟️ Now Showing (Planned)
      </div>
      <div class="wood-card" style="margin-bottom: 0;">
        <div style="font-weight: 700; font-size: 14px; margin-bottom: 4px;">Severance Season 2</div>
        <div style="display: flex; gap: 6px; align-items: center; margin-bottom: 10px;">
          <span style="font-size: 10px; background: #241a15; border: 1px solid #4d3324; color: #f2c230; padding: 2px 6px; border-radius: 3px;">📺 SHOW</span>
        </div>
        <div style="display: flex; gap: 6px;">
          <button class="btn-pixel" style="padding: 4px 10px; font-size: 11px;">▶ Project</button>
          <button class="btn-pixel btn-gold" style="padding: 4px 10px; font-size: 11px;">⭐ Watched</button>
        </div>
      </div>
    </div>

    <!-- Shelf 2: In Projection -->
    <div class="kanban-col">
      <div style="font-size: 12px; font-weight: 800; color: #8fc45a; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #2d386b; padding-bottom: 6px;">
        📽️ In Projection (Active)
      </div>
      <div class="wood-card" style="margin-bottom: 0; border-color: #8fc45a;">
        <div style="font-weight: 700; font-size: 14px; margin-bottom: 4px;">Dune: Part Two</div>
        <div style="display: flex; gap: 6px; align-items: center; margin-bottom: 10px;">
          <span style="font-size: 10px; background: #241a15; border: 1px solid #4d3324; color: #f2c230; padding: 2px 6px; border-radius: 3px;">🎬 MOVIE</span>
        </div>
        <div style="display: flex; gap: 6px;">
          <button class="btn-pixel" style="padding: 4px 10px; font-size: 11px;">Hold</button>
          <button class="btn-pixel btn-gold" style="padding: 4px 10px; font-size: 11px;">⭐ Watched</button>
        </div>
      </div>
    </div>

    <!-- Shelf 3: Watched Archive -->
    <div class="kanban-col">
      <div style="font-size: 12px; font-weight: 800; color: #f2c230; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #2d386b; padding-bottom: 6px;">
        ⭐ Watched Archive (Rated)
      </div>
      <div class="wood-card" style="margin-bottom: 0;">
        <div style="font-weight: 700; font-size: 14px; margin-bottom: 4px;">Spirited Away</div>
        <div style="display: flex; gap: 6px; align-items: center; margin-bottom: 8px;">
          <span style="font-size: 10px; background: #241a15; border: 1px solid #4d3324; color: #f2c230; padding: 2px 6px; border-radius: 3px;">⛩️ ANIME</span>
          <span style="font-size: 11px; font-weight: 700; color: #f2c230;">⭐ 10/10</span>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

async function run() {
  console.log('[Chapter 5 Screenshots] Launching Edge browser...');
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const shots = [
    { name: 'chapter-5-cinema-desktop', width: 1280, height: 800 },
    { name: 'chapter-5-mobile', width: 390, height: 844 },
  ];

  for (const s of shots) {
    const server = http.createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(generateChapter5Html());
    });

    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    const port = server.address().port;

    const page = await browser.newPage();
    await page.setViewport({ width: s.width, height: s.height, deviceScaleFactor: 2 });
    await page.goto(`http://127.0.0.1:${port}`, { waitUntil: 'load' });

    const filePath = path.join(OUT_DIR, `${s.name}.png`);
    await page.screenshot({ path: filePath, fullPage: false });
    console.log(`[Chapter 5 Screenshots] Captured: ${s.name}.png (${s.width}x${s.height})`);

    await page.close();
    server.close();
  }

  await browser.close();
  console.log('[Chapter 5 Screenshots] All Chapter 5 screenshots saved successfully to docs/redesign/chapter-5/');
}

run().catch((err) => {
  console.error('[Chapter 5 Screenshots] Error:', err);
  process.exit(1);
});
