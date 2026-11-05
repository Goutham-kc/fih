const fs = require('fs');
const path = require('path');

// Pull building and collision definitions directly matching the village specification
const MAP_WIDTH = 64;
const MAP_HEIGHT = 64;
const TILE_SIZE = 16;

function hash2D(x, y, seed = 12345) {
  let h = (x * 374761393 + y * 668265263 + seed) ^ 0x5bf03635;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return (h ^ (h >>> 16)) >>> 0;
}

const POND = { minX: 29, maxX: 35, minY: 41, maxY: 47 };

function isPondTile(tx, ty) {
  if (tx < POND.minX || tx > POND.maxX || ty < POND.minY || ty > POND.maxY) return false;
  if (tx === 32) return false; // Footbridge
  if ((tx === POND.minX || tx === POND.maxX) && (ty === POND.minY || ty === POND.maxY)) return false;
  return true;
}

function isPathTile(tx, ty) {
  if (ty >= 14 && ty <= 48 && (tx === 31 || tx === 32 || tx === 33)) return true;
  if (tx >= 14 && tx <= 50 && (ty === 16 || ty === 17)) return true;
  if (tx >= 22 && tx <= 42 && (ty === 24 || ty === 25)) return true;
  if (tx >= 27 && tx <= 37 && (ty === 30 || ty === 31 || ty === 32 || ty === 33 || ty === 34)) return true;
  if (tx >= 12 && tx <= 31 && (ty === 33 || ty === 34)) return true;
  if (tx >= 33 && tx <= 52 && (ty === 33 || ty === 34)) return true;
  if (tx >= 16 && tx <= 48 && (ty === 49 || ty === 50)) return true;
  if (tx >= 42 && tx <= 45 && (ty === 24 || ty === 25)) return true;
  if (tx >= 18 && tx <= 21 && (ty === 24 || ty === 25)) return true;
  return false;
}

function isSteppingStoneTile(tx, ty) {
  if (tx === 14 && ty >= 15 && ty <= 17) return true;
  if (tx === 32 && ty >= 15 && ty <= 17) return true;
  if (tx === 50 && ty >= 15 && ty <= 17) return true;
  if (tx === 32 && ty >= 22 && ty <= 24) return true;
  if (tx === 24 && ty >= 25 && ty <= 27) return true;
  if (tx === 40 && ty >= 25 && ty <= 27) return true;
  if (tx === 52 && (ty === 33 || ty === 34)) return true;
  if (tx === 12 && (ty === 33 || ty === 34)) return true;
  if (tx === 16 && (ty === 49 || ty === 50)) return true;
  if (tx === 48 && (ty === 49 || ty === 50)) return true;
  if (tx === 32 && ty >= 33 && ty <= 41 && ty % 2 === 0) return true;
  if (ty === 32 && (tx === 30 || tx === 31 || tx === 33 || tx === 34)) return true;
  return false;
}

function isGardenTile(tx, ty) {
  return tx >= 10 && tx <= 13 && ty >= 15 && ty <= 17;
}

function isSolidTile(tx, ty) {
  if (tx < 6 || tx > 58 || ty < 6 || ty > 58) return true;
  if (isPondTile(tx, ty)) return true;
  if (tx === 32 && ty === 31) return true; // Fountain
  if (tx >= 12 && tx <= 16 && ty >= 10 && ty <= 13) return true; // Farmstead
  if (tx >= 48 && tx <= 52 && ty >= 10 && ty <= 13) return true; // Bank
  if (tx >= 31 && tx <= 33 && ty >= 9 && ty <= 13) return true; // Bell Tower
  if (tx >= 31 && tx <= 33 && ty === 23) return true; // Notice Board
  if (tx >= 14 && tx <= 18 && ty >= 47 && ty <= 49) return true; // Festival
  if (tx >= 46 && tx <= 50 && ty >= 47 && ty <= 49) return true; // Cinema
  if (tx >= 10 && tx <= 14 && ty >= 29 && ty <= 32) return true; // Archive
  if (tx >= 50 && tx <= 54 && ty >= 29 && ty <= 32) return true; // Toolshed
  // Fence segments
  if ((tx >= 10 && tx <= 13 && ty === 16) || (tx >= 16 && tx <= 17 && ty === 16)) return true;
  return false;
}

// Tile GID calculation (1-based, 8 cols per row in village_tileset.png)
function toGid(col, row) {
  return 1 + row * 8 + col;
}

const groundData = [];
const pathsData = [];
const collisionData = [];

