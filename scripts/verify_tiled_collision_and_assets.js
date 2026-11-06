const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// 1. Bitwise Flip Constants
const FLIP_H = 0x80000000;
const FLIP_V = 0x40000000;
const FLIP_D = 0x20000000;
const GID_MASK = 0x1FFFFFFF;

function decodeGid(raw) {
  if (!raw || raw === 0) return { raw: 0, gid: 0, localId: 0, flipH: false, flipV: false, flipD: false };
  const flipH = Boolean(raw & FLIP_H);
  const flipV = Boolean(raw & FLIP_V);
  const flipD = Boolean(raw & FLIP_D);
  const gid = raw & GID_MASK;
  return { raw, gid, flipH, flipV, flipD };
}

async function main() {
  console.log('=== TILED MAP AUDIT & VISUALIZATION (rm_town.tmj) ===');
  const tmjPath = 'village_assets/tiled_map/rm_town.tmj';
  const tmj = JSON.parse(fs.readFileSync(tmjPath, 'utf8'));

  const mapW = tmj.width; // 266
  const mapH = tmj.height; // 366
  const totalCells = mapW * mapH; // 97356

  console.log(`Map: ${mapW}x${mapH} tiles (8px), Dimensions: ${mapW * 8}x${mapH * 8} px, Layers: ${tmj.layers.length}`);

  // Flatten all layers preserving full hierarchical path
  const allLayers = [];
  function flatten(layerList, parentPath = '') {
    for (const l of layerList) {
      const currentPath = parentPath ? `${parentPath}/${l.name}` : l.name;
      allLayers.push({ ...l, fullPath: currentPath });
      if (l.layers) {
        flatten(l.layers, currentPath);
      }
    }
  }
  flatten(tmj.layers);

  // 1. Find base collision layer
  const baseColLayer = allLayers.find(l => l.name === 'Tiles_Collision' && l.type === 'tilelayer');
  if (!baseColLayer || !baseColLayer.data) {
    throw new Error('Tiles_Collision layer not found!');
  }

  console.log(`Base Tiles_Collision found with ${baseColLayer.data.length} cells`);

  // Active overlay collision layers (Fixed town state)
  const activeOverlayNames = [
    'Tiles_Collision_Inn_Fixed',
    'Tiles_Collision_General_Store_Fixed',
    'Tiles_Collision_Plaza_Fixed'
  ];

  const overlayLayers = allLayers.filter(l => activeOverlayNames.includes(l.name) && l.type === 'tilelayer');
  console.log(`Active collision overlays: ${overlayLayers.map(l => l.name).join(', ')}`);

  // Build 2D collision grids: [ty][tx]
  const baseGrid = Array.from({ length: mapH }, () => new Array(mapW));
  const effectiveGrid = Array.from({ length: mapH }, () => new Array(mapW));

  const stats = {
    total: totalCells,
    empty_0: 0,
    walkable_1504: 0,
    blocked_1507: 0,
    partial_1506: 0,
    water_1508: 0,
    barrier_1510: 0,
    flippedCount: 0,
    other: 0,
    overlayOverrides: 0,
  };

  for (let i = 0; i < totalCells; i++) {
    const tx = i % mapW;
    const ty = Math.floor(i / mapW);
    const raw = baseColLayer.data[i];
    const decoded = decodeGid(raw);

    baseGrid[ty][tx] = decoded;
    effectiveGrid[ty][tx] = decoded;

    if (decoded.flipH || decoded.flipV || decoded.flipD) stats.flippedCount++;

    if (decoded.gid === 0) stats.empty_0++;
    else if (decoded.gid === 1504) stats.walkable_1504++;
    else if (decoded.gid === 1507) stats.blocked_1507++;
    else if (decoded.gid === 1506) stats.partial_1506++;
    else if (decoded.gid === 1508) stats.water_1508++;
    else if (decoded.gid === 1510) stats.barrier_1510++;
    else stats.other++;
  }

  // Apply active overlays
  for (const ol of overlayLayers) {
    for (let i = 0; i < totalCells; i++) {
      const raw = ol.data[i];
      if (raw !== 0) {
        const tx = i % mapW;
        const ty = Math.floor(i / mapW);
        const decoded = decodeGid(raw);
        effectiveGrid[ty][tx] = decoded;
        stats.overlayOverrides++;
      }
    }
  }

  console.log('\n--- Collision Grid Statistics ---');
  console.log(`Total Cells: ${stats.total}`);
  console.log(`1504 (Walkable ground): ${stats.walkable_1504} (${(stats.walkable_1504 / stats.total * 100).toFixed(1)}%)`);
  console.log(`1507 (Solid blocked):   ${stats.blocked_1507} (${(stats.blocked_1507 / stats.total * 100).toFixed(1)}%)`);
  console.log(`1506 (Edge/slope/curb): ${stats.partial_1506} (${(stats.partial_1506 / stats.total * 100).toFixed(1)}%)`);
  console.log(`1508 (Water edge):      ${stats.water_1508} (${(stats.water_1508 / stats.total * 100).toFixed(1)}%)`);
  console.log(`1510 (Barrier):         ${stats.barrier_1510} (${(stats.barrier_1510 / stats.total * 100).toFixed(1)}%)`);
  console.log(`Empty (0):              ${stats.empty_0}`);
  console.log(`Flipped cells (H/V/D):  ${stats.flippedCount}`);
  console.log(`Overlay Overrides:      ${stats.overlayOverrides}`);

  // 2. Self-Check: Asset Footprint & Alignment Verification
  const activeAssetLayers = [
    'Level_0_Assets',
    'Level_0_FloorSprites',
    'Level_0_Assets_Inn_Fixed',
    'Level_0_Assets_General_Store_Fixed',
    'Level_0_FloorSprites_General_Store_Fixed',
    'Level_0_Assets_Mill_Fixed'
  ];

  let solidPropsChecked = 0;
  let solidPropsPassed = 0; // footprint lands on solid (1507) or partial (1506/1508/1510)
  let floorDecalsChecked = 0;
  let floorDecalsPassed = 0; // footprint lands on walkable (1504)

  const solidProps = [];
  const floorDecals = [];

  for (const l of allLayers) {
    if (!l.objects || !activeAssetLayers.includes(l.name)) continue;
    const isFloorLayer = l.name.includes('Floor');

    for (const obj of l.objects) {
      if (!obj.gid) continue;
      const left = obj.x;
      const bottom = obj.y;
      const width = obj.width;
      const height = obj.height;
      const top = bottom - height;
      const right = left + width;

      // Foot tiles: sample the bottom row of tiles
      const footY = bottom - 2; // 2px inside bottom edge
      const ty = Math.floor(footY / 8);

      if (ty < 0 || ty >= mapH) continue;

      let blockedCount = 0;
      let walkableCount = 0;
      let sampleCount = 0;

      // Sample along the bottom edge
      for (let px = left + 4; px < right - 4; px += 8) {
        const tx = Math.floor(px / 8);
        if (tx >= 0 && tx < mapW) {
          sampleCount++;
          const cell = effectiveGrid[ty][tx];
          if (cell.gid === 1507 || cell.gid === 1506 || cell.gid === 1508 || cell.gid === 1510) {
            blockedCount++;
          } else if (cell.gid === 1504) {
            walkableCount++;
          }
        }
      }

      if (sampleCount === 0) {
        const tx = Math.floor((left + width / 2) / 8);
        if (tx >= 0 && tx < mapW) {
          sampleCount = 1;
          const cell = effectiveGrid[ty][tx];
          if (cell.gid === 1507 || cell.gid === 1506 || cell.gid === 1508 || cell.gid === 1510) blockedCount++;
          else if (cell.gid === 1504) walkableCount++;
        }
      }

      if (isFloorLayer) {
        floorDecalsChecked++;
        if (walkableCount >= blockedCount) floorDecalsPassed++;
        floorDecals.push({ name: l.name, obj, left, top, width, height, bottom, walkableCount, blockedCount });
      } else {
        solidPropsChecked++;
        // Check if footprint has blocked collision
        if (blockedCount > 0 || obj.name?.includes('door') || height < 32) {
          solidPropsPassed++;
        }
        solidProps.push({ name: l.name, obj, left, top, width, height, bottom, walkableCount, blockedCount });
      }
    }
  }

  console.log('\n--- Asset Footprint Verification ---');
  console.log(`Solid Props Checked: ${solidPropsChecked}, Passed (solid/partial collision): ${solidPropsPassed} (${(solidPropsPassed / solidPropsChecked * 100).toFixed(1)}%)`);
  console.log(`Floor Decals Checked: ${floorDecalsChecked}, Passed (walkable ground): ${floorDecalsPassed} (${(floorDecalsPassed / floorDecalsChecked * 100).toFixed(1)}%)`);

  // 3. Self-Check: Gameplay Instances / Markers
  const instanceLayers = allLayers.filter(l => l.objects && (l.name === 'Instances' || l.name.endsWith('_Instances')));
  let totalInstances = 0;
  let walkableInstances = 0;

  for (const l of instanceLayers) {
    for (const obj of l.objects) {
      if (obj.gid) continue; // instance markers have no gid
      totalInstances++;
      const tx = Math.floor(obj.x / 8);
      const ty = Math.floor(obj.y / 8);
      if (tx >= 0 && tx < mapW && ty >= 0 && ty < mapH) {
        const cell = effectiveGrid[ty][tx];
        // 1504 is walkable
        if (cell.gid === 1504) {
          walkableInstances++;
        } else {
          console.log(`Instance [${obj.name || obj.type || l.name}] at (${obj.x}, ${obj.y}) -> tile (${tx}, ${ty}) is GID ${cell.gid}`);
        }
      }
    }
  }
  console.log(`Instances Checked: ${totalInstances}, Walkable (1504): ${walkableInstances}`);

  // 4. Render Debug PNG
  // Width: 2128, Height: 2928 (RGBA buffer)
  console.log('\nGenerating Debug Collision & Asset Placement Visualization...');
  const debugW = mapW * 8; // 2128
  const debugH = mapH * 8; // 2928
  const debugBuf = Buffer.alloc(debugW * debugH * 4, 0);

  // Palette:
  // 1504: Soft Green [34, 197, 94, 255]
  // 1507: Solid Red [239, 68, 68, 255]
  // 1506: Amber Yellow [245, 158, 11, 255]
  // 1508: Cyan Blue [6, 182, 212, 255]
  // 1510: Vivid Orange [249, 115, 22, 255]
  // 0 / other: Dark Purple [30, 27, 75, 255]

  for (let ty = 0; ty < mapH; ty++) {
    for (let tx = 0; tx < mapW; tx++) {
      const cell = effectiveGrid[ty][tx];
      let r = 30, g = 27, b = 75, a = 255;

      if (cell.gid === 1504) {
        r = 34; g = 197; b = 94; // Green: walkable ground
      } else if (cell.gid === 1507) {
        r = 239; g = 68; b = 68; // Red: solid wall/obstacle
      } else if (cell.gid === 1506) {
        r = 245; g = 158; b = 11; // Amber: slope/curb
      } else if (cell.gid === 1508) {
        r = 6; g = 182; b = 212; // Cyan: river/water
      } else if (cell.gid === 1510) {
        r = 249; g = 115; b = 22; // Orange: boundary/barrier
      }

      // If flipped, add diagonal cross-hatch brightness
      const isFlipped = cell.flipH || cell.flipV || cell.flipD;

      for (let py = 0; py < 8; py++) {
        const pyPix = ty * 8 + py;
        for (let px = 0; px < 8; px++) {
          const pxPix = tx * 8 + px;
          const idx = (pyPix * debugW + pxPix) * 4;

          // 8x8 grid border (1px light grid)
          if (px === 0 || py === 0) {
            debugBuf[idx] = Math.max(0, r - 30);
            debugBuf[idx + 1] = Math.max(0, g - 30);
            debugBuf[idx + 2] = Math.max(0, b - 30);
            debugBuf[idx + 3] = 255;
          } else if (isFlipped && (px === py || px === 7 - py)) {
            // Flipped indicator: diagonal cross
            debugBuf[idx] = 255;
            debugBuf[idx + 1] = 255;
            debugBuf[idx + 2] = 255;
            debugBuf[idx + 3] = 255;
          } else {
            debugBuf[idx] = r;
            debugBuf[idx + 1] = g;
            debugBuf[idx + 2] = b;
            debugBuf[idx + 3] = a;
          }
        }
      }
    }
  }

  // Draw Asset Bounding Boxes
  function drawRect(left, top, w, h, colR, colG, colB) {
    const rL = Math.max(0, Math.floor(left));
    const rT = Math.max(0, Math.floor(top));
    const rR = Math.min(debugW - 1, Math.floor(left + w));
    const rB = Math.min(debugH - 1, Math.floor(top + h));

    for (let x = rL; x <= rR; x++) {
      const idxT = (rT * debugW + x) * 4;
      const idxB = (rB * debugW + x) * 4;
      debugBuf[idxT] = colR; debugBuf[idxT + 1] = colG; debugBuf[idxT + 2] = colB; debugBuf[idxT + 3] = 255;
      debugBuf[idxB] = colR; debugBuf[idxB + 1] = colG; debugBuf[idxB + 2] = colB; debugBuf[idxB + 3] = 255;
    }
    for (let y = rT; y <= rB; y++) {
      const idxL = (y * debugW + rL) * 4;
      const idxR = (y * debugW + rR) * 4;
      debugBuf[idxL] = colR; debugBuf[idxL + 1] = colG; debugBuf[idxL + 2] = colB; debugBuf[idxL + 3] = 255;
      debugBuf[idxR] = colR; debugBuf[idxR + 1] = colG; debugBuf[idxR + 2] = colB; debugBuf[idxR + 3] = 255;
    }
  }

  // Draw all solid prop boxes (White border)
  solidProps.forEach(p => {
    drawRect(p.left, p.top, p.width, p.height, 255, 255, 255);
  });

  // Draw floor decals (Cyan border)
  floorDecals.forEach(d => {
    drawRect(d.left, d.top, d.width, d.height, 56, 189, 248);
  });

  // Save the debug PNG
  const outPath = 'C:/Users/gouth/.gemini/antigravity/brain/7a513e8a-e2f0-4f3b-8051-22e22a3a0e1e/debug_collision_grid.png';
  console.log(`Writing full 2128x2928 debug collision image to ${outPath}...`);
  await sharp(debugBuf, {
    raw: {
      width: debugW,
      height: debugH,
      channels: 4
    }
  })
  .png({ compressionLevel: 8 })
  .toFile(outPath);

  console.log('Saved debug_collision_grid.png successfully!');

  // Also crop zoomed-in debug regions for fast visual inspection
  // 1. Inn and General Store plaza area (x: 800..1400, y: 1600..2000)
  await sharp(outPath)
    .extract({ left: 800, top: 1600, width: 600, height: 400 })
    .toFile('C:/Users/gouth/.gemini/antigravity/brain/7a513e8a-e2f0-4f3b-8051-22e22a3a0e1e/debug_zoom_plaza.png');

  // 2. Manor House and Gardens (x: 800..1400, y: 200..800)
  await sharp(outPath)
    .extract({ left: 800, top: 200, width: 600, height: 600 })
    .toFile('C:/Users/gouth/.gemini/antigravity/brain/7a513e8a-e2f0-4f3b-8051-22e22a3a0e1e/debug_zoom_manor.png');

  // 3. Blacksmith Forge area (x: 450..850, y: 800..1200)
  await sharp(outPath)
    .extract({ left: 450, top: 800, width: 400, height: 400 })
    .toFile('C:/Users/gouth/.gemini/antigravity/brain/7a513e8a-e2f0-4f3b-8051-22e22a3a0e1e/debug_zoom_blacksmith.png');

  console.log('Saved debug_zoom_plaza.png, debug_zoom_manor.png, and debug_zoom_blacksmith.png!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
