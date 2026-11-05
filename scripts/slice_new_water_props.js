const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function sliceWaterProps() {
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const filePath = path.resolve('public/assets/raw_sheets/sheet_terrain_cliffs_props_and_shrines.jpg');
  const dataUrl = `data:image/jpeg;base64,${fs.readFileSync(filePath).toString('base64')}`;

  const propsB64 = await page.evaluate(async (url) => {
    const img = new Image();
    await new Promise(r => { img.onload = r; img.src = url; });

    // 1. Water caustics strip (4 frames of 16x16 = 64x16) from ocean tile (x: 552..648, y: 24..118)
    const cCanvas = document.createElement('canvas');
    cCanvas.width = 64; cCanvas.height = 16;
    const cCtx = cCanvas.getContext('2d');
    for (let f = 0; f < 4; f++) {
      cCtx.drawImage(img, 560 + f * 20, 32 + (f % 2) * 20, 20, 20, f * 16, 0, 16, 16);
    }
    const caustics = cCanvas.toDataURL('image/png').split(',')[1];

    // 2. Lilypad plain & lilypad flower from marsh pool (x: 661..755, y: 25..118)
    const lpCanvas = document.createElement('canvas');
    lpCanvas.width = 18; lpCanvas.height = 18;
    const lpCtx = lpCanvas.getContext('2d');
    lpCtx.drawImage(img, 680, 48, 22, 22, 0, 0, 18, 18);
    // make black transparent
    const id1 = lpCtx.getImageData(0, 0, 18, 18);
    for (let i = 0; i < id1.data.length; i += 4) {
      if (id1.data[i] < 30 && id1.data[i+1] < 50 && id1.data[i+2] < 50) id1.data[i+3] = 0;
    }
    lpCtx.putImageData(id1, 0, 0);
    const lilypad = lpCanvas.toDataURL('image/png').split(',')[1];

    const lpfCanvas = document.createElement('canvas');
    lpfCanvas.width = 18; lpfCanvas.height = 18;
    const lpfCtx = lpfCanvas.getContext('2d');
    lpfCtx.drawImage(img, 705, 80, 22, 22, 0, 0, 18, 18);
    const id2 = lpfCtx.getImageData(0, 0, 18, 18);
    for (let i = 0; i < id2.data.length; i += 4) {
      if (id2.data[i] < 30 && id2.data[i+1] < 50 && id2.data[i+2] < 50) id2.data[i+3] = 0;
    }
    lpfCtx.putImageData(id2, 0, 0);
    const lilypadFlower = lpfCanvas.toDataURL('image/png').split(',')[1];

    return { caustics, lilypad, lilypadFlower };
  }, dataUrl);

  fs.writeFileSync('public/assets/structures/props/water_caustics.png', Buffer.from(propsB64.caustics, 'base64'));
  fs.writeFileSync('public/assets/structures/props/lilypad.png', Buffer.from(propsB64.lilypad, 'base64'));
  fs.writeFileSync('public/assets/structures/props/lilypad_flower.png', Buffer.from(propsB64.lilypadFlower, 'base64'));
  console.log('Created new water props from Sheet 2!');

  await browser.close();
}

sliceWaterProps().catch(e => console.error(e));
