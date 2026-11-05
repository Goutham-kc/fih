const fs = require('fs');
const path = require('path');

console.log('Cleaning old assets from public/assets ...');

// Directories to delete completely (from old batches)
const dirsToDelete = [
  'public/assets/animations',
  'public/assets/buildings/archive',
  'public/assets/buildings/bank',
  'public/assets/buildings/bell_tower',
  'public/assets/buildings/cinema',
  'public/assets/buildings/farmstead',
  'public/assets/buildings/festival',
  'public/assets/props/decorations',
  'public/assets/props/fantasy',
  'public/assets/props/furniture',
  'public/assets/props/village',
  'public/assets/structures/fences',
  'public/assets/structures/lamps',
  'public/assets/structures/signs',
  'public/assets/structures/walls',
  'public/assets/tiles/dirt',
  'public/assets/tiles/grass',
  'public/assets/tiles/roads',
  'public/assets/tiles/stone',
  'public/assets/tiles/transitions',
  'public/assets/tiles/water'
];

dirsToDelete.forEach(d => {
  if (fs.existsSync(d)) {
    fs.rmSync(d, { recursive: true, force: true });
    console.log(`Deleted old dir: ${d}`);
  }
});

// Old sheets to delete from raw_sheets
const oldSheets = [
  'public/assets/raw_sheets/sheet_archive_cellar.jpg',
  'public/assets/raw_sheets/sheet_bank_building.jpg',
  'public/assets/raw_sheets/sheet_farmstead_house.jpg',
  'public/assets/raw_sheets/sheet_moonlight_cinema.jpg',
  'public/assets/raw_sheets/sheet_nature_trees.jpg',
  'public/assets/raw_sheets/sheet_props_decorations.jpg',
  'public/assets/raw_sheets/sheet_tileset_overview.png',
  'public/assets/raw_sheets/sheet_village_buildings.jpg',
  'public/assets/raw_sheets/sheet_water_vfx.png'
];

oldSheets.forEach(f => {
  if (fs.existsSync(f)) {
    fs.unlinkSync(f);
    console.log(`Deleted old raw sheet: ${f}`);
  }
});

// Delete old individual loose nature files that don't belong to Sheet 4
const natureDir = 'public/assets/nature';
if (fs.existsSync(natureDir)) {
  const allowedNature = new Set([
    // Trees
    'tree_broadleaf_oak_green.png', 'tree_birch_slender_canopy.png', 'tree_tall_evergreen_pine.png',
    'tree_conifer_spruce_slender.png', 'tree_round_deciduous_apple.png', 'tree_dead_twisted_spooky_large.png',
    'tree_dead_twisted_spooky_medium.png', 'tree_dead_twisted_spooky_small.png', 'tree_young_sapling_foliage.png',
    'tree_leafy_round_oak_full.png', 'nature_atlas_sheet_16bit.png',
    // Logs
    'stump_large_ancient_roots.png', 'stump_slender_cut_timber.png', 'log_fallen_hollow_weathered.png',
    'log_fallen_mossy_vines.png', 'twigs_kindling_firewood_sticks.png', 'tree_ancient_stump_spreading_roots.png',
    // Rocks
    'boulder_granite_mossy_large.png', 'boulder_granite_tiered_medium.png', 'rock_granite_rounded_small.png',
    'pebbles_gravel_scatter_stones.png', 'rock_granite_flat_stepping_slab.png', 'rock_granite_boulder_cluster.png',
    'rock_mossy_granite_mound.png', 'pebbles_river_stone_scatter.png',
    // Mushrooms
    'mushrooms_amanita_red_spotted_cluster.png', 'mushrooms_brown_chanterelle_harvest.png', 'mushrooms_toadstool_trio_red_orange_blue.png',
    // Flowers
    'flowers_wild_daisies_and_poppies.png', 'flowers_cattails_marsh_reeds.png',
    // Bushes
    'bush_flowering_rose_hedge.png', 'bush_dense_emerald_round_shrub.png', 'bush_forest_undergrowth_canopy.png',
    'bush_dense_round_emerald.png', 'bush_flowering_white_blossoms.png', 'plants_tall_reeds_wild_grass.png',
    'plants_leafy_fern_herbs.png'
  ]);

  ['trees', 'logs', 'rocks', 'mushrooms', 'flowers', 'bushes'].forEach(sub => {
    const subP = path.join(natureDir, sub);
    if (fs.existsSync(subP)) {
      fs.readdirSync(subP).forEach(file => {
        if (!allowedNature.has(file)) {
          fs.unlinkSync(path.join(subP, file));
          console.log(`Deleted obsolete nature file: ${sub}/${file}`);
        }
      });
    }
  });
}

// Delete cottage_blue.png (old custom asset)
if (fs.existsSync('public/assets/buildings/cottage_blue.png')) {
  fs.unlinkSync('public/assets/buildings/cottage_blue.png');
}

console.log('Old assets cleanup complete.');
