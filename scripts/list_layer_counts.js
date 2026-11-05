const fs = require('fs');

const tmj = JSON.parse(fs.readFileSync('public/village_assets/tiled_map/rm_town.tmj', 'utf8'));
const level0 = tmj.layers.find(l => l.name === 'Level_0');
level0.layers.forEach(l => {
  if (l.data) {
    const nonZero = l.data.filter(g => g !== 0);
    console.log(l.name.padEnd(35), 'tiles:', nonZero.length);
  }
});
