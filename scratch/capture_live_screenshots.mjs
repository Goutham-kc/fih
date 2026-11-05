import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const OUT_DIR = path.resolve('docs/redesign/overworld-navigation');
const ARTIFACT_DIR = path.resolve('C:\\Users\\gouth\\.gemini\\antigravity\\brain\\7a513e8a-e2f0-4f3b-8051-22e22a3a0e1e\\overworld-navigation');

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
if (!fs.existsSync(ARTIFACT_DIR)) fs.mkdirSync(ARTIFACT_DIR, { recursive: true });

async function saveBoth(page, filename) {
  const p1 = path.join(OUT_DIR, filename);
  const p2 = path.join(ARTIFACT_DIR, filename);
  await page.screenshot({ path: p1 });
  fs.copyFileSync(p1, p2);
  console.log(`Captured: ${filename}`);
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log('Launching browser to capture live Next.js screenshots...');
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,800'],
  });

  const page = await browser.newPage();

  // 1. Full 64x64 Forest Village Map Overview
  console.log('1. Capturing Full 64x64 Overworld Overview...');
  await page.setViewport({ width: 1024, height: 1024 });
  await page.goto('http://localhost:3000/?fullMap=true', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await sleep(2500);
  await saveBoth(page, 'overworld-forest-village-64x64-desktop.png');

  // Reset to desktop standard viewport 1280x800
  await page.setViewport({ width: 1280, height: 800 });

  // 2. Initial Welcome Screen (Central Plaza, Welcome Dialogue, Controls HUD)
  console.log('2. Capturing Initial Welcome Overworld...');
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await sleep(1500);
  await saveBoth(page, 'overworld-welcome-desktop.png');
  await saveBoth(page, 'overworld-map-desktop.png');

  // 3. The Notice Board (Central Plaza, Stone Fountain, Notice Board, Cedar Benches)
  console.log('3. Capturing Central Plaza & Notice Board...');
  await page.goto('http://localhost:3000/?tab=deadlines', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await sleep(1500);
  await saveBoth(page, 'overworld-notice-board-custom-desktop.png');

  // 4. The Farmstead (Pip's Cabin, Garden, Fence, Sunflowers)
  console.log('4. Capturing The Farmstead...');
  await page.goto('http://localhost:3000/?tab=todos', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await sleep(1500);
  await saveBoth(page, 'overworld-farmstead-custom-house-desktop.png');

  // 5. The Ledger Bank (Bram, Courtyard, Topiary Planters)
  console.log('5. Capturing The Ledger Bank...');
  await page.goto('http://localhost:3000/?tab=debts', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await sleep(1500);
  await saveBoth(page, 'overworld-bank-custom-desktop.png');
  await saveBoth(page, 'overworld-entered-ledger-desktop.png');

  // 6. The Bell Tower (Hoot, Spire, Weather Vane, Circular Garden)
  console.log('6. Capturing The Bell Tower...');
  await page.goto('http://localhost:3000/?tab=reminders', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await sleep(1500);
  await saveBoth(page, 'overworld-bell-tower-custom-desktop.png');

  // 7. The Festival Grounds (Clover, Circular Pavilion, Stage, Stalls)
  console.log('7. Capturing The Festival Grounds...');
  await page.goto('http://localhost:3000/?tab=dates', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await sleep(1500);
  await saveBoth(page, 'overworld-festival-custom-desktop.png');

  // 8. The Moonlight Cinema (Juniper, Screen, Moon Arch, Benches)
  console.log('8. Capturing The Moonlight Cinema...');
  await page.goto('http://localhost:3000/?tab=watchlist', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await sleep(1500);
  await saveBoth(page, 'overworld-cinema-custom-desktop.png');

  // 9. The Archive Cellar (Moss, Stone Steps, Mossy Rocks, Mushrooms)
  console.log('9. Capturing The Archive Cellar...');
  await page.goto('http://localhost:3000/?tab=audit', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await sleep(1500);
  await saveBoth(page, 'overworld-archive-cellar-custom-desktop.png');

  // 10. Desktop Panel Only Mode
  console.log('10. Capturing Desktop Panel Only Mode...');
  await page.goto('http://localhost:3000/?tab=todos', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await sleep(1000);
  const hudButtons = await page.$$('button');
  for (const btn of hudButtons) {
    const text = await page.evaluate((el) => el.textContent, btn);
    if (text && text.includes('Panel Only')) {
      await btn.click();
      await sleep(1000);
      break;
    }
  }
  await saveBoth(page, 'overworld-panel-only-desktop.png');

  // 11. Mobile Viewport (Panel Only Mode)
  console.log('11. Capturing Mobile Viewport...');
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await sleep(1500);
  await saveBoth(page, 'overworld-map-mobile.png');

  // 12. Walking Proximity Capture
  console.log('12. Capturing Walking Proximity...');
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await sleep(1200);
  await page.keyboard.press('KeyW');
  await sleep(400);
  await page.keyboard.press('KeyW');
  await sleep(400);
  await saveBoth(page, 'overworld-walk-proximity-desktop.png');

  await browser.close();
  console.log('All live screenshots captured successfully!');
}

main().catch(console.error);
