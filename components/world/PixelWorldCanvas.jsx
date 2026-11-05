import React, { useRef, useEffect, useState, useCallback } from 'react';
import { soundManager } from '@/lib/soundManager';
import { eventBus, EVENTS } from '@/lib/eventBus';

// 16-bit RPG Tile Size
const TILE_SIZE = 16;
const MAP_WIDTH_TILES = 64;
const MAP_HEIGHT_TILES = 64;

/* ════════════════════════════════════════════════════════════════════════════
 *  VILLAGE LAYOUT (v2 — "Ring Road" layout)
 *
 *  North row   : Farmstead (14,14)  · Bell Tower (32,14)   · Ledger Hut (50,14)
 *  North Road  : one straight east-west road (y 18..19) linking all three
 *  Town Square : Inn · Notice Board square (32,23) · Lavender Cottage
 *  Middle row  : Archive Cellar (12,33) · Central Plaza (32,32) · Toolshed (52,33)
 *  South       : Woodland Pond + footbridge, South Crossing at (32,50)
 *  South row   : Festival Grounds (16,51) · Moonlight Cinema (48,51)
 *
 *  Every building is now reached by straight, orthogonal roads (no staircase
 *  diagonals) and the map is mirrored east/west so both halves feel filled.
 * ════════════════════════════════════════════════════════════════════════════ */

// Woodland pond (water tiles). The footbridge runs down column `bridgeX`.
export const POND = { minX: 30, maxX: 34, minY: 42, maxY: 45, bridgeX: 32 };

// Decorative / landmark anchors (tile coords)
const SKY_POST = { x: 44, y: 25 };
const WISHING_WELL = { x: 19, y: 25 };
const TOOLSHED = { x: 52, y: 33 }; // door tile
const NOTICE = { x: 32, y: 23 }; // base tile of the board (door is one row below)
const INN = { x: 24, y: 24 }; // centre / base tile
const COTTAGE = { x: 40, y: 24 }; // centre / base tile

// Chapter zone anchors in world tile coordinates
export const CHAPTER_ANCHORS = {
  todos: { x: 14, y: 14, name: 'The Farmstead', resident: 'pip', chapterTitle: 'Chapter 1: The Farmstead' },
  debts: { x: 50, y: 14, name: 'The Ledger Hut', resident: 'bram', chapterTitle: 'Chapter 2: The Ledger Hut' },
  reminders: { x: 32, y: 14, name: 'The Bell Tower', resident: 'hoot', chapterTitle: 'Chapter 3: The Bell Tower' },
  deadlines: { x: 32, y: 24, name: 'The Notice Board', resident: 'marigold', chapterTitle: 'Chapter 4: The Notice Board' },
  dates: { x: 16, y: 51, name: 'The Festival Grounds', resident: 'clover', chapterTitle: 'Chapter 5: The Festival Grounds' },
  watchlist: { x: 48, y: 51, name: 'The Moonlight Cinema', resident: 'juniper', chapterTitle: 'Chapter 6: The Moonlight Cinema' },
  audit: { x: 12, y: 33, name: 'The Archive Cellar', resident: 'moss', chapterTitle: 'Chapter 7: The Archive Cellar' },
  settings: { x: 52, y: 33, name: 'The Toolshed Workbench', resident: 'rowan', chapterTitle: 'Chapter 8: The Toolshed' },
};

// Build a hitbox from tile coordinates (door tile + inclusive tile bounds)
function makeHitbox(id, name, label, icon, doorTx, doorTy, minTx, minTy, maxTx, maxTy) {
  return {
    id,
    name,
    label,
    icon,
    doorX: doorTx * TILE_SIZE,
    doorY: doorTy * TILE_SIZE,
    minX: minTx * TILE_SIZE,
    minY: minTy * TILE_SIZE,
    maxX: maxTx * TILE_SIZE,
    maxY: maxTy * TILE_SIZE,
    bannerX: doorTx * TILE_SIZE,
    bannerY: minTy * TILE_SIZE - 6,
  };
}

// Interactive Building Hitboxes for Click & Proximity Navigation
export const BUILDING_HITBOXES = [
  makeHitbox('todos', 'The Farmstead', 'Daily Quests', '🌾', 14, 14, 11, 9, 17, 15),
  makeHitbox('reminders', 'The Bell Tower', 'Belfry Alerts', '🔔', 32, 14, 30, 7, 34, 14),
  makeHitbox('debts', 'The Ledger Hut', 'Gold Ledger', '🪙', 50, 14, 47, 9, 53, 15),
  makeHitbox('deadlines', 'The Notice Board', 'Town Deadlines', '📋', 32, 24, 30, 20, 34, 24),
  makeHitbox('dates', 'The Festival Grounds', 'Festival Grounds', '🎪', 16, 51, 12, 44, 20, 52),
  makeHitbox('watchlist', 'The Moonlight Cinema', 'Moonlight Cinema', '🎬', 48, 51, 44, 44, 52, 52),
  makeHitbox('audit', 'The Archive Cellar', 'Archive Cellar', '📜', 12, 33, 9, 28, 15, 34),
  makeHitbox('settings', 'The Toolshed Workbench', 'Toolshed Workshop', '🛠️', TOOLSHED.x, TOOLSHED.y, 50, 30, 54, 34),
];

// ── Terrain rectangles: [minTx, maxTx, minTy, maxTy] (inclusive) ──
const COBBLE_RECTS = [
  // Central Plaza + grand entrance aprons
  [28, 36, 28, 36],
  [30, 33, 27, 27],
  [30, 33, 37, 37],
  [27, 27, 31, 33],
  [37, 37, 31, 33],
  // Notice Board square
  [29, 35, 21, 25],
  // Building aprons / pads
  [30, 34, 13, 15], // Bell Tower platform
  [13, 15, 13, 15], // Farmstead porch
  [48, 52, 13, 15], // Ledger Hut courtyard
  [11, 13, 32, 34], // Archive Cellar pad
  [51, 53, 32, 34], // Toolshed pad
  [15, 17, 50, 52], // Festival apron
  [47, 49, 50, 52], // Cinema entrance pad
  // Pond footbridge approach + South Crossing
  [POND.bridgeX, POND.bridgeX, POND.minY, POND.maxY],
  [30, 34, 49, 51],
];

const PATH_RECTS = [
  // Belfry Avenue (Bell Tower → Notice square → Plaza)
  [31, 32, 16, 20],
  [31, 32, 26, 27],
  // North Road: Farmstead ⟷ Bell Tower ⟷ Ledger Hut
  [14, 50, 18, 19],
  // Farm gate & bank gate
  [14, 15, 16, 17],
  [49, 50, 16, 17],
  // Western & Eastern connectors (North Road → Middle roads)
  [16, 17, 20, 32],
  [47, 48, 20, 32],
  // Middle roads: Archive ⟷ Plaza ⟷ Toolshed
  [13, 27, 33, 34],
  [37, 51, 33, 34],
  // Short spurs to the Inn and the Cottage
  [26, 28, 24, 25],
  [36, 37, 24, 25],
  // South Avenue (Plaza → Pond → South Crossing)
  [31, 32, 38, 41],
  [31, 32, 46, 48],
  // Roads down to the Festival / Cinema road
  [19, 20, 35, 49],
  [44, 45, 35, 49],
  // South Road: Festival ⟷ Cinema
  [18, 46, 50, 51],
];

function inRect(tx, ty, r) {
  return tx >= r[0] && tx <= r[1] && ty >= r[2] && ty <= r[3];
}

export function isPondTile(tx, ty) {
  return (
    tx >= POND.minX &&
    tx <= POND.maxX &&
    ty >= POND.minY &&
    ty <= POND.maxY &&
    tx !== POND.bridgeX
  );
}

export function isVillageCobble(tx, ty) {
  for (const r of COBBLE_RECTS) {
    if (inRect(tx, ty, r)) return true;
  }
  return false;
}

export function isVillagePath(tx, ty) {
  // If it's already a cobblestone plaza/platform, it's not a dirt path
  if (isVillageCobble(tx, ty)) return false;
  for (const r of PATH_RECTS) {
    if (inRect(tx, ty, r)) return true;
  }
  return false;
}

export function isGround(tx, ty) {
  return isVillagePath(tx, ty) || isVillageCobble(tx, ty);
}

export function getPathTileInfo(tx, ty) {
  const isCobble = isVillageCobble(tx, ty);
  const isPath = isVillagePath(tx, ty);

  if (!isCobble && !isPath) {
    return null;
  }

  if (isCobble) {
    const upGrass = !isGround(tx, ty - 1);
    const downGrass = !isGround(tx, ty + 1);
    if (upGrass && !downGrass) {
      return { col: 6, row: 6 }; // cobble_edge_top
    }
    if (downGrass && !upGrass) {
      return { col: 7, row: 6 }; // cobble_edge_bottom
    }
    return { col: 4, row: 1 }; // cobble_square
  }

  // Dirt Path autotiling:
  const upGrass = !isGround(tx, ty - 1);
  const downGrass = !isGround(tx, ty + 1);
  const leftGrass = !isGround(tx - 1, ty);
  const rightGrass = !isGround(tx + 1, ty);

  // 1. Corners (both vertical & horizontal edges are grass)
  if (upGrass && leftGrass) {
    return { col: 2, row: 6 }; // dirt_corner_tl
  }
  if (upGrass && rightGrass) {
    return { col: 3, row: 6 }; // dirt_corner_tr
  }
  if (downGrass && leftGrass) {
    return { col: 4, row: 6 }; // dirt_corner_bl
  }
  if (downGrass && rightGrass) {
    return { col: 5, row: 6 }; // dirt_corner_br
  }

  // 2. Cardinal Edges
  if (upGrass) {
    return { col: 5, row: 0 }; // dirt_edge_top
  }
  if (downGrass) {
    return { col: 6, row: 0 }; // dirt_edge_bottom
  }
  if (leftGrass) {
    return { col: 0, row: 6 }; // dirt_edge_left
  }
  if (rightGrass) {
    return { col: 1, row: 6 }; // dirt_edge_right
  }

  // 3. Interior Dirt Center
  const pathDetail = hash2D(tx, ty, 888) % 10;
  if (pathDetail === 0) {
    return { col: 4, row: 1 }; // Embedded cobble paver (the only detail kept; others looked like holes)
  }
  return { col: 4, row: 0 }; // Smooth packed dirt center
}

export function hash2D(x, y, seed = 12345) {
  let h = (x * 374761393 + y * 668265263 + seed) ^ 0x5bf03635;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return (h ^ (h >>> 16)) >>> 0;
}

export function getGroundTile(tx, ty) {
  // 1. Woodland Pond shoreline (within 2 tiles of water): high density of bluebells & river pebbles
  const distPondX = Math.max(0, POND.minX - tx, tx - POND.maxX);
  const distPondY = Math.max(0, POND.minY - ty, ty - POND.maxY);
  if (distPondX <= 2 && distPondY <= 2 && (distPondX > 0 || distPondY > 0)) {
    const h = hash2D(tx, ty, 101);
    if (h % 3 === 0) return { col: 3, row: 0 }; // River pebbles & bluebell
    if (h % 3 === 1) return { col: 1, row: 0 }; // Lush clover tuft
    return { col: 0, row: 7 }; // Shaded emerald moss
  }

  // 2. Archive Cellar ancient mossy glade: mossy stones and shaded forest floor
  if (tx >= 8 && tx <= 16 && ty >= 28 && ty <= 36) {
    const h = hash2D(tx, ty, 202);
    if (h % 4 === 0) return { col: 3, row: 0 }; // Mossy stone
    if (h % 4 === 1) return { col: 0, row: 7 }; // Shaded mossy grass
    if (h % 4 === 2) return { col: 1, row: 7 }; // Autumn leaves
    return { col: 0, row: 0 };
  }

  // 2b. Toolshed workshop yard: trampled soil, pebbles and wood chips
  if (tx >= 49 && tx <= 55 && ty >= 29 && ty <= 36) {
    const h = hash2D(tx, ty, 212);
    if (h % 4 === 0) return { col: 7, row: 0 }; // Bare soil patch
    if (h % 4 === 1) return { col: 3, row: 0 }; // Pebbles
    if (h % 4 === 2) return { col: 1, row: 7 }; // Fallen leaves / chips
    return { col: 0, row: 0 };
  }

  // 3. Festival Grounds & Moonlight Cinema glades: wildflower blooms
  if ((tx >= 12 && tx <= 22 && ty >= 45 && ty <= 54) || (tx >= 42 && tx <= 54 && ty >= 45 && ty <= 54)) {
    const h = hash2D(tx, ty, 303);
    if (h % 5 === 0) return { col: 2, row: 0 }; // Scarlet poppies
    if (h % 5 === 1) return { col: 2, row: 7 }; // Yellow buttercups & purple clover
    if (h % 5 === 2) return { col: 1, row: 0 }; // White daisies & clover
    return { col: 0, row: 0 };
  }

  // 3b. Town Square garden lawns (Inn / Cottage surroundings): gentle wildflowers
  if ((tx >= 20 && tx <= 27 && ty >= 19 && ty <= 26) || (tx >= 37 && tx <= 44 && ty >= 18 && ty <= 26)) {
    const h = hash2D(tx, ty, 313);
    if (h % 6 === 0) return { col: 1, row: 0 }; // Clover
    if (h % 6 === 1) return { col: 2, row: 7 }; // Buttercups
    return { col: 0, row: 0 };
  }

  // 4. Farmstead surroundings: exposed fertile soil patches & sprouts
  if (tx >= 9 && tx <= 18 && ty >= 12 && ty <= 18) {
    const h = hash2D(tx, ty, 404);
    if (h % 6 === 0) return { col: 7, row: 0 }; // Soil patch
    if (h % 6 === 1) return { col: 1, row: 0 }; // Clover
    return { col: 0, row: 0 };
  }

  // 5. Deep Forest Margins (tx <= 8 || tx >= 55 || ty <= 8 || ty >= 55): moss and leaves
  if (tx <= 8 || tx >= 55 || ty <= 8 || ty >= 55) {
    const h = hash2D(tx, ty, 505);
    if (h % 4 === 0) return { col: 0, row: 7 }; // Deep emerald moss
    if (h % 4 === 1) return { col: 1, row: 7 }; // Scattered leaves
    if (h % 6 === 2) return { col: 3, row: 0 }; // Forest pebbles
    return { col: 0, row: 0 };
  }

  // 6. General organic meadow (clustered noise eliminating repetitive patterns)
  const clumpNoise = hash2D(Math.floor(tx / 3), Math.floor(ty / 3), 606);
  const detailNoise = hash2D(tx, ty, 707);
  if (clumpNoise % 5 === 0) {
    // Wildflower meadow cluster
    if (detailNoise % 3 === 0) return { col: 2, row: 0 }; // Poppies
    if (detailNoise % 3 === 1) return { col: 2, row: 7 }; // Buttercups
    return { col: 1, row: 0 }; // Daisies & clover
  }
  if (clumpNoise % 7 === 0) {
    // Rocky pebble & moss outcrop
    return (detailNoise % 2 === 0) ? { col: 3, row: 0 } : { col: 0, row: 7 };
  }
  if (detailNoise % 5 === 0) {
    return { col: 1, row: 0 }; // Clover tuft
  }
  if (detailNoise % 9 === 0) {
    return { col: 1, row: 7 }; // Scattered leaf
  }
  return { col: 0, row: 0 }; // Balanced smooth grass plain
}

