export default function createVillageScene(Phaser) {
  const TILE_SIZE = 16;

  // Chapter building anchors & Fields of Mistria landmarks
  const CHAPTER_BUILDINGS = [
    { id: 'todos', imageKey: 'farmhouse', tx: 14, ty: 14, w: 76, h: 79, doorTx: 14, doorTy: 14, label: 'The Farmstead', icon: '🌾' },
    { id: 'debts', imageKey: 'watermill', tx: 50, ty: 14, w: 86, h: 86, doorTx: 50, doorTy: 14, label: 'Riverside Mill & Ledger', icon: '🌊' },
    { id: 'reminders', imageKey: 'bell_tower', tx: 32, ty: 14, w: 46, h: 98, doorTx: 32, doorTy: 14, label: 'The Bell Tower', icon: '🔔' },
    { id: 'deadlines', imageKey: 'notice_board', tx: 32, ty: 24, w: 52, h: 46, doorTx: 32, doorTy: 24, label: 'Town Square Notice Board', icon: '📋' },
    { id: 'dates', imageKey: 'festival_grounds', tx: 16, ty: 51, w: 128, h: 94, doorTx: 16, doorTy: 51, label: 'Festival Grounds & Bazaar', icon: '🎪' },
    { id: 'watchlist', imageKey: 'moonlight_cinema', tx: 48, ty: 51, w: 128, h: 93, doorTx: 48, doorTy: 51, label: 'Moonlight Gazebo', icon: '🌸' },
    { id: 'audit', imageKey: 'archive_cellar', tx: 12, ty: 33, w: 76, h: 90, doorTx: 12, doorTy: 33, label: 'Ancient Mistria Ruins', icon: '🏛️' },
    { id: 'settings', imageKey: 'toolshed', tx: 52, ty: 33, w: 76, h: 90, doorTx: 52, doorTy: 33, label: 'Artisan Workshop & Forge', icon: '⚒️' },
    // Landmark residences & Mistria town life
    { id: 'inn', imageKey: 'inn_tavern', tx: 24, ty: 24, w: 72, h: 70, doorTx: 24, doorTy: 25, label: 'The Sleeping Lily Tavern', icon: '🍺' },
    { id: 'cottage', imageKey: 'cottage_lavender', tx: 40, ty: 24, w: 52, h: 88, doorTx: 40, doorTy: 25, label: 'Lavender Herb Cottage', icon: '🌿' },
    { id: 'market_fest', imageKey: 'market_festival', tx: 28.5, ty: 31, w: 42, h: 36, doorTx: 28, doorTy: 32, label: 'Produce Bazaar', icon: '🍎' },
    { id: 'market', imageKey: 'market_stall', tx: 35.5, ty: 31, w: 42, h: 36, doorTx: 35, doorTy: 32, label: 'General Store Stall', icon: '🧺' },
    { id: 'well', imageKey: 'stone_well', tx: 19, ty: 25, w: 32, h: 36, doorTx: 19, doorTy: 26, label: 'Wishing Well', icon: '🪣' },
  ];

  return class VillageScene extends Phaser.Scene {
    constructor() {
      super({ key: 'VillageScene' });
      this.player = null;
      this.cursors = null;
      this.wasd = null;
      this.clickTarget = null;
      this.currentNearby = null;
      this.depthEntities = [];
      this.rainDrops = [];
      this.petals = [];
      this.sparkles = [];
      this.animTimer = 0;
    }

    create() {
      // 1. Tiled Tilemap Layers
      const map = this.make.tilemap({ key: 'village_map' });
      const tileset = map.addTilesetImage('village_tileset', 'village_tileset');

      this.groundLayer = map.createLayer('Ground', tileset, 0, 0);
      this.pathsLayer = map.createLayer('Paths', tileset, 0, 0);
      this.collisionLayer = map.createLayer('Collision', tileset, 0, 0);
      this.collisionLayer.setCollisionByExclusion([0]);
      this.collisionLayer.setVisible(false);

      // 2. Player Arcade Physics Sprite
      const spawnX = 32 * TILE_SIZE;
      const spawnY = 33 * TILE_SIZE;
      this.player = this.physics.add.sprite(spawnX, spawnY, 'pip', 0);
      this.player.setOrigin(0.5, 0.85);
      this.player.body.setSize(12, 10);
      this.player.body.setOffset(2, 22);
      this.player.setCollideWorldBounds(true);
      this.physics.add.collider(this.player, this.collisionLayer);
      this.depthEntities.push(this.player);

      // 3. Pixel-Perfect Camera Follow
      this.cameras.main.setBounds(0, 0, 64 * TILE_SIZE, 64 * TILE_SIZE);
      this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
      this.cameras.main.setZoom(2.0);
      this.cameras.main.roundPixels = true;

      // 4. Input Controls (Keyboard WASD + Arrows + Click)
      this.cursors = this.input.keyboard.createCursorKeys();
      this.wasd = this.input.keyboard.addKeys({
        up: Phaser.Input.Keyboard.KeyCodes.W,
        down: Phaser.Input.Keyboard.KeyCodes.S,
        left: Phaser.Input.Keyboard.KeyCodes.A,
        right: Phaser.Input.Keyboard.KeyCodes.D,
        space: Phaser.Input.Keyboard.KeyCodes.SPACE,
        enter: Phaser.Input.Keyboard.KeyCodes.ENTER,
      });

      // Pointer click to walk
      this.input.on('pointerdown', (pointer) => {
        const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
        this.clickTarget = { x: worldPoint.x, y: worldPoint.y };
      });

      // 5. Buildings & Architecture Entities
      this.buildingsGroup = this.add.group();
      CHAPTER_BUILDINGS.forEach((b) => {
        const bx = b.tx * TILE_SIZE;
        const by = b.ty * TILE_SIZE;
        const sprite = this.add.image(bx, by, b.imageKey);
        sprite.setOrigin(0.5, 1.0);
        sprite.setDisplaySize(b.w, b.h);
        sprite.setInteractive({ useHandCursor: true });
        sprite.buildingData = b;

        sprite.on('pointerdown', () => {
          this.game.events.emit('building-clicked', b);
        });

        // Floating signpost banner
        const banner = this.add.text(bx, by - b.h - 6, `${b.icon} ${b.label}`, {
          fontFamily: 'monospace',
          fontSize: '8px',
          color: '#ffffff',
          backgroundColor: 'rgba(28, 17, 10, 0.88)',
          padding: { x: 4, y: 2 },
        }).setOrigin(0.5, 0.5);
        banner.setDepth(9999);

        this.depthEntities.push(sprite);
      });

      // 6. Fields of Mistria Nature, Foliage, Shrines & Water
      this.setupMistriaFoliage();

      // 7. Cozy Reference Props (Octagonal Fountain, Fenced 3-Row Garden, Firewood, Lanterns, Bunting)
      this.setupCozyProps();

      // 8. Magical Atmosphere System (Cherry Blossom Petals & Sparkle Motes)
      this.setupMistriaAtmosphere();
    }

    setupMistriaFoliage() {
      // 1. Woodland Pond, Footbridge & Fishing Pier
      const bridge = this.add.image(32 * TILE_SIZE, 44.5 * TILE_SIZE, 'bridge_wood');
      bridge.setOrigin(0.5, 0.5);
      bridge.setDisplaySize(54, 42);
      bridge.setDepth(44 * TILE_SIZE);

      const pier = this.add.image(34 * TILE_SIZE, 46.5 * TILE_SIZE, 'dock_pier');
      pier.setOrigin(0.5, 0.5);
      pier.setDisplaySize(38, 32);
      pier.setDepth(45 * TILE_SIZE);

      // Bobbing Lilypads with blooming pink lotus
      this.add.image(30.6 * TILE_SIZE, 43.2 * TILE_SIZE, 'lilypad').setDisplaySize(18, 18).setDepth(43 * TILE_SIZE);
      this.add.image(33.3 * TILE_SIZE, 44.2 * TILE_SIZE, 'lilypad_flower').setDisplaySize(18, 18).setDepth(44 * TILE_SIZE);
      this.add.image(31.2 * TILE_SIZE, 44.7 * TILE_SIZE, 'lilypad').setDisplaySize(18, 18).setDepth(44 * TILE_SIZE);

      // Shoreline cattails
      this.add.image(29.5 * TILE_SIZE, 44.0 * TILE_SIZE, 'cattails').setDisplaySize(20, 28).setOrigin(0.5, 1).setDepth(44 * TILE_SIZE);
      this.add.image(34.2 * TILE_SIZE, 42.2 * TILE_SIZE, 'cattails').setDisplaySize(20, 28).setOrigin(0.5, 1).setDepth(43 * TILE_SIZE);

      // 2. Ancient Mistria Clover Shrine & Glowing Crystals (West Glade)
      const shrine = this.add.image(16 * TILE_SIZE, 33 * TILE_SIZE, 'shrine_clover');
      shrine.setOrigin(0.5, 1.0);
      shrine.setDisplaySize(48, 54);
      this.depthEntities.push(shrine);

      const crys1 = this.add.image(14 * TILE_SIZE, 33.5 * TILE_SIZE, 'crystals_blue').setDisplaySize(22, 22).setOrigin(0.5, 1);
      const crys2 = this.add.image(17.5 * TILE_SIZE, 33.5 * TILE_SIZE, 'crystals_purple').setDisplaySize(22, 22).setOrigin(0.5, 1);
      this.depthEntities.push(crys1);
      this.depthEntities.push(crys2);

      // 3. Pastoral Farmstead Windmill & Thatch Cottage (North-West)
      const windmill = this.add.image(9 * TILE_SIZE, 11 * TILE_SIZE, 'windmill');
      windmill.setOrigin(0.5, 1.0);
      windmill.setDisplaySize(54, 76);
      this.depthEntities.push(windmill);

      const thatch = this.add.image(18.5 * TILE_SIZE, 14 * TILE_SIZE, 'cottage_thatch');
      thatch.setOrigin(0.5, 1.0);
      thatch.setDisplaySize(58, 56);
      this.depthEntities.push(thatch);

      // 4. Village Trees (Fluffy Oaks, Slender Birch Blossoms, Stately Pines)
      const trees = [
        { key: 'tree_oak', x: 6, y: 15, w: 46, h: 62 },
        { key: 'tree_blossom', x: 21, y: 15, w: 42, h: 60 },
        { key: 'tree_pine', x: 44, y: 15, w: 42, h: 68 },
        { key: 'tree_oak', x: 56, y: 15, w: 46, h: 62 },
        { key: 'tree_blossom', x: 18, y: 32, w: 42, h: 60 },
        { key: 'tree_oak', x: 46, y: 32, w: 46, h: 62 },
        { key: 'tree_blossom', x: 8, y: 50, w: 42, h: 60 },
        { key: 'tree_oak', x: 26, y: 50, w: 46, h: 62 },
        { key: 'tree_pine', x: 38, y: 50, w: 42, h: 68 },
        { key: 'tree_blossom', x: 56, y: 50, w: 42, h: 60 },
      ];

      trees.forEach((t) => {
        const treeSprite = this.add.image(t.x * TILE_SIZE, t.y * TILE_SIZE, t.key);
        treeSprite.setOrigin(0.5, 1.0);
        treeSprite.setDisplaySize(t.w, t.h);
        this.depthEntities.push(treeSprite);
      });

      // 5. Thriving Flower Bushes flanking doorways and roads
      const bushes = [
        { x: 22, y: 24 }, { x: 26, y: 24 },
        { x: 38, y: 24 }, { x: 42, y: 24 },
        { x: 29, y: 30 }, { x: 35, y: 30 },
        { x: 29, y: 34 }, { x: 35, y: 34 },
      ];
      bushes.forEach((bp) => {
        const bSprite = this.add.image(bp.x * TILE_SIZE, bp.y * TILE_SIZE, 'bush_flowers');
        bSprite.setOrigin(0.5, 1.0);
        bSprite.setDisplaySize(24, 18);
        this.depthEntities.push(bSprite);
      });
    }

    setupCozyProps() {
      // Graphics object for custom pixel art props (Octagonal fountain, 3-row garden, firewood, lanterns, festive bunting)
      this.propsGraphics = this.add.graphics();
      this.propsGraphics.setDepth(31 * TILE_SIZE);
    }

    setupMistriaAtmosphere() {
      // Graphics layer for falling cherry blossoms, sparkles, and gentle drizzle
      this.atmosGraphics = this.add.graphics();
      this.atmosGraphics.setDepth(9998);

      // 1. Fluttering Cherry Blossom Petals (Fields of Mistria iconic spring breeze)
      for (let i = 0; i < 32; i++) {
        this.petals.push({
          x: Math.random() * (64 * TILE_SIZE),
          y: Math.random() * (64 * TILE_SIZE),
          speedX: Math.random() * 0.8 + 0.4,
          speedY: Math.random() * 0.9 + 0.6,
          swayPhase: Math.random() * Math.PI * 2,
          color: i % 2 === 0 ? 0xfbcfe8 : 0xf472b6,
          alpha: Math.random() * 0.35 + 0.55,
          rx: Math.random() * 1.5 + 2,
          ry: Math.random() * 1.0 + 1.2,
        });
      }

      // 2. Magical Sparkling Fairy Motes
      for (let j = 0; j < 24; j++) {
        this.sparkles.push({
          x: Math.random() * (64 * TILE_SIZE),
          y: Math.random() * (64 * TILE_SIZE),
          phase: Math.random() * Math.PI * 2,
          color: j % 3 === 0 ? 0xfef08a : (j % 3 === 1 ? 0x7dd3fc : 0x86efac),
        });
      }

      // 3. Gentle Sunlit Drizzle Streaks
      for (let k = 0; k < 28; k++) {
        this.rainDrops.push({
          x: Math.random() * (64 * TILE_SIZE),
          y: Math.random() * (64 * TILE_SIZE),
          speed: Math.random() * 2.5 + 4.5,
          len: Math.random() * 4 + 6,
          alpha: Math.random() * 0.2 + 0.25,
        });
      }
    }

    update(time, delta) {
      this.animTimer += 0.05;
      const speed = 80;
      let vx = 0;
      let vy = 0;

      // 1. Keyboard Input
      const left = this.cursors.left.isDown || this.wasd.left.isDown;
      const right = this.cursors.right.isDown || this.wasd.right.isDown;
      const up = this.cursors.up.isDown || this.wasd.up.isDown;
      const down = this.cursors.down.isDown || this.wasd.down.isDown;

      if (left) vx -= 1;
      if (right) vx += 1;
      if (up) vy -= 1;
      if (down) vy += 1;

      // 2. Click-to-Move Pathing
      if (this.clickTarget) {
        const dx = this.clickTarget.x - this.player.x;
        const dy = this.clickTarget.y - this.player.y;
        const dist = Math.hypot(dx, dy);

        if (dist > 4) {
          vx = dx / dist;
          vy = dy / dist;
        } else {
          this.clickTarget = null;
        }
      }

      // 3. Normalize Diagonal Velocity
      if (vx !== 0 && vy !== 0) {
        vx *= Math.SQRT1_2;
        vy *= Math.SQRT1_2;
      }

      this.player.body.setVelocity(vx * speed, vy * speed);

      // 4. Directional Walk / Idle Animations
      if (vx < 0) {
        this.player.anims.play('pip_walk_left', true);
      } else if (vx > 0) {
        this.player.anims.play('pip_walk_right', true);
      } else if (vy < 0) {
        this.player.anims.play('pip_walk_up', true);
      } else if (vy > 0) {
        this.player.anims.play('pip_walk_down', true);
      } else {
        const currentAnim = this.player.anims.currentAnim?.key;
        if (currentAnim?.includes('left')) this.player.anims.play('pip_idle_left', true);
        else if (currentAnim?.includes('right')) this.player.anims.play('pip_idle_right', true);
        else if (currentAnim?.includes('up')) this.player.anims.play('pip_idle_up', true);
        else this.player.anims.play('pip_idle_down', true);
      }

      // 5. Y-Sort Depth Entities
      this.depthEntities.forEach((ent) => {
        if (ent && ent.y !== undefined) {
          ent.setDepth(ent.y);
        }
      });

      // 6. Proximity Detection with Chapter Doors
      this.checkProximity();

      // 7. Spacebar / Enter Interaction Trigger
      if (Phaser.Input.Keyboard.JustDown(this.wasd.space) || Phaser.Input.Keyboard.JustDown(this.wasd.enter)) {
        if (this.currentNearby) {
          this.game.events.emit('player-interacted', this.currentNearby);
        }
      }

      // 8. Render Dynamic Cozy Props, Bunting & Atmosphere
      this.renderCozyPropsGraphics();
      this.renderMistriaAtmosphereGraphics();
    }

    checkProximity() {
      let nearest = null;
      let minDist = 36; // interaction radius (px)

      CHAPTER_BUILDINGS.forEach((b) => {
        const doorWorldX = b.doorTx * TILE_SIZE;
        const doorWorldY = b.doorTy * TILE_SIZE;
        const dist = Math.hypot(this.player.x - doorWorldX, this.player.y - doorWorldY);
        if (dist <= minDist) {
          minDist = dist;
          nearest = b;
        }
      });

      if (nearest !== this.currentNearby) {
        this.currentNearby = nearest;
        this.game.events.emit('nearby-building-changed', nearest);
      }
    }

    renderCozyPropsGraphics() {
      const g = this.propsGraphics;
      g.clear();

      // 1. Central Plaza Octagonal Stone Fountain (cx: 32*16, cy: 31*16)
      const cx = 32 * TILE_SIZE;
      const cy = 31 * TILE_SIZE;

      // 8 Surrounding rectangular flagstone pavers
      const pavers = [
        { x: cx - 6, y: cy - 27, w: 12, h: 7 },
        { x: cx - 6, y: cy + 20, w: 12, h: 7 },
        { x: cx - 30, y: cy - 3, w: 11, h: 7 },
        { x: cx + 19, y: cy - 3, w: 11, h: 7 },
        { x: cx - 23, y: cy - 19, w: 10, h: 7 },
        { x: cx + 13, y: cy - 19, w: 10, h: 7 },
        { x: cx - 23, y: cy + 13, w: 10, h: 7 },
        { x: cx + 13, y: cy + 13, w: 10, h: 7 },
      ];
      pavers.forEach((p) => {
        g.fillStyle(0xd5cfc5, 1);
        g.fillRect(p.x, p.y, p.w, p.h);
        g.fillStyle(0x8e887d, 1);
        g.fillRect(p.x, p.y + p.h - 1, p.w, 1);
        g.fillRect(p.x + p.w - 1, p.y, 1, p.h);
        g.fillStyle(0xffffff, 1);
        g.fillRect(p.x, p.y, p.w - 1, 1);
      });

      // Octagonal Rim
      const outerPoly = [
        { x: cx - 10, y: cy - 21 },
        { x: cx + 10, y: cy - 21 },
        { x: cx + 25, y: cy - 8 },
        { x: cx + 25, y: cy + 8 },
        { x: cx + 10, y: cy + 21 },
        { x: cx - 10, y: cy + 21 },
        { x: cx - 25, y: cy + 8 },
        { x: cx - 25, y: cy - 8 },
      ];
      g.fillStyle(0x9e988f, 1);
      g.fillPoints(outerPoly, true);

      // Turquoise Pool
      const innerPoly = [
        { x: cx - 7, y: cy - 15 },
        { x: cx + 7, y: cy - 15 },
        { x: cx + 19, y: cy - 5 },
        { x: cx + 19, y: cy + 5 },
        { x: cx + 7, y: cy + 15 },
        { x: cx - 7, y: cy + 15 },
        { x: cx - 19, y: cy + 5 },
        { x: cx - 19, y: cy - 5 },
      ];
      g.fillStyle(0x38bdf8, 1);
      g.fillPoints(innerPoly, true);

      // Ripple rings
      const rip = (this.animTimer * 0.4) % 1;
      g.lineStyle(1, 0xbae6fd, 1 - rip);
      g.strokeEllipse(cx, cy, 8 + rip * 24, 6 + rip * 16);

      // Center cross spout pillar
      g.fillStyle(0x5c554a, 1);
      g.fillRect(cx - 4, cy - 14, 8, 16);
      g.fillStyle(0xf5f2eb, 1);
      g.fillRect(cx - 4, cy - 14, 2, 16);
      g.fillStyle(0x9e988f, 1);
      g.fillRect(cx - 9, cy - 8, 18, 4);
      g.fillStyle(0xffffff, 1);
      g.fillRect(cx - 9, cy - 8, 18, 1);

      // 2. Farmstead Stacked Firewood (10 * 16, 12.5 * 16)
      const fwX = 10 * TILE_SIZE;
      const fwY = 12.5 * TILE_SIZE;
      g.fillStyle(0x78350f, 1);
      g.fillRect(fwX, fwY + 4, 14, 6);
      g.fillRect(fwX + 6, fwY + 4, 14, 6);
      g.fillRect(fwX + 3, fwY - 2, 14, 6);
      g.fillStyle(0xfef08a, 1);
      g.fillCircle(fwX + 13, fwY + 7, 3);
      g.fillCircle(fwX + 19, fwY + 7, 3);
      g.fillCircle(fwX + 16, fwY + 1, 3);

      // 3. Dedicated Fenced Garden Plot (9.5 * 16, 15.5 * 16)
      const gx = 9.5 * TILE_SIZE;
      const gy = 15.5 * TILE_SIZE;
      const gw = 56, gh = 44;
      g.fillStyle(0x5c3a1e, 1);
      g.fillRect(gx, gy, gw, gh);

      // Row 1: Golden Wheat
      for (let w = 0; w < 7; w++) {
        const wx = gx + 7 + w * 6;
        g.fillStyle(0xca8a04, 1);
        g.fillRect(wx, gy + 8, 1, 5);
        g.fillStyle(0xeab308, 1);
        g.fillRect(wx - 1, gy + 4, 3, 4);
      }
      // Row 2: Green Sprouts
      for (let s = 0; s < 7; s++) {
        const sx = gx + 7 + s * 6;
        g.fillStyle(0x22c55e, 1);
        g.fillRect(sx - 1, gy + 18, 3, 3);
      }
      // Row 3: Blooming Flowers
      const fCols = [0xef4444, 0x38bdf8, 0xffffff, 0xef4444, 0x38bdf8, 0xffffff, 0xf43f5e];
      for (let f = 0; f < 7; f++) {
        const fx = gx + 7 + f * 6;
        g.fillStyle(fCols[f], 1);
        g.fillRect(fx - 1, gy + 30, 3, 3);
      }

      // Wooden split-rail fence
      g.lineStyle(2, 0x78350f, 1);
      g.strokeRect(gx + 2, gy + 2, gw - 4, gh - 4);

      // 4. Timber Bracket Hanging Lanterns flanking the Plaza Forks
      const lanternLocations = [
        { tx: 30, ty: 29, dir: 1 },
        { tx: 34, ty: 29, dir: -1 },
        { tx: 30, ty: 33, dir: 1 },
        { tx: 34, ty: 33, dir: -1 },
      ];
      lanternLocations.forEach((lp) => {
        const lx = lp.tx * TILE_SIZE;
        const ly = lp.ty * TILE_SIZE;
        g.fillStyle(0x78350f, 1);
        g.fillRect(lx, ly - 6, 3, 22);
        g.fillStyle(0xa16207, 1);
        g.fillRect(lx, ly - 6, 1, 22);
        const armX = lp.dir === 1 ? lx + 2 : lx - 8;
        g.fillRect(armX, ly - 5, 8, 3);
        const lanternX = lp.dir === 1 ? lx + 7 : lx - 7;
        g.fillStyle(0x1e293b, 1);
        g.fillRect(lanternX - 2, ly + 1, 5, 2);
        g.fillRect(lanternX - 2, ly + 8, 5, 2);
        g.fillStyle(0xc084fc, 1);
        g.fillRect(lanternX - 2, ly + 3, 5, 5);
        g.fillStyle(0xfde047, 1);
        g.fillRect(lanternX - 1, ly + 4, 3, 3);
      });

      // 5. Fields of Mistria Festive Bunting across Town Square Plaza
      // Strung between West and East road posts with pastel triangular pennant flags
      const buntingColors = [0xf472b6, 0xfde047, 0x38bdf8, 0x86efac, 0xf472b6, 0xfde047, 0x38bdf8, 0x86efac];
      const startX = 29.5 * TILE_SIZE;
      const endX = 34.5 * TILE_SIZE;
      const baseY = 29.5 * TILE_SIZE;
      const flagCount = 8;
      const step = (endX - startX) / flagCount;

      g.lineStyle(1, 0x78350f, 0.7);
      g.beginPath();
      for (let i = 0; i <= flagCount; i++) {
        const bx = startX + i * step;
        const sag = Math.sin((i / flagCount) * Math.PI) * 5 + Math.sin(this.animTimer + i) * 0.8;
        if (i === 0) g.moveTo(bx, baseY + sag);
        else g.lineTo(bx, baseY + sag);
      }
      g.strokePath();

      // Triangular pennants
      for (let j = 0; j < flagCount; j++) {
        const fx = startX + j * step + step / 2;
        const fsag = Math.sin(((j + 0.5) / flagCount) * Math.PI) * 5 + Math.sin(this.animTimer + j) * 0.8;
        const tri = [
          { x: fx - 3, y: baseY + fsag },
          { x: fx + 3, y: baseY + fsag },
          { x: fx, y: baseY + fsag + 5 },
        ];
        g.fillStyle(buntingColors[j], 0.9);
        g.fillPoints(tri, true);
      }
    }

    renderMistriaAtmosphereGraphics() {
      const g = this.atmosGraphics;
      g.clear();
      const cam = this.cameras.main;

      // 1. Drifting Cherry Blossom Petals
      this.petals.forEach((p) => {
        p.x += p.speedX + Math.sin(this.animTimer * 0.8 + p.swayPhase) * 0.6;
        p.y += p.speedY;

        if (p.y > cam.scrollY + cam.height + 20) {
          p.y = cam.scrollY - 20;
          p.x = cam.scrollX + Math.random() * (cam.width + 100) - 50;
        }
        if (p.x > cam.scrollX + cam.width + 20) {
          p.x = cam.scrollX - 20;
        }

        g.fillStyle(p.color, p.alpha);
        g.fillEllipse(p.x, p.y, p.rx * 2, p.ry * 2);
        // Highlight speckle
        g.fillStyle(0xffffff, p.alpha * 0.5);
        g.fillRect(p.x - 0.5, p.y - 0.5, 1, 1);
      });

      // 2. Magical Sparkling Fairy Motes
      this.sparkles.forEach((s) => {
        const pulse = (Math.sin(this.animTimer * 1.5 + s.phase) + 1) / 2;
        const alpha = 0.2 + pulse * 0.65;
        g.fillStyle(s.color, alpha);
        g.fillCircle(s.x, s.y, 1.5 + pulse * 1.2);
        g.fillStyle(0xffffff, alpha * 0.8);
        g.fillRect(Math.floor(s.x), Math.floor(s.y), 1, 1);
      });

      // 3. Gentle Sunlit Drizzle
      g.lineStyle(1, 0xe0f2fe, 0.35);
      this.rainDrops.forEach((r) => {
        r.x += r.speed * 0.35;
        r.y += r.speed;

        if (r.y > cam.scrollY + cam.height + 20) {
          r.y = cam.scrollY - 20;
          r.x = cam.scrollX + Math.random() * (cam.width + 80) - 40;
        }

        g.lineBetween(r.x, r.y, r.x + r.len * 0.35, r.y + r.len);
      });
    }
  };
}
