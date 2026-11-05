const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function bake() {
  console.log('--- BAKING RM_TOWN.TMJ ---');
  const tmj = JSON.parse(fs.readFileSync('public/village_assets/tiled_map/rm_town.tmj', 'utf8'));

  const mapW = tmj.width; // 266
  const mapH = tmj.height; // 366
  const pixelW = mapW * 8; // 2128
  const pixelH = mapH * 8; // 2928

  console.log(`Map: ${mapW}x${mapH} tiles -> ${pixelW}x${pixelH} px`);

  // Index all image files in village_assets
  const fileMap = new Map();
  function indexDir(dir) {
    for (const f of fs.readdirSync(dir)) {
      const full = path.join(dir, f);
      if (fs.statSync(full).isDirectory()) indexDir(full);
      else if (f.endsWith('.png')) fileMap.set(f.toLowerCase(), full);
    }
  }
  indexDir('public/village_assets');

  // Load and decode tileset image sheets
  const tilesetDefs = [
    {
      firstgid: 1721,
      name: 'grass_auto',
      file: 'public/village_assets/environment/tilesets/farm/spr_farm_ground_grass_spring.png',
      tileW: 16, tileH: 16, cols: 8, offX: 0, offY: 8
    },
    {
      firstgid: 1769,
      name: 'shadows',
      file: 'public/village_assets/environment/tilesets/generic/spr_main_exteriors_shadow_spring.png',
      tileW: 16, tileH: 16, cols: 32, offX: 0, offY: 8
    },
    {
      firstgid: 2793,
      name: 'main_exteriors',
      file: 'public/village_assets/environment/tilesets/generic/spr_main_exteriors_spring.png',
      tileW: 16, tileH: 16, cols: 64, offX: 0, offY: 8
    },
    {
      firstgid: 6889,
      name: 'water',
      file: 'public/village_assets/environment/tilesets/generic/spr_main_exteriors_water_spring.png',
      tileW: 16, tileH: 16, cols: 21, offX: 0, offY: 8
    },
    {
      firstgid: 28923,
      name: 'soil',
      file: 'public/village_assets/environment/tilesets/farm/spr_farm_ground_soil_spring_plow.png',
      tileW: 16, tileH: 16, cols: 8, offX: 0, offY: 8
    },
    {
      firstgid: 28971,
      name: 'soil_wet',
      file: 'public/village_assets/environment/tilesets/farm/spr_farm_ground_soil_spring_watered.png',
      tileW: 16, tileH: 16, cols: 8, offX: 0, offY: 8
    }
  ];

  for (const def of tilesetDefs) {
    if (fs.existsSync(def.file)) {
      const meta = await sharp(def.file).metadata();
      def.imgW = meta.width;
      def.imgH = meta.height;
      def.raw = await sharp(def.file).ensureAlpha().raw().toBuffer();
      console.log(`Loaded tileset: ${def.name} (${def.imgW}x${def.imgH})`);
    }
  }

  // Parse __gm_import.tsx for objects
  const gmXml = fs.readFileSync('public/village_assets/tiled_map/__gm_import.tsx', 'utf8');
  const gmTiles = new Map();
  const tileRegex = /<tile id="(\d+)"(?:[^>]*?width="(\d+)"[^>]*?height="(\d+)")?[^>]*?>([\s\S]*?)<\/tile>/g;
  let m;
  while ((m = tileRegex.exec(gmXml)) !== null) {
    const tileId = parseInt(m[1], 10);
    const body = m[4];
    const imgMatch = body.match(/<image\s+source="([^"]+)"(?:\s+width="(\d+)"\s+height="(\d+)")?/);
    if (imgMatch) {
      const baseName = path.basename(imgMatch[1]).toLowerCase();
      const resolved = fileMap.get(baseName);
      gmTiles.set(tileId, { file: resolved, baseName });
    }
  }

  // Pre-decode frequently used building images
  const loadedObjImages = new Map();
  async function getObjImage(filePath) {
    if (!filePath || !fs.existsSync(filePath)) return null;
    if (loadedObjImages.has(filePath)) return loadedObjImages.get(filePath);
    try {
      const meta = await sharp(filePath).metadata();
      const raw = await sharp(filePath).ensureAlpha().raw().toBuffer();
      const data = { raw, w: meta.width, h: meta.height };
      loadedObjImages.set(filePath, data);
      return data;
    } catch (e) {
      return null;
    }
  }

  // Target canvas RGBA buffer (2128 x 2928)
  const canvasBuffer = Buffer.alloc(pixelW * pixelH * 4, 0);

  // Background spring meadow fill: #8dc653
  for (let i = 0; i < pixelW * pixelH; i++) {
    const idx = i * 4;
    canvasBuffer[idx] = 0x8d;
    canvasBuffer[idx + 1] = 0xc6;
    canvasBuffer[idx + 2] = 0x53;
    canvasBuffer[idx + 3] = 255;
  }

  function getTileset(cleanGid) {
    for (let i = tilesetDefs.length - 1; i >= 0; i--) {
      if (cleanGid >= tilesetDefs[i].firstgid && tilesetDefs[i].raw) {
        return tilesetDefs[i];
      }
    }
    return null;
  }

  function blitTile(ts, localId, destX, destY) {
    const srcCol = localId % ts.cols;
    const srcRow = Math.floor(localId / ts.cols);
    const srcX = srcCol * ts.tileW;
    const srcY = srcRow * ts.tileH;

    for (let py = 0; py < ts.tileH; py++) {
      const targetY = destY + py;
      if (targetY < 0 || targetY >= pixelH) continue;

      for (let px = 0; px < ts.tileW; px++) {
        const targetX = destX + px;
        if (targetX < 0 || targetX >= pixelW) continue;

        const srcIdx = ((srcY + py) * ts.imgW + (srcX + px)) * 4;
        const sa = ts.raw[srcIdx + 3];
        if (sa === 0) continue;

        const destIdx = (targetY * pixelW + targetX) * 4;
        if (sa === 255) {
          canvasBuffer[destIdx] = ts.raw[srcIdx];
          canvasBuffer[destIdx + 1] = ts.raw[srcIdx + 1];
          canvasBuffer[destIdx + 2] = ts.raw[srcIdx + 2];
          canvasBuffer[destIdx + 3] = 255;
        } else {
          const alpha = sa / 255;
          const inv = 1 - alpha;
          canvasBuffer[destIdx] = Math.round(ts.raw[srcIdx] * alpha + canvasBuffer[destIdx] * inv);
          canvasBuffer[destIdx + 1] = Math.round(ts.raw[srcIdx + 1] * alpha + canvasBuffer[destIdx + 1] * inv);
          canvasBuffer[destIdx + 2] = Math.round(ts.raw[srcIdx + 2] * alpha + canvasBuffer[destIdx + 2] * inv);
          canvasBuffer[destIdx + 3] = Math.max(canvasBuffer[destIdx + 3], sa);
        }
      }
    }
  }

  function blitImage(img, destX, destY) {
    for (let py = 0; py < img.h; py++) {
      const targetY = destY + py;
      if (targetY < 0 || targetY >= pixelH) continue;

      for (let px = 0; px < img.w; px++) {
        const targetX = destX + px;
        if (targetX < 0 || targetX >= pixelW) continue;

        const srcIdx = (py * img.w + px) * 4;
        const sa = img.raw[srcIdx + 3];
        if (sa === 0) continue;

        const destIdx = (targetY * pixelW + targetX) * 4;
        if (sa === 255) {
          canvasBuffer[destIdx] = img.raw[srcIdx];
          canvasBuffer[destIdx + 1] = img.raw[srcIdx + 1];
          canvasBuffer[destIdx + 2] = img.raw[srcIdx + 2];
          canvasBuffer[destIdx + 3] = 255;
        } else {
          const alpha = sa / 255;
          const inv = 1 - alpha;
          canvasBuffer[destIdx] = Math.round(img.raw[srcIdx] * alpha + canvasBuffer[destIdx] * inv);
          canvasBuffer[destIdx + 1] = Math.round(img.raw[srcIdx + 1] * alpha + canvasBuffer[destIdx + 1] * inv);
          canvasBuffer[destIdx + 2] = Math.round(img.raw[srcIdx + 2] * alpha + canvasBuffer[destIdx + 2] * inv);
          canvasBuffer[destIdx + 3] = Math.max(canvasBuffer[destIdx + 3], sa);
        }
      }
    }
  }

  async function renderLayer(layer) {
    if (layer.visible === false) return;
    if (layer.name?.includes('Broken')) return; // Prefer Fixed layers

    if (layer.type === 'tilelayer' && layer.data) {
      let drawn = 0;
      for (let idx = 0; idx < layer.data.length; idx++) {
        const rawGid = layer.data[idx];
        if (rawGid === 0) continue;

        const cleanGid = rawGid & 0x1fffffff;
        const ts = getTileset(cleanGid);
        if (!ts) continue;

        const localId = cleanGid - ts.firstgid;
        const col = idx % mapW;
        const row = Math.floor(idx / mapW);

        const destX = col * 8 + ts.offX;
        const destY = row * 8;
        blitTile(ts, localId, destX, destY);
        drawn++;
      }
      if (drawn > 0) console.log(`Rendered tilelayer: ${layer.name} (${drawn} tiles)`);
    }

    if (layer.type === 'objectgroup' && layer.objects) {
      // Sort objects by Y for proper 2.5D depth
      const sortedObjs = [...layer.objects].sort((a, b) => (a.y || 0) - (b.y || 0));
      for (const obj of sortedObjs) {
        if (!obj.gid) continue;
        const cleanGid = obj.gid & 0x1fffffff;
        if (cleanGid < 1504) {
          const tid = cleanGid - 1;
          const info = gmTiles.get(tid);
          if (info && info.file) {
            const img = await getObjImage(info.file);
            if (img) {
              // In Tiled, object origin for tile objects is bottom-left!
              const destX = Math.round(obj.x);
              const destY = Math.round(obj.y - img.h);
              blitImage(img, destX, destY);
            }
          }
        }
      }
    }

    if (layer.layers) {
      for (const sub of layer.layers) {
        await renderLayer(sub);
      }
    }
  }

  console.log('Rendering all layers...');
  for (const layer of tmj.layers) {
    await renderLayer(layer);
  }

  console.log('Writing to public/village_assets/rm_town_base.png...');
  await sharp(canvasBuffer, { raw: { width: pixelW, height: pixelH, channels: 4 } })
    .png({ compressionLevel: 6 })
    .toFile('public/village_assets/rm_town_base.png');

  console.log('Bake complete! File size:');
  const stat = fs.statSync('public/village_assets/rm_town_base.png');
  console.log(`${Math.round(stat.size / 1024)} KB`);
}

bake().catch(console.error);
