import React, { useRef, useEffect, useState, useCallback } from 'react';
import { soundManager } from '@/lib/soundManager';
import { eventBus, EVENTS } from '@/lib/eventBus';

// 16-bit RPG Tile Size
const TILE_SIZE = 16;
const MAP_WIDTH_TILES = 64;
const MAP_HEIGHT_TILES = 64;

// Chapter zone anchors in world tile coordinates
export const CHAPTER_ANCHORS = {
  todos: { x: 14, y: 14, name: 'The Farmstead', resident: 'pip', chapterTitle: 'Chapter 1: The Farmstead' },
  debts: { x: 50, y: 14, name: 'The Ledger Hut', resident: 'bram', chapterTitle: 'Chapter 2: The Ledger Hut' },
  reminders: { x: 32, y: 14, name: 'The Bell Tower', resident: 'hoot', chapterTitle: 'Chapter 3: The Bell Tower' },
  deadlines: { x: 32, y: 36, name: 'The Notice Board', resident: 'marigold', chapterTitle: 'Chapter 4: The Notice Board' },
  dates: { x: 16, y: 51, name: 'The Festival Grounds', resident: 'clover', chapterTitle: 'Chapter 5: The Festival Grounds' },
  watchlist: { x: 48, y: 51, name: 'The Moonlight Cinema', resident: 'juniper', chapterTitle: 'Chapter 6: The Moonlight Cinema' },
  audit: { x: 12, y: 33, name: 'The Archive Cellar', resident: 'moss', chapterTitle: 'Chapter 7: The Archive Cellar' },
  settings: { x: 16, y: 23, name: 'The Toolshed Workbench', resident: 'rowan', chapterTitle: 'Chapter 8: The Toolshed' },
};

// Interactive Building Hitboxes for Click & Proximity Navigation
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
  },
  {
    id: 'deadlines',
    name: 'The Notice Board',
    label: 'Town Deadlines',
    icon: '📋',
    doorX: 32 * TILE_SIZE,
    doorY: 36 * TILE_SIZE,
    minX: 30 * TILE_SIZE,
    minY: 32 * TILE_SIZE,
    maxX: 34 * TILE_SIZE,
    maxY: 36 * TILE_SIZE,
    bannerX: 32 * TILE_SIZE,
    bannerY: 32 * TILE_SIZE - 6,
  },
  {
    id: 'dates',
    name: 'The Festival Grounds',
    label: 'Festival Grounds',
    icon: '🎪',
    doorX: 16 * TILE_SIZE,
    doorY: 51 * TILE_SIZE,
    minX: 12 * TILE_SIZE,
    minY: 44 * TILE_SIZE,
    maxX: 20 * TILE_SIZE,
    maxY: 52 * TILE_SIZE,
    bannerX: 16 * TILE_SIZE,
    bannerY: 44 * TILE_SIZE - 6,
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
  },
  {
    id: 'settings',
    name: 'The Toolshed Workbench',
    label: 'Toolshed Workshop',
    icon: '🛠️',
    doorX: 16 * TILE_SIZE,
    doorY: 23 * TILE_SIZE,
    minX: 14 * TILE_SIZE,
    minY: 20 * TILE_SIZE,
    maxX: 18 * TILE_SIZE,
    maxY: 24 * TILE_SIZE,
    bannerX: 16 * TILE_SIZE,
    bannerY: 20 * TILE_SIZE - 6,
  },
];


export function isVillageCobble(tx, ty) {
  // 1. Central Plaza surrounding Fountain & Notice Board: tx: 28..36, ty: 28..36
  if (tx >= 28 && tx <= 36 && ty >= 28 && ty <= 36) return true;
  // Grand entrance aprons extending 1 tile out
  if (tx >= 30 && tx <= 33 && (ty === 27 || ty === 37)) return true;
  if ((tx === 27 || tx === 37) && ty >= 31 && ty <= 33) return true;

  // 2. Ledger Bank courtyard & apron: tx: 48..52, ty: 13..15
  if (tx >= 48 && tx <= 52 && ty >= 13 && ty <= 15) return true;

  // 3. Bell Tower Platform: tx: 30..34, ty: 13..15
  if (tx >= 30 && tx <= 34 && ty >= 13 && ty <= 15) return true;

  // 4. Farmstead Porch Apron: tx: 13..15, ty: 13..15
  if (tx >= 13 && tx <= 15 && ty >= 13 && ty <= 15) return true;

  // 5. Archive Cellar Pad: tx: 11..13, ty: 32..34
  if (tx >= 11 && tx <= 13 && ty >= 32 && ty <= 34) return true;

  // 6. Toolshed Apron: tx: 15..17, ty: 22..24
  if (tx >= 15 && tx <= 17 && ty >= 22 && ty <= 24) return true;

  // 7. Notice Board Viewing Pad: tx: 31..33, ty: 34..36
  if (tx >= 31 && tx <= 33 && ty >= 34 && ty <= 36) return true;

  // 8. Festival Grounds Apron: tx: 15..17, ty: 50..52
  if (tx >= 15 && tx <= 17 && ty >= 50 && ty <= 52) return true;

  // 9. Moonlight Cinema Entrance Pad: tx: 47..49, ty: 50..52
  if (tx >= 47 && tx <= 49 && ty >= 50 && ty <= 52) return true;

  // 10. Wooden Footbridge / Stone Embankment across Pond: tx: 32, ty: 40..43
  if (tx === 32 && ty >= 40 && ty <= 43) return true;

  return false;
}

