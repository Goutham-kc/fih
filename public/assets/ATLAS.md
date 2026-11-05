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

## 3. World Geometry & Building Sprites (`/public/assets/buildings/`)

The Pixel Valley overworld map is structured on a **64 × 64 tile grid** (1024 × 1024 px) with 16 px tile size, partitioned into three continuous environments:
- **Zone A (Dense Outer Forest):** 6–8 tiles of natural woodland borders (oaks, pines, blossoms, mushrooms, fallen logs, mossy rocks) enclosing the village.
- **Zone B (Central Village Clearing):** Hand-cut cobblestone plaza (`tx: 28..36, ty: 28..36`) featuring the Central Stone Fountain at `(32, 31)`, The Notice Board at `(32, 35)`, street lanterns, flowerbeds, and wooden resting benches.
- **Zone C (Outer Location Clearings):** Dedicated landscaped environments for each of the 8 village chapters plus the Sky Post.

### 64 × 64 Building Coordinate Registry:
| Building / Landmark | Resident | Chapter | Sprite / Model | Center `(tx, ty)` | Entrance Pad `(doorX, doorY)` | Solid Obstacle `[tx1..tx2, ty1..ty2]` | Hitbox Bounds `[minX..maxX, minY..maxY]` |
|:---|:---|:---|:---|:---|:---|:---|:---|
| **Central Stone Fountain** | — | — | `stone_fountain` (tileset) | `(32, 31)` | `(32*16, 32*16)` | `[32..32, 31..31]` | `[30*16..34*16, 30*16..33*16]` |
| **The Notice Board** | Marigold | Ch. 4 (Town Deadlines) | Custom `notice_board.png` | `(32, 35)` | `(32*16, 36*16)` | `[31..33, 35..35]` | `[30*16..34*16, 32*16..36*16]` |
| **The Bell Tower** | Hoot | Ch. 3 (Belfry Alerts) | Custom `bell_tower.png` | `(32, 10)` | `(32*16, 14*16)` | `[31..33, 9..13]` | `[30*16..34*16, 7*16..14*16]` |
| **The Farmstead** | Pip | Ch. 1 (Daily Quests) | Custom `farmhouse.png` | `(14, 12)` | `(14*16, 14*16)` | `[12..16, 10..13]` | `[11*16..17*16, 9*16..15*16]` |
| **The Ledger Bank** | Bram | Ch. 2 (Gold Ledger) | Custom `bank.png` | `(50, 12)` | `(50*16, 14*16)` | `[48..52, 10..13]` | `[47*16..53*16, 9*16..15*16]` |
| **The Archive Cellar** | Moss | Ch. 7 (The Chronicle) | Custom `archive_cellar.png` | `(12, 32)` | `(12*16, 33*16)` | `[10..14, 29..32]` | `[9*16..15*16, 28*16..34*16]` |
| **The Toolshed Workbench** | Rowan | Ch. 8 (Toolshed Workshop) | `toolshed_rack` & anvil | `(16, 22)` | `(16*16, 23*16)` | `[15..17, 21..22]` | `[14*16..18*16, 20*16..24*16]` |
| **Sky Post** | Wren | Dispatches | `courier_post` (tileset) | `(48, 24)` | `(48*16, 25*16)` | `[47..49, 23..24]` | `[46*16..50*16, 22*16..26*16]` |
| **The Festival Grounds** | Clover | Ch. 5 (Festival Grounds) | Custom `festival_grounds.png` | `(16, 48)` | `(16*16, 51*16)` | `[14..18, 47..49]` | `[12*16..20*16, 44*16..52*16]` |
| **The Moonlight Cinema** | Juniper | Ch. 6 (Moonlight Cinema) | Custom `moonlight_cinema.png` | `(48, 48)` | `(48*16, 51*16)` | `[46..50, 47..49]` | `[44*16..52*16, 44*16..52*16]` |
| **Woodland Pond & Footbridge**| — | Water Feature | Animated water & wooden bridge| `(32, 41)` | `(32*16, 41*16)` | `[30..34, 40..43]` (excl. 32)| — |
| **The Whispering Pines Inn**  | Innkeeper | Optional Village Tavern | Custom `inn_tavern.png`       | `(25, 16)` | `(25*16, 17*16)` | `[23..26, 14..16]` | — |
| **Lavender Artisan Cottage**  | Artisan   | Optional Dwelling       | Custom `cottage_lavender.png` | `(41, 17)` | `(41*16, 18*16)` | `[39..42, 14..17]` | — |
| **Village Market Produce Stall**| Merchant | Optional Market Stand   | Custom `market_stall.png`     | `(35, 31)` | `(35*16, 32*16)` | `[35..36, 31..31]` | — |

