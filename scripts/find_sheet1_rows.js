const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function scanGrid() {
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // Test sheet 1 with 4 visual bands
  const filePath1 = path.resolve('public/assets/raw_sheets/sheet_village_structures_and_buildings.jpg');
  const dataUrl1 = `data:image/jpeg;base64,${fs.readFileSync(filePath1).toString('base64')}`;

  const rowBands1 = await page.evaluate(async (url) => {
    const img = new Image();
    await new Promise(res => { img.onload = res; img.src = url; });
    const canvas = document.createElement('canvas');
    canvas.width = img.width; canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const data = ctx.getImageData(0, 0, img.width, img.height).data;
    
    // We can sample vertical slices to find horizontal divisions
    // Let's print row brightness
    const rowLum = [];
    for (let y = 0; y < img.height; y++) {
      let sum = 0;
      for (let x = 0; x < img.width; x++) {
        const idx = (y * img.width + x) * 4;
        const r = data[idx], g = data[idx+1], b = data[idx+2];
        if (r > 20 || g > 20 || b > 20) sum++;
      }
      rowLum.push(sum);
    }
    return rowLum;
  }, dataUrl1);

  // Find troughs in rowLum to split rows
  const splits = [];
  for (let y = 10; y < 750; y++) {
    if (rowBands1[y] < 50 && rowBands1[y-1] >= 50) splits.push({ startGap: y });
    if (rowBands1[y] >= 50 && rowBands1[y-1] < 50) splits.push({ endGap: y });
  }

  console.log('Gaps in Sheet 1:', splits);
  await browser.close();
}

scanGrid().catch(e => console.error(e));
