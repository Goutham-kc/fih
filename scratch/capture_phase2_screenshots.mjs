import puppeteer from 'puppeteer-core';
import http from 'http';
import fs from 'fs';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const OUT_DIR = path.resolve('docs/redesign/phase-2');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

function generatePhase2Html(mode = 'world', weather = 'clear', timeOfDay = 'day') {
  const isNight = timeOfDay === 'night' || timeOfDay === 'dusk';
  const skyGradient = timeOfDay === 'night'
    ? 'linear-gradient(180deg, #0a0d18 0%, #151a2e 50%, #221b35 100%)'
    : timeOfDay === 'dusk'
    ? 'linear-gradient(180deg, #2a1532 0%, #83394d 45%, #d97746 80%, #f6b26b 100%)'
    : timeOfDay === 'dawn'
    ? 'linear-gradient(180deg, #1b1e36 0%, #4a3b69 40%, #b25d65 75%, #f4b266 100%)'
    : 'linear-gradient(180deg, #3a75c4 0%, #5d9cec 45%, #9fd4f6 80%, #d4eeff 100%)';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>fih — Pixel Valley Phase 2 [DEV MODE]</title>
  <style>
    :root {
      --pv-wood-dark: #7b4a28;
      --pv-wood-mid: #a36c3a;
      --pv-wood-light: #c98f55;
      --pv-parchment: #f4e4bc;
      --pv-gold: #f2c230;
      --pv-grass-light: #8fc45a;
      --pv-grass-dark: #5e9440;
      --pv-soil: #7a4e2d;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 0;
      background: ${skyGradient};
      color: #fdf6e2;
      min-height: 100vh;
      overflow-x: hidden;
      position: relative;
    }

    /* 4-Layer Parallax Background */
    .parallax-layer {
      position: absolute;
      bottom: 0;
      width: 100%;
      pointer-events: none;
    }
    .layer-mountains {
      height: 42vh;
      opacity: 0.45;
    }
    .layer-hills {
      height: 28vh;
      opacity: 0.6;
    }
    .layer-foreground {
      height: 14vh;
      opacity: 0.85;
    }

    /* Main Container */
    .app-shell {
      position: relative;
      z-index: 10;
      max-width: 1100px;
      margin: 0 auto;
      padding: 24px;
    }

    /* Pixel HUD Card */
    .hud-card {
      background: linear-gradient(180deg, #2b1a11 0%, #1f130b 100%);
      border: 3px solid var(--pv-wood-dark);
      border-radius: 14px;
      padding: 16px 20px;
      margin-bottom: 24px;
      box-shadow: 0 8px 30px rgba(0,0,0,0.5), inset 0 2px 0 rgba(201,143,85,0.3);
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      align-items: center;
      justify-content: space-between;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 3px 8px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 700;
    }

    .badge-dev {
      background: rgba(245, 158, 11, 0.2);
      border: 1px solid rgba(245, 158, 11, 0.5);
      color: #f59e0b;
    }

    .badge-gold {
      background: rgba(242, 194, 48, 0.2);
      border: 1px solid rgba(242, 194, 48, 0.5);
      color: #f2c230;
    }

    .badge-weather {
      background: rgba(79, 155, 209, 0.2);
      border: 1px solid rgba(79, 155, 209, 0.5);
      color: #4f9bd1;
    }

    .badge-wren {
      background: rgba(143, 196, 90, 0.2);
      border: 1px solid rgba(143, 196, 90, 0.5);
      color: #8fc45a;
    }

    .btn-hud {
      background: rgba(201, 143, 85, 0.15);
      border: 1px solid rgba(201, 143, 85, 0.4);
      color: #fdf6e2;
      border-radius: 6px;
      padding: 3px 8px;
      font-size: 11px;
      font-weight: 700;
      cursor: pointer;
    }

    /* Content Cards */
    .wood-panel {
      background: linear-gradient(180deg, #2b1a11 0%, #1f130b 100%);
      border: 3px solid var(--pv-wood-dark);
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 20px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.4);
    }

    .toolshed-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
      margin-top: 14px;
    }

    .slider-box {
      background: rgba(0,0,0,0.25);
      padding: 12px 14px;
      border-radius: 8px;
      border: 1px solid rgba(163,108,58,0.3);
    }
  </style>
</head>
<body>
  <!-- 4-Layer Parallax Background Scene -->
  <div class="parallax-layer layer-mountains">
    <svg viewBox="0 0 1200 200" preserveAspectRatio="none" style="width: 100%; height: 100%;">
      <path d="M0,200 L0,120 Q120,40 240,110 T480,90 T720,130 T960,70 T1200,100 L1200,200 Z" fill="#7b4a28" opacity="0.45" />
      <path d="M0,200 L0,150 Q160,80 320,140 T640,110 T960,150 T1200,120 L1200,200 Z" fill="#5e9440" opacity="0.6" />
    </svg>
  </div>
  <div class="parallax-layer layer-hills">
    <svg viewBox="0 0 1400 160" preserveAspectRatio="none" style="width: 100%; height: 100%;">
      <path d="M0,160 L0,80 Q140,20 280,70 T560,50 T840,90 T1120,40 T1400,60 L1400,160 Z" fill="#5e9440" />
    </svg>
  </div>
  <div class="parallax-layer layer-foreground">
    <svg viewBox="0 0 1600 100" preserveAspectRatio="none" style="width: 100%; height: 100%;">
      <path d="M0,100 L0,40 Q200,10 400,35 T800,25 T1200,45 T1600,20 L1600,100 Z" fill="#7a4e2d" />
      <path d="M0,100 L0,65 Q250,45 500,60 T1000,50 T1500,65 T1600,55 L1600,100 Z" fill="#8fc45a" />
    </svg>
  </div>

  <div class="app-shell">
    <!-- Top HUD Bar -->
    <div class="hud-card">
      <div style="display: flex; align-items: center; gap: 12px;">
        <span style="font-size: 24px;">${isNight ? '🌙' : '☀️'}</span>
        <div>
          <div style="font-size: 15px; font-weight: 700; color: #fdf6e2;">Wed. 4 of Fall</div>
          <div style="font-size: 12px; color: #f2c230; font-weight: 700;">10:55 pm</div>
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
        <div class="badge badge-gold">🪙 +₹1,880g GOLD</div>
        <div class="badge badge-dev">🛠️ DEV SANDBOX</div>
        <div class="badge badge-weather">${weather === 'rain' ? '🌧️ Rain' : weather === 'snow' ? '❄️ Snow' : weather === 'fireflies' ? '✨ Fireflies' : '☀️ Clear'}</div>
        <div class="badge badge-wren">🕊️ Wren: Ready</div>
        <button class="btn-hud">🔊 AUDIO</button>
        <button class="btn-hud">🧭 MOTION: 4-LAYER</button>
      </div>
    </div>

    ${mode === 'world' ? `
    <!-- Farmhouse Overview Chapter -->
    <div class="wood-panel" style="border-color: #f2c230;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <h2 style="margin: 0; font-size: 20px; color: #fdf6e2;">Chapter 1: The Farmstead (Daily Quests)</h2>
        <span style="font-size: 12px; color: #c4b5a5;">Resident: <strong>Pip the Farmer</strong></span>
      </div>
      <p style="font-size: 13px; color: #c4b5a5; line-height: 1.5;">
        Living 4-layer parallax scene active. Horizon shifts smoothly as you navigate between chapters.
        Weather Engine seeded to date: <strong>${weather}</strong> with <strong>${timeOfDay}</strong> lighting gradient.
      </p>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 12px; margin-top: 16px;">
        <div style="background: rgba(0,0,0,0.25); padding: 12px; border-radius: 8px; border: 1px solid rgba(163,108,58,0.3);">
          <div style="font-weight: 700; font-size: 13px; color: #8fc45a;">✅ Water autumn parsnips and beets</div>
          <div style="font-size: 11px; color: #a38d7b; margin-top: 4px;">Harvest due today • Pinned by Pip</div>
        </div>
        <div style="background: rgba(0,0,0,0.25); padding: 12px; border-radius: 8px; border: 1px solid rgba(163,108,58,0.3);">
          <div style="font-weight: 700; font-size: 13px; color: #f2c230;">📦 Mend broken coop fence</div>
          <div style="font-size: 11px; color: #a38d7b; margin-top: 4px;">Due tomorrow 9:00 AM • Material ready</div>
        </div>
      </div>
    </div>
    ` : `
    <!-- Toolshed Settings View -->
    <div class="wood-panel" style="border-color: #f2c230;">
      <h2 style="margin: 0 0 6px 0; font-size: 20px; color: #fdf6e2;">The Toolshed (Settings & Workshop)</h2>
      <p style="font-size: 13px; color: #c4b5a5; margin: 0 0 20px 0;">
        Procedural Web Audio synthesizer channels, camera panning speeds, and date-seeded weather overrides.
      </p>

      <h3 style="font-size: 15px; color: #fdf6e2; margin-bottom: 8px;">Acoustic Soundscapes (Web Audio)</h3>
      <div class="toolshed-grid">
        <div class="slider-box">
          <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 6px;">
            <span>Master Volume</span>
            <span style="color: #f2c230; font-weight: 700;">80%</span>
          </div>
          <div style="height: 6px; background: #7b4a28; border-radius: 3px; position: relative;">
            <div style="width: 80%; height: 100%; background: #f2c230; border-radius: 3px;"></div>
          </div>
        </div>
        <div class="slider-box">
          <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 6px;">
            <span>Sound Effects (SFX)</span>
            <span style="color: #8fc45a; font-weight: 700;">80%</span>
          </div>
          <div style="height: 6px; background: #7b4a28; border-radius: 3px; position: relative;">
            <div style="width: 80%; height: 100%; background: #8fc45a; border-radius: 3px;"></div>
          </div>
        </div>
        <div class="slider-box">
          <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 6px;">
            <span>Nature Ambience</span>
            <span style="color: #4f9bd1; font-weight: 700;">40%</span>
          </div>
          <div style="height: 6px; background: #7b4a28; border-radius: 3px; position: relative;">
            <div style="width: 40%; height: 100%; background: #4f9bd1; border-radius: 3px;"></div>
          </div>
        </div>
      </div>

      <h3 style="font-size: 15px; color: #fdf6e2; margin: 20px 0 8px 0;">Atmosphere & Camera Controls</h3>
      <div class="toolshed-grid">
        <div class="slider-box">
          <div style="font-size: 12px; font-weight: 700; color: #fdf6e2; margin-bottom: 4px;">Parallax Camera Motion</div>
          <div style="font-size: 11px; color: #8fc45a;">Full 4-Layer Dynamic Horizon</div>
        </div>
        <div class="slider-box">
          <div style="font-size: 12px; font-weight: 700; color: #fdf6e2; margin-bottom: 4px;">Sky Weather Mode</div>
          <div style="font-size: 11px; color: #f2c230;">Auto (Date-Seeded: ${weather})</div>
        </div>
        <div class="slider-box">
          <div style="font-size: 12px; font-weight: 700; color: #fdf6e2; margin-bottom: 4px;">Day/Night Lighting</div>
          <div style="font-size: 11px; color: #4f9bd1;">Auto (Clock-Synced: ${timeOfDay})</div>
        </div>
      </div>
    </div>
    `}
  </div>
</body>
</html>`;
}

async function run() {
  console.log('[Phase 2 Screenshots] Launching Edge browser...');
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const shots = [
    { name: 'world-desktop', mode: 'world', weather: 'clear', timeOfDay: 'day', width: 1280, height: 800 },
    { name: 'world-mobile', mode: 'world', weather: 'clear', timeOfDay: 'day', width: 390, height: 844 },
    { name: 'toolshed-desktop', mode: 'toolshed', weather: 'clear', timeOfDay: 'day', width: 1280, height: 800 },
    { name: 'toolshed-mobile', mode: 'toolshed', weather: 'clear', timeOfDay: 'day', width: 390, height: 844 },
    { name: 'night-desktop', mode: 'world', weather: 'fireflies', timeOfDay: 'night', width: 1280, height: 800 },
    { name: 'rain-desktop', mode: 'world', weather: 'rain', timeOfDay: 'dusk', width: 1280, height: 800 },
  ];

  for (const s of shots) {
    const server = http.createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(generatePhase2Html(s.mode, s.weather, s.timeOfDay));
    });

    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    const port = server.address().port;

    const page = await browser.newPage();
    await page.setViewport({ width: s.width, height: s.height, deviceScaleFactor: 2 });
    await page.goto(`http://127.0.0.1:${port}`, { waitUntil: 'load' });

    const filePath = path.join(OUT_DIR, `${s.name}.png`);
    await page.screenshot({ path: filePath, fullPage: false });
    console.log(`[Phase 2 Screenshots] Captured: ${s.name}.png (${s.width}x${s.height})`);

    await page.close();
    server.close();
  }

  await browser.close();
  console.log('[Phase 2 Screenshots] All 6 Phase 2 screenshots saved successfully to docs/redesign/phase-2/');
}

run().catch((err) => {
  console.error('[Phase 2 Screenshots] Error:', err);
  process.exit(1);
});