### Custom Building Sprite Specifications:

### The Farmstead Cabin (`farmhouse.png`)
- **Source:** User Custom Sprite (Cropped to 741×771 px, transparent alpha background)
- **World Rendering:** Scaled to 76×79 world px (placed at world coordinates x: 186, y: 149)
- **Features:** Terracotta tiled roof with twin gables, stone masonry chimney on right, rustic wooden door with stone doorstep, wooden flowerbox planter with pink blossoms, blue-paned window, glowing amber lantern, attic dormer window, cut-stone foundation.
- **Interactive Role:** Chapter 1: The Farmstead (Daily Quests / Todos). Door entrance at world position `(14 * 16, 14 * 16)`.

### The Notice Board (`notice_board.png`)
- **Source:** User Custom Sprite (Cropped to 752×665 px, transparent alpha background)
- **World Rendering:** Scaled to 52×46 world px (placed at world coordinates x: 486, y: 520)
- **Features:** Timber support posts with stone footing pedestals and pink flower shrubs, terracotta shingled canopy roof, multi-page pinned community notices (house sketch parchment, central town manifest with torn lower hem, list docket, botanical flower illustration).
- **Interactive Role:** Chapter 4: The Notice Board (Town Deadlines). Viewing pad at world position `(32 * 16, 36 * 16)`.

### The Ledger Bank (`bank.png`)
- **Source:** User Custom Sprite (Cropped to 862×862 px, transparent alpha background)
- **World Rendering:** Scaled to 86×86 world px (placed at world coordinates x: 757, y: 142)
- **Features:** Neoclassical stone portico with pediment, gold coin medallion, carved "BANK" lintel, four fluted columns, twin royal blue banners with gold coin medallions, double arched wooden doors with brass rings, tiered stone steps with flanking carved scroll balustrades, and vibrant red and gold flower planter boxes.
- **Interactive Role:** Chapter 2: The Ledger Hut (Gold Ledger & Tab Inscriptions / Debts). Front doorstep at world position `(50 * 16, 14 * 16)`, with Bram the Badger Factor standing beside the right balustrade alongside his oak teller stand, brass balance scales, and gold coin sacks.

### The Belfry Clock & Bell Tower (`bell_tower.png`)
- **Source:** User Custom Sprite (Cropped to 443×945 px, transparent alpha background)
- **World Rendering:** Scaled to 46×98 world px (placed at world coordinates x: 489, y: 128)
- **Features:** Soaring multi-tiered stone clock and bell tower with brass arrow weather vane, conical terracotta tile roof, golden circular clock face with Roman numerals and blue clock hands, slender arched stained-glass windows, arched double wooden entrance doors, and flanking blooming rose flowerboxes on cut-stone plinths.
- **Interactive Role:** Chapter 3: The Bell Tower (Belfry Alerts & Reminders / Reminders). Front doorstep at world position `(32 * 16, 14 * 16)` facing North Belfry Avenue.

### The Festival Grounds Pavilion (`festival_grounds.png`)
- **Source:** User Custom Sprite (Cropped to 853×626 px, transparent alpha background)
- **World Rendering:** Scaled to 128×94 world px (placed at world coordinates x: 192, y: 742)
- **Features:** Festive striped timber pavilion stage, hanging brass and paper party lanterns, theatrical drapery, wood speaker's lectern, circular stone dance floor apron, market stalls ("TREATS", "BLOOMS", "WARES"), decorative bunting, and wooden benches.
- **Interactive Role:** Chapter 5: The Festival Grounds (Milestones & Calendar / Dates). Dance floor apron at world position `(16 * 16, 51 * 16)`.

