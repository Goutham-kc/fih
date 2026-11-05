const fs = require('fs');
const path = require('path');

const baseDir = path.resolve('public/assets');

function generateCatalog() {
  const categories = [
    'buildings/landmarks',
    'buildings/residences',
    'buildings/utilities',
    'characters/hero',
    'nature/bushes',
    'nature/flowers',
    'nature/logs',
    'nature/mushrooms',
    'nature/rocks',
    'nature/trees',
    'structures/bridges',
    'structures/props',
    'structures/shrines',
    'tiles/autotiles',
    'tiles/terrains'
  ];

  let totalAssets = 0;
  const sections = {};

  categories.forEach(cat => {
    const full = path.join(baseDir, cat);
    if (fs.existsSync(full)) {
      const files = fs.readdirSync(full).filter(f => f.endsWith('.png'));
      totalAssets += files.length;
      sections[cat] = files;
    }
  });

  let md = `# PIXEL VALLEY — OFFICIAL ASSET CATALOG & INVENTORY

> **Date:** November 2026  
> **Status:** 100% Pure New Asset Collection  
> **Total Production Assets:** ${totalAssets}  
> **Native Tile Resolution:** 16 × 16 pixels (Integer Scaling)  
> **Source Sheets:** 5 Provided Master Sheets (All legacy assets dropped)

---

## 1. Source Sheets & Domain Overview

All assets in this inventory originate strictly from the 5 supplied master sheets:

1. **\`sheet_village_structures_and_buildings.jpg\`**: Village cottages, 2-story tavern inn, watermill, windmill, market stalls, fortress palisade gate, lookout watchtowers, red shrine, garden gazebo, arched footbridge, and iron lanterns.
2. **\`sheet_terrain_cliffs_props_and_shrines.jpg\`**: 9 Ground terrain tiles, cliff plateaus, rope suspension bridge, props, and **The 8 Elemental Shrines & Crystals** (Fire, Water, Earth, Nature, Air, Lightning, Light, Void).
3. **\`sheet_16x16_autotiles_and_cliffs.png\`**: Native 16×16 autotile transitions (grass-dirt edges, corners, center, cliff vertical walls & skirts).
4. **\`sheet_16bit_nature_trees_and_foliage.png\`**: Native 16-bit nature atlas (oak, birch, pine, conifer, apple, spooky trees, stumps, fallen logs, boulders, mushrooms, and flower clusters).
5. **\`sheet_hero_character_animations.png\`**: 10 columns × 12 rows 4-directional hero animations (idle poses, walk cycles, tool actions, and holding poses).

---

## 2. Production Asset Registry by Category

`;

  Object.keys(sections).sort().forEach(cat => {
    const files = sections[cat];
    md += `### Category: \`${cat}\` (${files.length} Assets)\n\n`;
    md += `| Asset Name | Relative Path | Recommended Use | Compatibility |\n`;
    md += `| :--- | :--- | :--- | :--- |\n`;
    files.forEach(f => {
      const name = f.replace('.png', '');
      let rec = 'Environment prop / Terrain base';
      let comp = 'Native 16-bit Grid';
      if (cat.startsWith('buildings')) {
        rec = 'Overworld village building / Interactive chapter landmark';
        comp = 'Layer 3 Y-Sorted Entity';
      } else if (cat.startsWith('characters')) {
        rec = 'Player / NPC 4-directional animation frame';
        comp = 'Animated Character Grid';
      } else if (cat.includes('shrines')) {
        rec = 'Elemental mystery altar / Shrine landmark';
        comp = 'Layer 3 Y-Sorted Entity';
      } else if (cat.includes('trees')) {
        rec = 'Overworld woodland canopy';
        comp = 'Layer 3 Y-Sorted Entity';
      } else if (cat.includes('autotiles')) {
        rec = 'Procedural ground autotiling';
        comp = 'Direct 16×16 Drop-in';
      }
      md += `| **${name}** | \`${cat}/${f}\` | ${rec} | ${comp} |\n`;
    });
    md += `\n`;
  });

  md += `---

## 3. Visual Previews Contact Sheets

All 5 visual preview contact sheets are located in \`public/assets/previews/\`:
1. **Village Architecture & Landmarks:** [\`preview_1_buildings_and_landmarks.png\`](file:///c:/Users/gouth/Projects/fih/public/assets/previews/preview_1_buildings_and_landmarks.png)
2. **Elemental Shrines & Crystals:** [\`preview_2_elemental_shrines_and_crystals.png\`](file:///c:/Users/gouth/Projects/fih/public/assets/previews/preview_2_elemental_shrines_and_crystals.png)
3. **16x16 Autotiles & Terrain Transitions:** [\`preview_3_autotiles_and_terrain.png\`](file:///c:/Users/gouth/Projects/fih/public/assets/previews/preview_3_autotiles_and_terrain.png)
4. **16-bit Nature Flora, Trees & Rocks:** [\`preview_4_trees_rocks_nature.png\`](file:///c:/Users/gouth/Projects/fih/public/assets/previews/preview_4_trees_rocks_nature.png)
5. **Hero Character Animations:** [\`preview_5_hero_animations.png\`](file:///c:/Users/gouth/Projects/fih/public/assets/previews/preview_5_hero_animations.png)
`;

  fs.writeFileSync(path.join(baseDir, 'ASSET_CATALOG.md'), md);
  console.log(`Generated pure ASSET_CATALOG.md with ${totalAssets} assets.`);
}

generateCatalog();
