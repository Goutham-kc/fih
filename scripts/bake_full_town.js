const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function main() {
  console.log('=== STARTING COMPLETE TOWN BAKE ===');
  const tmj = JSON.parse(fs.readFileSync('public/village_assets/tiled_map/rm_town.tmj', 'utf8'));

  const mapW = tmj.width; // 266
  const mapH = tmj.height; // 366
  const pixelW = mapW * 8; // 2128
  const pixelH = mapH * 8; // 2928

  // Target canvas: 2128 x 2928 RGBA
  const canvasBuffer = Buffer.alloc(pixelW * pixelH * 4, 0);

  // Lush spring grass background fill #8dc653
  for (let i = 0; i < pixelW * pixelH; i++) {
    const idx = i * 4;
    canvasBuffer[idx] = 0x8d;
    canvasBuffer[idx + 1] = 0xc6;
    canvasBuffer[idx + 2] = 0x53;
    canvasBuffer[idx + 3] = 255;
  }

  // Load standard tilesets
  const tilesetConfigs = [
    {
      firstgid: 1721,
      tilecount: 48,
      cols: 8,
      name: 'grass_auto',
      file: 'public/village_assets/environment/tilesets/farm/spr_farm_ground_grass_spring.png'
    },
    {
      firstgid: 1769,
      tilecount: 1024,
      cols: 32,
      name: 'shadows',
      file: 'public/village_assets/environment/tilesets/generic/spr_main_exteriors_shadow_spring.png'
    },
    {
      firstgid: 2793,
      tilecount: 4096,
      cols: 64,
      name: 'main_exteriors',
      file: 'public/village_assets/environment/tilesets/generic/spr_main_exteriors_spring.png'
    },
    {
      firstgid: 6889,
      tilecount: 3500,
      cols: 21,
      name: 'water',
      file: 'public/village_assets/environment/tilesets/generic/spr_main_exteriors_water_spring.png'
    },
    {
      firstgid: 28923,
      tilecount: 48,
      cols: 8,
      name: 'soil',
      file: 'public/village_assets/environment/tilesets/farm/spr_farm_ground_soil_spring_plow.png'
    },
    {
      firstgid: 28971,
      tilecount: 48,
      cols: 8,
      name: 'soil_wet',
      file: 'public/village_assets/environment/tilesets/farm/spr_farm_ground_soil_spring_watered.png'
    }
  ];

  for (const tc of tilesetConfigs) {
    if (fs.existsSync(tc.file)) {
      const meta = await sharp(tc.file).metadata();
      tc.w = meta.width;
      tc.h = meta.height;
      tc.raw = await sharp(tc.file).ensureAlpha().raw().toBuffer();
      console.log(`Loaded tileset: ${tc.name} (${tc.w}x${tc.h})`);
    } else {
      console.warn(`Missing tileset file: ${tc.file}`);
    }
  }

  function getTilesetForGid(cleanGid) {
    for (const tc of tilesetConfigs) {
      if (cleanGid >= tc.firstgid && cleanGid < tc.firstgid + tc.tilecount && tc.raw) {
        return tc;
      }
    }
    return null;
  }

  function blitTile(ts, localId, destX, destY) {
    const srcCol = localId % ts.cols;
    const srcRow = Math.floor(localId / ts.cols);
    const srcX = srcCol * 16;
    const srcY = srcRow * 16;

    if (srcY + 16 > ts.h || srcX + 16 > ts.w) return;

    for (let py = 0; py < 16; py++) {
      const ty = destY + py;
      if (ty < 0 || ty >= pixelH) continue;

      for (let px = 0; px < 16; px++) {
        const tx = destX + px;
        if (tx < 0 || tx >= pixelW) continue;

        const sIdx = ((srcY + py) * ts.w + (srcX + px)) * 4;
        const sa = ts.raw[sIdx + 3];
        if (sa === 0) continue;

        const dIdx = (ty * pixelW + tx) * 4;
        if (sa === 255) {
          canvasBuffer[dIdx] = ts.raw[sIdx];
          canvasBuffer[dIdx + 1] = ts.raw[sIdx + 1];
          canvasBuffer[dIdx + 2] = ts.raw[sIdx + 2];
          canvasBuffer[dIdx + 3] = 255;
        } else {
          const a = sa / 255;
          const inv = 1 - a;
          canvasBuffer[dIdx] = Math.round(ts.raw[sIdx] * a + canvasBuffer[dIdx] * inv);
          canvasBuffer[dIdx + 1] = Math.round(ts.raw[sIdx + 1] * a + canvasBuffer[dIdx + 1] * inv);
          canvasBuffer[dIdx + 2] = Math.round(ts.raw[sIdx + 2] * a + canvasBuffer[dIdx + 2] * inv);
          canvasBuffer[dIdx + 3] = Math.max(canvasBuffer[dIdx + 3], sa);
        }
      }
    }
  }

  // Index all image files for __gm_import
  const allImages = new Map();
  function indexImages(dir) {
    for (const f of fs.readdirSync(dir)) {
      const full = path.join(dir, f);
      if (fs.statSync(full).isDirectory()) indexImages(full);
      else if (f.endsWith('.png')) allImages.set(f.toLowerCase(), full);
    }
  }
  indexImages('public/village_assets');

  // Parse __gm_import.tsx
  const gmXml = fs.readFileSync('public/village_assets/tiled_map/__gm_import.tsx', 'utf8');
  const gmTiles = new Map();
  const tileRegex = /<tile id="(\d+)"(?:[^>]*?width="(\d+)"[^>]*?height="(\d+)")?[^>]*?>([\s\S]*?)<\/tile>/g;
  let m;
  while ((m = tileRegex.exec(gmXml)) !== null) {
    const tileId = parseInt(m[1], 10);
    const body = m[4];
    const imgMatch = body.match(/<image\s+source="([^"]+)"/);
    if (imgMatch) {
      const baseName = path.basename(imgMatch[1]).toLowerCase();
      const resolved = allImages.get(baseName);
      if (resolved) {
        gmTiles.set(tileId, { file: resolved, baseName });
      }
    }
  }
  console.log(`Resolved ${gmTiles.size} building/prop sprite textures`);

  const loadedObjs = new Map();
  async function getDecodedObj(file) {
    if (loadedObjs.has(file)) return loadedObjs.get(file);
    try {
      const meta = await sharp(file).metadata();
      const raw = await sharp(file).ensureAlpha().raw().toBuffer();
      const item = { raw, w: meta.width, h: meta.height };
      loadedObjs.set(file, item);
      return item;
    } catch (e) {
      return null;
    }
  }

  function blitImage(img, destX, destY) {
    for (let py = 0; py < img.h; py++) {
      const ty = destY + py;
      if (ty < 0 || ty >= pixelH) continue;

      for (let px = 0; px < img.w; px++) {
        const tx = destX + px;
        if (tx < 0 || tx >= pixelW) continue;

        const sIdx = (py * img.w + px) * 4;
        const sa = img.raw[sIdx + 3];
        if (sa === 0) continue;

        const dIdx = (ty * pixelW + tx) * 4;
        if (sa === 255) {
          canvasBuffer[dIdx] = img.raw[sIdx];
          canvasBuffer[dIdx + 1] = img.raw[sIdx + 1];
          canvasBuffer[dIdx + 2] = img.raw[sIdx + 2];
          canvasBuffer[dIdx + 3] = 255;
        } else {
          const a = sa / 255;
          const inv = 1 - a;
          canvasBuffer[dIdx] = Math.round(img.raw[sIdx] * a + canvasBuffer[dIdx] * inv);
          canvasBuffer[dIdx + 1] = Math.round(img.raw[sIdx + 1] * a + canvasBuffer[dIdx + 1] * inv);
          canvasBuffer[dIdx + 2] = Math.round(img.raw[sIdx + 2] * a + canvasBuffer[dIdx + 2] * inv);
          canvasBuffer[dIdx + 3] = Math.max(canvasBuffer[dIdx + 3], sa);
        }
      }
    }
  }

  // Layer rendering
  async function renderLayer(l) {
    if (l.visible === false) return;
    const name = l.name || '';

    // Ignore meta / tool layers
    if (name.startsWith('Tiles_') || name.startsWith('Trellis') || name === 'FootstepTiles' || name === 'Pathfinding' || name === 'Meta' || name === 'Lighting' || name === 'MapHubs') return;
    // Ignore Broken layers (we use Fixed)
    if (name.includes('Broken')) return;
    // Ignore other seasons
    if (name.includes('Summer') || name.includes('Fall') || name.includes('Winter')) return;

    if (l.type === 'tilelayer' && l.data) {
      let count = 0;
      for (let i = 0; i < l.data.length; i++) {
        const rawGid = l.data[i];
        if (rawGid === 0) continue;
        const cleanGid = rawGid & 0x1fffffff;
        const ts = getTilesetForGid(cleanGid);
        if (!ts) continue;

        const localId = cleanGid - ts.firstgid;
        const col = i % mapW;
        const row = Math.floor(i / mapW);
        const destX = col * 8;
        const destY = row * 8;

        blitTile(ts, localId, destX, destY);
        count++;
      }
      if (count > 0) console.log(`Tilelayer: ${name} (${count} tiles)`);
    }

    if (l.type === 'objectgroup' && l.objects) {
      const sorted = [...l.objects].sort((a, b) => (a.y || 0) - (b.y || 0));
      for (const obj of sorted) {
        if (!obj.gid) continue;
        const cleanGid = obj.gid & 0x1fffffff;
        if (cleanGid < 1504) {
          const tid = cleanGid - 1;
          const info = gmTiles.get(tid);
          if (info) {
            const img = await getDecodedObj(info.file);
            if (img) {
              const destX = Math.round(obj.x);
              const destY = Math.round(obj.y - img.h);
              blitImage(img, destX, destY);
            }
          }
        }
      }
    }

    if (l.layers) {
      for (const sub of l.layers) {
        await renderLayer(sub);
      }
    }
  }

  console.log('Rendering layers in order...');
  for (const layer of tmj.layers) {
    await renderLayer(layer);
  }

  console.log('Saving high-resolution map to public/village_assets/rm_town_baked.png...');
  await sharp(canvasBuffer, { raw: { width: pixelW, height: pixelH, channels: 4 } })
    .png({ compressionLevel: 6 })
    .toFile('public/village_assets/rm_town_baked.png');

  // Also copy to artifact directory for preview
  await sharp(canvasBuffer, { raw: { width: pixelW, height: pixelH, channels: 4 } })
    .png({ compressionLevel: 6 })
    .toFile('C:/Users/gouth/.gemini/antigravity/brain/7a513e8a-e2f0-4f3b-8051-22e22a3a0e1e/rm_town_baked.png');

  const stat = fs.statSync('public/village_assets/rm_town_baked.png');
  console.log(`Complete! File size: ${Math.round(stat.size / 1024)} KB (${(stat.size / (1024 * 1024)).toFixed(2)} MB)`);
}

main().catch(console.error);
