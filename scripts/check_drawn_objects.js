const fs = require('fs');
const path = require('path');

const tmj = JSON.parse(fs.readFileSync('public/village_assets/tiled_map/rm_town.tmj', 'utf8'));

// All indexed images
const allImages = new Map();
function indexImages(dir) {
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) indexImages(full);
    else if (f.endsWith('.png')) allImages.set(f.toLowerCase(), full);
  }
}
indexImages('public/village_assets');

// Parse __gm_import
const gmXml = fs.readFileSync('public/village_assets/tiled_map/__gm_import.tsx', 'utf8');
const gmTiles = new Map();
const tileRegex = /<tile id="(\d+)"(?:[^>]*?width="(\d+)"[^>]*?height="(\d+)")?[^>]*?>([\s\S]*?)<\/tile>/g;
let m;
while ((m = tileRegex.exec(gmXml)) !== null) {
  const tileId = parseInt(m[1], 10);
  const body = m[4];
  const imgMatch = body.match(/<image\s+source="([^"]+)"/);
  if (imgMatch) {
    const baseName = path.basename(imgMatch[1]).toLowerCase();
    const resolved = allImages.get(baseName);
    gmTiles.set(tileId, { file: resolved, baseName });
  }
}

let totalObjs = 0;
let drawnObjs = 0;
const drawnList = [];

function checkLayer(l) {
  if (l.type === 'objectgroup' && l.objects) {
    for (const obj of l.objects) {
      totalObjs++;
      if (obj.gid && (obj.gid & 0x1fffffff) < 1504) {
        const tid = (obj.gid & 0x1fffffff) - 1;
        const info = gmTiles.get(tid);
        if (info && info.file) {
          drawnObjs++;
          drawnList.push({ layer: l.name, sprite: info.baseName, x: obj.x, y: obj.y });
        }
      }
    }
  }
  if (l.layers) l.layers.forEach(checkLayer);
}
checkLayer(tmj);

console.log(`Total objects: ${totalObjs}`);
console.log(`Drawn objects from __gm_import: ${drawnObjs}`);
console.log('Sample drawn objects:');
console.log(drawnList.slice(0, 15));
