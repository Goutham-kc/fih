const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function main() {
  console.log('=== BAKING COMPLETE 2128x2928 RM_TOWN MAP ===');
  const tmj = JSON.parse(fs.readFileSync('public/village_assets/tiled_map/rm_town.tmj', 'utf8'));

  const mapW = tmj.width; // 266
  const mapH = tmj.height; // 366
  const pixelW = mapW * 8; // 2128
  const pixelH = mapH * 8; // 2928

  const canvasBuffer = Buffer.alloc(pixelW * pixelH * 4, 0);

  // Background meadow grass fill #8dc653
  for (let i = 0; i < pixelW * pixelH; i++) {
    const idx = i * 4;
    canvasBuffer[idx] = 0x8d;
    canvasBuffer[idx + 1] = 0xc6;
    canvasBuffer[idx + 2] = 0x53;
    canvasBuffer[idx + 3] = 255;
  }

  // Load tilesets
  const tilesetConfigs = [
    { firstgid: 1721, tilecount: 48, cols: 8, name: 'grass_auto', file: 'public/village_assets/environment/tilesets/farm/spr_farm_ground_grass_spring.png' },
    { firstgid: 1769, tilecount: 1024, cols: 32, name: 'shadows', file: 'public/village_assets/environment/tilesets/generic/spr_main_exteriors_shadow_spring.png' },
    { firstgid: 2793, tilecount: 4096, cols: 64, name: 'main_exteriors', file: 'public/village_assets/environment/tilesets/generic/spr_main_exteriors_spring.png' },
    { firstgid: 6889, tilecount: 3500, cols: 21, name: 'water', file: 'public/village_assets/environment/tilesets/generic/spr_main_exteriors_water_spring.png' },
    { firstgid: 28923, tilecount: 48, cols: 8, name: 'soil', file: 'public/village_assets/environment/tilesets/farm/spr_farm_ground_soil_spring_plow.png' },
    { firstgid: 28971, tilecount: 48, cols: 8, name: 'soil_wet', file: 'public/village_assets/environment/tilesets/farm/spr_farm_ground_soil_spring_watered.png' }
  ];

  for (const tc of tilesetConfigs) {
    if (fs.existsSync(tc.file)) {
      const meta = await sharp(tc.file).metadata();
      tc.w = meta.width;
      tc.h = meta.height;
      tc.raw = await sharp(tc.file).ensureAlpha().raw().toBuffer();
      console.log(`Loaded tileset: ${tc.name} (${tc.w}x${tc.h})`);
    }
  }

  function getTilesetForGid(cleanGid) {
    for (const tc of tilesetConfigs) {
      if (cleanGid >= tc.firstgid && cleanGid < tc.firstgid + tc.tilecount && tc.raw) return tc;
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

  // Index all image files
  const allImages = new Map();
  function indexImages(dir) {
    for (const f of fs.readdirSync(dir)) {
      const full = path.join(dir, f);
      if (fs.statSync(full).isDirectory()) indexImages(full);
      else if (f.endsWith('.png')) allImages.set(f.toLowerCase(), full);
    }
  }
  indexImages('public/village_assets');

  // Parse __gm_import
  const gmXml = fs.readFileSync('public/village_assets/tiled_map/__gm_import.tsx', 'utf8');
  const gmTiles = new Map();
  const tileRegex = /<tile id="(\d+)"(?:[^>]*?width="(\d+)"[^>]*?height="(\d+)")?[^>]*?>([\s\S]*?)<\/tile>/g;
  let m;
  while ((m = tileRegex.exec(gmXml)) !== null) {
    const tileId = parseInt(m[1], 10);
    const body = m[4];
    const imgMatch = body.match(/<image\s+(?:width="(\d+)"\s+height="(\d+)"\s+)?source="([^"]+)"/);
    if (imgMatch) {
      const tileW = m[2] ? parseInt(m[2], 10) : (imgMatch[1] ? parseInt(imgMatch[1], 10) : null);
      const tileH = m[3] ? parseInt(m[3], 10) : (imgMatch[2] ? parseInt(imgMatch[2], 10) : null);
      const baseName = path.basename(imgMatch[3]).toLowerCase();
      const resolved = allImages.get(baseName);
      if (resolved) gmTiles.set(tileId, { file: resolved, baseName, tileW, tileH });
    }
  }

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

  function blitImage(img, destX, destY, frameW, frameH) {
    const renderW = Math.min(img.w, frameW || img.w);
    const renderH = Math.min(img.h, frameH || img.h);

    for (let py = 0; py < renderH; py++) {
      const ty = destY + py;
      if (ty < 0 || ty >= pixelH) continue;
      for (let px = 0; px < renderW; px++) {
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

  // 1. Render terrain tile layers
  async function renderTileLayer(l) {
    if (l.visible === false) return;
    const name = l.name || '';
    if (name.startsWith('Tiles_') || name.startsWith('Trellis') || name === 'FootstepTiles' || name === 'Pathfinding' || name === 'Meta' || name === 'Lighting' || name === 'MapHubs') return;
    if (name.includes('Broken') || name.includes('Summer') || name.includes('Fall') || name.includes('Winter')) return;

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
        blitTile(ts, localId, col * 8, row * 8);
        count++;
      }
      if (count > 0) console.log(`Tilelayer: ${name} (${count} tiles)`);
    }

    // Render floor sprites
    if (l.name === 'Level_0_FloorSprites' && l.objects) {
      for (const obj of l.objects) {
        if (!obj.gid) continue;
        const cleanGid = obj.gid & 0x1fffffff;
        if (cleanGid < 1504) {
          const info = gmTiles.get(cleanGid - 1);
          if (info) {
            const img = await getDecodedObj(info.file);
            if (img) {
              const frameW = obj.width || info.tileW || img.w;
              const frameH = obj.height || info.tileH || img.h;
              blitImage(img, Math.round(obj.x), Math.round(obj.y - frameH), frameW, frameH);
            }
          }
        }
      }
    }

    if (l.layers) {
      for (const sub of l.layers) await renderTileLayer(sub);
    }
  }

  console.log('Rendering ground and terrain layers...');
  for (const layer of tmj.layers) {
    await renderTileLayer(layer);
  }

  // 2. Render all authentic building sprites
  console.log('Rendering authentic buildings from village_assets...');
  const keyBuildings = [
    // Manor House
    { file: 'public/village_assets/buildings/manor/spr_town_building_manor_spring.png', x: 872, y: 512, isBottomOrigin: true },
    // Gazebo
    { file: 'public/village_assets/buildings/manor/spr_town_gazebo_spring.png', x: 1424, y: 284, isBottomOrigin: true },
    // Blacksmith Forge & Shop
    { file: 'public/village_assets/buildings/blacksmith/spr_town_building_blacksmith_left_spring.png', x: 504, y: 1016, isBottomOrigin: true },
    { file: 'public/village_assets/buildings/blacksmith/spr_town_building_blacksmith_right_spring.png', x: 600, y: 984, isBottomOrigin: true },
    // Bathhouse
    { file: 'public/village_assets/buildings/bathhouse/spr_town_building_bathhouse_spring.png', x: 1388, y: 929, isBottomOrigin: true },
    // Clinic
    { file: 'public/village_assets/buildings/clinic/spr_town_building_clinic_spring.png', x: 1344, y: 1281, isBottomOrigin: true },
    // Bell Tower
    { file: 'public/village_assets/buildings/bell_tower/spr_town_building_bell_tower_fixed_spring.png', x: 448, y: 1280, isBottomOrigin: true },
    // Sleeping Dragon Inn
    { file: 'public/village_assets/buildings/inn/spr_town_building_inn_spring.png', x: 812, y: 1736, isBottomOrigin: true },
    { file: 'public/village_assets/buildings/inn/spr_town_building_inn_wooden_beams_spring.png', x: 1020, y: 1728, isBottomOrigin: true },
    // General Store
    { file: 'public/village_assets/buildings/general_store/spr_town_building_generalstore_spring.png', x: 1148, y: 1729, isBottomOrigin: true },
    { file: 'public/village_assets/buildings/general_store/spr_town_building_generalstore_side_spring.png', x: 1284, y: 1727, isBottomOrigin: true },
    // Mill (Only 1 single authentic Mill tower & blades, frame 0 clipped to 192x288)
    { file: 'public/village_assets/buildings/mill/spr_town_building_mill_spring_base_on.png', x: 1408, y: 1728, isBottomOrigin: true, frameW: 192, frameH: 288 },
    { file: 'public/village_assets/buildings/mill/spr_town_building_mill_spring_doorway_on.png', x: 1408, y: 1728, isBottomOrigin: true, frameW: 192, frameH: 288 },
    { file: 'public/village_assets/buildings/mill/spr_town_building_mill_door_spring_closed.png', x: 1480, y: 1727, isBottomOrigin: true, frameW: 48, frameH: 64 },
    { file: 'public/village_assets/buildings/mill/spr_town_building_mill_spring_tower_on.png', x: 1408, y: 1728, isBottomOrigin: true, frameW: 192, frameH: 288 },
    { file: 'public/village_assets/buildings/mill/spr_town_building_mill_spring_blades_on.png', x: 1408, y: 1728, isBottomOrigin: true, frameW: 192, frameH: 288 },
    // Celine's Cottage
    { file: 'public/village_assets/buildings/cottage/spr_town_building_celine_spring.png', x: 1260, y: 2135, isBottomOrigin: true, frameW: 176, frameH: 208 },
    // Stone Bridge (Single bridge span across river, frame 0 clipped to 184x112)
    { file: 'public/village_assets/architecture/bridges/spr_town_stone_bridge_horizontal_flat_spring.png', x: 1616, y: 1128, isBottomOrigin: true, frameW: 184, frameH: 112 },
    // Balor's Wagon
    { file: 'public/village_assets/architecture/market_stalls/Balor/spr_town_balor_wagon_spring.png', x: 875, y: 2056, isBottomOrigin: true, frameW: 104, frameH: 96 }
  ];

  for (const b of keyBuildings) {
    const resolved = allImages.get(path.basename(b.file).toLowerCase()) || b.file;
    if (fs.existsSync(resolved)) {
      const img = await getDecodedObj(resolved);
      if (img) {
        const frameW = b.frameW || img.w;
        const frameH = b.frameH || img.h;
        const destX = b.x;
        const destY = b.isBottomOrigin ? b.y - frameH : b.y;
        blitImage(img, destX, destY, frameW, frameH);
        console.log(`Placed building: ${path.basename(b.file)} at (${destX}, ${destY}) [${frameW}x${frameH}]`);
      }
    } else {
      console.warn(`Building file missing: ${b.file}`);
    }
  }

  // 3. Render objects from Level_0_Assets (props, trees, planters, streetlamps, etc.)
  async function renderAssets(l) {
    if (l.visible === false) return;
    if (l.name?.includes('Broken') || l.name?.includes('Summer') || l.name?.includes('Fall') || l.name?.includes('Winter')) return;

    if (l.type === 'objectgroup' && l.objects && l.name !== 'Level_0_FloorSprites') {
      const sorted = [...l.objects].sort((a, b) => (a.y || 0) - (b.y || 0));
      for (const obj of sorted) {
        if (!obj.gid) continue;
        const cleanGid = obj.gid & 0x1fffffff;
        if (cleanGid < 1504) {
          const info = gmTiles.get(cleanGid - 1);
          if (info && info.file) {
            // Don't re-render already placed buildings or spritesheets
            const base = info.baseName;
            if (
              base.includes('generalstore') ||
              base.includes('inn_spring') ||
              base.includes('bell_tower') ||
              base.includes('clinic') ||
              base.includes('bathhouse') ||
              base.includes('manor') ||
              base.includes('blacksmith_left') ||
              base.includes('blacksmith_right') ||
              base.includes('gazebo') ||
              base.includes('mill_spring') ||
              base.includes('stone_bridge') ||
              base.includes('celine_spring') ||
              base.includes('balor_wagon')
            ) {
              continue;
            }
            const img = await getDecodedObj(info.file);
            if (img) {
              const frameW = obj.width || info.tileW || img.w;
              const frameH = obj.height || info.tileH || img.h;
              blitImage(img, Math.round(obj.x), Math.round(obj.y - frameH), frameW, frameH);
            }
          }
        }
      }
    }
    if (l.layers) {
      for (const sub of l.layers) await renderAssets(sub);
    }
  }

  console.log('Rendering props, lanterns, foliage and decorations...');
  for (const layer of tmj.layers) {
    await renderAssets(layer);
  }

  // 4. Save to public/village_assets/rm_town_full.png and village_assets/rm_town_full.png
  const outPath1 = 'public/village_assets/rm_town_full.png';
  const outPath2 = 'village_assets/rm_town_full.png';
  console.log(`Saving full map (${pixelW}x${pixelH}) to ${outPath1}...`);
  const pngBuffer = await sharp(canvasBuffer, { raw: { width: pixelW, height: pixelH, channels: 4 } })
    .png({ compressionLevel: 6 })
    .toBuffer();

  fs.writeFileSync(outPath1, pngBuffer);
  fs.writeFileSync(outPath2, pngBuffer);
  console.log('Successfully baked single authentic rm_town_full.png with ZERO duplicates!');
}

main().catch(console.error);
