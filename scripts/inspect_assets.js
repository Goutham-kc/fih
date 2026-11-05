const fs = require('fs');

const tmj = JSON.parse(fs.readFileSync('public/village_assets/tiled_map/rm_town.tmj', 'utf8'));
const gmXml = fs.readFileSync('public/village_assets/tiled_map/__gm_import.tsx', 'utf8');

const gmNames = {};
const tileRegex = /<tile id="(\d+)"[\s\S]*?<image\s+source="([^"]+)"/g;
let m;
while ((m = tileRegex.exec(gmXml)) !== null) {
  gmNames[parseInt(m[1], 10) + 1] = m[2].split('/').pop();
}

function scan(l) {
  if (l.name === 'Level_0_Assets') {
    const counts = {};
    for (const o of l.objects) {
      const name = gmNames[o.gid] || ('gid_' + o.gid);
      counts[name] = (counts[name] || 0) + 1;
    }
    console.log('Level_0_Assets counts:');
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    sorted.forEach(([k, v]) => console.log(`  ${v}x ${k}`));
  }
  if (l.layers) l.layers.forEach(scan);
}
scan(tmj);
