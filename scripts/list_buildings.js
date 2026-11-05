const fs = require('fs');

const tmj = JSON.parse(fs.readFileSync('public/village_assets/tiled_map/rm_town.tmj', 'utf8'));
const gmXml = fs.readFileSync('public/village_assets/tiled_map/__gm_import.tsx', 'utf8');

const gmNames = {};
const tileRegex = /<tile id="(\d+)"[\s\S]*?<image\s+source="([^"]+)"/g;
let m;
while ((m = tileRegex.exec(gmXml)) !== null) {
  gmNames[parseInt(m[1], 10) + 1] = m[2].split('/').pop();
}

const buildings = [];
function scan(l) {
  if (l.objects) {
    for (const o of l.objects) {
      const spriteName = gmNames[o.gid] || '';
      if (spriteName.includes('building') || spriteName.includes('fountain') || spriteName.includes('wagon') || spriteName.includes('gazebo') || spriteName.includes('bridge') || o.name?.includes('Tower') || o.type?.includes('stall')) {
        buildings.push({
          layer: l.name,
          sprite: spriteName || o.name || o.type,
          x: o.x,
          y: o.y,
          w: o.width,
          h: o.height,
          tile8X: Math.round(o.x / 8),
          tile8Y: Math.round(o.y / 8)
        });
      }
    }
  }
  if (l.layers) l.layers.forEach(scan);
}
scan(tmj);

console.log(JSON.stringify(buildings, null, 2));
