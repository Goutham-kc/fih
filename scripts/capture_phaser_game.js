const puppeteer = require('puppeteer-core');
const path = require('path');

async function capture() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--use-gl=swiftshader']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR STACK:', err.stack || err.message));

  console.log('Navigating to http://localhost:3000/phaser ...');
  await page.goto('http://localhost:3000/phaser', { waitUntil: 'networkidle2' });

  // Wait for canvas to be created by Phaser
  await page.waitForSelector('canvas', { timeout: 10000 });
  console.log('Phaser canvas rendered successfully.');

  // Let Phaser run for 1 second
  await new Promise(r => setTimeout(r, 1000));

  // Press 'D' to walk right towards General Store
  console.log('Simulating walking right (KeyD)...');
  await page.keyboard.down('KeyD');
  await new Promise(r => setTimeout(r, 800));
  await page.keyboard.up('KeyD');

  // Press 'W' to walk up the north path
  console.log('Simulating walking up (KeyW)...');
  await page.keyboard.down('KeyW');
  await new Promise(r => setTimeout(r, 800));
  await page.keyboard.up('KeyW');

  await new Promise(r => setTimeout(r, 400));

  const outPath = 'C:/Users/gouth/.gemini/antigravity/brain/7a513e8a-e2f0-4f3b-8051-22e22a3a0e1e/phaser_village_gameplay_moved.png';
  await page.screenshot({ path: outPath });
  console.log('Saved screenshot to:', outPath);

  await browser.close();
}

capture().catch(err => {
  console.error('Capture failed:', err);
  process.exit(1);
});
