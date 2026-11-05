const fs = require('fs');
const path = require('path');

const tmjPath = 'village_assets/tiled_map/rm_town.tmj';
const tmj = JSON.parse(fs.readFileSync(tmjPath, 'utf8'));

// Scan all .tsx files
const tsxMap = new Map();
function scanTsx(dir) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, f.name);
    if (f.isDirectory()) scanTsx(full);
    else if (f.name.endsWith('.tsx')) {
      tsxMap.set(f.name.toLowerCase(), full);
    }
  }
}
scanTsx('village_assets');

const embeddedTilesets = [];
for (let i = 0; i < tmj.tilesets.length; i++) {
  const ts = tmj.tilesets[i];
  const nextFirstGid = i < tmj.tilesets.length - 1 ? tmj.tilesets[i + 1].firstgid : ts.firstgid + 2000;
  const baseName = path.basename(ts.source).toLowerCase();
  const tsxPath = tsxMap.get(baseName);
  const nameOnly = baseName.replace('.tsx', '');

  let name = nameOnly;
  let tilewidth = 16;
  let tileheight = 16;

  if (tsxPath) {
    const xml = fs.readFileSync(tsxPath, 'utf8');
    const nameMatch = xml.match(/name="([^"]+)"/);
    const twMatch = xml.match(/tilewidth="(\d+)"/);
    const thMatch = xml.match(/tileheight="(\d+)"/);

    if (nameMatch) name = nameMatch[1];
    if (twMatch) tilewidth = parseInt(twMatch[1], 10);
    if (thMatch) tileheight = parseInt(thMatch[1], 10);
  }

  if (name === 'tile_collision_info') {
    tilewidth = 8;
    tileheight = 8;
  }

  // Exactly cover the span to the next tileset so no tile index in any layer is ever unmapped!
  const tilecount = nextFirstGid - ts.firstgid;
  let columns = 32;
  if (tilecount < 32) columns = tilecount;
  const rows = Math.ceil(tilecount / columns);
  const imagewidth = columns * tilewidth;
  const imageheight = rows * tileheight;
  const image = `${name}.png`;

  const embedded = {
    firstgid: ts.firstgid,
    name,
    tilewidth,
    tileheight,
    tilecount,
    columns,
    margin: 0,
    spacing: 0,
    image,
    imagewidth,
    imageheight,
    tiles: []
  };

  embeddedTilesets.push(embedded);
}

tmj.tilesets = embeddedTilesets;

// Recursively flatten all layers so Phaser 3 map.createLayer(layerName) can find any layer directly!
function flatten(layers) {
  let flat = [];
  for (const l of layers) {
    if (l.type === 'tilelayer') {
      flat.push(l);
    } else if (l.layers) {
      flat = flat.concat(flatten(l.layers));
    }
  }
  return flat;
}

const flatTileLayers = flatten(tmj.layers);
console.log(`Flattened ${flatTileLayers.length} tile layers.`);
tmj.layers = flatTileLayers;

fs.writeFileSync('public/village_assets/tiled_map/rm_town.json', JSON.stringify(tmj), 'utf8');
fs.writeFileSync('village_assets/tiled_map/rm_town.json', JSON.stringify(tmj), 'utf8');
console.log('Successfully written complete rm_town.json with full tileset coverage!');
