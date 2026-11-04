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

  // 7. Notice Board Viewing Pad: tx: 31..33, ty: 35..37
  if (tx >= 31 && tx <= 33 && ty >= 35 && ty <= 37) return true;

  // 8. Festival Grounds Apron: tx: 15..17, ty: 50..52
  if (tx >= 15 && tx <= 17 && ty >= 50 && ty <= 52) return true;

  // 9. Moonlight Cinema Entrance Pad: tx: 47..49, ty: 50..52
  if (tx >= 47 && tx <= 49 && ty >= 50 && ty <= 52) return true;

  // 10. Wooden Footbridge / Stone Embankment across Pond: tx: 32, ty: 40..43
  if (tx === 32 && ty >= 40 && ty <= 43) return true;

  return false;
}

export function isVillagePath(tx, ty) {
  // 1. North Belfry Avenue: tx: 31..32, ty: 14..28
  if (tx >= 31 && tx <= 32 && ty >= 14 && ty <= 28) return true;

  // 2. West Archive Way: tx: 12..28, ty: 32..33
  if (tx >= 12 && tx <= 28 && ty >= 32 && ty <= 33) return true;

  // 3. South Avenue to Woodland Pond & Bridge: tx: 31..32, ty: 36..40
  if (tx >= 31 && tx <= 32 && ty >= 36 && ty <= 40) return true;

  // 4. Northwest Farm Road (connecting Central Plaza to Farmstead):
  // Horizontal stretch (ty: 20..21, tx: 14..28)
  if (ty >= 20 && ty <= 21 && tx >= 14 && tx <= 28) return true;
  // Vertical stem into Central Plaza (tx: 27..28, ty: 21..28)
  if (tx >= 27 && tx <= 28 && ty >= 21 && ty <= 28) return true;
  // Vertical stem into Farmstead porch (tx: 14..15, ty: 14..21)
  if (tx >= 14 && tx <= 15 && ty >= 14 && ty <= 21) return true;

  // 5. Northeast Bank Boulevard (connecting Central Plaza to Bank):
  // Horizontal stretch (ty: 20..21, tx: 36..50)
  if (ty >= 20 && ty <= 21 && tx >= 36 && tx <= 50) return true;
  // Vertical stem into Central Plaza (tx: 36..37, ty: 21..28)
  if (tx >= 36 && tx <= 37 && ty >= 21 && ty <= 28) return true;
  // Vertical stem into Bank steps (tx: 49..50, ty: 14..21)
  if (tx >= 49 && tx <= 50 && ty >= 14 && ty <= 21) return true;

  // 6. Southwest Festival Avenue (connecting Central Plaza to Festival Grounds):
  // Vertical stem from Plaza (tx: 27..28, ty: 36..44)
  if (tx >= 27 && tx <= 28 && ty >= 36 && ty <= 44) return true;
  // Horizontal stretch (ty: 44..45, tx: 16..28)
  if (ty >= 44 && ty <= 45 && tx >= 16 && tx <= 28) return true;
  // Vertical stem into Festival Grounds (tx: 16..17, ty: 45..51)
  if (tx >= 16 && tx <= 17 && ty >= 45 && ty <= 51) return true;

  // 7. Southeast Cinema Boulevard (connecting Central Plaza to Moonlight Cinema):
  // Vertical stem from Plaza (tx: 36..37, ty: 36..44)
  if (tx >= 36 && tx <= 37 && ty >= 36 && ty <= 44) return true;
  // Horizontal stretch (ty: 44..45, tx: 36..48)
  if (ty >= 44 && ty <= 45 && tx >= 36 && tx <= 48) return true;
  // Vertical stem into Cinema entrance (tx: 47..48, ty: 45..51)
  if (tx >= 47 && tx <= 48 && ty >= 45 && ty <= 51) return true;

  // 8. Secondary Trails:
  // Toolshed Branch (tx: 15..16, ty: 21..24)
  if (tx >= 15 && tx <= 16 && ty >= 21 && ty <= 24) return true;
  // Sky Post Courier Branch (tx: 47..48, ty: 21..25)
  if (tx >= 47 && tx <= 48 && ty >= 21 && ty <= 25) return true;
  // South Trail past bridge (tx: 31..32, ty: 43..48)
  if (tx >= 31 && tx <= 32 && ty >= 43 && ty <= 48) return true;

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
  return { col: 4, row: 0 }; // dirt_center
}

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
    images: { tileset: null, pip: null, bram: null, farmhouse: null, notice_board: null, bank: null, bell_tower: null, festival_grounds: null, moonlight_cinema: null, archive_cellar: null },
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

      // Cycle animation frames (~10fps for sprite walk & water shimmer)
      if (tickCounter % 6 === 0) {
        state.animFrame++;
        state.waterFrame = (state.waterFrame + 1) % 2;
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
      const scale = isMobile ? 3 : 4;
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
            ctx.drawImage(tileset, state.waterFrame * TILE_SIZE, 1 * TILE_SIZE, TILE_SIZE, TILE_SIZE, wx, wy, TILE_SIZE, TILE_SIZE);
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

          // Default Grass Variety (0-3)
          const tileCol = (tx * 7 + ty * 13) % 4;
          ctx.drawImage(tileset, tileCol * TILE_SIZE, 0, TILE_SIZE, TILE_SIZE, wx, wy, TILE_SIZE, TILE_SIZE);
        }
      }

      // ── Layer 2: Decorative Fences & Rails ──
      // Farmstead boundary fence (ty: 16, tx: 10..13 and tx: 16..17) leaving tx: 14..15 open for path
      for (let fx = 10; fx <= 13; fx++) {
        ctx.drawImage(tileset, 2 * TILE_SIZE, 1 * TILE_SIZE, TILE_SIZE, TILE_SIZE, fx * TILE_SIZE, 16 * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      }
      for (let fx = 16; fx <= 17; fx++) {
        ctx.drawImage(tileset, 2 * TILE_SIZE, 1 * TILE_SIZE, TILE_SIZE, TILE_SIZE, fx * TILE_SIZE, 16 * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      }

      // Wooden Footbridge Railings across Woodland Pond (tx: 31 and tx: 33, ty: 40..43)
      for (let by = 40; by <= 43; by++) {
        ctx.drawImage(tileset, 2 * TILE_SIZE, 1 * TILE_SIZE, TILE_SIZE, TILE_SIZE, 31 * TILE_SIZE, by * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        ctx.drawImage(tileset, 2 * TILE_SIZE, 1 * TILE_SIZE, TILE_SIZE, TILE_SIZE, 33 * TILE_SIZE, by * TILE_SIZE, TILE_SIZE, TILE_SIZE);
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

      // ── 5. Central Village Stone Fountain (tx: 32, ty: 31) ──
      renderables.push({
        y: 32 * TILE_SIZE,
        render: () => {
          ctx.drawImage(tileset, 5 * TILE_SIZE, 4 * TILE_SIZE, TILE_SIZE, TILE_SIZE, 32 * TILE_SIZE, 31 * TILE_SIZE, TILE_SIZE, TILE_SIZE);
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
            ctx.drawImage(tileset, 5 * TILE_SIZE, 3 * TILE_SIZE, TILE_SIZE, TILE_SIZE, ax + 2 * TILE_SIZE, ay + 1 * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            ctx.drawImage(tileset, 7 * TILE_SIZE, 4 * TILE_SIZE, TILE_SIZE, TILE_SIZE, ax - 1 * TILE_SIZE, ay + 1 * TILE_SIZE, TILE_SIZE, TILE_SIZE);
          }
        },
      });

      // ── 9. Chapter 8: The Toolshed Workbench (tx: 16, ty: 22) ──
      renderables.push({
        y: 23 * TILE_SIZE,
        render: () => {
          const sx = 15 * TILE_SIZE;
          const sy = 21 * TILE_SIZE;
          ctx.drawImage(tileset, 6 * TILE_SIZE, 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE, sx, sy, TILE_SIZE, TILE_SIZE);
          ctx.drawImage(tileset, 6 * TILE_SIZE, 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE, sx + TILE_SIZE, sy, TILE_SIZE, TILE_SIZE);
          ctx.drawImage(tileset, 6 * TILE_SIZE, 3 * TILE_SIZE, TILE_SIZE, TILE_SIZE, sx + 2 * TILE_SIZE, sy + 1 * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        },
      });

      // ── 10. Sky Post: Wren's Courier Station (tx: 48, ty: 24) ──
      renderables.push({
        y: 25 * TILE_SIZE,
        render: () => {
          const px = 48 * TILE_SIZE;
          const py = 24 * TILE_SIZE;
          ctx.drawImage(tileset, 7 * TILE_SIZE, 5 * TILE_SIZE, TILE_SIZE, TILE_SIZE, px, py, TILE_SIZE, TILE_SIZE);
          ctx.drawImage(tileset, 6 * TILE_SIZE, 5 * TILE_SIZE, TILE_SIZE, TILE_SIZE, px - TILE_SIZE, py, TILE_SIZE, TILE_SIZE);
        },
      });

      // ── 11. Environmental Props: Street Lanterns, Benches, Shrubbery ──
      // Central Plaza Street Lanterns
      const plazaLanterns = [
        { x: 28, y: 28 }, { x: 36, y: 28 },
        { x: 28, y: 36 }, { x: 36, y: 36 },
        { x: 47, y: 14 }, { x: 53, y: 14 }, // Bank lanterns
        { x: 31, y: 14 }, { x: 33, y: 14 }, // Bell Tower lanterns
      ];
      plazaLanterns.forEach((lp) => {
        renderables.push({
          y: (lp.y + 1) * TILE_SIZE,
          render: () => {
            ctx.drawImage(tileset, 7 * TILE_SIZE, 4 * TILE_SIZE, TILE_SIZE, TILE_SIZE, lp.x * TILE_SIZE, lp.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
          },
        });
      });

      // Central Plaza Wooden Benches
      const benches = [
        { x: 30, y: 31 }, { x: 34, y: 31 },
        { x: 30, y: 13 }, { x: 34, y: 13 },
      ];
      benches.forEach((bp) => {
        renderables.push({
          y: (bp.y + 1) * TILE_SIZE,
          render: () => {
            ctx.drawImage(tileset, 6 * TILE_SIZE, 4 * TILE_SIZE, TILE_SIZE, TILE_SIZE, bp.x * TILE_SIZE, bp.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
          },
        });
      });

      // Central Plaza & Clearing Berry Bushes
      const bushes = [
        { x: 29, y: 32 }, { x: 35, y: 32 },
        { x: 13, y: 23 }, { x: 47, y: 23 },
      ];
      bushes.forEach((bp) => {
        renderables.push({
          y: (bp.y + 1) * TILE_SIZE,
          render: () => {
            ctx.drawImage(tileset, 5 * TILE_SIZE, 5 * TILE_SIZE, TILE_SIZE, TILE_SIZE, bp.x * TILE_SIZE, bp.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
          },
        });
      });

      // ── 12. Zone A & Environmental Trees ──
      // Distinct woodland trees framing the clearings and borders
      const trees = [
        // Oak trees (type: 'oak', canopy at x, y-1; trunk at x, y)
        { x: 9, y: 10, type: 'oak' },
        { x: 18, y: 10, type: 'oak' },
        { x: 8, y: 31, type: 'oak' },
        { x: 26, y: 22, type: 'oak' },
        { x: 38, y: 22, type: 'oak' },
        { x: 10, y: 44, type: 'oak' },
        { x: 54, y: 44, type: 'oak' },
        // Cherry blossoms (type: 'blossom')
        { x: 9, y: 34, type: 'blossom' },
        { x: 24, y: 12, type: 'blossom' },
        { x: 40, y: 12, type: 'blossom' },
        // Pines (type: 'pine')
        { x: 29, y: 9, type: 'pine' },
        { x: 35, y: 9, type: 'pine' },
        { x: 18, y: 21, type: 'pine' },
        { x: 44, y: 10, type: 'pine' },
        { x: 56, y: 10, type: 'pine' },
        { x: 22, y: 48, type: 'pine' },
        { x: 42, y: 48, type: 'pine' },
        // Outer forest boundary accents (North, South, West, East)
        { x: 6, y: 5, type: 'oak' }, { x: 14, y: 5, type: 'pine' }, { x: 22, y: 5, type: 'oak' },
        { x: 42, y: 5, type: 'pine' }, { x: 50, y: 5, type: 'oak' }, { x: 58, y: 5, type: 'pine' },
        { x: 5, y: 16, type: 'pine' }, { x: 5, y: 26, type: 'oak' }, { x: 5, y: 40, type: 'pine' }, { x: 5, y: 52, type: 'oak' },
        { x: 58, y: 16, type: 'oak' }, { x: 58, y: 26, type: 'pine' }, { x: 58, y: 40, type: 'oak' }, { x: 58, y: 52, type: 'pine' },
        { x: 8, y: 57, type: 'pine' }, { x: 24, y: 57, type: 'oak' }, { x: 40, y: 57, type: 'pine' }, { x: 54, y: 57, type: 'oak' },
      ];

      trees.forEach((tr) => {
        if (tr.type === 'pine') {
          renderables.push({
            y: (tr.y + 1) * TILE_SIZE,
            render: () => {
              ctx.drawImage(tileset, 4 * TILE_SIZE, 5 * TILE_SIZE, TILE_SIZE, TILE_SIZE, tr.x * TILE_SIZE, tr.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            },
          });
        } else if (tr.type === 'blossom') {
          renderables.push({
            y: (tr.y + 1) * TILE_SIZE,
            render: () => {
              ctx.drawImage(tileset, 2 * TILE_SIZE, 5 * TILE_SIZE, TILE_SIZE, TILE_SIZE, tr.x * TILE_SIZE, (tr.y - 1) * TILE_SIZE, TILE_SIZE, TILE_SIZE);
              ctx.drawImage(tileset, 3 * TILE_SIZE, 5 * TILE_SIZE, TILE_SIZE, TILE_SIZE, tr.x * TILE_SIZE, tr.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            },
          });
        } else {
          // Oak
          renderables.push({
            y: (tr.y + 1) * TILE_SIZE,
            render: () => {
              ctx.drawImage(tileset, 0, 5 * TILE_SIZE, TILE_SIZE, TILE_SIZE, tr.x * TILE_SIZE, (tr.y - 1) * TILE_SIZE, TILE_SIZE, TILE_SIZE);
              ctx.drawImage(tileset, 1 * TILE_SIZE, 5 * TILE_SIZE, TILE_SIZE, TILE_SIZE, tr.x * TILE_SIZE, tr.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
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

      // ── Layer 4: Floating Building Signposts & Hover Highlights ──
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