for (let ty = 0; ty < MAP_HEIGHT; ty++) {
  for (let tx = 0; tx < MAP_WIDTH; tx++) {
    // 1. Ground Layer
    if (isPondTile(tx, ty)) {
      groundData.push(toGid(6, 0)); // water tile
    } else {
      const h = hash2D(tx, ty);
      let gCol = 0, gRow = 0;
      if (h % 19 === 0) gCol = 1; // wildflower grass
      else if (h % 29 === 0) gCol = 2; // clover grass
      else if (h % 37 === 0) gCol = 3; // shaded grass
      groundData.push(toGid(gCol, gRow));
    }

    // 2. Paths Layer
    if (isGardenTile(tx, ty)) {
      pathsData.push(toGid(7, 0)); // furrow soil
    } else if (isSteppingStoneTile(tx, ty)) {
      pathsData.push(toGid(5, 1)); // stone slab paver
    } else if (isPathTile(tx, ty)) {
      const pDetail = hash2D(tx, ty, 888) % 10;
      if (pDetail === 0) {
        pathsData.push(toGid(4, 1)); // embedded cobblestone
      } else {
        pathsData.push(toGid(4, 0)); // smooth packed dirt
      }
    } else {
      pathsData.push(0); // empty
    }

    // 3. Collision Layer
    if (isSolidTile(tx, ty)) {
      collisionData.push(toGid(1, 1)); // solid collision block
    } else {
      collisionData.push(0);
    }
  }
}

// Building Objects
const buildingObjects = [
  {
    id: 1,
    name: 'todos',
    type: 'building',
    x: 14 * TILE_SIZE,
    y: 14 * TILE_SIZE,
    width: 76,
    height: 79,
    properties: [
      { name: 'buildingId', type: 'string', value: 'todos' },
      { name: 'name', type: 'string', value: 'The Farmstead' },
      { name: 'resident', type: 'string', value: 'pip' },
      { name: 'chapterTitle', type: 'string', value: 'Chapter 1: The Farmstead' },
      { name: 'doorX', type: 'int', value: 14 },
      { name: 'doorY', type: 'int', value: 14 },
      { name: 'bannerX', type: 'int', value: 14 * 16 },
      { name: 'bannerY', type: 'int', value: 14 * 16 - 84 }
    ]
  },
  {
    id: 2,
    name: 'debts',
    type: 'building',
    x: 50 * TILE_SIZE,
    y: 14 * TILE_SIZE,
    width: 86,
    height: 86,
    properties: [
      { name: 'buildingId', type: 'string', value: 'debts' },
      { name: 'name', type: 'string', value: 'The Ledger Hut' },
      { name: 'resident', type: 'string', value: 'bram' },
      { name: 'chapterTitle', type: 'string', value: 'Chapter 2: The Ledger Hut' },
      { name: 'doorX', type: 'int', value: 50 },
      { name: 'doorY', type: 'int', value: 14 },
      { name: 'bannerX', type: 'int', value: 50 * 16 },
      { name: 'bannerY', type: 'int', value: 14 * 16 - 88 }
    ]
  },
  {
    id: 3,
    name: 'reminders',
    type: 'building',
    x: 32 * TILE_SIZE,
    y: 14 * TILE_SIZE,
    width: 46,
    height: 98,
    properties: [
      { name: 'buildingId', type: 'string', value: 'reminders' },
      { name: 'name', type: 'string', value: 'The Bell Tower' },
      { name: 'resident', type: 'string', value: 'hoot' },
      { name: 'chapterTitle', type: 'string', value: 'Chapter 3: The Bell Tower' },
      { name: 'doorX', type: 'int', value: 32 },
      { name: 'doorY', type: 'int', value: 14 },
      { name: 'bannerX', type: 'int', value: 32 * 16 },
      { name: 'bannerY', type: 'int', value: 14 * 16 - 100 }
    ]
  },
  {
    id: 4,
    name: 'deadlines',
    type: 'building',
    x: 32 * TILE_SIZE,
    y: 24 * TILE_SIZE,
    width: 52,
    height: 46,
    properties: [
      { name: 'buildingId', type: 'string', value: 'deadlines' },
      { name: 'name', type: 'string', value: 'The Notice Board' },
      { name: 'resident', type: 'string', value: 'marigold' },
      { name: 'chapterTitle', type: 'string', value: 'Chapter 4: The Notice Board' },
      { name: 'doorX', type: 'int', value: 32 },
      { name: 'doorY', type: 'int', value: 24 },
      { name: 'bannerX', type: 'int', value: 32 * 16 },
      { name: 'bannerY', type: 'int', value: 24 * 16 - 48 }
    ]
  },
  {
    id: 5,
    name: 'dates',
    type: 'building',
    x: 16 * TILE_SIZE,
    y: 51 * TILE_SIZE,
    width: 128,
    height: 94,
    properties: [
      { name: 'buildingId', type: 'string', value: 'dates' },
      { name: 'name', type: 'string', value: 'The Festival Grounds' },
      { name: 'resident', type: 'string', value: 'clover' },
      { name: 'chapterTitle', type: 'string', value: 'Chapter 5: The Festival Grounds' },
      { name: 'doorX', type: 'int', value: 16 },
      { name: 'doorY', type: 'int', value: 51 },
      { name: 'bannerX', type: 'int', value: 16 * 16 },
      { name: 'bannerY', type: 'int', value: 51 * 16 - 96 }
    ]
  },
  {
    id: 6,
    name: 'watchlist',
    type: 'building',
    x: 48 * TILE_SIZE,
    y: 51 * TILE_SIZE,
    width: 128,
    height: 93,
    properties: [
      { name: 'buildingId', type: 'string', value: 'watchlist' },
      { name: 'name', type: 'string', value: 'The Moonlight Cinema' },
      { name: 'resident', type: 'string', value: 'juniper' },
      { name: 'chapterTitle', type: 'string', value: 'Chapter 6: The Moonlight Cinema' },
      { name: 'doorX', type: 'int', value: 48 },
      { name: 'doorY', type: 'int', value: 51 },
      { name: 'bannerX', type: 'int', value: 48 * 16 },
      { name: 'bannerY', type: 'int', value: 51 * 16 - 96 }
    ]
  },
  {
    id: 7,
    name: 'audit',
    type: 'building',
    x: 12 * TILE_SIZE,
    y: 33 * TILE_SIZE,
    width: 76,
    height: 90,
    properties: [
      { name: 'buildingId', type: 'string', value: 'audit' },
      { name: 'name', type: 'string', value: 'The Archive Cellar' },
      { name: 'resident', type: 'string', value: 'moss' },
      { name: 'chapterTitle', type: 'string', value: 'Chapter 7: The Archive Cellar' },
      { name: 'doorX', type: 'int', value: 12 },
      { name: 'doorY', type: 'int', value: 33 },
      { name: 'bannerX', type: 'int', value: 12 * 16 },
      { name: 'bannerY', type: 'int', value: 33 * 16 - 92 }
    ]
  },
  {
    id: 8,
    name: 'settings',
    type: 'building',
    x: 52 * TILE_SIZE,
    y: 33 * TILE_SIZE,
    width: 76,
    height: 90,
    properties: [
      { name: 'buildingId', type: 'string', value: 'settings' },
      { name: 'name', type: 'string', value: 'The Toolshed Workbench' },
      { name: 'resident', type: 'string', value: 'rowan' },
      { name: 'chapterTitle', type: 'string', value: 'Chapter 8: The Toolshed' },
      { name: 'doorX', type: 'int', value: 52 },
      { name: 'doorY', type: 'int', value: 33 },
      { name: 'bannerX', type: 'int', value: 52 * 16 },
      { name: 'bannerY', type: 'int', value: 33 * 16 - 92 }
    ]
  }
];

