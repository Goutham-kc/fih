const fs = require('fs');

const tmj = JSON.parse(fs.readFileSync('public/village_assets/tiled_map/rm_town.tmj', 'utf8'));
const tc = tmj.layers.find(l => l.name === 'Tiles_Collision');

console.log('Tiles_Collision non-zero count:', tc?.data?.filter(g => g !== 0).length);
const gids = new Set(tc?.data?.filter(g => g !== 0));
console.log('GIDs in Tiles_Collision:', Array.from(gids));