export function isVillagePath(tx, ty) {
  // If it's already a cobblestone plaza/platform, it's not a dirt path
  if (isVillageCobble(tx, ty)) return false;

  // 1. North Belfry Avenue: tx: 31..32, ty: 15..27 (connects Plaza to Bell Tower)
  if (tx >= 31 && tx <= 32 && ty >= 15 && ty <= 27) return true;
  if (tx >= 30 && tx <= 33 && ((ty >= 16 && ty <= 17) || (ty >= 24 && ty <= 25))) return true;

  // 2. West Archive Way: tx: 13..27, ty: 32..33 (connects Plaza to Archive Cellar)
  if (tx >= 13 && tx <= 27 && ty >= 32 && ty <= 33) return true;
  if (tx >= 15 && tx <= 18 && ty >= 33 && ty <= 34) return true;
  if (tx >= 21 && tx <= 24 && ty >= 31 && ty <= 32) return true;

  // 3. Northwest Farm Road (diagonal connecting Plaza to Farmstead & Toolshed):
  if (tx >= 26 && tx <= 28 && ty >= 27 && ty <= 28) return true;
  if (tx >= 25 && tx <= 27 && ty >= 25 && ty <= 27) return true;
  if (tx >= 23 && tx <= 25 && ty >= 23 && ty <= 25) return true;
  if (tx >= 21 && tx <= 23 && ty >= 21 && ty <= 23) return true;
  if (tx >= 19 && tx <= 21 && ty >= 20 && ty <= 21) return true; // covers (20, 20)
  if (tx >= 17 && tx <= 19 && ty >= 19 && ty <= 20) return true;
  if (tx >= 14 && tx <= 17 && ty >= 17 && ty <= 19) return true; // covers (14, 18)
  if (tx >= 13 && tx <= 15 && ty >= 15 && ty <= 17) return true; // leads to farm apron
  // Toolshed connection:
  if (tx >= 15 && tx <= 17 && ty >= 20 && ty <= 22) return true;

  // 4. Northeast Bank Boulevard (diagonal connecting Plaza to Bank & Sky Post):
  if (tx >= 36 && tx <= 38 && ty >= 27 && ty <= 28) return true;
  if (tx >= 37 && tx <= 39 && ty >= 25 && ty <= 27) return true;
  if (tx >= 39 && tx <= 41 && ty >= 23 && ty <= 25) return true;
  if (tx >= 41 && tx <= 43 && ty >= 21 && ty <= 23) return true;
  if (tx >= 41 && tx <= 43 && ty >= 20 && ty <= 21) return true; // covers (42, 20)
  if (tx >= 43 && tx <= 46 && ty >= 19 && ty <= 20) return true;
  if (tx >= 47 && tx <= 50 && ty >= 17 && ty <= 19) return true; // covers (50, 18)
  if (tx >= 48 && tx <= 51 && ty >= 15 && ty <= 17) return true; // leads to bank apron
  // Sky Post connection:
  if (tx >= 46 && tx <= 49 && ty >= 21 && ty <= 24) return true;

  // 5. Southwest Festival Avenue (diagonal connecting Plaza to Festival):
  if (tx >= 26 && tx <= 28 && ty >= 36 && ty <= 37) return true;
  if (tx >= 25 && tx <= 27 && ty >= 37 && ty <= 39) return true;
  if (tx >= 23 && tx <= 25 && ty >= 39 && ty <= 41) return true;
  if (tx >= 21 && tx <= 23 && ty >= 41 && ty <= 43) return true;
  if (tx >= 19 && tx <= 21 && ty >= 43 && ty <= 45) return true; // covers (20, 44)
  if (tx >= 17 && tx <= 19 && ty >= 45 && ty <= 47) return true;
  if (tx >= 15 && tx <= 17 && ty >= 47 && ty <= 50) return true; // covers (16, 48) and leads to festival apron

  // 6. Southeast Cinema Boulevard (diagonal connecting Plaza to Cinema):
  if (tx >= 36 && tx <= 38 && ty >= 36 && ty <= 37) return true;
  if (tx >= 37 && tx <= 39 && ty >= 37 && ty <= 39) return true;
  if (tx >= 39 && tx <= 41 && ty >= 39 && ty <= 41) return true;
  if (tx >= 41 && tx <= 43 && ty >= 41 && ty <= 43) return true;
  if (tx >= 41 && tx <= 43 && ty >= 43 && ty <= 45) return true; // covers (42, 44)
  if (tx >= 44 && tx <= 46 && ty >= 45 && ty <= 47) return true;
  if (tx >= 46 && tx <= 49 && ty >= 47 && ty <= 50) return true; // covers (48, 48) and leads to cinema apron

  // 7. South Avenue to Pond:
  if (tx >= 31 && tx <= 32 && ty >= 37 && ty <= 40) return true; // covers (31, 38)
  if (tx >= 31 && tx <= 32 && ty >= 43 && ty <= 46) return true;

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
    return { col: 3, row: 0 }; // Slate river stepping stone
  }
  if (pathDetail === 1) {
    return { col: 4, row: 1 }; // Embedded cobble paver
  }
  if (pathDetail === 2) {
    return { col: 1, row: 7 }; // Autumn leaf on earth
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
  const distPondX = Math.max(0, Math.max(30 - tx, tx - 34));
  const distPondY = Math.max(0, Math.max(40 - ty, ty - 43));
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

  // 3. Festival Grounds & Moonlight Cinema glades: wildflower blooms
  if ((tx >= 12 && tx <= 22 && ty >= 45 && ty <= 54) || (tx >= 42 && tx <= 54 && ty >= 45 && ty <= 54)) {
    const h = hash2D(tx, ty, 303);
    if (h % 5 === 0) return { col: 2, row: 0 }; // Scarlet poppies
    if (h % 5 === 1) return { col: 2, row: 7 }; // Yellow buttercups & purple clover
    if (h % 5 === 2) return { col: 1, row: 0 }; // White daisies & clover
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

  const BUILDING_RESERVES = [
    { minX: 11, maxX: 17, minY: 9, maxY: 17 }, // Farmstead + garden
    { minX: 47, maxX: 53, minY: 9, maxY: 17 }, // Bank
    { minX: 29, maxX: 35, minY: 7, maxY: 16 }, // Bell Tower
    { minX: 27, maxX: 37, minY: 27, maxY: 37 }, // Central Plaza & Notice Board
    { minX: 9, maxX: 15, minY: 27, maxY: 35 }, // Archive Cellar
    { minX: 14, maxX: 18, minY: 20, maxY: 24 }, // Toolshed
    { minX: 29, maxX: 35, minY: 39, maxY: 44 }, // Pond
    { minX: 46, maxX: 50, minY: 22, maxY: 26 }, // Sky Post
    { minX: 22, maxX: 27, minY: 13, maxY: 18 }, // Optional: The Whispering Pines Inn
    { minX: 39, maxX: 44, minY: 13, maxY: 19 }, // Optional: Lavender Artisan Cottage
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

  // 2. Internal woodland groves (scalloped irregular woodland edges extending into the village)
  const internalGroves = [
    { minX: 18, maxX: 27, minY: 7, maxY: 17 }, // North Copse 1 (between Farmstead & Bell Tower)
    { minX: 37, maxX: 46, minY: 7, maxY: 17 }, // North Copse 2 (between Bell Tower & Bank)
    { minX: 18, maxX: 26, minY: 18, maxY: 23 }, // East of Toolshed
    { minX: 38, maxX: 46, minY: 18, maxY: 24 }, // Northeast of Plaza
    { minX: 2, maxX: 10, minY: 18, maxY: 28 },  // West deep woods
    { minX: 2, maxX: 11, minY: 35, maxY: 44 },  // South of Archive
    { minX: 22, maxX: 28, minY: 37, maxY: 44 }, // West of Pond
    { minX: 36, maxX: 42, minY: 37, maxY: 44 }, // East of Pond
    { minX: 52, maxX: 60, minY: 18, maxY: 44 }, // East woodland margin
    { minX: 2, maxX: 12, minY: 45, maxY: 60 },  // West of Festival
    { minX: 52, maxX: 62, minY: 45, maxY: 60 }, // East of Cinema
    { minX: 22, maxX: 27, minY: 46, maxY: 56 }, // Between Festival & Pond
    { minX: 37, maxX: 42, minY: 46, maxY: 56 }, // Between Pond & Cinema
    { minX: 28, maxX: 36, minY: 48, maxY: 58 }, // South wilderness
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
  { x: 29, y: 40, type: 'rock' },
  { x: 35, y: 40, type: 'rock' },
  { x: 28, y: 43, type: 'rock' },
  { x: 36, y: 43, type: 'rock' },
  { x: 29, y: 44, type: 'rock' },
  { x: 35, y: 44, type: 'rock' },
  // River slate stepping stones
  { x: 30, y: 39, type: 'rock_slate' },
  { x: 34, y: 39, type: 'rock_slate' },
  { x: 30, y: 44, type: 'rock_slate' },
  { x: 34, y: 44, type: 'rock_slate' },
  // Ancient stone monuments & shrines
  { x: 36, y: 9, type: 'stone_monument' },  // Bell Tower meditative garden
  { x: 9, y: 30, type: 'stone_monument' },   // Archive Cellar ancient verge
  // Mossy boulders near Archive Cellar
  { x: 9, y: 31, type: 'rock' },
  { x: 15, y: 31, type: 'rock' },
  { x: 10, y: 35, type: 'rock' },
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
  { x: 53, y: 27, type: 'mushrooms' },
  { x: 23, y: 50, type: 'mushrooms' },
  { x: 41, y: 50, type: 'mushrooms' },
  { x: 30, y: 8, type: 'mushrooms' },
  { x: 34, y: 8, type: 'mushrooms' },
  // Decorative weathered tree stumps
  { x: 9, y: 34, type: 'stump' },  // Archive Cellar ancient grove
  { x: 18, y: 23, type: 'stump' }, // Toolshed chopping block
  { x: 24, y: 12, type: 'stump' }, // Forest path stump
  { x: 40, y: 12, type: 'stump' }, // Forest path stump
  { x: 46, y: 21, type: 'stump' }, // Sky Post forest path stump
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

  // 2. Woodland Pond (tx: 30..34, ty: 40..43) - footbridge at tx: 32 is walkable
  if (tx >= 30 && tx <= 34 && ty >= 40 && ty <= 43 && tx !== 32) {
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

  // 7. Chapter 4: The Notice Board posts (tx: 31..33, ty: 35)
  if (tx >= 31 && tx <= 33 && ty === 35) {
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

  // 11. Chapter 8: The Toolshed Workbench & Forge (tx: 15..17, ty: 21..22)
  if (tx >= 15 && tx <= 17 && ty >= 21 && ty <= 22) {
    return false;
  }

  // 12. Farmstead Garden Fences (farm gate at tx: 14..15 is open and walkable)
  if ((tx >= 10 && tx <= 13 && ty === 16) || (tx >= 16 && tx <= 17 && ty === 16)) {
    return false;
  }

  // 14. Optional: The Whispering Pines Inn walls (tx: 23..26, ty: 14..16)
  if (tx >= 23 && tx <= 26 && ty >= 14 && ty <= 16) {
    return false;
  }

  // 15. Optional: Lavender Artisan Cottage walls (tx: 39..42, ty: 14..17)
  if (tx >= 39 && tx <= 42 && ty >= 14 && ty <= 17) {
    return false;
  }

  // 16. Optional: Village Market Produce Stall counter (tx: 35..36, ty: 31)
  if ((tx === 35 || tx === 36) && ty === 31) {
    return false;
  }

  // 13. Internal woodland tree trunks (outer forest boundary wx < 6*16 || wx > 58*16 is already impassable)
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
      barrel_stack: null,
      citrus_tree: null,
      fence_wood: null,
      fence_post: null,
      lantern_wood_post: null,
      lantern_oil: null,
      bench_log: null,
      rock_slate: null,
      stone_monument: null,
      bridge_wood: null,
      stone_well: null,
      farm_cart: null,
      haystack: null,
      lilypad: null,
      lilypad_flower: null,
      cattails: null,
      water_caustics: null,
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
    fireflies: Array.from({ length: 24 }, (_, i) => {
      let bx = 32 * 16, by = 42 * 16;
      if (i < 8) {
        // Archive Cellar ancient grove (tx: 8..16, ty: 29..36)
        bx = (9 + (i % 4) * 2) * 16 + (Math.random() - 0.5) * 16;
        by = (30 + Math.floor(i / 4) * 3) * 16 + (Math.random() - 0.5) * 16;
      } else if (i < 16) {
        // Woodland Pond & Reeds (tx: 28..36, ty: 39..45)
        bx = (29 + (i % 4) * 2) * 16 + (Math.random() - 0.5) * 16;
        by = (40 + Math.floor((i - 8) / 4) * 2) * 16 + (Math.random() - 0.5) * 16;
      } else if (i < 20) {
        // Bell Tower grove (tx: 29..35, ty: 8..14)
        bx = (29 + (i - 16) * 2) * 16 + (Math.random() - 0.5) * 16;
        by = (9 + ((i - 16) % 2) * 3) * 16 + (Math.random() - 0.5) * 16;
      } else {
        // Cinema Forest (tx: 44..52, ty: 45..52)
        bx = (45 + (i - 20) * 2) * 16 + (Math.random() - 0.5) * 16;
        by = (46 + ((i - 20) % 2) * 3) * 16 + (Math.random() - 0.5) * 16;
      }
      return {
        x: bx,
        y: by,
        baseX: bx,
        baseY: by,
        phase: Math.random() * Math.PI * 2,
        pulsePhase: Math.random() * Math.PI * 2,
      };
    }),
    petals: Array.from({ length: 32 }, (_, i) => {
      const colors = ['#fbcfe8', '#f472b6', '#fda4af', '#f9a8d4', '#fef08a'];
      return {
        x: Math.random() * (64 * 16),
        y: Math.random() * (64 * 16),
        speedX: Math.random() * 0.5 + 0.5,
        speedY: Math.random() * 0.6 + 0.6,
        swayPhase: Math.random() * Math.PI * 2,
        angle: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.06,
        color: colors[i % colors.length],
        rx: Math.random() * 1.5 + 3.2,
        ry: Math.random() * 1 + 1.8,
        alpha: Math.random() * 0.25 + 0.65,
      };
    }),
  });

  // 1. Load 16-bit sprite sheets
  useEffect(() => {
    let mounted = true;
    const imagesToLoad = [
      { key: 'tileset', src: '/assets/tilesets/village_tileset.png' },
      { key: 'pip', src: '/assets/characters/pip_walk.png' },
      { key: 'bram', src: '/assets/characters/bram_factor.png' },
      { key: 'farmhouse', src: '/assets/buildings/farmhouse.png' },
      { key: 'notice_board', src: '/assets/buildings/notice_board.png' },
      { key: 'bank', src: '/assets/buildings/bank.png' },
      { key: 'bell_tower', src: '/assets/buildings/bell_tower.png' },
      { key: 'festival_grounds', src: '/assets/buildings/festival_grounds.png' },
      { key: 'moonlight_cinema', src: '/assets/buildings/moonlight_cinema.png' },
      { key: 'archive_cellar', src: '/assets/buildings/archive_cellar.png' },
      { key: 'tree_oak', src: '/assets/trees/oak_large.png' },
      { key: 'tree_pine', src: '/assets/trees/pine_large.png' },
      { key: 'tree_blossom', src: '/assets/trees/blossom_large.png' },
      { key: 'fallen_log', src: '/assets/trees/fallen_log.png' },
      { key: 'rock_moss', src: '/assets/trees/rock_moss.png' },
      { key: 'mushrooms', src: '/assets/trees/mushrooms.png' },
      { key: 'fountain_stone', src: '/assets/props/fountain_stone.png' },
      { key: 'lantern_post', src: '/assets/props/lantern_post.png' },
      { key: 'bench_wood', src: '/assets/props/bench_wood.png' },
      { key: 'bush_green', src: '/assets/trees/bush_green.png' },
      { key: 'bush_yellow', src: '/assets/trees/bush_yellow.png' },
      { key: 'bush_red', src: '/assets/trees/bush_red.png' },
      { key: 'bush_tiered', src: '/assets/trees/bush_tiered.png' },
      { key: 'bush_flowers', src: '/assets/trees/bush_flowers.png' },
      { key: 'tree_stump', src: '/assets/trees/tree_stump.png' },
      { key: 'flowers_poppy', src: '/assets/trees/flowers_poppy.png' },
      { key: 'flowers_daisy', src: '/assets/trees/flowers_daisy.png' },
      { key: 'flowers_sunflower', src: '/assets/trees/flowers_sunflower.png' },
      { key: 'inn_tavern', src: '/assets/buildings/inn_tavern.png' },
      { key: 'cottage_lavender', src: '/assets/buildings/cottage_lavender.png' },
      { key: 'market_stall', src: '/assets/props/market_stall.png' },
      { key: 'barrel_stack', src: '/assets/props/barrel_stack.png' },
      { key: 'citrus_tree', src: '/assets/props/citrus_tree.png' },
      { key: 'fence_wood', src: '/assets/props/fence_wood.png' },
      { key: 'fence_post', src: '/assets/props/fence_post.png' },
      { key: 'lantern_wood_post', src: '/assets/props/lantern_wood_post.png' },
      { key: 'lantern_oil', src: '/assets/props/lantern_oil.png' },
      { key: 'bench_log', src: '/assets/props/bench_log.png' },
      { key: 'rock_slate', src: '/assets/props/rock_slate.png' },
      { key: 'stone_monument', src: '/assets/props/stone_monument.png' },
      { key: 'bridge_wood', src: '/assets/props/bridge_wood.png' },
      { key: 'stone_well', src: '/assets/props/stone_well.png' },
      { key: 'farm_cart', src: '/assets/props/farm_cart.png' },
      { key: 'haystack', src: '/assets/props/haystack.png' },
      { key: 'lilypad', src: '/assets/props/lilypad.png' },
      { key: 'lilypad_flower', src: '/assets/props/lilypad_flower.png' },
      { key: 'cattails', src: '/assets/props/cattails.png' },
      { key: 'water_caustics', src: '/assets/props/water_caustics.png' },
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

          // Woodland Pond (tx: 30..34, ty: 40..43, excluding footbridge at tx: 32)
          const isPondWater = tx >= 30 && tx <= 34 && ty >= 40 && ty <= 43 && tx !== 32;
          if (isPondWater) {
            const causticsImg = state.images.water_caustics;
            if (causticsImg) {
              ctx.drawImage(causticsImg, (state.waterFrame % 4) * TILE_SIZE, 0, TILE_SIZE, TILE_SIZE, wx, wy, TILE_SIZE, TILE_SIZE);
            } else {
              ctx.drawImage(tileset, (state.waterFrame % 2) * TILE_SIZE, 1 * TILE_SIZE, TILE_SIZE, TILE_SIZE, wx, wy, TILE_SIZE, TILE_SIZE);
            }
            continue;
          }

          // Tilled soil plots in Farmstead zone (tx: 11..13, ty: 15..16)
          const isGarden = tx >= 11 && tx <= 13 && ty >= 15 && ty <= 16;
          if (isGarden) {
            ctx.drawImage(tileset, 7 * TILE_SIZE, 0 * TILE_SIZE, TILE_SIZE, TILE_SIZE, wx, wy, TILE_SIZE, TILE_SIZE);
            continue;
          }

          // Autotiled paths and cobblestone plazas
          const pathTile = getPathTileInfo(tx, ty);
          if (pathTile) {
            ctx.drawImage(tileset, pathTile.col * TILE_SIZE, pathTile.row * TILE_SIZE, TILE_SIZE, TILE_SIZE, wx, wy, TILE_SIZE, TILE_SIZE);
            continue;
          }

          // Procedural Rich Terrain Variety (Clustered Wildflowers, Clovers, Shaded Moss, Pebbles)
          const gTile = getGroundTile(tx, ty);
          ctx.drawImage(tileset, gTile.col * TILE_SIZE, gTile.row * TILE_SIZE, TILE_SIZE, TILE_SIZE, wx, wy, TILE_SIZE, TILE_SIZE);
        }
      }

      // ── Layer 1b: Dynamic Concentric Water Ripples ──
      const rippleCenters = [
        { x: 30.8 * TILE_SIZE, y: 41.3 * TILE_SIZE, phase: 0 },
        { x: 33.4 * TILE_SIZE, y: 42.1 * TILE_SIZE, phase: 0.3 },
        { x: 31.4 * TILE_SIZE, y: 42.8 * TILE_SIZE, phase: 0.6 },
        { x: 33.6 * TILE_SIZE, y: 40.7 * TILE_SIZE, phase: 0.85 },
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
      // 1. Upgraded Wooden Footbridge across Woodland Pond (tx: 31..33, ty: 40..43)
      const bridgeImg = state.images.bridge_wood;
      if (bridgeImg) {
        // 48x64 px wooden deck with side timber railings and stone abutments
        ctx.drawImage(bridgeImg, 31 * TILE_SIZE, 40 * TILE_SIZE, 3 * TILE_SIZE, 4 * TILE_SIZE);
      } else {
        // Fallback tileset railings
        for (let by = 40; by <= 43; by++) {
          ctx.drawImage(tileset, 2 * TILE_SIZE, 1 * TILE_SIZE, TILE_SIZE, TILE_SIZE, 31 * TILE_SIZE, by * TILE_SIZE, TILE_SIZE, TILE_SIZE);
          ctx.drawImage(tileset, 2 * TILE_SIZE, 1 * TILE_SIZE, TILE_SIZE, TILE_SIZE, 33 * TILE_SIZE, by * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
      }

      // 2. Upgraded Wooden Split-Rail Fences
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

        // Toolshed Workshop Yard Fence (tx: 14..15 and tx: 17..18, ty: 25)
        ctx.drawImage(fenceImg, 14 * TILE_SIZE, 25 * TILE_SIZE, 32, 16);
        ctx.drawImage(fenceImg, 17 * TILE_SIZE, 25 * TILE_SIZE, 32, 16);
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

      // ── 1. Chapter 1: The Farmstead (New Custom House) ──
      renderables.push({
        y: 14 * TILE_SIZE + 2,
        render: () => {
          const houseImg = state.images.farmhouse;
          const hW = 76;
          const hH = 79;
          const hX = 14 * TILE_SIZE - hW / 2; // 186px
          const hY = 14 * TILE_SIZE - hH + 4; // 149px
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

          // Farmhouse Garden Crops (Bound to Todos: Stage 2/3)
          const cropCol = 2; // Ripe parsnip
          ctx.drawImage(tileset, cropCol * TILE_SIZE, 4 * TILE_SIZE, TILE_SIZE, TILE_SIZE, 11 * TILE_SIZE, 15 * TILE_SIZE, TILE_SIZE, TILE_SIZE);
          ctx.drawImage(tileset, cropCol * TILE_SIZE, 4 * TILE_SIZE, TILE_SIZE, TILE_SIZE, 12 * TILE_SIZE, 15 * TILE_SIZE, TILE_SIZE, TILE_SIZE);
          ctx.drawImage(tileset, 3 * TILE_SIZE, 4 * TILE_SIZE, TILE_SIZE, TILE_SIZE, 13 * TILE_SIZE, 16 * TILE_SIZE, TILE_SIZE, TILE_SIZE);

          // Courier Bird Wren on mailbox post (x: 15, y: 14)
          ctx.drawImage(tileset, 7 * TILE_SIZE, 5 * TILE_SIZE, TILE_SIZE, TILE_SIZE, 15 * TILE_SIZE, 14 * TILE_SIZE, TILE_SIZE, TILE_SIZE);

          // Farmstead Stone Well with Roof & Bucket (tx: 10.5, ty: 12)
          const wellImg = state.images.stone_well;
          if (wellImg) {
            ctx.drawImage(wellImg, 10.5 * TILE_SIZE, 12 * TILE_SIZE - 4, 32, 36);
          }

          // Farmstead Wooden Cart (tx: 17, ty: 12.5)
          const cartImg = state.images.farm_cart;
          if (cartImg) {
            ctx.drawImage(cartImg, 17 * TILE_SIZE, 12.5 * TILE_SIZE, 36, 26);
          }

          // Farmstead Golden Haystack (tx: 10, ty: 15)
          const hayImg = state.images.haystack;
          if (hayImg) {
            ctx.drawImage(hayImg, 10 * TILE_SIZE - 2, 15 * TILE_SIZE - 6, 20, 22);
          }
        },
      });

      // ── 2. Chapter 2: The Ledger Hut / Bank (x: 50, y: 12) ──
      renderables.push({
        y: 14 * TILE_SIZE + 4,
        render: () => {
          const bankImg = state.images.bank;
          if (bankImg) {
            const bW = 86;
            const bH = 86;
            const bX = 50 * TILE_SIZE - bW / 2; // 800 - 43 = 757px
            const bY = 14 * TILE_SIZE + 4 - bH; // 224 + 4 - 86 = 142px
            ctx.drawImage(bankImg, bX, bY, bW, bH);
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

      // ── 3. Chapter 3: The Bell Tower (New Custom Bell Tower) ──
      renderables.push({
        y: 14 * TILE_SIZE,
        render: () => {
          const towerImg = state.images.bell_tower;
          if (towerImg) {
            const bW = 46;
            const bH = 98;
            const bX = 32 * TILE_SIZE - bW / 2; // 512 - 23 = 489px
            const bY = 14 * TILE_SIZE - bH + 2; // 224 - 98 + 2 = 128px
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

      // ── 4. Chapter 4: The Notice Board (New Custom Notice Board) ──
      renderables.push({
        y: 35 * TILE_SIZE + 6,
        render: () => {
          const boardImg = state.images.notice_board;
          const bW = 52;
          const bH = 46;
          const bX = 32 * TILE_SIZE - bW / 2; // 512 - 26 = 486px
          const bY = 35 * TILE_SIZE - bH + 6; // 560 - 46 + 6 = 520px
          if (boardImg) {
            ctx.drawImage(boardImg, bX, bY, bW, bH);
          } else {
            const nx = 31 * TILE_SIZE;
            const ny = 34 * TILE_SIZE;
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
          const fImg = state.images.fountain_stone;
          if (fImg) {
            ctx.drawImage(fImg, 31 * TILE_SIZE, 30 * TILE_SIZE, 32, 32);
          } else {
            ctx.drawImage(tileset, 5 * TILE_SIZE, 4 * TILE_SIZE, TILE_SIZE, TILE_SIZE, 32 * TILE_SIZE, 31 * TILE_SIZE, TILE_SIZE, TILE_SIZE);
          }
        },
      });

      // ── 6. Chapter 5: The Festival Grounds (New Custom Festival Grounds) ──
      renderables.push({
        y: 51 * TILE_SIZE + 6,
        render: () => {
          const festImg = state.images.festival_grounds;
          if (festImg) {
            const bW = 128;
            const bH = 94;
            const bX = 16 * TILE_SIZE - bW / 2; // 256 - 64 = 192px
            const bY = 52 * TILE_SIZE - bH + 4; // 832 - 94 + 4 = 742px
            ctx.drawImage(festImg, bX, bY, bW, bH);
          } else {
            const gx = 15 * TILE_SIZE;
            const gy = 48 * TILE_SIZE;
            ctx.drawImage(tileset, 7 * TILE_SIZE, 3 * TILE_SIZE, TILE_SIZE, TILE_SIZE, gx, gy, TILE_SIZE, TILE_SIZE);
            ctx.drawImage(tileset, 7 * TILE_SIZE, 3 * TILE_SIZE, TILE_SIZE, TILE_SIZE, gx + TILE_SIZE, gy, TILE_SIZE, TILE_SIZE);
          }
        },
      });

      // ── 7. Chapter 6: The Moonlight Cinema (New Custom Moonlight Cinema) ──
      renderables.push({
        y: 51 * TILE_SIZE + 6,
        render: () => {
          const cinemaImg = state.images.moonlight_cinema;
          if (cinemaImg) {
            const bW = 128;
            const bH = 93;
            const bX = 48 * TILE_SIZE - bW / 2; // 768 - 64 = 704px
            const bY = 52 * TILE_SIZE - bH + 4; // 832 - 93 + 4 = 743px
            ctx.drawImage(cinemaImg, bX, bY, bW, bH);
          } else {
            const mx = 46 * TILE_SIZE;
            const my = 48 * TILE_SIZE;
            ctx.drawImage(tileset, 4 * TILE_SIZE, 3 * TILE_SIZE, TILE_SIZE, TILE_SIZE, mx, my, TILE_SIZE, TILE_SIZE);
            ctx.drawImage(tileset, 4 * TILE_SIZE, 3 * TILE_SIZE, TILE_SIZE, TILE_SIZE, mx + TILE_SIZE, my, TILE_SIZE, TILE_SIZE);
          }
        },
      });

      // ── 8. Chapter 7: The Archive Cellar (New Custom Archive Cellar) ──
      renderables.push({
        y: 33 * TILE_SIZE + 4,
        render: () => {
          const cellarImg = state.images.archive_cellar;
          if (cellarImg) {
            const bW = 76;
            const bH = 90;
            const bX = 12 * TILE_SIZE - bW / 2; // 192 - 38 = 154px
            const bY = 34 * TILE_SIZE - bH - 4; // 544 - 90 - 4 = 450px
            ctx.drawImage(cellarImg, bX, bY, bW, bH);
          } else {
            const ax = 11 * TILE_SIZE;
            const ay = 30 * TILE_SIZE;
            ctx.drawImage(tileset, 5 * TILE_SIZE, 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE, ax, ay, TILE_SIZE, TILE_SIZE);
            ctx.drawImage(tileset, 5 * TILE_SIZE, 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE, ax + TILE_SIZE, ay, TILE_SIZE, TILE_SIZE);
          }
        },
      });

      // ── 9. Chapter 8: The Toolshed Workbench (tx: 16, ty: 22) ──
      renderables.push({
        y: 23 * TILE_SIZE,
        render: () => {
          const sx = 15 * TILE_SIZE;
          const sy = 21 * TILE_SIZE;
          // Pegboard tool rack & saw
          ctx.drawImage(tileset, 6 * TILE_SIZE, 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE, sx, sy, TILE_SIZE, TILE_SIZE);
          ctx.drawImage(tileset, 6 * TILE_SIZE, 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE, sx + TILE_SIZE, sy, TILE_SIZE, TILE_SIZE);
          // Heavy iron anvil on stump
          ctx.drawImage(tileset, 6 * TILE_SIZE, 3 * TILE_SIZE, TILE_SIZE, TILE_SIZE, sx + 2 * TILE_SIZE, sy + 1 * TILE_SIZE, TILE_SIZE, TILE_SIZE);
          // Split firewood pile & tool barrel
          ctx.drawImage(tileset, 5 * TILE_SIZE, 1 * TILE_SIZE, TILE_SIZE, TILE_SIZE, sx - 1 * TILE_SIZE, sy + 1 * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        },
      });

      // ── 10. Sky Post: Wren's Courier Station (tx: 48, ty: 24) ──
      renderables.push({
        y: 25 * TILE_SIZE,
        render: () => {
          const px = 48 * TILE_SIZE;
          const py = 24 * TILE_SIZE;
          // Perched bluebird Wren on wooden post
          ctx.drawImage(tileset, 7 * TILE_SIZE, 5 * TILE_SIZE, TILE_SIZE, TILE_SIZE, px, py, TILE_SIZE, TILE_SIZE);
          // Directional road signpost
          ctx.drawImage(tileset, 6 * TILE_SIZE, 5 * TILE_SIZE, TILE_SIZE, TILE_SIZE, px - TILE_SIZE, py, TILE_SIZE, TILE_SIZE);
          // Circular poppy flowerbed
          ctx.drawImage(tileset, 2 * TILE_SIZE, 0, TILE_SIZE, TILE_SIZE, px + TILE_SIZE, py, TILE_SIZE, TILE_SIZE);
        },
      });

      // ── Optional Building 1: The Whispering Pines Inn & Tavern (tx: 25, ty: 17) ──
      renderables.push({
        y: 17 * TILE_SIZE,
        render: () => {
          const innImg = state.images.inn_tavern;
          if (innImg) {
            const bW = 72;
            const bH = 70;
            const bX = 25 * TILE_SIZE - bW / 2;
            const bY = 17 * TILE_SIZE - bH + 2;
            ctx.drawImage(innImg, bX, bY, bW, bH);
          }
        },
      });

      // ── Optional Building 2: Lavender Artisan Cottage (tx: 41, ty: 18) ──
      renderables.push({
        y: 18 * TILE_SIZE,
        render: () => {
          const cotImg = state.images.cottage_lavender;
          if (cotImg) {
            const bW = 52;
            const bH = 88;
            const bX = 41 * TILE_SIZE - bW / 2;
            const bY = 18 * TILE_SIZE - bH + 2;
            ctx.drawImage(cotImg, bX, bY, bW, bH);
          }
        },
      });

      // ── Optional Building 3: Village Market Produce Stall (tx: 35..36, ty: 31) ──
      renderables.push({
        y: 32 * TILE_SIZE,
        render: () => {
          const mImg = state.images.market_stall;
          if (mImg) {
            ctx.drawImage(mImg, 35 * TILE_SIZE - 4, 30 * TILE_SIZE - 4, 42, 36);
          }
        },
      });

      // ── Floating Bobbing Lily Pads on Woodland Pond ──
      const lilyPads = [
        { x: 30.6 * TILE_SIZE, y: 41.2 * TILE_SIZE, type: 'plain', phase: 0 },
        { x: 33.3 * TILE_SIZE, y: 42.2 * TILE_SIZE, type: 'flower', phase: 1.8 },
        { x: 31.2 * TILE_SIZE, y: 42.7 * TILE_SIZE, type: 'plain', phase: 3.2 },
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
        { x: 29.5 * TILE_SIZE, y: 42.0 * TILE_SIZE },
        { x: 34.2 * TILE_SIZE, y: 40.2 * TILE_SIZE },
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

      // ── 11a. Central Plaza & Landmark Wooden Benches ──
      const plazaBenches = [
        // Central Plaza fountain benches
        { x: 30, y: 31 }, { x: 34, y: 31 },
        { x: 30, y: 33 }, { x: 34, y: 33 },
        // Bell Tower circular stone platform benches
        { x: 30, y: 11 }, { x: 34, y: 11 },
        // Notice Board resting bench
        { x: 34, y: 35 },
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

      // ── 11b. Rustic Woodland Log Benches ──
      const logBenches = [
        // Northern Forest Trail Rest
        { x: 24, y: 20 }, { x: 40, y: 20 },
      ];
      logBenches.forEach((lb) => {
        if (viewW < 1000 && (lb.x * TILE_SIZE < camMinX || lb.x * TILE_SIZE > camMaxX || lb.y * TILE_SIZE < camMinY || lb.y * TILE_SIZE > camMaxY)) return;
        renderables.push({
          y: (lb.y + 1) * TILE_SIZE,
          render: () => {
            const lbImg = state.images.bench_wood;
            if (lbImg) {
              ctx.drawImage(lbImg, lb.x * TILE_SIZE - 5, lb.y * TILE_SIZE, 26, 14);
            }
          },
        });
      });

      // ── 11c. Street Lanterns (Hanging Timber Bracket Posts & Oil Lanterns) ──
      const streetLanterns = [
        // Plaza Four Corners
        { x: 28, y: 28 }, { x: 36, y: 28 },
        { x: 28, y: 36 }, { x: 36, y: 36 },
        // Bell Tower Landmark Lanterns
        { x: 29, y: 13 }, { x: 35, y: 13 },
        // Ledger Hut Bank Lanterns
        { x: 47, y: 13 }, { x: 53, y: 13 },
        // Archive Cellar Secluded Lantern
        { x: 14, y: 33 },
        // Toolshed Workshop Lantern
        { x: 14, y: 23 },
        // Sky Post Courier Lantern
        { x: 50, y: 24 },
        // Wooden Footbridge North & South Abutment Lanterns
        { x: 30, y: 39 }, { x: 34, y: 44 },
        // Crossroads to Festival & Cinema
        { x: 20, y: 44 }, { x: 44, y: 44 },
      ];
      streetLanterns.forEach((lp) => {
        if (viewW < 1000 && (lp.x * TILE_SIZE < camMinX || lp.x * TILE_SIZE > camMaxX || lp.y * TILE_SIZE < camMinY || lp.y * TILE_SIZE > camMaxY)) return;
        renderables.push({
          y: (lp.y + 1) * TILE_SIZE,
          render: () => {
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
        { x: 33, y: 34 }, // Notice Board stone post
        { x: 17, y: 23 }, // Toolshed workbench edge
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

      // ── 11c. Location Flowerbeds & Plantings ──
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
        // Sky Post Garden
        { x: 47, y: 25, type: 'daisy' },
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

      // ── 11d. Flowering & Decorative Bushes ──
      const bushes = [
        // Plaza Margins
        { x: 29, y: 32, type: 'green' }, { x: 35, y: 32, type: 'yellow' },
        { x: 30, y: 35, type: 'red' }, { x: 34, y: 35, type: 'tiered' },
        // Bell Tower Garden Flanks
        { x: 28, y: 13, type: 'tiered' }, { x: 36, y: 13, type: 'tiered' },
        // Bank Courtyard Topiaries
        { x: 46, y: 14, type: 'green' }, { x: 54, y: 14, type: 'green' },
        // Woodland Trail & Shoreline Margins
        { x: 13, y: 23, type: 'green' }, { x: 47, y: 23, type: 'yellow' },
        { x: 27, y: 41, type: 'tiered' }, { x: 37, y: 41, type: 'green' },
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

      // ── 11e. Directional Road Signposts ──
      const signposts = [
        { x: 30, y: 27 }, // North Belfry Avenue exit
        { x: 30, y: 37 }, // South Pond exit
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
        const padY = 2;
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
        const nb = state.nearbyBuilding;
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
