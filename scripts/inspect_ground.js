const fs = require('fs');

const tmj = JSON.parse(fs.readFileSync('public/village_assets/tiled_map/rm_town.tmj', 'utf8'));
const level0 = tmj.layers.find(l => l.name === 'Level_0');
const ground = level0.layers.find(l => l.name === 'Level_0_Ground');

console.log('Level_0_Ground:');
console.log('type:', ground.type, 'visible:', ground.visible);
const nonZero = ground.data.filter(g => g !== 0);
console.log('nonZero count:', nonZero.length);
console.log('sample nonZero GIDs:', nonZero.slice(0, 20));
