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

export default function PixelWorldCanvas(props) {
  return <ClassicPixelCanvas {...props} />;
}

function ClassicPixelCanvas({
  activeTab = null,
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
    camera: { x: 32 * TILE_SIZE, y: 33 * TILE_SIZE },
    targetCamera: { x: 32 * TILE_SIZE, y: 33 * TILE_SIZE },
    pip: { x: 32 * TILE_SIZE, y: 33 * TILE_SIZE, dir: 0, frame: 0, walking: false },
    clickTarget: null,
    hoverBuilding: null,
    nearbyBuilding: null,
    animFrame: 0,
    isOverworldMode: true,
  });

  // 1. Synchronize active chapter anchor
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
        stateRef.current.pip.x = targetX;
        stateRef.current.pip.y = targetY + 8;
        stateRef.current.pip.walking = false;
      }
    }
  }, [activeTab, reducedMotion]);

  // 2. Keyboard Controls
  useEffect(() => {
    function handleKeyDown(e) {
      const tag = document.activeElement?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

      const code = e.code;
      const movementCodes = ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight'];

      if (movementCodes.includes(code)) {
        if (code.startsWith('Arrow')) {
          e.preventDefault();
        }
        if (onPlayerInteractRef.current) {
          onPlayerInteractRef.current();
        }
        activeKeysRef.current.add(code);
        stateRef.current.clickTarget = null;
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
        if (onCloseChapter) {
          e.preventDefault();
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
  }, [onNavigateToChapter, onCloseChapter]);

  // 3. Click Handling
  const handleCanvasClick = useCallback(
    (e) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const clickClientX = e.clientX - rect.left;
      const clickClientY = e.clientY - rect.top;

      const state = stateRef.current;
      const isMobile = canvas.clientWidth < 640;
      const scale = isMobile ? 2.5 : 3;

      const viewCenterWorldX = state.camera.x;
      const viewCenterWorldY = state.camera.y;

      const worldX = viewCenterWorldX + (clickClientX - canvas.clientWidth / 2) / scale;
      const worldY = viewCenterWorldY + (clickClientY - canvas.clientHeight / 2) / scale;

      if (onPlayerInteractRef.current) {
        onPlayerInteractRef.current();
      }

      const hit = getHitBuilding(worldX, worldY);
      if (hit) {
        soundManager.playSfx('pop');
        state.clickTarget = {
          x: hit.doorX,
          y: hit.doorY,
          buildingId: hit.id,
        };
        if (onNavigateToChapter) {
          onNavigateToChapter(hit.id, { panelOnly: false });
        }
      } else {
        soundManager.playSfx('pop');
        state.clickTarget = {
          x: Math.max(16, Math.min(MAP_WIDTH_TILES * TILE_SIZE - 16, worldX)),
          y: Math.max(16, Math.min(MAP_HEIGHT_TILES * TILE_SIZE - 16, worldY)),
          buildingId: null,
        };
      }
    },
    [onNavigateToChapter]
  );

  // 4. Mouse Hover
  const handleCanvasMouseMove = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseClientX = e.clientX - rect.left;
    const mouseClientY = e.clientY - rect.top;

    const state = stateRef.current;
    const isMobile = canvas.clientWidth < 640;
    const scale = isMobile ? 2.5 : 3;

    const viewCenterWorldX = state.camera.x;
    const viewCenterWorldY = state.camera.y;

    const worldX = viewCenterWorldX + (mouseClientX - canvas.clientWidth / 2) / scale;
    const worldY = viewCenterWorldY + (mouseClientY - canvas.clientHeight / 2) / scale;

    const hit = getHitBuilding(worldX, worldY);
    state.hoverBuilding = hit;
    canvas.style.cursor = hit ? 'pointer' : 'default';
  }, []);

  // 5. Blueprint Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    function render() {
      const state = stateRef.current;
      state.animFrame++;

      // Resize canvas to match display size (devicePixelRatio scaling)
      const dpr = window.devicePixelRatio || 1;
      const displayWidth = Math.floor(canvas.clientWidth * dpr);
      const displayHeight = Math.floor(canvas.clientHeight * dpr);

      if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
      }

      ctx.imageSmoothingEnabled = false;

      // ── Movement & Collision ──
      const { vx, vy } = getKeyboardVelocity(activeKeysRef.current);
      const isMoving = vx !== 0 || vy !== 0;

      if (isMoving) {
        state.pip.walking = true;
        let dir = state.pip.dir;
        if (Math.abs(vy) > Math.abs(vx)) {
          dir = vy > 0 ? 0 : 1;
        } else if (Math.abs(vx) > 0) {
          dir = vx > 0 ? 3 : 2;
        }
        state.pip.dir = dir;
        const speed = 2.4;

        const nextX = state.pip.x + vx * speed;
        if (isWalkable(nextX, state.pip.y)) {
          state.pip.x = nextX;
        }

        const nextY = state.pip.y + vy * speed;
        if (isWalkable(state.pip.x, nextY)) {
          state.pip.y = nextY;
        }
      } else if (state.clickTarget) {
        const dx = state.clickTarget.x - state.pip.x;
        const dy = state.clickTarget.y - state.pip.y;
        const dist = Math.hypot(dx, dy);

        if (dist > 4) {
          state.pip.walking = true;
          const speed = 2.2;
          const moveX = (dx / dist) * speed;
          const moveY = (dy / dist) * speed;

          if (Math.abs(dx) > Math.abs(dy)) {
            state.pip.dir = dx > 0 ? 3 : 2;
          } else {
            state.pip.dir = dy > 0 ? 0 : 1;
          }

          if (isWalkable(state.pip.x + moveX, state.pip.y)) {
            state.pip.x += moveX;
          }
          if (isWalkable(state.pip.x, state.pip.y + moveY)) {
            state.pip.y += moveY;
          }
        } else {
          state.pip.walking = false;
          if (state.clickTarget.buildingId && onNavigateToChapter) {
            onNavigateToChapter(state.clickTarget.buildingId, { panelOnly: false });
          }
          state.clickTarget = null;
        }
      } else {
        state.pip.walking = false;
      }

      // ── Proximity Check ──
      const nearby = getNearbyBuilding(state.pip.x, state.pip.y, 40);
      state.nearbyBuilding = nearby;

      if (nearby !== lastReportedNearbyRef.current) {
        lastReportedNearbyRef.current = nearby;
        setNearbyBuildingState(nearby);
        if (onNearbyBuildingChangeRef.current) {
          onNearbyBuildingChangeRef.current(nearby);
        }
      }

      // ── Camera Lerp ──
      if (state.isOverworldMode) {
        state.targetCamera = { x: state.pip.x, y: state.pip.y };
      }

      if (reducedMotion) {
        state.camera.x = state.targetCamera.x;
        state.camera.y = state.targetCamera.y;
      } else {
        state.camera.x += (state.targetCamera.x - state.camera.x) * 0.12;
        state.camera.y += (state.targetCamera.y - state.camera.y) * 0.12;
      }

      // ── Scale & Viewport Calculation ──
      const isMobile = canvas.clientWidth < 640;
      const baseScale = isMobile ? 2.5 : 3;
      const scale = baseScale * dpr;

      // Clear Screen with deep slate blueprint color
      ctx.fillStyle = '#080d1a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.scale(scale, scale);

      const viewW = canvas.width / scale;
      const viewH = canvas.height / scale;
      const camX = Math.round(state.camera.x);
      const camY = Math.round(state.camera.y);

      // Translate so (camX, camY) is at the center of the viewport
      ctx.translate(Math.round(viewW / 2 - camX), Math.round(viewH / 2 - camY));

      const worldW = MAP_WIDTH_TILES * TILE_SIZE;
      const worldH = MAP_HEIGHT_TILES * TILE_SIZE;

      // ── 1. Map Canvas Background ──
      ctx.fillStyle = '#0b1329';
      ctx.fillRect(0, 0, worldW, worldH);

      // ── 2. Minor Grid (16px Tiles) ──
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.06)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x <= worldW; x += TILE_SIZE) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, worldH);
      }
      for (let y = 0; y <= worldH; y += TILE_SIZE) {
        ctx.moveTo(0, y);
        ctx.lineTo(worldW, y);
      }
      ctx.stroke();

      // ── 3. Major Grid (64px = 4 Tiles) ──
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.16)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x <= worldW; x += TILE_SIZE * 4) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, worldH);
      }
      for (let y = 0; y <= worldH; y += TILE_SIZE * 4) {
        ctx.moveTo(0, y);
        ctx.lineTo(worldW, y);
      }
      ctx.stroke();

      // ── 4. Coordinate Markers around boundary ──
      ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
      ctx.font = '7px monospace';
      ctx.textAlign = 'center';
      for (let tx = 0; tx <= MAP_WIDTH_TILES; tx += 8) {
        ctx.fillText(`${tx}`, tx * TILE_SIZE, 9);
      }
      ctx.textAlign = 'left';
      for (let ty = 0; ty <= MAP_HEIGHT_TILES; ty += 8) {
        ctx.fillText(`${ty}`, 2, ty * TILE_SIZE + 7);
      }

      // ── 5. Pathways & Road Corridors ──
      ctx.fillStyle = 'rgba(56, 189, 248, 0.08)';
      for (let ty = 0; ty < MAP_HEIGHT_TILES; ty++) {
        for (let tx = 0; tx < MAP_WIDTH_TILES; tx++) {
          if (isVillagePath(tx, ty)) {
            ctx.fillRect(tx * TILE_SIZE, ty * TILE_SIZE, TILE_SIZE, TILE_SIZE);
          }
        }
      }

      // Cobblestone Plazas & Platforms
      ctx.fillStyle = 'rgba(14, 165, 233, 0.15)';
      for (let ty = 0; ty < MAP_HEIGHT_TILES; ty++) {
        for (let tx = 0; tx < MAP_WIDTH_TILES; tx++) {
          if (isVillageCobble(tx, ty)) {
            ctx.fillRect(tx * TILE_SIZE, ty * TILE_SIZE, TILE_SIZE, TILE_SIZE);
          }
        }
      }

      // ── 6. Woodland Pond & Footbridge ──
      const pondX = POND.minX * TILE_SIZE;
      const pondY = POND.minY * TILE_SIZE;
      const pondW = (POND.maxX - POND.minX + 1) * TILE_SIZE;
      const pondH = (POND.maxY - POND.minY + 1) * TILE_SIZE;

      ctx.fillStyle = 'rgba(6, 182, 212, 0.22)';
      ctx.fillRect(pondX, pondY, pondW, pondH);
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 2]);
      ctx.strokeRect(pondX, pondY, pondW, pondH);
      ctx.setLineDash([]);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 8px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('🌊 WOODLAND POND', pondX + pondW / 2, pondY + 14);

      // Footbridge across pond
      const bridgeX = POND.bridgeX * TILE_SIZE;
      ctx.fillStyle = 'rgba(245, 158, 11, 0.3)';
      ctx.fillRect(bridgeX - 4, pondY, 24, pondH);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1;
      ctx.strokeRect(bridgeX - 4, pondY, 24, pondH);
      ctx.fillStyle = '#fbbf24';
      ctx.font = '7px monospace';
      ctx.fillText('BRIDGE', bridgeX + 8, pondY + pondH / 2);

      // ── 7. Central Plaza & Fountain (32, 31) ──
      const fX = 32 * TILE_SIZE;
      const fY = 31 * TILE_SIZE;
      ctx.fillStyle = 'rgba(14, 165, 233, 0.22)';
      ctx.beginPath();
      ctx.arc(fX, fY, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      const fPulse = 8 + (state.animFrame % 40) * 0.35;
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
      ctx.beginPath();
      ctx.arc(fX, fY, fPulse, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#bae6fd';
      ctx.font = 'bold 8px monospace';
      ctx.fillText('⛲ CENTRAL PLAZA', fX, fY - 6);
      ctx.font = '7px monospace';
      ctx.fillText('(32, 31)', fX, fY + 5);

      // ── 8. Chapter Buildings & Hitboxes ──
      BUILDING_HITBOXES.forEach((b) => {
        const bW = b.maxX - b.minX;
        const bH = b.maxY - b.minY;
        const isHovered = state.hoverBuilding?.id === b.id;
        const isNearby = state.nearbyBuilding?.id === b.id;

        // Bounding box background
        ctx.fillStyle = isNearby
          ? 'rgba(30, 58, 138, 0.75)'
          : isHovered
            ? 'rgba(15, 45, 80, 0.7)'
            : 'rgba(15, 23, 42, 0.88)';
        ctx.fillRect(b.minX, b.minY, bW, bH);

        // Bounding box border
        ctx.strokeStyle = isNearby ? '#fbbf24' : isHovered ? '#67e8f9' : '#0284c7';
        ctx.lineWidth = isNearby || isHovered ? 2 : 1.5;
        ctx.strokeRect(b.minX, b.minY, bW, bH);

        // Drafting Corner Brackets
        const bracketSize = 6;
        ctx.strokeStyle = isNearby ? '#f59e0b' : '#38bdf8';
        ctx.lineWidth = 2;
        // Top-left
        ctx.beginPath();
        ctx.moveTo(b.minX, b.minY + bracketSize);
        ctx.lineTo(b.minX, b.minY);
        ctx.lineTo(b.minX + bracketSize, b.minY);
        ctx.stroke();
        // Top-right
        ctx.beginPath();
        ctx.moveTo(b.maxX - bracketSize, b.minY);
        ctx.lineTo(b.maxX, b.minY);
        ctx.lineTo(b.maxX, b.minY + bracketSize);
        ctx.stroke();
        // Bottom-left
        ctx.beginPath();
        ctx.moveTo(b.minX, b.maxY - bracketSize);
        ctx.lineTo(b.minX, b.maxY);
        ctx.lineTo(b.minX + bracketSize, b.maxY);
        ctx.stroke();
        // Bottom-right
        ctx.beginPath();
        ctx.moveTo(b.maxX - bracketSize, b.maxY);
        ctx.lineTo(b.maxX, b.maxY);
        ctx.lineTo(b.maxX, b.maxY - bracketSize);
        ctx.stroke();

        // Building Info Labels
        const centerX = (b.minX + b.maxX) / 2;
        const centerY = (b.minY + b.maxY) / 2;

        ctx.fillStyle = isNearby ? '#fef08a' : '#f8fafc';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${b.icon} ${b.name.toUpperCase()}`, centerX, centerY - 5);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '8px monospace';
        ctx.fillText(b.label, centerX, centerY + 7);

        ctx.fillStyle = '#64748b';
        ctx.font = '7px monospace';
        ctx.fillText(`${Math.round(bW / 16)}×${Math.round(bH / 16)} Tiles • (${Math.round(b.doorX / 16)}, ${Math.round(b.doorY / 16)})`, centerX, centerY + 18);

        // Glowing Door Target Marker
        const doorPulse = Math.sin(state.animFrame * 0.1) * 1.5;
        ctx.fillStyle = isNearby ? '#f59e0b' : '#38bdf8';
        ctx.beginPath();
        ctx.arc(b.doorX, b.doorY, 4 + doorPulse, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 6px monospace';
        ctx.fillText('DOOR', b.doorX, b.doorY - 6);
      });

      // ── 9. Click Waypoint Reticle ──
      if (state.clickTarget) {
        const ctPulse = (state.animFrame % 20) * 0.5;
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(state.clickTarget.x, state.clickTarget.y, 5 + ctPulse, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(state.clickTarget.x, state.clickTarget.y, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // ── 10. Player Character (Pip) ──
      const pipX = Math.round(state.pip.x);
      const pipY = Math.round(state.pip.y);
      const walkBob = state.pip.walking ? Math.sin(state.animFrame * 0.3) * 1.5 : 0;

      // Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.beginPath();
      ctx.ellipse(pipX, pipY + 8, 7, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Body / Tunic (Blue with gold belt)
      ctx.fillStyle = '#2563eb';
      ctx.fillRect(pipX - 6, pipY - 8 + walkBob, 12, 14);

      // Belt
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(pipX - 6, pipY + walkBob, 12, 2);

      // Head (Skin tone)
      ctx.fillStyle = '#fed7aa';
      ctx.fillRect(pipX - 5, pipY - 17 + walkBob, 10, 9);

      // Red Cap with feather
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(pipX - 6, pipY - 21 + walkBob, 12, 5);
      ctx.fillStyle = '#10b981';
      ctx.fillRect(pipX + 2, pipY - 23 + walkBob, 2, 4);

      // Directional eyes
      ctx.fillStyle = '#0f172a';
      if (state.pip.dir === 0) {
        ctx.fillRect(pipX - 3, pipY - 14 + walkBob, 2, 2);
        ctx.fillRect(pipX + 1, pipY - 14 + walkBob, 2, 2);
      } else if (state.pip.dir === 1) {
        ctx.fillStyle = '#78350f';
        ctx.fillRect(pipX - 4, pipY - 16 + walkBob, 8, 6);
      } else if (state.pip.dir === 2) {
        ctx.fillRect(pipX - 4, pipY - 14 + walkBob, 2, 2);
      } else if (state.pip.dir === 3) {
        ctx.fillRect(pipX + 2, pipY - 14 + walkBob, 2, 2);
      }

      // Overhead Name Badge
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(pipX - 22, pipY - 33 + walkBob, 44, 11);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1;
      ctx.strokeRect(pipX - 22, pipY - 33 + walkBob, 44, 11);
      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 7px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Pip (You)', pipX, pipY - 24 + walkBob);

      ctx.restore();

      // ── 11. Fixed Screen Overlays (Unscaled UI Coordinates) ──

      // Top Blueprint Status Banner
      const topText = '📐 BLANK BLUEPRINT LAYOUT • 64×64 TILES • AWAITING NEW ASSET INTEGRATION';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      const tw = ctx.measureText(topText).width;
      const bw = tw + 28;
      const bx = canvas.width / 2 - bw / 2;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.fillRect(bx, 10, bw, 26);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1;
      ctx.strokeRect(bx, 10, bw, 26);
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(topText, canvas.width / 2, 27);

      // Bottom-Left Coordinates Display
      const pipTileX = Math.floor(state.pip.x / TILE_SIZE);
      const pipTileY = Math.floor(state.pip.y / TILE_SIZE);
      const coordText = `📍 TILE: (${pipTileX}, ${pipTileY}) • WORLD: (${Math.round(state.pip.x)}, ${Math.round(state.pip.y)})`;
      ctx.font = '10px monospace';
      ctx.textAlign = 'left';
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.fillRect(12, canvas.height - 34, 250, 22);
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 1;
      ctx.strokeRect(12, canvas.height - 34, 250, 22);
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(coordText, 20, canvas.height - 19);

      // Proximity Action Prompt
      if (nearby) {
        const promptText = `🚪 [E] Enter ${nearby.name} (${nearby.label})`;
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        const pw = ctx.measureText(promptText).width + 32;
        const px = canvas.width / 2 - pw / 2;
        ctx.fillStyle = 'rgba(245, 158, 11, 0.95)';
        ctx.fillRect(px, canvas.height - 52, pw, 32);
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(px, canvas.height - 52, pw, 32);
        ctx.fillStyle = '#0f172a';
        ctx.fillText(promptText, canvas.width / 2, canvas.height - 32);
      }

      animId = requestAnimationFrame(render);
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
        background: '#080d1a',
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
