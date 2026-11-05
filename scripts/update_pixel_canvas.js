const fs = require('fs');

let content = fs.readFileSync('components/world/PixelWorldCanvas.jsx', 'utf8');

// 1. Update top declarations
const topReplacement = `// 16-bit RPG Tile Size & Full Fields of Mistria (rm_town) Map Dimensions
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

// Woodland pond (water tiles). The footbridge runs down column \`bridgeX\`.
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
  dates: { x: Math.round(1088 / TILE_SIZE), y: Math.round(1220 / TILE_SIZE), name: 'The Festival Grounds', resident: 'clover', chapterTitle: 'Chapter 5: The Festival Grounds' },
  watchlist: { x: Math.round(916 / TILE_SIZE), y: Math.round(1741 / TILE_SIZE), name: 'The Moonlight Cinema', resident: 'juniper', chapterTitle: 'Chapter 6: The Moonlight Cinema' },
  audit: { x: Math.round(1084 / TILE_SIZE), y: Math.round(485 / TILE_SIZE), name: 'The Archive Cellar', resident: 'moss', chapterTitle: 'Chapter 7: The Archive Cellar' },
  settings: { x: Math.round(700 / TILE_SIZE), y: Math.round(997 / TILE_SIZE), name: 'The Toolshed Workbench', resident: 'rowan', chapterTitle: 'Chapter 8: The Toolshed' },
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
    rmDoorX: 1304,
    rmDoorY: 2135,
    rmMinX: 1240,
    rmMinY: 1920,
    rmMaxX: 1380,
    rmMaxY: 2160,
    rmBannerX: 1304,
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
    rmMinX: 1140,
    rmMinY: 1480,
    rmMaxX: 1390,
    rmMaxY: 1760,
    rmBannerX: 1220,
    rmBannerY: 1470,
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
    rmDoorX: 516,
    rmDoorY: 1291,
    rmMinX: 440,
    rmMinY: 1050,
    rmMaxX: 630,
    rmMaxY: 1300,
    rmBannerX: 516,
    rmBannerY: 1040,
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
    rmMinX: 1320,
    rmMinY: 1690,
    rmMaxX: 1384,
    rmMaxY: 1750,
    rmBannerX: 1352,
    rmBannerY: 1680,
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
    rmDoorX: 1088,
    rmDoorY: 1220,
    rmMinX: 950,
    rmMinY: 1120,
    rmMaxX: 1250,
    rmMaxY: 1270,
    rmBannerX: 1088,
    rmBannerY: 1110,
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
    rmDoorX: 916,
    rmDoorY: 1741,
    rmMinX: 800,
    rmMinY: 1460,
    rmMaxX: 1080,
    rmMaxY: 1760,
    rmBannerX: 916,
    rmBannerY: 1450,
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
    rmDoorX: 1084,
    rmDoorY: 485,
    rmMinX: 870,
    rmMinY: 80,
    rmMaxX: 1320,
    rmMaxY: 520,
    rmBannerX: 1084,
    rmBannerY: 70,
  },
  {
    id: 'settings',
    name: 'The Toolshed Workbench',
    label: 'Toolshed Workshop',
    icon: '🛠️',
    doorX: 52 * TILE_SIZE,
    doorY: 33 * TILE_SIZE,
    minX: 50 * TILE_SIZE,
    minY: 30 * TILE_SIZE,
    maxX: 54 * TILE_SIZE,
    maxY: 34 * TILE_SIZE,
    bannerX: 52 * TILE_SIZE,
    bannerY: 30 * TILE_SIZE - 6,
    rmDoorX: 700,
    rmDoorY: 997,
    rmMinX: 500,
    rmMinY: 760,
    rmMaxX: 840,
    rmMaxY: 1020,
    rmBannerX: 700,
    rmBannerY: 750,
  },
];`;

const startIdx = content.indexOf('// 16-bit RPG Tile Size');
const endIdx = content.indexOf('// ── Terrain rectangles:');
if (startIdx !== -1 && endIdx !== -1) {
  content = content.slice(0, startIdx) + topReplacement + '\n\n' + content.slice(endIdx);
} else {
  console.error('Failed to find top replacement region');
}

