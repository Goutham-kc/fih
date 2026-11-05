const fs = require('fs');
const path = require('path');

console.log('Finalizing pure new asset structure in public/assets ...');

// 1. Ensure tiles has village_tileset.png
if (fs.existsSync('public/assets/tilesets/village_tileset.png')) {
  fs.copyFileSync('public/assets/tilesets/village_tileset.png', 'public/assets/tiles/village_tileset.png');
}

// 2. Remove legacy root folders
['public/assets/props', 'public/assets/trees', 'public/assets/tilesets', 'public/assets/ui'].forEach(d => {
  if (fs.existsSync(d)) {
    fs.rmSync(d, { recursive: true, force: true });
    console.log(`Removed legacy dir: ${d}`);
  }
});

// 3. Remove loose files directly inside public/assets/buildings/
const buildingsDir = 'public/assets/buildings';
if (fs.existsSync(buildingsDir)) {
  fs.readdirSync(buildingsDir).forEach(item => {
    const full = path.join(buildingsDir, item);
    if (fs.statSync(full).isFile() && item.endsWith('.png')) {
      fs.unlinkSync(full);
      console.log(`Removed loose building file: ${item}`);
    } else if (fs.statSync(full).isDirectory() && ['plaza', 'sky_post', 'toolshed'].includes(item)) {
      fs.rmSync(full, { recursive: true, force: true });
      console.log(`Removed old subfolder: buildings/${item}`);
    }
  });
}

// 4. Remove old loose files in public/assets/characters/
const charsDir = 'public/assets/characters';
if (fs.existsSync(charsDir)) {
  fs.readdirSync(charsDir).forEach(item => {
    const full = path.join(charsDir, item);
    if (fs.statSync(full).isFile()) {
      fs.unlinkSync(full);
      console.log(`Removed old character file: ${item}`);
    }
  });
}

console.log('Cleanup complete.');
