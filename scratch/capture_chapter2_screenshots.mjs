import puppeteer from 'puppeteer-core';
import http from 'http';
import fs from 'fs';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const OUT_DIR = path.resolve('docs/redesign/chapter-2');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

function generateChapter2Html() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>fih — Chapter 2: The Ledger Hut (Gold Ledger) [DEV MODE]</title>
  <style>
    :root {
      --pv-wood-dark: #7b4a28;
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
  <!-- Bram's Speech Bubble -->
  <div class="speech-box">
    <div style="width: 72px; height: 80px; border-radius: 10px; background: #3d2315; border: 2px solid #a36c3a; display: flex; flex-direction: column; align-items: center; justify-content: center;">
      <span style="font-size: 32px;">🦡</span>
      <span style="font-size: 9px; font-weight: 800; color: #fde047; text-transform: uppercase; margin-top: 2px;">BRAM</span>
    </div>
    <div>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
        <span style="font-size: 14px; font-weight: 700; color: #f2c230;">Bram the Factor • Chapter 4: The Ledger Hut</span>
        <span style="font-size: 11px; color: #f2c230;">📖 Lore (1/3) • 175Hz Typewriter</span>
      </div>
      <p style="margin: 0; font-size: 13.5px; line-height: 1.55; color: #fdf6e2; font-style: italic;">
        “‘Clear accounts make steadfast friends,’ as we say in the valley. Settle your tabs before the autumn fair, and your pouch will always jingle with prosperity.”
      </p>
    </div>
  </div>

  <!-- Hero Summary Cards -->
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px; margin-bottom: 20px;">
    <div class="wood-card" style="margin-bottom: 0;">
      <div style="font-size: 11px; color: #c4b5a5; font-weight: 700; text-transform: uppercase;">You Owe (Payable)</div>
      <div style="font-size: 22px; font-weight: 800; color: #c2415a; margin-top: 4px;">₹500.00</div>
      <div style="font-size: 11px; color: #a38d7b; margin-top: 4px;">Unsettled tabs in valley</div>
    </div>
    <div class="wood-card" style="margin-bottom: 0;">
      <div style="font-size: 11px; color: #c4b5a5; font-weight: 700; text-transform: uppercase;">Owed to You (Receivable)</div>
      <div style="font-size: 22px; font-weight: 800; color: #8fc45a; margin-top: 4px;">₹2,380.00</div>
      <div style="font-size: 11px; color: #a38d7b; margin-top: 4px;">Gold due from neighbors</div>
    </div>
    <div class="wood-card" style="margin-bottom: 0; border-color: #f2c230;">
      <div style="font-size: 11px; color: #f2c230; font-weight: 700; text-transform: uppercase;">Net Balance Position</div>
      <div style="font-size: 22px; font-weight: 800; color: #8fc45a; margin-top: 4px;">+₹1,880.00</div>
      <div style="font-size: 11px; color: #c4b5a5; margin-top: 4px;">Surplus in gold pouch</div>
    </div>
  </div>

  <!-- Person Debts Group -->
  <div class="wood-card">
    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(123,74,40,0.4); padding-bottom: 10px; margin-bottom: 12px;">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 16px; font-weight: 700; color: #fdf6e2;">Arjun</span>
        <span style="font-size: 11px; background: rgba(143,196,90,0.2); border: 1px solid #8fc45a; color: #8fc45a; padding: 2px 6px; border-radius: 4px; font-weight: 700;">
          Owes You ₹2,080.00
        </span>
      </div>
      <button class="btn-pixel btn-gold">Settle All with Arjun</button>
    </div>
    <div style="background: rgba(0,0,0,0.25); padding: 10px 14px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
      <div style="display: flex; align-items: center; gap: 10px;">
        <span style="color: #8fc45a; font-weight: 700; font-size: 13px;">🟢 Owes you</span>
        <span style="font-size: 14px; font-weight: 700;">₹2,080.00</span>
        <span style="font-size: 12px; color: #c4b5a5; font-style: italic;">“Advance for mountain trek”</span>
      </div>
      <button class="btn-pixel" style="padding: 4px 10px;">Settle</button>
    </div>
  </div>
</body>
</html>`;
}

async function run() {
  console.log('[Chapter 2 Screenshots] Launching Edge browser...');
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const shots = [
    { name: 'chapter-2-ledger-desktop', width: 1280, height: 800 },
    { name: 'chapter-2-mobile', width: 390, height: 844 },
  ];

  for (const s of shots) {
    const server = http.createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(generateChapter2Html());
    });

    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    const port = server.address().port;

    const page = await browser.newPage();
    await page.setViewport({ width: s.width, height: s.height, deviceScaleFactor: 2 });
    await page.goto(`http://127.0.0.1:${port}`, { waitUntil: 'load' });

    const filePath = path.join(OUT_DIR, `${s.name}.png`);
    await page.screenshot({ path: filePath, fullPage: false });
    console.log(`[Chapter 2 Screenshots] Captured: ${s.name}.png (${s.width}x${s.height})`);

    await page.close();
    server.close();
  }

  await browser.close();
  console.log('[Chapter 2 Screenshots] All Chapter 2 screenshots saved successfully to docs/redesign/chapter-2/');
}

run().catch((err) => {
  console.error('[Chapter 2 Screenshots] Error:', err);
  process.exit(1);
});
