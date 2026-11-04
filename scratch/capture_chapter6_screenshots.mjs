import puppeteer from 'puppeteer-core';
import http from 'http';
import fs from 'fs';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const OUT_DIR = path.resolve('docs/redesign/chapter-6');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

function generateChapter6Html() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>fih — Chapter 6: The Archive Cellar (Audit Log) [DEV MODE]</title>
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
      background: linear-gradient(180deg, #18120c 0%, #0e0a07 100%);
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
    .badge-dev {
      font-size: 10px;
      color: #f59e0b;
      background: #78350f33;
      border: 1px solid #f59e0b55;
      padding: 1px 6px;
      border-radius: 3px;
      font-weight: 800;
      text-transform: uppercase;
    }
  </style>
</head>
<body>
  <!-- Persistent Dev Mode HUD Indicator -->
  <div class="hud-dev">
    <span>🌾</span>
    <span>DEV ENVIRONMENT • ISOLATED SANDBOX</span>
  </div>

  <!-- Moss the Turtle's Speech Bubble -->
  <div class="speech-box">
    <div style="width: 72px; height: 80px; border-radius: 10px; background: #1c2814; border: 2px solid #3b5423; display: flex; flex-direction: column; align-items: center; justify-content: center;">
      <span style="font-size: 32px;">🐢</span>
      <span style="font-size: 9px; font-weight: 800; color: #8fc45a; text-transform: uppercase; margin-top: 2px;">MOSS</span>
    </div>
    <div>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
        <span style="font-size: 14px; font-weight: 700; color: #f2c230;">Moss the Archivist • Chapter 6: The Archive Cellar</span>
        <span style="font-size: 11px; color: #8fc45a;">📜 Cellar Tomes • 130Hz Typewriter</span>
      </div>
      <p style="margin: 0; font-size: 13.5px; line-height: 1.55; color: #fdf6e2; font-style: italic;">
        “Welcome to the cellar, traveler. Every deed, pigeon dispatch, and favor is inscribed into the village chronicle. Records in the archive are etched in stone; they are never rewritten.”
      </p>
    </div>
  </div>

  <!-- Cellar Header Summary Cards -->
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px; margin-bottom: 20px;">
    <div class="wood-card" style="margin-bottom: 0; border-color: #f2c230;">
      <div style="font-size: 11px; color: #f2c230; font-weight: 700; text-transform: uppercase;">Archive Records</div>
      <div style="font-size: 24px; font-weight: 800; color: #fdf6e2; margin-top: 4px;">42</div>
      <div style="font-size: 11px; color: #c4b5a5; margin-top: 4px;">Inscribed in cellar chronicles</div>
    </div>
    <div class="wood-card" style="margin-bottom: 0;">
      <div style="font-size: 11px; color: #38bdf8; font-weight: 700; text-transform: uppercase;">Pigeon Dispatches</div>
      <div style="font-size: 24px; font-weight: 800; color: #38bdf8; margin-top: 4px;">18</div>
      <div style="font-size: 11px; color: #a38d7b; margin-top: 4px;">Arrived via WhatsApp carrier</div>
    </div>
    <div class="wood-card" style="margin-bottom: 0;">
      <div style="font-size: 11px; color: #8fc45a; font-weight: 700; text-transform: uppercase;">Web Inscriptions</div>
      <div style="font-size: 24px; font-weight: 800; color: #8fc45a; margin-top: 4px;">24</div>
      <div style="font-size: 11px; color: #a38d7b; margin-top: 4px;">Authored via dashboard quill</div>
    </div>
  </div>

  <!-- Timeline Archive Entries -->
  <div style="display: flex; flex-direction: column; gap: 10px;">
    <!-- Entry 1: WhatsApp -->
    <div class="wood-card" style="margin-bottom: 0; display: flex; justify-content: space-between; align-items: flex-start;">
      <div style="display: flex; align-items: flex-start; gap: 12px;">
        <div style="width: 32px; height: 32px; border-radius: 6px; background: #1f130b; border: 1.5px solid #4d3324; display: flex; align-items: center; justify-content: center; font-size: 16px;">
          🕊️
        </div>
        <div>
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
            <span style="font-size: 10px; font-weight: 700; background: rgba(16,185,129,0.2); border: 1px solid #10b981; color: #8fc45a; padding: 2px 6px; border-radius: 3px;">CREATE</span>
            <span style="font-size: 11px; font-weight: 700; color: #8fc45a;">TODO</span>
            <span class="badge-dev">DEV</span>
            <span style="font-size: 11px; color: #c4b5a5;">• Wren Dispatch</span>
          </div>
          <div style="font-size: 13px; color: #fdf6e2; font-weight: 600;">
            Created task "Harvest parsnips before noon" via WhatsApp
          </div>
        </div>
      </div>
      <div style="font-size: 11px; color: #c4b5a5; font-family: monospace;">
        Nov 05, 01:22 PM
      </div>
    </div>

    <!-- Entry 2: Web -->
    <div class="wood-card" style="margin-bottom: 0; display: flex; justify-content: space-between; align-items: flex-start;">
      <div style="display: flex; align-items: flex-start; gap: 12px;">
        <div style="width: 32px; height: 32px; border-radius: 6px; background: #1f130b; border: 1.5px solid #4d3324; display: flex; align-items: center; justify-content: center; font-size: 16px;">
          🪶
        </div>
        <div>
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
            <span style="font-size: 10px; font-weight: 700; background: rgba(245,158,11,0.2); border: 1px solid #f59e0b; color: #f2c230; padding: 2px 6px; border-radius: 3px;">UPDATE</span>
            <span style="font-size: 11px; font-weight: 700; color: #f2c230;">DEBT</span>
            <span class="badge-dev">DEV</span>
            <span style="font-size: 11px; color: #c4b5a5;">• Web Quill</span>
          </div>
          <div style="font-size: 13px; color: #fdf6e2; font-weight: 600;">
            Settled favor with Arjun (₹2080.00) with wax stamp seal
          </div>
        </div>
      </div>
      <div style="font-size: 11px; color: #c4b5a5; font-family: monospace;">
        Nov 05, 12:45 PM
      </div>
    </div>
  </div>
</body>
</html>`;
}

async function run() {
  console.log('[Chapter 6 Screenshots] Launching Edge browser...');
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const shots = [
    { name: 'chapter-6-audit-desktop', width: 1280, height: 800 },
    { name: 'chapter-6-mobile', width: 390, height: 844 },
  ];

  for (const s of shots) {
    const server = http.createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(generateChapter6Html());
    });

    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    const port = server.address().port;

    const page = await browser.newPage();
    await page.setViewport({ width: s.width, height: s.height, deviceScaleFactor: 2 });
    await page.goto(`http://127.0.0.1:${port}`, { waitUntil: 'load' });

    const filePath = path.join(OUT_DIR, `${s.name}.png`);
    await page.screenshot({ path: filePath, fullPage: false });
    console.log(`[Chapter 6 Screenshots] Captured: ${s.name}.png (${s.width}x${s.height})`);

    await page.close();
    server.close();
  }

  await browser.close();
  console.log('[Chapter 6 Screenshots] All Chapter 6 screenshots saved successfully to docs/redesign/chapter-6/');
}

run().catch((err) => {
  console.error('[Chapter 6 Screenshots] Error:', err);
  process.exit(1);
});
