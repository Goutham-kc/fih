const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function scan() {
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  const sheets = [
    { name: 'buildings', file: 'sheet_village_structures_and_buildings.jpg', isBlackBg: true },
    { name: 'tiles_props_shrines', file: 'sheet_terrain_cliffs_props_and_shrines.jpg', isBlackBg: true },
    { name: 'autotiles', file: 'sheet_16x16_autotiles_and_cliffs.png', isBlackBg: false },
    { name: 'nature', file: 'sheet_16bit_nature_trees_and_foliage.png', isBlackBg: false },
    { name: 'hero', file: 'sheet_hero_character_animations.png', isBlackBg: false }
  ];

  for (const s of sheets) {
    const filePath = path.resolve('public/assets/raw_sheets', s.file);
    const dataUrl = `data:image/${s.file.endsWith('.png') ? 'png' : 'jpeg'};base64,${fs.readFileSync(filePath).toString('base64')}`;

    const info = await page.evaluate(async (url, isBlackBg) => {
      const img = new Image();
      await new Promise(res => { img.onload = res; img.src = url; });
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const id = ctx.getImageData(0, 0, img.width, img.height);
      const data = id.data;
      const w = img.width, h = img.height;

      // Connected component analysis with bounding box clustering
      // First create a binary grid
      const grid = new Uint8Array(w * h);
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const idx = (y * w + x) * 4;
          const a = data[idx + 3];
          const r = data[idx], g = data[idx + 1], b = data[idx + 2];
          if (isBlackBg) {
            if (a > 10 && (r > 18 || g > 18 || b > 18)) {
              grid[y * w + x] = 1;
            }
          } else {
            if (a > 20) {
              grid[y * w + x] = 1;
            }
          }
        }
      }

      // Find bounding boxes by row bands
      const rowCounts = new Array(h).fill(0);
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          if (grid[y * w + x]) rowCounts[y]++;
        }
      }

      const bands = [];
      let inBand = false;
      let start = 0;
      let gap = 0;
      for (let y = 0; y < h; y++) {
        if (rowCounts[y] > 5) {
          if (!inBand) { inBand = true; start = y; }
          gap = 0;
        } else {
          if (inBand) {
            gap++;
            if (gap >= 6 || y === h - 1) {
              bands.push({ y1: start, y2: y - gap });
              inBand = false;
            }
          }
        }
      }
      if (inBand) bands.push({ y1: start, y2: h - 1 });

      // Inside each band, find columns
      const rowItems = [];
      for (let bi = 0; bi < bands.length; bi++) {
        const band = bands[bi];
        const colCounts = new Array(w).fill(0);
        for (let y = band.y1; y <= band.y2; y++) {
          for (let x = 0; x < w; x++) {
            if (grid[y * w + x]) colCounts[x]++;
          }
        }
        const cols = [];
        let inCol = false, colStart = 0, colGap = 0;
        for (let x = 0; x < w; x++) {
          if (colCounts[x] > 3) {
            if (!inCol) { inCol = true; colStart = x; }
            colGap = 0;
          } else {
            if (inCol) {
              colGap++;
              if (colGap >= 4 || x === w - 1) {
                cols.push({ x1: colStart, x2: x - colGap });
                inCol = false;
              }
            }
          }
        }
        if (inCol) cols.push({ x1: colStart, x2: w - 1 });

        // Refine bounding box for each item
        const items = cols.map(c => {
          let minX = w, maxX = 0, minY = h, maxY = 0;
          for (let y = band.y1; y <= band.y2; y++) {
            for (let x = c.x1; x <= c.x2; x++) {
              if (grid[y * w + x]) {
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
              }
            }
          }
          return {
            x: minX,
            y: minY,
            w: maxX >= minX ? maxX - minX + 1 : 0,
            h: maxY >= minY ? maxY - minY + 1 : 0
          };
        }).filter(item => item.w >= 8 && item.h >= 8);

        rowItems.push({ band, items });
      }

      return { w, h, rowItems };
    }, dataUrl, s.isBlackBg);

    console.log(`\n================ ${s.name} (${info.w}x${info.h}) ================`);
    info.rowItems.forEach((r, idx) => {
      console.log(`Row ${idx + 1} (Y: ${r.band.y1}..${r.band.y2}): ${r.items.length} items`);
      r.items.forEach((item, i) => {
        console.log(`  Item ${i + 1}: x=${item.x}, y=${item.y}, w=${item.w}, h=${item.h}`);
      });
    });
  }

  await browser.close();
}

scan().catch(e => console.error(e));
