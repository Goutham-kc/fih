const sharp = require('sharp');

async function inspectCollisionTiles() {
  const meta = await sharp('public/village_assets/meta/spr_collision_tile_info.png').metadata();
  const raw = await sharp('public/village_assets/meta/spr_collision_tile_info.png').raw().toBuffer();
  console.log(`Image dims: ${meta.width}x${meta.height}, channels: ${meta.channels}`);

  for (let tileIdx = 0; tileIdx < 7; tileIdx++) {
    const gid = 1504 + tileIdx;
    console.log(`\n--- Tile ${tileIdx} (GID ${gid}) ---`);
    for (let y = 0; y < 8; y++) {
      let row = '';
      for (let x = 0; x < 8; x++) {
        const px = tileIdx * 8 + x;
        const idx = (y * meta.width + px) * meta.channels;
        const r = raw[idx];
        const g = raw[idx + 1];
        const b = raw[idx + 2];
        const a = meta.channels === 4 ? raw[idx + 3] : 255;
        if (a === 0) row += ' . ';
        else row += `[${r > 128 ? 'R' : g > 128 ? 'G' : b > 128 ? 'B' : '#'}]`;
      }
      console.log(row);
    }
  }
}

inspectCollisionTiles();
