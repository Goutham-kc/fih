import Phaser from 'phaser';

export class VillageScene extends Phaser.Scene {
  public player!: Phaser.Physics.Arcade.Sprite;
  public collisionLayer: Phaser.Tilemaps.TilemapLayer | Phaser.Tilemaps.TilemapGPULayer | null = null;
  public cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  public wasd!: {
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
  };
  private lastDirection: 'up' | 'down' | 'left' | 'right' = 'down';

  constructor() {
    super({ key: 'VillageScene' });
  }

  preload(): void {
    // 1. Load manifest and village map
    this.load.json('village_manifest', '/village_assets/village_manifest.json');
    this.load.tilemapTiledJSON('village_map', '/village_assets/tiled_map/rm_town.json');

    // 2. Load required tilesets
    this.load.image('spr_collision_tile_info', '/village_assets/meta/spr_collision_tile_info.png');
    this.load.image('spr_main_exteriors_spring', '/village_assets/environment/tilesets/generic/spr_main_exteriors_spring.png');
    this.load.image('spr_farm_ground_grass_spring', '/village_assets/environment/tilesets/farm/spr_farm_ground_grass_spring.png');
    this.load.image('spr_main_exteriors_water_spring', '/village_assets/environment/tilesets/generic/spr_main_exteriors_water_spring.png');
    this.load.image('rm_town_full', '/village_assets/rm_town_full.png');

    // 3. Load 4-direction player walking spritesheets
    // Exact frame size [80, 80] with 4 animation frames per direction
    this.load.spritesheet('player_walk_south', '/village_assets/villagers/Celine/Sprites/Spring/spr_npc_celine_spring_walk_south.png', {
      frameWidth: 80,
      frameHeight: 80,
    });
    this.load.spritesheet('player_walk_north', '/village_assets/villagers/Celine/Sprites/Spring/spr_npc_celine_spring_walk_north.png', {
      frameWidth: 80,
      frameHeight: 80,
    });
    this.load.spritesheet('player_walk_east', '/village_assets/villagers/Celine/Sprites/Spring/spr_npc_celine_spring_walk_east.png', {
      frameWidth: 80,
      frameHeight: 80,
    });
  }

  create(): void {
    // 1. Create Tilemap & Tilesets
    const map = this.make.tilemap({ key: 'village_map' });

    // High-resolution pre-rendered authentic Fields of Mistria village background
    this.add.image(0, 0, 'rm_town_full').setOrigin(0, 0);

    const collisionTileset = map.addTilesetImage('tile_collision_info', 'spr_collision_tile_info');
    const mainExteriors = map.addTilesetImage('tile_main_exteriors_spring', 'spr_main_exteriors_spring');
    const grassTileset = map.addTilesetImage('tile_grassautotile_spring', 'spr_farm_ground_grass_spring');

    // 2. Render visual ground and wall layers if available
    if (grassTileset && mainExteriors) {
      map.createLayer('Level_0_Ground', [grassTileset, mainExteriors]);
      map.createLayer('Level_0_Floor_A', mainExteriors);
      map.createLayer('Level_0_WallsArtificial', mainExteriors);
    }

    // 3. Find and create the Tiles_Collision layer
    if (collisionTileset) {
      this.collisionLayer = map.createLayer('Tiles_Collision', collisionTileset);
      if (this.collisionLayer) {
        // Set collision by exclusion for all non-empty tiles
        this.collisionLayer.setCollisionByExclusion([-1, 0]);
        this.collisionLayer.setVisible(false);
      }
    }

    // 4. Register 4-directional animations
    this.anims.create({
      key: 'walk-down',
      frames: this.anims.generateFrameNumbers('player_walk_south', { start: 0, end: 3 }),
      frameRate: 8,
      repeat: -1,
    });

    this.anims.create({
      key: 'walk-up',
      frames: this.anims.generateFrameNumbers('player_walk_north', { start: 0, end: 3 }),
      frameRate: 8,
      repeat: -1,
    });

    this.anims.create({
      key: 'walk-right',
      frames: this.anims.generateFrameNumbers('player_walk_east', { start: 0, end: 3 }),
      frameRate: 8,
      repeat: -1,
    });

    this.anims.create({
      key: 'walk-left',
      frames: this.anims.generateFrameNumbers('player_walk_east', { start: 0, end: 3 }),
      frameRate: 8,
      repeat: -1,
    });

    // 5. Spawn Player at walkable town plaza coordinates (x: 1088, y: 1780)
    const spawnX = 1088;
    const spawnY = 1780;
    this.player = this.physics.add.sprite(spawnX, spawnY, 'player_walk_south', 0);

    // Adjust player hitbox size to fit feet instead of whole body
    this.player.setSize(18, 14);
    this.player.setOffset(31, 56);

    // Add physics collision between player and collision layer
    if (this.collisionLayer) {
      this.physics.add.collider(this.player, this.collisionLayer);
    }

    // 6. Camera Setup: bounds, follow and retro pixel zoom
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setZoom(2.5);

    // 7. Input Controls (Arrow Keys + WASD)
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    }) as any;
  }

  update(): void {
    if (!this.player || !this.player.body) return;

    let vx = 0;
    let vy = 0;

    // Support both Arrow Keys and WASD
    if (this.cursors.left.isDown || this.wasd.left.isDown) vx -= 1;
    if (this.cursors.right.isDown || this.wasd.right.isDown) vx += 1;
    if (this.cursors.up.isDown || this.wasd.up.isDown) vy -= 1;
    if (this.cursors.down.isDown || this.wasd.down.isDown) vy += 1;

    // Normalize diagonal movement vectors so diagonal speed does not exceed base speed
    if (vx !== 0 && vy !== 0) {
      vx /= Math.SQRT2;
      vy /= Math.SQRT2;
    }

    const speed = 120;
    this.player.setVelocity(vx * speed, vy * speed);

    // Directional animations & idle states
    if (vx !== 0 || vy !== 0) {
      if (Math.abs(vx) > Math.abs(vy)) {
        if (vx > 0) {
          this.player.setFlipX(false);
          this.player.anims.play('walk-right', true);
          this.lastDirection = 'right';
        } else {
          this.player.setFlipX(true);
          this.player.anims.play('walk-left', true);
          this.lastDirection = 'left';
        }
      } else {
        this.player.setFlipX(false);
        if (vy > 0) {
          this.player.anims.play('walk-down', true);
          this.lastDirection = 'down';
        } else {
          this.player.anims.play('walk-up', true);
          this.lastDirection = 'up';
        }
      }
    } else {
      this.player.anims.stop();
      if (this.lastDirection === 'left') {
        this.player.setFlipX(true);
        this.player.setTexture('player_walk_east', 0);
      } else if (this.lastDirection === 'right') {
        this.player.setFlipX(false);
        this.player.setTexture('player_walk_east', 0);
      } else if (this.lastDirection === 'up') {
        this.player.setFlipX(false);
        this.player.setTexture('player_walk_north', 0);
      } else {
        this.player.setFlipX(false);
        this.player.setTexture('player_walk_south', 0);
      }
    }
  }
}
