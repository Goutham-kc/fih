const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function bake() {
  console.log('=== BAKING AUTHENTIC RM_TOWN MAP WITH ALL DECORATIONS & PROPER ALIGNMENT ===');
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

  // Load tilesets with correct column counts
  const tilesetConfigs = [
    { firstgid: 1721, tilecount: 48, cols: 8, name: 'grass_auto', file: 'public/village_assets/environment/tilesets/farm/spr_farm_ground_grass_spring.png' },
    { firstgid: 1769, tilecount: 1024, cols: 32, name: 'shadows', file: 'public/village_assets/environment/tilesets/generic/spr_main_exteriors_shadow_spring.png' },
    { firstgid: 2793, tilecount: 4096, cols: 64, name: 'main_exteriors', file: 'public/village_assets/environment/tilesets/generic/spr_main_exteriors_spring.png' },
    { firstgid: 6889, tilecount: 21840, cols: 336, name: 'water', file: 'public/village_assets/environment/tilesets/generic/spr_main_exteriors_water_spring.png' },
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

  const FLIPPED_HORIZONTAL = 0x80000000;
  const FLIPPED_VERTICAL = 0x40000000;
  const FLIPPED_ANTI_DIAGONAL = 0x20000000;

  function parseGid(rawGid) {
    const fh = Boolean(rawGid & FLIPPED_HORIZONTAL);
    const fv = Boolean(rawGid & FLIPPED_VERTICAL);
    const fd = Boolean(rawGid & FLIPPED_ANTI_DIAGONAL);
    const gid = rawGid & ~(FLIPPED_HORIZONTAL | FLIPPED_VERTICAL | FLIPPED_ANTI_DIAGONAL);

    let rotation = 0;
    let flipped = false;

    if (fh && fv && fd) { rotation = Math.PI / 2; flipped = true; }
    else if (fh && fv && !fd) { rotation = Math.PI; flipped = false; }
    else if (fh && !fv && fd) { rotation = Math.PI / 2; flipped = false; }
    else if (fh && !fv && !fd) { rotation = 0; flipped = true; }
    else if (!fh && fv && fd) { rotation = 3 * Math.PI / 2; flipped = false; }
    else if (!fh && fv && !fd) { rotation = Math.PI; flipped = true; }
    else if (!fh && !fv && fd) { rotation = 3 * Math.PI / 2; flipped = true; }
    else { rotation = 0; flipped = false; }

    return { gid, rotation, flipped };
  }

  function blitTile(ts, localId, destX, destY, rotation = 0, flipped = false) {
    const srcCol = localId % ts.cols;
    const srcRow = Math.floor(localId / ts.cols);
    const srcX = srcCol * 16;
    const srcY = srcRow * 16;
    if (srcY + 16 > ts.h || srcX + 16 > ts.w) return;

    const cos = Math.round(Math.cos(-rotation));
    const sin = Math.round(Math.sin(-rotation));

    for (let py = 0; py < 16; py++) {
      const ty = destY + py;
      if (ty < 0 || ty >= pixelH) continue;
      const cy = py - 7.5;

      for (let px = 0; px < 16; px++) {
        const tx = destX + px;
        if (tx < 0 || tx >= pixelW) continue;
        const cx = px - 7.5;

        let rx = cx * cos - cy * sin;
        let ry = cx * sin + cy * cos;
        if (flipped) rx = -rx;

        const lx = Math.round(rx + 7.5);
        const ly = Math.round(ry + 7.5);
        if (lx < 0 || lx >= 16 || ly < 0 || ly >= 16) continue;

        const sIdx = ((srcY + ly) * ts.w + (srcX + lx)) * 4;
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

  // Index all image files across public/village_assets
  const allImages = new Map();
  function indexImages(dir) {
    if (!fs.existsSync(dir)) return;
    for (const f of fs.readdirSync(dir)) {
      const full = path.join(dir, f);
      if (fs.statSync(full).isDirectory()) indexImages(full);
      else if (f.endsWith('.png')) allImages.set(f.toLowerCase(), full);
    }
  }
  indexImages('public/village_assets');
  console.log(`Indexed ${allImages.size} images in public/village_assets`);

  // Parse __gm_import.tsx
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
      let baseName = path.basename(imgMatch[3]).toLowerCase();

      // Replace broken inn door with spring closed door
      if (baseName === 'spr_inn_main_broken_door_spring_closed.png') {
        baseName = 'spr_inn_main_door_spring_closed.png';
      }

      const resolved = allImages.get(baseName);
      if (resolved) gmTiles.set(tileId, { file: resolved, baseName, tileW, tileH });
    }
  }
  console.log(`Resolved ${gmTiles.size} tiles from __gm_import.tsx`);

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
    const maxW = Math.min(frameW || img.w, img.w);
    const maxH = Math.min(frameH || img.h, img.h);

    for (let py = 0; py < maxH; py++) {
      const ty = destY + py;
      if (ty < 0 || ty >= pixelH) continue;
      for (let px = 0; px < maxW; px++) {
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

        const { gid: cleanGid, rotation, flipped } = parseGid(rawGid);
        const ts = getTilesetForGid(cleanGid);
        if (!ts) continue;

        const localId = cleanGid - ts.firstgid;
        const col = i % mapW;
        const row = Math.floor(i / mapW);
        blitTile(ts, localId, col * 8, row * 8, rotation, flipped);
        count++;
      }
      if (count > 0) console.log(`Tilelayer: ${name} (${count} tiles)`);
    }

    if (l.layers) {
      for (const sub of l.layers) await renderTileLayer(sub);
    }
  }

  console.log('Rendering ground and terrain layers with exact Tiled rotation & flip...');
  for (const layer of tmj.layers) {
    await renderTileLayer(layer);
  }

  // 2. Render all authentic object layers in authentic Tiled depth order
  const objectLayersToBake = [
    'Level_0_FloorSprites',
    'Level_0_FloorSprites_General_Store_Fixed',
    'Level_0_FloorSprites_Saturday_Market',
    'Level_0_FloorSprites_Stall_Zorel',
    'Level_0_FloorSprites_Stall_Vera',
    'Level_0_FloorSprites_Stall_Stillwell',
    'Level_0_FloorSprites_Stall_Louis',
    'Level_0_FloorSprites_Stall_Darcy',
    'Level_0_FloorSprites_Stall_Merri',
    'Level_0_Assets',
    'Level_0_Assets_Plaza_Fixed',
    'Level_0_Assets_General_Store_Fixed',
    'Level_0_Assets_Inn_Fixed',
    'Level_0_Assets_Mill_Fixed',
    'Level_0_Assets_Bell_Tower_Fixed',
    'Level_0_Assets_Bell_Tower_Fixed_Door',
    'Level_0_Assets_Bell_Tower_Fixed_Bell',
    'Level_0_Assets_Saturday_Market',
    'Level_0_Assets_Stall_Zorel',
    'Level_0_Assets_Stall_Wheedle',
    'Level_0_Assets_Stall_Vera',
    'Level_0_Assets_Stall_Stillwell',
    'Level_0_Assets_Stall_Louis',
    'Level_0_Assets_Stall_Darcy',
    'Level_0_Assets_Stall_Merri',
    'Level_0_Assets_Stall_Taliferro',
    'Level_1_Assets_Manor_Lamps'
  ];

  const extraGidMap = {
    // Plaza Fixed (Blacksmith Planter, Beach Benches, Vertical Hedges)
    29050: { baseName: 'spr_town_building_blacksmith_planter_spring.png' },
    29084: { baseName: 'spr_beach_bench_south_spring.png' },
    29167: { baseName: 'spr_town_plaza_vertical_hedge_spring.png' },

    // Stall Zorel
    29187: { baseName: 'spr_town_stall_zorel_carpet.png' },
    29190: { baseName: 'spr_town_stall_zorel_stage_main.png' },
    29185: { baseName: 'spr_town_stall_zorel_desk_main.png' },
    29183: { baseName: 'spr_town_stall_zorel_lute_main.png' },

    // Stall Stillwell
    29181: { baseName: 'spr_town_stall_stillwell_carpet.png' },
    29179: { baseName: 'spr_town_stall_stillwell_backdrop_spring.png' },
    29173: { baseName: 'spr_town_stall_stillwell_small_table_v1_spring.png' },
    29170: { baseName: 'spr_town_stall_stillwell_small_table_v2_spring.png' },
    29174: { baseName: 'spr_town_stall_stillwell_large_table_spring.png' },

    // Bell Tower Fixed
    29291: { baseName: 'spr_town_building_bell_tower_fixed_spring.png' },
    29297: { baseName: 'spr_exterior_lighting_bell_tower_insert.png' },
    29289: { baseName: 'spr_town_building_bell_tower_door_spring_closed.png' },
    29285: { baseName: 'spr_town_building_bell_tower_bell_idle.png' },

    // Clinic Door 2 & Bathhouse Wheel
    29314: { baseName: 'spr_town_building_clinic_door2_spring_closed.png' },
    29343: { baseName: 'spr_town_building_bathhouse_wheel_spring_on.png' },

    // Manor House Exterior Lighting Inserts
    29375: { baseName: 'spr_town_building_manor_exterior_lighting_insert_1_spring.png' },
    29373: { baseName: 'spr_town_building_manor_exterior_lighting_insert_2_spring.png' },
    29377: { baseName: 'spr_town_building_manor_exterior_lighting_insert_3_spring.png' },
    29378: { baseName: 'spr_town_building_manor_exterior_lighting_insert_4_spring.png' },
    29366: { baseName: 'spr_town_building_manor_exterior_lighting_insert_5_spring.png' },
    29372: { baseName: 'spr_town_building_manor_exterior_lighting_insert_6_spring.png' },
    29376: { baseName: 'spr_town_building_manor_exterior_lighting_insert_7_spring.png' },
  };

  async function renderObjectLayer(l) {
    if (l.visible === false) return;
    if (l.objects && objectLayersToBake.includes(l.name)) {
      // Sort objects by Y (depth sorting)
      const sorted = [...l.objects].sort((a, b) => a.y - b.y);
      let count = 0;
      for (const obj of sorted) {
        if (!obj.gid) continue;
        const cleanGid = (obj.gid & 0x1fffffff) - 1;
        let info = gmTiles.get(cleanGid);

        if (!info && extraGidMap[cleanGid]) {
          const extra = extraGidMap[cleanGid];
          const resolved = allImages.get(extra.baseName.toLowerCase());
          if (resolved) {
            info = { file: resolved, baseName: extra.baseName, tileW: obj.width, tileH: obj.height };
          }
        }

        if (!info) continue;

        // Skip broken mill blits if any (Mill is handled by Mill_Fixed)
        if (l.name.includes('Broken')) continue;

        const img = await getDecodedObj(info.file);
        if (!img) continue;

        const frameW = obj.width || info.tileW || img.w;
        const frameH = obj.height || info.tileH || img.h;
        const destX = Math.round(obj.x);
        const destY = Math.round(obj.y - frameH);

        blitImage(img, destX, destY, frameW, frameH);
        count++;
      }
      console.log(`Object layer [${l.name}]: blitted ${count} objects`);
    }

    if (l.layers) {
      for (const sub of l.layers) await renderObjectLayer(sub);
    }
  }

  console.log('Rendering authentic object layers (decorations, planters, lamps, flora, fences)...');
  for (const layer of tmj.layers) {
    await renderObjectLayer(layer);
  }

  // 3. Render authentic buildings from keyBuildings (to ensure top covers, roofs, gazebo, bridges are flawless)
  console.log('Rendering authentic key buildings & bridges...');
  const keyBuildings = [
    // Stone Bridge over eastern river (frame 0 clipped to 184x112)
    { file: 'public/village_assets/architecture/bridges/spr_town_stone_bridge_horizontal_flat_spring_ground.png', x: 1616, y: 1128, isBottomOrigin: true, frameW: 184, frameH: 112 },
    { file: 'public/village_assets/architecture/bridges/spr_town_stone_bridge_horizontal_flat_water.png', x: 1616, y: 1128, isBottomOrigin: true, frameW: 184, frameH: 112 },
    { file: 'public/village_assets/architecture/bridges/spr_town_stone_bridge_horizontal_flat_spring.png', x: 1616, y: 1128, isBottomOrigin: true, frameW: 184, frameH: 112 },
    { file: 'public/village_assets/architecture/bridges/spr_town_stone_bridge_horizontal_flat_spring_top.png', x: 1616, y: 1128, isBottomOrigin: true, frameW: 184, frameH: 112 },

    // Manor House & Gazebo
    { file: 'public/village_assets/buildings/manor/Gazebo/spr_town_gazebo_spring_ground.png', x: 1424, y: 284, isBottomOrigin: true, frameW: 120, frameH: 144 },
    { file: 'public/village_assets/buildings/manor/Gazebo/spr_town_gazebo_spring.png', x: 1424, y: 284, isBottomOrigin: true, frameW: 120, frameH: 144 },
    { file: 'public/village_assets/buildings/manor/spr_town_building_manor_spring.png', x: 872, y: 512, isBottomOrigin: true, frameW: 448, frameH: 432 },
    { file: 'public/village_assets/buildings/manor/spr_town_building_manor_spring_top.png', x: 872, y: 512, isBottomOrigin: true, frameW: 448, frameH: 432 },
    { file: 'public/village_assets/buildings/manor/spr_town_building_manor_doorway_spring.png', x: 1048, y: 504, isBottomOrigin: true, frameW: 96, frameH: 104 },
    { file: 'public/village_assets/buildings/manor/spr_town_building_manor_door_spring_closed.png', x: 1064, y: 504, isBottomOrigin: true, frameW: 64, frameH: 88 },
    { file: 'public/village_assets/buildings/manor/spr_manorhouse_tree_square_spring.png', x: 1006, y: 480, isBottomOrigin: true, frameW: 48, frameH: 88 },
    { file: 'public/village_assets/buildings/manor/spr_manorhouse_tree_square_spring.png', x: 1138, y: 480, isBottomOrigin: true, frameW: 48, frameH: 88 },

    // Blacksmith Forge & Shop
    { file: 'public/village_assets/buildings/blacksmith/spr_town_building_blacksmith_left_spring_ground.png', x: 504, y: 1016, isBottomOrigin: true, frameW: 136, frameH: 248 },
    { file: 'public/village_assets/buildings/blacksmith/spr_town_building_blacksmith_left_spring.png', x: 504, y: 1016, isBottomOrigin: true, frameW: 136, frameH: 248 },
    { file: 'public/village_assets/buildings/blacksmith/spr_town_building_blacksmith_right_spring.png', x: 600, y: 984, isBottomOrigin: true, frameW: 232, frameH: 200 },
    { file: 'public/village_assets/buildings/blacksmith/spr_town_building_blacksmith_door_spring_closed.png', x: 684, y: 984, isBottomOrigin: true, frameW: 56, frameH: 71 },

    // Bathhouse
    { file: 'public/village_assets/buildings/bathhouse/spr_town_building_bathhouse_spring.png', x: 1388, y: 929, isBottomOrigin: true, frameW: 280, frameH: 208 },
    { file: 'public/village_assets/buildings/bathhouse/spr_town_building_bathhouse_door_spring_closed.png', x: 1436, y: 926, isBottomOrigin: true, frameW: 56, frameH: 64 },

    // Clinic
    { file: 'public/village_assets/buildings/clinic/spr_town_building_clinic_spring.png', x: 1344, y: 1281, isBottomOrigin: true, frameW: 288, frameH: 224 },
    { file: 'public/village_assets/buildings/clinic/spr_town_building_clinic_door1_spring_closed.png', x: 1396, y: 1281, isBottomOrigin: true, frameW: 56, frameH: 71 },
    { file: 'public/village_assets/buildings/clinic/spr_town_building_clinic_door2_spring_closed.png', x: 1508, y: 1281, isBottomOrigin: true, frameW: 56, frameH: 71 },

    // Bell Tower
    { file: 'public/village_assets/buildings/bell_tower/spr_town_building_bell_tower_fixed_spring.png', x: 448, y: 1280, isBottomOrigin: true, frameW: 160, frameH: 240 },
    { file: 'public/village_assets/buildings/bell_tower/spr_town_building_bell_tower_door_spring_closed.png', x: 504, y: 1276, isBottomOrigin: true, frameW: 48, frameH: 54 },

    // Sleeping Dragon Inn (door precisely placed at x: 888, y: 1736, 80x64)
    { file: 'public/village_assets/buildings/inn/spr_town_building_inn_spring.png', x: 812, y: 1736, isBottomOrigin: true, frameW: 256, frameH: 264 },
    { file: 'public/village_assets/buildings/inn/spr_town_building_inn_wooden_beams_spring.png', x: 1020, y: 1728, isBottomOrigin: true, frameW: 152, frameH: 160 },
    { file: 'public/village_assets/buildings/inn/spr_inn_main_door_spring_closed.png', x: 888, y: 1736, isBottomOrigin: true, frameW: 80, frameH: 64 },

    // General Store
    { file: 'public/village_assets/buildings/general_store/spr_town_building_generalstore_spring.png', x: 1148, y: 1729, isBottomOrigin: true, frameW: 168, frameH: 240 },
    { file: 'public/village_assets/buildings/general_store/spr_town_building_generalstore_side_spring.png', x: 1284, y: 1727, isBottomOrigin: true, frameW: 104, frameH: 176 },
    { file: 'public/village_assets/buildings/general_store/spr_town_building_generalstore_door_spring_closed.png', x: 1204, y: 1737, isBottomOrigin: true, frameW: 56, frameH: 71 },

    // Mill (Single authentic Mill tower, base, doorway, door & blades - frame 0 192x288)
    { file: 'public/village_assets/buildings/mill/spr_town_building_mill_spring_base_on.png', x: 1408, y: 1728, isBottomOrigin: true, frameW: 192, frameH: 288 },
    { file: 'public/village_assets/buildings/mill/spr_town_building_mill_spring_doorway_on.png', x: 1408, y: 1728, isBottomOrigin: true, frameW: 192, frameH: 288 },
    { file: 'public/village_assets/buildings/mill/spr_town_building_mill_door_spring_closed.png', x: 1480, y: 1727, isBottomOrigin: true, frameW: 48, frameH: 64 },
    { file: 'public/village_assets/buildings/mill/spr_town_building_mill_spring_tower_on.png', x: 1408, y: 1728, isBottomOrigin: true, frameW: 192, frameH: 288 },
    { file: 'public/village_assets/buildings/mill/spr_town_building_mill_spring_blades_on.png', x: 1408, y: 1728, isBottomOrigin: true, frameW: 192, frameH: 288 },

    // Celine's Cottage
    { file: 'public/village_assets/buildings/cottage/spr_town_building_celine_spring.png', x: 1256, y: 2129, isBottomOrigin: true, frameW: 176, frameH: 208 },
    { file: 'public/village_assets/buildings/cottage/spr_town_building_celine_door_spring_closed.png', x: 1304, y: 2135, isBottomOrigin: true, frameW: 64, frameH: 72 }
  ];

  for (const b of keyBuildings) {
    const full = path.join(b.file);
    if (!fs.existsSync(full)) continue;
    const img = await getDecodedObj(full);
    if (img) {
      const h = b.frameH || img.h;
      const w = b.frameW || img.w;
      const destY = b.isBottomOrigin ? b.y - h : b.y;
      blitImage(img, b.x, destY, w, h);
    }
  }

  // 4. Save composite PNG
  console.log('Encoding and saving rm_town_full.png ...');
  await sharp(canvasBuffer, {
    raw: {
      width: pixelW,
      height: pixelH,
      channels: 4
    }
  })
  .png({ compressionLevel: 8 })
  .toFile('public/village_assets/rm_town_full.png');

  fs.copyFileSync('public/village_assets/rm_town_full.png', 'village_assets/rm_town_full.png');
  console.log('SUCCESS! Complete rm_town_full.png baked and written to public and village_assets.');
}

bake().catch(err => {
  console.error(err);
  process.exit(1);
});
