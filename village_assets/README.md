# Village Asset Pack (React + Phaser 3 + Tiled)

Curated pixel art assets for building a top-down 2D village game.

## Directory Structure

```
village_assets/
├── animals/              # Farm animals & pets (Cow, Chicken, Dog, Cat) with idle/walk/action frames
├── architecture/         # Stone bridges, town walls, market stalls, stone decals
├── buildings/            # Village shops and houses (General Store, Blacksmith, Inn, Cottage, Clinic, Manor, Mill, Barn, Coop, Greenhouse)
├── environment/          # Trees (Oak, Pine, Birch), foliage, weeds, ground & soil tilesets
├── fonts/                # TrueType pixel and dialogue fonts (@font-face)
├── objects/              # Interactive town props (Fences, Street lanterns, Shipping bin, Crafting tables, Storage chests)
├── tiled_map/            # Tiled Town Map (`rm_town.tmx`) and all referenced tilesets (`.tsx`)
├── ui/                   # In-game dialogue boxes, cursor icons, item slots, and packed UIAtlas.png
├── villagers/            # 5 key town villagers (Adeline, Celine, March, Hayden, Balor) with animation sprites & seasonal portraits
└── village_manifest.json # Frame sizes, frame counts, durations, and offsets for every sprite
```

---

## Phaser 3 Integration Examples

### 1. Slicing Spritesheets with `village_manifest.json`

Every sprite in `village_manifest.json` contains its exact slice dimensions (`frame_size: [width, height]`), frame count (`frame_len`), and frame durations:

```javascript
import Phaser from 'phaser';
import villageManifest from './village_manifest.json';

class VillageScene extends Phaser.Scene {
  preload() {
    // 1. Load an NPC (e.g. Celine walking south)
    const celineSprite = 'villagers/Celine/Sprites/Spring/spr_npc_celine_spring_walk_south.png';
    const celineMeta = villageManifest[celineSprite];

    this.load.spritesheet('celine_walk_south', celineSprite, {
      frameWidth: celineMeta.frame_size[0],
      frameHeight: celineMeta.frame_size[1]
    });

    // 2. Load an Animal (e.g. Dog walking)
    const dogSprite = 'animals/dog/spr_pet_dog_basic_base_walk_east.png';
    const dogMeta = villageManifest[dogSprite];

    this.load.spritesheet('dog_walk_east', dogSprite, {
      frameWidth: dogMeta.frame_size[0],
      frameHeight: dogMeta.frame_size[1]
    });
  }

  create() {
    // Play sprite animations
    this.anims.create({
      key: 'walk',
      frames: this.anims.generateFrameNumbers('celine_walk_south'),
      frameRate: 8,
      repeat: -1
    });

    const npc = this.add.sprite(200, 200, 'celine_walk_south');
    npc.play('walk');
  }
}
```

---

### 2. Loading the Village Tiled Map (`rm_town.tmx`)

The `tiled_map/rm_town.tmx` file can be opened and edited in Tiled or loaded directly via Phaser / `@arcade-city/phaser-tiled`:

```javascript
// Export rm_town.tmx to JSON in Tiled (File > Export As > JSON map)
this.load.tilemapTiledJSON('town_map', 'tiled_map/rm_town.json');
```

---

### 3. Using In-Game Fonts in React / CSS

```css
@font-face {
  font-family: 'Birdseed';
  src: url('./fonts/fnt_mistria_birdseed.ttf') format('truetype');
}

@font-face {
  font-family: 'PixelCubic';
  src: url('./fonts/fnt_cubic_11.ttf') format('truetype');
}

.dialogue-text {
  font-family: 'Birdseed', monospace;
  font-size: 18px;
  image-rendering: pixelated;
}
```
