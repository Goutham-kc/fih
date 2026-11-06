const fs = require('fs');
const path = require('path');

const SOURCE_ASSETS = 'C:/Users/gouth/Downloads/New folder/Fields of Mistria/assets';
const TARGET_DIR_PUB = 'public/village_assets/environment/decorations';
const TARGET_DIR_VIL = 'village_assets/environment/decorations';

fs.mkdirSync(TARGET_DIR_PUB, { recursive: true });
fs.mkdirSync(TARGET_DIR_VIL, { recursive: true });

// Read list script logic
const localFiles = new Map();
function indexDir(dir, map) {
  if (!fs.existsSync(dir)) return;
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) indexDir(full, map);
    else if (f.endsWith('.png')) map.set(f.toLowerCase(), full);
  }
}
indexDir('public/village_assets', localFiles);

const sourceFiles = new Map();
indexDir(SOURCE_ASSETS, sourceFiles);

const gmXml = fs.readFileSync('public/village_assets/tiled_map/__gm_import.tsx', 'utf8');
const tileRegex = /<tile id="(\d+)"(?:[^>]*?width="(\d+)"[^>]*?height="(\d+)")?[^>]*?>([\s\S]*?)<\/tile>/g;
let m;
const gmTiles = new Map();
while ((m = tileRegex.exec(gmXml)) !== null) {
  const tileId = parseInt(m[1], 10);
  const body = m[4];
  const imgMatch = body.match(/<image\s+(?:width="(\d+)"\s+height="(\d+)"\s+)?source="([^"]+)"/);
  if (imgMatch) {
    const baseName = path.basename(imgMatch[3]).toLowerCase();
    gmTiles.set(tileId, {
      baseName,
      source: imgMatch[3]
    });
  }
}

const tmj = JSON.parse(fs.readFileSync('village_assets/tiled_map/rm_town.tmj', 'utf8'));
const layersToRender = [
  'Level_0_FloorSprites',
  'Level_0_Assets',
  'Level_0_Assets_Plaza_Fixed',
  'Level_0_FloorSprites_General_Store_Fixed',
  'Level_0_Assets_General_Store_Fixed',
  'Level_0_Assets_Inn_Fixed',
  'Level_0_Assets_Mill_Fixed',
  'Level_0_Assets_Bell_Tower_Fixed',
  'Level_0_Assets_Bell_Tower_Fixed_Door',
  'Level_0_Assets_Bell_Tower_Fixed_Bell',
  'Level_1_Assets_Manor_Lamps'
];

const copied = [];
function findNeeded(layer) {
  if (layer.objects && layersToRender.includes(layer.name)) {
    for (const obj of layer.objects) {
      if (!obj.gid) continue;
      const cleanGid = (obj.gid & 0x1fffffff) - 1;
      const info = gmTiles.get(cleanGid);
      if (!info) continue;
      if (!localFiles.has(info.baseName) && sourceFiles.has(info.baseName)) {
        const srcPath = sourceFiles.get(info.baseName);
        const dstPub = path.join(TARGET_DIR_PUB, info.baseName);
        const dstVil = path.join(TARGET_DIR_VIL, info.baseName);
        fs.copyFileSync(srcPath, dstPub);
        fs.copyFileSync(srcPath, dstVil);
        localFiles.set(info.baseName, dstPub);
        copied.push(info.baseName);
      }
    }
  }
  if (layer.layers) layer.layers.forEach(findNeeded);
}
tmj.layers.forEach(findNeeded);

console.log(`Successfully copied ${copied.length} authentic decorative assets to ${TARGET_DIR_PUB} and ${TARGET_DIR_VIL}!`);
