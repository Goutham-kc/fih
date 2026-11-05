export default function createBootScene(Phaser) {
  return class BootScene extends Phaser.Scene {
    constructor() {
      super({ key: 'BootScene' });
    }

    preload() {
      // 1. Tiled Map JSON & Base 16x16 autotile sheet
      this.load.tilemapTiledJSON('village_map', '/assets/maps/village_map.json');
      this.load.image('village_tileset', '/assets/tiles/village_tileset.png');

      // 2. Character Sprite Sheets
      this.load.spritesheet('pip', '/assets/characters/hero/pip_walk.png', {
        frameWidth: 16,
        frameHeight: 32,
      });
      this.load.spritesheet('bram', '/assets/characters/hero/bram_factor.png', {
        frameWidth: 24,
        frameHeight: 32,
      });

      // 3. Chapter Buildings & Architecture
      this.load.image('farmhouse', '/assets/buildings/residences/cottage_red_roof_chimney.png');
      this.load.image('bank', '/assets/buildings/residences/manor_fortified_watchtower_red.png');
      this.load.image('bell_tower', '/assets/buildings/landmarks/watchtower_timber_banner_ladder.png');
      this.load.image('notice_board', '/assets/structures/props/signpost_and_bulletin_boards.png');
      this.load.image('festival_grounds', '/assets/buildings/landmarks/gatehouse_fortress_palisade_double_tower.png');
      this.load.image('moonlight_cinema', '/assets/buildings/landmarks/gazebo_garden_hexagonal_pavilion.png');
      this.load.image('archive_cellar', '/assets/buildings/landmarks/ruins_mossy_stone_arch_pillar.png');
      this.load.image('toolshed', '/assets/buildings/utilities/barn_timber_crop_storage.png');
      this.load.image('inn_tavern', '/assets/buildings/residences/tavern_inn_blue_roof_2story.png');
      this.load.image('cottage_lavender', '/assets/buildings/residences/cottage_green_roof_artisan.png');
      this.load.image('market_stall', '/assets/buildings/utilities/stall_general_store_blue_striped.png');
      this.load.image('stone_well', '/assets/buildings/utilities/well_covered_stone_bucket.png');

      // 4. Structures, Bridges & Nature Props
      this.load.image('bridge_wood', '/assets/structures/bridges/bridge_wooden_arched_pond_lilypads.png');
      this.load.image('fountain_stone', '/assets/structures/shrines/shrine_elemental_water_fountain_basin.png');
      this.load.image('tree_oak', '/assets/nature/trees/tree_broadleaf_oak_green.png');
      this.load.image('tree_pine', '/assets/nature/trees/tree_tall_evergreen_pine.png');
      this.load.image('tree_blossom', '/assets/nature/trees/tree_birch_slender_canopy.png');
      this.load.image('bush_flowers', '/assets/nature/bushes/bush_flowering_rose_hedge.png');
      this.load.image('bush_green', '/assets/nature/bushes/bush_dense_emerald_round_shrub.png');
      this.load.image('tree_stump', '/assets/nature/logs/stump_large_ancient_roots.png');
      this.load.image('fallen_log', '/assets/nature/logs/log_fallen_mossy_vines.png');
      this.load.image('rock_moss', '/assets/nature/rocks/boulder_granite_mossy_large.png');
      this.load.image('rock_slate', '/assets/nature/rocks/rock_granite_flat_stepping_slab.png');
      this.load.image('mushrooms', '/assets/nature/mushrooms/mushrooms_amanita_red_spotted_cluster.png');
      this.load.image('cattails', '/assets/nature/flowers/flowers_cattails_marsh_reeds.png');
      this.load.image('lilypad', '/assets/structures/props/lilypad.png');
      this.load.image('lilypad_flower', '/assets/structures/props/lilypad_flower.png');
      this.load.image('treasure_chest', '/assets/structures/props/chest_wooden_treasure_ornate.png');
      this.load.image('lantern_post', '/assets/structures/props/lanterns_bracket_and_post_iron.png');
      this.load.image('lantern_oil', '/assets/structures/props/lantern_stone_pagoda_toro.png');
    }

    create() {
      // 5. Register Pip Walk Animations
      // Dir 0: South (0..3), Dir 1: North (4..7), Dir 2: West (8..11), Dir 3: East (12..15)
      this.anims.create({
        key: 'pip_walk_down',
        frames: this.anims.generateFrameNumbers('pip', { start: 0, end: 3 }),
        frameRate: 8,
        repeat: -1,
      });
      this.anims.create({
        key: 'pip_walk_up',
        frames: this.anims.generateFrameNumbers('pip', { start: 4, end: 7 }),
        frameRate: 8,
        repeat: -1,
      });
      this.anims.create({
        key: 'pip_walk_left',
        frames: this.anims.generateFrameNumbers('pip', { start: 8, end: 11 }),
        frameRate: 8,
        repeat: -1,
      });
      this.anims.create({
        key: 'pip_walk_right',
        frames: this.anims.generateFrameNumbers('pip', { start: 12, end: 15 }),
        frameRate: 8,
        repeat: -1,
      });

      // Idle frames
      this.anims.create({
        key: 'pip_idle_down',
        frames: [{ key: 'pip', frame: 0 }],
        frameRate: 1,
      });
      this.anims.create({
        key: 'pip_idle_up',
        frames: [{ key: 'pip', frame: 4 }],
        frameRate: 1,
      });
      this.anims.create({
        key: 'pip_idle_left',
        frames: [{ key: 'pip', frame: 8 }],
        frameRate: 1,
      });
      this.anims.create({
        key: 'pip_idle_right',
        frames: [{ key: 'pip', frame: 12 }],
        frameRate: 1,
      });

      // Switch to VillageScene
      this.scene.start('VillageScene');
    }
  };
}
