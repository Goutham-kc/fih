# Fih Valley: Interactive Village Map Overworld & Navigation

The Overworld exploration experience features authentic autotiled dirt paths, solid building collision boundaries, cobblestone plazas, smooth keyboard and click navigation, versatile viewing modes (**Split World View** and **Panel Only View**), a clean **Interactive Welcome & Controls Visibility Flow**, and high-resolution **Custom Building Models** (The Farmstead & The Notice Board).

---

## 1. Feature Highlights

1. **Custom Notice Board Model:**
   - The generic 3-tile board for **The Notice Board** (Chapter 4: Town Deadlines) has been replaced with the user's custom-built 16-bit RPG notice board model.
   - **Art Details:** Sturdy timber support posts with stone footing pedestals and pink flower shrubs, terracotta shingled canopy roof matching the village style, multi-page pinned community notices (house sketch parchment, central town manifest with torn lower hem, list docket, botanical flower illustration).
   - **Viewing Pad Alignment:** The notice board is centered along South Notice Board Avenue (`tx: 17..18`), directly accessible from the cobblestone viewing pad at `(18*16, 16*16)`.
   - **Collision & Proximity:** Solid posts prevent walking through the board, while standing on the viewing pad triggers Marigold's greeting (*"Good morning! The town board has fresh notices pinned with bright festival ribbons. What due dates are ripening? Press [E] to enter or [P] for Panel Only."*) and the `[E] Enter • [P] Panel Only` interaction prompt.

2. **Custom Farmstead House Model:**
   - The generic 4×3 tiled cabin for **The Farmstead** (Chapter 1: Daily Quests / Todos) is replaced with the user's custom-built 16-bit pixel art house model.
   - **Art Details:** Terracotta tiled roof with twin gables, stone chimney on the right, rustic wooden front door, flowerbox with vibrant blossoms, blue-paned sash window, glowing amber lantern, attic dormer window, and stone foundation with center doorstep.
   - **Porch & Path Alignment:** The stone doorstep aligns seamlessly with the cobblestone porch apron at `(8*16, 7*16)`, directly connecting to the 2-tile Northwest Farmstead Lane.

3. **Initial Overworld View on Login / Refresh (`/`):**
   - The map loads with Pip at the central village fountain.
   - **One-Time Welcome & Controls Guide:** On initial login or refresh, Pip welcomes the player and displays the keyboard movement guide (`🎮 WASD / Arrows to Walk • [E] Enter • [P] Panel Only`).

4. **Clean Roaming (Hidden Dialogue & Controls):**
   - As soon as the player starts interacting (pressing WASD / arrow keys, clicking the ground to move, or clicking the dialogue box to dismiss), the Welcome dialogue box and top controls pill **hide automatically**.
   - Roaming the village overworld gives an unobstructed, wide-angle view of the world and nature.

5. **Contextual Proximity Interaction:**
   - Approaching any building entrance brings up the resident's greeting, the top HUD entry pill (`🚪 [E] Enter • [P] Panel Only`), and the in-world floating bubble prompt.

6. **Panel Only Option from the World Map:**
   - **Proximity Key `[P]`:** Near any building entrance, pressing **`P`** opens that chapter directly in full-width **Panel Only** mode.
   - **Proximity Key `[E]`:** Opens in **Split World View** (village canvas + side panel).
   - **In-Panel Toggle (`📜 Panel Only` / `🗺️ Split World`):** Switch between overworld split view and fullscreen panel-only view.
   - **Quick Return to World (`✕ Map (Esc)`):** Pressing `Esc` or clicking `🗺️ Village Map` instantly restores the full village map view.

---

## 2. Visual Walkthrough & Screenshots

### 1. The New Custom Notice Board & Viewing Pad Proximity
*The custom Notice Board rendered on South Notice Board Avenue with pinned parchments, flower drawings, timber posts with floral shrubs, and Marigold's town greeting.*

![Custom Notice Board Model in Live Overworld](/C:/Users/gouth/.gemini/antigravity/brain/7a513e8a-e2f0-4f3b-8051-22e22a3a0e1e/overworld-navigation/overworld-notice-board-custom-desktop.png)

---