export function generateForestTrees() {
  const trees = [];
  const occupied = new Set();

  // Rectangles kept free of trees (inclusive tile bounds)
  const BUILDING_RESERVES = [
    { minX: 9, maxX: 20, minY: 9, maxY: 17 }, // Farmstead + garden + cart yard
    { minX: 46, maxX: 54, minY: 9, maxY: 17 }, // Ledger Hut + courtyard
    { minX: 29, maxX: 35, minY: 7, maxY: 16 }, // Bell Tower
    { minX: 27, maxX: 37, minY: 27, maxY: 37 }, // Central Plaza
    { minX: 28, maxX: 36, minY: 20, maxY: 26 }, // Notice Board square
    { minX: 20, maxX: 27, minY: 19, maxY: 25 }, // Whispering Pines Inn
    { minX: 37, maxX: 43, minY: 18, maxY: 25 }, // Lavender Artisan Cottage
    { minX: 8, maxX: 16, minY: 27, maxY: 36 }, // Archive Cellar
    { minX: 49, maxX: 55, minY: 29, maxY: 36 }, // Toolshed Workshop yard
    { minX: 28, maxX: 36, minY: 40, maxY: 47 }, // Pond + shoreline
    { minX: 42, maxX: 46, minY: 23, maxY: 27 }, // Sky Post
    { minX: 18, maxX: 21, minY: 23, maxY: 26 }, // Wishing Well
  ];

  function isClearForTree(tx, ty) {
    if (tx < 1 || tx > 62 || ty < 1 || ty > 62) return false;
    if (isGround(tx, ty)) return false;

    // Circular clearings for Festival & Cinema
    const dFest = (tx - 16) ** 2 + (ty - 50) ** 2;
    if (dFest <= 22) return false;
    const dCinema = (tx - 48) ** 2 + (ty - 50) ** 2;
    if (dCinema <= 22) return false;

    for (const b of BUILDING_RESERVES) {
      if (tx >= b.minX && tx <= b.maxX && ty >= b.minY && ty <= b.maxY) return false;
    }
    return true;
  }

  function addTree(x, y, type) {
    if (!isClearForTree(x, y)) return false;
    const k = `${x},${y}`;
    if (occupied.has(k) || occupied.has(`${x - 1},${y}`) || occupied.has(`${x + 1},${y}`)) return false;
    occupied.add(k);
    trees.push({ x, y, type });
    return true;
  }

  // 1. Dense Perimeter border trees (North, South, West, East)
  for (let y = 1; y <= 6; y++) {
    const startX = (y % 2 === 0) ? 1 : 2;
    for (let x = startX; x <= 62; x += 2) {
      const r = hash2D(x, y) % 3;
      addTree(x, y, r === 0 ? 'oak' : (r === 1 ? 'pine' : 'blossom'));
    }
  }
  for (let y = 57; y <= 62; y++) {
    const startX = (y % 2 === 0) ? 1 : 2;
    for (let x = startX; x <= 62; x += 2) {
      const r = hash2D(x, y) % 3;
      addTree(x, y, r === 0 ? 'oak' : (r === 1 ? 'pine' : 'blossom'));
    }
  }
  for (let y = 7; y <= 56; y++) {
    for (let x = 1; x <= 6; x += 2) {
      const r = hash2D(x, y) % 3;
      addTree(x, y, r === 0 ? 'oak' : (r === 1 ? 'pine' : 'blossom'));
    }
    for (let x = 57; x <= 62; x += 2) {
      const r = hash2D(x, y) % 3;
      addTree(x, y, r === 0 ? 'oak' : (r === 1 ? 'pine' : 'blossom'));
    }
  }

  // 2. Internal woodland groves (kept mirrored so both halves of the village feel balanced)
  const internalGroves = [
    { minX: 21, maxX: 28, minY: 7, maxY: 16 }, // North Copse West (Farmstead ⟷ Bell Tower)
    { minX: 36, maxX: 45, minY: 7, maxY: 16 }, // North Copse East (Bell Tower ⟷ Ledger Hut)
    { minX: 2, maxX: 9, minY: 18, maxY: 26 }, // West woods (north)
    { minX: 10, maxX: 14, minY: 21, maxY: 25 }, // Small orchard copse west of the connector
    { minX: 2, maxX: 8, minY: 27, maxY: 35 }, // West woods behind Archive
    { minX: 2, maxX: 11, minY: 36, maxY: 44 }, // South-west woods
    { minX: 50, maxX: 60, minY: 19, maxY: 27 }, // North-east woods
    { minX: 56, maxX: 60, minY: 28, maxY: 35 }, // East woods behind Toolshed
    { minX: 52, maxX: 60, minY: 36, maxY: 44 }, // South-east woods
    { minX: 21, maxX: 27, minY: 38, maxY: 49 }, // West of Pond
    { minX: 37, maxX: 43, minY: 38, maxY: 49 }, // East of Pond
    { minX: 2, maxX: 12, minY: 45, maxY: 60 }, // West of Festival
    { minX: 52, maxX: 62, minY: 45, maxY: 60 }, // East of Cinema
    { minX: 21, maxX: 43, minY: 52, maxY: 58 }, // Southern wilderness
  ];

  for (const g of internalGroves) {
    for (let y = g.minY; y <= g.maxY; y += 2) {
      const startX = (y % 2 === 0) ? g.minX : g.minX + 1;
      for (let x = startX; x <= g.maxX; x += 2) {
        const r = hash2D(x, y, 777) % 6;
        if (r !== 5) {
          addTree(x, y, r === 0 || r === 3 ? 'oak' : (r === 1 || r === 4 ? 'pine' : 'blossom'));
        }
      }
    }
  }

  return trees;
}

export const FOREST_TREES = generateForestTrees();

export const FOREST_PROPS = [
  // Mossy river boulders around Woodland Pond
  { x: 29, y: 42, type: 'rock' },
  { x: 35, y: 42, type: 'rock' },
  { x: 28, y: 45, type: 'rock' },
  { x: 36, y: 45, type: 'rock' },
  { x: 29, y: 46, type: 'rock' },
  { x: 35, y: 46, type: 'rock' },
  // River slate stepping stones
  { x: 30, y: 41, type: 'rock_slate' },
  { x: 34, y: 41, type: 'rock_slate' },
  { x: 30, y: 46, type: 'rock_slate' },
  { x: 34, y: 46, type: 'rock_slate' },
  // Ancient stone monuments & shrines
  { x: 36, y: 9, type: 'stone_monument' }, // Bell Tower meditative garden
  { x: 9, y: 30, type: 'stone_monument' }, // Archive Cellar ancient verge
  { x: 55, y: 32, type: 'stone_monument' }, // Toolshed yard marker stone
  // Mossy boulders near Archive Cellar
  { x: 9, y: 31, type: 'rock' },
  { x: 15, y: 31, type: 'rock' },
  { x: 10, y: 35, type: 'rock' },
  // Boulders near the Toolshed (mirrors the Archive)
  { x: 55, y: 35, type: 'rock' },
  { x: 49, y: 31, type: 'rock' },
  // Fallen logs in the forest borders & margins
  { x: 20, y: 6, type: 'log' },
  { x: 44, y: 6, type: 'log' },
  { x: 7, y: 22, type: 'log' },
  { x: 7, y: 44, type: 'log' },
  { x: 57, y: 20, type: 'log' },
  { x: 57, y: 46, type: 'log' },
  { x: 26, y: 46, type: 'log' },
  { x: 38, y: 46, type: 'log' },
  // Amanita & golden mushroom clusters under the forest canopies & Archive Cellar
  { x: 8, y: 34, type: 'mushrooms' },
  { x: 10, y: 33, type: 'mushrooms' },
  { x: 11, y: 31, type: 'mushrooms' },
  { x: 14, y: 35, type: 'mushrooms' },
  { x: 15, y: 30, type: 'mushrooms' },
  { x: 16, y: 34, type: 'mushrooms' },
  { x: 22, y: 15, type: 'mushrooms' },
  { x: 42, y: 15, type: 'mushrooms' },
  { x: 26, y: 43, type: 'mushrooms' },
  { x: 38, y: 43, type: 'mushrooms' },
  { x: 54, y: 36, type: 'mushrooms' },
  { x: 56, y: 30, type: 'mushrooms' },
  { x: 23, y: 50, type: 'mushrooms' },
  { x: 41, y: 50, type: 'mushrooms' },
  { x: 30, y: 8, type: 'mushrooms' },
  { x: 34, y: 8, type: 'mushrooms' },
  // Decorative weathered tree stumps
  { x: 9, y: 34, type: 'stump' }, // Archive Cellar ancient grove
  { x: 54, y: 34, type: 'stump' }, // Toolshed chopping block
  { x: 24, y: 12, type: 'stump' }, // Forest path stump
  { x: 40, y: 12, type: 'stump' }, // Forest path stump
  { x: 46, y: 28, type: 'stump' }, // Sky Post forest path stump
];

export const INTERNAL_TREE_TRUNKS = new Set(
  FOREST_TREES.filter((t) => t.x >= 6 && t.x <= 58 && t.y >= 6 && t.y <= 58).map((t) => `${t.x},${t.y}`)
);

export function getHitBuilding(wx, wy) {
  for (const b of BUILDING_HITBOXES) {
    if (wx >= b.minX && wx <= b.maxX && wy >= b.minY && wy <= b.maxY) {
      return b;
    }
  }
  return null;
}

export function isWalkable(wx, wy) {
  // 1. Outer forest boundary (Zone A surrounds the 64x64 village)
  if (wx < 6 * TILE_SIZE || wx > 58 * TILE_SIZE || wy < 6 * TILE_SIZE || wy > 58 * TILE_SIZE) {
    return false;
  }

  const tx = Math.floor(wx / TILE_SIZE);
  const ty = Math.floor(wy / TILE_SIZE);

  // 2. Woodland Pond - footbridge column is walkable
  if (isPondTile(tx, ty)) {
    return false;
  }

  // 3. Central Village Stone Fountain basin (tx: 32, ty: 31)
  if (tx === 32 && ty === 31) {
    return false;
  }

  // 4. Chapter 1: The Farmstead Cabin walls & roof (tx: 12..16, ty: 10..13)
  if (tx >= 12 && tx <= 16 && ty >= 10 && ty <= 13) {
    return false;
  }

  // 5. Chapter 2: The Ledger / Bank structure (tx: 48..52, ty: 10..13)
  if (tx >= 48 && tx <= 52 && ty >= 10 && ty <= 13) {
    return false;
  }

  // 6. Chapter 3: The Bell Tower masonry (tx: 31..33, ty: 9..13)
  if (tx >= 31 && tx <= 33 && ty >= 9 && ty <= 13) {
    return false;
  }

  // 7. Chapter 4: The Notice Board posts
  if (tx >= NOTICE.x - 1 && tx <= NOTICE.x + 1 && ty === NOTICE.y) {
    return false;
  }

  // 8. Chapter 5: The Festival Grounds stage & canopy (tx: 14..18, ty: 47..49)
  if (tx >= 14 && tx <= 18 && ty >= 47 && ty <= 49) {
    return false;
  }

  // 9. Chapter 6: The Moonlight Cinema screen & stage (tx: 46..50, ty: 47..49)
  if (tx >= 46 && tx <= 50 && ty >= 47 && ty <= 49) {
    return false;
  }

  // 10. Chapter 7: The Archive Cellar stone walls (tx: 10..14, ty: 29..32)
  if (tx >= 10 && tx <= 14 && ty >= 29 && ty <= 32) {
    return false;
  }

  // 11. Chapter 8: The Toolshed Workbench & Forge (two rows above its door)
  if (tx >= TOOLSHED.x - 2 && tx <= TOOLSHED.x + 2 && ty >= TOOLSHED.y - 4 && ty <= TOOLSHED.y - 1) {
    return false;
  }

  // 12. Farmstead Garden Fences (farm gate at tx: 14..15 is open and walkable)
  if ((tx >= 10 && tx <= 13 && ty === 16) || (tx >= 16 && tx <= 17 && ty === 16)) {
    return false;
  }

  // 13. The Whispering Pines Inn walls
  if (tx >= INN.x - 2 && tx <= INN.x + 1 && ty >= INN.y - 3 && ty <= INN.y - 1) {
    return false;
  }

  // 14. Lavender Artisan Cottage walls
  if (tx >= COTTAGE.x - 2 && tx <= COTTAGE.x + 1 && ty >= COTTAGE.y - 4 && ty <= COTTAGE.y - 1) {
    return false;
  }

  // 15. Village Market Produce Stall counter (tx: 35..36, ty: 31)
  if ((tx === 35 || tx === 36) && ty === 31) {
    return false;
  }

  // 16. Wishing Well basin
  if ((tx === WISHING_WELL.x || tx === WISHING_WELL.x + 1) && ty === WISHING_WELL.y) {
    return false;
  }

  // 17. Internal woodland tree trunks (outer forest boundary is already impassable)
  if (INTERNAL_TREE_TRUNKS.has(`${tx},${ty}`)) {
    return false;
  }

  return true;
}

export function getKeyboardVelocity(activeKeys) {
  let vx = 0;
  let vy = 0;
  if (activeKeys.has('KeyW') || activeKeys.has('ArrowUp')) vy -= 1;
  if (activeKeys.has('KeyS') || activeKeys.has('ArrowDown')) vy += 1;
  if (activeKeys.has('KeyA') || activeKeys.has('ArrowLeft')) vx -= 1;
  if (activeKeys.has('KeyD') || activeKeys.has('ArrowRight')) vx += 1;

  if (vx !== 0 && vy !== 0) {
    const len = Math.hypot(vx, vy);
    vx /= len;
    vy /= len;
  }
  return { vx, vy };
}

export function getNearbyBuilding(pipX, pipY, threshold = 40) {
  let closest = null;
  let minDist = threshold;
  for (const b of BUILDING_HITBOXES) {
    const dist = Math.hypot(pipX - b.doorX, pipY - b.doorY);
    if (dist < minDist) {
      minDist = dist;
      closest = b;
    }
  }
  return closest;
}

/**
 * Dialogue visibility logic:
 * - On initial login/refresh: shows Welcome dialogue box once.
 * - Once the character starts interacting (moving, clicking, opening chapters):
 *   dialogue box hides during open-world roaming.
 * - Dialogue box ONLY shows when actively interacting:
 *   1) Approaching a building (proximity to resident/door)
 *   2) Inside a chapter (activeTab is non-null)
 */
export function shouldShowDialogue({ activeTab = null, hasInteracted = false, nearbyBuilding = null } = {}) {
  if (activeTab !== null && activeTab !== undefined) return true;
  if (!hasInteracted) return true;
  if (nearbyBuilding !== null && nearbyBuilding !== undefined) return true;
  return false;
}

/**
 * HUD controls guide logic:
 * - On initial login/refresh: shows full movement & entry controls guide once.
 * - Once interacting / roaming: hidden to keep top HUD clean.
 * - When approaching a building: shows proximity prompt [E] Enter • [P] Panel Only.
 * - Inside a chapter: null (the top bar renders Village Map (Esc) button instead).
 */
export function getHudControlsGuide({ activeTab = null, hasInteracted = false, nearbyBuilding = null } = {}) {
  if (activeTab !== null && activeTab !== undefined) return null;
  if (!hasInteracted) {
    return '🎮 WASD / Arrows to Walk • [E] Enter • [P] Panel Only';
  }
  if (nearbyBuilding) {
    return '🚪 [E] Enter • [P] Panel Only';
  }
  return null;
}

function createInitialFireflies() {
  return Array.from({ length: 24 }, (_, i) => {
    let bx = 32 * 16, by = 44 * 16;
    const r1 = ((hash2D(i, 11) % 1000) / 1000 - 0.5) * 16;
    const r2 = ((hash2D(i, 22) % 1000) / 1000 - 0.5) * 16;
    if (i < 8) {
      bx = (9 + (i % 4) * 2) * 16 + r1;
      by = (30 + Math.floor(i / 4) * 3) * 16 + r2;
    } else if (i < 16) {
      bx = (29 + (i % 4) * 2) * 16 + r1;
      by = (42 + Math.floor((i - 8) / 4) * 2) * 16 + r2;
    } else if (i < 20) {
      bx = (29 + (i - 16) * 2) * 16 + r1;
      by = (9 + ((i - 16) % 2) * 3) * 16 + r2;
    } else {
      bx = (45 + (i - 20) * 2) * 16 + r1;
      by = (46 + ((i - 20) % 2) * 3) * 16 + r2;
    }
    return {
      x: bx,
      y: by,
      baseX: bx,
      baseY: by,
      phase: ((hash2D(i, 33) % 1000) / 1000) * Math.PI * 2,
      pulsePhase: ((hash2D(i, 44) % 1000) / 1000) * Math.PI * 2,
    };
  });
}

function createInitialPetals() {
  const colors = ['#fbcfe8', '#f472b6', '#fda4af', '#f9a8d4', '#fef08a'];
  return Array.from({ length: 32 }, (_, i) => {
    return {
      x: ((hash2D(i, 55) % 1000) / 1000) * (64 * 16),
      y: ((hash2D(i, 66) % 1000) / 1000) * (64 * 16),
      speedX: ((hash2D(i, 77) % 1000) / 1000) * 0.5 + 0.5,
      speedY: ((hash2D(i, 88) % 1000) / 1000) * 0.6 + 0.6,
      swayPhase: ((hash2D(i, 99) % 1000) / 1000) * Math.PI * 2,
      angle: ((hash2D(i, 111) % 1000) / 1000) * Math.PI * 2,
      rotSpeed: (((hash2D(i, 122) % 1000) / 1000) - 0.5) * 0.06,
      color: colors[i % colors.length],
      rx: ((hash2D(i, 133) % 1000) / 1000) * 1.5 + 3.2,
      ry: ((hash2D(i, 144) % 1000) / 1000) * 1 + 1.8,
      alpha: ((hash2D(i, 155) % 1000) / 1000) * 0.25 + 0.65,
    };
  });
}