### The Moonlight Cinema Amphitheater (`moonlight_cinema.png`)
- **Source:** User Custom Sprite (Cropped to 853×619 px, transparent alpha background)
- **World Rendering:** Scaled to 128×93 world px (placed at world coordinates x: 704, y: 743)
- **Features:** Open-air woodland amphitheater, carved wooden cinema screen with crescent moon and star pediment crest, purple and twilight blue drapery, hanging star & moon string lanterns, tickets booth, popcorn machine wagon cart, concentric tiered wooden viewing benches, and street lamps.
- **Interactive Role:** Chapter 6: The Moonlight Cinema (Watchlist & Screenings / Watchlist). Audience entrance at world position `(48 * 16, 51 * 16)`.

### The Archive Cellar (`archive_cellar.png`)
- **Source:** User Custom Sprite (Cropped to 711×849 px, transparent alpha background)
- **World Rendering:** Scaled to 76×90 world px (placed at world coordinates x: 154, y: 450)
- **Features:** Weathered cut-stone masonry with moss accents, pitched terracotta tiled roof with decorative gable ridge, circular attic window, carved wooden signboard featuring an open book and quill insignia, arched double timber doors with forged iron hinges and warm golden interior light, wide stone steps, flanking iron lanterns, leather-bound book stacks, wooden barrels, and blooming flower planters.
- **Interactive Role:** Chapter 7: The Archive Cellar (The Chronicle & Audit Log / Audit). Front entrance doorstep pad at world position `(12 * 16, 33 * 16)` facing West Archive Way.

### The Whispering Pines Inn & Tavern (`inn_tavern.png`)
- **Source:** User Reference Asset Sheet (Cropped to 265×260 px, transparent alpha background)
- **World Rendering:** Scaled to 72×70 world px (placed at world coordinates x: 364, y: 204, center tx: 25, ty: 17)
- **Features:** Two-story half-timbered woodland inn with terracotta tile gables, hanging carved "INN" signboard, warm amber glowing lantern, blue shuttered windows, rustic arched timber door, potted pink blossoms, adjacent citrus fruit tree, and stacked cider/ale barrels.
- **Role:** Optional village gathering landmark framing the northern village street between the Farmstead and the Bell Tower.

### The Lavender Artisan Cottage (`cottage_lavender.png`)
- **Source:** User Reference Asset Sheet (Cropped to 195×360 px, transparent alpha background)
- **World Rendering:** Scaled to 52×88 world px (placed at world coordinates x: 630, y: 202, center tx: 41, ty: 18)
- **Features:** Tall storybook cottage with steep violet/lavender shingled gabled roof, grey stone brick chimney, diamond artisan plaque, shuttered cross-pane windows, half-timber cream plaster walls, arched timber doorway, and potted doorstep greenery.
- **Role:** Optional artisan dwelling framing the northern avenue between the Bell Tower and the Ledger Bank.

### Village Market Produce Stall (`market_stall.png`)
- **Source:** User Reference Asset Sheet (Cropped to 146×126 px, transparent alpha background)
- **World Rendering:** Scaled to 42×36 world px (placed at world coordinates x: 556, y: 476, center tx: 35, ty: 31)
- **Features:** Striped orange-and-cream canvas awning canopy over a carved wooden merchant table displaying fresh harvest produce, fruit bowls, and purple grape bunches.
- **Role:** Optional market stall on the eastern edge of Central Plaza cobblestones.

---

## 4. Woodland Trees & Environmental Prop Sprites (`/public/assets/trees/`)

Dedicated 16-bit RPG woodland vegetation and environmental clutter sprites designed for natural perimeter forest density and organic village landscaping.

