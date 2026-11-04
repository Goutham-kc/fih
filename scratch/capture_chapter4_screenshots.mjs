import puppeteer from 'puppeteer-core';
import http from 'http';
import fs from 'fs';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const OUT_DIR = path.resolve('docs/redesign/chapter-4');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

function generateChapter4Html() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>fih — Chapter 4: The Bell Tower (Reminders) [DEV MODE]</title>
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
      background: linear-gradient(180deg, #1f130b 0%, #120b06 100%);
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
      padding: 18px 20px;
      margin-bottom: 20px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.4);
      position: relative;
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
  </style>
</head>
<body>
  <!-- Persistent Dev Mode HUD Indicator -->
  <div class="hud-dev">
    <span>🌾</span>
    <span>DEV ENVIRONMENT • ISOLATED SANDBOX</span>
  </div>

  <!-- Hoot the Owl's Speech Bubble -->
  <div class="speech-box">
    <div style="width: 72px; height: 80px; border-radius: 10px; background: #3d2315; border: 2px solid #a36c3a; display: flex; flex-direction: column; align-items: center; justify-content: center;">
      <span style="font-size: 32px;">🦉</span>
      <span style="font-size: 9px; font-weight: 800; color: #fde047; text-transform: uppercase; margin-top: 2px;">HOOT</span>
    </div>
    <div>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
        <span style="font-size: 14px; font-weight: 700; color: #f2c230;">Hoot the Timekeeper • Chapter 4: The Bell Tower</span>
        <span style="font-size: 11px; color: #f2c230;">🔔 Belfry Chimes • 220Hz Typewriter</span>
      </div>
      <p style="margin: 0; font-size: 13.5px; line-height: 1.55; color: #fdf6e2; font-style: italic;">
        “Punctuality is the cornerstone of harmony in Pixel Valley. Tie your bells to the garland, and I shall sound the bronze chime right on time.”
      </p>
    </div>
  </div>

  <!-- Hero Summary Cards -->
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px; margin-bottom: 20px;">
    <div class="wood-card" style="margin-bottom: 0; border-color: #f2c230;">
      <div style="font-size: 11px; color: #f2c230; font-weight: 700; text-transform: uppercase;">Active Belfry Bells</div>
      <div style="font-size: 24px; font-weight: 800; color: #fdf6e2; margin-top: 4px;">3</div>
      <div style="font-size: 11px; color: #c4b5a5; margin-top: 4px;">Strung along tower rope</div>
    </div>
    <div class="wood-card" style="margin-bottom: 0;">
      <div style="font-size: 11px; color: #e07a3f; font-weight: 700; text-transform: uppercase;">Next Chime Due</div>
      <div style="font-size: 18px; font-weight: 800; color: #e07a3f; margin-top: 4px;">In 45 mins</div>
      <div style="font-size: 11px; color: #a38d7b; margin-top: 4px;">Hoot is watching the clock</div>
    </div>
    <div class="wood-card" style="margin-bottom: 0;">
      <div style="font-size: 11px; color: #c4b5a5; font-weight: 700; text-transform: uppercase;">Silent Bells Archive</div>
      <div style="font-size: 24px; font-weight: 800; color: #c4b5a5; margin-top: 4px;">8</div>
      <div style="font-size: 11px; color: #a38d7b; margin-top: 4px;">Past dispatched alerts</div>
    </div>
  </div>

  <!-- Upcoming Bells List -->
  <div style="display: flex; flex-direction: column; gap: 12px;">
    <!-- Bell 1: Next Chime -->
    <div class="wood-card" style="margin-bottom: 0; border-color: #f2c230;">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
        <div>
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
            <span style="font-size: 18px;">🔔</span>
            <span style="font-weight: 700; font-size: 15px; color: #fdf6e2;">Weekly Research Sync with Mentor</span>
            <span style="font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 4px; background: rgba(242,194,48,0.2); border: 1px solid #f2c230; color: #f2c230;">
              ⚡ NEXT CHIME
            </span>
            <span style="font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 3px; background: #2b220e; border: 1px solid #785b18; color: #f2c230;">
              IN 45 MINS
            </span>
          </div>
          <div style="font-size: 12px; color: #c4b5a5; display: flex; align-items: center; gap: 6px;">
            <span>📅 Wed, Nov 05, 2026, 02:00 PM</span>
          </div>
        </div>
        <button class="btn-pixel btn-gold" style="padding: 6px 14px;">🔔 Ring & Mark Sent</button>
      </div>
    </div>

    <!-- Bell 2 -->
    <div class="wood-card" style="margin-bottom: 0;">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
        <div>
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
            <span style="font-size: 18px;">🔔</span>
            <span style="font-weight: 700; font-size: 15px; color: #fdf6e2;">Refill Greenhouse Water Reservoirs</span>
            <span style="font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 3px; background: #1c2438; border: 1px solid #3b4b6b; color: #6888c8;">
              IN 6 HRS
            </span>
          </div>
          <div style="font-size: 12px; color: #c4b5a5; display: flex; align-items: center; gap: 6px;">
            <span>📅 Wed, Nov 05, 2026, 08:00 PM</span>
          </div>
        </div>
        <button class="btn-pixel btn-gold" style="padding: 6px 14px;">🔔 Ring & Mark Sent</button>
      </div>
    </div>
  </div>
</body>
</html>`;
}

async function run() {
  console.log('[Chapter 4 Screenshots] Launching Edge browser...');
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const shots = [
    { name: 'chapter-4-bell-tower-desktop', width: 1280, height: 800 },
    { name: 'chapter-4-mobile', width: 390, height: 844 },
  ];

  for (const s of shots) {
    const server = http.createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(generateChapter4Html());
    });

    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    const port = server.address().port;

    const page = await browser.newPage();
    await page.setViewport({ width: s.width, height: s.height, deviceScaleFactor: 2 });
    await page.goto(`http://127.0.0.1:${port}`, { waitUntil: 'load' });

    const filePath = path.join(OUT_DIR, `${s.name}.png`);
    await page.screenshot({ path: filePath, fullPage: false });
    console.log(`[Chapter 4 Screenshots] Captured: ${s.name}.png (${s.width}x${s.height})`);

    await page.close();
    server.close();
  }

  await browser.close();
  console.log('[Chapter 4 Screenshots] All Chapter 4 screenshots saved successfully to docs/redesign/chapter-4/');
}

run().catch((err) => {
  console.error('[Chapter 4 Screenshots] Error:', err);
  process.exit(1);
});