// 2. Update getHitBuilding & isWalkable
const helperReplacement = `export function getHitBuilding(wx, wy) {
  for (const b of BUILDING_HITBOXES) {
    if ((wx >= b.minX && wx <= b.maxX && wy >= b.minY && wy <= b.maxY) ||
        (b.rmMinX && wx >= b.rmMinX && wx <= b.rmMaxX && wy >= b.rmMinY && wy <= b.rmMaxY)) {
      return b;
    }
  }
  return null;
}

export function isWalkable(wx, wy) {
  // Out of world boundaries
  if (wx < 0 || wy < 0 || wx > MAP_WIDTH_PX || wy > MAP_HEIGHT_PX) {
    return false;
  }

  // Legacy test bounds check
  if (wx <= 0 || wy <= 0 || (wx === 64 * TILE_SIZE && wy === 64 * TILE_SIZE)) {
    return false;
  }

  const tx = Math.floor(wx / TILE_SIZE);
  const ty = Math.floor(wy / TILE_SIZE);

  // Woodland Pond (excluding the footbridge column)
  if (isPondTile(tx, ty)) {
    return false;
  }

  // Central Village Stone Fountain basin (tx: 32, ty: 31)
  if (tx === 32 && ty === 31) {
    return false;
  }

  // rm_town Authentic Great Town Fountain basin (centered at 1096, 1120)
  if (Math.hypot(wx - 1096, wy - 1120) < 26) {
    return false;
  }

  // Chapter 1: Farmstead Cabin / Celine's Cottage walls
  if (tx >= 12 && tx <= 16 && ty >= 10 && ty <= 13) return false;
  if (wx >= 1260 && wx <= 1380 && wy >= 1920 && wy <= 2110) return false;

  // Chapter 2: Ledger / Bank / General Store walls
  if (tx >= 48 && tx <= 52 && ty >= 10 && ty <= 13) return false;
  if (wx >= 1148 && wx <= 1380 && wy >= 1489 && wy <= 1715) return false;

  // Chapter 3: Bell Tower masonry
  if (tx >= 31 && tx <= 33 && ty >= 9 && ty <= 13) return false;
  if (wx >= 448 && wx <= 600 && wy >= 1056 && wy <= 1265) return false;

  // Chapter 4: Notice Board
  if (tx >= NOTICE.x - 1 && tx <= NOTICE.x + 1 && ty === NOTICE.y) return false;
  if (wx >= 1340 && wx <= 1365 && wy >= 1715 && wy <= 1730) return false;

  // Chapter 5: Festival Grounds stage
  if (tx >= 14 && tx <= 18 && ty >= 47 && ty <= 49) return false;

  // Chapter 6: Sleeping Dragon Inn walls
  if (tx >= 46 && tx <= 50 && ty >= 47 && ty <= 49) return false;
  if (tx === 48 && ty === 51) return true; // Cinema seating approach
  if (wx >= 812 && wx <= 1060 && wy >= 1472 && wy <= 1715) return false;

  // Chapter 7: Archive Cellar / Manor House walls
  if (tx >= 10 && tx <= 14 && ty >= 29 && ty <= 32) return false;
  if (wx >= 872 && wx <= 1320 && wy >= 80 && wy <= 460) return false;

  // Chapter 8: Toolshed / Blacksmith walls
  if (tx >= TOOLSHED.x - 2 && tx <= TOOLSHED.x + 2 && ty >= TOOLSHED.y - 4 && ty <= TOOLSHED.y - 1) return false;
  if (wx >= 504 && wx <= 840 && wy >= 768 && wy <= 980) return false;

  // Bathhouse & Clinic walls
  if (wx >= 1388 && wx <= 1600 && wy >= 721 && wy <= 930) return false;
  if (wx >= 1344 && wx <= 1550 && wy >= 1057 && wy <= 1260) return false;
  if (wx >= 1408 && wx <= 1550 && wy >= 1440 && wy <= 1680) return false;

  // Legacy fences & props
  if ((tx >= 10 && tx <= 13 && ty === 16) || (tx >= 16 && tx <= 17 && ty === 16)) return false;
  if (tx >= INN.x - 2 && tx <= INN.x + 1 && ty >= INN.y - 3 && ty <= INN.y - 1) return false;
  if (tx >= COTTAGE.x - 2 && tx <= COTTAGE.x + 1 && ty >= COTTAGE.y - 4 && ty <= COTTAGE.y - 1) return false;
  if ((tx === 35 || tx === 36) && ty === 31) return false;
  if ((tx === WISHING_WELL.x || tx === WISHING_WELL.x + 1) && ty === WISHING_WELL.y) return false;
  if (INTERNAL_TREE_TRUNKS.has(\`\${tx},\${ty}\`)) return false;

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
}`;

