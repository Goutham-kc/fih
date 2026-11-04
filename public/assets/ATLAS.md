# Pixel Valley Sprite & Tile Atlas Specification

This document lists every sprite, frame layout, and coordinate in `/public/assets/` per the 16-bit RPG Art Direction Addendum.

---

## 1. Tileset (`/public/assets/tilesets/village_tileset.png`)

- **Native Resolution:** 128x128 px (8 columns × 8 rows)
- **Tile Size:** 16×16 px
- **Rendering:** `imageSmoothingEnabled = false`, integer scaled (3x mobile, 4x desktop)

### Tile Coordinates:
| (Col, Row) | Name | Description |
|:---|:---|:---|
| **(0, 0)** | `grass_plain` | Saturated lush grass with tonal variation |
| **(1, 0)** | `grass_tuft` | Grass with wild clover blades and white daisy |
| **(2, 0)** | `grass_flowers` | Grass with scarlet poppy blossoms |
| **(3, 0)** | `grass_pebbles` | Grass with bluebell flower and river pebble |
| **(4, 0)** | `dirt_center` | Warm sandy dirt path center with earthy stones |
| **(5, 0)** | `dirt_edge_top` | Grass-to-dirt upper transition with spiky grass fringe |
| **(6, 0)** | `dirt_edge_bottom`| Grass-to-dirt lower transition with spiky fringe |
| **(7, 0)** | `soil_tilled` | Dark moist tilled soil garden plot with seed sprouts |
| **(0, 1)** | `water_frame_1` | Deep blue pond water with lily pad and floating pink petal |
| **(1, 1)** | `water_frame_2` | Deep blue pond water with animated ripple |
| **(2, 1)** | `fence_horizontal` | Split-rail wooden fence with dark 1px outline |
| **(3, 1)** | `fence_post` | Vertical fence post with ground shadow |
| **(4, 1)** | `cobble_square` | Hand-cut stone cobbles with dark mortar & highlights |
| **(5, 1)** | `counter_top` | Polished mahogany desk with brass brackets & green velvet runner |
| **(6, 1)** | `prop_balance_scale` | Brass balance scale with dark outline & tilted weights |
| **(7, 1)** | `prop_coin_sack` | Bulging burlap sack with crimson ribbon & spilling gold coins |
| **(0, 2)** | `roof_shingles` | Terracotta scalloped roof shingles with drop shadow |
| **(1, 2)** | `wall_plaster` | Half-timber cream plaster wall with dark oak beams |
| **(2, 2)** | `wall_window_lit` | Half-timber wall with glowing amber window & dark oak shutters |
| **(3, 2)** | `door_merchant` | Arched stone merchant door with iron hinges & gold handle |
| **(4, 2)** | `shop_sign` | Hanging wooden signboard plaque with carved balance icon |
| **(5, 2)** | `cellar_stone` | Ancient stone cellar wall with moss patches |
| **(6, 2)** | `toolshed_rack` | Toolshed pegboard with hanging calipers and saw |
| **(7, 2)** | `festival_bunting`| Festive garland with red, gold, blue, pink pennants |
| **(0, 3)** | `tower_spire` | Bell Tower aged copper spire with belfry arch |
| **(1, 3)** | `clock_face` | Bell Tower porcelain clock face with brass hands |
| **(2, 3)** | `bronze_bell` | Hanging bronze bell with specular shine & clapper |
| **(3, 3)** | `cinema_projector`| Vintage brass film projector on wooden tripod |
| **(4, 3)** | `cinema_screen` | Stretched white canvas projection screen on wooden frame |
| **(5, 3)** | `archive_books` | Oak bookshelf with colorful leather-bound chronicle tomes |
| **(6, 3)** | `toolshed_anvil` | Iron anvil on wood stump with hammer |
| **(7, 3)** | `gazebo_canopy` | Wooden gazebo roof with floral garland |
| **(0, 4)** | `crop_sprout` | Parsnip crop sprout (Stage 1) |
| **(1, 4)** | `crop_growing` | Parsnip crop foliage (Stage 2) |
| **(2, 4)** | `crop_ripe` | Golden parsnip crown ripe in soil (Stage 3 - harvest ready) |
| **(3, 4)** | `crop_berries` | Strawberry / red beet fruit cluster |
| **(4, 4)** | `notice_board` | Community notice board with pinned notices & pushpins |
| **(5, 4)** | `stone_fountain` | Village stone fountain with bubbling water jet |
| **(6, 4)** | `cinema_bench` | Wooden log bench for open-air audience |
| **(7, 4)** | `lantern_post` | Glowing glass lantern on wooden post |
| **(0, 5)** | `tree_oak_top` | Leafy oak tree round green canopy |
| **(1, 5)** | `tree_oak_trunk` | Oak tree trunk with roots and ground shadow |
| **(2, 5)** | `tree_blossom_top`| Fluffy pink cherry blossom canopy |
| **(3, 5)** | `tree_blossom_trunk`| Blossom tree trunk with fallen petals |
| **(4, 5)** | `tree_pine` | Layered evergreen pine tree |
| **(5, 5)** | `bush_berries` | Lush flowering shrub with red berries |
| **(6, 5)** | `signpost_roads` | Wooden road signpost with directional arrows |
| **(7, 5)** | `courier_post` | Perched bluebird Wren on post with letter in beak |

