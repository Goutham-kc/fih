const fs = require('fs');
const path = require('path');

// Index all files in public/village_assets
const fileMap = new Map();
function indexDir(dir) {
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) indexDir(full);
    else fileMap.set(f.toLowerCase(), full.replace(/\\/g, '/'));
  }
}
indexDir('public/village_assets');

// Parse __gm_import.tsx
const gmXml = fs.readFileSync('public/village_assets/tiled_map/__gm_import.tsx', 'utf8');
const tileRegex = /<tile id="(\d+)"(?:[^>]*?width="(\d+)"[^>]*?height="(\d+)")?[^>]*?>([\s\S]*?)<\/tile>/g;
let m;
const gmTiles = new Map();
let foundCount = 0;
let missingCount = 0;

while ((m = tileRegex.exec(gmXml)) !== null) {
  const tileId = parseInt(m[1], 10);
  const body = m[4];
  const imgMatch = body.match(/<image\s+source="([^"]+)"(?:\s+width="(\d+)"\s+height="(\d+)")?/);
  if (imgMatch) {
    const baseName = path.basename(imgMatch[1]).toLowerCase();
    const resolvedPath = fileMap.get(baseName);
    const w = parseInt(imgMatch[2] || m[2] || '0', 10);
    const h = parseInt(imgMatch[3] || m[3] || '0', 10);
    gmTiles.set(tileId, { file: resolvedPath, baseName, w, h });
    if (resolvedPath) foundCount++;
    else missingCount++;
  }
}

console.log(`Parsed __gm_import.tsx: ${gmTiles.size} tiles.`);
console.log(`Found images: ${foundCount}, Missing: ${missingCount}`);

// Inspect which objects in rm_town.tmj use which tiles
const tmj = JSON.parse(fs.readFileSync('public/village_assets/tiled_map/rm_town.tmj', 'utf8'));
const usedGmGids = new Set();
function scanObjects(l) {
  if (l.objects) {
    for (const o of l.objects) {
      if (o.gid && o.gid < 1504) {
        usedGmGids.add(o.gid - 1);
      }
    }
  }
  if (l.layers) l.layers.forEach(scanObjects);
}
scanObjects(tmj);

console.log(`Used __gm_import tiles in map: ${usedGmGids.size}`);
let usedFound = 0;
let usedMissing = 0;
const missingList = [];
for (const tid of usedGmGids) {
  const info = gmTiles.get(tid);
  if (info && info.file) usedFound++;
  else {
    usedMissing++;
    missingList.push({ tid, baseName: info?.baseName });
  }
}
console.log(`Of used tiles: ${usedFound} found, ${usedMissing} missing`);
if (missingList.length > 0) {
  console.log('Sample missing used tiles:', missingList.slice(0, 10));
}
