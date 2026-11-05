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

  // Exactly cover the span to the next tileset so no tile index in any layer is ever unmapped
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

// Recursively find all tile layers
function findTileLayers(layers) {
  let flat = [];
  for (const l of layers) {
    if (l.type === 'tilelayer') {
      flat.push(l);
    } else if (l.layers) {
      flat = flat.concat(findTileLayers(l.layers));
    }
  }
  return flat;
}

const flatTileLayers = findTileLayers(tmj.layers);

// Recursively find interactive object layers (MapHubs, Meta, TrellisPoints)
function findObjectLayers(layers) {
  let flat = [];
  for (const l of layers) {
    if (l.type === 'objectgroup') {
      if (l.name === 'MapHubs' || l.name === 'Meta' || l.name === 'TrellisPoints') {
        flat.push(l);
      }
    } else if (l.layers) {
      flat = flat.concat(findObjectLayers(l.layers));
    }
  }
  return flat;
}
const interactiveObjectLayers = findObjectLayers(tmj.layers);

// Merge all specialized building / stall collision layers into the main Tiles_Collision layer!
const mainCol = flatTileLayers.find(l => l.name === 'Tiles_Collision');
if (mainCol && mainCol.data) {
  const otherCols = flatTileLayers.filter(l => l.name.startsWith('Tiles_Collision_') && l.name !== 'Tiles_Collision');
  let merged = 0;
  for (const oc of otherCols) {
    if (!oc.data) continue;
    for (let i = 0; i < oc.data.length; i++) {
      const gid = oc.data[i] & 0x1FFFFFFF;
      // 1506 (river bank/curb), 1507 (solid wall/stall), 1508 (water), 1510 (barrier)
      if (gid === 1506 || gid === 1507 || gid === 1508 || gid === 1510) {
        const cur = mainCol.data[i] & 0x1FFFFFFF;
        if (cur === 1504 || cur === 0) {
          mainCol.data[i] = gid;
          merged++;
        }
      }
    }
  }
  console.log(`Merged ${merged} solid building/stall tiles into Tiles_Collision.`);
}

tmj.layers = [...flatTileLayers, ...interactiveObjectLayers];

fs.writeFileSync('public/village_assets/tiled_map/rm_town.json', JSON.stringify(tmj), 'utf8');
fs.writeFileSync('village_assets/tiled_map/rm_town.json', JSON.stringify(tmj), 'utf8');
console.log('Successfully written rm_town.json with merged collision layer!');
