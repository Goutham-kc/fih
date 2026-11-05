const puppeteer = require('puppeteer-core');

async function snap() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  console.log('Navigating to http://localhost:3000?fullMap=true...');
  await page.goto('http://localhost:3000?fullMap=true', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  await page.screenshot({ path: 'C:/Users/gouth/.gemini/antigravity/brain/7a513e8a-e2f0-4f3b-8051-22e22a3a0e1e/rm_town_fullmap_preview.png' });
  console.log('Saved rm_town_fullmap_preview.png');

  console.log('Navigating to http://localhost:3000 (normal 2.5x view)...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  await page.screenshot({ path: 'C:/Users/gouth/.gemini/antigravity/brain/7a513e8a-e2f0-4f3b-8051-22e22a3a0e1e/rm_town_normal_preview.png' });
  console.log('Saved rm_town_normal_preview.png');

  await browser.close();
}

snap().catch(console.error);
