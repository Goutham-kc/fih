const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function testGS() {
  const tmj = JSON.parse(fs.readFileSync('public/village_assets/tiled_map/rm_town.tmj', 'utf8'));

  const allImages = new Map();
  function indexImages(dir) {
    for (const f of fs.readdirSync(dir)) {
      const full = path.join(dir, f);
      if (fs.statSync(full).isDirectory()) indexImages(full);
      else if (f.endsWith('.png')) allImages.set(f.toLowerCase(), full);
    }
  }
  indexImages('public/village_assets');

  const gmXml = fs.readFileSync('public/village_assets/tiled_map/__gm_import.tsx', 'utf8');
  const gmTiles = new Map();
  const tileRegex = /<tile id="(\d+)"(?:[^>]*?width="(\d+)"[^>]*?height="(\d+)")?[^>]*?>([\s\S]*?)<\/tile>/g;
  let m;
  while ((m = tileRegex.exec(gmXml)) !== null) {
    const tileId = parseInt(m[1], 10);
    const body = m[4];
    const imgMatch = body.match(/<image\s+source="([^"]+)"/);
    if (imgMatch) {
      const baseName = path.basename(imgMatch[1]).toLowerCase();
      const resolved = allImages.get(baseName);
      if (resolved) {
        gmTiles.set(tileId, { file: resolved, baseName });
      }
    }
  }

  function findLayer(l, name) {
    if (l.name === name) return l;
    if (l.layers) {
      for (const sub of l.layers) {
        const found = findLayer(sub, name);
        if (found) return found;
      }
    }
    return null;
  }

  const gsLayer = findLayer(tmj, 'Level_0_Assets_General_Store_Fixed');
  console.log('Found gsLayer:', gsLayer.name, 'with objects:', gsLayer.objects.length);
  for (const obj of gsLayer.objects) {
    const cleanGid = obj.gid & 0x1fffffff;
    const tid = cleanGid - 1;
    const info = gmTiles.get(tid);
    console.log(`Obj gid: ${obj.gid} -> tid: ${tid} -> info:`, info?.baseName, info?.file);
  }
}

testGS().catch(console.error);
