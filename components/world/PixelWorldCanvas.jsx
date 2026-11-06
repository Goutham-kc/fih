import React, { useRef, useEffect, useState, useCallback } from 'react';
import { soundManager } from '@/lib/soundManager';
import { eventBus, EVENTS } from '@/lib/eventBus';
import { loadCollisionGrid, isPointWalkable, isFeetWalkable, getGrid } from './collisionGrid';

// 16-bit RPG Tile Size & Full Fields of Mistria (rm_town) Map Dimensions
export const TILE_SIZE = 16;
export const MAP_WIDTH_PX = 2128;
export const MAP_HEIGHT_PX = 2928;
export const MAP_WIDTH_TILES = Math.ceil(MAP_WIDTH_PX / TILE_SIZE); // 133
export const MAP_HEIGHT_TILES = Math.ceil(MAP_HEIGHT_PX / TILE_SIZE); // 183

/* ════════════════════════════════════════════════════════════════════════════
 *  FIELDS OF MISTRIA TOWN LAYOUT (Authentic rm_town.tmj Map)
 *
 *  North       : The Manor House & Archives (1084, 485) · Gazebo (1424, 284)
 *  Upper-West  : The Blacksmith & Forge Workshop (700, 997)
 *  Upper-East  : The Bathhouse (1388, 721)
 *  Mid-West    : The Bell Tower (516, 1291)
 *  Center-North: Saturday Market Plaza (1088, 1220) · Great Town Fountain (1096, 1120)
 *  East        : Clinic (1344, 1057) · River Stone Bridge (1616, 1016)
 *  Town Center : Sleeping Dragon Inn (916, 1741) · General Store & Treasury (1220, 1741)
 *                Town Notice Board (1352, 1736) · Town Mill (1408, 1440)
 *  South       : Celine's Flora Farmstead & Gardens (1304, 2135)
 * ════════════════════════════════════════════════════════════════════════════ */

// Woodland pond (water tiles). The footbridge runs down column `bridgeX`.
export const POND = { minX: 30, maxX: 34, minY: 42, maxY: 45, bridgeX: 32 };

// Decorative / landmark anchors (tile coords)
const SKY_POST = { x: 44, y: 25 };
const WISHING_WELL = { x: 19, y: 25 };
const TOOLSHED = { x: 52, y: 33 }; // door tile
const NOTICE = { x: 32, y: 23 }; // base tile of the board
const INN = { x: 24, y: 24 }; // centre / base tile
const COTTAGE = { x: 40, y: 24 }; // centre / base tile

// Chapter zone anchors in world tile coordinates
export const CHAPTER_ANCHORS = {
  todos: { x: Math.round(1304 / TILE_SIZE), y: Math.round(2135 / TILE_SIZE), name: 'The Farmstead', resident: 'pip', chapterTitle: 'Chapter 1: The Farmstead' },
  debts: { x: Math.round(1220 / TILE_SIZE), y: Math.round(1741 / TILE_SIZE), name: 'The Ledger Hut', resident: 'bram', chapterTitle: 'Chapter 2: The Ledger Hut' },
  reminders: { x: Math.round(516 / TILE_SIZE), y: Math.round(1291 / TILE_SIZE), name: 'The Bell Tower', resident: 'hoot', chapterTitle: 'Chapter 3: The Bell Tower' },
  deadlines: { x: Math.round(1352 / TILE_SIZE), y: Math.round(1736 / TILE_SIZE), name: 'The Notice Board', resident: 'marigold', chapterTitle: 'Chapter 4: The Notice Board' },
  dates: { x: Math.round(1504 / TILE_SIZE), y: Math.round(1736 / TILE_SIZE), name: 'The Town Mill', resident: 'clover', chapterTitle: 'Chapter 5: The Town Mill' },
  watchlist: { x: Math.round(916 / TILE_SIZE), y: Math.round(1741 / TILE_SIZE), name: 'The Moonlight Cinema', resident: 'juniper', chapterTitle: 'Chapter 6: The Moonlight Cinema' },
  audit: { x: Math.round(1084 / TILE_SIZE), y: Math.round(485 / TILE_SIZE), name: 'The Archive Cellar', resident: 'moss', chapterTitle: 'Chapter 7: The Archive Cellar' },
  settings: { x: Math.round(700 / TILE_SIZE), y: Math.round(997 / TILE_SIZE), name: "The Blacksmith's Forge", resident: 'rowan', chapterTitle: "Chapter 8: The Blacksmith's Forge" },
};