### 1b. The Ledger Bank (Custom Sprite Integration)
*The classical neoclassical stone Bank sprite replaces the old wooden ledger hut with a grand pediment, gold coin emblem, "BANK" lintel, four fluted columns, twin royal blue banners with gold coin medallions, double arched wooden doors, tiered stone steps with flanking carved scroll balustrades, and vibrant red and gold flower planter boxes. Bram the Badger Factor stands proudly beside the right balustrade alongside his oak teller stand, brass balance scales, and gold coin sacks.*

![Custom Bank / Ledger Model in Live Overworld](/C:/Users/gouth/.gemini/antigravity/brain/7a513e8a-e2f0-4f3b-8051-22e22a3a0e1e/overworld-navigation/overworld-bank-custom-desktop.png)

---

### 1c. The Belfry Clock & Bell Tower (Custom Sprite Integration)
*The towering stone Clock & Bell Tower rises at the north end of North Belfry Avenue, complete with brass arrow weather vane, conical terracotta tile roof, golden circular clock face with Roman numerals and blue clock hands, slender arched stained-glass windows, arched double wooden entrance doors, and flanking blooming rose flowerboxes on cut-stone plinths.*

![Custom Bell Tower Model in Live Overworld](/C:/Users/gouth/.gemini/antigravity/brain/7a513e8a-e2f0-4f3b-8051-22e22a3a0e1e/overworld-navigation/overworld-bell-tower-custom-desktop.png)

---

### 1d. The Festival Grounds Pavilion (Custom Sprite Integration)
*The grand open-air Festival Grounds (Chapter 5: Milestones & Celebrations) features a majestic wooden pavilion stage with a striped circus-tent canopy, festive fabric bunting, rich draped curtains, hanging amber glass lanterns, wooden speaker's podium, market stalls ("TREATS", "BLOOMS", "WARES"), rows of garden benches, overflowing floral planters, and a circular cobblestone dance plaza seamlessly connecting to the Southeast Festival Lane.*

![Custom Festival Grounds Pavilion in Live Overworld](/C:/Users/gouth/.gemini/antigravity/brain/7a513e8a-e2f0-4f3b-8051-22e22a3a0e1e/overworld-navigation/overworld-festival-custom-desktop.png)

---

### 2. The Custom Farmstead House & Front Porch Proximity
*The custom 16-bit house model rendered in the live world, complete with stone chimney, wooden door, flowerbox, glowing lantern, and stone doorstep aligning with the farm lane.*

![Custom Farmstead House Model in Live Overworld](/C:/Users/gouth/.gemini/antigravity/brain/7a513e8a-e2f0-4f3b-8051-22e22a3a0e1e/overworld-navigation/overworld-farmstead-custom-house-desktop.png)

---

### 3. Initial Login / Refresh View (Welcome & Controls Displayed)
*On initial load, Pip welcomes the player and HUD controls display how to explore.*

![Initial Welcome and Controls on Login](/C:/Users/gouth/.gemini/antigravity/brain/7a513e8a-e2f0-4f3b-8051-22e22a3a0e1e/overworld-navigation/overworld-welcome-desktop.png)

---

### 4. Open World Roaming (Clean, Unobstructed View)
*Once the player starts moving, the welcome box and controls guide automatically hide, leaving the full autotiled village map in clear view.*

![Open World Roaming Unobstructed](/C:/Users/gouth/.gemini/antigravity/brain/7a513e8a-e2f0-4f3b-8051-22e22a3a0e1e/overworld-navigation/overworld-map-desktop.png)

---

### 5. Proximity Interaction at The Ledger Hut
*Approaching a house brings up the resident's greeting, the top HUD proximity prompt (`🚪 [E] Enter • [P] Panel Only`), and the in-world floating bubble.*

![Proximity Prompt at The Ledger Hut](/C:/Users/gouth/.gemini/antigravity/brain/7a513e8a-e2f0-4f3b-8051-22e22a3a0e1e/overworld-navigation/overworld-walk-proximity-desktop.png)

---

### 6. Split World View (Panel + Village Map)
*Pressing `[E]` opens the chapter alongside the village world, with clean chapter headings and the **"📜 Panel Only"** button in the header.*

![Split World View](/C:/Users/gouth/.gemini/antigravity/brain/7a513e8a-e2f0-4f3b-8051-22e22a3a0e1e/overworld-navigation/overworld-entered-ledger-desktop.png)

---

### 7. Fullscreen "Panel Only" View (Desktop)
*Opening with **`[P]`** or clicking **`📜 Panel Only`** gives an unobstructed, centered ledger view, with **`🗺️ Split World`** and **`✕ Map (Esc)`** buttons to easily return.*

