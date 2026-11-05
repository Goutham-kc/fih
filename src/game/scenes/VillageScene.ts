import Phaser from 'phaser';
import { parseMapHubsAndWarps, InteractiveDoor, WarpPoint, InteractivePoint } from '../mapHubs';

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
  private interactKey!: Phaser.Input.Keyboard.Key;
  private spaceKey!: Phaser.Input.Keyboard.Key;
  private lastDirection: 'up' | 'down' | 'left' | 'right' = 'down';

  // Dynamic MapHubs & Meta Interactive Objects
  public interactiveDoors: InteractiveDoor[] = [];
  public warpPoints: WarpPoint[] = [];
  public interactivePoints: InteractivePoint[] = [];
  public activeInteractable: { name: string; prompt: string; action: () => void } | null = null;

  // Prompt Banner HUD
  private promptBg!: Phaser.GameObjects.Rectangle;
  private promptText!: Phaser.GameObjects.Text;
  private promptContainer!: Phaser.GameObjects.Container;

  constructor() {
    super({ key: 'VillageScene' });
  }

  preload(): void {
    // 1. Load village Tiled map and master manifest
    this.load.json('village_manifest', '/village_assets/village_manifest.json');
    this.load.tilemapTiledJSON('village_map', '/village_assets/tiled_map/rm_town.json');

    // 2. Load collision spritesheet and full high-res baked village map
    this.load.image('spr_collision_tile_info', '/village_assets/meta/spr_collision_tile_info.png');
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
    // 1. Create Tilemap
    const map = this.make.tilemap({ key: 'village_map' });

    // High-resolution pre-rendered authentic Fields of Mistria village background
    // (Flawlessly composited: ground, paths, buildings, rivers, bridges, shadows, and flora)
    this.add.image(0, 0, 'rm_town_full').setOrigin(0, 0);

    // 2. Find and create the Tiles_Collision layer (native 8x8 grid matching rm_town)
    const collisionTileset = map.addTilesetImage('tile_collision_info', 'spr_collision_tile_info');
    if (collisionTileset) {
      this.collisionLayer = map.createLayer('Tiles_Collision', collisionTileset);
      if (this.collisionLayer) {
        // Exclude empty tiles (-1, 0) and walkable ground (1504).
        // All other tiles (1506 river bank/curb, 1507 solid walls/cliffs/buildings,
        // 1508 river water, 1510 barriers) are 100% solid colliders!
        this.collisionLayer.setCollisionByExclusion([-1, 0, 1504]);
        this.collisionLayer.setVisible(false);
      }
    }

    // 3. Register 4-directional animations
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

    // 4. Spawn Player at walkable town plaza coordinates (x: 1088, y: 1780)
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

    // 5. Parse and instantiate dynamic MapHubs, Doors, and Warp Points directly from Tiled
    const { hubs, doors, warpPoints, interactivePoints } = parseMapHubsAndWarps(map);
    this.interactiveDoors = doors;
    this.warpPoints = warpPoints;
    this.interactivePoints = interactivePoints;

    console.log(`Loaded ${doors.length} doors, ${warpPoints.length} warps, and ${hubs.length} map hubs from Tiled.`);

    // Set up Arcade Physics overlap zones for all Doors
    doors.forEach((door) => {
      const zone = this.add.zone(door.x + door.width / 2, door.y + door.height / 2, door.width + 16, door.height + 20);
      this.physics.add.existing(zone, true);
      this.physics.add.overlap(this.player, zone, () => {
        this.activeInteractable = {
          name: door.name,
          prompt: door.prompt,
          action: () => {
            console.log(`[Interaction] Entering ${door.name} (${door.destinationId})`);
            this.events.emit('door-enter', door);
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('village-door-enter', { detail: door }));
            }
          },
        };
      });
    });

    // Set up Arcade Physics overlap zones for all Warps (edge of map)
    warpPoints.forEach((warp) => {
      const zone = this.add.zone(warp.x + warp.width / 2, warp.y + warp.height / 2, warp.width + 16, warp.height + 16);
      this.physics.add.existing(zone, true);
      this.physics.add.overlap(this.player, zone, () => {
        this.activeInteractable = {
          name: warp.name,
          prompt: `[E] ${warp.name}`,
          action: () => {
            console.log(`[Interaction] Warping via ${warp.name} (${warp.destinationId})`);
            this.events.emit('warp-transition', warp);
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('village-warp', { detail: warp }));
            }
          },
        };
      });
    });

    // Set up Arcade Physics overlap zones for TrellisPoints (e.g. Notice Board)
    interactivePoints.forEach((pt) => {
      const zone = this.add.zone(pt.x, pt.y, 32, 32);
      this.physics.add.existing(zone, true);
      this.physics.add.overlap(this.player, zone, () => {
        this.activeInteractable = {
          name: pt.name,
          prompt: pt.prompt,
          action: () => {
            console.log(`[Interaction] Activated ${pt.name}`);
            this.events.emit('interactive-point', pt);
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('village-interactive', { detail: pt }));
            }
          },
        };
      });
    });

    // 6. Interactive Prompt Floating HUD
    this.promptText = this.add.text(0, 0, '', {
      fontFamily: 'monospace',
      fontSize: '8px',
      color: '#fef08a',
      backgroundColor: 'transparent',
      align: 'center',
    }).setOrigin(0.5, 0.5);

    this.promptBg = this.add.rectangle(0, 0, 100, 14, 0x1b140f, 0.85);
    this.promptBg.setStrokeStyle(1, 0xa3724c);

    this.promptContainer = this.add.container(spawnX, spawnY - 26, [this.promptBg, this.promptText]);
    this.promptContainer.setDepth(1000);
    this.promptContainer.setVisible(false);

    // 7. Camera Setup: bounds, follow and retro pixel zoom
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setZoom(2.5);

    // 8. Input Controls (Arrow Keys + WASD + E / Space)
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    }) as any;

    this.interactKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
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

    // Handle Active Interactable Prompt and E / Space Trigger
    if (this.activeInteractable) {
      this.promptContainer.setPosition(this.player.x, this.player.y - 28);
      this.promptText.setText(this.activeInteractable.prompt);
      const textW = this.promptText.width;
      this.promptBg.setSize(textW + 12, 14);
      this.promptContainer.setVisible(true);

      if (Phaser.Input.Keyboard.JustDown(this.interactKey) || Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
        this.activeInteractable.action();
      }

      // Reset for next frame; if player remains in overlap zone, it will be re-set
      this.activeInteractable = null;
    } else {
      this.promptContainer.setVisible(false);
    }
  }
}