### Asset Registry:
| Asset | File | Dimensions | Rendering Offset | Description |
|:---|:---|:---|:---|:---|
| **Large Oak Tree** | `oak_large.png` | 36×48 px | `x - 8, y - 32` | Broad leafy oak canopy with organic multi-lobed foliage clusters, layered shadow/sunlit leaves, sturdy gnarled trunk with roots, and ground drop shadow. Overlaps across 2-tile grid spacing to create continuous woodland canopy banks. |
| **Large Pine Conifer** | `pine_large.png` | 32×48 px | `x - 8, y - 32` | Majestic conifer evergreen pine with four stepped conical needle tiers, rich forest emerald palette, textured wood trunk, and soft base shadow. |
| **Large Cherry Blossom** | `blossom_large.png` | 36×48 px | `x - 8, y - 32` | Billowy flowering cherry blossom tree with vibrant magenta and petal-pink canopy clusters, dark cherry bark trunk, and romantic woodland atmosphere. |
| **Stone Village Fountain** | `fountain_stone.png` | 32×32 px (2×2 tiles) | `x, y` | Ornate carved octagonal stone basin with stepped base, pedestal column, and active bubbling fountain jet with crystal water spray. |
| **Street Lantern Post** | `lantern_post.png` | 16×24 px (1×1.5 tiles) | `x, y - 8` | Wrought-iron village lamppost with four-paned glass carriage housing a warm glowing amber flame, casting ambient nighttime illumination. |
| **Wooden Park Bench** | `bench_wood.png` | 24×14 px (1.5×1 tiles)| `x - 4, y + 2` | Rustic slotted cedar garden bench with carved armrests and cast iron footings, placed along plaza walkways and meeting spots. |
| **Weathered Tree Stump**| `tree_stump.png` | 18×18 px | `x - 1, y - 2` | Ancient cut timber stump with detailed annular rings, bark striations, and tiny moss shoots. |
| **Flowering Emerald Bush**| `bush_green.png` | 22×18 px | `x - 3, y - 2` | Dense rounded garden shrub in deep woodland green with layered leaf tufts. |
| **Golden Flowering Bush**| `bush_yellow.png` | 22×18 px | `x - 3, y - 2` | Flowering shrub dotted with yellow buttercups and golden star blooms. |
| **Crimson Berry Bush** | `bush_red.png` | 22×18 px | `x - 3, y - 2` | Lush hedge shrub with ripe scarlet berries and dark green foliage. |
| **Tiered Topiary Shrub**| `bush_tiered.png` | 22×18 px | `x - 3, y - 2` | Two-tier clipped decorative garden shrub used in formal courtyards and plaza corners. |
| **Pastel Flower Bush** | `bush_flowers.png` | 24×18 px | `x - 4, y - 2` | Sprawling garden shrub laden with white and lavender wild blossoms. |
| **Scarlet Poppies** | `flowers_poppy.png` | 16×16 px | `x, y` | Vibrant crimson poppy flowerbed with black seed centers and green leafy stems. |
| **White Daisies** | `flowers_daisy.png` | 16×16 px | `x, y` | Cheerful cluster of white field daisies with bright yellow button centers. |
| **Golden Sunflowers** | `flowers_sunflower.png` | 14×18 px | `x + 1, y - 2` | Tall nodding sunflower with golden petals and chocolate seed head, lining garden fences. |
| **Fallen Mossy Log** | `fallen_log.png` | 32×16 px (2×1 tiles) | `x - 8, y` | Weathered fallen tree trunk with cut end growth rings, bark ridges, verdant moss mantle draping the top curve, and a tiny red sprout mushroom. |
| **Mossy River Boulder** | `rock_moss.png` | 20×16 px | `x, y` | Rounded ancient river stone with slate blue contours, specular highlights, and lush moss cap on upper crest. |
| **Amanita Mushrooms** | `mushrooms.png` | 16×16 px (1×1 tile) | `x, y` | Cluster of three woodland amanita mushrooms with vibrant red domed caps, white spots, cream stalks, and ground shadow. |

