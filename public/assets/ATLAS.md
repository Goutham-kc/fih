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
| **(1, 0)** | `grass_tuft` | Grass with wild blades and shadow |
| **(2, 0)** | `grass_flowers` | Grass with red & white wild blossoms |
| **(3, 0)** | `grass_pebbles` | Grass with small grey cobblestones |
| **(4, 0)** | `dirt_center` | Warm sandy dirt path center |
| **(5, 0)** | `dirt_edge_top` | Grass-to-dirt upper transition with irregular teeth |
| **(6, 0)** | `dirt_edge_bottom`| Grass-to-dirt lower transition |
| **(7, 0)** | `soil_tilled` | Dark moist tilled soil garden plot |
| **(0, 1)** | `water_frame_1` | Deep blue pond water with ripple frame 1 |
| **(1, 1)** | `water_frame_2` | Deep blue pond water with ripple frame 2 (animated) |
| **(2, 1)** | `fence_horizontal` | Split-rail wooden fence with ground shadow |
| **(3, 1)** | `fence_post` | Vertical fence post with ground shadow |
| **(4, 1)** | `cobble_square` | Hand-cut stone cobbles with dark mortar |
| **(5, 1)** | `counter_top` | Polished timber ledger counter |
| **(6, 1)** | `prop_balance_scale` | Brass balance scale (tips with ledger net debt) |
| **(7, 1)** | `prop_coin_sack` | Burlap coin sack with gold tie (binds to active debts) |
| **(0, 2)** | `roof_shingles` | Terracotta/wine shingled cabin roof |
| **(1, 2)** | `wall_window_lit` | Timber log wall with warm lit lantern window |
| **(2, 2)** | `door_timber` | Arched wooden cabin door with brass handle |
| **(3, 2)** | `notice_board` | Bulletin board with pinned parchment notes |

---

## 2. Character Spritesheets (`/public/assets/characters/`)

### Pip the Farmer (`pip_walk.png`)
- **Native Resolution:** 64×128 px (4 columns × 4 rows)
- **Frame Size:** 16×32 px
- **Visuals:** Straw hat with crimson band, blue denim dungarees, white undershirt, leather boots, soft ground shadow.
- **Walk Cycle Matrix:**
  - **Row 0 (y = 0):** Facing Down (Frames 0, 1, 2, 3)
  - **Row 1 (y = 32):** Facing Left (Frames 0, 1, 2, 3)
  - **Row 2 (y = 64):** Facing Right (Frames 0, 1, 2, 3)
  - **Row 3 (y = 96):** Facing Up (Frames 0, 1, 2, 3)

### Bram the Badger (`bram_factor.png`)
- **Native Resolution:** 96×32 px (4 columns × 1 row)
- **Frame Size:** 24×32 px
- **Visuals:** Striped facial mask, green accountant visor, brass spectacles, tweed coat, green waistcoat, gold pocket watch chain, quill pen.
- **Frames:**
  - **Col 0 (x = 0):** Idle frame 1
  - **Col 1 (x = 24):** Idle frame 2 (subtle breathing/twitch)
  - **Col 2 (x = 48):** Talk frame 1 (quill poised)
  - **Col 3 (x = 72):** Talk frame 2 (mouth animating, synced to dialogue typewriter)

---

## 3. UI Atlas (`/public/assets/ui/ui_atlas.png`)

- **Native Resolution:** 128×64 px
- **Components:**
  - `(0, 0, 32, 32)`: 9-slice stepped parchment panel frame (dark wood bevel, golden inner border)
  - `(36, 0, 24, 24)`: RPG Hotbar item slot frame
  - `(64, 0, 24, 24)`: Golden active slot highlight brackets
  - `(96, 0, 16, 16)`: 16-bit pixel hand cursor

---

## 4. Fonts (`/public/fonts/`)

1. **Press Start 2P (`PressStart2P-Regular.woff2`)**
   - Headings, badges, hotbar tooltips, button labels
   - License: SIL Open Font License (OFL)
2. **Silkscreen (`Silkscreen-Regular.woff2`, `Silkscreen-Bold.woff2`)**
   - Crisp, readable 16-bit body text, ledger figures, dialogue
   - License: SIL Open Font License (OFL)
