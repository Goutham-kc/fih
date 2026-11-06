// Drop next to PixelWorldCanvas.jsx. Put rm_town_collision.json in /public/village_assets/.
// Replaces the hand-coded rectangles in isWalkable() with the real Tiles_Collision grid of rm_town.
let GRID = null; // { w, h, cell, cells: Uint8Array (1 = blocked) }

function ensureGridSync() {
  if (GRID) return;
  if (typeof window === 'undefined') {
    try {
      const fs = require('fs');
      const path = require('path');
      const file = path.resolve('public/village_assets/rm_town_collision.json');
      if (fs.existsSync(file)) {
        const j = JSON.parse(fs.readFileSync(file, 'utf8'));
        const cells = new Uint8Array(j.width * j.height);
        for (let i = 0; i < cells.length; i++) cells[i] = j.walkable.charCodeAt(i) === 49 ? 1 : 0;
        GRID = { w: j.width, h: j.height, cell: j.cell, cells, base: j };
      }
    } catch (e) {}
  }
}

export async function loadCollisionGrid(url = '/village_assets/rm_town_collision.json') {
  let j;
  if (typeof fetch !== 'undefined') {
    try {
      j = await (await fetch(url)).json();
    } catch (e) {
      if (typeof window === 'undefined') {
        const fs = require('fs');
        const path = require('path');
        const file = path.resolve('public/village_assets/rm_town_collision.json');
        j = JSON.parse(fs.readFileSync(file, 'utf8'));
      }
    }
  } else {
    const fs = require('fs');
    const path = require('path');
    const file = path.resolve('public/village_assets/rm_town_collision.json');
    j = JSON.parse(fs.readFileSync(file, 'utf8'));
  }
  const cells = new Uint8Array(j.width * j.height);
  for (let i = 0; i < cells.length; i++) cells[i] = j.walkable.charCodeAt(i) === 49 ? 1 : 0;
  GRID = { w: j.width, h: j.height, cell: j.cell, cells, base: j };
  return GRID;
}

// Turn extra overlays (stalls, festivals) on/off at runtime: setOverlay('Stall_Zorel', true)
export function setOverlay(name, on) {
  ensureGridSync();
  if (!GRID) return;
  const list = GRID.base.overlays[name];
  if (!list) return;
  const baseWalk = GRID.base.walkable;
  for (const [i, blocked] of list) GRID.cells[i] = on ? blocked : (baseWalk.charCodeAt(i) === 49 ? 1 : 0);
}

export function isCellBlocked(tx, ty) {
  ensureGridSync();
  if (!GRID) return false; // grid not loaded yet: don't trap the player
  if (tx < 0 || ty < 0 || tx >= GRID.w || ty >= GRID.h) return true;
  return GRID.cells[ty * GRID.w + tx] === 1;
}

// wx, wy are MAP pixels (0..2128, 0..2928) = the same space as rm_town_full.png
export function isPointWalkable(wx, wy) {
  return !isCellBlocked(Math.floor(wx / 8), Math.floor(wy / 8));
}

// Feet box (default 10x6 px centred on the foot point) - all overlapped 8px cells must be free
export function isFeetWalkable(fx, fy, halfW = 5, halfH = 3) {
  const x0 = Math.floor((fx - halfW) / 8), x1 = Math.floor((fx + halfW) / 8);
  const y0 = Math.floor((fy - halfH) / 8), y1 = Math.floor((fy + halfH) / 8);
  for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) if (isCellBlocked(tx, ty)) return false;
  return true;
}

export function getGrid() {
  ensureGridSync();
  return GRID;
}