function createInitialRain() {
  return Array.from({ length: 48 }, (_, i) => ({
    id: i,
    x: ((hash2D(i, 201) % 1000) / 1000) * (64 * 16),
    y: ((hash2D(i, 202) % 1000) / 1000) * (64 * 16),
    speed: ((hash2D(i, 203) % 1000) / 1000) * 2.5 + 4.5,
    len: ((hash2D(i, 204) % 1000) / 1000) * 5 + 7,
    alpha: ((hash2D(i, 205) % 1000) / 1000) * 0.25 + 0.35,
  }));
}

function isSteppingStoneTile(tx, ty) {
  // Flagstone paver paths leading to building entrances & fountain (reference style)
  if (tx === 14 && ty >= 15 && ty <= 17) return true; // Farmstead entrance
  if (tx === 32 && ty >= 15 && ty <= 17) return true; // Bell Tower entrance
  if (tx === 50 && ty >= 15 && ty <= 17) return true; // Bank entrance
  if (tx === 32 && ty >= 22 && ty <= 24) return true; // Notice Board approach
  if (tx === 24 && ty >= 25 && ty <= 27) return true; // Inn entrance
  if (tx === 40 && ty >= 25 && ty <= 27) return true; // Cottage entrance
  if (tx === 52 && (ty === 33 || ty === 34)) return true; // Toolshed entrance
  if (tx === 12 && (ty === 33 || ty === 34)) return true; // Archive entrance
  if (tx === 16 && (ty === 49 || ty === 50)) return true; // Festival entrance
  if (tx === 48 && (ty === 49 || ty === 50)) return true; // Cinema entrance
  if (tx === 32 && ty >= 33 && ty <= 41 && ty % 2 === 0) return true; // South Road stepping accents
  if (ty === 32 && (tx === 30 || tx === 31 || tx === 33 || tx === 34)) return true; // Plaza cross
  return false;
}

// ── Pure Drawing Helpers matching reference screenshot aesthetics ──
function drawSingleLog(ctx, lx, ly, len, dia) {
  // Drop shadow
  ctx.fillStyle = 'rgba(40, 30, 20, 0.4)';
  ctx.fillRect(lx, ly + dia - 1, len, 2);
  // Bark body
  ctx.fillStyle = '#78350f';
  ctx.fillRect(lx, ly, len - 3, dia);
  // Bark texture grooves
  ctx.fillStyle = '#451a03';
  ctx.fillRect(lx + 2, ly + 2, len - 6, 1);
  ctx.fillRect(lx + 4, ly + 4, len - 8, 1);
  // Bark top highlight
  ctx.fillStyle = '#92400e';
  ctx.fillRect(lx, ly, len - 3, 1);

  // Cut end face
  const ex = lx + len - 3;
  ctx.fillStyle = '#fef08a';
  ctx.beginPath();
  ctx.ellipse(ex, ly + dia / 2, 3, dia / 2, 0, 0, Math.PI * 2);
  ctx.fill();
  // Cut ring line
  ctx.strokeStyle = '#b45309';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(ex, ly + dia / 2, 2, dia / 2 - 1, 0, 0, Math.PI * 2);
  ctx.stroke();
  // Heartwood center
  ctx.fillStyle = '#451a03';
  ctx.fillRect(ex - 0.5, ly + dia / 2 - 0.5, 1, 1);
}

function drawStackedFirewood(ctx, x, y) {
  ctx.save();
  // 3 neatly stacked timber firewood logs (2 on bottom, 1 on top)
  drawSingleLog(ctx, x, y + 4, 16, 7);
  drawSingleLog(ctx, x + 8, y + 4, 16, 7);
  drawSingleLog(ctx, x + 4, y - 2, 16, 7);
  ctx.restore();
}

function drawHangingSignpost(ctx, x, y) {
  ctx.save();
  // Two vertical timber posts
  ctx.fillStyle = '#78350f';
  ctx.fillRect(x, y - 4, 3, 18);
  ctx.fillRect(x + 16, y - 4, 3, 18);
  ctx.fillStyle = '#a16207';
  ctx.fillRect(x, y - 4, 1, 18);
  ctx.fillRect(x + 16, y - 4, 1, 18);
  // Top horizontal crossbeam
  ctx.fillStyle = '#78350f';
  ctx.fillRect(x - 2, y - 6, 23, 3);
  ctx.fillStyle = '#d97706';
  ctx.fillRect(x - 2, y - 6, 23, 1);

  // Hanging iron links
  ctx.fillStyle = '#475569';
  ctx.fillRect(x + 4, y - 3, 1, 3);
  ctx.fillRect(x + 14, y - 3, 1, 3);

  // Carved wooden board
  ctx.fillStyle = '#a16207';
  ctx.fillRect(x + 2, y, 15, 10);
  ctx.fillStyle = '#ca8a04';
  ctx.fillRect(x + 3, y + 1, 13, 8);
  // Inscribed text lines
  ctx.fillStyle = '#5c2d0c';
  ctx.fillRect(x + 5, y + 3, 9, 1);
  ctx.fillRect(x + 5, y + 5, 7, 1);
  ctx.fillRect(x + 5, y + 7, 8, 1);
  ctx.restore();
}