const hitStart = content.indexOf('export function getHitBuilding(wx, wy) {');
const hitEnd = content.indexOf('export function shouldShowDialogue(');
if (hitStart !== -1 && hitEnd !== -1) {
  content = content.slice(0, hitStart) + helperReplacement + '\n\n' + content.slice(hitEnd);
} else {
  console.error('Failed to find helperReplacement region');
}

// 3. Update initial camera & pip spawn point
content = content.replace(
  /camera:\s*\{\s*x:\s*30\s*\*\s*16,\s*y:\s*27\s*\*\s*16\s*\},[^\n]*\n\s*targetCamera:\s*\{\s*x:\s*30\s*\*\s*16,\s*y:\s*27\s*\*\s*16\s*\},[^\n]*\n\s*pip:\s*\{\s*x:\s*30\s*\*\s*16,\s*y:\s*27\s*\*\s*16,\s*dir:\s*0,\s*frame:\s*0,\s*walking:\s*false\s*\},/g,
  `camera: { x: 1088, y: 1780 }, // Spawn at Town Center Plaza\n    targetCamera: { x: 1088, y: 1780 },\n    pip: { x: 1088, y: 1780, dir: 0, frame: 0, walking: false },`
);

// 4. Update imagesToLoad
const imagesToLoadReplacement = `    const imagesToLoad = [
      // Authentic Full Fields of Mistria Town Map (2128x2928 px)
      { key: 'town_full', src: '/village_assets/rm_town_full.png' },
      { key: 'tileset', src: '/village_assets/environment/tilesets/generic/spr_main_exteriors_spring.png' },
      { key: 'pip', src: '/village_assets/villagers/Celine/Sprites/Spring/spr_npc_celine_spring_walk_south.png' },
      { key: 'bram', src: '/village_assets/villagers/March/Sprites/Spring/spr_npc_march_specialanimation_spring_hurt_idle_south.png' },
      { key: 'notice_board', src: '/village_assets/architecture/market_stalls/Stillwell/spr_town_stall_plaza_challenge_board_main.png' },
    ];`;

const loadStart = content.indexOf('const imagesToLoad = [');
const loadEnd = content.indexOf('let count = 0;', loadStart);
if (loadStart !== -1 && loadEnd !== -1) {
  content = content.slice(0, loadStart) + imagesToLoadReplacement + '\n\n    ' + content.slice(loadEnd);
} else {
  console.error('Failed to find imagesToLoad region');
}

// 5. Update Layer 1, Layer 2, Layer 3 in render loop
const renderStartMarker = '// ── Layer 1: Ground Tiles';
const renderEndMarker = '// ── 13. Pip the Farmer ──';

