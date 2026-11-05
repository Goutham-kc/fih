const sharp = require('sharp');

async function crop() {
  await sharp('public/village_assets/rm_town_baked.png')
    .extract({ left: 600, top: 1200, width: 960, height: 720 })
    .toFile('C:/Users/gouth/.gemini/antigravity/brain/7a513e8a-e2f0-4f3b-8051-22e22a3a0e1e/town_center_crop.png');
  console.log('Saved town_center_crop.png');
}
crop().catch(console.error);