![Fullscreen Panel Only View](/C:/Users/gouth/.gemini/antigravity/brain/7a513e8a-e2f0-4f3b-8051-22e22a3a0e1e/overworld-navigation/overworld-panel-only-desktop.png)

---

### 8. Mobile Panel-Only View (Responsive & Touch-Optimized)
*On mobile viewports (≤ 768px), the overworld map canvas is completely disabled to eliminate touch conflicts and performance drain. Mobile is 100% Panel Only, featuring:*
- **Compact Top HUD:** Displays `🌾 Fih Valley`, `• DEV SANDBOX`, `Clock/Season`, and `🪙 Net Gold` in a sleek, non-cluttered header without desktop map switchers.
- **Full Viewport Parchment Panel:** Expands smoothly across the screen with touch-friendly padding (`12px 10px`) and momentum scrolling (`-webkit-overflow-scrolling: touch`).
- **Inline Resident Quote Banner:** Lore and character personality are preserved directly within the parchment header without blocking screen contents.
- **8-Slot Mobile Hotbar:** Hides the Map slot (0) and presents all 8 chapters in 38×38 px touch targets that fit comfortably across standard phone viewports (360–393px) with zero horizontal scrolling.

![Mobile Optimized Panel Only View](/C:/Users/gouth/.gemini/antigravity/brain/7a513e8a-e2f0-4f3b-8051-22e22a3a0e1e/overworld-navigation/overworld-map-mobile.png)

---

## 3. Verification & Compliance Checklist

- [x] **Mobile Panel-Only Mode:** Canvas is completely unmounted on mobile viewports (`window.innerWidth <= 768px`) with zero canvas CPU/touch overhead, defaulting directly to chapter panels (`todos`).
- [x] **Touch-Optimized Mobile Hotbar:** Displays all 8 chapters neatly across mobile screen width without wrapping or scrolling.
- [x] **Mobile Resident Banner:** Inline resident dialogue banner inside the parchment container keeping lore intact.
- [x] **Custom Festival Grounds Pavilion Integrated:** Extracted transparent PNG placed at `/public/assets/buildings/festival_grounds.png` and rendered in the live canvas loop with striped stage canopy, market stalls, flower planter boxes, and cobblestone dance plaza.
- [x] **Custom Belfry Clock & Bell Tower Integrated:** Extracted transparent PNG placed at `/public/assets/buildings/bell_tower.png` and rendered in the live canvas loop with brass weather vane and clock face.
- [x] **Custom Bank / Ledger Model Integrated:** Extracted transparent PNG placed at `/public/assets/buildings/bank.png` and rendered in the live canvas loop with Bram the Badger Factor and oak teller desk.
- [x] **Custom Notice Board Model Integrated:** Extracted transparent PNG placed at `/public/assets/buildings/notice_board.png` and rendered in the live canvas loop.
- [x] **Viewing Pad & Proximity Alignment:** Centered above the cobblestone viewing pad with `[E] Enter • [P] Panel Only` interaction prompt.
- [x] **Custom Farmstead House Model Integrated:** Cropped transparent PNG placed at `/public/assets/buildings/farmhouse.png` and rendered in the live canvas loop.
- [x] **Solid Building Collisions:** Walls and posts prevent walking through structures, preserving open entrance approaches.
- [x] **Welcome & Controls on Initial Load:** Displays once on mount/refresh, auto-hides during roaming.
- [x] **Brand Renamed to Fih Valley:** HUD badge, dialogue, browser title, and lore all display "Fih Valley".
- [x] **Autotiled Paths & Natural Fringes:** All path edges blend seamlessly into grass with authentic spiky pixel grass trims.
- [x] **Consistent 2-Tile Road Width:** Major roads, avenues, and chapter branch lanes are all 32px (2 tiles wide).
- [x] **Panel Only Proximity Key:** `[P]` opens directly in Panel Only mode from the world map.
- [x] **Global Escape Handler:** Restores the village canvas from any mode on desktop; stays gracefully in panels on mobile.
- [x] **Automated Tests:** **55 / 55 passing** in Vitest.
- [x] **ESLint:** **0 errors / 0 warnings**.
- [x] **Production Build:** Clean Next.js 16 Turbopack compilation.