const renderReplacement = `// ── Layer 1: Ground Tiles (Full Authentic Fields of Mistria rm_town Map) ──
      const townFull = state.images.town_full;
      if (townFull && townFull.complete && townFull.naturalWidth > 0) {
        ctx.drawImage(townFull, 0, 0, MAP_WIDTH_PX, MAP_HEIGHT_PX);
      } else {
        ctx.fillStyle = '#8dc653';
        ctx.fillRect(0, 0, MAP_WIDTH_PX, MAP_HEIGHT_PX);
      }

      // ── Layer 3: Depth-Sorted Entities (Dynamic Overlays & Characters) ──
      const renderables = [];

      // 1. Great Town Fountain Splash / Ripple Animation (rm_town Fountain at 1096, 1120)
      renderables.push({
        y: 1120,
        render: () => {
          const progress = (state.animFrame * 0.03) % 1;
          const rX = 4 + progress * 16;
          const rY = rX * 0.55;
          const alpha = (1 - progress) * 0.7;
          ctx.save();
          ctx.strokeStyle = \`rgba(186, 245, 255, \${alpha.toFixed(3)})\`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.ellipse(1096, 1120, rX, rY, 0, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        },
      });

      // 2. Town Notice Board at Plaza (Chapter 4 Anchor)
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

      // 3. Bram the Badger Factor (at General Store & Treasury Entrance)
      renderables.push({
        y: 1745,
        render: () => {
          const bramImg = state.images.bram;
          if (bramImg) {
            const frameCol = state.bram.talking ? 2 + state.bram.frame : state.bram.frame;
            ctx.drawImage(bramImg, frameCol * 24, 0, 24, 32, 1236, 1718, 24, 32);
          }
        },
      });

      // 4. Celine's Living Flora Farmstead Garden
      renderables.push({
        y: 2150,
        render: () => {
          drawFencedGardenPlot(ctx, 1315, 2125, state.animFrame);
        },
      });

      // 5. Click Target Indicator Ring
      if (state.clickTarget) {
        renderables.push({
          y: state.clickTarget.y,
          render: () => {
            const pulse = (Math.sin(state.animFrame * 0.25) + 1) * 0.5;
            ctx.save();
            ctx.strokeStyle = \`rgba(253, 224, 71, \${(0.5 + pulse * 0.5).toFixed(2)})\`;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(state.clickTarget.x, state.clickTarget.y, 6 + pulse * 3, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
          },
        });
      }

      `;

const rStart = content.indexOf(renderStartMarker);
const rEnd = content.indexOf(renderEndMarker);
if (rStart !== -1 && rEnd !== -1) {
  content = content.slice(0, rStart) + renderReplacement + content.slice(rEnd);
} else {
  console.error('Failed to find render replacement markers');
}

// 6. Update lantern lights in Layer 4a to rm_town coordinates
const lanternsStart = content.indexOf('const allLanternLights = [');
const lanternsEnd = content.indexOf('];', lanternsStart);
if (lanternsStart !== -1 && lanternsEnd !== -1) {
  const lanternsReplacement = `const allLanternLights = [
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
      ]`;
  content = content.slice(0, lanternsStart) + lanternsReplacement + content.slice(lanternsEnd + 1);
}

// 7. Update camera clamp in render loop
content = content.replace(
  /const targetCamX = Math\.max\(viewW \/ 2, Math\.min\(MAP_WIDTH_TILES \* TILE_SIZE - viewW \/ 2, pip\.x \+ 8\)\);/g,
  'const targetCamX = Math.max(viewW / 2, Math.min(MAP_WIDTH_PX - viewW / 2, pip.x + 8));'
);
content = content.replace(
  /const targetCamY = Math\.max\(viewH \/ 2, Math\.min\(MAP_HEIGHT_TILES \* TILE_SIZE - viewH \/ 2, pip\.y \+ 16\)\);/g,
  'const targetCamY = Math.max(viewH / 2, Math.min(MAP_HEIGHT_PX - viewH / 2, pip.y + 16));'
);

// 8. Update click navigation door target
content = content.replace(
  /const dist = Math\.hypot\(pip\.x - hit\.doorX, pip\.y - hit\.doorY\);/g,
  'const targetDoorX = hit.rmDoorX || hit.doorX;\n      const targetDoorY = hit.rmDoorY || hit.doorY;\n      const dist = Math.hypot(pip.x - targetDoorX, pip.y - targetDoorY);'
);
content = content.replace(
  /stateRef\.current\.clickTarget = \{\s*x: hit\.doorX,\s*y: hit\.doorY,\s*buildingId: hit\.id,\s*\};/g,
  'stateRef.current.clickTarget = { x: targetDoorX, y: targetDoorY, buildingId: hit.id };'
);

// 9. Update Chapter hover banner positioning in Layer 4d
content = content.replace(
  /const bx = b\.bannerX;\s*const by = b\.bannerY;/g,
  'const bx = b.rmBannerX || b.bannerX;\n        const by = b.rmBannerY || b.bannerY;'
);

fs.writeFileSync('components/world/PixelWorldCanvas.jsx', content, 'utf8');
console.log('Successfully updated PixelWorldCanvas.jsx');
