const puppeteer = require('puppeteer-core');

async function snapLawn() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });

  await page.goto('http://localhost:3000/phaser', { waitUntil: 'networkidle2' });
  await page.waitForFunction(() => !!window.__PHASER_GAME__, { timeout: 10000 });
  await new Promise(r => setTimeout(r, 1000));

  // Focus and move camera to Inn area
  await page.evaluate(() => {
    const game = window.__PHASER_GAME__;
    const scene = game.scene.getScene('VillageScene');
    scene.cameras.main.stopFollow();
    scene.cameras.main.centerOn(900, 1650);
  });
  await new Promise(r => setTimeout(r, 500));

  await page.screenshot({ path: 'C:/Users/gouth/.gemini/antigravity/brain/7a513e8a-e2f0-4f3b-8051-22e22a3a0e1e/verified_inn_lawn_clean.png' });
  console.log('Saved verified_inn_lawn_clean.png');

  // Also move camera to river bridge
  await page.evaluate(() => {
    const game = window.__PHASER_GAME__;
    const scene = game.scene.getScene('VillageScene');
    scene.cameras.main.centerOn(1600, 1050);
  });
  await new Promise(r => setTimeout(r, 500));

  await page.screenshot({ path: 'C:/Users/gouth/.gemini/antigravity/brain/7a513e8a-e2f0-4f3b-8051-22e22a3a0e1e/verified_river_clean.png' });
  console.log('Saved verified_river_clean.png');

  await browser.close();
}

snapLawn().catch(err => {
  console.error(err);
  process.exit(1);
});
