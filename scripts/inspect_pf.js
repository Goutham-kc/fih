const fs = require('fs');

const tmj = JSON.parse(fs.readFileSync('public/village_assets/tiled_map/rm_town.tmj', 'utf8'));
const pf = tmj.layers.find(l => l.name === 'Pathfinding');

console.log('Pathfinding non-zero count:', pf?.data?.filter(g => g !== 0).length);
const gids = new Set(pf?.data?.filter(g => g !== 0));
console.log('GIDs in Pathfinding:', Array.from(gids));