// Spawn Point
const spawnObjects = [
  {
    id: 99,
    name: 'player_spawn',
    type: 'spawn',
    x: 32 * TILE_SIZE,
    y: 33 * TILE_SIZE,
    width: 16,
    height: 16,
    properties: [
      { name: 'character', type: 'string', value: 'pip' }
    ]
  }
];

// Assembled Tiled 1.10 JSON Map
const tiledMap = {
  compressionlevel: -1,
  height: MAP_HEIGHT,
  width: MAP_WIDTH,
  infinite: false,
  orientation: 'orthogonal',
  renderorder: 'right-down',
  tiledversion: '1.10.2',
  tileheight: TILE_SIZE,
  tilewidth: TILE_SIZE,
  type: 'map',
  version: '1.10',
  tilesets: [
    {
      columns: 8,
      firstgid: 1,
      image: '/assets/tiles/village_tileset.png',
      imageheight: 128,
      imagewidth: 128,
      margin: 0,
      name: 'village_tileset',
      spacing: 0,
      tilecount: 64,
      tileheight: TILE_SIZE,
      tilewidth: TILE_SIZE
    }
  ],
  layers: [
    {
      data: groundData,
      height: MAP_HEIGHT,
      id: 1,
      name: 'Ground',
      opacity: 1,
      type: 'tilelayer',
      visible: true,
      width: MAP_WIDTH,
      x: 0,
      y: 0
    },
    {
      data: pathsData,
      height: MAP_HEIGHT,
      id: 2,
      name: 'Paths',
      opacity: 1,
      type: 'tilelayer',
      visible: true,
      width: MAP_WIDTH,
      x: 0,
      y: 0
    },
    {
      data: collisionData,
      height: MAP_HEIGHT,
      id: 3,
      name: 'Collision',
      opacity: 0, // invisible during gameplay, active in physics
      type: 'tilelayer',
      visible: false,
      width: MAP_WIDTH,
      x: 0,
      y: 0
    },
    {
      draworder: 'topdown',
      id: 4,
      name: 'Buildings',
      objects: buildingObjects,
      opacity: 1,
      type: 'objectgroup',
      visible: true,
      x: 0,
      y: 0
    },
    {
      draworder: 'topdown',
      id: 5,
      name: 'Spawns',
      objects: spawnObjects,
      opacity: 1,
      type: 'objectgroup',
      visible: true,
      x: 0,
      y: 0
    }
  ]
};

const outPath = path.join(__dirname, '..', 'public', 'assets', 'maps', 'village_map.json');
fs.writeFileSync(outPath, JSON.stringify(tiledMap, null, 2), 'utf-8');
console.log(`Successfully generated Tiled map JSON at: ${outPath} (${(fs.statSync(outPath).size / 1024).toFixed(1)} KB)`);
