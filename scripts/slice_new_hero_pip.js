const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function sliceHero() {
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const filePath = path.resolve('public/assets/raw_sheets/sheet_hero_character_animations.png');
  const dataUrl = `data:image/png;base64,${fs.readFileSync(filePath).toString('base64')}`;

  // Generate 64x128 pip_walk.png (4 frames x 16px wide, 4 dirs x 32px high)
  // Dir 0: South (row 1 of sheet)
  // Dir 1: North (row 9 of sheet)
  // Dir 2: West (row 5 flipped horizontally)
  // Dir 3: East (row 5 of sheet)
  const pipB64 = await page.evaluate(async (url) => {
    const img = new Image();
    await new Promise(r => { img.onload = r; img.src = url; });

    const canvas = document.createElement('canvas');
    canvas.width = 64; // 4 frames * 16px
    canvas.height = 128; // 4 dirs * 32px
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    // Pick 4 walk frames from row 1 (South), row 9 (North), row 5 (East/West)
    // Frame centers in sheet: cols 0, 1, 2, 3 (each spaced 54px, center at x = col*54 + 27)
    const dirs = [
      { dirIdx: 0, rowY: 64, flip: false },  // South
      { dirIdx: 1, rowY: 576, flip: false }, // North
      { dirIdx: 2, rowY: 320, flip: true },  // West
      { dirIdx: 3, rowY: 320, flip: false }, // East
    ];

    dirs.forEach(d => {
      const destY = d.dirIdx * 32;
      for (let f = 0; f < 4; f++) {
        const destX = f * 16;
        const srcX = f * 54 + 11; // center offset of character
        const srcY = d.rowY + 12; // center offset
        ctx.save();
        if (d.flip) {
          ctx.translate(destX + 16, destY);
          ctx.scale(-1, 1);
          ctx.drawImage(img, srcX, srcY, 32, 40, 0, 0, 16, 32);
        } else {
          ctx.drawImage(img, srcX, srcY, 32, 40, destX, destY, 16, 32);
        }
        ctx.restore();
      }
    });

    return canvas.toDataURL('image/png').split(',')[1];
  }, dataUrl);

  fs.writeFileSync('public/assets/characters/hero/pip_walk.png', Buffer.from(pipB64, 'base64'));
  console.log('Created new hero pip_walk.png from Sheet 5');

  // Generate bram_factor.png from action rows of Sheet 5 (holding scales / coins)
  const bramB64 = await page.evaluate(async (url) => {
    const img = new Image();
    await new Promise(r => { img.onload = r; img.src = url; });

    const canvas = document.createElement('canvas');
    canvas.width = 96; // 4 frames * 24px
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    // Action row 2 (South tool/item hold)
    for (let f = 0; f < 4; f++) {
      const srcX = f * 54 + 11;
      const srcY = 128 + 12;
      ctx.drawImage(img, srcX, srcY, 32, 40, f * 24 + 4, 0, 16, 32);
    }

    return canvas.toDataURL('image/png').split(',')[1];
  }, dataUrl);

  fs.writeFileSync('public/assets/characters/hero/bram_factor.png', Buffer.from(bramB64, 'base64'));
  console.log('Created new bram_factor.png from Sheet 5');

  await browser.close();
}

sliceHero().catch(e => console.error(e));
