import puppeteer from 'puppeteer-core';
import http from 'http';
import fs from 'fs';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const OUT_DIR = path.resolve('docs/redesign/phase-5');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

function generatePhase5Html() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>fih — Phase 5: Village Growth & Wren's Dispatch Guide [DEV MODE]</title>
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

  <!-- HUD with Prosperity Badge & Wren Guide -->
  <div class="wood-card" style="border-color: #f2c230;">
    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
      <div style="display: flex; align-items: center; gap: 12px;">
        <span style="font-size: 28px;">🌾</span>
        <div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 16px; font-weight: 700; color: #fdf6e2;">Pixel Valley HUD</span>
            <span style="font-size: 11px; font-weight: 800; background: rgba(143,196,90,0.2); border: 1px solid #8fc45a; color: #8fc45a; padding: 2px 8px; border-radius: 4px;">
              🎖️ LEVEL: BOUNTIFUL VILLAGE (240 PTS)
            </span>
          </div>
          <div style="font-size: 12px; color: #c4b5a5; margin-top: 2px;">
            16 crops harvested • 8 favors settled • Gold Balance: +₹1,880.00
          </div>
        </div>
      </div>

      <div style="display: flex; gap: 8px;">
        <button class="btn-pixel btn-gold">🕊️ Wren Guide (Active)</button>
        <button class="btn-pixel">🔊 Audio Active</button>
      </div>
    </div>
  </div>

  <!-- Wren's Dispatch Commands Modal -->
  <div class="wood-card" style="max-width: 560px; margin: 0 auto; border-color: #f2c230; box-shadow: 0 8px 32px rgba(0,0,0,0.6);">
    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
      <span style="font-size: 32px;">🕊️</span>
      <div>
        <h3 style="margin: 0; font-size: 16px; font-weight: 700; color: #fdf6e2;">
          Messenger Wren’s Dispatch Commands
        </h3>
        <span style="font-size: 11px; color: #f2c230; font-weight: 600;">
          Text these directly to your WhatsApp assistant from anywhere!
        </span>
      </div>
    </div>

    <div style="background: #1f130b; border: 1.5px solid #4d3324; border-radius: 8px; padding: 14px; display: flex; flexDirection: column; gap: 10px;">
      <div style="border-bottom: 1px solid #3d2315; padding-bottom: 8px;">
        <code style="color: #8fc45a; font-weight: 700; font-size: 12px;">&gt;todo [task]</code>
        <div style="font-size: 11px; color: #c4b5a5;">Example: &gt;todo Water the parsnips (Plants a new crop plot)</div>
      </div>
      <div style="border-bottom: 1px solid #3d2315; padding-bottom: 8px;">
        <code style="color: #8fc45a; font-weight: 700; font-size: 12px;">&gt;remind [task] in [time]</code>
        <div style="font-size: 11px; color: #c4b5a5;">Example: &gt;remind Call vet in 2 hours (Ties a bell to the belfry)</div>
      </div>
      <div style="border-bottom: 1px solid #3d2315; padding-bottom: 8px;">
        <code style="color: #8fc45a; font-weight: 700; font-size: 12px;">&gt;owe [person] [amount]</code>
        <div style="font-size: 11px; color: #c4b5a5;">Example: &gt;owe Arjun 500 for seeds (Inscribes into gold ledger)</div>
      </div>
      <div style="border-bottom: 1px solid #3d2315; padding-bottom: 8px;">
        <code style="color: #8fc45a; font-weight: 700; font-size: 12px;">&gt;deadline [title] on [date]</code>
        <div style="font-size: 11px; color: #c4b5a5;">Example: &gt;deadline End Sem on Nov 15 (Pins notice to board)</div>
      </div>
      <div>
        <code style="color: #8fc45a; font-weight: 700; font-size: 12px;">&gt;watch [title] | [type]</code>
        <div style="font-size: 11px; color: #c4b5a5;">Example: &gt;watch Dune 2 | movie (Loads reel onto projector)</div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

async function run() {
  console.log('[Phase 5 Screenshots] Launching Edge browser...');
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const shots = [
    { name: 'phase-5-growth-wren-desktop', width: 1280, height: 800 },
    { name: 'phase-5-mobile', width: 390, height: 844 },
  ];

  for (const s of shots) {
    const server = http.createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(generatePhase5Html());
    });

    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    const port = server.address().port;

    const page = await browser.newPage();
    await page.setViewport({ width: s.width, height: s.height, deviceScaleFactor: 2 });
    await page.goto(`http://127.0.0.1:${port}`, { waitUntil: 'load' });

    const filePath = path.join(OUT_DIR, `${s.name}.png`);
    await page.screenshot({ path: filePath, fullPage: false });
    console.log(`[Phase 5 Screenshots] Captured: ${s.name}.png (${s.width}x${s.height})`);

    await page.close();
    server.close();
  }

  await browser.close();
  console.log('[Phase 5 Screenshots] All Phase 5 screenshots saved successfully to docs/redesign/phase-5/');
}

run().catch((err) => {
  console.error('[Phase 5 Screenshots] Error:', err);
  process.exit(1);
});
