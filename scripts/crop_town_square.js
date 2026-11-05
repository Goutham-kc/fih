const sharp = require('sharp');

async function main() {
  console.log('Cropping 1024x1024 Town Square from rm_town_baked.png...');
  await sharp('public/village_assets/rm_town_baked.png')
    .extract({ left: 600, top: 950, width: 1024, height: 1024 })
    .toFile('public/village_assets/rm_town_square.png');

  console.log('Saved public/village_assets/rm_town_square.png');
}

main().catch(console.error);
