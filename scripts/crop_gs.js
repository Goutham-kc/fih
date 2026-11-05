const sharp = require('sharp');

async function cropGeneralStore() {
  await sharp('public/village_assets/rm_town_baked.png')
    .extract({ left: 800, top: 1500, width: 800, height: 500 })
    .toFile('C:/Users/gouth/.gemini/antigravity/brain/7a513e8a-e2f0-4f3b-8051-22e22a3a0e1e/general_store_and_inn_crop.png');
  console.log('Saved general_store_and_inn_crop.png');
}
cropGeneralStore().catch(console.error);
