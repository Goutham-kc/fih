# PIXEL VALLEY — ASSET CATALOG & INVENTORY AUDIT

> **Date:** November 2026  
> **Status:** Completed Asset Library Audit & Preparation  
> **Total Categorized Assets:** 127  
> **Native Tile Resolution:** 16 × 16 pixels (Nearest-Neighbor Integer Scaling)

---

## 1. Executive Summary & Audit Overview

A complete audit, extraction, classification, and technical inspection was performed on the newly supplied pixel art collection. Every individual sprite was extracted, categorized, verified for dimensions, transparency, tile footprint, and compatibility with Pixel Valley's 64×64 overworld engine.

### Asset Breakdown by Primary Domain:
| Category Domain | Subdirectories Included | Asset Count |
| :--- | :--- | :--- |
| **Buildings (`public/assets/buildings/`)** | Residences, Utilities, Landmarks | 20 |
| **Structures (`public/assets/structures/`)** | Bridges, Props, Elemental Shrines | 27 |
| **Tiles (`public/assets/tiles/`)** | 16×16 Autotiles, Terrains | 28 |
| **Nature (`public/assets/nature/`)** | Trees, Bushes, Flowers, Mushrooms, Rocks, Logs | 25 |
| **Characters (`public/assets/characters/`)** | Hero 4-Directional Walk & Action Strips | 12 |
| **Total Production Assets** | *All 15 specialized subdirectories* | **127** |

---

## 2. Visual Contact Sheet Previews

All 5 visual contact sheets were generated preserving original pixel art and saved to `public/assets/previews/`:

1. **Village Architecture & Landmarks:** [`preview_1_buildings_and_landmarks.png`](file:///c:/Users/gouth/Projects/fih/public/assets/previews/preview_1_buildings_and_landmarks.png)
2. **Elemental Shrines & Runes:** [`preview_2_elemental_shrines_and_crystals.png`](file:///c:/Users/gouth/Projects/fih/public/assets/previews/preview_2_elemental_shrines_and_crystals.png)
3. **Autotiles & Terrain Transitions (2x):** [`preview_3_autotiles_and_terrain.png`](file:///c:/Users/gouth/Projects/fih/public/assets/previews/preview_3_autotiles_and_terrain.png)
4. **Trees, Rocks & Nature Flora (2x):** [`preview_4_trees_rocks_nature.png`](file:///c:/Users/gouth/Projects/fih/public/assets/previews/preview_4_trees_rocks_nature.png)
5. **Hero Character Animations:** [`preview_5_hero_animations.png`](file:///c:/Users/gouth/Projects/fih/public/assets/previews/preview_5_hero_animations.png)

---

## 3. Comprehensive Asset Registry


### Category: `buildings/landmarks` (7 Assets)

| Asset Name | Relative Path | Dimensions | Tile Footprint | Alpha | Animation | Recommended Use | Compatibility |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **shrine_red_temple_lion_dogs** | `buildings/landmarks/shrine_red_temple_lion_dogs.png` | 145×165 | 10×11 tiles (145×165 px) | Yes (Alpha Cutout) | Static illustration / Building | Overworld village landmark / Interactive building | Entity Overlay (Y-sorted Layer 3) |
| **gatehouse_fortress_palisade_double_tower** | `buildings/landmarks/gatehouse_fortress_palisade_double_tower.png` | 250×155 | 16×10 tiles (250×155 px) | Yes (Alpha Cutout) | Static illustration / Building | Overworld village landmark / Interactive building | Entity Overlay (Y-sorted Layer 3) |
| **watchtower_timber_banner_ladder** | `buildings/landmarks/watchtower_timber_banner_ladder.png` | 95×185 | 6×12 tiles (95×185 px) | Yes (Alpha Cutout) | Static illustration / Building | Overworld village landmark / Interactive building | Entity Overlay (Y-sorted Layer 3) |
| **ruins_mossy_stone_arch_pillar** | `buildings/landmarks/ruins_mossy_stone_arch_pillar.png` | 185×110 | 12×7 tiles (185×110 px) | Yes (Alpha Cutout) | Static illustration / Building | Overworld village landmark / Interactive building | Entity Overlay (Y-sorted Layer 3) |
| **workshop_stone_blue_slate_tools** | `buildings/landmarks/workshop_stone_blue_slate_tools.png` | 165×135 | 11×9 tiles (165×135 px) | Yes (Alpha Cutout) | Static illustration / Building | Overworld village landmark / Interactive building | Entity Overlay (Y-sorted Layer 3) |
| **turret_defense_round_tower_banner** | `buildings/landmarks/turret_defense_round_tower_banner.png` | 120×180 | 8×12 tiles (120×180 px) | Yes (Alpha Cutout) | Static illustration / Building | Overworld village landmark / Interactive building | Entity Overlay (Y-sorted Layer 3) |
| **gazebo_garden_hexagonal_pavilion** | `buildings/landmarks/gazebo_garden_hexagonal_pavilion.png` | 118×135 | 8×9 tiles (118×135 px) | Yes (Alpha Cutout) | Static illustration / Building | Overworld village landmark / Interactive building | Entity Overlay (Y-sorted Layer 3) |

### Category: `buildings/residences` (6 Assets)

| Asset Name | Relative Path | Dimensions | Tile Footprint | Alpha | Animation | Recommended Use | Compatibility |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **cottage_red_roof_chimney** | `buildings/residences/cottage_red_roof_chimney.png` | 140×185 | 9×12 tiles (140×185 px) | Yes (Alpha Cutout) | Static illustration / Building | Overworld village landmark / Interactive building | Entity Overlay (Y-sorted Layer 3) |
| **tavern_inn_blue_roof_2story** | `buildings/residences/tavern_inn_blue_roof_2story.png` | 190×200 | 12×13 tiles (190×200 px) | Yes (Alpha Cutout) | Static illustration / Building | Overworld village landmark / Interactive building | Entity Overlay (Y-sorted Layer 3) |
| **cottage_thatch_roof_garden** | `buildings/residences/cottage_thatch_roof_garden.png` | 155×145 | 10×10 tiles (155×145 px) | Yes (Alpha Cutout) | Static illustration / Building | Overworld village landmark / Interactive building | Entity Overlay (Y-sorted Layer 3) |
| **hut_water_stilt_fisher** | `buildings/residences/hut_water_stilt_fisher.png` | 145×170 | 10×11 tiles (145×170 px) | Yes (Alpha Cutout) | Static illustration / Building | Overworld village landmark / Interactive building | Entity Overlay (Y-sorted Layer 3) |
| **cottage_green_roof_artisan** | `buildings/residences/cottage_green_roof_artisan.png` | 175×180 | 11×12 tiles (175×180 px) | Yes (Alpha Cutout) | Static illustration / Building | Overworld village landmark / Interactive building | Entity Overlay (Y-sorted Layer 3) |
| **manor_fortified_watchtower_red** | `buildings/residences/manor_fortified_watchtower_red.png` | 170×210 | 11×14 tiles (170×210 px) | Yes (Alpha Cutout) | Static illustration / Building | Overworld village landmark / Interactive building | Entity Overlay (Y-sorted Layer 3) |

### Category: `buildings/utilities` (7 Assets)

| Asset Name | Relative Path | Dimensions | Tile Footprint | Alpha | Animation | Recommended Use | Compatibility |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **stall_festival_market_red_striped** | `buildings/utilities/stall_festival_market_red_striped.png` | 148×160 | 10×10 tiles (148×160 px) | Yes (Alpha Cutout) | Static illustration / Building | Overworld village landmark / Interactive building | Entity Overlay (Y-sorted Layer 3) |
| **stall_general_store_blue_striped** | `buildings/utilities/stall_general_store_blue_striped.png` | 135×152 | 9×10 tiles (135×152 px) | Yes (Alpha Cutout) | Static illustration / Building | Overworld village landmark / Interactive building | Entity Overlay (Y-sorted Layer 3) |
| **barn_timber_crop_storage** | `buildings/utilities/barn_timber_crop_storage.png` | 130×180 | 9×12 tiles (130×180 px) | Yes (Alpha Cutout) | Static illustration / Building | Overworld village landmark / Interactive building | Entity Overlay (Y-sorted Layer 3) |
| **stable_thatch_weathercock** | `buildings/utilities/stable_thatch_weathercock.png` | 170×190 | 11×12 tiles (170×190 px) | Yes (Alpha Cutout) | Static illustration / Building | Overworld village landmark / Interactive building | Entity Overlay (Y-sorted Layer 3) |
| **well_covered_stone_bucket** | `buildings/utilities/well_covered_stone_bucket.png` | 100×152 | 7×10 tiles (100×152 px) | Yes (Alpha Cutout) | Static illustration / Building | Overworld village landmark / Interactive building | Entity Overlay (Y-sorted Layer 3) |
| **windmill_stone_masonry_sails** | `buildings/utilities/windmill_stone_masonry_sails.png` | 120×235 | 8×15 tiles (120×235 px) | Yes (Alpha Cutout) | Static illustration / Building | Overworld village landmark / Interactive building | Entity Overlay (Y-sorted Layer 3) |
| **watermill_sawmill_wheel_stream** | `buildings/utilities/watermill_sawmill_wheel_stream.png` | 165×205 | 11×13 tiles (165×205 px) | Yes (Alpha Cutout) | Static illustration / Building | Overworld village landmark / Interactive building | Entity Overlay (Y-sorted Layer 3) |

### Category: `characters/hero` (12 Assets)

| Asset Name | Relative Path | Dimensions | Tile Footprint | Alpha | Animation | Recommended Use | Compatibility |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **hero_idle_south_strip** | `characters/hero/hero_idle_south_strip.png` | 486×64 | 31×4 tiles (486×64 px) | Yes (Native RGBA) | 9 frames @ 54×64 px (South (Down) - Idle pose) | Player character sprite & dynamic walk/action animator | Character Spritesheet Grid (54×64 frame cell) |
| **hero_walk_south_strip** | `characters/hero/hero_walk_south_strip.png` | 540×64 | 34×4 tiles (540×64 px) | Yes (Native RGBA) | 10 frames @ 54×64 px (South (Down) - Walk cycle) | Player character sprite & dynamic walk/action animator | Character Spritesheet Grid (54×64 frame cell) |
| **hero_action_south_tool_swing** | `characters/hero/hero_action_south_tool_swing.png` | 432×64 | 27×4 tiles (432×64 px) | Yes (Native RGBA) | 8 frames @ 54×64 px (South (Down) - Tool swing / Action) | Player character sprite & dynamic walk/action animator | Character Spritesheet Grid (54×64 frame cell) |
| **hero_action_south_item_hold** | `characters/hero/hero_action_south_item_hold.png` | 432×64 | 27×4 tiles (432×64 px) | Yes (Native RGBA) | 8 frames @ 54×64 px (South (Down) - Item hold / Carry) | Player character sprite & dynamic walk/action animator | Character Spritesheet Grid (54×64 frame cell) |
| **hero_idle_east_strip** | `characters/hero/hero_idle_east_strip.png` | 486×64 | 31×4 tiles (486×64 px) | Yes (Native RGBA) | 9 frames @ 54×64 px (East (Right) - Idle pose) | Player character sprite & dynamic walk/action animator | Character Spritesheet Grid (54×64 frame cell) |
| **hero_walk_east_strip** | `characters/hero/hero_walk_east_strip.png` | 540×64 | 34×4 tiles (540×64 px) | Yes (Native RGBA) | 10 frames @ 54×64 px (East (Right) - Walk cycle) | Player character sprite & dynamic walk/action animator | Character Spritesheet Grid (54×64 frame cell) |
| **hero_action_east_tool_swing** | `characters/hero/hero_action_east_tool_swing.png` | 432×64 | 27×4 tiles (432×64 px) | Yes (Native RGBA) | 8 frames @ 54×64 px (East (Right) - Tool swing / Action) | Player character sprite & dynamic walk/action animator | Character Spritesheet Grid (54×64 frame cell) |
| **hero_action_east_item_hold** | `characters/hero/hero_action_east_item_hold.png` | 432×64 | 27×4 tiles (432×64 px) | Yes (Native RGBA) | 8 frames @ 54×64 px (East (Right) - Item hold / Carry) | Player character sprite & dynamic walk/action animator | Character Spritesheet Grid (54×64 frame cell) |
| **hero_idle_north_strip** | `characters/hero/hero_idle_north_strip.png` | 486×64 | 31×4 tiles (486×64 px) | Yes (Native RGBA) | 9 frames @ 54×64 px (North (Up) - Idle pose) | Player character sprite & dynamic walk/action animator | Character Spritesheet Grid (54×64 frame cell) |
| **hero_walk_north_strip** | `characters/hero/hero_walk_north_strip.png` | 540×64 | 34×4 tiles (540×64 px) | Yes (Native RGBA) | 10 frames @ 54×64 px (North (Up) - Walk cycle) | Player character sprite & dynamic walk/action animator | Character Spritesheet Grid (54×64 frame cell) |
| **hero_action_north_tool_swing** | `characters/hero/hero_action_north_tool_swing.png` | 432×64 | 27×4 tiles (432×64 px) | Yes (Native RGBA) | 8 frames @ 54×64 px (North (Up) - Tool swing / Action) | Player character sprite & dynamic walk/action animator | Character Spritesheet Grid (54×64 frame cell) |
| **hero_action_north_item_hold** | `characters/hero/hero_action_north_item_hold.png` | 432×64 | 27×4 tiles (432×64 px) | Yes (Native RGBA) | 8 frames @ 54×64 px (North (Up) - Item hold / Carry) | Player character sprite & dynamic walk/action animator | Character Spritesheet Grid (54×64 frame cell) |

### Category: `nature/bushes` (7 Assets)

| Asset Name | Relative Path | Dimensions | Tile Footprint | Alpha | Animation | Recommended Use | Compatibility |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **bush_dense_round_emerald** | `nature/bushes/bush_dense_round_emerald.png` | 75×75 | 5×5 tiles (75×75 px) | Yes (Alpha Cutout) | Static sprite / Altar / Terrain | Environment prop / Terrain base | Entity Overlay (Y-sorted Layer 3 or Ground Layer 1) |
| **bush_flowering_white_blossoms** | `nature/bushes/bush_flowering_white_blossoms.png` | 55×75 | 4×5 tiles (55×75 px) | Yes (Alpha Cutout) | Static sprite / Altar / Terrain | Environment prop / Terrain base | Entity Overlay (Y-sorted Layer 3 or Ground Layer 1) |
| **plants_tall_reeds_wild_grass** | `nature/bushes/plants_tall_reeds_wild_grass.png` | 115×85 | 8×6 tiles (115×85 px) | Yes (Alpha Cutout) | Static sprite / Altar / Terrain | Environment prop / Terrain base | Entity Overlay (Y-sorted Layer 3 or Ground Layer 1) |
| **plants_leafy_fern_herbs** | `nature/bushes/plants_leafy_fern_herbs.png` | 50×60 | 4×4 tiles (50×60 px) | Yes (Alpha Cutout) | Static sprite / Altar / Terrain | Environment prop / Terrain base | Entity Overlay (Y-sorted Layer 3 or Ground Layer 1) |
| **bush_flowering_rose_hedge** | `nature/bushes/bush_flowering_rose_hedge.png` | 40×30 | 3×2 tiles (40×30 px) | Yes (Native RGBA) | Static sprite | Overworld woodland flora, tree canopy & natural obstacle | Native 16-bit Grid (Direct Drop-in) |
| **bush_dense_emerald_round_shrub** | `nature/bushes/bush_dense_emerald_round_shrub.png` | 45×30 | 3×2 tiles (45×30 px) | Yes (Native RGBA) | Static sprite | Overworld woodland flora, tree canopy & natural obstacle | Native 16-bit Grid (Direct Drop-in) |
| **bush_forest_undergrowth_canopy** | `nature/bushes/bush_forest_undergrowth_canopy.png` | 40×30 | 3×2 tiles (40×30 px) | Yes (Native RGBA) | Static sprite | Overworld woodland flora, tree canopy & natural obstacle | Native 16-bit Grid (Direct Drop-in) |

### Category: `nature/flowers` (2 Assets)

| Asset Name | Relative Path | Dimensions | Tile Footprint | Alpha | Animation | Recommended Use | Compatibility |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **flowers_wild_daisies_and_poppies** | `nature/flowers/flowers_wild_daisies_and_poppies.png` | 58×32 | 4×2 tiles (58×32 px) | Yes (Native RGBA) | Static sprite | Overworld woodland flora, tree canopy & natural obstacle | Native 16-bit Grid (Direct Drop-in) |
| **flowers_cattails_marsh_reeds** | `nature/flowers/flowers_cattails_marsh_reeds.png` | 58×32 | 4×2 tiles (58×32 px) | Yes (Native RGBA) | Static sprite | Overworld woodland flora, tree canopy & natural obstacle | Native 16-bit Grid (Direct Drop-in) |

### Category: `nature/logs` (6 Assets)

| Asset Name | Relative Path | Dimensions | Tile Footprint | Alpha | Animation | Recommended Use | Compatibility |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **tree_ancient_stump_spreading_roots** | `nature/logs/tree_ancient_stump_spreading_roots.png` | 100×80 | 7×5 tiles (100×80 px) | Yes (Alpha Cutout) | Static sprite / Altar / Terrain | Environment prop / Terrain base | Entity Overlay (Y-sorted Layer 3 or Ground Layer 1) |
| **stump_large_ancient_roots** | `nature/logs/stump_large_ancient_roots.png` | 30×25 | 2×2 tiles (30×25 px) | Yes (Native RGBA) | Static sprite | Overworld woodland flora, tree canopy & natural obstacle | Native 16-bit Grid (Direct Drop-in) |
| **stump_slender_cut_timber** | `nature/logs/stump_slender_cut_timber.png` | 18×22 | 2×2 tiles (18×22 px) | Yes (Native RGBA) | Static sprite | Overworld woodland flora, tree canopy & natural obstacle | Native 16-bit Grid (Direct Drop-in) |
| **log_fallen_hollow_weathered** | `nature/logs/log_fallen_hollow_weathered.png` | 30×22 | 2×2 tiles (30×22 px) | Yes (Native RGBA) | Static sprite | Overworld woodland flora, tree canopy & natural obstacle | Native 16-bit Grid (Direct Drop-in) |
| **log_fallen_mossy_vines** | `nature/logs/log_fallen_mossy_vines.png` | 32×22 | 2×2 tiles (32×22 px) | Yes (Native RGBA) | Static sprite | Overworld woodland flora, tree canopy & natural obstacle | Native 16-bit Grid (Direct Drop-in) |
| **twigs_kindling_firewood_sticks** | `nature/logs/twigs_kindling_firewood_sticks.png` | 45×22 | 3×2 tiles (45×22 px) | Yes (Native RGBA) | Static sprite | Overworld woodland flora, tree canopy & natural obstacle | Native 16-bit Grid (Direct Drop-in) |

### Category: `nature/mushrooms` (3 Assets)

| Asset Name | Relative Path | Dimensions | Tile Footprint | Alpha | Animation | Recommended Use | Compatibility |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **mushrooms_toadstool_trio_red_orange_blue** | `nature/mushrooms/mushrooms_toadstool_trio_red_orange_blue.png` | 140×70 | 9×5 tiles (140×70 px) | Yes (Alpha Cutout) | Static sprite / Altar / Terrain | Environment prop / Terrain base | Entity Overlay (Y-sorted Layer 3 or Ground Layer 1) |
| **mushrooms_amanita_red_spotted_cluster** | `nature/mushrooms/mushrooms_amanita_red_spotted_cluster.png` | 35×32 | 3×2 tiles (35×32 px) | Yes (Native RGBA) | Static sprite | Overworld woodland flora, tree canopy & natural obstacle | Native 16-bit Grid (Direct Drop-in) |
| **mushrooms_brown_chanterelle_harvest** | `nature/mushrooms/mushrooms_brown_chanterelle_harvest.png` | 35×32 | 3×2 tiles (35×32 px) | Yes (Native RGBA) | Static sprite | Overworld woodland flora, tree canopy & natural obstacle | Native 16-bit Grid (Direct Drop-in) |

### Category: `nature/rocks` (8 Assets)

| Asset Name | Relative Path | Dimensions | Tile Footprint | Alpha | Animation | Recommended Use | Compatibility |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **rock_granite_boulder_cluster** | `nature/rocks/rock_granite_boulder_cluster.png` | 105×95 | 7×6 tiles (105×95 px) | Yes (Alpha Cutout) | Static sprite / Altar / Terrain | Environment prop / Terrain base | Entity Overlay (Y-sorted Layer 3 or Ground Layer 1) |
| **rock_mossy_granite_mound** | `nature/rocks/rock_mossy_granite_mound.png` | 100×95 | 7×6 tiles (100×95 px) | Yes (Alpha Cutout) | Static sprite / Altar / Terrain | Environment prop / Terrain base | Entity Overlay (Y-sorted Layer 3 or Ground Layer 1) |
| **pebbles_river_stone_scatter** | `nature/rocks/pebbles_river_stone_scatter.png` | 115×85 | 8×6 tiles (115×85 px) | Yes (Alpha Cutout) | Static sprite / Altar / Terrain | Environment prop / Terrain base | Entity Overlay (Y-sorted Layer 3 or Ground Layer 1) |
| **boulder_granite_mossy_large** | `nature/rocks/boulder_granite_mossy_large.png` | 45×32 | 3×2 tiles (45×32 px) | Yes (Native RGBA) | Static sprite | Overworld woodland flora, tree canopy & natural obstacle | Native 16-bit Grid (Direct Drop-in) |
| **boulder_granite_tiered_medium** | `nature/rocks/boulder_granite_tiered_medium.png` | 38×32 | 3×2 tiles (38×32 px) | Yes (Native RGBA) | Static sprite | Overworld woodland flora, tree canopy & natural obstacle | Native 16-bit Grid (Direct Drop-in) |
| **rock_granite_rounded_small** | `nature/rocks/rock_granite_rounded_small.png` | 25×25 | 2×2 tiles (25×25 px) | Yes (Native RGBA) | Static sprite | Overworld woodland flora, tree canopy & natural obstacle | Native 16-bit Grid (Direct Drop-in) |
| **pebbles_gravel_scatter_stones** | `nature/rocks/pebbles_gravel_scatter_stones.png` | 45×25 | 3×2 tiles (45×25 px) | Yes (Native RGBA) | Static sprite | Overworld woodland flora, tree canopy & natural obstacle | Native 16-bit Grid (Direct Drop-in) |
| **rock_granite_flat_stepping_slab** | `nature/rocks/rock_granite_flat_stepping_slab.png` | 45×32 | 3×2 tiles (45×32 px) | Yes (Native RGBA) | Static sprite | Overworld woodland flora, tree canopy & natural obstacle | Native 16-bit Grid (Direct Drop-in) |

### Category: `nature/trees` (10 Assets)

| Asset Name | Relative Path | Dimensions | Tile Footprint | Alpha | Animation | Recommended Use | Compatibility |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **tree_young_sapling_foliage** | `nature/trees/tree_young_sapling_foliage.png` | 85×95 | 6×6 tiles (85×95 px) | Yes (Alpha Cutout) | Static sprite / Altar / Terrain | Environment prop / Terrain base | Entity Overlay (Y-sorted Layer 3 or Ground Layer 1) |
| **tree_leafy_round_oak_full** | `nature/trees/tree_leafy_round_oak_full.png` | 120×100 | 8×7 tiles (120×100 px) | Yes (Alpha Cutout) | Static sprite / Altar / Terrain | Environment prop / Terrain base | Entity Overlay (Y-sorted Layer 3 or Ground Layer 1) |
| **tree_broadleaf_oak_green** | `nature/trees/tree_broadleaf_oak_green.png` | 45×58 | 3×4 tiles (45×58 px) | Yes (Native RGBA) | Static sprite | Overworld woodland flora, tree canopy & natural obstacle | Native 16-bit Grid (Direct Drop-in) |
| **tree_birch_slender_canopy** | `nature/trees/tree_birch_slender_canopy.png` | 32×58 | 2×4 tiles (32×58 px) | Yes (Native RGBA) | Static sprite | Overworld woodland flora, tree canopy & natural obstacle | Native 16-bit Grid (Direct Drop-in) |
| **tree_tall_evergreen_pine** | `nature/trees/tree_tall_evergreen_pine.png` | 34×55 | 3×4 tiles (34×55 px) | Yes (Native RGBA) | Static sprite | Overworld woodland flora, tree canopy & natural obstacle | Native 16-bit Grid (Direct Drop-in) |
| **tree_conifer_spruce_slender** | `nature/trees/tree_conifer_spruce_slender.png` | 22×55 | 2×4 tiles (22×55 px) | Yes (Native RGBA) | Static sprite | Overworld woodland flora, tree canopy & natural obstacle | Native 16-bit Grid (Direct Drop-in) |
| **tree_round_deciduous_apple** | `nature/trees/tree_round_deciduous_apple.png` | 30×40 | 2×3 tiles (30×40 px) | Yes (Native RGBA) | Static sprite | Overworld woodland flora, tree canopy & natural obstacle | Native 16-bit Grid (Direct Drop-in) |
| **tree_dead_twisted_spooky_large** | `nature/trees/tree_dead_twisted_spooky_large.png` | 45×55 | 3×4 tiles (45×55 px) | Yes (Native RGBA) | Static sprite | Overworld woodland flora, tree canopy & natural obstacle | Native 16-bit Grid (Direct Drop-in) |
| **tree_dead_twisted_spooky_medium** | `nature/trees/tree_dead_twisted_spooky_medium.png` | 35×50 | 3×4 tiles (35×50 px) | Yes (Native RGBA) | Static sprite | Overworld woodland flora, tree canopy & natural obstacle | Native 16-bit Grid (Direct Drop-in) |
| **tree_dead_twisted_spooky_small** | `nature/trees/tree_dead_twisted_spooky_small.png` | 35×40 | 3×3 tiles (35×40 px) | Yes (Native RGBA) | Static sprite | Overworld woodland flora, tree canopy & natural obstacle | Native 16-bit Grid (Direct Drop-in) |

### Category: `structures/bridges` (3 Assets)

| Asset Name | Relative Path | Dimensions | Tile Footprint | Alpha | Animation | Recommended Use | Compatibility |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **bridge_wooden_arched_pond_lilypads** | `structures/bridges/bridge_wooden_arched_pond_lilypads.png` | 210×130 | 14×9 tiles (210×130 px) | Yes (Alpha Cutout) | Static illustration / Building | Overworld village landmark / Interactive building | Entity Overlay (Y-sorted Layer 3) |
| **dock_wooden_fishing_pier** | `structures/bridges/dock_wooden_fishing_pier.png` | 110×110 | 7×7 tiles (110×110 px) | Yes (Alpha Cutout) | Static illustration / Building | Overworld village landmark / Interactive building | Entity Overlay (Y-sorted Layer 3) |
| **bridge_wooden_rope_suspension** | `structures/bridges/bridge_wooden_rope_suspension.png` | 173×94 | 11×6 tiles (173×94 px) | Yes (Alpha Cutout) | Static sprite / Altar / Terrain | Environment prop / Terrain base | Entity Overlay (Y-sorted Layer 3 or Ground Layer 1) |

### Category: `structures/props` (13 Assets)

| Asset Name | Relative Path | Dimensions | Tile Footprint | Alpha | Animation | Recommended Use | Compatibility |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **fence_ranch_wood_segments** | `structures/props/fence_ranch_wood_segments.png` | 210×130 | 14×9 tiles (210×130 px) | Yes (Alpha Cutout) | Static illustration / Building | Overworld village landmark / Interactive building | Entity Overlay (Y-sorted Layer 3) |
| **signpost_and_bulletin_boards** | `structures/props/signpost_and_bulletin_boards.png` | 85×133 | 6×9 tiles (85×133 px) | Yes (Alpha Cutout) | Static illustration / Building | Overworld village landmark / Interactive building | Entity Overlay (Y-sorted Layer 3) |
| **lanterns_bracket_and_post_iron** | `structures/props/lanterns_bracket_and_post_iron.png` | 80×128 | 5×8 tiles (80×128 px) | Yes (Alpha Cutout) | Static illustration / Building | Overworld village landmark / Interactive building | Entity Overlay (Y-sorted Layer 3) |
| **banners_heraldic_red_and_blue** | `structures/props/banners_heraldic_red_and_blue.png` | 45×88 | 3×6 tiles (45×88 px) | Yes (Alpha Cutout) | Static illustration / Building | Overworld village landmark / Interactive building | Entity Overlay (Y-sorted Layer 3) |
| **archway_mossy_stone_entry** | `structures/props/archway_mossy_stone_entry.png` | 125×133 | 8×9 tiles (125×133 px) | Yes (Alpha Cutout) | Static illustration / Building | Overworld village landmark / Interactive building | Entity Overlay (Y-sorted Layer 3) |
| **crystal_cluster_blue_sapphire** | `structures/props/crystal_cluster_blue_sapphire.png` | 75×90 | 5×6 tiles (75×90 px) | Yes (Alpha Cutout) | Static sprite / Altar / Terrain | Environment prop / Terrain base | Entity Overlay (Y-sorted Layer 3 or Ground Layer 1) |
| **crystal_cluster_purple_amethyst** | `structures/props/crystal_cluster_purple_amethyst.png` | 60×95 | 4×6 tiles (60×95 px) | Yes (Alpha Cutout) | Static sprite / Altar / Terrain | Environment prop / Terrain base | Entity Overlay (Y-sorted Layer 3 or Ground Layer 1) |
| **pillar_ruined_stone_ivy_wrap** | `structures/props/pillar_ruined_stone_ivy_wrap.png` | 85×85 | 6×6 tiles (85×85 px) | Yes (Alpha Cutout) | Static sprite / Altar / Terrain | Environment prop / Terrain base | Entity Overlay (Y-sorted Layer 3 or Ground Layer 1) |
| **lantern_stone_pagoda_toro** | `structures/props/lantern_stone_pagoda_toro.png` | 65×85 | 5×6 tiles (65×85 px) | Yes (Alpha Cutout) | Static sprite / Altar / Terrain | Environment prop / Terrain base | Entity Overlay (Y-sorted Layer 3 or Ground Layer 1) |
| **chest_wooden_treasure_ornate** | `structures/props/chest_wooden_treasure_ornate.png` | 80×75 | 5×5 tiles (80×75 px) | Yes (Alpha Cutout) | Static sprite / Altar / Terrain | Environment prop / Terrain base | Entity Overlay (Y-sorted Layer 3 or Ground Layer 1) |
| **fence_ranch_wood_segment** | `structures/props/fence_ranch_wood_segment.png` | 115×75 | 8×5 tiles (115×75 px) | Yes (Alpha Cutout) | Static sprite / Altar / Terrain | Environment prop / Terrain base | Entity Overlay (Y-sorted Layer 3 or Ground Layer 1) |
| **signpost_wooden_crossroad_arrow** | `structures/props/signpost_wooden_crossroad_arrow.png` | 68×85 | 5×6 tiles (68×85 px) | Yes (Alpha Cutout) | Static sprite / Altar / Terrain | Environment prop / Terrain base | Entity Overlay (Y-sorted Layer 3 or Ground Layer 1) |
| **arch_ruined_mossy_stone_portal** | `structures/props/arch_ruined_mossy_stone_portal.png` | 140×105 | 9×7 tiles (140×105 px) | Yes (Alpha Cutout) | Static sprite / Altar / Terrain | Environment prop / Terrain base | Entity Overlay (Y-sorted Layer 3 or Ground Layer 1) |

### Category: `structures/shrines` (16 Assets)

| Asset Name | Relative Path | Dimensions | Tile Footprint | Alpha | Animation | Recommended Use | Compatibility |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **crystal_elemental_fire_flame** | `structures/shrines/crystal_elemental_fire_flame.png` | 95×98 | 6×7 tiles (95×98 px) | Yes (Alpha Cutout) | Static sprite / Altar / Terrain | Overworld mystery shrine / Chapter puzzle landmark | Entity Overlay (Y-sorted Layer 3 or Ground Layer 1) |
| **shrine_elemental_fire_altar_molten** | `structures/shrines/shrine_elemental_fire_altar_molten.png` | 100×145 | 7×10 tiles (100×145 px) | Yes (Alpha Cutout) | Static sprite / Altar / Terrain | Overworld mystery shrine / Chapter puzzle landmark | Entity Overlay (Y-sorted Layer 3 or Ground Layer 1) |
| **crystal_elemental_water_drop** | `structures/shrines/crystal_elemental_water_drop.png` | 90×98 | 6×7 tiles (90×98 px) | Yes (Alpha Cutout) | Static sprite / Altar / Terrain | Overworld mystery shrine / Chapter puzzle landmark | Entity Overlay (Y-sorted Layer 3 or Ground Layer 1) |
| **shrine_elemental_water_fountain_basin** | `structures/shrines/shrine_elemental_water_fountain_basin.png` | 100×145 | 7×10 tiles (100×145 px) | Yes (Alpha Cutout) | Static sprite / Altar / Terrain | Overworld mystery shrine / Chapter puzzle landmark | Entity Overlay (Y-sorted Layer 3 or Ground Layer 1) |
| **crystal_elemental_earth_monolith** | `structures/shrines/crystal_elemental_earth_monolith.png` | 85×98 | 6×7 tiles (85×98 px) | Yes (Alpha Cutout) | Static sprite / Altar / Terrain | Overworld mystery shrine / Chapter puzzle landmark | Entity Overlay (Y-sorted Layer 3 or Ground Layer 1) |
| **shrine_elemental_earth_pillar_altar** | `structures/shrines/shrine_elemental_earth_pillar_altar.png` | 105×145 | 7×10 tiles (105×145 px) | Yes (Alpha Cutout) | Static sprite / Altar / Terrain | Overworld mystery shrine / Chapter puzzle landmark | Entity Overlay (Y-sorted Layer 3 or Ground Layer 1) |
| **crystal_elemental_nature_emerald_leaf** | `structures/shrines/crystal_elemental_nature_emerald_leaf.png` | 95×98 | 6×7 tiles (95×98 px) | Yes (Alpha Cutout) | Static sprite / Altar / Terrain | Overworld mystery shrine / Chapter puzzle landmark | Entity Overlay (Y-sorted Layer 3 or Ground Layer 1) |
| **shrine_elemental_nature_overgrown_clover** | `structures/shrines/shrine_elemental_nature_overgrown_clover.png` | 105×145 | 7×10 tiles (105×145 px) | Yes (Alpha Cutout) | Static sprite / Altar / Terrain | Overworld mystery shrine / Chapter puzzle landmark | Entity Overlay (Y-sorted Layer 3 or Ground Layer 1) |
| **crystal_elemental_air_cyan_vortex** | `structures/shrines/crystal_elemental_air_cyan_vortex.png` | 90×98 | 6×7 tiles (90×98 px) | Yes (Alpha Cutout) | Static sprite / Altar / Terrain | Overworld mystery shrine / Chapter puzzle landmark | Entity Overlay (Y-sorted Layer 3 or Ground Layer 1) |
| **shrine_elemental_air_winged_wind_basin** | `structures/shrines/shrine_elemental_air_winged_wind_basin.png` | 105×145 | 7×10 tiles (105×145 px) | Yes (Alpha Cutout) | Static sprite / Altar / Terrain | Overworld mystery shrine / Chapter puzzle landmark | Entity Overlay (Y-sorted Layer 3 or Ground Layer 1) |
| **crystal_elemental_lightning_golden_bolt** | `structures/shrines/crystal_elemental_lightning_golden_bolt.png` | 95×98 | 6×7 tiles (95×98 px) | Yes (Alpha Cutout) | Static sprite / Altar / Terrain | Overworld mystery shrine / Chapter puzzle landmark | Entity Overlay (Y-sorted Layer 3 or Ground Layer 1) |
| **shrine_elemental_lightning_altar_sparks** | `structures/shrines/shrine_elemental_lightning_altar_sparks.png` | 105×145 | 7×10 tiles (105×145 px) | Yes (Alpha Cutout) | Static sprite / Altar / Terrain | Overworld mystery shrine / Chapter puzzle landmark | Entity Overlay (Y-sorted Layer 3 or Ground Layer 1) |
| **crystal_elemental_light_radiant_sun** | `structures/shrines/crystal_elemental_light_radiant_sun.png` | 95×98 | 6×7 tiles (95×98 px) | Yes (Alpha Cutout) | Static sprite / Altar / Terrain | Overworld mystery shrine / Chapter puzzle landmark | Entity Overlay (Y-sorted Layer 3 or Ground Layer 1) |
| **shrine_elemental_light_sunburst_portal** | `structures/shrines/shrine_elemental_light_sunburst_portal.png` | 110×145 | 7×10 tiles (110×145 px) | Yes (Alpha Cutout) | Static sprite / Altar / Terrain | Overworld mystery shrine / Chapter puzzle landmark | Entity Overlay (Y-sorted Layer 3 or Ground Layer 1) |
| **crystal_elemental_void_purple_nebula** | `structures/shrines/crystal_elemental_void_purple_nebula.png` | 100×98 | 7×7 tiles (100×98 px) | Yes (Alpha Cutout) | Static sprite / Altar / Terrain | Overworld mystery shrine / Chapter puzzle landmark | Entity Overlay (Y-sorted Layer 3 or Ground Layer 1) |
| **shrine_elemental_void_horned_demon_altar** | `structures/shrines/shrine_elemental_void_horned_demon_altar.png` | 115×145 | 8×10 tiles (115×145 px) | Yes (Alpha Cutout) | Static sprite / Altar / Terrain | Overworld mystery shrine / Chapter puzzle landmark | Entity Overlay (Y-sorted Layer 3 or Ground Layer 1) |

### Category: `tiles/autotiles` (12 Assets)

| Asset Name | Relative Path | Dimensions | Tile Footprint | Alpha | Animation | Recommended Use | Compatibility |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **autotile_grass_dirt_center** | `tiles/autotiles/autotile_grass_dirt_center.png` | 16×16 | 1×1 tiles (16×16 px) | Yes (Native RGBA) | Static tile | Overworld path autotiling & cliff wall elevation rendering | Native 16-bit Grid (Direct Drop-in) |
| **autotile_grass_dirt_top_edge** | `tiles/autotiles/autotile_grass_dirt_top_edge.png` | 16×16 | 1×1 tiles (16×16 px) | Yes (Native RGBA) | Static tile | Overworld path autotiling & cliff wall elevation rendering | Native 16-bit Grid (Direct Drop-in) |
| **autotile_grass_dirt_left_edge** | `tiles/autotiles/autotile_grass_dirt_left_edge.png` | 16×16 | 1×1 tiles (16×16 px) | Yes (Native RGBA) | Static tile | Overworld path autotiling & cliff wall elevation rendering | Native 16-bit Grid (Direct Drop-in) |
| **autotile_grass_dirt_right_edge** | `tiles/autotiles/autotile_grass_dirt_right_edge.png` | 16×16 | 1×1 tiles (16×16 px) | Yes (Native RGBA) | Static tile | Overworld path autotiling & cliff wall elevation rendering | Native 16-bit Grid (Direct Drop-in) |
| **autotile_grass_dirt_bottom_edge** | `tiles/autotiles/autotile_grass_dirt_bottom_edge.png` | 16×16 | 1×1 tiles (16×16 px) | Yes (Native RGBA) | Static tile | Overworld path autotiling & cliff wall elevation rendering | Native 16-bit Grid (Direct Drop-in) |
| **autotile_grass_dirt_corner_topleft** | `tiles/autotiles/autotile_grass_dirt_corner_topleft.png` | 16×16 | 1×1 tiles (16×16 px) | Yes (Native RGBA) | Static tile | Overworld path autotiling & cliff wall elevation rendering | Native 16-bit Grid (Direct Drop-in) |
| **autotile_grass_dirt_corner_topright** | `tiles/autotiles/autotile_grass_dirt_corner_topright.png` | 16×16 | 1×1 tiles (16×16 px) | Yes (Native RGBA) | Static tile | Overworld path autotiling & cliff wall elevation rendering | Native 16-bit Grid (Direct Drop-in) |
| **autotile_grass_dirt_corner_bottomleft** | `tiles/autotiles/autotile_grass_dirt_corner_bottomleft.png` | 16×16 | 1×1 tiles (16×16 px) | Yes (Native RGBA) | Static tile | Overworld path autotiling & cliff wall elevation rendering | Native 16-bit Grid (Direct Drop-in) |
| **autotile_grass_dirt_corner_bottomright** | `tiles/autotiles/autotile_grass_dirt_corner_bottomright.png` | 16×16 | 1×1 tiles (16×16 px) | Yes (Native RGBA) | Static tile | Overworld path autotiling & cliff wall elevation rendering | Native 16-bit Grid (Direct Drop-in) |
| **cliff_wall_top_grass_edge** | `tiles/autotiles/cliff_wall_top_grass_edge.png` | 48×32 | 3×2 tiles (48×32 px) | Yes (Native RGBA) | Static tile | Overworld path autotiling & cliff wall elevation rendering | Native 16-bit Grid (Direct Drop-in) |
| **cliff_wall_vertical_rock_face** | `tiles/autotiles/cliff_wall_vertical_rock_face.png` | 48×48 | 3×3 tiles (48×48 px) | Yes (Native RGBA) | Static tile | Overworld path autotiling & cliff wall elevation rendering | Native 16-bit Grid (Direct Drop-in) |
| **cliff_wall_bottom_ground_skirt** | `tiles/autotiles/cliff_wall_bottom_ground_skirt.png` | 48×32 | 3×2 tiles (48×32 px) | Yes (Native RGBA) | Static tile | Overworld path autotiling & cliff wall elevation rendering | Native 16-bit Grid (Direct Drop-in) |

### Category: `tiles/terrains` (15 Assets)

| Asset Name | Relative Path | Dimensions | Tile Footprint | Alpha | Animation | Recommended Use | Compatibility |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **tile_lush_meadow_grass** | `tiles/terrains/tile_lush_meadow_grass.png` | 92×94 | 6×6 tiles (92×94 px) | Yes (Alpha Cutout) | Static sprite / Altar / Terrain | Environment prop / Terrain base | Entity Overlay (Y-sorted Layer 3 or Ground Layer 1) |
| **tile_dirt_packed_earth** | `tiles/terrains/tile_dirt_packed_earth.png` | 93×94 | 6×6 tiles (93×94 px) | Yes (Alpha Cutout) | Static sprite / Altar / Terrain | Environment prop / Terrain base | Entity Overlay (Y-sorted Layer 3 or Ground Layer 1) |
| **tile_cobblestone_square_paved** | `tiles/terrains/tile_cobblestone_square_paved.png` | 93×94 | 6×6 tiles (93×94 px) | Yes (Alpha Cutout) | Static sprite / Altar / Terrain | Environment prop / Terrain base | Entity Overlay (Y-sorted Layer 3 or Ground Layer 1) |
| **tile_overgrown_flagstone_moss** | `tiles/terrains/tile_overgrown_flagstone_moss.png` | 94×94 | 6×6 tiles (94×94 px) | Yes (Alpha Cutout) | Static sprite / Altar / Terrain | Environment prop / Terrain base | Entity Overlay (Y-sorted Layer 3 or Ground Layer 1) |
| **tile_desert_dune_sand** | `tiles/terrains/tile_desert_dune_sand.png` | 94×94 | 6×6 tiles (94×94 px) | Yes (Alpha Cutout) | Static sprite / Altar / Terrain | Environment prop / Terrain base | Entity Overlay (Y-sorted Layer 3 or Ground Layer 1) |
| **tile_ocean_water_caustics** | `tiles/terrains/tile_ocean_water_caustics.png` | 96×94 | 6×6 tiles (96×94 px) | Yes (Alpha Cutout) | Static sprite / Altar / Terrain | Environment prop / Terrain base | Entity Overlay (Y-sorted Layer 3 or Ground Layer 1) |
| **tile_marsh_swamp_lily_pool** | `tiles/terrains/tile_marsh_swamp_lily_pool.png` | 94×93 | 6×6 tiles (94×93 px) | Yes (Alpha Cutout) | Static sprite / Altar / Terrain | Environment prop / Terrain base | Entity Overlay (Y-sorted Layer 3 or Ground Layer 1) |
| **tile_magma_lava_crust** | `tiles/terrains/tile_magma_lava_crust.png` | 95×94 | 6×6 tiles (95×94 px) | Yes (Alpha Cutout) | Static sprite / Altar / Terrain | Environment prop / Terrain base | Entity Overlay (Y-sorted Layer 3 or Ground Layer 1) |
| **tile_cracked_dry_clay** | `tiles/terrains/tile_cracked_dry_clay.png` | 93×93 | 6×6 tiles (93×93 px) | Yes (Alpha Cutout) | Static sprite / Altar / Terrain | Environment prop / Terrain base | Entity Overlay (Y-sorted Layer 3 or Ground Layer 1) |
| **cliff_plateau_facade_wide** | `tiles/terrains/cliff_plateau_facade_wide.png` | 170×98 | 11×7 tiles (170×98 px) | Yes (Alpha Cutout) | Static sprite / Altar / Terrain | Environment prop / Terrain base | Entity Overlay (Y-sorted Layer 3 or Ground Layer 1) |
| **cliff_plateau_concave_wall** | `tiles/terrains/cliff_plateau_concave_wall.png` | 103×97 | 7×7 tiles (103×97 px) | Yes (Alpha Cutout) | Static sprite / Altar / Terrain | Environment prop / Terrain base | Entity Overlay (Y-sorted Layer 3 or Ground Layer 1) |
| **cliff_corner_ledge_step** | `tiles/terrains/cliff_corner_ledge_step.png` | 82×101 | 6×7 tiles (82×101 px) | Yes (Alpha Cutout) | Static sprite / Altar / Terrain | Environment prop / Terrain base | Entity Overlay (Y-sorted Layer 3 or Ground Layer 1) |
| **cliff_sloped_overhang_wall** | `tiles/terrains/cliff_sloped_overhang_wall.png` | 98×99 | 7×7 tiles (98×99 px) | Yes (Alpha Cutout) | Static sprite / Altar / Terrain | Environment prop / Terrain base | Entity Overlay (Y-sorted Layer 3 or Ground Layer 1) |
| **cliff_terraced_steps** | `tiles/terrains/cliff_terraced_steps.png` | 91×100 | 6×7 tiles (91×100 px) | Yes (Alpha Cutout) | Static sprite / Altar / Terrain | Environment prop / Terrain base | Entity Overlay (Y-sorted Layer 3 or Ground Layer 1) |
| **stone_paving_patio_slabs** | `tiles/terrains/stone_paving_patio_slabs.png` | 112×93 | 7×6 tiles (112×93 px) | Yes (Alpha Cutout) | Static sprite / Altar / Terrain | Environment prop / Terrain base | Entity Overlay (Y-sorted Layer 3 or Ground Layer 1) |

---

## 4. Technical Compatibility & Integration Strategy

### 1. Tile Dimensions & Grid Scaling
- The game's native tile size is **16 × 16 pixels**.
- `sheet_16x16_autotiles_and_cliffs.png` is an exact 16×16 grid (17×11 tiles) and is 100% compatible for direct procedural road, path, and cliff elevation autotiling.
- `sheet_16bit_nature_trees_and_foliage.png` is authentic 16-bit pixel art with exact tile-aligned bounding boxes.
- Large architectural buildings and elemental altars are rendered as multi-tile entity overlays sorted dynamically by foot Y coordinate on Layer 3.

### 2. Multi-Layer Rendering Architecture
- **Layer 1 (Ground & Terrain):** 16×16 grass, dirt autotiles, water ponds, and cliff walls.
- **Layer 2 (Footbridge & Fences):** Arched pond bridge at `tx: 32, ty: 42..45` and wooden ranch fences.
- **Layer 3 (Y-Sorted Entities & Buildings):** Residences, Watermill, Windmill, Shrines, Character (Hero Pip), Trees, and Boulders.
- **Layer 4 (Atmosphere, Weather & Floating UI):** Lantern glow, water ripples, floating quest markers, and interaction prompts.