function drawTimberBracketLantern(ctx, x, y, animFrame, flip = false) {
  ctx.save();
  const dir = flip ? -1 : 1;

  // Post shadow
  ctx.fillStyle = 'rgba(40, 30, 20, 0.45)';
  ctx.fillRect(x - 2, y + 15, 6, 2);

  // Vertical timber post
  ctx.fillStyle = '#78350f';
  ctx.fillRect(x, y - 6, 3, 22);
  ctx.fillStyle = '#a16207';
  ctx.fillRect(x, y - 6, 1, 22);
  ctx.fillStyle = '#d97706';
  ctx.fillRect(x - 1, y - 7, 5, 2);

  // Horizontal bracket arm
  const armLen = 8;
  const armX = dir === 1 ? x + 2 : x - armLen;
  ctx.fillStyle = '#78350f';
  ctx.fillRect(armX, y - 5, armLen, 3);
  ctx.fillStyle = '#a16207';
  ctx.fillRect(armX, y - 5, armLen, 1);

  // Diagonal support strut
  const strutX = dir === 1 ? x + 2 : x - 3;
  ctx.fillStyle = '#5c2d0c';
  ctx.fillRect(strutX, y - 1, 3, 2);

  // Iron chain & lantern cap
  const lanternX = dir === 1 ? x + armLen - 1 : x - armLen + 1;
  ctx.fillStyle = '#334155';
  ctx.fillRect(lanternX, y - 2, 1, 3);
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(lanternX - 2, y + 1, 5, 2);
  ctx.fillRect(lanternX - 2, y + 8, 5, 2);

  // Glowing lantern glass
  const flicker = Math.sin(animFrame * 0.2 + x) * 0.15;
  ctx.fillStyle = '#c084fc'; // Purple/violet glass frame
  ctx.fillRect(lanternX - 2, y + 3, 5, 5);
  ctx.fillStyle = '#fde047'; // Golden flame core
  ctx.fillRect(lanternX - 1, y + 4, 3, 3);

  // Soft ambient lantern glow halo
  const glowGrad = ctx.createRadialGradient(lanternX, y + 5, 1, lanternX, y + 5, 12);
  glowGrad.addColorStop(0, `rgba(254, 240, 138, ${(0.35 + flicker).toFixed(2)})`);
  glowGrad.addColorStop(0.5, 'rgba(192, 132, 252, 0.12)');
  glowGrad.addColorStop(1, 'rgba(192, 132, 252, 0)');
  ctx.fillStyle = glowGrad;
  ctx.beginPath();
  ctx.arc(lanternX, y + 5, 12, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawFencedGardenPlot(ctx, gx, gy, animFrame) {
  ctx.save();
  const width = 56;
  const height = 44;

  // Plot furrow loam
  ctx.fillStyle = '#5c3a1e';
  ctx.fillRect(gx, gy, width, height);

  const rowY1 = gy + 8;
  const rowY2 = gy + 20;
  const rowY3 = gy + 32;

  // Furrow ridges
  [rowY1, rowY2, rowY3].forEach((ry) => {
    ctx.fillStyle = '#4a2c14';
    ctx.fillRect(gx + 4, ry - 3, width - 8, 7);
    ctx.fillStyle = '#6d4524';
    ctx.fillRect(gx + 4, ry - 3, width - 8, 1);
  });

  // Row 1: Golden Wheat Sheaves
  const wheatCount = 7;
  for (let w = 0; w < wheatCount; w++) {
    const wx = gx + 7 + w * 6;
    const sway = Math.sin(animFrame * 0.08 + w) * 0.8;
    ctx.fillStyle = '#ca8a04';
    ctx.fillRect(wx, rowY1 - 2, 1, 5);
    ctx.fillStyle = '#eab308';
    ctx.fillRect(wx - 1 + sway, rowY1 - 6, 3, 4);
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(wx + sway, rowY1 - 7, 2, 2);
  }

  // Row 2: Tender Green Sprouts
  const sproutCount = 7;
  for (let s = 0; s < sproutCount; s++) {
    const sx = gx + 7 + s * 6;
    ctx.fillStyle = '#15803d';
    ctx.fillRect(sx, rowY2 - 1, 1, 4);
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(sx - 2, rowY2 - 3, 2, 2);
    ctx.fillRect(sx + 1, rowY2 - 3, 2, 2);
    ctx.fillStyle = '#86efac';
    ctx.fillRect(sx - 1, rowY2 - 4, 1, 1);
    ctx.fillRect(sx + 2, rowY2 - 4, 1, 1);
  }

  // Row 3: Blooming Garden Flowers (Red, Blue, White)
  const flowerColors = ['#ef4444', '#38bdf8', '#ffffff', '#ef4444', '#38bdf8', '#ffffff', '#f43f5e'];
  for (let f = 0; f < flowerColors.length; f++) {
    const fx = gx + 7 + f * 6;
    ctx.fillStyle = '#16a34a';
    ctx.fillRect(fx, rowY3 - 1, 1, 4);
    ctx.fillStyle = flowerColors[f];
    ctx.fillRect(fx - 1, rowY3 - 4, 3, 3);
    ctx.fillStyle = '#facc15';
    ctx.fillRect(fx, rowY3 - 3, 1, 1);
  }

  // Enclosing Split-Rail Wooden Fence
  const postPositions = [
    { x: gx + 2, y: gy },
    { x: gx + 18, y: gy },
    { x: gx + 36, y: gy },
    { x: gx + width - 4, y: gy },
    { x: gx + width - 4, y: gy + 18 },
    { x: gx + width - 4, y: gy + height - 4 },
    { x: gx + 36, y: gy + height - 4 },
    { x: gx + 18, y: gy + height - 4 },
    { x: gx + 2, y: gy + height - 4 },
    { x: gx + 2, y: gy + 18 },
  ];

  ctx.fillStyle = '#78350f';
  // Top rails
  ctx.fillRect(gx + 2, gy + 3, width - 6, 2);
  ctx.fillRect(gx + 2, gy + 7, width - 6, 2);
  // Bottom rails
  ctx.fillRect(gx + 2, gy + height - 6, width - 6, 2);
  ctx.fillRect(gx + 2, gy + height - 2, width - 6, 2);
  // Side vertical rails
  ctx.fillRect(gx + 3, gy + 3, 2, height - 5);
  ctx.fillRect(gx + width - 5, gy + 3, 2, height - 5);

  ctx.fillStyle = '#b45309';
  ctx.fillRect(gx + 2, gy + 3, width - 6, 1);
  ctx.fillRect(gx + 2, gy + height - 6, width - 6, 1);

  // Fence Posts
  postPositions.forEach((pos) => {
    ctx.fillStyle = 'rgba(40, 30, 20, 0.4)';
    ctx.fillRect(pos.x - 1, pos.y + 10, 4, 2);
    ctx.fillStyle = '#78350f';
    ctx.fillRect(pos.x, pos.y, 3, 11);
    ctx.fillStyle = '#d97706';
    ctx.fillRect(pos.x, pos.y, 1, 11);
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(pos.x, pos.y, 3, 1);
  });

  // Directional Wooden Signpost
  const sx = gx + width - 6;
  const sy = gy + height - 2;
  ctx.fillStyle = '#78350f';
  ctx.fillRect(sx, sy, 3, 12);
  ctx.fillStyle = '#a16207';
  ctx.fillRect(sx - 8, sy + 2, 10, 6);
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(sx - 8, sy + 2, 10, 1);
  ctx.fillStyle = '#a16207';
  ctx.fillRect(sx - 10, sy + 4, 2, 2);

  ctx.restore();
}

function drawCozyOctagonalFountain(ctx, cx, cy, animFrame) {
  ctx.save();

  // 1. Encircling 8 rectangular stepping stone pavers
  const pavers = [
    { x: cx - 6, y: cy - 27, w: 12, h: 7 }, // North
    { x: cx - 6, y: cy + 20, w: 12, h: 7 }, // South
    { x: cx - 30, y: cy - 3, w: 11, h: 7 }, // West
    { x: cx + 19, y: cy - 3, w: 11, h: 7 }, // East
    { x: cx - 23, y: cy - 19, w: 10, h: 7 }, // North-West
    { x: cx + 13, y: cy - 19, w: 10, h: 7 }, // North-East
    { x: cx - 23, y: cy + 13, w: 10, h: 7 }, // South-West
    { x: cx + 13, y: cy + 13, w: 10, h: 7 }, // South-East
  ];

  pavers.forEach((p) => {
    ctx.fillStyle = 'rgba(68, 60, 50, 0.45)';
    ctx.fillRect(p.x, p.y + 1, p.w, p.h);
    ctx.fillStyle = '#d5cfc5';
    ctx.fillRect(p.x, p.y, p.w, p.h);
    ctx.fillStyle = '#8e887d';
    ctx.fillRect(p.x, p.y + p.h - 1, p.w, 1);
    ctx.fillRect(p.x + p.w - 1, p.y, 1, p.h);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(p.x, p.y, p.w - 1, 1);
    ctx.fillRect(p.x, p.y, 1, p.h - 1);
  });

  // 2. Octagonal Basin Outer Rim
  const outerPoly = [
    [cx - 10, cy - 21],
    [cx + 10, cy - 21],
    [cx + 25, cy - 8],
    [cx + 25, cy + 8],
    [cx + 10, cy + 21],
    [cx - 10, cy + 21],
    [cx - 25, cy + 8],
    [cx - 25, cy - 8],
  ];

  // Outer shadow
  ctx.fillStyle = 'rgba(45, 38, 30, 0.4)';
  ctx.beginPath();
  outerPoly.forEach(([px, py], idx) => {
    if (idx === 0) ctx.moveTo(px, py + 2);
    else ctx.lineTo(px, py + 2);
  });
  ctx.closePath();
  ctx.fill();

  // Stone rim base
  ctx.fillStyle = '#9e988f';
  ctx.beginPath();
  outerPoly.forEach(([px, py], idx) => {
    if (idx === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  });
  ctx.closePath();
  ctx.fill();

  // Stone rim highlights
  ctx.strokeStyle = '#f5f2eb';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - 25, cy - 8);
  ctx.lineTo(cx - 10, cy - 21);
  ctx.lineTo(cx + 10, cy - 21);
  ctx.lineTo(cx + 25, cy - 8);
  ctx.stroke();

  // Stone rim shadows
  ctx.strokeStyle = '#5c554a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx + 25, cy + 8);
  ctx.lineTo(cx + 10, cy + 21);
  ctx.lineTo(cx - 10, cy + 21);
  ctx.lineTo(cx - 25, cy + 8);
  ctx.stroke();

  // 3. Inner Water Basin
  const innerPoly = [
    [cx - 8, cy - 16],
    [cx + 8, cy - 16],
    [cx + 20, cy - 6],
    [cx + 20, cy + 6],
    [cx + 8, cy + 16],
    [cx - 8, cy + 16],
    [cx - 20, cy + 6],
    [cx - 20, cy - 6],
  ];

  ctx.fillStyle = '#443e35';
  ctx.beginPath();
  innerPoly.forEach(([px, py], idx) => {
    if (idx === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  });
  ctx.closePath();
  ctx.fill();

  // Turquoise sky-blue pool
  const waterPoly = [
    [cx - 7, cy - 15],
    [cx + 7, cy - 15],
    [cx + 19, cy - 5],
    [cx + 19, cy + 5],
    [cx + 7, cy + 15],
    [cx - 7, cy + 15],
    [cx - 19, cy + 5],
    [cx - 19, cy - 5],
  ];

  const waterGrad = ctx.createLinearGradient(cx, cy - 15, cx, cy + 15);
  waterGrad.addColorStop(0, '#38bdf8');
  waterGrad.addColorStop(0.7, '#0ea5e9');
  waterGrad.addColorStop(1, '#0284c7');

  ctx.fillStyle = waterGrad;
  ctx.beginPath();
  waterPoly.forEach(([px, py], idx) => {
    if (idx === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  });
  ctx.closePath();
  ctx.fill();

  // Animated Concentric Water Ripple Waves
  const rip1 = ((animFrame * 0.04) % 1);
  const rip2 = (((animFrame * 0.04) + 0.5) % 1);
  [rip1, rip2].forEach((prog) => {
    const rx = 4 + prog * 13;
    const ry = 3 + prog * 9;
    const alpha = (1 - prog) * 0.65;
    ctx.strokeStyle = `rgba(224, 242, 254, ${alpha.toFixed(3)})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.stroke();
  });

  // 4. Center Stone Cross-Spout Pillar
  ctx.fillStyle = '#655e54';
  ctx.fillRect(cx - 5, cy + 2, 10, 5);
  ctx.fillStyle = '#b0a99f';
  ctx.fillRect(cx - 4, cy + 1, 8, 5);
  ctx.fillStyle = '#f5f2eb';
  ctx.fillRect(cx - 4, cy + 1, 8, 1);

  // Column
  ctx.fillStyle = '#5c554a';
  ctx.fillRect(cx + 1, cy - 14, 2, 16);
  ctx.fillStyle = '#9e988f';
  ctx.fillRect(cx - 3, cy - 14, 4, 16);
  ctx.fillStyle = '#f5f2eb';
  ctx.fillRect(cx - 3, cy - 14, 1, 16);

  // Crossbar arms
  ctx.fillStyle = '#5c554a';
  ctx.fillRect(cx - 9, cy - 7, 18, 5);
  ctx.fillStyle = '#b0a99f';
  ctx.fillRect(cx - 9, cy - 8, 18, 4);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(cx - 9, cy - 8, 18, 1);
  ctx.fillStyle = '#f5f2eb';
  ctx.fillRect(cx - 9, cy - 8, 1, 4);
  ctx.fillStyle = '#5c554a';
  ctx.fillRect(cx + 8, cy - 8, 1, 4);

  // Spout top cap
  ctx.fillStyle = '#f5f2eb';
  ctx.fillRect(cx - 3, cy - 15, 6, 2);

  // Cascading water streams and splash droplets
  const splashPhase = animFrame * 0.25;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(cx - 1, cy - 16 + Math.sin(splashPhase) * 1.5, 2, 2);
  ctx.fillStyle = 'rgba(224, 242, 254, 0.85)';
  ctx.fillRect(cx - 8, cy - 4, 2, 6 + Math.sin(splashPhase * 1.3) * 2);
  ctx.fillRect(cx + 6, cy - 4, 2, 6 + Math.cos(splashPhase * 1.3) * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(cx - 9, cy + 2, 3, 1);
  ctx.fillRect(cx + 6, cy + 2, 3, 1);
  ctx.fillRect(cx - 1, cy + 5, 2, 1);

  ctx.restore();
}

export default function PixelWorldCanvas({
  activeTab = null, // null or 'map' = Full Overworld Exploration Mode
  debtsData = [],
  todosData = [],
  remindersData = [],
  deadlinesData = [],
  datesData = [],
  watchlistData = [],
  auditData = [],
  envMode = 'live',
  onSelectDebt,
  onNavigateToChapter,
  onCloseChapter,
  onPlayerInteract,
  onNearbyBuildingChange,
  reducedMotion = false,
  className = '',
  style = {},
}) {
  const canvasRef = useRef(null);
  const activeKeysRef = useRef(new Set());
  const [nearbyBuildingState, setNearbyBuildingState] = useState(null);

  const onPlayerInteractRef = useRef(onPlayerInteract);
  const onNearbyBuildingChangeRef = useRef(onNearbyBuildingChange);

  useEffect(() => {
    onPlayerInteractRef.current = onPlayerInteract;
    onNearbyBuildingChangeRef.current = onNearbyBuildingChange;
  }, [onPlayerInteract, onNearbyBuildingChange]);

  const lastReportedNearbyRef = useRef(undefined);

  const stateRef = useRef({
    images: {
      tileset: null,
      pip: null,
      bram: null,
      farmhouse: null,
      notice_board: null,
      bank: null,
      bell_tower: null,
      festival_grounds: null,
      moonlight_cinema: null,
      archive_cellar: null,
      toolshed: null,
      tree_oak: null,
      tree_pine: null,
      tree_blossom: null,
      fallen_log: null,
      rock_moss: null,
      mushrooms: null,
      fountain_stone: null,
      lantern_post: null,
      bench_wood: null,
      bush_green: null,
      bush_yellow: null,
      bush_red: null,
      bush_tiered: null,
      bush_flowers: null,
      tree_stump: null,
      flowers_poppy: null,
      flowers_daisy: null,
      flowers_sunflower: null,
      inn_tavern: null,
      cottage_lavender: null,
      market_stall: null,
      fence_wood: null,
      fence_post: null,
      lantern_wood_post: null,
      lantern_oil: null,
      bench_log: null,
      rock_slate: null,
      stone_monument: null,
      bridge_wood: null,
      stone_well: null,
      lilypad: null,
      lilypad_flower: null,
      cattails: null,
      water_caustics: null,
      treasure_chest: null,
    },
    loaded: false,
    camera: { x: 32 * 16, y: 33 * 16 }, // Center at Central Plaza Fountain on spawn
    targetCamera: { x: 32 * 16, y: 33 * 16 },
    pip: { x: 32 * 16, y: 33 * 16, dir: 0, frame: 0, walking: false }, // Spawn at fountain
    clickTarget: null, // { x, y, buildingId }
    hoverBuilding: null,
    nearbyBuilding: null,
    bram: { frame: 0, talking: false },
    animFrame: 0,
    waterFrame: 0,
    scaleFactor: 4,
    scaleTilt: 0,
    activeDebtsCount: 2,
    bellSwing: 0,
    fountainFrame: 0,
    isOverworldMode: !activeTab || activeTab === 'map',
    fireflies: createInitialFireflies(),
    petals: createInitialPetals(),
    rain: createInitialRain(),
  });

  // 1. Load 16-bit sprite sheets (Purely from new asset collections)
  useEffect(() => {
    let mounted = true;
    const imagesToLoad = [
      // Base autotiles & player sprites
      { key: 'tileset', src: '/assets/tiles/village_tileset.png' },
      { key: 'pip', src: '/assets/characters/hero/pip_walk.png' },
      { key: 'bram', src: '/assets/characters/hero/bram_factor.png' },

      // Sheet 1: Village Architecture & Landmarks
      { key: 'farmhouse', src: '/assets/buildings/residences/cottage_red_roof_chimney.png' },
      { key: 'bank', src: '/assets/buildings/residences/manor_fortified_watchtower_red.png' },
      { key: 'bell_tower', src: '/assets/buildings/landmarks/watchtower_timber_banner_ladder.png' },
      { key: 'festival_grounds', src: '/assets/buildings/landmarks/gatehouse_fortress_palisade_double_tower.png' },
      { key: 'moonlight_cinema', src: '/assets/buildings/landmarks/gazebo_garden_hexagonal_pavilion.png' },
      { key: 'archive_cellar', src: '/assets/buildings/landmarks/ruins_mossy_stone_arch_pillar.png' },
      { key: 'toolshed', src: '/assets/buildings/utilities/barn_timber_crop_storage.png' },
      { key: 'inn_tavern', src: '/assets/buildings/residences/tavern_inn_blue_roof_2story.png' },
      { key: 'cottage_lavender', src: '/assets/buildings/residences/cottage_green_roof_artisan.png' },
      { key: 'market_stall', src: '/assets/buildings/utilities/stall_general_store_blue_striped.png' },
      { key: 'stone_well', src: '/assets/buildings/utilities/well_covered_stone_bucket.png' },

      // Sheet 1 & Sheet 2: Structures, Bridges & Props
      { key: 'notice_board', src: '/assets/structures/props/signpost_and_bulletin_boards.png' },
      { key: 'bridge_wood', src: '/assets/structures/bridges/bridge_wooden_arched_pond_lilypads.png' },
      { key: 'fountain_stone', src: '/assets/structures/shrines/shrine_elemental_water_fountain_basin.png' },
      { key: 'fence_wood', src: '/assets/structures/props/fence_ranch_wood_segment.png' },
      { key: 'fence_post', src: '/assets/structures/props/fence_ranch_wood_segments.png' },
      { key: 'lantern_post', src: '/assets/structures/props/lanterns_bracket_and_post_iron.png' },
      { key: 'lantern_wood_post', src: '/assets/structures/props/lanterns_bracket_and_post_iron.png' },
      { key: 'lantern_oil', src: '/assets/structures/props/lantern_stone_pagoda_toro.png' },
      { key: 'stone_monument', src: '/assets/structures/props/pillar_ruined_stone_ivy_wrap.png' },
      { key: 'treasure_chest', src: '/assets/structures/props/chest_wooden_treasure_ornate.png' },
      { key: 'water_caustics', src: '/assets/structures/props/water_caustics.png' },
      { key: 'lilypad', src: '/assets/structures/props/lilypad.png' },
      { key: 'lilypad_flower', src: '/assets/structures/props/lilypad_flower.png' },

      // Sheet 4: 16-bit Nature Trees, Stumps, Rocks & Florals
      { key: 'tree_oak', src: '/assets/nature/trees/tree_broadleaf_oak_green.png' },
      { key: 'tree_pine', src: '/assets/nature/trees/tree_tall_evergreen_pine.png' },
      { key: 'tree_blossom', src: '/assets/nature/trees/tree_birch_slender_canopy.png' },
      { key: 'bush_green', src: '/assets/nature/bushes/bush_dense_emerald_round_shrub.png' },
      { key: 'bush_flowers', src: '/assets/nature/bushes/bush_flowering_rose_hedge.png' },
      { key: 'bush_yellow', src: '/assets/nature/bushes/bush_forest_undergrowth_canopy.png' },
      { key: 'bush_red', src: '/assets/nature/bushes/bush_flowering_white_blossoms.png' },
      { key: 'bush_tiered', src: '/assets/nature/bushes/bush_dense_round_emerald.png' },
      { key: 'fallen_log', src: '/assets/nature/logs/log_fallen_mossy_vines.png' },
      { key: 'tree_stump', src: '/assets/nature/logs/stump_large_ancient_roots.png' },
      { key: 'rock_moss', src: '/assets/nature/rocks/boulder_granite_mossy_large.png' },
      { key: 'rock_slate', src: '/assets/nature/rocks/rock_granite_flat_stepping_slab.png' },
      { key: 'bench_wood', src: '/assets/nature/rocks/rock_granite_flat_stepping_slab.png' },
      { key: 'bench_log', src: '/assets/nature/logs/log_fallen_hollow_weathered.png' },
      { key: 'mushrooms', src: '/assets/nature/mushrooms/mushrooms_amanita_red_spotted_cluster.png' },
      { key: 'flowers_poppy', src: '/assets/nature/flowers/flowers_wild_daisies_and_poppies.png' },
      { key: 'flowers_daisy', src: '/assets/nature/flowers/flowers_wild_daisies_and_poppies.png' },
      { key: 'flowers_sunflower', src: '/assets/nature/flowers/flowers_cattails_marsh_reeds.png' },
      { key: 'cattails', src: '/assets/nature/flowers/flowers_cattails_marsh_reeds.png' },
    ];

    let count = 0;
    imagesToLoad.forEach(({ key, src }) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        if (!mounted) return;
        stateRef.current.images[key] = img;
        count++;
        if (count === imagesToLoad.length) {
          stateRef.current.loaded = true;
        }
      };
    });

    return () => {
      mounted = false;
    };
  }, []);

  // 2. Synchronize active chapter anchor & debt data
  useEffect(() => {
    const isOverworld = !activeTab || activeTab === 'map';
    stateRef.current.isOverworldMode = isOverworld;

    if (!isOverworld) {
      const anchor = CHAPTER_ANCHORS[activeTab] || CHAPTER_ANCHORS.debts;
      const targetX = anchor.x * TILE_SIZE;
      const targetY = anchor.y * TILE_SIZE;

      stateRef.current.targetCamera = { x: targetX, y: targetY };

      if (reducedMotion) {
        stateRef.current.camera = { x: targetX, y: targetY };
        stateRef.current.pip.x = targetX - 24;
        stateRef.current.pip.y = targetY + 8;
        stateRef.current.pip.walking = false;
      } else {
        stateRef.current.pip.walking = true;
      }
    }
  }, [activeTab, reducedMotion]);

  useEffect(() => {
    const active = debtsData.filter((d) => !d.settled);
    stateRef.current.activeDebtsCount = Math.max(1, Math.min(active.length, 6));
    let net = 0;
    active.forEach((d) => {
      if (d.direction === 'owed_to_me') net += d.amount;
      else net -= d.amount;
    });
    stateRef.current.scaleTilt = net > 0 ? 1 : net < 0 ? -1 : 0;
  }, [debtsData]);

  // 3. Keyboard Controls: WASD, Arrow Keys, [E] Interact, [P] Panel Only, [Esc] Back to Map
  useEffect(() => {
    function handleKeyDown(e) {
      // Ignore if user is typing in a form field
      const tag = document.activeElement?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

      const code = e.code;
      const movementCodes = ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight'];

      if (movementCodes.includes(code)) {
        if (code.startsWith('Arrow')) {
          e.preventDefault(); // Prevent scrolling page with arrow keys
        }
        if (onPlayerInteractRef.current) {
          onPlayerInteractRef.current();
        }
        activeKeysRef.current.add(code);
        stateRef.current.clickTarget = null; // Keyboard cancels click waypoint
      } else if (code === 'KeyE' || code === 'Space') {
        if (onPlayerInteractRef.current) {
          onPlayerInteractRef.current();
        }
        const nearby = stateRef.current.nearbyBuilding;
        if (nearby && onNavigateToChapter) {
          e.preventDefault();
          soundManager.playSfx('wood');
          onNavigateToChapter(nearby.id, { panelOnly: false });
        }
      } else if (code === 'KeyP') {
        if (onPlayerInteractRef.current) {
          onPlayerInteractRef.current();
        }
        const nearby = stateRef.current.nearbyBuilding;
        if (nearby && onNavigateToChapter) {
          e.preventDefault();
          soundManager.playSfx('wood');
          onNavigateToChapter(nearby.id, { panelOnly: true });
        }
      } else if (code === 'Escape') {
        if (activeTab && onCloseChapter) {
          e.preventDefault();
          soundManager.playSfx('wood');
          onCloseChapter();
        }
      }
    }

    function handleKeyUp(e) {
      activeKeysRef.current.delete(e.code);
    }

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [activeTab, onNavigateToChapter, onCloseChapter]);

  // 4. Mouse / Touch Interactions (Click to Walk & Open House, Hover Indicators)
  const handleCanvasMouseMove = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const scale = stateRef.current.scaleFactor || 4;
    const cam = stateRef.current.camera;
    const viewW = Math.floor(canvas.clientWidth / scale);
    const viewH = Math.floor(canvas.clientHeight / scale);

    const screenX = mouseX / scale;
    const screenY = mouseY / scale;
    const worldX = screenX - Math.floor(viewW / 2 - cam.x);
    const worldY = screenY - Math.floor(viewH / 2 - cam.y);

    const hit = getHitBuilding(worldX, worldY);
    stateRef.current.hoverBuilding = hit;
    canvas.style.cursor = hit ? 'pointer' : 'default';
  }, []);

  const handleCanvasClick = useCallback((e) => {
    if (onPlayerInteractRef.current) {
      onPlayerInteractRef.current();
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const scale = stateRef.current.scaleFactor || 4;
    const cam = stateRef.current.camera;
    const viewW = Math.floor(canvas.clientWidth / scale);
    const viewH = Math.floor(canvas.clientHeight / scale);

    const screenX = mouseX / scale;
    const screenY = mouseY / scale;
    const worldX = screenX - Math.floor(viewW / 2 - cam.x);
    const worldY = screenY - Math.floor(viewH / 2 - cam.y);

    const hit = getHitBuilding(worldX, worldY);

    if (hit) {
      soundManager.playSfx('wood');
      // If already at the door, navigate immediately
      const pip = stateRef.current.pip;
      const dist = Math.hypot(pip.x - hit.doorX, pip.y - hit.doorY);
      if (dist < 32 && onNavigateToChapter) {
        onNavigateToChapter(hit.id, { panelOnly: false });
      } else {
        // Set auto-walk target to the door of this building
        stateRef.current.clickTarget = {
          x: hit.doorX,
          y: hit.doorY,
          buildingId: hit.id,
        };
      }
    } else if (isWalkable(worldX, worldY)) {
      soundManager.playSfx('click');
      stateRef.current.clickTarget = {
        x: worldX,
        y: worldY,
        buildingId: null,
      };
    }
  }, [onNavigateToChapter]);

  // 5. Main Render Loop with Keyboard Movement, Camera Panning, and Depth Sorting
  useEffect(() => {
    let animId;
    let lastTime = performance.now();
    let tickCounter = 0;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function render(currentTime) {
      animId = requestAnimationFrame(render);

      const state = stateRef.current;
      if (!state.loaded) return;

      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;
      tickCounter++;

      // Cycle animation frames (~10fps for sprite walk & water caustics shimmer)
      if (tickCounter % 6 === 0) {
        state.animFrame++;
        state.waterFrame = (state.waterFrame + 1) % 4;
        state.fountainFrame = (state.fountainFrame + 1) % 2;
        state.bellSwing = Math.sin(state.animFrame * 0.4) * 0.15;

        if (state.pip.walking) {
          state.pip.frame = (state.pip.frame + 1) % 4;
        } else {
          state.pip.frame = 0;
        }
        state.bram.frame = (state.bram.frame + 1) % 2;
      }

      // Compute Integer Scaling Factor (3x mobile, 4x desktop)
      const isMobile = canvas.clientWidth < 640;
      const isFullMap = typeof window !== 'undefined' && window.location.search.includes('fullMap=true');
      const scale = isFullMap ? 1 : (isMobile ? 3 : 4);
      state.scaleFactor = scale;

      const viewW = Math.floor(canvas.clientWidth / scale);
      const viewH = Math.floor(canvas.clientHeight / scale);

      if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
      }

      const pip = state.pip;

      // ── Process Keyboard Controls (WASD / Arrows) ──
      const activeKeys = activeKeysRef.current;
      const { vx, vy } = getKeyboardVelocity(activeKeys);

      if (vx !== 0 || vy !== 0) {
        if (onPlayerInteractRef.current) {
          onPlayerInteractRef.current();
        }
        pip.walking = true;
        const speed = 75 * dt;
        const nextX = pip.x + vx * speed;
        const nextY = pip.y + vy * speed;

        // Collision test using Pip's foot position (x + 8, y + 28)
        if (isWalkable(nextX + 8, nextY + 28)) {
          pip.x = nextX;
          pip.y = nextY;
        } else {
          // Slide along X or Y axis if partial direction is walkable
          if (isWalkable(nextX + 8, pip.y + 28)) {
            pip.x = nextX;
          } else if (isWalkable(pip.x + 8, nextY + 28)) {
            pip.y = nextY;
          }
        }

        // Determine face direction
        if (Math.abs(vy) > Math.abs(vx)) {
          pip.dir = vy > 0 ? 0 : 3; // 0=Down, 3=Up
        } else {
          pip.dir = vx > 0 ? 2 : 1; // 2=Right, 1=Left
        }
      } else if (state.clickTarget) {
        // ── Process Click-to-Move Target ──
        const target = state.clickTarget;
        const dx = target.x - pip.x;
        const dy = target.y - pip.y;
        const dist = Math.hypot(dx, dy);

        if (dist > 3) {
          pip.walking = true;
          const walkSpeed = 70 * dt;
          pip.x += (dx / dist) * Math.min(dist, walkSpeed);
          pip.y += (dy / dist) * Math.min(dist, walkSpeed);

          if (Math.abs(dx) > Math.abs(dy)) {
            pip.dir = dx > 0 ? 2 : 1;
          } else {
            pip.dir = dy > 0 ? 0 : 3;
          }
        } else {
          pip.walking = false;
          if (target.buildingId && onNavigateToChapter) {
            onNavigateToChapter(target.buildingId, { panelOnly: false });
          }
          state.clickTarget = null;
        }
      } else if (!state.isOverworldMode) {
        // ── Auto-walk to current Chapter Anchor when panel is active ──
        const tCam = state.targetCamera;
        const destX = tCam.x - 20;
        const destY = tCam.y + 12;
        const dx = destX - pip.x;
        const dy = destY - pip.y;
        const dist = Math.hypot(dx, dy);

        if (dist > 3 && !reducedMotion) {
          pip.walking = true;
          const walkSpeed = 60 * dt;
          pip.x += (dx / dist) * Math.min(dist, walkSpeed);
          pip.y += (dy / dist) * Math.min(dist, walkSpeed);

          if (Math.abs(dx) > Math.abs(dy)) {
            pip.dir = dx > 0 ? 2 : 1;
          } else {
            pip.dir = dy > 0 ? 0 : 3;
          }
        } else {
          pip.walking = false;
        }
      } else {
        pip.walking = false;
      }

      // ── Update Proximity Detection ──
      const nearby = getNearbyBuilding(pip.x + 8, pip.y + 20, 36);
      state.nearbyBuilding = nearby;

      const nearbyId = nearby ? nearby.id : null;
      if (lastReportedNearbyRef.current !== nearbyId) {
        lastReportedNearbyRef.current = nearbyId;
        if (onNearbyBuildingChangeRef.current) {
          onNearbyBuildingChangeRef.current(nearby);
        }
      }

      // ── Camera Panning & Follow Mode ──
      const cam = state.camera;
      if (state.isOverworldMode) {
        // In Overworld mode: Camera smoothly follows Pip across the village
        const targetCamX = Math.max(viewW / 2, Math.min(MAP_WIDTH_TILES * TILE_SIZE - viewW / 2, pip.x + 8));
        const targetCamY = Math.max(viewH / 2, Math.min(MAP_HEIGHT_TILES * TILE_SIZE - viewH / 2, pip.y + 16));
        const lerpSpeed = reducedMotion ? 1 : 0.08;
        cam.x += (targetCamX - cam.x) * lerpSpeed;
        cam.y += (targetCamY - cam.y) * lerpSpeed;
      } else {
        // In Chapter mode: Smooth camera pan towards chapter anchor
        const tCam = state.targetCamera;
        const lerpSpeed = reducedMotion ? 1 : 0.08;
        cam.x += (tCam.x - cam.x) * lerpSpeed;
        cam.y += (tCam.y - cam.y) * lerpSpeed;
      }

      ctx.imageSmoothingEnabled = false;

      ctx.save();
      ctx.scale(scale, scale);

      // Camera offset
      const offsetX = Math.floor(viewW / 2 - cam.x);
      const offsetY = Math.floor(viewH / 2 - cam.y);
      ctx.translate(offsetX, offsetY);

      const camMinX = cam.x - viewW / 2 - 64;
      const camMaxX = cam.x + viewW / 2 + 64;
      const camMinY = cam.y - viewH / 2 - 64;
      const camMaxY = cam.y + viewH / 2 + 64;

      const tileset = state.images.tileset;

      // ── Layer 1: Ground Tiles (Grass, Continuous Dirt Paths, Cobblestone Aprons, Pond, Tilled Soil) ──
      const minTx = Math.max(0, Math.floor((cam.x - viewW / 2 - 32) / TILE_SIZE));
      const maxTx = Math.min(MAP_WIDTH_TILES - 1, Math.ceil((cam.x + viewW / 2 + 32) / TILE_SIZE));
      const minTy = Math.max(0, Math.floor((cam.y - viewH / 2 - 32) / TILE_SIZE));
      const maxTy = Math.min(MAP_HEIGHT_TILES - 1, Math.ceil((cam.y + viewH / 2 + 32) / TILE_SIZE));

      for (let ty = minTy; ty <= maxTy; ty++) {
        for (let tx = minTx; tx <= maxTx; tx++) {
          const wx = tx * TILE_SIZE;
          const wy = ty * TILE_SIZE;

          // Woodland Pond (excluding the footbridge column)
          if (isPondTile(tx, ty)) {
            const causticsImg = state.images.water_caustics;
            if (causticsImg) {
              ctx.drawImage(causticsImg, (state.waterFrame % 4) * TILE_SIZE, 0, TILE_SIZE, TILE_SIZE, wx, wy, TILE_SIZE, TILE_SIZE);
            } else {
              ctx.drawImage(tileset, (state.waterFrame % 2) * TILE_SIZE, 1 * TILE_SIZE, TILE_SIZE, TILE_SIZE, wx, wy, TILE_SIZE, TILE_SIZE);
            }
            continue;
          }

          // Tilled soil plots in Farmstead zone (tx: 11..13, ty: 15..17)
          const isGarden = tx >= 11 && tx <= 13 && ty >= 15 && ty <= 17;
          if (isGarden) {
            // Rich dark tilled loam soil with furrow ridges (matching reference style)
            ctx.fillStyle = '#654321';
            ctx.fillRect(wx, wy, TILE_SIZE, TILE_SIZE);
            ctx.fillStyle = '#7a5228';
            ctx.fillRect(wx, wy + 2, TILE_SIZE, 3);
            ctx.fillRect(wx, wy + 8, TILE_SIZE, 3);
            ctx.fillRect(wx, wy + 13, TILE_SIZE, 2);
            continue;
          }

          // Autotiled paths and cobblestone plazas
          const pathTile = getPathTileInfo(tx, ty);
          if (pathTile) {
            ctx.drawImage(tileset, pathTile.col * TILE_SIZE, pathTile.row * TILE_SIZE, TILE_SIZE, TILE_SIZE, wx, wy, TILE_SIZE, TILE_SIZE);

            // Flagstone paver slabs embedded along the dirt path (reference style)
            if (isSteppingStoneTile(tx, ty)) {
              ctx.save();
              const pW = 11, pH = 7;
              const px = wx + Math.floor((TILE_SIZE - pW) / 2);
              const py = wy + Math.floor((TILE_SIZE - pH) / 2);
              // Drop shadow
              ctx.fillStyle = 'rgba(68, 60, 50, 0.45)';
              ctx.fillRect(px, py + 1, pW, pH);
              // Stone body
              ctx.fillStyle = '#d5cfc5';
              ctx.fillRect(px, py, pW, pH);
              // Outer bevel edge
              ctx.fillStyle = '#8e887d';
              ctx.fillRect(px, py + pH - 1, pW, 1);
              ctx.fillRect(px + pW - 1, py, 1, pH);
              // Top-left highlight
              ctx.fillStyle = '#f8f6f0';
              ctx.fillRect(px, py, pW - 1, 1);
              ctx.fillRect(px, py, 1, pH - 1);
              ctx.restore();
            }
            continue;
          }

          // Procedural Rich Terrain Variety (Clustered Wildflowers, Clovers, Shaded Moss, Pebbles)
          const gTile = getGroundTile(tx, ty);
          ctx.drawImage(tileset, gTile.col * TILE_SIZE, gTile.row * TILE_SIZE, TILE_SIZE, TILE_SIZE, wx, wy, TILE_SIZE, TILE_SIZE);

          // Tiny 4-petal white wildflowers & grass tufts on meadow tiles (matching reference style)
          const fHash = hash2D(tx, ty);
          if (fHash % 19 === 0) {
            const fx = wx + 3 + (fHash % 8);
            const fy = wy + 3 + ((fHash >> 3) % 8);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(fx, fy - 1, 1, 3);
            ctx.fillRect(fx - 1, fy, 3, 1);
            ctx.fillStyle = '#facc15';
            ctx.fillRect(fx, fy, 1, 1);
          } else if (fHash % 29 === 0) {
            const gx = wx + 4 + (fHash % 6);
            const gy = wy + 5 + ((fHash >> 2) % 6);
            ctx.fillStyle = '#4d7c0f';
            ctx.fillRect(gx, gy, 1, 3);
            ctx.fillRect(gx + 2, gy - 1, 1, 4);
            ctx.fillRect(gx + 4, gy + 1, 1, 2);
          }
        }
      }

      // ── Layer 1b: Dynamic Concentric Water Ripples ──
      const rippleCenters = [
        { x: 30.8 * TILE_SIZE, y: 43.3 * TILE_SIZE, phase: 0 },
        { x: 33.4 * TILE_SIZE, y: 44.1 * TILE_SIZE, phase: 0.3 },
        { x: 31.4 * TILE_SIZE, y: 44.8 * TILE_SIZE, phase: 0.6 },
        { x: 33.6 * TILE_SIZE, y: 42.7 * TILE_SIZE, phase: 0.85 },
        { x: 32.0 * TILE_SIZE, y: 31.2 * TILE_SIZE, phase: 0.45 }, // Central fountain basin
      ];
      rippleCenters.forEach((rc) => {
        if (viewW < 1000 && (rc.x < camMinX || rc.x > camMaxX || rc.y < camMinY || rc.y > camMaxY)) return;
        const progress = ((state.animFrame * 0.025 + rc.phase) % 1);
        const rX = 2 + progress * 8;
        const rY = rX * 0.5;
        const alpha = (1 - progress) * 0.6;
        ctx.save();
        ctx.strokeStyle = `rgba(186, 245, 255, ${alpha.toFixed(3)})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(rc.x, rc.y, rX, rY, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      });

      // ── Layer 2: Decorative Fences, Rails & Wooden Footbridge ──
      // 1. Wooden Footbridge across Woodland Pond (3 tiles wide, 4 tiles long)
      const bridgeImg = state.images.bridge_wood;
      if (bridgeImg) {
        ctx.drawImage(bridgeImg, (POND.bridgeX - 1) * TILE_SIZE, POND.minY * TILE_SIZE, 3 * TILE_SIZE, 4 * TILE_SIZE);
      } else {
        // Fallback tileset railings
        for (let by = POND.minY; by <= POND.maxY; by++) {
          ctx.drawImage(tileset, 2 * TILE_SIZE, 1 * TILE_SIZE, TILE_SIZE, TILE_SIZE, (POND.bridgeX - 1) * TILE_SIZE, by * TILE_SIZE, TILE_SIZE, TILE_SIZE);
          ctx.drawImage(tileset, 2 * TILE_SIZE, 1 * TILE_SIZE, TILE_SIZE, TILE_SIZE, (POND.bridgeX + 1) * TILE_SIZE, by * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
      }

      // 2. Wooden Split-Rail Fences
      const fenceImg = state.images.fence_wood;
      const fencePostImg = state.images.fence_post;
      if (fenceImg) {
        // Farmstead Garden Perimeter (tx: 10..13 and tx: 16..17, ty: 16)
        ctx.drawImage(fenceImg, 10 * TILE_SIZE, 16 * TILE_SIZE, 32, 16);
        ctx.drawImage(fenceImg, 12 * TILE_SIZE, 16 * TILE_SIZE, 32, 16);
        ctx.drawImage(fenceImg, 16 * TILE_SIZE, 16 * TILE_SIZE, 32, 16);
        if (fencePostImg) {
          ctx.drawImage(fencePostImg, 10 * TILE_SIZE - 4, 16 * TILE_SIZE, 12, 16);
          ctx.drawImage(fencePostImg, 14 * TILE_SIZE - 6, 16 * TILE_SIZE, 12, 16); // Gate left
          ctx.drawImage(fencePostImg, 16 * TILE_SIZE - 4, 16 * TILE_SIZE, 12, 16); // Gate right
          ctx.drawImage(fencePostImg, 18 * TILE_SIZE - 4, 16 * TILE_SIZE, 12, 16);
        }

        // Ledger Bank Courtyard Fences (tx: 47..48 and tx: 52..53, ty: 16)
        ctx.drawImage(fenceImg, 47 * TILE_SIZE, 16 * TILE_SIZE, 32, 16);
        ctx.drawImage(fenceImg, 52 * TILE_SIZE, 16 * TILE_SIZE, 32, 16);
        if (fencePostImg) {
          ctx.drawImage(fencePostImg, 47 * TILE_SIZE - 4, 16 * TILE_SIZE, 12, 16);
          ctx.drawImage(fencePostImg, 49 * TILE_SIZE - 4, 16 * TILE_SIZE, 12, 16);
          ctx.drawImage(fencePostImg, 52 * TILE_SIZE - 4, 16 * TILE_SIZE, 12, 16);
          ctx.drawImage(fencePostImg, 54 * TILE_SIZE - 4, 16 * TILE_SIZE, 12, 16);
        }

        // Toolshed Workshop Yard Fence (south side, gap at the door column)
        const yardY = (TOOLSHED.y + 2) * TILE_SIZE;
        ctx.drawImage(fenceImg, (TOOLSHED.x - 3) * TILE_SIZE, yardY, 32, 16);
        ctx.drawImage(fenceImg, (TOOLSHED.x + 1) * TILE_SIZE, yardY, 32, 16);
        if (fencePostImg) {
          ctx.drawImage(fencePostImg, (TOOLSHED.x - 3) * TILE_SIZE - 4, yardY, 12, 16);
          ctx.drawImage(fencePostImg, (TOOLSHED.x - 1) * TILE_SIZE - 4, yardY, 12, 16);
          ctx.drawImage(fencePostImg, (TOOLSHED.x + 1) * TILE_SIZE - 4, yardY, 12, 16);
          ctx.drawImage(fencePostImg, (TOOLSHED.x + 3) * TILE_SIZE - 4, yardY, 12, 16);
        }

        // Wishing Well garden rail (north side)
        ctx.drawImage(fenceImg, (WISHING_WELL.x - 1) * TILE_SIZE, (WISHING_WELL.y - 2) * TILE_SIZE, 32, 16);
      } else {
        for (let fx = 10; fx <= 13; fx++) {
          ctx.drawImage(tileset, 2 * TILE_SIZE, 1 * TILE_SIZE, TILE_SIZE, TILE_SIZE, fx * TILE_SIZE, 16 * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
        for (let fx = 16; fx <= 17; fx++) {
          ctx.drawImage(tileset, 2 * TILE_SIZE, 1 * TILE_SIZE, TILE_SIZE, TILE_SIZE, fx * TILE_SIZE, 16 * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
      }

      // ── Layer 3: Depth-Sorted Entities (Buildings, Props, Characters, Trees) ──
      const renderables = [];

      // ── 1. Chapter 1: The Farmstead ──
      renderables.push({
        y: 14 * TILE_SIZE + 2,
        render: () => {
          const houseImg = state.images.farmhouse;
          const hW = 76;
          const hH = 79;
          const hX = 14 * TILE_SIZE - hW / 2;
          const hY = 14 * TILE_SIZE - hH + 4;
          if (houseImg) {
            ctx.drawImage(houseImg, hX, hY, hW, hH);
          } else {
            const bx = 12 * TILE_SIZE;
            const by = 10 * TILE_SIZE;
            for (let rx = 0; rx < 4; rx++) {
              ctx.drawImage(tileset, 0, 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE, bx + rx * TILE_SIZE, by, TILE_SIZE, TILE_SIZE);
              ctx.drawImage(tileset, 0, 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE, bx + rx * TILE_SIZE, by + TILE_SIZE, TILE_SIZE, TILE_SIZE);
              if (rx === 2) {
                ctx.drawImage(tileset, 3 * TILE_SIZE, 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE, bx + rx * TILE_SIZE, by + 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE);
              } else if (rx === 1) {
                ctx.drawImage(tileset, 2 * TILE_SIZE, 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE, bx + rx * TILE_SIZE, by + 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE);
              } else {
                ctx.drawImage(tileset, 1 * TILE_SIZE, 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE, bx + rx * TILE_SIZE, by + 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE);
              }
            }
          }

          // Stacked Firewood beside Farmstead wall (matching reference screenshot)
          drawStackedFirewood(ctx, 10 * TILE_SIZE, 12.5 * TILE_SIZE);

          // Hanging wooden signpost flanking the doorstep pathway
          drawHangingSignpost(ctx, 12 * TILE_SIZE - 4, 14.5 * TILE_SIZE);

          // Dedicated Fenced Garden Plot (3 distinct crop rows: Golden Wheat, Green Sprouts, Blooming Flowers)
          drawFencedGardenPlot(ctx, 9.5 * TILE_SIZE, 15.5 * TILE_SIZE, state.animFrame);

          // Courier Bird Wren on mailbox post (x: 15, y: 14)
          ctx.drawImage(tileset, 7 * TILE_SIZE, 5 * TILE_SIZE, TILE_SIZE, TILE_SIZE, 15 * TILE_SIZE, 14 * TILE_SIZE, TILE_SIZE, TILE_SIZE);

          // Farmstead Stone Well with Roof & Bucket
          const wellImg = state.images.stone_well;
          if (wellImg) {
            ctx.drawImage(wellImg, 9 * TILE_SIZE - 4, 11.5 * TILE_SIZE, 32, 36);
          }

          // Farmstead Rustic Tree Stump & Stone Accents (from Sheet 4)
          const stumpImg = state.images.tree_stump;
          if (stumpImg) {
            ctx.drawImage(stumpImg, 9 * TILE_SIZE, 13.5 * TILE_SIZE, 22, 20);
          }

          // Farmstead Mossy Boulder & Fallen Timber Log (from Sheet 4)
          const rockImg = state.images.rock_moss;
          if (rockImg) {
            ctx.drawImage(rockImg, 17 * TILE_SIZE, 12.5 * TILE_SIZE, 30, 22);
          }
          const logImg = state.images.fallen_log;
          if (logImg) {
            ctx.drawImage(logImg, 18.5 * TILE_SIZE, 13.5 * TILE_SIZE, 28, 18);
          }

          // Farmstead Wild Red Mushrooms (from Sheet 4)
          const mushImg = state.images.mushrooms;
          if (mushImg) {
            ctx.drawImage(mushImg, 16.5 * TILE_SIZE, 15 * TILE_SIZE - 4, 18, 18);
          }
        },
      });

      // ── 2. Chapter 2: The Ledger Hut / Bank ──
      renderables.push({
        y: 14 * TILE_SIZE + 4,
        render: () => {
          const bankImg = state.images.bank;
          if (bankImg) {
            const bW = 86;
            const bH = 86;
            const bX = 50 * TILE_SIZE - bW / 2;
            const bY = 14 * TILE_SIZE + 4 - bH;
            ctx.drawImage(bankImg, bX, bY, bW, bH);
            // Symmetrical Flower Planters flanking the Bank Entrance (from Sheet 4)
            const planterImg = state.images.bush_flowers;
            if (planterImg) {
              ctx.drawImage(planterImg, 47 * TILE_SIZE, 14 * TILE_SIZE - 4, 24, 16);
              ctx.drawImage(planterImg, 52.5 * TILE_SIZE, 14 * TILE_SIZE - 4, 24, 16);
            }
          } else {
            const hx = 48 * TILE_SIZE;
            const hy = 11 * TILE_SIZE;
            for (let rx = 0; rx < 5; rx++) {
              ctx.drawImage(tileset, 0, 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE, hx + rx * TILE_SIZE, hy, TILE_SIZE, TILE_SIZE);
              ctx.drawImage(tileset, 0, 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE, hx + rx * TILE_SIZE, hy + TILE_SIZE, TILE_SIZE, TILE_SIZE);
              if (rx === 3) {
                ctx.drawImage(tileset, 3 * TILE_SIZE, 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE, hx + rx * TILE_SIZE, hy + 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE);
              } else if (rx === 0 || rx === 4) {
                ctx.drawImage(tileset, 2 * TILE_SIZE, 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE, hx + rx * TILE_SIZE, hy + 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE);
              } else {
                ctx.drawImage(tileset, 1 * TILE_SIZE, 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE, hx + rx * TILE_SIZE, hy + 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE);
              }
            }
            ctx.drawImage(tileset, 4 * TILE_SIZE, 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE, hx + 4 * TILE_SIZE, hy + 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            ctx.fillStyle = 'rgba(15, 23, 42, 0.35)';
            ctx.fillRect(hx, hy + 2 * TILE_SIZE, 5 * TILE_SIZE, 2);
          }
        },
      });

      // Bram the Badger Factor (at the Bank Entrance apron)
      renderables.push({
        y: 14 * TILE_SIZE + 6,
        render: () => {
          const bramImg = state.images.bram;
          if (bramImg) {
            const frameCol = state.bram.talking ? 2 + state.bram.frame : state.bram.frame;
            ctx.drawImage(bramImg, frameCol * 24, 0, 24, 32, 52 * TILE_SIZE - 10, 13 * TILE_SIZE + 4, 24, 32);
          }
        },
      });

      // Ledger Counter Table & Interactive Props (in front of Bram)
      renderables.push({
        y: 14 * TILE_SIZE + 8,
        render: () => {
          const px = 52 * TILE_SIZE - 4;
          const py = 14 * TILE_SIZE + 2;
          ctx.drawImage(tileset, 5 * TILE_SIZE, 1 * TILE_SIZE, TILE_SIZE, TILE_SIZE, px, py, TILE_SIZE, TILE_SIZE);

          // Brass Balance Scale
          ctx.save();
          ctx.translate(px + 8, py + 2);
          if (state.scaleTilt !== 0) {
            ctx.rotate((state.scaleTilt * 6 * Math.PI) / 180);
          }
          ctx.drawImage(tileset, 6 * TILE_SIZE, 1 * TILE_SIZE, TILE_SIZE, TILE_SIZE, -8, -8, TILE_SIZE, TILE_SIZE);
          ctx.restore();

          // Bulging Golden Coin Sacks
          const sackCount = Math.max(1, state.activeDebtsCount);
          for (let s = 0; s < sackCount; s++) {
            const sackX = px - 4 + (s % 2) * 5;
            const sackY = py + 2 + Math.floor(s / 2) * 2;
            ctx.drawImage(tileset, 7 * TILE_SIZE, 1 * TILE_SIZE, TILE_SIZE, TILE_SIZE, sackX, sackY, TILE_SIZE, TILE_SIZE);
          }
        },
      });

      // ── 3. Chapter 3: The Bell Tower ──
      renderables.push({
        y: 14 * TILE_SIZE,
        render: () => {
          const towerImg = state.images.bell_tower;
          if (towerImg) {
            const bW = 46;
            const bH = 98;
            const bX = 32 * TILE_SIZE - bW / 2;
            const bY = 14 * TILE_SIZE - bH + 2;
            ctx.drawImage(towerImg, bX, bY, bW, bH);
          } else {
            const tx = 31 * TILE_SIZE;
            const ty = 9 * TILE_SIZE;
            ctx.drawImage(tileset, 0, 3 * TILE_SIZE, TILE_SIZE, TILE_SIZE, tx, ty, TILE_SIZE, TILE_SIZE);
            ctx.drawImage(tileset, 0, 3 * TILE_SIZE, TILE_SIZE, TILE_SIZE, tx + TILE_SIZE, ty, TILE_SIZE, TILE_SIZE);
            ctx.drawImage(tileset, 1 * TILE_SIZE, 3 * TILE_SIZE, TILE_SIZE, TILE_SIZE, tx, ty + TILE_SIZE, TILE_SIZE, TILE_SIZE);
            ctx.save();
            ctx.translate(tx + TILE_SIZE + 8, ty + TILE_SIZE + 4);
            ctx.rotate(state.bellSwing);
            ctx.drawImage(tileset, 2 * TILE_SIZE, 3 * TILE_SIZE, TILE_SIZE, TILE_SIZE, -8, 0, TILE_SIZE, TILE_SIZE);
            ctx.restore();
            ctx.drawImage(tileset, 5 * TILE_SIZE, 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE, tx, ty + 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            ctx.drawImage(tileset, 5 * TILE_SIZE, 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE, tx + TILE_SIZE, ty + 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE);
          }
        },
      });

      // ── 4. Chapter 4: The Notice Board (Town Square, north of the plaza) ──
      renderables.push({
        y: NOTICE.y * TILE_SIZE + 6,
        render: () => {
          const boardImg = state.images.notice_board;
          const bW = 52;
          const bH = 46;
          const bX = NOTICE.x * TILE_SIZE - bW / 2;
          const bY = NOTICE.y * TILE_SIZE - bH + 6;
          if (boardImg) {
            ctx.drawImage(boardImg, bX, bY, bW, bH);
          } else {
            const nx = (NOTICE.x - 1) * TILE_SIZE;
            const ny = (NOTICE.y - 1) * TILE_SIZE;
            ctx.drawImage(tileset, 4 * TILE_SIZE, 4 * TILE_SIZE, TILE_SIZE, TILE_SIZE, nx, ny, TILE_SIZE, TILE_SIZE);
            ctx.drawImage(tileset, 4 * TILE_SIZE, 4 * TILE_SIZE, TILE_SIZE, TILE_SIZE, nx + TILE_SIZE, ny, TILE_SIZE, TILE_SIZE);
            ctx.drawImage(tileset, 6 * TILE_SIZE, 5 * TILE_SIZE, TILE_SIZE, TILE_SIZE, nx + 2 * TILE_SIZE, ny, TILE_SIZE, TILE_SIZE);
          }
        },
      });

      // ── 5. Central Village Stone Fountain (tx: 31..32, ty: 30..31) ──
      renderables.push({
        y: 32 * TILE_SIZE,
        render: () => {
          drawCozyOctagonalFountain(ctx, 32 * TILE_SIZE, 31 * TILE_SIZE, state.animFrame);
        },
      });

      // ── 6. Chapter 5: The Festival Grounds ──
      renderables.push({
        y: 51 * TILE_SIZE + 6,
        render: () => {
          const festImg = state.images.festival_grounds;
          if (festImg) {
            const bW = 128;
            const bH = 94;
            const bX = 16 * TILE_SIZE - bW / 2;
            const bY = 52 * TILE_SIZE - bH + 4;
            ctx.drawImage(festImg, bX, bY, bW, bH);
            // Festive Market Cache Chest
            const chestImg = state.images.treasure_chest;
            if (chestImg) {
              ctx.drawImage(chestImg, 20.5 * TILE_SIZE, 51 * TILE_SIZE, 16, 16);
            }
          } else {
            const gx = 15 * TILE_SIZE;
            const gy = 48 * TILE_SIZE;
            ctx.drawImage(tileset, 7 * TILE_SIZE, 3 * TILE_SIZE, TILE_SIZE, TILE_SIZE, gx, gy, TILE_SIZE, TILE_SIZE);
            ctx.drawImage(tileset, 7 * TILE_SIZE, 3 * TILE_SIZE, TILE_SIZE, TILE_SIZE, gx + TILE_SIZE, gy, TILE_SIZE, TILE_SIZE);
          }
        },
      });

      // ── 7. Chapter 6: The Moonlight Cinema ──
      renderables.push({
        y: 51 * TILE_SIZE + 6,
        render: () => {
          const cinemaImg = state.images.moonlight_cinema;
          if (cinemaImg) {
            const bW = 128;
            const bH = 93;
            const bX = 48 * TILE_SIZE - bW / 2;
            const bY = 52 * TILE_SIZE - bH + 4;
            ctx.drawImage(cinemaImg, bX, bY, bW, bH);
          } else {
            const mx = 46 * TILE_SIZE;
            const my = 48 * TILE_SIZE;
            ctx.drawImage(tileset, 4 * TILE_SIZE, 3 * TILE_SIZE, TILE_SIZE, TILE_SIZE, mx, my, TILE_SIZE, TILE_SIZE);
            ctx.drawImage(tileset, 4 * TILE_SIZE, 3 * TILE_SIZE, TILE_SIZE, TILE_SIZE, mx + TILE_SIZE, my, TILE_SIZE, TILE_SIZE);
          }
        },
      });

      // ── 8. Chapter 7: The Archive Cellar ──
      renderables.push({
        y: 33 * TILE_SIZE + 4,
        render: () => {
          const cellarImg = state.images.archive_cellar;
          if (cellarImg) {
            const bW = 76;
            const bH = 90;
            const bX = 12 * TILE_SIZE - bW / 2;
            const bY = 34 * TILE_SIZE - bH - 4;
            ctx.drawImage(cellarImg, bX, bY, bW, bH);
          } else {
            const ax = 11 * TILE_SIZE;
            const ay = 30 * TILE_SIZE;
            ctx.drawImage(tileset, 5 * TILE_SIZE, 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE, ax, ay, TILE_SIZE, TILE_SIZE);
            ctx.drawImage(tileset, 5 * TILE_SIZE, 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE, ax + TILE_SIZE, ay, TILE_SIZE, TILE_SIZE);
          }
        },
      });

      // ── 9. Chapter 8: The Toolshed Workbench & Forge (east side, mirrors the Archive) ──
      renderables.push({
        y: TOOLSHED.y * TILE_SIZE,
        render: () => {
          // Workshop building: The Toolshed Timber Barn
          const shedImg = state.images.toolshed || state.images.archive_cellar;
          if (shedImg) {
            const bW = 76;
            const bH = 90;
            const bX = TOOLSHED.x * TILE_SIZE - bW / 2;
            const bY = (TOOLSHED.y + 1) * TILE_SIZE - bH - 4;
            ctx.drawImage(shedImg, bX, bY, bW, bH);
          }
          // Iron anvil and split firewood beside the door
          ctx.drawImage(tileset, 6 * TILE_SIZE, 3 * TILE_SIZE, TILE_SIZE, TILE_SIZE, (TOOLSHED.x + 2) * TILE_SIZE, (TOOLSHED.y - 1) * TILE_SIZE, TILE_SIZE, TILE_SIZE);
          ctx.drawImage(tileset, 5 * TILE_SIZE, 1 * TILE_SIZE, TILE_SIZE, TILE_SIZE, (TOOLSHED.x - 3) * TILE_SIZE, (TOOLSHED.y - 1) * TILE_SIZE, TILE_SIZE, TILE_SIZE);

          // Timber firewood log stack beside the yard fence (reference style)
          drawStackedFirewood(ctx, (TOOLSHED.x - 3) * TILE_SIZE, (TOOLSHED.y + 1) * TILE_SIZE - 2);
        },
      });

      // ── 10. Sky Post: Wren's Courier Station ──
      renderables.push({
        y: (SKY_POST.y + 1) * TILE_SIZE,
        render: () => {
          const px = SKY_POST.x * TILE_SIZE;
          const py = SKY_POST.y * TILE_SIZE;
          // Perched bluebird Wren on wooden post
          ctx.drawImage(tileset, 7 * TILE_SIZE, 5 * TILE_SIZE, TILE_SIZE, TILE_SIZE, px, py, TILE_SIZE, TILE_SIZE);
          // Directional road signpost
          ctx.drawImage(tileset, 6 * TILE_SIZE, 5 * TILE_SIZE, TILE_SIZE, TILE_SIZE, px - TILE_SIZE, py, TILE_SIZE, TILE_SIZE);
          // Circular poppy flowerbed
          ctx.drawImage(tileset, 2 * TILE_SIZE, 0, TILE_SIZE, TILE_SIZE, px + TILE_SIZE, py, TILE_SIZE, TILE_SIZE);
        },
      });

      // ── Town Square Building 1: The Whispering Pines Inn & Tavern ──
      renderables.push({
        y: INN.y * TILE_SIZE,
        render: () => {
          const innImg = state.images.inn_tavern;
          if (innImg) {
            const bW = 72;
            const bH = 70;
            const bX = INN.x * TILE_SIZE - bW / 2;
            const bY = INN.y * TILE_SIZE - bH + 2;
            ctx.drawImage(innImg, bX, bY, bW, bH);
            // Flower bushes flanking the inn door (from Sheet 4)
            const planterImg = state.images.bush_flowers;
            if (planterImg) {
              ctx.drawImage(planterImg, (INN.x - 2) * TILE_SIZE + 2, INN.y * TILE_SIZE - 6, 24, 16);
              ctx.drawImage(planterImg, (INN.x + 1) * TILE_SIZE - 2, INN.y * TILE_SIZE - 6, 24, 16);
            }
          }
        },
      });

      // ── Town Square Building 2: Lavender Artisan Cottage ──
      renderables.push({
        y: COTTAGE.y * TILE_SIZE,
        render: () => {
          const cotImg = state.images.cottage_lavender;
          if (cotImg) {
            const bW = 52;
            const bH = 88;
            const bX = COTTAGE.x * TILE_SIZE - bW / 2;
            const bY = COTTAGE.y * TILE_SIZE - bH + 2;
            ctx.drawImage(cotImg, bX, bY, bW, bH);
          }
        },
      });

      // ── Village Market Produce Stall (tx: 35..36, ty: 31) ──
      renderables.push({
        y: 32 * TILE_SIZE,
        render: () => {
          const mImg = state.images.market_stall;
          if (mImg) {
            ctx.drawImage(mImg, 35 * TILE_SIZE - 4, 30 * TILE_SIZE - 4, 42, 36);
          }
        },
      });

      // ── Wishing Well (west garden, mirrors the Sky Post) ──
      renderables.push({
        y: (WISHING_WELL.y + 1) * TILE_SIZE,
        render: () => {
          const wellImg = state.images.stone_well;
          if (wellImg) {
            ctx.drawImage(wellImg, WISHING_WELL.x * TILE_SIZE, WISHING_WELL.y * TILE_SIZE - 20, 32, 36);
          }
        },
      });

      // ── Floating Bobbing Lily Pads on Woodland Pond ──
      const lilyPads = [
        { x: 30.6 * TILE_SIZE, y: 43.2 * TILE_SIZE, type: 'plain', phase: 0 },
        { x: 33.3 * TILE_SIZE, y: 44.2 * TILE_SIZE, type: 'flower', phase: 1.8 },
        { x: 31.2 * TILE_SIZE, y: 44.7 * TILE_SIZE, type: 'plain', phase: 3.2 },
      ];
      lilyPads.forEach((lp) => {
        if (viewW < 1000 && (lp.x < camMinX || lp.x > camMaxX || lp.y < camMinY || lp.y > camMaxY)) return;
        renderables.push({
          y: lp.y + 12,
          render: () => {
            const bobY = lp.y + Math.sin(state.animFrame * 0.08 + lp.phase) * 1.5;
            const img = lp.type === 'flower' ? state.images.lilypad_flower : state.images.lilypad;
            if (img) {
              ctx.drawImage(img, lp.x, bobY, 18, 18);
            }
          },
        });
      });

      // ── Shoreline Cattails / Water Reeds ──
      const waterReeds = [
        { x: 29.5 * TILE_SIZE, y: 44.0 * TILE_SIZE },
        { x: 34.2 * TILE_SIZE, y: 42.2 * TILE_SIZE },
      ];
      waterReeds.forEach((wr) => {
        if (viewW < 1000 && (wr.x < camMinX || wr.x > camMaxX || wr.y < camMinY || wr.y > camMaxY)) return;
        renderables.push({
          y: wr.y + 24,
          render: () => {
            const img = state.images.cattails;
            if (img) {
              ctx.drawImage(img, wr.x, wr.y, 20, 28);
            }
          },
        });
      });

      // ── 11a. Plaza, Town Square & Landmark Wooden Benches ──
      const plazaBenches = [
        // Central Plaza fountain benches
        { x: 30, y: 31 }, { x: 34, y: 31 },
        { x: 30, y: 33 }, { x: 34, y: 33 },
        // Bell Tower circular stone platform benches
        { x: 30, y: 11 }, { x: 34, y: 11 },
        // Notice Board square benches (either side of the board)
        { x: 29, y: 23 }, { x: 35, y: 23 },
      ];
      plazaBenches.forEach((bp) => {
        if (viewW < 1000 && (bp.x * TILE_SIZE < camMinX || bp.x * TILE_SIZE > camMaxX || bp.y * TILE_SIZE < camMinY || bp.y * TILE_SIZE > camMaxY)) return;
        renderables.push({
          y: (bp.y + 1) * TILE_SIZE,
          render: () => {
            const bImg = state.images.bench_wood;
            if (bImg) {
              ctx.drawImage(bImg, bp.x * TILE_SIZE - 6, bp.y * TILE_SIZE - 2, 28, 18);
            }
          },
        });
      });

      // ── 11b. Rustic Woodland Log Benches (resting spots along the middle roads) ──
      const logBenches = [
        { x: 24, y: 32 }, { x: 40, y: 32 },
        // Pondside viewing spots
        { x: 28, y: 41 }, { x: 36, y: 41 },
      ];
      logBenches.forEach((lb) => {
        if (viewW < 1000 && (lb.x * TILE_SIZE < camMinX || lb.x * TILE_SIZE > camMaxX || lb.y * TILE_SIZE < camMinY || lb.y * TILE_SIZE > camMaxY)) return;
        renderables.push({
          y: (lb.y + 1) * TILE_SIZE,
          render: () => {
            const lbImg = state.images.bench_log || state.images.bench_wood;
            if (lbImg) {
              ctx.drawImage(lbImg, lb.x * TILE_SIZE - 5, lb.y * TILE_SIZE, 26, 14);
            }
          },
        });
      });

      // ── 11c. Street Lanterns (Hanging Timber Bracket Posts & Oil Lanterns) ──
      const streetLanterns = [
        // Central Plaza Road Forks (Timber Bracket Hanging Lanterns matching reference)
        { x: 30, y: 29, flip: false, bracket: true },
        { x: 34, y: 29, flip: true, bracket: true },
        { x: 30, y: 33, flip: false, bracket: true },
        { x: 34, y: 33, flip: true, bracket: true },
        // Notice Board square corners
        { x: 29, y: 21 }, { x: 35, y: 21 },
        // Bell Tower Landmark Lanterns
        { x: 29, y: 13 }, { x: 35, y: 13 },
        // Ledger Hut Bank Lanterns
        { x: 47, y: 13 }, { x: 53, y: 13 },
        // North Road lanterns
        { x: 24, y: 17 }, { x: 40, y: 17 },
        // Archive Cellar Secluded Lantern
        { x: 14, y: 35 },
        // Toolshed Workshop Lanterns
        { x: 50, y: 35 }, { x: 54, y: 31 },
        // Sky Post Courier Lantern
        { x: 46, y: 26 },
        // Footbridge North & South Abutment Lanterns
        { x: 30, y: 40 }, { x: 34, y: 47 },
        // South Crossing & Festival / Cinema road
        { x: 30, y: 49 }, { x: 34, y: 49 },
        { x: 22, y: 49 }, { x: 42, y: 49 },
      ];
      streetLanterns.forEach((lp) => {
        if (viewW < 1000 && (lp.x * TILE_SIZE < camMinX || lp.x * TILE_SIZE > camMaxX || lp.y * TILE_SIZE < camMinY || lp.y * TILE_SIZE > camMaxY)) return;
        renderables.push({
          y: (lp.y + 1) * TILE_SIZE,
          render: () => {
            if (lp.bracket) {
              drawTimberBracketLantern(ctx, lp.x * TILE_SIZE, lp.y * TILE_SIZE, state.animFrame, lp.flip);
              return;
            }
            const lImg = state.images.lantern_wood_post || state.images.lantern_post;
            if (lImg) {
              const w = state.images.lantern_wood_post ? 22 : 16;
              const h = state.images.lantern_wood_post ? 34 : 24;
              const yOff = state.images.lantern_wood_post ? -18 : -8;
              const xOff = state.images.lantern_wood_post ? -3 : 0;
              ctx.drawImage(lImg, lp.x * TILE_SIZE + xOff, lp.y * TILE_SIZE + yOff, w, h);
            }
          },
        });
      });

      // Cozy Portable Oil Lanterns (on stone ledges / tables)
      const oilLanterns = [
        { x: 34, y: 24 }, // Notice Board stone post
        { x: TOOLSHED.x + 1, y: TOOLSHED.y }, // Toolshed workbench edge
      ];
      oilLanterns.forEach((ol) => {
        if (viewW < 1000 && (ol.x * TILE_SIZE < camMinX || ol.x * TILE_SIZE > camMaxX || ol.y * TILE_SIZE < camMinY || ol.y * TILE_SIZE > camMaxY)) return;
        renderables.push({
          y: (ol.y + 1) * TILE_SIZE,
          render: () => {
            const oilImg = state.images.lantern_oil;
            if (oilImg) {
              ctx.drawImage(oilImg, ol.x * TILE_SIZE + 1, ol.y * TILE_SIZE - 2, 14, 18);
            }
          },
        });
      });

      // ── 11d. Location Flowerbeds & Plantings ──
      const flowerBeds = [
        // Plaza Four Corners
        { x: 29, y: 29, type: 'poppy' }, { x: 35, y: 29, type: 'sunflower' },
        { x: 29, y: 35, type: 'daisy' }, { x: 35, y: 35, type: 'poppy' },
        // Bell Tower Circular Garden
        { x: 29, y: 14, type: 'daisy' }, { x: 35, y: 14, type: 'daisy' },
        // Bank Courtyard Flowers
        { x: 47, y: 15, type: 'poppy' }, { x: 53, y: 15, type: 'poppy' },
        // Farmstead Garden Fence Sunflowers & Poppies
        { x: 11, y: 15, type: 'sunflower' }, { x: 17, y: 15, type: 'sunflower' },
        { x: 10, y: 14, type: 'poppy' },
        // Notice Board square corners
        { x: 30, y: 22, type: 'daisy' }, { x: 34, y: 22, type: 'daisy' },
        // Inn & Cottage gardens
        { x: 21, y: 24, type: 'poppy' }, { x: 27, y: 23, type: 'sunflower' },
        { x: 37, y: 24, type: 'daisy' }, { x: 42, y: 24, type: 'poppy' },
        // Sky Post Garden
        { x: 43, y: 26, type: 'daisy' },
        // Wishing Well Garden
        { x: 18, y: 26, type: 'poppy' }, { x: 21, y: 26, type: 'daisy' },
        // Toolshed yard marigolds
        { x: 49, y: 34, type: 'sunflower' },
        // Roadside meadow patches between the connectors and the plaza
        { x: 21, y: 29, type: 'poppy' }, { x: 23, y: 30, type: 'daisy' }, { x: 25, y: 29, type: 'sunflower' },
        { x: 41, y: 29, type: 'poppy' }, { x: 43, y: 30, type: 'daisy' }, { x: 39, y: 29, type: 'sunflower' },
        { x: 20, y: 22, type: 'daisy' }, { x: 44, y: 22, type: 'poppy' },
      ];
      flowerBeds.forEach((fb) => {
        if (viewW < 1000 && (fb.x * TILE_SIZE < camMinX || fb.x * TILE_SIZE > camMaxX || fb.y * TILE_SIZE < camMinY || fb.y * TILE_SIZE > camMaxY)) return;
        renderables.push({
          y: (fb.y + 1) * TILE_SIZE,
          render: () => {
            const fImg = fb.type === 'poppy'
              ? state.images.flowers_poppy
              : (fb.type === 'sunflower' ? state.images.flowers_sunflower : state.images.flowers_daisy);
            if (fImg) {
              const yOff = fb.type === 'sunflower' ? -2 : 0;
              const w = fb.type === 'sunflower' ? 14 : 16;
              const h = fb.type === 'sunflower' ? 18 : 16;
              ctx.drawImage(fImg, fb.x * TILE_SIZE, fb.y * TILE_SIZE + yOff, w, h);
            }
          },
        });
      });

      // ── 11e. Flowering & Decorative Bushes ──
      const bushes = [
        // Plaza Margins
        { x: 29, y: 32, type: 'green' }, { x: 35, y: 32, type: 'yellow' },
        { x: 30, y: 35, type: 'red' }, { x: 34, y: 35, type: 'tiered' },
        // Bell Tower Garden Flanks
        { x: 28, y: 13, type: 'tiered' }, { x: 36, y: 13, type: 'tiered' },
        // Bank Courtyard Topiaries
        { x: 46, y: 14, type: 'green' }, { x: 54, y: 14, type: 'green' },
        // Town Square hedges
        { x: 28, y: 22, type: 'green' }, { x: 36, y: 22, type: 'green' },
        { x: 21, y: 22, type: 'tiered' }, { x: 43, y: 22, type: 'tiered' },
        // Woodland Trail & Shoreline Margins
        { x: 15, y: 22, type: 'green' }, { x: 49, y: 22, type: 'yellow' },
        { x: 27, y: 43, type: 'tiered' }, { x: 37, y: 43, type: 'green' },
        // Toolshed yard hedges
        { x: 55, y: 34, type: 'green' }, { x: 49, y: 31, type: 'yellow' },
        // Meadow hedges
        { x: 22, y: 28, type: 'tiered' }, { x: 42, y: 28, type: 'tiered' },
        { x: 25, y: 31, type: 'green' }, { x: 39, y: 31, type: 'green' },
      ];
      bushes.forEach((bp) => {
        if (viewW < 1000 && (bp.x * TILE_SIZE < camMinX || bp.x * TILE_SIZE > camMaxX || bp.y * TILE_SIZE < camMinY || bp.y * TILE_SIZE > camMaxY)) return;
        renderables.push({
          y: (bp.y + 1) * TILE_SIZE,
          render: () => {
            const bImg = bp.type === 'yellow'
              ? state.images.bush_yellow
              : (bp.type === 'red' ? state.images.bush_red : (bp.type === 'tiered' ? state.images.bush_tiered : state.images.bush_green));
            if (bImg) {
              ctx.drawImage(bImg, bp.x * TILE_SIZE - 3, bp.y * TILE_SIZE - 2, 22, 18);
            }
          },
        });
      });

      // ── 11f. Directional Road Signposts at the main junctions ──
      const signposts = [
        { x: 30, y: 27 }, // North Belfry Avenue exit
        { x: 30, y: 37 }, // South Pond exit
        { x: 26, y: 35 }, // West road junction (Archive)
        { x: 38, y: 35 }, // East road junction (Toolshed)
        { x: 29, y: 48 }, // South Crossing
      ];
      signposts.forEach((sp) => {
        renderables.push({
          y: (sp.y + 1) * TILE_SIZE,
          render: () => {
            ctx.drawImage(tileset, 6 * TILE_SIZE, 5 * TILE_SIZE, TILE_SIZE, TILE_SIZE, sp.x * TILE_SIZE, sp.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
          },
        });
      });

      // ── 12a. Forest Environmental Props (Fallen logs, Mossy boulders, Mushrooms) ──
      FOREST_PROPS.forEach((prop) => {
        if (viewW < 1000 && (prop.x * TILE_SIZE < camMinX || prop.x * TILE_SIZE > camMaxX || prop.y * TILE_SIZE < camMinY || prop.y * TILE_SIZE > camMaxY)) {
          return;
        }
        if (prop.type === 'log') {
          const logImg = state.images.fallen_log;
          renderables.push({
            y: (prop.y + 1) * TILE_SIZE,
            render: () => {
              if (logImg) {
                ctx.drawImage(logImg, prop.x * TILE_SIZE - 8, prop.y * TILE_SIZE, 32, 16);
              }
            },
          });
        } else if (prop.type === 'rock') {
          const rockImg = state.images.rock_moss;
          renderables.push({
            y: (prop.y + 1) * TILE_SIZE,
            render: () => {
              if (rockImg) {
                ctx.drawImage(rockImg, prop.x * TILE_SIZE - 4, prop.y * TILE_SIZE - 4, 24, 20);
              }
            },
          });
        } else if (prop.type === 'rock_slate') {
          const slateImg = state.images.rock_slate;
          renderables.push({
            y: (prop.y + 1) * TILE_SIZE,
            render: () => {
              if (slateImg) {
                ctx.drawImage(slateImg, prop.x * TILE_SIZE - 2, prop.y * TILE_SIZE + 2, 20, 14);
              }
            },
          });
        } else if (prop.type === 'stone_monument') {
          const monImg = state.images.stone_monument;
          renderables.push({
            y: (prop.y + 1) * TILE_SIZE,
            render: () => {
              if (monImg) {
                ctx.drawImage(monImg, prop.x * TILE_SIZE - 2, prop.y * TILE_SIZE - 12, 20, 28);
              }
            },
          });
        } else if (prop.type === 'mushrooms') {
          const mushImg = state.images.mushrooms;
          renderables.push({
            y: (prop.y + 1) * TILE_SIZE,
            render: () => {
              if (mushImg) {
                ctx.drawImage(mushImg, prop.x * TILE_SIZE - 1, prop.y * TILE_SIZE - 2, 18, 18);
              }
            },
          });
        } else if (prop.type === 'stump') {
          const stumpImg = state.images.tree_stump;
          renderables.push({
            y: (prop.y + 1) * TILE_SIZE,
            render: () => {
              if (stumpImg) {
                ctx.drawImage(stumpImg, prop.x * TILE_SIZE - 3, prop.y * TILE_SIZE - 4, 22, 20);
              }
            },
          });
        }
      });

      // ── 12b. Dense Forest Trees (Perimeter Woodland Band + Internal Groves) ──
      FOREST_TREES.forEach((tr) => {
        // Viewport culling (skip trees far off camera, but draw all when capturing full map)
        if (viewW < 1000 && (tr.x * TILE_SIZE < camMinX || tr.x * TILE_SIZE > camMaxX || tr.y * TILE_SIZE < camMinY || tr.y * TILE_SIZE > camMaxY)) {
          return;
        }

        if (tr.type === 'pine') {
          const pineImg = state.images.tree_pine;
          renderables.push({
            y: (tr.y + 1) * TILE_SIZE,
            render: () => {
              if (pineImg) {
                ctx.drawImage(pineImg, tr.x * TILE_SIZE - 8, tr.y * TILE_SIZE - 32, 32, 48);
              } else {
                ctx.drawImage(tileset, 4 * TILE_SIZE, 5 * TILE_SIZE, TILE_SIZE, TILE_SIZE, tr.x * TILE_SIZE, tr.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
              }
            },
          });
        } else if (tr.type === 'blossom') {
          const blossomImg = state.images.tree_blossom;
          renderables.push({
            y: (tr.y + 1) * TILE_SIZE,
            render: () => {
              if (blossomImg) {
                ctx.drawImage(blossomImg, tr.x * TILE_SIZE - 8, tr.y * TILE_SIZE - 32, 32, 48);
              } else {
                ctx.drawImage(tileset, 2 * TILE_SIZE, 5 * TILE_SIZE, TILE_SIZE, TILE_SIZE, tr.x * TILE_SIZE, (tr.y - 1) * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                ctx.drawImage(tileset, 3 * TILE_SIZE, 5 * TILE_SIZE, TILE_SIZE, TILE_SIZE, tr.x * TILE_SIZE, tr.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
              }
            },
          });
        } else {
          // Oak
          const oakImg = state.images.tree_oak;
          renderables.push({
            y: (tr.y + 1) * TILE_SIZE,
            render: () => {
              if (oakImg) {
                ctx.drawImage(oakImg, tr.x * TILE_SIZE - 8, tr.y * TILE_SIZE - 32, 32, 48);
              } else {
                ctx.drawImage(tileset, 0, 5 * TILE_SIZE, TILE_SIZE, TILE_SIZE, tr.x * TILE_SIZE, (tr.y - 1) * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                ctx.drawImage(tileset, 1 * TILE_SIZE, 5 * TILE_SIZE, TILE_SIZE, TILE_SIZE, tr.x * TILE_SIZE, tr.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
              }
            },
          });
        }
      });

      // ── 13. Pip the Farmer ──
      renderables.push({
        y: pip.y + 30, // foot Y
        render: () => {
          const pipImg = state.images.pip;
          if (pipImg) {
            ctx.drawImage(pipImg, pip.frame * 16, pip.dir * 32, 16, 32, Math.floor(pip.x), Math.floor(pip.y), 16, 32);
          }
        },
      });

      // Sort all renderables by foot Y for depth sorting
      renderables.sort((a, b) => a.y - b.y);
      renderables.forEach((item) => item.render());

      // ── Layer 4a: Ambient Lantern Radial Halos & Flame Flicker ──
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const allLanternLights = [
        // Street Timber Bracket Post Lanterns
        ...streetLanterns.map((l) => ({ x: l.x * TILE_SIZE + 13, y: l.y * TILE_SIZE + 2, radius: 34 })),
        // Portable Oil Lanterns
        ...oilLanterns.map((l) => ({ x: l.x * TILE_SIZE + 7, y: l.y * TILE_SIZE + 6, radius: 24 })),
        // Porch & Doorway Lanterns
        { x: 14 * TILE_SIZE + 28, y: 13 * TILE_SIZE + 4, radius: 30 }, // Farmhouse porch
        { x: 50 * TILE_SIZE + 18, y: 12 * TILE_SIZE + 10, radius: 32 }, // Bank door
        { x: INN.x * TILE_SIZE + 8, y: (INN.y - 1) * TILE_SIZE + 4, radius: 30 }, // Inn doorway
        { x: TOOLSHED.x * TILE_SIZE + 8, y: (TOOLSHED.y - 1) * TILE_SIZE + 8, radius: 26 }, // Forge glow
      ];

      allLanternLights.forEach((ll, lIdx) => {
        if (viewW < 1000 && (ll.x < camMinX - 32 || ll.x > camMaxX + 32 || ll.y < camMinY - 32 || ll.y > camMaxY + 32)) return;
        const flicker = Math.sin(state.animFrame * 0.2 + lIdx * 2.1) * 0.08 + Math.cos(state.animFrame * 0.35 + lIdx * 1.3) * 0.04;
        const r = ll.radius * (1 + flicker);
        const grad = ctx.createRadialGradient(ll.x, ll.y, 1, ll.x, ll.y, r);
        grad.addColorStop(0, `rgba(254, 240, 138, ${(0.40 + flicker * 0.22).toFixed(3)})`);
        grad.addColorStop(0.35, `rgba(245, 158, 11, 0.15)`);
        grad.addColorStop(0.7, `rgba(217, 119, 6, 0.05)`);
        grad.addColorStop(1, 'rgba(180, 83, 9, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(ll.x, ll.y, r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();

      // ── Layer 4b: Bioluminescent Woodland Fireflies ──
      state.fireflies.forEach((f) => {
        f.x = f.baseX + Math.sin(f.phase + state.animFrame * 0.05) * 14;
        f.y = f.baseY + Math.cos(f.phase * 1.4 + state.animFrame * 0.04) * 10;
        if (viewW < 1000 && (f.x < camMinX || f.x > camMaxX || f.y < camMinY || f.y > camMaxY)) return;

        const pulse = (Math.sin(state.animFrame * 0.12 + f.pulsePhase) + 1) / 2;
        const alpha = 0.25 + pulse * 0.65;

        ctx.save();
        const grad = ctx.createRadialGradient(f.x, f.y, 0.5, f.x, f.y, 6);
        grad.addColorStop(0, `rgba(254, 240, 138, ${alpha.toFixed(3)})`);
        grad.addColorStop(0.4, `rgba(134, 239, 172, ${(alpha * 0.6).toFixed(3)})`);
        grad.addColorStop(1, 'rgba(134, 239, 172, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(f.x, f.y, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fef08a';
        ctx.fillRect(Math.floor(f.x), Math.floor(f.y), 1.5, 1.5);
        ctx.restore();
      });

      // ── Layer 4c: Falling Cherry Blossom Petals & Autumn Breeze ──
      state.petals.forEach((p) => {
        p.x += p.speedX + Math.sin(p.swayPhase + state.animFrame * 0.05) * 0.8;
        p.y += p.speedY;
        p.angle += p.rotSpeed;

        if (viewW < 1000) {
          if (p.y > camMaxY + 20) { p.y = camMinY - 20; p.x = camMinX + Math.random() * (viewW + 60) - 30; }
          if (p.x > camMaxX + 20) { p.x = camMinX - 20; }
        } else {
          if (p.y > 64 * TILE_SIZE + 20) { p.y = -20; p.x = Math.random() * 64 * TILE_SIZE; }
          if (p.x > 64 * TILE_SIZE + 20) { p.x = -20; }
        }

        if (viewW < 1000 && (p.x < camMinX || p.x > camMaxX || p.y < camMinY || p.y > camMaxY)) return;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.globalAlpha = p.alpha;

        // Shadow under petal
        ctx.fillStyle = 'rgba(20, 30, 20, 0.22)';
        ctx.beginPath();
        ctx.ellipse(0.5, 1, p.rx, p.ry * 0.7, 0, 0, Math.PI * 2);
        ctx.fill();

        // Petal body
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.rx, p.ry, 0, 0, Math.PI * 2);
        ctx.fill();

        // Petal highlight tip
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = p.alpha * 0.45;
        ctx.fillRect(-1, -0.5, 1.5, 1);
        ctx.restore();
      });

      // ── Layer 4c-2: Gentle Diagonal Rain Drizzle (matching reference screenshot) ──
      if (state.rain) {
        ctx.save();
        ctx.lineWidth = 1;
        state.rain.forEach((r) => {
          r.x += r.speed * 0.35;
          r.y += r.speed;

          if (viewW < 1000) {
            if (r.y > camMaxY + 20) {
              r.y = camMinY - 20;
              r.x = camMinX + ((hash2D(r.id, Math.floor(state.animFrame)) % 1000) / 1000) * (viewW + 80) - 40;
            }
          } else {
            if (r.y > 64 * TILE_SIZE + 20) {
              r.y = -20;
              r.x = ((hash2D(r.id, Math.floor(state.animFrame)) % 1000) / 1000) * (64 * TILE_SIZE);
            }
          }

          if (viewW < 1000 && (r.x < camMinX - 20 || r.x > camMaxX + 20 || r.y < camMinY - 20 || r.y > camMaxY + 20)) return;

          ctx.strokeStyle = `rgba(224, 242, 254, ${r.alpha.toFixed(2)})`;
          ctx.beginPath();
          ctx.moveTo(r.x, r.y);
          ctx.lineTo(r.x + r.len * 0.35, r.y + r.len);
          ctx.stroke();
        });
        ctx.restore();
      }

      // ── Layer 4d: Floating Building Signposts & Hover Highlights ──
      BUILDING_HITBOXES.forEach((b) => {
        const isHovered = state.hoverBuilding?.id === b.id;
        const bx = b.bannerX;
        const by = b.bannerY;

        ctx.save();
        ctx.font = '7px monospace';
        const labelText = `${b.icon} ${b.label}`;
        const textWidth = ctx.measureText(labelText).width;
        const padX = 4;
        const boxW = textWidth + padX * 2;
        const boxH = 10;
        const boxX = Math.floor(bx - boxW / 2);
        const boxY = Math.floor(by);

        // Signboard backing
        ctx.fillStyle = isHovered ? '#b45309' : 'rgba(28, 17, 10, 0.88)';
        ctx.fillRect(boxX, boxY, boxW, boxH);

        // Pixel border
        ctx.strokeStyle = isHovered ? '#fbbf24' : '#d97706';
        ctx.lineWidth = 1;
        ctx.strokeRect(boxX, boxY, boxW, boxH);

        // Text
        ctx.fillStyle = isHovered ? '#ffffff' : '#fef08a';
        ctx.fillText(labelText, boxX + padX, boxY + 7);
        ctx.restore();
      });

      // ── Layer 5: Proximity Interaction Bubble Above Pip ──
      if (state.nearbyBuilding && state.isOverworldMode) {
        const bubbleX = Math.floor(pip.x + 8);
        const bubbleY = Math.floor(pip.y - 12 + Math.sin(state.animFrame * 0.4) * 2);

        ctx.save();
        ctx.font = 'bold 7px monospace';
        const promptText = `[E] Enter  •  [P] Panel Only`;
        const pWidth = ctx.measureText(promptText).width;
        const bW = pWidth + 8;
        const bH = 12;
        const bX = Math.floor(bubbleX - bW / 2);
        const bY = Math.floor(bubbleY - bH);

        // Bubble background
        ctx.fillStyle = '#fef3c7';
        ctx.fillRect(bX, bY, bW, bH);
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 1;
        ctx.strokeRect(bX, bY, bW, bH);

        // Text
        ctx.fillStyle = '#78350f';
        ctx.fillText(promptText, bX + 4, bY + 8);
        ctx.restore();
      }

      ctx.restore();

      // ── Day / Night Light Color Grading Tint ──
      const hour = new Date().getHours();
      let tintColor = null;

      if (hour < 5 || hour >= 20) {
        tintColor = 'rgba(15, 23, 42, 0.42)';
      } else if (hour >= 5 && hour < 8) {
        tintColor = 'rgba(251, 146, 60, 0.08)';
      } else if (hour >= 17 && hour < 20) {
        tintColor = 'rgba(217, 119, 6, 0.12)';
      } else {
        tintColor = 'rgba(254, 240, 138, 0.04)';
      }

      if (tintColor) {
        ctx.fillStyle = tintColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [reducedMotion, onNavigateToChapter]);

  return (
    <div
      className={`pixel-world-viewport ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        background: '#120b06',
        ...style,
      }}
    >
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        onMouseMove={handleCanvasMouseMove}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          imageRendering: 'pixelated',
        }}
      />
    </div>
  );
}