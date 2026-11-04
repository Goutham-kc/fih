import puppeteer from 'puppeteer-core';
import http from 'http';
import fs from 'fs';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const OUT_DIR = path.resolve('docs/redesign/chapter-7');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

function generateChapter7Html() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>fih — Chapter 7: The Festival Grounds (Important Dates & Overview) [DEV MODE]</title>
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
      padding: 16px 18px;
      margin-bottom: 14px;
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

  <!-- Clover the Elder's Speech Bubble -->
  <div class="speech-box">
    <div style="width: 72px; height: 80px; border-radius: 10px; background: #3d2315; border: 2px solid #a36c3a; display: flex; flex-direction: column; align-items: center; justify-content: center;">
      <span style="font-size: 32px;">🐐</span>
      <span style="font-size: 9px; font-weight: 800; color: #fde047; text-transform: uppercase; margin-top: 2px;">CLOVER</span>
    </div>
    <div>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
        <span style="font-size: 14px; font-weight: 700; color: #f2c230;">Clover the Village Elder • The Festival Grounds</span>
        <span style="font-size: 11px; color: #f2c230;">🌸 Annual Milestones • 330Hz Typewriter</span>
      </div>
      <p style="margin: 0; font-size: 13.5px; line-height: 1.55; color: #fdf6e2; font-style: italic;">
        “The seasons turn and the village flourishes! Birthdays, harvests, and solstices are the rhythm of life in Pixel Valley. Celebrate every milestone!”
      </p>
    </div>
  </div>

  <!-- Village Overview Metric Cards -->
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 20px;">
    <div class="wood-card" style="margin-bottom: 0;">
      <div style="font-size: 11px; color: #8fc45a; font-weight: 700; text-transform: uppercase;">🌱 Farmstead Quests</div>
      <div style="font-size: 24px; font-weight: 800; color: #fdf6e2; margin-top: 4px;">6</div>
      <div style="font-size: 11px; color: #a38d7b; margin-top: 4px;">Crop plots ripening</div>
    </div>
    <div class="wood-card" style="margin-bottom: 0;">
      <div style="font-size: 11px; color: #e07a3f; font-weight: 700; text-transform: uppercase;">🔔 Belfry Chimes Today</div>
      <div style="font-size: 24px; font-weight: 800; color: #e07a3f; margin-top: 4px;">2</div>
      <div style="font-size: 11px; color: #a38d7b; margin-top: 4px;">Chimes queued today</div>
    </div>
    <div class="wood-card" style="margin-bottom: 0;">
      <div style="font-size: 11px; color: #f2c230; font-weight: 700; text-transform: uppercase;">📌 Ripening in 48h</div>
      <div style="font-size: 24px; font-weight: 800; color: #fdf6e2; margin-top: 4px;">1</div>
      <div style="font-size: 11px; color: #a38d7b; margin-top: 4px;">Notice due soon</div>
    </div>
    <div class="wood-card" style="margin-bottom: 0; border-color: #f2c230;">
      <div style="font-size: 11px; color: #f2c230; font-weight: 700; text-transform: uppercase;">🪙 Net Ledger Gold</div>
      <div style="font-size: 24px; font-weight: 800; color: #8fc45a; margin-top: 4px;">+₹1,880.00</div>
      <div style="font-size: 11px; color: #c4b5a5; margin-top: 4px;">Surplus in gold pouch</div>
    </div>
  </div>

  <!-- Festival Dates Section -->
  <div style="font-size: 12px; font-weight: 800; color: #f2c230; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px;">
    🎉 This Week’s Celebrations
  </div>
  <div class="wood-card" style="border-color: #f2c230;">
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <div>
        <div style="font-size: 15px; font-weight: 700; color: #fdf6e2; margin-bottom: 4px;">Mom’s Birthday Celebration 🎂</div>
        <div style="font-size: 12px; color: #c4b5a5;">📅 Date: 11-08 • Annual Celebration</div>
      </div>
      <span style="font-size: 11px; font-weight: 800; background: #2b220e; border: 1px solid #785b18; color: #f2c230; padding: 4px 10px; border-radius: 4px;">
        In 3 days
      </span>
    </div>
  </div>
</body>
</html>`;
}

async function run() {
  console.log('[Chapter 7 Screenshots] Launching Edge browser...');
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const shots = [
    { name: 'chapter-7-festival-desktop', width: 1280, height: 800 },
    { name: 'chapter-7-mobile', width: 390, height: 844 },
  ];

  for (const s of shots) {
    const server = http.createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(generateChapter7Html());
    });

    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    const port = server.address().port;

    const page = await browser.newPage();
    await page.setViewport({ width: s.width, height: s.height, deviceScaleFactor: 2 });
    await page.goto(`http://127.0.0.1:${port}`, { waitUntil: 'load' });

    const filePath = path.join(OUT_DIR, `${s.name}.png`);
    await page.screenshot({ path: filePath, fullPage: false });
    console.log(`[Chapter 7 Screenshots] Captured: ${s.name}.png (${s.width}x${s.height})`);

    await page.close();
    server.close();
  }

  await browser.close();
  console.log('[Chapter 7 Screenshots] All Chapter 7 screenshots saved successfully to docs/redesign/chapter-7/');
}

run().catch((err) => {
  console.error('[Chapter 7 Screenshots] Error:', err);
  process.exit(1);
});
