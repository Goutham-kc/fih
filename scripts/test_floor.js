const fs = require('fs');
const sharp = require('sharp');

async function test() {
  const tmj = JSON.parse(fs.readFileSync('public/village_assets/tiled_map/rm_town.tmj', 'utf8'));

  const tsFile = 'public/village_assets/environment/tilesets/generic/spr_main_exteriors_spring.png';
  const meta = await sharp(tsFile).metadata();
  const raw = await sharp(tsFile).ensureAlpha().raw().toBuffer();

  console.log(`Loaded spr_main_exteriors_spring: ${meta.width}x${meta.height}`);

  const pixelW = tmj.width * 8; // 2128
  const pixelH = tmj.height * 8; // 2928
  const canvasBuffer = Buffer.alloc(pixelW * pixelH * 4, 0);

  // Fill green #8dc653
  for (let i = 0; i < pixelW * pixelH; i++) {
    const idx = i * 4;
    canvasBuffer[idx] = 0x8d;
    canvasBuffer[idx + 1] = 0xc6;
    canvasBuffer[idx + 2] = 0x53;
    canvasBuffer[idx + 3] = 255;
  }

  // Find Level_0_Floor_A
  const level0 = tmj.layers.find(l => l.name === 'Level_0');
  const floorA = level0.layers.find(l => l.name === 'Level_0_Floor_A');

  let drawn = 0;
  for (let idx = 0; idx < floorA.data.length; idx++) {
    const rawGid = floorA.data[idx];
    if (rawGid === 0) continue;
    const cleanGid = rawGid & 0x1fffffff;
    if (cleanGid >= 2793 && cleanGid < 2793 + 4096) {
      const localId = cleanGid - 2793;
      const col = idx % tmj.width;
      const row = Math.floor(idx / tmj.width);
      const destX = col * 8;
      const destY = row * 8;

      const srcCol = localId % 64;
      const srcRow = Math.floor(localId / 64);
      const srcX = srcCol * 16;
      const srcY = srcRow * 16;

      for (let py = 0; py < 16; py++) {
        const ty = destY + py;
        if (ty < 0 || ty >= pixelH) continue;
        for (let px = 0; px < 16; px++) {
          const tx = destX + px;
          if (tx < 0 || tx >= pixelW) continue;
          const sIdx = ((srcY + py) * meta.width + (srcX + px)) * 4;
          const sa = raw[sIdx + 3];
          if (sa === 0) continue;
          const dIdx = (ty * pixelW + tx) * 4;
          canvasBuffer[dIdx] = raw[sIdx];
          canvasBuffer[dIdx + 1] = raw[sIdx + 1];
          canvasBuffer[dIdx + 2] = raw[sIdx + 2];
          canvasBuffer[dIdx + 3] = 255;
        }
      }
      drawn++;
    }
  }

  console.log(`Drew ${drawn} tiles on Level_0_Floor_A`);

  await sharp(canvasBuffer, { raw: { width: pixelW, height: pixelH, channels: 4 } })
    .png()
    .toFile('public/village_assets/test_floor_a.png');

  const stat = fs.statSync('public/village_assets/test_floor_a.png');
  console.log(`Saved test_floor_a.png: ${Math.round(stat.size / 1024)} KB`);
}

test().catch(console.error);
