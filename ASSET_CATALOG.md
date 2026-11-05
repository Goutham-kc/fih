# PIXEL VALLEY — ASSET CATALOG & INVENTORY AUDIT

> **Date:** November 2026  
> **Status:** Completed Asset Library Audit & Preparation  
> **Total Categorized Assets:** 257  
> **Native Tile Resolution:** 16 × 16 pixels (Nearest-Neighbor Integer Scaling)

---

## 1. Executive Summary & Audit Overview

A complete audit, extraction, classification, and technical inspection was performed on all supplied pixel art sheets and standalone building illustrations. Every individual sprite was extracted, categorized, verified for dimensions, transparency, tile footprint, and compatibility with Pixel Valley's 64×64 overworld engine.

### Asset Breakdown by Primary Domain:
| Category Domain | Subdirectories Included | Asset Count |
| :--- | :--- | :--- |
| **Tiles (`public/assets/tiles/`)** | Grass, Dirt, Stone, Water, Transitions, Roads | 50 |
| **Nature (`public/assets/nature/`)** | Trees, Bushes, Flowers, Mushrooms, Rocks, Logs | 82 |
| **Buildings (`public/assets/buildings/`)** | Farmstead, Bank, Bell Tower, Archive, Toolshed, Festival, Cinema, Sky Post, Plaza | 37 |
| **Structures (`public/assets/structures/`)** | Fences, Walls, Bridges, Signs, Lamps | 19 |
| **Props (`public/assets/props/`)** | Furniture, Village, Fantasy, Decorations | 59 |
| **Animations (`public/assets/animations/`)** | Water, Lighting, Nature, Effects | 10 |
| **Total Production Assets** | *All 34 specialized subdirectories* | **257** |

---

## 2. Source Sheets & Coordinate Mapping

Original raw sheets are preserved under `public/assets/raw_sheets/`:

### Sheet 1: `sheet_tileset_overview.png` (680 × 409 px, RGBA)
Contains 96 individual 40×40 px ground tiles arranged across 16 columns × 6 rows:
- **Columns (X Starts):** 5, 46, 88, 130, 172, 213, 256, 298, 340, 381, 424, 466, 508, 550, 591, 635
- **Row 0 (Y: 82..122):** Vibrant grass variations, light cobblestone, wooden decking planks, cliff ledges, pine tops.
- **Row 1 (Y: 125..179):** Dark cobblestone, short grass, flagstone roads, wooden boardwalks, gravel trails, tree trunks.
- **Row 2 (Y: 183..222):** Tilled farm soil, stone paver tiles, packed dirt, rock accents, crop sprouts, shrubs, desert sands, rune stone, water cask.
- **Row 3 (Y: 225..264):** Ornamental hedge, stone pillar pedestals, river boulders, clay urns, deep ocean water, shoreline waves, wood perches.
- **Row 4 (Y: 267..306):** Root loam, textured cobble, dense ferns, wild blossoms, river stones, closed treasure chests, stepping stones, brick walls.
- **Row 5 (Y: 309..347):** Layered earth mounds, stream flow tiles, lush shrubs, stone well basins, foliage tufts, jewel & royal treasure chests.

### Sheet 2: `sheet_nature_trees.jpg` (1024 × 1024 px, RGB)
- Giant Ancient Oak: `left: 24, top: 260, width: 385, height: 420`
- Tall Pine Conifer: `left: 395, top: 310, width: 200, height: 320`
- Slender Spruce Pine: `left: 565, top: 355, width: 110, height: 275`
- Round Oak Deciduous: `left: 360, top: 550, width: 285, height: 350`
- Pink Sakura Cherry Blossom: `left: 650, top: 545, width: 315, height: 360`
- Bright Canopy Tree: `left: 655, top: 290, width: 320, height: 270`
- Saplings, hollow stumps, winter bare trees, and 15+ miniature topiary shrubs.

### Sheet 3: `sheet_village_buildings.jpg` (816 × 624 px, RGB)
- Whispering Pines Inn & Tavern: `left: 0, top: 0, width: 285, height: 240`
- Festival Market Canopy Stall: `left: 430, top: 75, width: 150, height: 125`
- Blue-Roof Village Cottage: `left: 45, top: 340, width: 195, height: 280`
- Lavender-Roof Village Cottage: `left: 575, top: 250, width: 200, height: 360`
- Village Wooden Bulletin Board: `left: 435, top: 400, width: 95, height: 90`
- Citrus Fruit Tree & Metal Street Lamps.

### Sheet 4: `sheet_props_decorations.jpg` (1024 × 682 px, RGB)
- Wells (crank with roof, open stone cistern), Two-wheel Farm Handcart.
- Oak Barrels (3 sizes), Wooden Crates (tall cargo, stacked, single box).
- Burlap Grain Sacks (3 sizes), Garden Benches (slatted with backrest, rustic log plank).
- Timber Bracket Street Lantern, Portable Iron Oil Lantern, Directional Signs.
- Chopping blocks, water wash tubs, daisy & tulip planter boxes, haystacks, pitchforks.
- Poppy, sunflower, daisy, and marigold flower patches; river rocks and split-rail fences.

### Sheet 5: `sheet_water_vfx.png` (512 × 385 px, RGBA)
- 4-Frame Water Caustics Animation Strip: `left: 0, top: 320, width: 64, height: 16`
- Vertical Waterfall Cascade Strip: `left: 448, top: 0, width: 48, height: 384`
- Emerald Lily Pads & Lotus Blossom Flowers: `left: 200..268, top: 10..42`
- Shoreline Cattails & Reeds: `left: 200, top: 80, width: 64, height: 80`
- Submerged Mossy Water Rocks: `left: 192, top: 192, width: 64, height: 64`
- Concentric Water Ripple Depressions: `left: 0, top: 96, width: 64, height: 64`
- Shoreline Pulsing White Wave Foam: `left: 256, top: 320, width: 96, height: 64`

---

## 3. Visual Contact Sheet Previews

All 7 visual contact sheets were generated preserving original pixel art and saved to `public/assets/previews/`:

1. **Ground Tiles:** [`preview_1_ground_tiles.png`](file:///c:/Users/gouth/Projects/fih/public/assets/previews/preview_1_ground_tiles.png) (34 tiles)
2. **Trees & Vegetation:** [`preview_2_trees_vegetation.png`](file:///c:/Users/gouth/Projects/fih/public/assets/previews/preview_2_trees_vegetation.png) (64 assets)
3. **Village Buildings & Landmarks:** [`preview_3_buildings.png`](file:///c:/Users/gouth/Projects/fih/public/assets/previews/preview_3_buildings.png) (27 buildings & landmarks)
4. **Roads & Terrain Transitions:** [`preview_4_roads_transitions.png`](file:///c:/Users/gouth/Projects/fih/public/assets/previews/preview_4_roads_transitions.png) (11 road & edge assets)
5. **Water, Lilypads & Footbridges:** [`preview_5_water_bridges.png`](file:///c:/Users/gouth/Projects/fih/public/assets/previews/preview_5_water_bridges.png) (9 water & bridge assets)
6. **Decorative Objects:** [`preview_6_decorative_objects.png`](file:///c:/Users/gouth/Projects/fih/public/assets/previews/preview_6_decorative_objects.png) (52 props, fences, lamps & furniture)
7. **Animation Assets:** [`preview_7_animation_assets.png`](file:///c:/Users/gouth/Projects/fih/public/assets/previews/preview_7_animation_assets.png) (10 animated strips & particles)

---

## 4. Comprehensive Asset Registry


### Category: `animations/effects` (1 Assets)

| Asset Name | Relative Path | Dimensions | Tile Footprint | Alpha | Animation | Recommended Use | Compatibility |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **water_shoreline_foam_pulse** | `animations/effects/water_shoreline_foam_pulse.png` | 96×64 | 6×4 tiles (96×64 px) | Yes | 2-frame pulse loop | Shoreline wave foam pulse and doorway gleams | Native 16-bit Grid (Direct Drop-in) |

### Category: `animations/lighting` (2 Assets)

| Asset Name | Relative Path | Dimensions | Tile Footprint | Alpha | Animation | Recommended Use | Compatibility |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **lantern_oil_flame** | `animations/lighting/lantern_oil_flame.png` | 14×18 | 1×1 tiles (14×18 px) | Yes | Dual-harmonic radial flicker (±12% radius pulse) | Ambient flame flickering halos and particle motes | Multi-tile Prop (Y-Sorted at Foot) |
| **street_lamp_glow** | `animations/lighting/street_lamp_glow.png` | 22×34 | 1×2 tiles (22×34 px) | Yes | Dual-harmonic radial flicker (±12% radius pulse) | Ambient flame flickering halos and particle motes | Multi-tile Prop (Y-Sorted at Foot) |

### Category: `animations/nature` (4 Assets)

| Asset Name | Relative Path | Dimensions | Tile Footprint | Alpha | Animation | Recommended Use | Compatibility |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **lilypad_emerald** | `animations/nature/lilypad_emerald.png` | 18×18 | 1×1 tiles (18×18 px) | Yes | Procedural vertical float (sinusoidal bob, 1.5px amplitude) | Floating bobbing lily pads and drifting petals | Multi-tile Prop (Y-Sorted at Foot) |
| **lilypad_pink_lotus** | `animations/nature/lilypad_pink_lotus.png` | 18×18 | 1×1 tiles (18×18 px) | Yes | Procedural vertical float (sinusoidal bob, 1.5px amplitude) | Floating bobbing lily pads and drifting petals | Multi-tile Prop (Y-Sorted at Foot) |
| **water_lilypad_blossom_flower** | `animations/nature/water_lilypad_blossom_flower.png` | 32×32 | 2×2 tiles (32×32 px) | Yes | Procedural vertical float (sinusoidal bob, 1.5px amplitude) | Floating bobbing lily pads and drifting petals | Native 16-bit Grid (Direct Drop-in) |
| **water_lilypad_emerald_single** | `animations/nature/water_lilypad_emerald_single.png` | 32×32 | 2×2 tiles (32×32 px) | Yes | Procedural vertical float (sinusoidal bob, 1.5px amplitude) | Floating bobbing lily pads and drifting petals | Native 16-bit Grid (Direct Drop-in) |

### Category: `animations/water` (3 Assets)

| Asset Name | Relative Path | Dimensions | Tile Footprint | Alpha | Animation | Recommended Use | Compatibility |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **waterfall_cascade_flow_strip** | `animations/water/waterfall_cascade_flow_strip.png` | 48×384 | 3×24 tiles (48×384 px) | Yes | 3-frame vertical flow strip, ~8fps | Animated water caustics shimmer, waterfall flow | Native 16-bit Grid (Direct Drop-in) |
| **water_caustics_strip_4f** | `animations/water/water_caustics_strip_4f.png` | 64×16 | 4×1 tiles (64×16 px) | Yes | 4-frame horizontal strip (16×16 per frame), ~10fps | Animated water caustics shimmer, waterfall flow | Native 16-bit Grid (Direct Drop-in) |
| **water_ripples_concentric_depression** | `animations/water/water_ripples_concentric_depression.png` | 64×64 | 4×4 tiles (64×64 px) | Yes | Static sprite | Animated water caustics shimmer, waterfall flow | Native 16-bit Grid (Direct Drop-in) |

### Category: `buildings` (10 Assets)

| Asset Name | Relative Path | Dimensions | Tile Footprint | Alpha | Animation | Recommended Use | Compatibility |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **archive_cellar** | `buildings/archive_cellar.png` | 711×849 | 44×53 tiles (711×849 px) | Yes | Static sprite | Environmental decoration | Multi-tile Composite (Anchored at Foot) |
| **bank** | `buildings/bank.png` | 862×862 | 54×54 tiles (862×862 px) | Yes | Static sprite | Environmental decoration | Multi-tile Composite (Anchored at Foot) |
| **bell_tower** | `buildings/bell_tower.png` | 443×945 | 28×59 tiles (443×945 px) | Yes | Static sprite | Environmental decoration | Multi-tile Composite (Anchored at Foot) |
| **cottage_blue** | `buildings/cottage_blue.png` | 52×88 | 3×6 tiles (52×88 px) | Yes | Static sprite | Environmental decoration | Multi-tile Composite (Anchored at Foot) |
| **cottage_lavender** | `buildings/cottage_lavender.png` | 52×88 | 3×6 tiles (52×88 px) | Yes | Static sprite | Environmental decoration | Multi-tile Composite (Anchored at Foot) |
| **farmhouse** | `buildings/farmhouse.png` | 741×771 | 46×48 tiles (741×771 px) | Yes | Static sprite | Environmental decoration | Multi-tile Composite (Anchored at Foot) |
| **festival_grounds** | `buildings/festival_grounds.png` | 853×625 | 53×39 tiles (853×625 px) | Yes | Static sprite | Environmental decoration | Multi-tile Composite (Anchored at Foot) |
| **inn_tavern** | `buildings/inn_tavern.png` | 72×70 | 5×4 tiles (72×70 px) | Yes | Static sprite | Environmental decoration | Multi-tile Composite (Anchored at Foot) |
| **moonlight_cinema** | `buildings/moonlight_cinema.png` | 853×619 | 53×39 tiles (853×619 px) | Yes | Static sprite | Environmental decoration | Multi-tile Composite (Anchored at Foot) |
| **notice_board** | `buildings/notice_board.png` | 752×665 | 47×42 tiles (752×665 px) | Yes | Static sprite | Environmental decoration | Multi-tile Composite (Anchored at Foot) |

### Category: `buildings/archive` (1 Assets)

| Asset Name | Relative Path | Dimensions | Tile Footprint | Alpha | Animation | Recommended Use | Compatibility |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **archive_cellar_entrance** | `buildings/archive/archive_cellar_entrance.png` | 711×849 | 44×53 tiles (711×849 px) | Yes | Static sprite | Chapter 7 Archive Cellar location (Moss) | Multi-tile Composite (Anchored at Foot) |

### Category: `buildings/bank` (1 Assets)

| Asset Name | Relative Path | Dimensions | Tile Footprint | Alpha | Animation | Recommended Use | Compatibility |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **bank_facade** | `buildings/bank/bank_facade.png` | 862×862 | 54×54 tiles (862×862 px) | Yes | Static sprite | Chapter 2 Ledger Bank location (Bram) | Multi-tile Composite (Anchored at Foot) |

### Category: `buildings/bell_tower` (1 Assets)

| Asset Name | Relative Path | Dimensions | Tile Footprint | Alpha | Animation | Recommended Use | Compatibility |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **bell_tower_spire** | `buildings/bell_tower/bell_tower_spire.png` | 443×945 | 28×59 tiles (443×945 px) | Yes | Static sprite | Chapter 3 Bell Tower landmark (Hoot) | Multi-tile Composite (Anchored at Foot) |

### Category: `buildings/cinema` (1 Assets)

| Asset Name | Relative Path | Dimensions | Tile Footprint | Alpha | Animation | Recommended Use | Compatibility |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **moonlight_cinema_pavilion** | `buildings/cinema/moonlight_cinema_pavilion.png` | 853×619 | 53×39 tiles (853×619 px) | Yes | Static sprite | Chapter 6 Moonlight Cinema (Juniper) | Multi-tile Composite (Anchored at Foot) |

### Category: `buildings/farmstead` (5 Assets)

| Asset Name | Relative Path | Dimensions | Tile Footprint | Alpha | Animation | Recommended Use | Compatibility |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **farmhouse_cabin** | `buildings/farmstead/farmhouse_cabin.png` | 741×771 | 46×48 tiles (741×771 px) | Yes | Static sprite | Chapter 1 Farmstead location (Pip) | Multi-tile Composite (Anchored at Foot) |
| **farm_cart_two_wheel_wood** | `buildings/farmstead/farm_cart_two_wheel_wood.png` | 135×115 | 8×7 tiles (135×115 px) | No | Static sprite | Chapter 1 Farmstead location (Pip) | Multi-tile Composite (Anchored at Foot) |
| **haystack_golden_bale** | `buildings/farmstead/haystack_golden_bale.png` | 65×105 | 4×7 tiles (65×105 px) | No | Static sprite | Chapter 1 Farmstead location (Pip) | Multi-tile Composite (Anchored at Foot) |
| **hay_fork_pitchfork_iron** | `buildings/farmstead/hay_fork_pitchfork_iron.png` | 45×105 | 3×7 tiles (45×105 px) | No | Static sprite | Chapter 1 Farmstead location (Pip) | Multi-tile Composite (Anchored at Foot) |
| **well_stone_crank_roof** | `buildings/farmstead/well_stone_crank_roof.png` | 88×130 | 6×8 tiles (88×130 px) | No | Static sprite | Chapter 1 Farmstead location (Pip) | Multi-tile Composite (Anchored at Foot) |

### Category: `buildings/festival` (3 Assets)

| Asset Name | Relative Path | Dimensions | Tile Footprint | Alpha | Animation | Recommended Use | Compatibility |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **building_market_stall_canopy** | `buildings/festival/building_market_stall_canopy.png` | 150×125 | 9×8 tiles (150×125 px) | No | Static sprite | Chapter 5 Festival Grounds (Clover) | Multi-tile Composite (Anchored at Foot) |
| **festival_pavilion_stage** | `buildings/festival/festival_pavilion_stage.png` | 853×625 | 53×39 tiles (853×625 px) | Yes | Static sprite | Chapter 5 Festival Grounds (Clover) | Multi-tile Composite (Anchored at Foot) |
| **market_stall** | `buildings/festival/market_stall.png` | 42×36 | 3×2 tiles (42×36 px) | Yes | Static sprite | Chapter 5 Festival Grounds (Clover) | Multi-tile Composite (Anchored at Foot) |

### Category: `buildings/plaza` (9 Assets)

| Asset Name | Relative Path | Dimensions | Tile Footprint | Alpha | Animation | Recommended Use | Compatibility |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **building_cottage_blue_roof** | `buildings/plaza/building_cottage_blue_roof.png` | 195×280 | 12×18 tiles (195×280 px) | No | Static sprite | Central village clearing, notice board, and inn | Multi-tile Composite (Anchored at Foot) |
| **building_cottage_lavender_roof** | `buildings/plaza/building_cottage_lavender_roof.png` | 200×360 | 13×23 tiles (200×360 px) | No | Static sprite | Central village clearing, notice board, and inn | Multi-tile Composite (Anchored at Foot) |
| **building_inn_tavern** | `buildings/plaza/building_inn_tavern.png` | 285×240 | 18×15 tiles (285×240 px) | No | Static sprite | Central village clearing, notice board, and inn | Multi-tile Composite (Anchored at Foot) |
| **cottage_blue_residence** | `buildings/plaza/cottage_blue_residence.png` | 52×88 | 3×6 tiles (52×88 px) | Yes | Static sprite | Central village clearing, notice board, and inn | Multi-tile Composite (Anchored at Foot) |
| **cottage_lavender_residence** | `buildings/plaza/cottage_lavender_residence.png` | 52×88 | 3×6 tiles (52×88 px) | Yes | Static sprite | Central village clearing, notice board, and inn | Multi-tile Composite (Anchored at Foot) |
| **fountain_stone_central** | `buildings/plaza/fountain_stone_central.png` | 32×32 | 2×2 tiles (32×32 px) | Yes | Static sprite | Central village clearing, notice board, and inn | Native 16-bit Grid (Direct Drop-in) |
| **inn_tavern_whispering_pines** | `buildings/plaza/inn_tavern_whispering_pines.png` | 72×70 | 5×4 tiles (72×70 px) | Yes | Static sprite | Central village clearing, notice board, and inn | Multi-tile Composite (Anchored at Foot) |
| **notice_board_stand** | `buildings/plaza/notice_board_stand.png` | 752×665 | 47×42 tiles (752×665 px) | Yes | Static sprite | Central village clearing, notice board, and inn | Multi-tile Composite (Anchored at Foot) |
| **village_notice_board_wooden** | `buildings/plaza/village_notice_board_wooden.png` | 95×90 | 6×6 tiles (95×90 px) | No | Static sprite | Central village clearing, notice board, and inn | Multi-tile Composite (Anchored at Foot) |

### Category: `buildings/sky_post` (3 Assets)

| Asset Name | Relative Path | Dimensions | Tile Footprint | Alpha | Animation | Recommended Use | Compatibility |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **sky_post_directional_sign** | `buildings/sky_post/sky_post_directional_sign.png` | 65×105 | 4×7 tiles (65×105 px) | No | Static sprite | Sky Post courier perch (Wren) | Multi-tile Composite (Anchored at Foot) |
| **sky_post_poppy_bed** | `buildings/sky_post/sky_post_poppy_bed.png` | 16×16 | 1×1 tiles (16×16 px) | Yes | Static sprite | Sky Post courier perch (Wren) | Native 16-bit Grid (Direct Drop-in) |
| **sky_post_wooden_post** | `buildings/sky_post/sky_post_wooden_post.png` | 12×16 | 1×1 tiles (12×16 px) | Yes | Static sprite | Sky Post courier perch (Wren) | Multi-tile Composite (Anchored at Foot) |

### Category: `buildings/toolshed` (3 Assets)

| Asset Name | Relative Path | Dimensions | Tile Footprint | Alpha | Animation | Recommended Use | Compatibility |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **toolshed_anvil_base** | `buildings/toolshed/toolshed_anvil_base.png` | 20×14 | 1×1 tiles (20×14 px) | Yes | Static sprite | Chapter 8 Toolshed Workbench (Rowan) | Multi-tile Composite (Anchored at Foot) |
| **toolshed_chopping_block** | `buildings/toolshed/toolshed_chopping_block.png` | 22×20 | 1×1 tiles (22×20 px) | Yes | Static sprite | Chapter 8 Toolshed Workbench (Rowan) | Multi-tile Composite (Anchored at Foot) |
| **toolshed_tool_barrel** | `buildings/toolshed/toolshed_tool_barrel.png` | 24×18 | 2×1 tiles (24×18 px) | Yes | Static sprite | Chapter 8 Toolshed Workbench (Rowan) | Multi-tile Composite (Anchored at Foot) |

### Category: `nature/bushes` (23 Assets)

| Asset Name | Relative Path | Dimensions | Tile Footprint | Alpha | Animation | Recommended Use | Compatibility |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **bush_autumn_gold** | `nature/bushes/bush_autumn_gold.png` | 22×18 | 1×1 tiles (22×18 px) | Yes | Static sprite | Path borders, building landscaping, undergrowth | Multi-tile Prop (Y-Sorted at Foot) |
| **bush_berry_harvest_shrub** | `nature/bushes/bush_berry_harvest_shrub.png` | 55×50 | 3×3 tiles (55×50 px) | No | Static sprite | Path borders, building landscaping, undergrowth | Multi-tile Prop (Y-Sorted at Foot) |
| **bush_clover_double_canopy** | `nature/bushes/bush_clover_double_canopy.png` | 75×76 | 5×5 tiles (75×76 px) | No | Static sprite | Path borders, building landscaping, undergrowth | Multi-tile Prop (Y-Sorted at Foot) |
| **bush_compact_emerald** | `nature/bushes/bush_compact_emerald.png` | 75×76 | 5×5 tiles (75×76 px) | No | Static sprite | Path borders, building landscaping, undergrowth | Multi-tile Prop (Y-Sorted at Foot) |
| **bush_crimson_berry** | `nature/bushes/bush_crimson_berry.png` | 22×18 | 1×1 tiles (22×18 px) | Yes | Static sprite | Path borders, building landscaping, undergrowth | Multi-tile Prop (Y-Sorted at Foot) |
| **bush_dense_fern_cluster** | `nature/bushes/bush_dense_fern_cluster.png` | 40×39 | 3×2 tiles (40×39 px) | Yes | Static sprite | Path borders, building landscaping, undergrowth | Multi-tile Prop (Y-Sorted at Foot) |
| **bush_flowering_meadow_shrub** | `nature/bushes/bush_flowering_meadow_shrub.png` | 65×48 | 4×3 tiles (65×48 px) | No | Static sprite | Path borders, building landscaping, undergrowth | Multi-tile Prop (Y-Sorted at Foot) |
| **bush_flowering_rose** | `nature/bushes/bush_flowering_rose.png` | 24×18 | 2×1 tiles (24×18 px) | Yes | Static sprite | Path borders, building landscaping, undergrowth | Multi-tile Prop (Y-Sorted at Foot) |
| **bush_hedgerow_top_ornamental** | `nature/bushes/bush_hedgerow_top_ornamental.png` | 39×39 | 2×2 tiles (39×39 px) | Yes | Static sprite | Path borders, building landscaping, undergrowth | Multi-tile Prop (Y-Sorted at Foot) |
| **bush_round_dense_green** | `nature/bushes/bush_round_dense_green.png` | 75×65 | 5×4 tiles (75×65 px) | No | Static sprite | Path borders, building landscaping, undergrowth | Multi-tile Prop (Y-Sorted at Foot) |
| **bush_round_emerald** | `nature/bushes/bush_round_emerald.png` | 22×18 | 1×1 tiles (22×18 px) | Yes | Static sprite | Path borders, building landscaping, undergrowth | Multi-tile Prop (Y-Sorted at Foot) |
| **bush_round_hedgerow_green** | `nature/bushes/bush_round_hedgerow_green.png` | 60×52 | 4×3 tiles (60×52 px) | No | Static sprite | Path borders, building landscaping, undergrowth | Multi-tile Prop (Y-Sorted at Foot) |
| **bush_round_pine_shrub** | `nature/bushes/bush_round_pine_shrub.png` | 60×78 | 4×5 tiles (60×78 px) | No | Static sprite | Path borders, building landscaping, undergrowth | Multi-tile Prop (Y-Sorted at Foot) |
| **bush_round_shrub_lush** | `nature/bushes/bush_round_shrub_lush.png` | 41×38 | 3×2 tiles (41×38 px) | Yes | Static sprite | Path borders, building landscaping, undergrowth | Multi-tile Prop (Y-Sorted at Foot) |
| **bush_tiered_hedge** | `nature/bushes/bush_tiered_hedge.png` | 22×18 | 1×1 tiles (22×18 px) | Yes | Static sprite | Path borders, building landscaping, undergrowth | Multi-tile Prop (Y-Sorted at Foot) |
| **bush_triple_canopy_tree** | `nature/bushes/bush_triple_canopy_tree.png` | 85×80 | 5×5 tiles (85×80 px) | No | Static sprite | Path borders, building landscaping, undergrowth | Multi-tile Prop (Y-Sorted at Foot) |
| **cattails_reeds_shoreline** | `nature/bushes/cattails_reeds_shoreline.png` | 20×28 | 1×2 tiles (20×28 px) | Yes | Static sprite | Path borders, building landscaping, undergrowth | Multi-tile Prop (Y-Sorted at Foot) |
| **plant_broadleaf_greens_01** | `nature/bushes/plant_broadleaf_greens_01.png` | 39×39 | 2×2 tiles (39×39 px) | Yes | Static sprite | Path borders, building landscaping, undergrowth | Multi-tile Prop (Y-Sorted at Foot) |
| **plant_broadleaf_greens_02** | `nature/bushes/plant_broadleaf_greens_02.png` | 41×39 | 3×2 tiles (41×39 px) | Yes | Static sprite | Path borders, building landscaping, undergrowth | Multi-tile Prop (Y-Sorted at Foot) |
| **plant_jungle_reed_tuft** | `nature/bushes/plant_jungle_reed_tuft.png` | 60×45 | 4×3 tiles (60×45 px) | No | Static sprite | Path borders, building landscaping, undergrowth | Multi-tile Prop (Y-Sorted at Foot) |
| **plant_leafy_shrub_small** | `nature/bushes/plant_leafy_shrub_small.png` | 40×39 | 3×2 tiles (40×39 px) | Yes | Static sprite | Path borders, building landscaping, undergrowth | Multi-tile Prop (Y-Sorted at Foot) |
| **plant_tropical_fern_broadleaf** | `nature/bushes/plant_tropical_fern_broadleaf.png` | 58×45 | 4×3 tiles (58×45 px) | No | Static sprite | Path borders, building landscaping, undergrowth | Multi-tile Prop (Y-Sorted at Foot) |
| **water_cattails_reeds_cluster** | `nature/bushes/water_cattails_reeds_cluster.png` | 64×80 | 4×5 tiles (64×80 px) | Yes | Static sprite | Path borders, building landscaping, undergrowth | Native 16-bit Grid (Direct Drop-in) |

### Category: `nature/flowers` (13 Assets)

| Asset Name | Relative Path | Dimensions | Tile Footprint | Alpha | Animation | Recommended Use | Compatibility |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **crop_sprout_flowering_yellow** | `nature/flowers/crop_sprout_flowering_yellow.png` | 40×39 | 3×2 tiles (40×39 px) | Yes | Static sprite | Plaza flower beds, farm gardens, decorative planters | Multi-tile Prop (Y-Sorted at Foot) |
| **crop_sprout_green_young** | `nature/flowers/crop_sprout_green_young.png` | 41×39 | 3×2 tiles (41×39 px) | Yes | Static sprite | Plaza flower beds, farm gardens, decorative planters | Multi-tile Prop (Y-Sorted at Foot) |
| **flowers_wild_blossom_tuft** | `nature/flowers/flowers_wild_blossom_tuft.png` | 39×39 | 2×2 tiles (39×39 px) | Yes | Static sprite | Plaza flower beds, farm gardens, decorative planters | Multi-tile Prop (Y-Sorted at Foot) |
| **flower_cluster_poppy_red** | `nature/flowers/flower_cluster_poppy_red.png` | 45×55 | 3×3 tiles (45×55 px) | No | Static sprite | Plaza flower beds, farm gardens, decorative planters | Multi-tile Prop (Y-Sorted at Foot) |
| **flower_daisy_meadow** | `nature/flowers/flower_daisy_meadow.png` | 16×16 | 1×1 tiles (16×16 px) | Yes | Static sprite | Plaza flower beds, farm gardens, decorative planters | Native 16-bit Grid (Direct Drop-in) |
| **flower_daisy_meadow_cluster** | `nature/flowers/flower_daisy_meadow_cluster.png` | 38×50 | 2×3 tiles (38×50 px) | No | Static sprite | Plaza flower beds, farm gardens, decorative planters | Multi-tile Prop (Y-Sorted at Foot) |
| **flower_marigold_orange_patch** | `nature/flowers/flower_marigold_orange_patch.png` | 45×50 | 3×3 tiles (45×50 px) | No | Static sprite | Plaza flower beds, farm gardens, decorative planters | Multi-tile Prop (Y-Sorted at Foot) |
| **flower_poppy_red** | `nature/flowers/flower_poppy_red.png` | 16×16 | 1×1 tiles (16×16 px) | Yes | Static sprite | Plaza flower beds, farm gardens, decorative planters | Native 16-bit Grid (Direct Drop-in) |
| **flower_sunflower_garden** | `nature/flowers/flower_sunflower_garden.png` | 14×18 | 1×1 tiles (14×18 px) | Yes | Static sprite | Plaza flower beds, farm gardens, decorative planters | Multi-tile Prop (Y-Sorted at Foot) |
| **flower_sunflower_tall_stem** | `nature/flowers/flower_sunflower_tall_stem.png` | 30×50 | 2×3 tiles (30×50 px) | No | Static sprite | Plaza flower beds, farm gardens, decorative planters | Multi-tile Prop (Y-Sorted at Foot) |
| **planter_box_flowers_daisy** | `nature/flowers/planter_box_flowers_daisy.png` | 60×50 | 4×3 tiles (60×50 px) | No | Static sprite | Plaza flower beds, farm gardens, decorative planters | Multi-tile Prop (Y-Sorted at Foot) |
| **planter_box_flowers_tulip** | `nature/flowers/planter_box_flowers_tulip.png` | 65×58 | 4×4 tiles (65×58 px) | No | Static sprite | Plaza flower beds, farm gardens, decorative planters | Multi-tile Prop (Y-Sorted at Foot) |
| **plant_ivy_foliage_tuft** | `nature/flowers/plant_ivy_foliage_tuft.png` | 41×38 | 3×2 tiles (41×38 px) | Yes | Static sprite | Plaza flower beds, farm gardens, decorative planters | Multi-tile Prop (Y-Sorted at Foot) |

### Category: `nature/logs` (7 Assets)

| Asset Name | Relative Path | Dimensions | Tile Footprint | Alpha | Animation | Recommended Use | Compatibility |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **fallen_log_mossy** | `nature/logs/fallen_log_mossy.png` | 32×16 | 2×1 tiles (32×16 px) | Yes | Static sprite | Woodland obstacles, scenic seating, Toolshed yard | Native 16-bit Grid (Direct Drop-in) |
| **log_ancient_tree_stump_broad** | `nature/logs/log_ancient_tree_stump_broad.png` | 72×80 | 5×5 tiles (72×80 px) | No | Static sprite | Woodland obstacles, scenic seating, Toolshed yard | Multi-tile Prop (Y-Sorted at Foot) |
| **log_stump_ancient_hollow** | `nature/logs/log_stump_ancient_hollow.png` | 60×105 | 4×7 tiles (60×105 px) | No | Static sprite | Woodland obstacles, scenic seating, Toolshed yard | Multi-tile Prop (Y-Sorted at Foot) |
| **stump_ancient_woodland_roots** | `nature/logs/stump_ancient_woodland_roots.png` | 65×75 | 4×5 tiles (65×75 px) | No | Static sprite | Woodland obstacles, scenic seating, Toolshed yard | Multi-tile Prop (Y-Sorted at Foot) |
| **stump_chopping_block_stool** | `nature/logs/stump_chopping_block_stool.png` | 62×70 | 4×4 tiles (62×70 px) | No | Static sprite | Woodland obstacles, scenic seating, Toolshed yard | Multi-tile Prop (Y-Sorted at Foot) |
| **tree_branch_forked_perch** | `nature/logs/tree_branch_forked_perch.png` | 39×39 | 2×2 tiles (39×39 px) | Yes | Static sprite | Woodland obstacles, scenic seating, Toolshed yard | Multi-tile Prop (Y-Sorted at Foot) |
| **tree_stump_weathered** | `nature/logs/tree_stump_weathered.png` | 22×20 | 1×1 tiles (22×20 px) | Yes | Static sprite | Woodland obstacles, scenic seating, Toolshed yard | Multi-tile Prop (Y-Sorted at Foot) |

### Category: `nature/mushrooms` (2 Assets)

| Asset Name | Relative Path | Dimensions | Tile Footprint | Alpha | Animation | Recommended Use | Compatibility |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **mushrooms_amanita_red** | `nature/mushrooms/mushrooms_amanita_red.png` | 18×18 | 1×1 tiles (18×18 px) | Yes | Static sprite | Archive Cellar ancient grove, woodland pond perimeter | Multi-tile Prop (Y-Sorted at Foot) |
| **mushrooms_red_amanita** | `nature/mushrooms/mushrooms_red_amanita.png` | 18×18 | 1×1 tiles (18×18 px) | Yes | Static sprite | Archive Cellar ancient grove, woodland pond perimeter | Multi-tile Prop (Y-Sorted at Foot) |

### Category: `nature/rocks` (18 Assets)

| Asset Name | Relative Path | Dimensions | Tile Footprint | Alpha | Animation | Recommended Use | Compatibility |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **rock_boulder_flat_top** | `nature/rocks/rock_boulder_flat_top.png` | 40×39 | 3×2 tiles (40×39 px) | Yes | Static sprite | River banks, mossy borders, mountain ledges | Multi-tile Prop (Y-Sorted at Foot) |
| **rock_boulder_grey_stacked** | `nature/rocks/rock_boulder_grey_stacked.png` | 40×39 | 3×2 tiles (40×39 px) | Yes | Static sprite | River banks, mossy borders, mountain ledges | Multi-tile Prop (Y-Sorted at Foot) |
| **rock_boulder_grey_tall** | `nature/rocks/rock_boulder_grey_tall.png` | 41×39 | 3×2 tiles (41×39 px) | Yes | Static sprite | River banks, mossy borders, mountain ledges | Multi-tile Prop (Y-Sorted at Foot) |
| **rock_boulder_round_brown** | `nature/rocks/rock_boulder_round_brown.png` | 39×39 | 2×2 tiles (39×39 px) | Yes | Static sprite | River banks, mossy borders, mountain ledges | Multi-tile Prop (Y-Sorted at Foot) |
| **rock_boulder_smooth_river** | `nature/rocks/rock_boulder_smooth_river.png` | 41×39 | 3×2 tiles (41×39 px) | Yes | Static sprite | River banks, mossy borders, mountain ledges | Multi-tile Prop (Y-Sorted at Foot) |
| **rock_crag_angular_boulder** | `nature/rocks/rock_crag_angular_boulder.png` | 40×39 | 3×2 tiles (40×39 px) | Yes | Static sprite | River banks, mossy borders, mountain ledges | Multi-tile Prop (Y-Sorted at Foot) |
| **rock_grass_pebble_accent** | `nature/rocks/rock_grass_pebble_accent.png` | 39×39 | 2×2 tiles (39×39 px) | Yes | Static sprite | River banks, mossy borders, mountain ledges | Multi-tile Prop (Y-Sorted at Foot) |
| **rock_massive_grey_monolith** | `nature/rocks/rock_massive_grey_monolith.png` | 39×39 | 2×2 tiles (39×39 px) | Yes | Static sprite | River banks, mossy borders, mountain ledges | Multi-tile Prop (Y-Sorted at Foot) |
| **rock_mossy_cluster_boulder** | `nature/rocks/rock_mossy_cluster_boulder.png` | 60×50 | 4×3 tiles (60×50 px) | No | Static sprite | River banks, mossy borders, mountain ledges | Multi-tile Prop (Y-Sorted at Foot) |
| **rock_mossy_hillside_stone** | `nature/rocks/rock_mossy_hillside_stone.png` | 55×50 | 3×3 tiles (55×50 px) | No | Static sprite | River banks, mossy borders, mountain ledges | Multi-tile Prop (Y-Sorted at Foot) |
| **rock_moss_woodland** | `nature/rocks/rock_moss_woodland.png` | 24×20 | 2×1 tiles (24×20 px) | Yes | Static sprite | River banks, mossy borders, mountain ledges | Multi-tile Prop (Y-Sorted at Foot) |
| **rock_river_smooth_slate** | `nature/rocks/rock_river_smooth_slate.png` | 48×45 | 3×3 tiles (48×45 px) | No | Static sprite | River banks, mossy borders, mountain ledges | Multi-tile Prop (Y-Sorted at Foot) |
| **rock_slate_boulder** | `nature/rocks/rock_slate_boulder.png` | 20×14 | 1×1 tiles (20×14 px) | Yes | Static sprite | River banks, mossy borders, mountain ledges | Multi-tile Prop (Y-Sorted at Foot) |
| **rock_slate_stacked_steps** | `nature/rocks/rock_slate_stacked_steps.png` | 48×55 | 3×3 tiles (48×55 px) | No | Static sprite | River banks, mossy borders, mountain ledges | Multi-tile Prop (Y-Sorted at Foot) |
| **rock_stone_pillar_base_01** | `nature/rocks/rock_stone_pillar_base_01.png` | 40×39 | 3×2 tiles (40×39 px) | Yes | Static sprite | River banks, mossy borders, mountain ledges | Multi-tile Prop (Y-Sorted at Foot) |
| **rock_stone_pillar_base_02** | `nature/rocks/rock_stone_pillar_base_02.png` | 40×39 | 3×2 tiles (40×39 px) | Yes | Static sprite | River banks, mossy borders, mountain ledges | Multi-tile Prop (Y-Sorted at Foot) |
| **rock_stone_pillar_base_03** | `nature/rocks/rock_stone_pillar_base_03.png` | 40×39 | 3×2 tiles (40×39 px) | Yes | Static sprite | River banks, mossy borders, mountain ledges | Multi-tile Prop (Y-Sorted at Foot) |
| **water_submerged_moss_rocks** | `nature/rocks/water_submerged_moss_rocks.png` | 64×64 | 4×4 tiles (64×64 px) | Yes | Static sprite | River banks, mossy borders, mountain ledges | Native 16-bit Grid (Direct Drop-in) |

### Category: `nature/trees` (19 Assets)

| Asset Name | Relative Path | Dimensions | Tile Footprint | Alpha | Animation | Recommended Use | Compatibility |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **citrus_orange_tree** | `nature/trees/citrus_orange_tree.png` | 20×26 | 1×2 tiles (20×26 px) | Yes | Static sprite | Dense forest border, clearing framing, village greenery | Multi-tile Decal (Y-Sorted at Trunk Base) |
| **pine_crown_top_01** | `nature/trees/pine_crown_top_01.png` | 42×40 | 3×3 tiles (42×40 px) | Yes | Static sprite | Dense forest border, clearing framing, village greenery | Multi-tile Decal (Y-Sorted at Trunk Base) |
| **pine_crown_top_02** | `nature/trees/pine_crown_top_02.png` | 39×40 | 2×3 tiles (39×40 px) | Yes | Static sprite | Dense forest border, clearing framing, village greenery | Multi-tile Decal (Y-Sorted at Trunk Base) |
| **tree_bare_winter_dead** | `nature/trees/tree_bare_winter_dead.png` | 48×110 | 3×7 tiles (48×110 px) | No | Static sprite | Dense forest border, clearing framing, village greenery | Multi-tile Decal (Y-Sorted at Trunk Base) |
| **tree_frost_winter_blossom** | `nature/trees/tree_frost_winter_blossom.png` | 65×90 | 4×6 tiles (65×90 px) | No | Static sprite | Dense forest border, clearing framing, village greenery | Multi-tile Decal (Y-Sorted at Trunk Base) |
| **tree_oak_ancient_giant** | `nature/trees/tree_oak_ancient_giant.png` | 385×420 | 24×26 tiles (385×420 px) | No | Static sprite | Dense forest border, clearing framing, village greenery | Multi-tile Decal (Y-Sorted at Trunk Base) |
| **tree_oak_canopy** | `nature/trees/tree_oak_canopy.png` | 36×48 | 2×3 tiles (36×48 px) | Yes | Static sprite | Dense forest border, clearing framing, village greenery | Multi-tile Decal (Y-Sorted at Trunk Base) |
| **tree_oak_canopy_bright** | `nature/trees/tree_oak_canopy_bright.png` | 320×270 | 20×17 tiles (320×270 px) | No | Static sprite | Dense forest border, clearing framing, village greenery | Multi-tile Decal (Y-Sorted at Trunk Base) |
| **tree_oak_deciduous_round** | `nature/trees/tree_oak_deciduous_round.png` | 285×350 | 18×22 tiles (285×350 px) | No | Static sprite | Dense forest border, clearing framing, village greenery | Multi-tile Decal (Y-Sorted at Trunk Base) |
| **tree_pine_evergreen** | `nature/trees/tree_pine_evergreen.png` | 32×48 | 2×3 tiles (32×48 px) | Yes | Static sprite | Dense forest border, clearing framing, village greenery | Native 16-bit Grid (Direct Drop-in) |
| **tree_pine_slender_spruce** | `nature/trees/tree_pine_slender_spruce.png` | 110×275 | 7×17 tiles (110×275 px) | No | Static sprite | Dense forest border, clearing framing, village greenery | Multi-tile Decal (Y-Sorted at Trunk Base) |
| **tree_pine_tall_conifer** | `nature/trees/tree_pine_tall_conifer.png` | 200×320 | 13×20 tiles (200×320 px) | No | Static sprite | Dense forest border, clearing framing, village greenery | Multi-tile Decal (Y-Sorted at Trunk Base) |
| **tree_sakura_blossom** | `nature/trees/tree_sakura_blossom.png` | 36×48 | 2×3 tiles (36×48 px) | Yes | Static sprite | Dense forest border, clearing framing, village greenery | Multi-tile Decal (Y-Sorted at Trunk Base) |
| **tree_sakura_cherry_blossom** | `nature/trees/tree_sakura_cherry_blossom.png` | 315×360 | 20×23 tiles (315×360 px) | No | Static sprite | Dense forest border, clearing framing, village greenery | Multi-tile Decal (Y-Sorted at Trunk Base) |
| **tree_sapling_bushy** | `nature/trees/tree_sapling_bushy.png` | 45×85 | 3×5 tiles (45×85 px) | No | Static sprite | Dense forest border, clearing framing, village greenery | Multi-tile Decal (Y-Sorted at Trunk Base) |
| **tree_sapling_tender_shoot** | `nature/trees/tree_sapling_tender_shoot.png` | 45×60 | 3×4 tiles (45×60 px) | No | Static sprite | Dense forest border, clearing framing, village greenery | Multi-tile Decal (Y-Sorted at Trunk Base) |
| **tree_trunk_oak_roots** | `nature/trees/tree_trunk_oak_roots.png` | 39×54 | 2×3 tiles (39×54 px) | Yes | Static sprite | Dense forest border, clearing framing, village greenery | Multi-tile Decal (Y-Sorted at Trunk Base) |
| **tree_trunk_pine_base** | `nature/trees/tree_trunk_pine_base.png` | 39×54 | 2×3 tiles (39×54 px) | Yes | Static sprite | Dense forest border, clearing framing, village greenery | Multi-tile Decal (Y-Sorted at Trunk Base) |
| **village_citrus_fruit_tree** | `nature/trees/village_citrus_fruit_tree.png` | 85×150 | 5×9 tiles (85×150 px) | No | Static sprite | Dense forest border, clearing framing, village greenery | Multi-tile Decal (Y-Sorted at Trunk Base) |

### Category: `props` (21 Assets)

| Asset Name | Relative Path | Dimensions | Tile Footprint | Alpha | Animation | Recommended Use | Compatibility |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **barrel_stack** | `props/barrel_stack.png` | 24×18 | 2×1 tiles (24×18 px) | Yes | Static sprite | Environmental decoration | Multi-tile Prop (Y-Sorted at Foot) |
| **bench_log** | `props/bench_log.png` | 26×14 | 2×1 tiles (26×14 px) | Yes | Static sprite | Environmental decoration | Multi-tile Prop (Y-Sorted at Foot) |
| **bench_wood** | `props/bench_wood.png` | 28×18 | 2×1 tiles (28×18 px) | Yes | Static sprite | Environmental decoration | Multi-tile Prop (Y-Sorted at Foot) |
| **bridge_wood** | `props/bridge_wood.png` | 48×64 | 3×4 tiles (48×64 px) | Yes | Static sprite | Environmental decoration | Native 16-bit Grid (Direct Drop-in) |
| **cattails** | `props/cattails.png` | 20×28 | 1×2 tiles (20×28 px) | Yes | Static sprite | Environmental decoration | Multi-tile Prop (Y-Sorted at Foot) |
| **citrus_tree** | `props/citrus_tree.png` | 20×26 | 1×2 tiles (20×26 px) | Yes | Static sprite | Environmental decoration | Multi-tile Prop (Y-Sorted at Foot) |
| **farm_cart** | `props/farm_cart.png` | 36×26 | 2×2 tiles (36×26 px) | Yes | Static sprite | Environmental decoration | Multi-tile Prop (Y-Sorted at Foot) |
| **fence_post** | `props/fence_post.png` | 12×16 | 1×1 tiles (12×16 px) | Yes | Static sprite | Environmental decoration | Multi-tile Prop (Y-Sorted at Foot) |
| **fence_wood** | `props/fence_wood.png` | 32×16 | 2×1 tiles (32×16 px) | Yes | Static sprite | Environmental decoration | Native 16-bit Grid (Direct Drop-in) |
| **fountain_stone** | `props/fountain_stone.png` | 32×32 | 2×2 tiles (32×32 px) | Yes | Static sprite | Environmental decoration | Native 16-bit Grid (Direct Drop-in) |
| **haystack** | `props/haystack.png` | 20×22 | 1×1 tiles (20×22 px) | Yes | Static sprite | Environmental decoration | Multi-tile Prop (Y-Sorted at Foot) |
| **lantern_oil** | `props/lantern_oil.png` | 14×18 | 1×1 tiles (14×18 px) | Yes | Dual-harmonic radial flicker (±12% radius pulse) | Environmental decoration | Multi-tile Prop (Y-Sorted at Foot) |
| **lantern_post** | `props/lantern_post.png` | 16×24 | 1×2 tiles (16×24 px) | Yes | Dual-harmonic radial flicker (±12% radius pulse) | Environmental decoration | Multi-tile Prop (Y-Sorted at Foot) |
| **lantern_wood_post** | `props/lantern_wood_post.png` | 22×34 | 1×2 tiles (22×34 px) | Yes | Dual-harmonic radial flicker (±12% radius pulse) | Environmental decoration | Multi-tile Prop (Y-Sorted at Foot) |
| **lilypad** | `props/lilypad.png` | 18×18 | 1×1 tiles (18×18 px) | Yes | Procedural vertical float (sinusoidal bob, 1.5px amplitude) | Environmental decoration | Multi-tile Prop (Y-Sorted at Foot) |
| **lilypad_flower** | `props/lilypad_flower.png` | 18×18 | 1×1 tiles (18×18 px) | Yes | Procedural vertical float (sinusoidal bob, 1.5px amplitude) | Environmental decoration | Multi-tile Prop (Y-Sorted at Foot) |
| **market_stall** | `props/market_stall.png` | 42×36 | 3×2 tiles (42×36 px) | Yes | Static sprite | Environmental decoration | Multi-tile Prop (Y-Sorted at Foot) |
| **rock_slate** | `props/rock_slate.png` | 20×14 | 1×1 tiles (20×14 px) | Yes | Static sprite | Environmental decoration | Multi-tile Prop (Y-Sorted at Foot) |
| **stone_monument** | `props/stone_monument.png` | 20×28 | 1×2 tiles (20×28 px) | Yes | Static sprite | Environmental decoration | Multi-tile Prop (Y-Sorted at Foot) |
| **stone_well** | `props/stone_well.png` | 32×36 | 2×2 tiles (32×36 px) | Yes | Static sprite | Environmental decoration | Multi-tile Prop (Y-Sorted at Foot) |
| **water_caustics** | `props/water_caustics.png` | 64×16 | 4×1 tiles (64×16 px) | Yes | Static sprite | Environmental decoration | Native 16-bit Grid (Direct Drop-in) |

### Category: `props/decorations` (2 Assets)

| Asset Name | Relative Path | Dimensions | Tile Footprint | Alpha | Animation | Recommended Use | Compatibility |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **stone_well_basin_mossy** | `props/decorations/stone_well_basin_mossy.png` | 39×38 | 2×2 tiles (39×38 px) | Yes | Static sprite | Urns, festive garlands, stone edging | Multi-tile Prop (Y-Sorted at Foot) |
| **stone_well_basin_round** | `props/decorations/stone_well_basin_round.png` | 40×38 | 3×2 tiles (40×38 px) | Yes | Static sprite | Urns, festive garlands, stone edging | Multi-tile Prop (Y-Sorted at Foot) |

### Category: `props/fantasy` (10 Assets)

| Asset Name | Relative Path | Dimensions | Tile Footprint | Alpha | Animation | Recommended Use | Compatibility |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **chest_treasure_closed_wood** | `props/fantasy/chest_treasure_closed_wood.png` | 39×39 | 2×2 tiles (39×39 px) | Yes | Static sprite | Hidden treasure caches, relics, quest reward props | Multi-tile Prop (Y-Sorted at Foot) |
| **chest_treasure_crystal_pink** | `props/fantasy/chest_treasure_crystal_pink.png` | 40×38 | 3×2 tiles (40×38 px) | Yes | Static sprite | Hidden treasure caches, relics, quest reward props | Multi-tile Prop (Y-Sorted at Foot) |
| **chest_treasure_iron_locked** | `props/fantasy/chest_treasure_iron_locked.png` | 40×38 | 3×2 tiles (40×38 px) | Yes | Static sprite | Hidden treasure caches, relics, quest reward props | Multi-tile Prop (Y-Sorted at Foot) |
| **chest_treasure_royal_gold** | `props/fantasy/chest_treasure_royal_gold.png` | 39×38 | 2×2 tiles (39×38 px) | Yes | Static sprite | Hidden treasure caches, relics, quest reward props | Multi-tile Prop (Y-Sorted at Foot) |
| **chest_treasure_steel_reinforced** | `props/fantasy/chest_treasure_steel_reinforced.png` | 40×38 | 3×2 tiles (40×38 px) | Yes | Static sprite | Hidden treasure caches, relics, quest reward props | Multi-tile Prop (Y-Sorted at Foot) |
| **chest_treasure_wooden_gilded** | `props/fantasy/chest_treasure_wooden_gilded.png` | 42×38 | 3×2 tiles (42×38 px) | Yes | Static sprite | Hidden treasure caches, relics, quest reward props | Multi-tile Prop (Y-Sorted at Foot) |
| **donut_magic_life_preserver** | `props/fantasy/donut_magic_life_preserver.png` | 42×39 | 3×2 tiles (42×39 px) | Yes | Static sprite | Hidden treasure caches, relics, quest reward props | Multi-tile Prop (Y-Sorted at Foot) |
| **rune_stone_ancient_slate** | `props/fantasy/rune_stone_ancient_slate.png` | 42×39 | 3×2 tiles (42×39 px) | Yes | Static sprite | Hidden treasure caches, relics, quest reward props | Multi-tile Prop (Y-Sorted at Foot) |
| **treasure_gold_coins_pile_01** | `props/fantasy/treasure_gold_coins_pile_01.png` | 40×39 | 3×2 tiles (40×39 px) | Yes | Static sprite | Hidden treasure caches, relics, quest reward props | Multi-tile Prop (Y-Sorted at Foot) |
| **treasure_gold_coins_pile_02** | `props/fantasy/treasure_gold_coins_pile_02.png` | 40×39 | 3×2 tiles (40×39 px) | Yes | Static sprite | Hidden treasure caches, relics, quest reward props | Multi-tile Prop (Y-Sorted at Foot) |

### Category: `props/furniture` (5 Assets)

| Asset Name | Relative Path | Dimensions | Tile Footprint | Alpha | Animation | Recommended Use | Compatibility |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **bench_garden_wood_slatted** | `props/furniture/bench_garden_wood_slatted.png` | 95×70 | 6×4 tiles (95×70 px) | No | Static sprite | Outdoor seating, resting benches, stools | Multi-tile Prop (Y-Sorted at Foot) |
| **bench_rustic_log** | `props/furniture/bench_rustic_log.png` | 26×14 | 2×1 tiles (26×14 px) | Yes | Static sprite | Outdoor seating, resting benches, stools | Multi-tile Prop (Y-Sorted at Foot) |
| **bench_rustic_wood_plank** | `props/furniture/bench_rustic_wood_plank.png` | 102×40 | 6×3 tiles (102×40 px) | No | Static sprite | Outdoor seating, resting benches, stools | Multi-tile Prop (Y-Sorted at Foot) |
| **bench_wood_garden** | `props/furniture/bench_wood_garden.png` | 28×18 | 2×1 tiles (28×18 px) | Yes | Static sprite | Outdoor seating, resting benches, stools | Multi-tile Prop (Y-Sorted at Foot) |
| **stool_rustic_wood** | `props/furniture/stool_rustic_wood.png` | 39×39 | 2×2 tiles (39×39 px) | Yes | Static sprite | Outdoor seating, resting benches, stools | Multi-tile Prop (Y-Sorted at Foot) |

### Category: `props/village` (21 Assets)

| Asset Name | Relative Path | Dimensions | Tile Footprint | Alpha | Animation | Recommended Use | Compatibility |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **barrel_stack** | `props/village/barrel_stack.png` | 24×18 | 2×1 tiles (24×18 px) | Yes | Static sprite | Cargo staging, harvest storage, village life props | Multi-tile Prop (Y-Sorted at Foot) |
| **barrel_wood_oak_medium** | `props/village/barrel_wood_oak_medium.png` | 36×65 | 2×4 tiles (36×65 px) | No | Static sprite | Cargo staging, harvest storage, village life props | Multi-tile Prop (Y-Sorted at Foot) |
| **barrel_wood_oak_small** | `props/village/barrel_wood_oak_small.png` | 28×52 | 2×3 tiles (28×52 px) | No | Static sprite | Cargo staging, harvest storage, village life props | Multi-tile Prop (Y-Sorted at Foot) |
| **barrel_wood_oak_tall** | `props/village/barrel_wood_oak_tall.png` | 48×95 | 3×6 tiles (48×95 px) | No | Static sprite | Cargo staging, harvest storage, village life props | Multi-tile Prop (Y-Sorted at Foot) |
| **barrel_wood_water_cask** | `props/village/barrel_wood_water_cask.png` | 39×39 | 2×2 tiles (39×39 px) | Yes | Static sprite | Cargo staging, harvest storage, village life props | Multi-tile Prop (Y-Sorted at Foot) |
| **clay_pot_urn_medium** | `props/village/clay_pot_urn_medium.png` | 39×39 | 2×2 tiles (39×39 px) | Yes | Static sprite | Cargo staging, harvest storage, village life props | Multi-tile Prop (Y-Sorted at Foot) |
| **clay_pot_urn_small** | `props/village/clay_pot_urn_small.png` | 40×39 | 3×2 tiles (40×39 px) | Yes | Static sprite | Cargo staging, harvest storage, village life props | Multi-tile Prop (Y-Sorted at Foot) |
| **clay_pot_urn_wide** | `props/village/clay_pot_urn_wide.png` | 41×39 | 3×2 tiles (41×39 px) | Yes | Static sprite | Cargo staging, harvest storage, village life props | Multi-tile Prop (Y-Sorted at Foot) |
| **crate_wood_double_stack** | `props/village/crate_wood_double_stack.png` | 45×72 | 3×5 tiles (45×72 px) | No | Static sprite | Cargo staging, harvest storage, village life props | Multi-tile Prop (Y-Sorted at Foot) |
| **crate_wood_single_box** | `props/village/crate_wood_single_box.png` | 45×105 | 3×7 tiles (45×105 px) | No | Static sprite | Cargo staging, harvest storage, village life props | Multi-tile Prop (Y-Sorted at Foot) |
| **crate_wood_tall_cargo** | `props/village/crate_wood_tall_cargo.png` | 55×105 | 3×7 tiles (55×105 px) | No | Static sprite | Cargo staging, harvest storage, village life props | Multi-tile Prop (Y-Sorted at Foot) |
| **farm_cart** | `props/village/farm_cart.png` | 36×26 | 2×2 tiles (36×26 px) | Yes | Static sprite | Cargo staging, harvest storage, village life props | Multi-tile Prop (Y-Sorted at Foot) |
| **fence_gate_timber_pieces** | `props/village/fence_gate_timber_pieces.png` | 39×39 | 2×2 tiles (39×39 px) | Yes | Static sprite | Cargo staging, harvest storage, village life props | Multi-tile Prop (Y-Sorted at Foot) |
| **haystack** | `props/village/haystack.png` | 20×22 | 1×1 tiles (20×22 px) | Yes | Static sprite | Cargo staging, harvest storage, village life props | Multi-tile Prop (Y-Sorted at Foot) |
| **sack_grain_burlap_large** | `props/village/sack_grain_burlap_large.png` | 42×80 | 3×5 tiles (42×80 px) | No | Static sprite | Cargo staging, harvest storage, village life props | Multi-tile Prop (Y-Sorted at Foot) |
| **sack_grain_burlap_medium** | `props/village/sack_grain_burlap_medium.png` | 48×95 | 3×6 tiles (48×95 px) | No | Static sprite | Cargo staging, harvest storage, village life props | Multi-tile Prop (Y-Sorted at Foot) |
| **sack_grain_burlap_small** | `props/village/sack_grain_burlap_small.png` | 32×42 | 2×3 tiles (32×42 px) | No | Static sprite | Cargo staging, harvest storage, village life props | Multi-tile Prop (Y-Sorted at Foot) |
| **tub_wash_wood_basin** | `props/village/tub_wash_wood_basin.png` | 42×45 | 3×3 tiles (42×45 px) | No | Static sprite | Cargo staging, harvest storage, village life props | Multi-tile Prop (Y-Sorted at Foot) |
| **tub_water_wooden_pail** | `props/village/tub_water_wooden_pail.png` | 38×50 | 2×3 tiles (38×50 px) | No | Static sprite | Cargo staging, harvest storage, village life props | Multi-tile Prop (Y-Sorted at Foot) |
| **village_barrel_stack_cellar** | `props/village/village_barrel_stack_cellar.png` | 85×90 | 5×6 tiles (85×90 px) | No | Static sprite | Cargo staging, harvest storage, village life props | Multi-tile Prop (Y-Sorted at Foot) |
| **well_stone_open_cistern** | `props/village/well_stone_open_cistern.png` | 85×130 | 5×8 tiles (85×130 px) | No | Static sprite | Cargo staging, harvest storage, village life props | Multi-tile Prop (Y-Sorted at Foot) |

### Category: `structures/bridges` (1 Assets)

| Asset Name | Relative Path | Dimensions | Tile Footprint | Alpha | Animation | Recommended Use | Compatibility |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **bridge_wood_footbridge** | `structures/bridges/bridge_wood_footbridge.png` | 48×64 | 3×4 tiles (48×64 px) | Yes | Static sprite | Woodland pond crossing footbridge | Native 16-bit Grid (Direct Drop-in) |

### Category: `structures/fences` (5 Assets)

| Asset Name | Relative Path | Dimensions | Tile Footprint | Alpha | Animation | Recommended Use | Compatibility |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **fence_post_timber** | `structures/fences/fence_post_timber.png` | 12×16 | 1×1 tiles (12×16 px) | Yes | Static sprite | Farmstead boundary, garden enclosures, bank courtyard | Multi-tile Prop (Y-Sorted at Foot) |
| **fence_post_timber_single** | `structures/fences/fence_post_timber_single.png` | 40×50 | 3×3 tiles (40×50 px) | No | Static sprite | Farmstead boundary, garden enclosures, bank courtyard | Multi-tile Prop (Y-Sorted at Foot) |
| **fence_split_rail_segment** | `structures/fences/fence_split_rail_segment.png` | 32×16 | 2×1 tiles (32×16 px) | Yes | Static sprite | Farmstead boundary, garden enclosures, bank courtyard | Native 16-bit Grid (Direct Drop-in) |
| **fence_split_rail_timber_segment** | `structures/fences/fence_split_rail_timber_segment.png` | 85×45 | 5×3 tiles (85×45 px) | No | Static sprite | Farmstead boundary, garden enclosures, bank courtyard | Multi-tile Prop (Y-Sorted at Foot) |
| **fence_timber_corner_rail** | `structures/fences/fence_timber_corner_rail.png` | 39×38 | 2×2 tiles (39×38 px) | Yes | Static sprite | Farmstead boundary, garden enclosures, bank courtyard | Multi-tile Prop (Y-Sorted at Foot) |

### Category: `structures/lamps` (6 Assets)

| Asset Name | Relative Path | Dimensions | Tile Footprint | Alpha | Animation | Recommended Use | Compatibility |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **lamp_portable_iron_oil** | `structures/lamps/lamp_portable_iron_oil.png` | 28×85 | 2×5 tiles (28×85 px) | No | Dual-harmonic radial flicker (±12% radius pulse) | Evening illumination, path safety, ambient glow | Multi-tile Prop (Y-Sorted at Foot) |
| **lamp_street_wood_bracket_post** | `structures/lamps/lamp_street_wood_bracket_post.png` | 68×118 | 4×7 tiles (68×118 px) | No | Dual-harmonic radial flicker (±12% radius pulse) | Evening illumination, path safety, ambient glow | Multi-tile Prop (Y-Sorted at Foot) |
| **lantern_iron_post** | `structures/lamps/lantern_iron_post.png` | 16×24 | 1×2 tiles (16×24 px) | Yes | Dual-harmonic radial flicker (±12% radius pulse) | Evening illumination, path safety, ambient glow | Multi-tile Prop (Y-Sorted at Foot) |
| **lantern_oil_portable** | `structures/lamps/lantern_oil_portable.png` | 14×18 | 1×1 tiles (14×18 px) | Yes | Dual-harmonic radial flicker (±12% radius pulse) | Evening illumination, path safety, ambient glow | Multi-tile Prop (Y-Sorted at Foot) |
| **lantern_timber_post** | `structures/lamps/lantern_timber_post.png` | 22×34 | 1×2 tiles (22×34 px) | Yes | Dual-harmonic radial flicker (±12% radius pulse) | Evening illumination, path safety, ambient glow | Multi-tile Prop (Y-Sorted at Foot) |
| **village_street_lamp_metal** | `structures/lamps/village_street_lamp_metal.png` | 35×110 | 2×7 tiles (35×110 px) | No | Dual-harmonic radial flicker (±12% radius pulse) | Evening illumination, path safety, ambient glow | Multi-tile Prop (Y-Sorted at Foot) |

### Category: `structures/signs` (3 Assets)

| Asset Name | Relative Path | Dimensions | Tile Footprint | Alpha | Animation | Recommended Use | Compatibility |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **signpost_tree_stump_pedestal** | `structures/signs/signpost_tree_stump_pedestal.png` | 40×39 | 3×2 tiles (40×39 px) | Yes | Static sprite | Road signs, building identification, bulletin boards | Multi-tile Prop (Y-Sorted at Foot) |
| **sign_directional_arrow_wood** | `structures/signs/sign_directional_arrow_wood.png` | 65×105 | 4×7 tiles (65×105 px) | No | Static sprite | Road signs, building identification, bulletin boards | Multi-tile Prop (Y-Sorted at Foot) |
| **sign_notice_board_blank** | `structures/signs/sign_notice_board_blank.png` | 52×100 | 3×6 tiles (52×100 px) | No | Static sprite | Road signs, building identification, bulletin boards | Multi-tile Prop (Y-Sorted at Foot) |

### Category: `structures/walls` (4 Assets)

| Asset Name | Relative Path | Dimensions | Tile Footprint | Alpha | Animation | Recommended Use | Compatibility |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **ruin_stone_pillar_monument** | `structures/walls/ruin_stone_pillar_monument.png` | 45×95 | 3×6 tiles (45×95 px) | No | Static sprite | Retaining walls, stone pedestals, monuments | Multi-tile Prop (Y-Sorted at Foot) |
| **stone_monument_pillar** | `structures/walls/stone_monument_pillar.png` | 20×28 | 1×2 tiles (20×28 px) | Yes | Static sprite | Retaining walls, stone pedestals, monuments | Multi-tile Prop (Y-Sorted at Foot) |
| **stone_well** | `structures/walls/stone_well.png` | 32×36 | 2×2 tiles (32×36 px) | Yes | Static sprite | Retaining walls, stone pedestals, monuments | Multi-tile Prop (Y-Sorted at Foot) |
| **wall_brick_masonry_red** | `structures/walls/wall_brick_masonry_red.png` | 40×39 | 3×2 tiles (40×39 px) | Yes | Static sprite | Retaining walls, stone pedestals, monuments | Multi-tile Prop (Y-Sorted at Foot) |

### Category: `tiles/dirt` (11 Assets)

| Asset Name | Relative Path | Dimensions | Tile Footprint | Alpha | Animation | Recommended Use | Compatibility |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **dirt_cave_floor_moss** | `tiles/dirt/dirt_cave_floor_moss.png` | 40×54 | 3×3 tiles (40×54 px) | Yes | Static sprite | Farmland garden beds, dirt roads, crop patches | Scaled Tile Slot (Normalized to 16×16 via canvas/nearest) |
| **dirt_dry_packed_earth** | `tiles/dirt/dirt_dry_packed_earth.png` | 40×39 | 3×2 tiles (40×39 px) | Yes | Static sprite | Farmland garden beds, dirt roads, crop patches | Scaled Tile Slot (Normalized to 16×16 via canvas/nearest) |
| **dirt_gravel_trail_01** | `tiles/dirt/dirt_gravel_trail_01.png` | 39×54 | 2×3 tiles (39×54 px) | Yes | Static sprite | Farmland garden beds, dirt roads, crop patches | Scaled Tile Slot (Normalized to 16×16 via canvas/nearest) |
| **dirt_gravel_trail_02** | `tiles/dirt/dirt_gravel_trail_02.png` | 41×54 | 3×3 tiles (41×54 px) | Yes | Static sprite | Farmland garden beds, dirt roads, crop patches | Scaled Tile Slot (Normalized to 16×16 via canvas/nearest) |
| **dirt_mound_clay_earth** | `tiles/dirt/dirt_mound_clay_earth.png` | 40×38 | 3×2 tiles (40×38 px) | Yes | Static sprite | Farmland garden beds, dirt roads, crop patches | Scaled Tile Slot (Normalized to 16×16 via canvas/nearest) |
| **dirt_mound_layered_brown** | `tiles/dirt/dirt_mound_layered_brown.png` | 39×38 | 2×2 tiles (39×38 px) | Yes | Static sprite | Farmland garden beds, dirt roads, crop patches | Scaled Tile Slot (Normalized to 16×16 via canvas/nearest) |
| **dirt_roots_loam_patch** | `tiles/dirt/dirt_roots_loam_patch.png` | 39×39 | 2×2 tiles (39×39 px) | Yes | Static sprite | Farmland garden beds, dirt roads, crop patches | Scaled Tile Slot (Normalized to 16×16 via canvas/nearest) |
| **dirt_soil_dark_patch** | `tiles/dirt/dirt_soil_dark_patch.png` | 41×54 | 3×3 tiles (41×54 px) | Yes | Static sprite | Farmland garden beds, dirt roads, crop patches | Scaled Tile Slot (Normalized to 16×16 via canvas/nearest) |
| **dirt_tilled_soil_bed** | `tiles/dirt/dirt_tilled_soil_bed.png` | 39×39 | 2×2 tiles (39×39 px) | Yes | Static sprite | Farmland garden beds, dirt roads, crop patches | Scaled Tile Slot (Normalized to 16×16 via canvas/nearest) |
| **sand_desert_dune_ripple** | `tiles/dirt/sand_desert_dune_ripple.png` | 39×39 | 2×2 tiles (39×39 px) | Yes | Static sprite | Farmland garden beds, dirt roads, crop patches | Scaled Tile Slot (Normalized to 16×16 via canvas/nearest) |
| **sand_desert_plain** | `tiles/dirt/sand_desert_plain.png` | 40×39 | 3×2 tiles (40×39 px) | Yes | Static sprite | Farmland garden beds, dirt roads, crop patches | Scaled Tile Slot (Normalized to 16×16 via canvas/nearest) |

### Category: `tiles/grass` (4 Assets)

| Asset Name | Relative Path | Dimensions | Tile Footprint | Alpha | Animation | Recommended Use | Compatibility |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **grass_lush_short** | `tiles/grass/grass_lush_short.png` | 40×54 | 3×3 tiles (40×54 px) | Yes | Static sprite | Overworld terrain base and field lawns | Scaled Tile Slot (Normalized to 16×16 via canvas/nearest) |
| **grass_lush_vibrant_01** | `tiles/grass/grass_lush_vibrant_01.png` | 39×40 | 2×3 tiles (39×40 px) | Yes | Static sprite | Overworld terrain base and field lawns | Scaled Tile Slot (Normalized to 16×16 via canvas/nearest) |
| **grass_lush_vibrant_02** | `tiles/grass/grass_lush_vibrant_02.png` | 40×40 | 3×3 tiles (40×40 px) | Yes | Static sprite | Overworld terrain base and field lawns | Scaled Tile Slot (Normalized to 16×16 via canvas/nearest) |
| **grass_tufted_clover_03** | `tiles/grass/grass_tufted_clover_03.png` | 40×40 | 3×3 tiles (40×40 px) | Yes | Static sprite | Overworld terrain base and field lawns | Scaled Tile Slot (Normalized to 16×16 via canvas/nearest) |

### Category: `tiles/roads` (7 Assets)

| Asset Name | Relative Path | Dimensions | Tile Footprint | Alpha | Animation | Recommended Use | Compatibility |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **road_cobble_flagstone_brown_01** | `tiles/roads/road_cobble_flagstone_brown_01.png` | 40×54 | 3×3 tiles (40×54 px) | Yes | Static sprite | Main village thoroughfares and walking paths | Scaled Tile Slot (Normalized to 16×16 via canvas/nearest) |
| **road_cobble_flagstone_brown_02** | `tiles/roads/road_cobble_flagstone_brown_02.png` | 40×54 | 3×3 tiles (40×54 px) | Yes | Static sprite | Main village thoroughfares and walking paths | Scaled Tile Slot (Normalized to 16×16 via canvas/nearest) |
| **road_stepping_stones_pebble** | `tiles/roads/road_stepping_stones_pebble.png` | 41×39 | 3×2 tiles (41×39 px) | Yes | Static sprite | Main village thoroughfares and walking paths | Scaled Tile Slot (Normalized to 16×16 via canvas/nearest) |
| **road_wood_boardwalk_01** | `tiles/roads/road_wood_boardwalk_01.png` | 40×54 | 3×3 tiles (40×54 px) | Yes | Static sprite | Main village thoroughfares and walking paths | Scaled Tile Slot (Normalized to 16×16 via canvas/nearest) |
| **road_wood_boardwalk_02** | `tiles/roads/road_wood_boardwalk_02.png` | 40×54 | 3×3 tiles (40×54 px) | Yes | Static sprite | Main village thoroughfares and walking paths | Scaled Tile Slot (Normalized to 16×16 via canvas/nearest) |
| **road_wood_pier_end** | `tiles/roads/road_wood_pier_end.png` | 40×54 | 3×3 tiles (40×54 px) | Yes | Static sprite | Main village thoroughfares and walking paths | Scaled Tile Slot (Normalized to 16×16 via canvas/nearest) |
| **road_wood_plank_diagonal** | `tiles/roads/road_wood_plank_diagonal.png` | 40×39 | 3×2 tiles (40×39 px) | Yes | Static sprite | Main village thoroughfares and walking paths | Scaled Tile Slot (Normalized to 16×16 via canvas/nearest) |

### Category: `tiles/stone` (19 Assets)

| Asset Name | Relative Path | Dimensions | Tile Footprint | Alpha | Animation | Recommended Use | Compatibility |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **plank_wood_deck_01** | `tiles/stone/plank_wood_deck_01.png` | 40×40 | 3×3 tiles (40×40 px) | Yes | Static sprite | Cobblestone paths, courtyards, fountain pavement | Scaled Tile Slot (Normalized to 16×16 via canvas/nearest) |
| **plank_wood_deck_02** | `tiles/stone/plank_wood_deck_02.png` | 40×40 | 3×3 tiles (40×40 px) | Yes | Static sprite | Cobblestone paths, courtyards, fountain pavement | Scaled Tile Slot (Normalized to 16×16 via canvas/nearest) |
| **plank_wood_deck_03** | `tiles/stone/plank_wood_deck_03.png` | 39×40 | 2×3 tiles (39×40 px) | Yes | Static sprite | Cobblestone paths, courtyards, fountain pavement | Scaled Tile Slot (Normalized to 16×16 via canvas/nearest) |
| **plank_wood_deck_04** | `tiles/stone/plank_wood_deck_04.png` | 41×40 | 3×3 tiles (41×40 px) | Yes | Static sprite | Cobblestone paths, courtyards, fountain pavement | Scaled Tile Slot (Normalized to 16×16 via canvas/nearest) |
| **stone_cliff_face_01** | `tiles/stone/stone_cliff_face_01.png` | 40×40 | 3×3 tiles (40×40 px) | Yes | Static sprite | Cobblestone paths, courtyards, fountain pavement | Scaled Tile Slot (Normalized to 16×16 via canvas/nearest) |
| **stone_cliff_face_02** | `tiles/stone/stone_cliff_face_02.png` | 39×40 | 2×3 tiles (39×40 px) | Yes | Static sprite | Cobblestone paths, courtyards, fountain pavement | Scaled Tile Slot (Normalized to 16×16 via canvas/nearest) |
| **stone_cliff_ledge_dark** | `tiles/stone/stone_cliff_ledge_dark.png` | 42×54 | 3×3 tiles (42×54 px) | Yes | Static sprite | Cobblestone paths, courtyards, fountain pavement | Scaled Tile Slot (Normalized to 16×16 via canvas/nearest) |
| **stone_cobble_dark_square** | `tiles/stone/stone_cobble_dark_square.png` | 39×54 | 2×3 tiles (39×54 px) | Yes | Static sprite | Cobblestone paths, courtyards, fountain pavement | Scaled Tile Slot (Normalized to 16×16 via canvas/nearest) |
| **stone_cobble_grey_01** | `tiles/stone/stone_cobble_grey_01.png` | 40×40 | 3×3 tiles (40×40 px) | Yes | Static sprite | Cobblestone paths, courtyards, fountain pavement | Scaled Tile Slot (Normalized to 16×16 via canvas/nearest) |
| **stone_cobble_grey_02** | `tiles/stone/stone_cobble_grey_02.png` | 39×40 | 2×3 tiles (39×40 px) | Yes | Static sprite | Cobblestone paths, courtyards, fountain pavement | Scaled Tile Slot (Normalized to 16×16 via canvas/nearest) |
| **stone_cobble_grey_flat** | `tiles/stone/stone_cobble_grey_flat.png` | 40×54 | 3×3 tiles (40×54 px) | Yes | Static sprite | Cobblestone paths, courtyards, fountain pavement | Scaled Tile Slot (Normalized to 16×16 via canvas/nearest) |
| **stone_cobble_grey_textured** | `tiles/stone/stone_cobble_grey_textured.png` | 40×39 | 3×2 tiles (40×39 px) | Yes | Static sprite | Cobblestone paths, courtyards, fountain pavement | Scaled Tile Slot (Normalized to 16×16 via canvas/nearest) |
| **stone_cobble_mossy_03** | `tiles/stone/stone_cobble_mossy_03.png` | 41×40 | 3×3 tiles (41×40 px) | Yes | Static sprite | Cobblestone paths, courtyards, fountain pavement | Scaled Tile Slot (Normalized to 16×16 via canvas/nearest) |
| **stone_cobble_rounded_pavement** | `tiles/stone/stone_cobble_rounded_pavement.png` | 39×54 | 2×3 tiles (39×54 px) | Yes | Static sprite | Cobblestone paths, courtyards, fountain pavement | Scaled Tile Slot (Normalized to 16×16 via canvas/nearest) |
| **stone_cobble_slate_dark** | `tiles/stone/stone_cobble_slate_dark.png` | 40×38 | 3×2 tiles (40×38 px) | Yes | Static sprite | Cobblestone paths, courtyards, fountain pavement | Scaled Tile Slot (Normalized to 16×16 via canvas/nearest) |
| **stone_cobble_tight_weave** | `tiles/stone/stone_cobble_tight_weave.png` | 40×39 | 3×2 tiles (40×39 px) | Yes | Static sprite | Cobblestone paths, courtyards, fountain pavement | Scaled Tile Slot (Normalized to 16×16 via canvas/nearest) |
| **stone_craggy_cliff_corner** | `tiles/stone/stone_craggy_cliff_corner.png` | 42×39 | 3×2 tiles (42×39 px) | Yes | Static sprite | Cobblestone paths, courtyards, fountain pavement | Scaled Tile Slot (Normalized to 16×16 via canvas/nearest) |
| **stone_paver_square_01** | `tiles/stone/stone_paver_square_01.png` | 40×39 | 3×2 tiles (40×39 px) | Yes | Static sprite | Cobblestone paths, courtyards, fountain pavement | Scaled Tile Slot (Normalized to 16×16 via canvas/nearest) |
| **stone_paver_square_02** | `tiles/stone/stone_paver_square_02.png` | 40×39 | 3×2 tiles (40×39 px) | Yes | Static sprite | Cobblestone paths, courtyards, fountain pavement | Scaled Tile Slot (Normalized to 16×16 via canvas/nearest) |

### Category: `tiles/transitions` (4 Assets)

| Asset Name | Relative Path | Dimensions | Tile Footprint | Alpha | Animation | Recommended Use | Compatibility |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **trans_grass_to_cliff_edge_01** | `tiles/transitions/trans_grass_to_cliff_edge_01.png` | 40×40 | 3×3 tiles (40×40 px) | Yes | Static sprite | Soft edging between grass, stone, and water | Scaled Tile Slot (Normalized to 16×16 via canvas/nearest) |
| **trans_grass_to_cliff_edge_02** | `tiles/transitions/trans_grass_to_cliff_edge_02.png` | 40×40 | 3×3 tiles (40×40 px) | Yes | Static sprite | Soft edging between grass, stone, and water | Scaled Tile Slot (Normalized to 16×16 via canvas/nearest) |
| **trans_sand_dune_crest** | `tiles/transitions/trans_sand_dune_crest.png` | 40×39 | 3×2 tiles (40×39 px) | Yes | Static sprite | Soft edging between grass, stone, and water | Scaled Tile Slot (Normalized to 16×16 via canvas/nearest) |
| **trans_sand_to_water_shoreline** | `tiles/transitions/trans_sand_to_water_shoreline.png` | 40×39 | 3×2 tiles (40×39 px) | Yes | Static sprite | Soft edging between grass, stone, and water | Scaled Tile Slot (Normalized to 16×16 via canvas/nearest) |

### Category: `tiles/water` (5 Assets)

| Asset Name | Relative Path | Dimensions | Tile Footprint | Alpha | Animation | Recommended Use | Compatibility |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **water_flow_stream_tile_01** | `tiles/water/water_flow_stream_tile_01.png` | 40×38 | 3×2 tiles (40×38 px) | Yes | Static sprite | Woodland pond, river streams, town fountain basin | Scaled Tile Slot (Normalized to 16×16 via canvas/nearest) |
| **water_flow_stream_tile_02** | `tiles/water/water_flow_stream_tile_02.png` | 39×38 | 2×2 tiles (39×38 px) | Yes | Static sprite | Woodland pond, river streams, town fountain basin | Scaled Tile Slot (Normalized to 16×16 via canvas/nearest) |
| **water_pond_waves_deep_blue** | `tiles/water/water_pond_waves_deep_blue.png` | 40×39 | 3×2 tiles (40×39 px) | Yes | Static sprite | Woodland pond, river streams, town fountain basin | Scaled Tile Slot (Normalized to 16×16 via canvas/nearest) |
| **water_river_stream_stones** | `tiles/water/water_river_stream_stones.png` | 40×38 | 3×2 tiles (40×38 px) | Yes | Static sprite | Woodland pond, river streams, town fountain basin | Scaled Tile Slot (Normalized to 16×16 via canvas/nearest) |
| **water_stone_canal_basin** | `tiles/water/water_stone_canal_basin.png` | 64×64 | 4×4 tiles (64×64 px) | Yes | Static sprite | Woodland pond, river streams, town fountain basin | Native 16-bit Grid (Direct Drop-in) |

---

## 5. Technical Compatibility & Integration Assessment

### 1. Tile Dimensions & Grid Scaling
- The game's native tile size is **16 × 16 pixels**.
- Individual ground tiles in the source tileset are ~40×40 px mockup representations. When integrated into the 16×16 tile renderer, they can either:
  1. Be sampled and normalized to 16×16 px using nearest-neighbor resampling to preserve authentic pixel sharpness.
  2. Be rendered via multi-tile decals on Layer 1 ground passes.
- Ground cobblestone and dirt paths already have seamless 16×16 continuous autotiling in `PixelWorldCanvas.jsx`.

### 2. Multi-Tile Environmental Objects & Layering
- **Layer 1 (Ground):** Walkable grass, dirt trails, stone plazas, tilled crop beds, and woodland pond water tiles.
- **Layer 2 (Fences & Bridges):** Split-rail fences and the wooden footbridge deck crossing the pond at `tx: 32, ty: 40..43`.
- **Layer 3 (Y-Sorted Entities):** Buildings, characters (Pip, Bram, Hoot, Clover, Rowan, Wren, Juniper, Moss), large trees, bushes, benches, and barrels. Sorted dynamically by base Y coordinate (`y - b.y`) for flawless depth illusion.
- **Layer 4 (Ambient VFX & Overlays):** 
  - 4a: Additive radial lantern glow halos with organic flame flicker physics.
  - 4b: Drifting bioluminescent fireflies.
  - 4c: Falling cherry blossom petals with sway physics and soft drop shadows.
  - 4d: Floating building signposts and interaction prompts.

### 3. Preserved Invariants & Incompatibilities
- **Zero Incompatible Assets:** All 9 supplied sheets and standalone artworks have been successfully sliced, classified, and indexed without data loss.
- **Section 0.5 Invariant Maintained:** Zero modifications to backend routes (`pages/api/**`), Mongoose models, or database schemas.
- **Interactive Locations Intact:** All 8 `BUILDING_HITBOXES` and 9 interactive chapters retain exact door coordinates, collision bounds, and dialogue bindings.