// Interactive Building Hitboxes for Click & Proximity Navigation

export const VILLAGE_HEROES = [
  { id: 'celine', name: 'Celine', folder: 'Celine', title: 'The Botanist', color: '#10b981' },
  { id: 'adeline', name: 'Adeline', folder: 'Adeline', title: 'Town Leader', color: '#8b5cf6' },
  { id: 'balor', name: 'Balor', folder: 'Balor', title: 'The Merchant', color: '#f59e0b' },
  { id: 'march', name: 'March', folder: 'March', title: 'The Blacksmith', color: '#ef4444' },
  { id: 'hayden', name: 'Hayden', folder: 'Hayden', title: 'The Rancher', color: '#3b82f6' },
];

export const BUILDING_HITBOXES = [
  {
    id: 'todos',
    name: 'The Farmstead',
    label: 'Daily Quests',
    icon: '🌾',
    doorX: 14 * TILE_SIZE,
    doorY: 14 * TILE_SIZE,
    minX: 11 * TILE_SIZE,
    minY: 9 * TILE_SIZE,
    maxX: 17 * TILE_SIZE,
    maxY: 15 * TILE_SIZE,
    bannerX: 14 * TILE_SIZE,
    bannerY: 9 * TILE_SIZE - 6,
    rmDoorX: 1324,
    rmDoorY: 2133,
    rmMinX: 1256,
    rmMinY: 1920,
    rmMaxX: 1432,
    rmMaxY: 2145,
    rmBannerX: 1324,
    rmBannerY: 1910,
  },
  {
    id: 'debts',
    name: 'The Ledger Hut',
    label: 'Gold Ledger',
    icon: '🪙',
    doorX: 50 * TILE_SIZE,
    doorY: 14 * TILE_SIZE,
    minX: 47 * TILE_SIZE,
    minY: 9 * TILE_SIZE,
    maxX: 53 * TILE_SIZE,
    maxY: 15 * TILE_SIZE,
    bannerX: 50 * TILE_SIZE,
    bannerY: 9 * TILE_SIZE - 6,
    rmDoorX: 1220,
    rmDoorY: 1741,
    rmMinX: 1148,
    rmMinY: 1489,
    rmMaxX: 1388,
    rmMaxY: 1745,
    rmBannerX: 1220,
    rmBannerY: 1675,
  },
  {
    id: 'reminders',
    name: 'The Bell Tower',
    label: 'Belfry Alerts',
    icon: '🔔',
    doorX: 32 * TILE_SIZE,
    doorY: 14 * TILE_SIZE,
    minX: 30 * TILE_SIZE,
    minY: 7 * TILE_SIZE,
    maxX: 34 * TILE_SIZE,
    maxY: 14 * TILE_SIZE,
    bannerX: 32 * TILE_SIZE,
    bannerY: 7 * TILE_SIZE - 6,
    rmDoorX: 528,
    rmDoorY: 1280,
    rmMinX: 448,
    rmMinY: 1040,
    rmMaxX: 608,
    rmMaxY: 1290,
    rmBannerX: 528,
    rmBannerY: 1030,
  },
  {
    id: 'deadlines',
    name: 'The Notice Board',
    label: 'Town Deadlines',
    icon: '📋',
    doorX: 32 * TILE_SIZE,
    doorY: 24 * TILE_SIZE,
    minX: 30 * TILE_SIZE,
    minY: 20 * TILE_SIZE,
    maxX: 34 * TILE_SIZE,
    maxY: 24 * TILE_SIZE,
    bannerX: 32 * TILE_SIZE,
    bannerY: 20 * TILE_SIZE - 6,
    rmDoorX: 1352,
    rmDoorY: 1736,
    rmMinX: 1336,
    rmMinY: 1690,
    rmMaxX: 1370,
    rmMaxY: 1745,
    rmBannerX: 1352,
    rmBannerY: 1715,
  },
  {
    id: 'dates',
    name: 'The Town Mill',
    label: 'The Town Mill',
    icon: '🌸',
    doorX: 16 * TILE_SIZE,
    doorY: 51 * TILE_SIZE,
    minX: 12 * TILE_SIZE,
    minY: 44 * TILE_SIZE,
    maxX: 20 * TILE_SIZE,
    maxY: 52 * TILE_SIZE,
    bannerX: 16 * TILE_SIZE,
    bannerY: 44 * TILE_SIZE - 6,
    rmDoorX: 1504,
    rmDoorY: 1736,
    rmMinX: 1408,
    rmMinY: 1440,
    rmMaxX: 1600,
    rmMaxY: 1745,
    rmBannerX: 1504,
    rmBannerY: 1660,
  },
  {
    id: 'watchlist',
    name: 'The Moonlight Cinema',
    label: 'Moonlight Cinema',
    icon: '🎬',
    doorX: 48 * TILE_SIZE,
    doorY: 51 * TILE_SIZE,
    minX: 44 * TILE_SIZE,
    minY: 44 * TILE_SIZE,
    maxX: 52 * TILE_SIZE,
    maxY: 52 * TILE_SIZE,
    bannerX: 48 * TILE_SIZE,
    bannerY: 44 * TILE_SIZE - 6,
    rmDoorX: 928,
    rmDoorY: 1740,
    rmMinX: 812,
    rmMinY: 1472,
    rmMaxX: 1068,
    rmMaxY: 1745,
    rmBannerX: 928,
    rmBannerY: 1460,
  },
  {
    id: 'audit',
    name: 'The Archive Cellar',
    label: 'Archive Cellar',
    icon: '📜',
    doorX: 12 * TILE_SIZE,
    doorY: 33 * TILE_SIZE,
    minX: 9 * TILE_SIZE,
    minY: 28 * TILE_SIZE,
    maxX: 15 * TILE_SIZE,
    maxY: 34 * TILE_SIZE,
    bannerX: 12 * TILE_SIZE,
    bannerY: 28 * TILE_SIZE - 6,
    rmDoorX: 1096,
    rmDoorY: 485,
    rmMinX: 872,
    rmMinY: 80,
    rmMaxX: 1320,
    rmMaxY: 520,
    rmBannerX: 1096,
    rmBannerY: 70,
  },
  {
    id: 'settings',
    name: "The Blacksmith's Forge",
    label: 'The Forge',
    icon: '⚒️',
    doorX: 52 * TILE_SIZE,
    doorY: 33 * TILE_SIZE,
    minX: 50 * TILE_SIZE,
    minY: 30 * TILE_SIZE,
    maxX: 54 * TILE_SIZE,
    maxY: 34 * TILE_SIZE,
    bannerX: 52 * TILE_SIZE,
    bannerY: 30 * TILE_SIZE - 6,
    rmDoorX: 712,
    rmDoorY: 997,
    rmMinX: 504,
    rmMinY: 768,
    rmMaxX: 832,
    rmMaxY: 1016,
    rmBannerX: 712,
    rmBannerY: 755,
  },
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

export function getHitBuilding(wx, wy, preferRmTown = false) {
  if (preferRmTown || wx > 1024 || wy > 1024) {
    for (const b of BUILDING_HITBOXES) {
      if (b.rmMinX !== undefined && wx >= b.rmMinX && wx <= b.rmMaxX && wy >= b.rmMinY && wy <= b.rmMaxY) {
        return b;
      }
    }
  }
  for (const b of BUILDING_HITBOXES) {
    if (wx >= b.minX && wx <= b.maxX && wy >= b.minY && wy <= b.maxY) {
      return b;
    }
    if (b.rmMinX !== undefined && wx >= b.rmMinX && wx <= b.rmMaxX && wy >= b.rmMinY && wy <= b.rmMaxY) {
      return b;
    }
  }
  return null;
}

export function isWalkable(wx, wy) {
  // Out of world boundaries
  if (wx < 0 || wy < 0 || wx >= MAP_WIDTH_PX || wy >= MAP_HEIGHT_PX) {
    return false;
  }
  return isPointWalkable(wx, wy);
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

export function getNearbyBuilding(pipX, pipY, threshold = 40, preferRmTown = false) {
  let closest = null;
  let minDist = threshold;

  // In rm_town mode or if pip is in rm_town coordinates, only check authentic rm_town doors
  if (preferRmTown || pipX > 1024 || pipY > 1024) {
    for (const b of BUILDING_HITBOXES) {
      if (b.rmDoorX !== undefined && b.rmDoorY !== undefined) {
        const distRm = Math.hypot(pipX - b.rmDoorX, pipY - b.rmDoorY);
        if (distRm < minDist) {
          minDist = distRm;
          closest = b;
        }
      }
    }
    return closest;
  }

  // Fallback / legacy mode (for unit test compatibility)
  for (const b of BUILDING_HITBOXES) {
    const distLegacy = Math.hypot(pipX - b.doorX, pipY - b.doorY);
    if (distLegacy < minDist) {
      minDist = distLegacy;
      closest = b;
    }
    if (b.rmDoorX !== undefined && b.rmDoorY !== undefined) {
      const distRm = Math.hypot(pipX - b.rmDoorX, pipY - b.rmDoorY);
      if (distRm < minDist) {
        minDist = distRm;
        closest = b;
      }
    }
  }
  return closest;
}

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
  const [activeHeroId, setActiveHeroId] = useState('celine');
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
    camera: { x: 1088, y: 1780 }, // Spawn at Town Center Plaza
    targetCamera: { x: 1088, y: 1780 },
    pip: { x: 1088, y: 1780, dir: 0, frame: 0, walking: false },
    characterId: 'celine', // Spawn at Town Square
    clickTarget: null, // { x, y, buildingId }
    hoverBuilding: null,
    nearbyBuilding: null,
    bram: { frame: 0, talking: false },
    animFrame: 0,
    waterFrame: 0,
    scaleFactor: 2.5,
    scaleTilt: 0,
    activeDebtsCount: 2,
    bellSwing: 0,
    fountainFrame: 0,
    isOverworldMode: !activeTab || activeTab === 'map',
    collisionReady: false,
    showDebugCollision: false,
    fireflies: createInitialFireflies(),
    petals: createInitialPetals(),
    rain: createInitialRain(),
  });

  // 1. Load 16-bit sprite sheets (Purely from new asset collections)
  useEffect(() => {
    let mounted = true;
    const imagesToLoad = [
      // Split Authentic Fields of Mistria Town Map (2128x2928 px)
      { key: 'town_base', src: '/village_assets/rm_town_base.png' },
      { key: 'town_overhead', src: '/village_assets/rm_town_overhead.png' },
      { key: 'town_full', src: '/village_assets/rm_town_full.png' },
      { key: 'tileset', src: '/village_assets/environment/tilesets/generic/spr_main_exteriors_spring.png' },
      { key: 'notice_board', src: '/village_assets/architecture/market_stalls/Stillwell/spr_town_stall_plaza_challenge_board_main.png' },
    ];

    // Load authentic 8px Tiled collision grid
    loadCollisionGrid('/village_assets/rm_town_collision.json')
      .then((grid) => {
        if (!mounted) return;
        stateRef.current.collisionReady = true;
        if (grid) {
          let blocked = 0;
          for (let i = 0; i < grid.cells.length; i++) if (grid.cells[i] === 1) blocked++;
          const pct = ((blocked / grid.cells.length) * 100).toFixed(1);
          console.log(`[CollisionGrid] Loaded: ${grid.w}x${grid.h} (${grid.cells.length} cells), ${blocked} blocked (~${pct}%)`);
          BUILDING_HITBOXES.forEach((b) => {
            const bx = b.rmDoorX || b.doorX;
            const by = b.rmDoorY || b.doorY;
            const free = isPointWalkable(bx, by);
            console.log(`[CollisionGrid] Door "${b.name}" at (${bx}, ${by}): ${free ? 'FREE' : 'BLOCKED'}`);
          });
        }
      })
      .catch((err) => console.error('[CollisionGrid] Failed to load:', err));

    // Load authentic directional walking and idle sprites for all 5 Mistria villagers
    VILLAGE_HEROES.forEach((hero) => {
      const base = `/village_assets/villagers/${hero.folder}/Sprites/Spring/spr_npc_${hero.id}_spring_`;
      imagesToLoad.push(
        { key: `${hero.id}_walk_south`, src: `${base}walk_south.png` },
        { key: `${hero.id}_walk_north`, src: `${base}walk_north.png` },
        { key: `${hero.id}_walk_east`, src: `${base}walk_east.png` },
        { key: `${hero.id}_idle_south`, src: `${base}idle_south.png` },
        { key: `${hero.id}_idle_north`, src: `${base}idle_north.png` },
        { key: `${hero.id}_idle_east`, src: `${base}idle_east.png` }
      );
    });

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
      img.onerror = () => {
        if (!mounted) return;
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
      const bHitbox = BUILDING_HITBOXES.find((b) => b.id === activeTab);
      const targetDoorX = (bHitbox && bHitbox.rmDoorX !== undefined) ? bHitbox.rmDoorX : (anchor.x * TILE_SIZE);
      const targetDoorY = (bHitbox && bHitbox.rmDoorY !== undefined) ? bHitbox.rmDoorY : (anchor.y * TILE_SIZE);

      stateRef.current.targetCamera = { x: targetDoorX, y: targetDoorY };
      stateRef.current.camera = { x: targetDoorX, y: targetDoorY };

      // Teleport character directly to the destination doorstep
      stateRef.current.pip.x = targetDoorX - 8;
      stateRef.current.pip.y = targetDoorY - 20;
      stateRef.current.pip.walking = false;
      stateRef.current.pip.dir = 0;
      stateRef.current.clickTarget = null;
      activeKeysRef.current.clear();
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
      } else if (code === 'F2') {
        e.preventDefault();
        stateRef.current.showDebugCollision = !stateRef.current.showDebugCollision;
      } else if (code === 'KeyC') {
        // Cycle playable character among authentic Mistria villagers
        e.preventDefault();
        const curId = stateRef.current.characterId || 'celine';
        const curIdx = VILLAGE_HEROES.findIndex(h => h.id === curId);
        const nextHero = VILLAGE_HEROES[(curIdx + 1) % VILLAGE_HEROES.length];
        stateRef.current.characterId = nextHero.id;
        setActiveHeroId(nextHero.id);
        soundManager.playSfx('wood');
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

    const hit = getHitBuilding(worldX, worldY, true);
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

    const hit = getHitBuilding(worldX, worldY, true);

    if (hit) {
      soundManager.playSfx('wood');
      // If already at the door, navigate immediately
      const pip = stateRef.current.pip;
      const targetDoorX = hit.rmDoorX || hit.doorX;
      const targetDoorY = hit.rmDoorY || hit.doorY;
      const dist = Math.hypot(pip.x - targetDoorX, pip.y - targetDoorY);
      if (dist < 32 && onNavigateToChapter) {
        onNavigateToChapter(hit.id, { panelOnly: false });
      } else {
        // Set auto-walk target to the door of this building
        stateRef.current.clickTarget = { x: targetDoorX, y: targetDoorY, buildingId: hit.id };
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
      const scale = isFullMap ? 1 : (isMobile ? 2.2 : 2.5);
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

        // Collision test using feet box (10x6 px centred on feet: x + 8, y + 28)
        if (isFeetWalkable(nextX + 8, nextY + 28, 5, 3)) {
          pip.x = nextX;
          pip.y = nextY;
        } else {
          // Slide along X or Y axis if partial direction is walkable
          if (isFeetWalkable(nextX + 8, pip.y + 28, 5, 3)) {
            pip.x = nextX;
          } else if (isFeetWalkable(pip.x + 8, nextY + 28, 5, 3)) {
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
          const stepX = (dx / dist) * Math.min(dist, walkSpeed);
          const stepY = (dy / dist) * Math.min(dist, walkSpeed);
          if (isFeetWalkable(pip.x + stepX + 8, pip.y + stepY + 28, 5, 3)) {
            pip.x += stepX;
            pip.y += stepY;
          } else if (isFeetWalkable(pip.x + stepX + 8, pip.y + 28, 5, 3)) {
            pip.x += stepX;
          } else if (isFeetWalkable(pip.x + 8, pip.y + stepY + 28, 5, 3)) {
            pip.y += stepY;
          } else {
            pip.walking = false;
            state.clickTarget = null;
          }

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
      } else {
        pip.walking = false;
      }

      // ── Update Proximity Detection ──
      const nearby = getNearbyBuilding(pip.x + 8, pip.y + 20, 36, true);
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
        const targetCamX = Math.max(viewW / 2, Math.min(MAP_WIDTH_PX - viewW / 2, pip.x + 8));
        const targetCamY = Math.max(viewH / 2, Math.min(MAP_HEIGHT_PX - viewH / 2, pip.y + 16));
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

      // ── Layer 1: Ground & Base Tiles (Under the Player) ──
      const townBase = state.images.town_base;
      if (townBase && townBase.complete && townBase.naturalWidth > 0) {
        ctx.drawImage(townBase, 0, 0, MAP_WIDTH_PX, MAP_HEIGHT_PX);
      } else {
        const townFull = state.images.town_full;
        if (townFull && townFull.complete && townFull.naturalWidth > 0) {
          ctx.drawImage(townFull, 0, 0, MAP_WIDTH_PX, MAP_HEIGHT_PX);
        } else {
          ctx.fillStyle = '#8dc653';
          ctx.fillRect(0, 0, MAP_WIDTH_PX, MAP_HEIGHT_PX);
        }
      }

      // ── Layer 3: Depth-Sorted Entities (Dynamic Overlays & Characters) ──
      const renderables = [];

      // 1. Town Notice Board at Plaza (Chapter 4 Anchor)
      renderables.push({
        y: 1736,
        render: () => {
          const nbImg = state.images.notice_board;
          if (nbImg) {
            ctx.drawImage(nbImg, 1342, 1700, 24, 36);
          }
          const flutter = Math.sin(state.animFrame * 0.2) * 1;
          ctx.save();
          ctx.fillStyle = '#fef08a';
          ctx.fillRect(1350, 1712 + flutter, 6, 8);
          ctx.fillStyle = '#b45309';
          ctx.fillRect(1351, 1714 + flutter, 4, 1);
          ctx.fillRect(1351, 1716 + flutter, 3, 1);
          ctx.restore();
        },
      });

      // 2. Click Target Indicator Ring
      if (state.clickTarget) {
        renderables.push({
          y: state.clickTarget.y,
          render: () => {
            const pulse = (Math.sin(state.animFrame * 0.25) + 1) * 0.5;
            ctx.save();
            ctx.strokeStyle = `rgba(253, 224, 71, ${(0.5 + pulse * 0.5).toFixed(2)})`;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(state.clickTarget.x, state.clickTarget.y, 6 + pulse * 3, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
          },
        });
      }

      // ── 13. Authentic Village Character (Celine / Mistria Villagers) ──
      renderables.push({
        y: pip.y + 20, // foot Y for depth sorting
        render: () => {
          const px = Math.floor(pip.x);
          const py = Math.floor(pip.y);
          const charId = state.characterId || 'celine';
          const hero = VILLAGE_HEROES.find(h => h.id === charId) || VILLAGE_HEROES[0];

          // Soft ground drop shadow under feet
          ctx.save();
          ctx.fillStyle = 'rgba(20, 25, 20, 0.35)';
          ctx.beginPath();
          ctx.ellipse(px + 8, py + 18, 9, 4, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          // Select animation sheet based on movement and direction
          let action = 'idle';
          let dirKey = 'south';
          let isFlipped = false;
          let frameIndex = 0;

          if (pip.walking) {
            action = 'walk';
            frameIndex = Math.floor(state.animFrame * 0.16) % 4;
            if (pip.dir === 0) dirKey = 'south';
            else if (pip.dir === 3) dirKey = 'north';
            else if (pip.dir === 2) { dirKey = 'east'; isFlipped = false; }
            else if (pip.dir === 1) { dirKey = 'east'; isFlipped = true; }
          } else {
            action = 'idle';
            if (pip.dir === 0) dirKey = 'south';
            else if (pip.dir === 3) dirKey = 'north';
            else if (pip.dir === 2) { dirKey = 'east'; isFlipped = false; }
            else if (pip.dir === 1) { dirKey = 'east'; isFlipped = true; }
          }

          const spriteKey = `${charId}_${action}_${dirKey}`;
          const charImg = state.images[spriteKey];

          if (charImg && charImg.complete && charImg.naturalWidth > 0) {
            ctx.save();
            // Authentic 80x80 frame, feet at vertical offset ~54
            const drawX = px + 8;
            const drawY = py + 20 - 54;

            ctx.translate(drawX, drawY);
            if (isFlipped) {
              ctx.scale(-1, 1);
            }
            ctx.drawImage(
              charImg,
              frameIndex * 80, 0, 80, 80,
              -40, 0, 80, 80
            );
            ctx.restore();
          }

          // Character Name Tag: e.g. "Celine (You)"
          ctx.save();
          ctx.font = 'bold 7px monospace';
          const nameText = `${hero.name} (You)`;
          const tW = ctx.measureText(nameText).width;
          ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
          ctx.fillRect(px + 8 - tW / 2 - 3, py - 18, tW + 6, 9);
          ctx.strokeStyle = hero.color || '#22c55e';
          ctx.lineWidth = 1;
          ctx.strokeRect(px + 8 - tW / 2 - 3, py - 18, tW + 6, 9);
          ctx.fillStyle = '#fef08a';
          ctx.fillText(nameText, px + 8 - tW / 2, py - 11);
          ctx.restore();
        },
      });

      // Sort all renderables by foot Y for depth sorting
      renderables.sort((a, b) => a.y - b.y);
      renderables.forEach((item) => item.render());

      // ── Layer 3: Overhead Tiles (Tree Canopies, Bridge Top, Manor Top) ──
      const townOverhead = state.images.town_overhead;
      if (townOverhead && townOverhead.complete && townOverhead.naturalWidth > 0) {
        ctx.drawImage(townOverhead, 0, 0, MAP_WIDTH_PX, MAP_HEIGHT_PX);
      }

      // ── Layer 4a: Ambient Lantern Radial Halos & Flame Flicker ──
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const allLanternLights = [
        { x: 1040, y: 1680, radius: 36 },
        { x: 1140, y: 1680, radius: 36 },
        { x: 900, y: 1680, radius: 36 },
        { x: 1230, y: 1680, radius: 36 },
        { x: 1040, y: 1150, radius: 36 },
        { x: 1150, y: 1150, radius: 36 },
        { x: 448, y: 1290, radius: 36 },
        { x: 1400, y: 1290, radius: 36 },
        { x: 1260, y: 2135, radius: 32 },
        { x: 1084, y: 485, radius: 36 },
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
        const bx = b.rmBannerX || b.bannerX;
        const by = b.rmBannerY || b.bannerY;

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

      // ── Layer 5: F2 Debug Collision Overlay (World Space 8px Grid & Feet Box) ──
      if (state.showDebugCollision) {
        const grid = getGrid();
        if (grid) {
          ctx.save();
          const tMinX = Math.max(0, Math.floor(camMinX / 8));
          const tMaxX = Math.min(grid.w - 1, Math.ceil(camMaxX / 8));
          const tMinY = Math.max(0, Math.floor(camMinY / 8));
          const tMaxY = Math.min(grid.h - 1, Math.ceil(camMaxY / 8));

          // Draw blocked 8px cells as translucent red
          ctx.fillStyle = 'rgba(239, 68, 68, 0.45)';
          for (let ty = tMinY; ty <= tMaxY; ty++) {
            for (let tx = tMinX; tx <= tMaxX; tx++) {
              if (grid.cells[ty * grid.w + tx] === 1) {
                ctx.fillRect(tx * 8, ty * 8, 8, 8);
              }
            }
          }

          // Draw Pip feet collision box
          const fx = Math.floor(pip.x + 8);
          const fy = Math.floor(pip.y + 28);
          ctx.strokeStyle = '#22c55e';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(fx - 5, fy - 3, 10, 6);

          // Text HUD above Pip feet showing tile coordinates & collision status
          const curTx = Math.floor(fx / 8);
          const curTy = Math.floor(fy / 8);
          const curBlocked = (curTx >= 0 && curTy >= 0 && curTx < grid.w && curTy < grid.h) ? (grid.cells[curTy * grid.w + curTx] === 1) : true;
          const statusText = `Cell (${curTx},${curTy}) ${curBlocked ? 'BLOCKED' : 'FREE'}`;
          ctx.font = 'bold 8px monospace';
          const stW = ctx.measureText(statusText).width;
          ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
          ctx.fillRect(fx - stW / 2 - 4, fy - 20, stW + 8, 12);
          ctx.strokeStyle = curBlocked ? '#ef4444' : '#22c55e';
          ctx.strokeRect(fx - stW / 2 - 4, fy - 20, stW + 8, 12);
          ctx.fillStyle = curBlocked ? '#fca5a5' : '#86efac';
          ctx.fillText(statusText, fx - stW / 2, fy - 11);
          ctx.restore();
        }
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

      {/* Hero Switcher Button */}
      <button
        onClick={() => {
          const curId = activeHeroId || 'celine';
          const curIdx = VILLAGE_HEROES.findIndex(h => h.id === curId);
          const nextHero = VILLAGE_HEROES[(curIdx + 1) % VILLAGE_HEROES.length];
          stateRef.current.characterId = nextHero.id;
          setActiveHeroId(nextHero.id);
          soundManager.playSfx('wood');
        }}
        title="Click or press [C] to cycle player character"
        style={{
          position: 'absolute',
          bottom: 12,
          right: 12,
          zIndex: 40,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '4px 10px',
          background: 'rgba(28, 17, 10, 0.90)',
          border: `1.5px solid ${VILLAGE_HEROES.find(h => h.id === activeHeroId)?.color || '#10b981'}`,
          borderRadius: 6,
          color: '#fdf6e2',
          fontFamily: 'monospace',
          fontSize: '10px',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
        }}
      >
        <span>Hero:</span>
        <strong style={{ color: VILLAGE_HEROES.find(h => h.id === activeHeroId)?.color || '#10b981' }}>
          {VILLAGE_HEROES.find(h => h.id === activeHeroId)?.name || 'Celine'}
        </strong>
        <span style={{ fontSize: '8px', opacity: 0.7 }}>[C]</span>
      </button>
    </div>
  );
}