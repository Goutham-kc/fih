const fs = require('fs');
const path = require('path');

const mappings = [
  // Buildings
  ['public/assets/buildings/residences/cottage_red_roof_chimney.png', 'public/assets/buildings/farmhouse.png'],
  ['public/assets/buildings/residences/manor_fortified_watchtower_red.png', 'public/assets/buildings/bank.png'],
  ['public/assets/buildings/landmarks/watchtower_timber_banner_ladder.png', 'public/assets/buildings/bell_tower.png'],
  ['public/assets/buildings/landmarks/gatehouse_fortress_palisade_double_tower.png', 'public/assets/buildings/festival_grounds.png'],
  ['public/assets/buildings/landmarks/gazebo_garden_hexagonal_pavilion.png', 'public/assets/buildings/moonlight_cinema.png'],
  ['public/assets/buildings/landmarks/ruins_mossy_stone_arch_pillar.png', 'public/assets/buildings/archive_cellar.png'],
  ['public/assets/buildings/residences/tavern_inn_blue_roof_2story.png', 'public/assets/buildings/inn_tavern.png'],
  ['public/assets/buildings/residences/cottage_green_roof_artisan.png', 'public/assets/buildings/cottage_lavender.png'],
  ['public/assets/structures/props/signpost_and_bulletin_boards.png', 'public/assets/buildings/notice_board.png'],
  ['public/assets/buildings/utilities/barn_timber_crop_storage.png', 'public/assets/buildings/toolshed.png'],

  // Props & Structures
  ['public/assets/structures/bridges/bridge_wooden_arched_pond_lilypads.png', 'public/assets/props/bridge_wood.png'],
  ['public/assets/buildings/utilities/stall_general_store_blue_striped.png', 'public/assets/props/market_stall.png'],
  ['public/assets/buildings/utilities/well_covered_stone_bucket.png', 'public/assets/props/stone_well.png'],
  ['public/assets/structures/shrines/shrine_elemental_water_fountain_basin.png', 'public/assets/props/fountain_stone.png'],
  ['public/assets/structures/props/fence_ranch_wood_segment.png', 'public/assets/props/fence_wood.png'],
  ['public/assets/structures/props/fence_ranch_wood_segments.png', 'public/assets/props/fence_post.png'],
  ['public/assets/structures/props/lanterns_bracket_and_post_iron.png', 'public/assets/props/lantern_post.png'],
  ['public/assets/structures/props/lanterns_bracket_and_post_iron.png', 'public/assets/props/lantern_wood_post.png'],
  ['public/assets/structures/props/lantern_stone_pagoda_toro.png', 'public/assets/props/lantern_oil.png'],
  ['public/assets/structures/props/pillar_ruined_stone_ivy_wrap.png', 'public/assets/props/stone_monument.png'],
  ['public/assets/structures/props/chest_wooden_treasure_ornate.png', 'public/assets/props/treasure_chest.png'],
  ['public/assets/nature/rocks/rock_granite_flat_stepping_slab.png', 'public/assets/props/rock_slate.png'],
  ['public/assets/nature/rocks/rock_granite_flat_stepping_slab.png', 'public/assets/props/bench_wood.png'],
  ['public/assets/nature/logs/log_fallen_hollow_weathered.png', 'public/assets/props/bench_log.png'],

  // Trees & Nature
  ['public/assets/nature/trees/tree_broadleaf_oak_green.png', 'public/assets/trees/oak_large.png'],
  ['public/assets/nature/trees/tree_tall_evergreen_pine.png', 'public/assets/trees/pine_large.png'],
  ['public/assets/nature/trees/tree_birch_slender_canopy.png', 'public/assets/trees/blossom_large.png'],
  ['public/assets/nature/bushes/bush_dense_emerald_round_shrub.png', 'public/assets/trees/bush_green.png'],
  ['public/assets/nature/bushes/bush_flowering_rose_hedge.png', 'public/assets/trees/bush_flowers.png'],
  ['public/assets/nature/bushes/bush_forest_undergrowth_canopy.png', 'public/assets/trees/bush_yellow.png'],
  ['public/assets/nature/bushes/bush_flowering_white_blossoms.png', 'public/assets/trees/bush_red.png'],
  ['public/assets/nature/bushes/bush_dense_round_emerald.png', 'public/assets/trees/bush_tiered.png'],
  ['public/assets/nature/logs/log_fallen_mossy_vines.png', 'public/assets/trees/fallen_log.png'],
  ['public/assets/nature/logs/stump_large_ancient_roots.png', 'public/assets/trees/tree_stump.png'],
  ['public/assets/nature/rocks/boulder_granite_mossy_large.png', 'public/assets/trees/rock_moss.png'],
  ['public/assets/nature/mushrooms/mushrooms_amanita_red_spotted_cluster.png', 'public/assets/trees/mushrooms.png'],
  ['public/assets/nature/flowers/flowers_wild_daisies_and_poppies.png', 'public/assets/trees/flowers_poppy.png'],
  ['public/assets/nature/flowers/flowers_wild_daisies_and_poppies.png', 'public/assets/trees/flowers_daisy.png'],
  ['public/assets/nature/flowers/flowers_cattails_marsh_reeds.png', 'public/assets/trees/flowers_sunflower.png'],
  ['public/assets/nature/flowers/flowers_cattails_marsh_reeds.png', 'public/assets/props/cattails.png']
];

console.log('Copying new assets over legacy paths to activate them for the village...');
for (const [src, dst] of mappings) {
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dst);
    console.log(`Activated: ${path.basename(src)} -> ${dst}`);
  } else {
    console.warn(`Source missing: ${src}`);
  }
}
console.log('Done!');
