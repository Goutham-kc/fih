const fs = require('fs');

const tmj = JSON.parse(fs.readFileSync('public/village_assets/tiled_map/rm_town.tmj', 'utf8'));
const level0 = tmj.layers.find(l => l.name === 'Level_0');
const pg = level0.layers.find(l => l.name === 'PriorityGrass');

const gids = {};
for (const g of pg.data) {
  if (g !== 0) {
    const clean = g & 0x1fffffff;
    gids[clean] = (gids[clean] || 0) + 1;
  }
}
console.log('Unique GIDs in PriorityGrass:', Object.keys(gids).length);
console.log('Sample GIDs:', Object.entries(gids).slice(0, 10));
