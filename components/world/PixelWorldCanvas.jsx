import React, { useRef, useEffect, useState, useCallback } from 'react';
import { soundManager } from '@/lib/soundManager';
import { eventBus, EVENTS } from '@/lib/eventBus';

// 16-bit RPG Tile Size
const TILE_SIZE = 16;
const MAP_WIDTH_TILES = 36;
const MAP_HEIGHT_TILES = 24;

// Chapter zone anchors in world tile coordinates
export const CHAPTER_ANCHORS = {
  todos: { x: 8, y: 12, name: 'The Farmstead' },
  debts: { x: 26, y: 11, name: 'The Ledger Hut' },
  reminders: { x: 18, y: 6, name: 'The Bell Tower' },
  deadlines: { x: 18, y: 16, name: 'The Notice Board' },
  watchlist: { x: 6, y: 19, name: 'The Moonlight Cinema' },
  dates: { x: 28, y: 19, name: 'The Festival Grounds' },
  audit: { x: 28, y: 4, name: 'The Archive Cellar' },
  settings: { x: 8, y: 4, name: 'The Toolshed' },
};

export default function PixelWorldCanvas({
  activeTab = 'debts',
  debtsData = [],
  onSelectDebt,
  reducedMotion = false,
  className = '',
  style = {},
}) {
  const canvasRef = useRef(null);
  const stateRef = useRef({
    images: { tileset: null, pip: null, bram: null },
    loaded: false,
    camera: { x: 26 * 16, y: 11 * 16 },
    targetCamera: { x: 26 * 16, y: 11 * 16 },
    pip: { x: 22 * 16, y: 12 * 16, dir: 2, frame: 0, walking: false }, // dir: 0=D, 1=L, 2=R, 3=U
    bram: { frame: 0, talking: false },
    animFrame: 0,
    waterFrame: 0,
    scaleFactor: 4,
    scaleTilt: 0, // -1 = owe, 0 = level, +1 = owed
    activeDebtsCount: 0,
  });

  const [interactiveHover, setInteractiveHover] = useState(null);

  // 1. Load 16-bit sprite sheets
  useEffect(() => {
    let mounted = true;
    const imagesToLoad = [
      { key: 'tileset', src: '/assets/tilesets/village_tileset.png' },
      { key: 'pip', src: '/assets/characters/pip_walk.png' },
      { key: 'bram', src: '/assets/characters/bram_factor.png' },
    ];

    let count = 0;
    imagesToLoad.forEach(({ key, src }) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        if (!mounted) return;
        stateRef.current.images[key] = img;
        count++;
        if (count === imagesToLoad.length) {
          stateRef.current.loaded = true;
        }
      };
    });

    return () => {
      mounted = false;
    };
  }, []);

  // 2. Synchronize active chapter anchor & debt data
  useEffect(() => {
    const anchor = CHAPTER_ANCHORS[activeTab] || CHAPTER_ANCHORS.debts;
    const targetX = anchor.x * TILE_SIZE;
    const targetY = anchor.y * TILE_SIZE;

    stateRef.current.targetCamera = { x: targetX, y: targetY };

    if (reducedMotion) {
      stateRef.current.camera = { x: targetX, y: targetY };
      stateRef.current.pip.x = targetX - 24;
      stateRef.current.pip.y = targetY + 8;
      stateRef.current.pip.walking = false;
    } else {
      stateRef.current.pip.walking = true;
    }
  }, [activeTab, reducedMotion]);

  useEffect(() => {
    const active = debtsData.filter((d) => !d.settled);
    stateRef.current.activeDebtsCount = Math.min(active.length, 6);
    let net = 0;
    active.forEach((d) => {
      if (d.direction === 'owed_to_me') net += d.amount;
      else net -= d.amount;
    });
    stateRef.current.scaleTilt = net > 0 ? 1 : net < 0 ? -1 : 0;
  }, [debtsData]);

  // 3. Main Render Loop
  useEffect(() => {
    let animId;
    let lastTime = performance.now();
    let tickCounter = 0;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function render(currentTime) {
      animId = requestAnimationFrame(render);

      const state = stateRef.current;
      if (!state.loaded) return;

      const dt = (currentTime - lastTime) / 1000;
      lastTime = currentTime;
      tickCounter++;

      // Cycle animation frames (~10fps for sprite walk)
      if (tickCounter % 6 === 0) {
        state.animFrame++;
        state.waterFrame = (state.waterFrame + 1) % 2;
        if (state.pip.walking) {
          state.pip.frame = (state.pip.frame + 1) % 4;
        } else {
          state.pip.frame = 0;
        }
        state.bram.frame = (state.bram.frame + 1) % 2;
      }

      // Smooth camera pan towards target anchor
      const cam = state.camera;
      const tCam = state.targetCamera;
      const lerpSpeed = reducedMotion ? 1 : 0.08;
      cam.x += (tCam.x - cam.x) * lerpSpeed;
      cam.y += (tCam.y - cam.y) * lerpSpeed;

      // Pip character walking towards current anchor
      const pip = state.pip;
      const destX = tCam.x - 20;
      const destY = tCam.y + 12;
      const dx = destX - pip.x;
      const dy = destY - pip.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 3 && !reducedMotion) {
        pip.walking = true;
        const walkSpeed = 60 * dt;
        pip.x += (dx / dist) * Math.min(dist, walkSpeed);
        pip.y += (dy / dist) * Math.min(dist, walkSpeed);

        // Determine face direction
        if (Math.abs(dx) > Math.abs(dy)) {
          pip.dir = dx > 0 ? 2 : 1; // 2=Right, 1=Left
        } else {
          pip.dir = dy > 0 ? 0 : 3; // 0=Down, 3=Up
        }
      } else {
        pip.walking = false;
      }

      // Compute Integer Scaling Factor (3x mobile, 4x desktop)
      const isMobile = canvas.clientWidth < 640;
      const scale = isMobile ? 3 : 4;
      state.scaleFactor = scale;

      const viewW = Math.floor(canvas.clientWidth / scale);
      const viewH = Math.floor(canvas.clientHeight / scale);

      if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
      }

      ctx.imageSmoothingEnabled = false;

      ctx.save();
      // Apply integer scale
      ctx.scale(scale, scale);

      // Camera offset (center world at camera position)
      const offsetX = Math.floor(viewW / 2 - cam.x);
      const offsetY = Math.floor(viewH / 2 - cam.y);
      ctx.translate(offsetX, offsetY);

      // ── Layer 1: Ground (Grass & Dirt Paths) ──
      const tileset = state.images.tileset;

      for (let ty = 0; ty < MAP_HEIGHT_TILES; ty++) {
        for (let tx = 0; tx < MAP_WIDTH_TILES; tx++) {
          const wx = tx * TILE_SIZE;
          const wy = ty * TILE_SIZE;

          // Frustum culling
          if (wx + TILE_SIZE < cam.x - viewW / 2 - 32 || wx > cam.x + viewW / 2 + 32) continue;
          if (wy + TILE_SIZE < cam.y - viewH / 2 - 32 || wy > cam.y + viewH / 2 + 32) continue;

          // Grass base
          let tileCol = (tx * 7 + ty * 13) % 4; // Variety grass tiles (0-3)

          // Main horizontal dirt path connecting Farmhouse (x: 8) to Ledger Hut (x: 26) at y: 12-14
          const isMainPath = ty >= 12 && ty <= 13 && tx >= 4 && tx <= 30;
          // Path branch to Bell Tower at x: 18, y: 6-12
          const isBellPath = tx >= 17 && tx <= 18 && ty >= 6 && ty <= 12;

          if (isMainPath || isBellPath) {
            tileCol = 4; // Dirt center
          }

          // Pond at x: 12-15, y: 15-18
          const isPond = tx >= 12 && tx <= 15 && ty >= 16 && ty <= 18;
          if (isPond) {
            // Animated water tile (Row 1, Col 0 or 1)
            ctx.drawImage(tileset, state.waterFrame * TILE_SIZE, 1 * TILE_SIZE, TILE_SIZE, TILE_SIZE, wx, wy, TILE_SIZE, TILE_SIZE);
            continue;
          }

          // Tilled soil plots in Farmstead zone (x: 5-7, y: 10-11)
          const isGarden = tx >= 5 && tx <= 7 && ty >= 9 && ty <= 10;
          if (isGarden) {
            ctx.drawImage(tileset, 7 * TILE_SIZE, 0 * TILE_SIZE, TILE_SIZE, TILE_SIZE, wx, wy, TILE_SIZE, TILE_SIZE);
            continue;
          }

          ctx.drawImage(tileset, tileCol * TILE_SIZE, 0, TILE_SIZE, TILE_SIZE, wx, wy, TILE_SIZE, TILE_SIZE);
        }
      }

      // ── Layer 2: Cobblestone Squares & Fences ──
      // Ledger Hut Porch Cobblestone (x: 24-28, y: 11-13)
      for (let cx = 24; cx <= 28; cx++) {
        for (let cy = 11; cy <= 13; cy++) {
          ctx.drawImage(tileset, 4 * TILE_SIZE, 1 * TILE_SIZE, TILE_SIZE, TILE_SIZE, cx * TILE_SIZE, cy * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
      }

      // Wooden Rail Fences along Farmhouse north (y: 8, x: 4-10)
      for (let fx = 4; fx <= 10; fx++) {
        ctx.drawImage(tileset, 2 * TILE_SIZE, 1 * TILE_SIZE, TILE_SIZE, TILE_SIZE, fx * TILE_SIZE, 8 * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      }

      // Wooden Rail Fence south of road near Ledger Hut (y: 14, x: 18-23)
      for (let fx = 18; fx <= 23; fx++) {
        ctx.drawImage(tileset, 2 * TILE_SIZE, 1 * TILE_SIZE, TILE_SIZE, TILE_SIZE, fx * TILE_SIZE, 14 * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      }

      // ── Depth-Sorted Entities (Objects, Characters, Props) ──
      const renderables = [];

      // 1. The Farmhouse Cabin (x: 6 * 16, y: 4 * 16, w: 64, h: 48)
      renderables.push({
        y: 8 * 16,
        render: () => {
          const bx = 6 * TILE_SIZE;
          const by = 4 * TILE_SIZE;
          // Terracotta Shingled Roof & Half-Timber Walls
          for (let rx = 0; rx < 4; rx++) {
            // Roof
            ctx.drawImage(tileset, 0, 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE, bx + rx * TILE_SIZE, by, TILE_SIZE, TILE_SIZE);
            ctx.drawImage(tileset, 0, 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE, bx + rx * TILE_SIZE, by + TILE_SIZE, TILE_SIZE, TILE_SIZE);
            // Wall & Door
            if (rx === 2) {
              ctx.drawImage(tileset, 3 * TILE_SIZE, 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE, bx + rx * TILE_SIZE, by + 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            } else if (rx === 1) {
              ctx.drawImage(tileset, 2 * TILE_SIZE, 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE, bx + rx * TILE_SIZE, by + 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            } else {
              ctx.drawImage(tileset, 1 * TILE_SIZE, 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE, bx + rx * TILE_SIZE, by + 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            }
          }
        },
      });

      // 2. The Ledger Hut Cabin (x: 24 * 16, y: 7 * 16, w: 80, h: 48)
      renderables.push({
        y: 10 * 16,
        render: () => {
          const hx = 24 * TILE_SIZE;
          const hy = 7 * TILE_SIZE;
          // Terracotta Shingled Roof
          for (let rx = 0; rx < 5; rx++) {
            ctx.drawImage(tileset, 0, 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE, hx + rx * TILE_SIZE, hy, TILE_SIZE, TILE_SIZE);
            ctx.drawImage(tileset, 0, 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE, hx + rx * TILE_SIZE, hy + TILE_SIZE, TILE_SIZE, TILE_SIZE);
            // High-Contrast Half-Timber Plaster Walls (Cream plaster makes Bram pop!)
            if (rx === 3) {
              // Heavy Oak Merchant Door
              ctx.drawImage(tileset, 3 * TILE_SIZE, 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE, hx + rx * TILE_SIZE, hy + 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            } else if (rx === 0 || rx === 4) {
              // Glowing Amber Window with Dark Oak Shutters
              ctx.drawImage(tileset, 2 * TILE_SIZE, 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE, hx + rx * TILE_SIZE, hy + 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            } else {
              // Bright Cream Half-Timber Plaster Wall behind Bram
              ctx.drawImage(tileset, 1 * TILE_SIZE, 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE, hx + rx * TILE_SIZE, hy + 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            }
          }

          // Hanging Wooden Shop Signboard ("LEDGER") on the right
          ctx.drawImage(tileset, 4 * TILE_SIZE, 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE, hx + 4 * TILE_SIZE, hy + 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE);

          // Roof eaves drop-shadow over walls
          ctx.fillStyle = 'rgba(15, 23, 42, 0.35)';
          ctx.fillRect(hx, hy + 2 * TILE_SIZE, 5 * TILE_SIZE, 2);
        },
      });

      // 3. Bram the Badger behind the Ledger Counter (x: 26 * 16, y: 11 * 16)
      renderables.push({
        y: 11 * 16 + 2,
        render: () => {
          const bramImg = state.images.bram;
          if (bramImg) {
            const frameCol = state.bram.talking ? 2 + state.bram.frame : state.bram.frame;
            ctx.drawImage(bramImg, frameCol * 24, 0, 24, 32, 26 * TILE_SIZE - 4, 10 * TILE_SIZE, 24, 32);
          }
        },
      });

      // 4. Ledger Counter Table & Interactive Props (in front of Bram)
      renderables.push({
        y: 11 * 16 + 8,
        render: () => {
          const cx = 25 * TILE_SIZE;
          const cy = 11 * TILE_SIZE;
          // 3-tile counter
          ctx.drawImage(tileset, 5 * TILE_SIZE, 1 * TILE_SIZE, TILE_SIZE, TILE_SIZE, cx, cy, TILE_SIZE, TILE_SIZE);
          ctx.drawImage(tileset, 5 * TILE_SIZE, 1 * TILE_SIZE, TILE_SIZE, TILE_SIZE, cx + TILE_SIZE, cy, TILE_SIZE, TILE_SIZE);
          ctx.drawImage(tileset, 5 * TILE_SIZE, 1 * TILE_SIZE, TILE_SIZE, TILE_SIZE, cx + 2 * TILE_SIZE, cy, TILE_SIZE, TILE_SIZE);

          // Brass Balance Scale (centered on counter)
          ctx.save();
          ctx.translate(cx + TILE_SIZE + 8, cy + 2);
          // Scale tilt rotation if tilted
          if (state.scaleTilt !== 0) {
            ctx.rotate((state.scaleTilt * 6 * Math.PI) / 180);
          }
          ctx.drawImage(tileset, 6 * TILE_SIZE, 1 * TILE_SIZE, TILE_SIZE, TILE_SIZE, -8, -8, TILE_SIZE, TILE_SIZE);
          ctx.restore();

          // Coin Sacks (representing active debts on counter)
          const sackCount = Math.max(1, state.activeDebtsCount);
          for (let s = 0; s < sackCount; s++) {
            const sackX = cx + 2 + (s % 3) * 6;
            const sackY = cy - 2 + (s > 2 ? -4 : 0);
            ctx.drawImage(tileset, 7 * TILE_SIZE, 1 * TILE_SIZE, TILE_SIZE, TILE_SIZE, sackX, sackY, TILE_SIZE, TILE_SIZE);
          }
        },
      });

      // 5. Pip the Farmer
      renderables.push({
        y: pip.y + 30, // foot Y
        render: () => {
          const pipImg = state.images.pip;
          if (pipImg) {
            ctx.drawImage(pipImg, pip.frame * 16, pip.dir * 32, 16, 32, Math.floor(pip.x), Math.floor(pip.y), 16, 32);
          }
        },
      });

      // Sort all renderables by foot Y
      renderables.sort((a, b) => a.y - b.y);
      renderables.forEach((item) => item.render());

      // ── Day / Night Light Color Grading Tint ──
      const hour = new Date().getHours();
      let tintColor = null;

      if (hour < 5 || hour >= 20) {
        // Deep Night: Navy Blue tint
        tintColor = 'rgba(15, 23, 42, 0.45)';
      } else if (hour >= 5 && hour < 8) {
        // Sunrise / Morning: Warm Amber
        tintColor = 'rgba(245, 158, 11, 0.12)';
      } else if (hour >= 17 && hour < 20) {
        // Sunset / Evening: Violet-Gold
        tintColor = 'rgba(139, 92, 246, 0.16)';
      }

      if (tintColor) {
        ctx.fillStyle = tintColor;
        // Cover visible world
        ctx.fillRect(cam.x - viewW, cam.y - viewH, viewW * 2, viewH * 2);
      }

      ctx.restore();
    }

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [reducedMotion]);

  // Handle Canvas Click (interaction with in-world counter or scale)
  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const state = stateRef.current;
    const scale = state.scaleFactor;
    const viewW = Math.floor(canvas.clientWidth / scale);
    const viewH = Math.floor(canvas.clientHeight / scale);

    const worldClickX = (clickX / scale) - (viewW / 2 - state.camera.x);
    const worldClickY = (clickY / scale) - (viewH / 2 - state.camera.y);

    // Ledger Counter bounds: (25*16 to 28*16, 11*16 to 12*16)
    const counterX = 25 * TILE_SIZE;
    const counterY = 11 * TILE_SIZE;

    if (
      worldClickX >= counterX &&
      worldClickX <= counterX + 3 * TILE_SIZE &&
      worldClickY >= counterY - 10 &&
      worldClickY <= counterY + TILE_SIZE + 4
    ) {
      soundManager.playSfx('coin');
      eventBus.emit(EVENTS.DEBT_PAYMENT, { note: 'Inspected gold sacks on Bram’s counter' });
      if (onSelectDebt && debtsData.length > 0) {
        onSelectDebt(debtsData[0]);
      }
    }
  };

  return (
    <div
      className={`pixel-world-container ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        background: '#1f130b',
        ...style,
      }}
    >
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          imageRendering: 'pixelated',
          cursor: 'url(/assets/ui/ui_atlas.png), pointer',
        }}
      />
    </div>
  );
}
