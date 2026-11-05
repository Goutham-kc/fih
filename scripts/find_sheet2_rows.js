const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function scanSheet2() {
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const filePath2 = path.resolve('public/assets/raw_sheets/sheet_terrain_cliffs_props_and_shrines.jpg');
  const dataUrl2 = `data:image/jpeg;base64,${fs.readFileSync(filePath2).toString('base64')}`;

  const rowLum2 = await page.evaluate(async (url) => {
    const img = new Image();
    await new Promise(res => { img.onload = res; img.src = url; });
    const canvas = document.createElement('canvas');
    canvas.width = img.width; canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const data = ctx.getImageData(0, 0, img.width, img.height).data;
    const lum = [];
    for (let y = 0; y < img.height; y++) {
      let sum = 0;
      for (let x = 0; x < img.width; x++) {
        const idx = (y * img.width + x) * 4;
        const r = data[idx], g = data[idx+1], b = data[idx+2];
        if (r > 20 || g > 20 || b > 20) sum++;
      }
      lum.push(sum);
    }
    return lum;
  }, dataUrl2);

  const splits = [];
  for (let y = 10; y < 750; y++) {
    if (rowLum2[y] < 40 && rowLum2[y-1] >= 40) splits.push({ startGap: y });
    if (rowLum2[y] >= 40 && rowLum2[y-1] < 40) splits.push({ endGap: y });
  }

  console.log('Gaps in Sheet 2:', splits);
  await browser.close();
}

scanSheet2().catch(e => console.error(e));