---

## 2. Character Spritesheets (`/public/assets/characters/`)

### Pip the Farmer (`pip_walk.png`)
- **Native Resolution:** 64×128 px (4 columns × 4 rows)
- **Frame Size:** 16×32 px
- **Visuals:** Straw hat with scarlet band and trailing ribbon knot, chestnut curls, peach face with anime eye gleam, indigo denim dungarees with brass buckles and chest pocket, leather boots, soft ground shadow.
- **Walk Cycle Matrix:**
  - **Row 0 (y = 0):** Facing Down (Frames 0, 1, 2, 3)
  - **Row 1 (y = 32):** Facing Left (Frames 0, 1, 2, 3)
  - **Row 2 (y = 64):** Facing Right (Frames 0, 1, 2, 3)
  - **Row 3 (y = 96):** Facing Up (Frames 0, 1, 2, 3)

### Bram the Badger (`bram_factor.png`)
- **Native Resolution:** 96×32 px (4 columns × 1 row)
- **Frame Size:** 24×32 px
- **Visuals:** Pure white badger stripes, emerald banker's visor with bright rim, round golden wire spectacles with lens glint, crimson bowtie, forest-green tweed waistcoat, gold pocket watch chain, quill pen.
- **Frames:**
  - **Col 0 (x = 0):** Idle frame 1
  - **Col 1 (x = 24):** Idle frame 2 (subtle breathing/twitch)
  - **Col 2 (x = 48):** Talk frame 1 (quill poised)
  - **Col 3 (x = 72):** Talk frame 2 (mouth animating, synced to dialogue typewriter)

### Complete Village Resident Cast (Supported via `CharacterSprite.jsx`):
- **Pip:** Novice Farmer (The Farmstead / Daily Quests)
- **Bram:** Honest Factor (The Ledger Hut / Gold Ledger)
- **Hoot:** Timekeeper Owl (The Bell Tower / Mailbox & Alerts)
- **Marigold:** Festival Herald (The Notice Board / Town Deadlines)
- **Clover:** Village Elder (The Festival Grounds / Milestones & Calendar)
- **Juniper:** Cinema Projectionist (The Moonlight Cinema / Watchlist)
- **Moss:** Ancient Chronicler (The Archive Cellar / The Chronicle & Audit Log)
- **Rowan:** Artisan Builder (The Toolshed Workbench / Environment & Settings)
- **Wren:** WhatsApp Courier Bluebird (Sky Post / Dispatches)


---

## 3. Building Sprites (`/public/assets/buildings/`)

### The Farmstead Cabin (`farmhouse.png`)
- **Source:** User Custom Sprite (Cropped to 741×771 px, transparent alpha background)
- **World Rendering:** Scaled to 76×79 world px (placed at world coordinates x: 92, y: 37)
- **Features:** Terracotta tiled roof with twin gables, stone masonry chimney on right, rustic wooden door with stone doorstep, wooden flowerbox planter with pink blossoms, blue-paned window, glowing amber lantern, attic dormer window, cut-stone foundation.
- **Interactive Role:** Chapter 1: The Farmstead (Daily Quests / Todos). Door entrance at world position `(8 * 16, 7 * 16 + 4)`.

### The Notice Board (`notice_board.png`)
- **Source:** User Custom Sprite (Cropped to 752×665 px, transparent alpha background)
- **World Rendering:** Scaled to 52×46 world px (placed at world coordinates x: 262, y: 200)
- **Features:** Timber support posts with stone footing pedestals and pink flower shrubs, terracotta shingled canopy roof, multi-page pinned community notices (house sketch parchment, central town manifest with torn lower hem, list docket, botanical flower illustration).
- **Interactive Role:** Chapter 4: The Notice Board (Town Deadlines). Viewing pad at world position `(18 * 16, 16 * 16)`.
