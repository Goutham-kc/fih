import React, { useRef, useEffect, useState, useCallback } from 'react';
import { soundManager } from '@/lib/soundManager';
import { eventBus, EVENTS } from '@/lib/eventBus';

// 16-bit RPG Tile Size
const TILE_SIZE = 16;
const MAP_WIDTH_TILES = 38;
const MAP_HEIGHT_TILES = 26;

// Chapter zone anchors in world tile coordinates
export const CHAPTER_ANCHORS = {
  todos: { x: 8, y: 12, name: 'The Farmstead', resident: 'pip', chapterTitle: 'Chapter 1: The Farmstead' },
  debts: { x: 26, y: 11, name: 'The Ledger Hut', resident: 'bram', chapterTitle: 'Chapter 2: The Ledger Hut' },
  reminders: { x: 18, y: 6, name: 'The Bell Tower', resident: 'hoot', chapterTitle: 'Chapter 3: The Bell Tower' },
  deadlines: { x: 18, y: 16, name: 'The Notice Board', resident: 'marigold', chapterTitle: 'Chapter 4: The Notice Board' },
  dates: { x: 28, y: 19, name: 'The Festival Grounds', resident: 'clover', chapterTitle: 'Chapter 5: The Festival Grounds' },
  watchlist: { x: 6, y: 19, name: 'The Moonlight Cinema', resident: 'juniper', chapterTitle: 'Chapter 6: The Moonlight Cinema' },
  audit: { x: 28, y: 4, name: 'The Archive Cellar', resident: 'moss', chapterTitle: 'Chapter 7: The Archive Cellar' },
  settings: { x: 8, y: 4, name: 'The Toolshed Workbench', resident: 'rowan', chapterTitle: 'Chapter 8: The Toolshed' },
};

export default function PixelWorldCanvas({
  activeTab = 'debts',
  debtsData = [],
  todosData = [],
  remindersData = [],
  deadlinesData = [],
  datesData = [],
  watchlistData = [],
  auditData = [],
  envMode = 'live',
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
    activeDebtsCount: 2,
    bellSwing: 0,
    fountainFrame: 0,
  });

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
    stateRef.current.activeDebtsCount = Math.max(1, Math.min(active.length, 6));
    let net = 0;
    active.forEach((d) => {
      if (d.direction === 'owed_to_me') net += d.amount;
      else net -= d.amount;
    });
    stateRef.current.scaleTilt = net > 0 ? 1 : net < 0 ? -1 : 0;
  }, [debtsData]);

  // 3. Main Render Loop with Camera Panning & Depth Sorting
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

      // Cycle animation frames (~10fps for sprite walk & water shimmer)
      if (tickCounter % 6 === 0) {
        state.animFrame++;
        state.waterFrame = (state.waterFrame + 1) % 2;
        state.fountainFrame = (state.fountainFrame + 1) % 2;
        state.bellSwing = Math.sin(state.animFrame * 0.4) * 0.15;

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

      // Pip character walking towards current anchor along path
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

      const tileset = state.images.tileset;

      // ── Layer 1: Ground Tiles (Grass, Continuous Dirt Paths, Pond, Tilled Soil) ──
      for (let ty = 0; ty < MAP_HEIGHT_TILES; ty++) {
        for (let tx = 0; tx < MAP_WIDTH_TILES; tx++) {
          const wx = tx * TILE_SIZE;
          const wy = ty * TILE_SIZE;

          // Frustum culling
          if (wx + TILE_SIZE < cam.x - viewW / 2 - 32 || wx > cam.x + viewW / 2 + 32) continue;
          if (wy + TILE_SIZE < cam.y - viewH / 2 - 32 || wy > cam.y + viewH / 2 + 32) continue;

          // Default Grass Variety (0-3)
          let tileCol = (tx * 7 + ty * 13) % 4;

          // 1. East-West Main Thoroughfare connecting Farmstead (x: 8) to Ledger Hut (x: 26) at y: 12-14
          const isMainEastWest = ty >= 12 && ty <= 13 && tx >= 4 && tx <= 32;

          // 2. North-South Crossroads thoroughfare at x: 17-18 connecting Bell Tower (y: 6) to Notice Board (y: 16)
          const isMainNorthSouth = tx >= 17 && tx <= 18 && ty >= 5 && ty <= 21;

          // 3. West path branches to Toolshed (x: 8, y: 4-6) and Moonlight Cinema (x: 6, y: 18-20)
          const isWestNorthBranch = tx === 8 && ty >= 4 && ty <= 12;
          const isWestSouthBranch = tx === 6 && ty >= 14 && ty <= 20;

          // 4. East path branches to Archive Cellar (x: 28, y: 4-6) and Festival Grounds (x: 28, y: 18-20)
          const isEastNorthBranch = tx === 28 && ty >= 4 && ty <= 11;
          const isEastSouthBranch = tx === 28 && ty >= 14 && ty <= 20;

          if (isMainEastWest || isMainNorthSouth || isWestNorthBranch || isWestSouthBranch || isEastNorthBranch || isEastSouthBranch) {
            tileCol = 4; // Warm sandy dirt path center
          }

          // Pond at x: 12-15, y: 16-18
          const isPond = tx >= 12 && tx <= 15 && ty >= 16 && ty <= 18;
          if (isPond) {
            ctx.drawImage(tileset, state.waterFrame * TILE_SIZE, 1 * TILE_SIZE, TILE_SIZE, TILE_SIZE, wx, wy, TILE_SIZE, TILE_SIZE);
            continue;
          }

          // Tilled soil plots in Farmstead zone (x: 5-7, y: 9-10)
          const isGarden = tx >= 5 && tx <= 7 && ty >= 9 && ty <= 10;
          if (isGarden) {
            ctx.drawImage(tileset, 7 * TILE_SIZE, 0 * TILE_SIZE, TILE_SIZE, TILE_SIZE, wx, wy, TILE_SIZE, TILE_SIZE);
            continue;
          }

          ctx.drawImage(tileset, tileCol * TILE_SIZE, 0, TILE_SIZE, TILE_SIZE, wx, wy, TILE_SIZE, TILE_SIZE);
        }
      }

      // ── Layer 2: Cobblestones, Plazas & Fences ──
      // Central Village Plaza Cobblestones (x: 16-20, y: 11-13)
      for (let cx = 16; cx <= 20; cx++) {
        for (let cy = 11; cy <= 13; cy++) {
          ctx.drawImage(tileset, 4 * TILE_SIZE, 1 * TILE_SIZE, TILE_SIZE, TILE_SIZE, cx * TILE_SIZE, cy * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
      }

      // Ledger Hut Porch Cobblestone (x: 24-28, y: 11-13)
      for (let cx = 24; cx <= 28; cx++) {
        for (let cy = 11; cy <= 13; cy++) {
          ctx.drawImage(tileset, 4 * TILE_SIZE, 1 * TILE_SIZE, TILE_SIZE, TILE_SIZE, cx * TILE_SIZE, cy * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
      }

      // Fences: Farmstead boundary (y: 8, x: 4-10)
      for (let fx = 4; fx <= 10; fx++) {
        ctx.drawImage(tileset, 2 * TILE_SIZE, 1 * TILE_SIZE, TILE_SIZE, TILE_SIZE, fx * TILE_SIZE, 8 * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      }

      // Fences: South road rail (y: 14, x: 19-24)
      for (let fx = 19; fx <= 24; fx++) {
        ctx.drawImage(tileset, 2 * TILE_SIZE, 1 * TILE_SIZE, TILE_SIZE, TILE_SIZE, fx * TILE_SIZE, 14 * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      }

      // ── Layer 3: Depth-Sorted Entities (Buildings, Props, Characters, Trees) ──
      const renderables = [];

      // ── 1. Chapter 1: The Farmstead (x: 6, y: 4) ──
      renderables.push({
        y: 8 * TILE_SIZE,
        render: () => {
          const bx = 6 * TILE_SIZE;
          const by = 4 * TILE_SIZE;
          for (let rx = 0; rx < 4; rx++) {
            ctx.drawImage(tileset, 0, 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE, bx + rx * TILE_SIZE, by, TILE_SIZE, TILE_SIZE);
            ctx.drawImage(tileset, 0, 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE, bx + rx * TILE_SIZE, by + TILE_SIZE, TILE_SIZE, TILE_SIZE);
            if (rx === 2) {
              ctx.drawImage(tileset, 3 * TILE_SIZE, 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE, bx + rx * TILE_SIZE, by + 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            } else if (rx === 1) {
              ctx.drawImage(tileset, 2 * TILE_SIZE, 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE, bx + rx * TILE_SIZE, by + 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            } else {
              ctx.drawImage(tileset, 1 * TILE_SIZE, 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE, bx + rx * TILE_SIZE, by + 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            }
          }

          // Farmhouse Garden Crops (Bound to Todos: Stage 2/3)
          const cropCol = 2; // Ripe parsnip
          ctx.drawImage(tileset, cropCol * TILE_SIZE, 4 * TILE_SIZE, TILE_SIZE, TILE_SIZE, 5 * TILE_SIZE, 9 * TILE_SIZE, TILE_SIZE, TILE_SIZE);
          ctx.drawImage(tileset, cropCol * TILE_SIZE, 4 * TILE_SIZE, TILE_SIZE, TILE_SIZE, 6 * TILE_SIZE, 9 * TILE_SIZE, TILE_SIZE, TILE_SIZE);
          ctx.drawImage(tileset, 3 * TILE_SIZE, 4 * TILE_SIZE, TILE_SIZE, TILE_SIZE, 7 * TILE_SIZE, 10 * TILE_SIZE, TILE_SIZE, TILE_SIZE);

          // Courier Bird Wren on mailbox post (x: 9, y: 12)
          ctx.drawImage(tileset, 7 * TILE_SIZE, 5 * TILE_SIZE, TILE_SIZE, TILE_SIZE, 9 * TILE_SIZE, 12 * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        },
      });

      // ── 2. Chapter 2: The Ledger Hut (x: 24, y: 7) ──
      renderables.push({
        y: 10 * TILE_SIZE,
        render: () => {
          const hx = 24 * TILE_SIZE;
          const hy = 7 * TILE_SIZE;
          for (let rx = 0; rx < 5; rx++) {
            ctx.drawImage(tileset, 0, 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE, hx + rx * TILE_SIZE, hy, TILE_SIZE, TILE_SIZE);
            ctx.drawImage(tileset, 0, 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE, hx + rx * TILE_SIZE, hy + TILE_SIZE, TILE_SIZE, TILE_SIZE);
            if (rx === 3) {
              ctx.drawImage(tileset, 3 * TILE_SIZE, 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE, hx + rx * TILE_SIZE, hy + 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            } else if (rx === 0 || rx === 4) {
              ctx.drawImage(tileset, 2 * TILE_SIZE, 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE, hx + rx * TILE_SIZE, hy + 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            } else {
              // High contrast cream plaster wall behind Bram
              ctx.drawImage(tileset, 1 * TILE_SIZE, 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE, hx + rx * TILE_SIZE, hy + 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            }
          }
          // Hanging Wooden Shop Signboard ("LEDGER")
          ctx.drawImage(tileset, 4 * TILE_SIZE, 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE, hx + 4 * TILE_SIZE, hy + 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE);
          // Eaves shadow
          ctx.fillStyle = 'rgba(15, 23, 42, 0.35)';
          ctx.fillRect(hx, hy + 2 * TILE_SIZE, 5 * TILE_SIZE, 2);
        },
      });

      // Bram the Badger Factor (Behind the counter at x: 26, y: 10)
      renderables.push({
        y: 11 * TILE_SIZE + 2,
        render: () => {
          const bramImg = state.images.bram;
          if (bramImg) {
            const frameCol = state.bram.talking ? 2 + state.bram.frame : state.bram.frame;
            ctx.drawImage(bramImg, frameCol * 24, 0, 24, 32, 26 * TILE_SIZE - 4, 10 * TILE_SIZE, 24, 32);
          }
        },
      });

      // Ledger Counter Table & Interactive Props (in front of Bram)
      renderables.push({
        y: 11 * TILE_SIZE + 8,
        render: () => {
          const cx = 25 * TILE_SIZE;
          const cy = 11 * TILE_SIZE;
          // 3 Counter Tiles with Emerald Velvet Runner
          ctx.drawImage(tileset, 5 * TILE_SIZE, 1 * TILE_SIZE, TILE_SIZE, TILE_SIZE, cx, cy, TILE_SIZE, TILE_SIZE);
          ctx.drawImage(tileset, 5 * TILE_SIZE, 1 * TILE_SIZE, TILE_SIZE, TILE_SIZE, cx + TILE_SIZE, cy, TILE_SIZE, TILE_SIZE);
          ctx.drawImage(tileset, 5 * TILE_SIZE, 1 * TILE_SIZE, TILE_SIZE, TILE_SIZE, cx + 2 * TILE_SIZE, cy, TILE_SIZE, TILE_SIZE);

          // Brass Balance Scale (centered on counter, tilts with state)
          ctx.save();
          ctx.translate(cx + TILE_SIZE + 8, cy + 2);
          if (state.scaleTilt !== 0) {
            ctx.rotate((state.scaleTilt * 6 * Math.PI) / 180);
          }
          ctx.drawImage(tileset, 6 * TILE_SIZE, 1 * TILE_SIZE, TILE_SIZE, TILE_SIZE, -8, -8, TILE_SIZE, TILE_SIZE);
          ctx.restore();

          // Bulging Golden Coin Sacks
          const sackCount = Math.max(1, state.activeDebtsCount);
          for (let s = 0; s < sackCount; s++) {
            const sackX = cx + 2 + (s % 3) * 6;
            const sackY = cy - 2 + (s > 2 ? -4 : 0);
            ctx.drawImage(tileset, 7 * TILE_SIZE, 1 * TILE_SIZE, TILE_SIZE, TILE_SIZE, sackX, sackY, TILE_SIZE, TILE_SIZE);
          }
        },
      });

      // ── 3. Chapter 3: The Bell Tower (x: 18, y: 5) ──
      renderables.push({
        y: 7 * TILE_SIZE,
        render: () => {
          const tx = 17 * TILE_SIZE;
          const ty = 2 * TILE_SIZE;
          // Stone Tower Base & Belfry
          ctx.drawImage(tileset, 0, 3 * TILE_SIZE, TILE_SIZE, TILE_SIZE, tx, ty, TILE_SIZE, TILE_SIZE);
          ctx.drawImage(tileset, 0, 3 * TILE_SIZE, TILE_SIZE, TILE_SIZE, tx + TILE_SIZE, ty, TILE_SIZE, TILE_SIZE);
          // Clock Face
          ctx.drawImage(tileset, 1 * TILE_SIZE, 3 * TILE_SIZE, TILE_SIZE, TILE_SIZE, tx, ty + TILE_SIZE, TILE_SIZE, TILE_SIZE);
          // Swinging Bronze Bell
          ctx.save();
          ctx.translate(tx + TILE_SIZE + 8, ty + TILE_SIZE + 4);
          ctx.rotate(state.bellSwing);
          ctx.drawImage(tileset, 2 * TILE_SIZE, 3 * TILE_SIZE, TILE_SIZE, TILE_SIZE, -8, 0, TILE_SIZE, TILE_SIZE);
          ctx.restore();
          // Stone Wall Base
          ctx.drawImage(tileset, 5 * TILE_SIZE, 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE, tx, ty + 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE);
          ctx.drawImage(tileset, 5 * TILE_SIZE, 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE, tx + TILE_SIZE, ty + 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        },
      });

      // ── 4. Chapter 4: The Notice Board (x: 18, y: 16) ──
      renderables.push({
        y: 17 * TILE_SIZE,
        render: () => {
          const nx = 17 * TILE_SIZE;
          const ny = 15 * TILE_SIZE;
          // Community Cork Notice Board
          ctx.drawImage(tileset, 4 * TILE_SIZE, 4 * TILE_SIZE, TILE_SIZE, TILE_SIZE, nx, ny, TILE_SIZE, TILE_SIZE);
          ctx.drawImage(tileset, 4 * TILE_SIZE, 4 * TILE_SIZE, TILE_SIZE, TILE_SIZE, nx + TILE_SIZE, ny, TILE_SIZE, TILE_SIZE);
          // Directional Road Signpost
          ctx.drawImage(tileset, 6 * TILE_SIZE, 5 * TILE_SIZE, TILE_SIZE, TILE_SIZE, nx + 2 * TILE_SIZE, ny, TILE_SIZE, TILE_SIZE);
        },
      });

      // ── 5. Central Village Stone Fountain (x: 18, y: 12) ──
      renderables.push({
        y: 13 * TILE_SIZE,
        render: () => {
          ctx.drawImage(tileset, 5 * TILE_SIZE, 4 * TILE_SIZE, TILE_SIZE, TILE_SIZE, 18 * TILE_SIZE, 11 * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        },
      });

      // ── 6. Chapter 5: The Festival Grounds (x: 28, y: 19) ──
      renderables.push({
        y: 20 * TILE_SIZE,
        render: () => {
          const gx = 27 * TILE_SIZE;
          const gy = 17 * TILE_SIZE;
          // Festival Gazebo Canopy
          ctx.drawImage(tileset, 7 * TILE_SIZE, 3 * TILE_SIZE, TILE_SIZE, TILE_SIZE, gx, gy, TILE_SIZE, TILE_SIZE);
          ctx.drawImage(tileset, 7 * TILE_SIZE, 3 * TILE_SIZE, TILE_SIZE, TILE_SIZE, gx + TILE_SIZE, gy, TILE_SIZE, TILE_SIZE);
          // Colorful Bunting Garland
          ctx.drawImage(tileset, 7 * TILE_SIZE, 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE, gx - TILE_SIZE, gy + TILE_SIZE, TILE_SIZE, TILE_SIZE);
          ctx.drawImage(tileset, 7 * TILE_SIZE, 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE, gx + 2 * TILE_SIZE, gy + TILE_SIZE, TILE_SIZE, TILE_SIZE);
          // Glowing Lantern Post
          ctx.drawImage(tileset, 7 * TILE_SIZE, 4 * TILE_SIZE, TILE_SIZE, TILE_SIZE, gx - TILE_SIZE, gy + 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE);
          // Wooden Log Bench
          ctx.drawImage(tileset, 6 * TILE_SIZE, 4 * TILE_SIZE, TILE_SIZE, TILE_SIZE, gx + TILE_SIZE, gy + 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        },
      });

      // ── 7. Chapter 6: The Moonlight Cinema (x: 6, y: 19) ──
      renderables.push({
        y: 20 * TILE_SIZE,
        render: () => {
          const mx = 4 * TILE_SIZE;
          const my = 18 * TILE_SIZE;
          // White Projection Screen
          ctx.drawImage(tileset, 4 * TILE_SIZE, 3 * TILE_SIZE, TILE_SIZE, TILE_SIZE, mx, my, TILE_SIZE, TILE_SIZE);
          ctx.drawImage(tileset, 4 * TILE_SIZE, 3 * TILE_SIZE, TILE_SIZE, TILE_SIZE, mx + TILE_SIZE, my, TILE_SIZE, TILE_SIZE);
          // Brass Movie Projector on Tripod
          ctx.drawImage(tileset, 3 * TILE_SIZE, 3 * TILE_SIZE, TILE_SIZE, TILE_SIZE, mx + 3 * TILE_SIZE, my + 1 * TILE_SIZE, TILE_SIZE, TILE_SIZE);
          // Cinema Log Bench
          ctx.drawImage(tileset, 6 * TILE_SIZE, 4 * TILE_SIZE, TILE_SIZE, TILE_SIZE, mx + 2 * TILE_SIZE, my + 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        },
      });

      // ── 8. Chapter 7: The Archive Cellar (x: 28, y: 4) ──
      renderables.push({
        y: 6 * TILE_SIZE,
        render: () => {
          const ax = 27 * TILE_SIZE;
          const ay = 2 * TILE_SIZE;
          // Ancient Mossy Stone Cellar Wall
          ctx.drawImage(tileset, 5 * TILE_SIZE, 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE, ax, ay, TILE_SIZE, TILE_SIZE);
          ctx.drawImage(tileset, 5 * TILE_SIZE, 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE, ax + TILE_SIZE, ay, TILE_SIZE, TILE_SIZE);
          // Cellar Bookshelf with Leather Tomes
          ctx.drawImage(tileset, 5 * TILE_SIZE, 3 * TILE_SIZE, TILE_SIZE, TILE_SIZE, ax + 2 * TILE_SIZE, ay + 1 * TILE_SIZE, TILE_SIZE, TILE_SIZE);
          // Cellar Lantern
          ctx.drawImage(tileset, 7 * TILE_SIZE, 4 * TILE_SIZE, TILE_SIZE, TILE_SIZE, ax - 1 * TILE_SIZE, ay + 1 * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        },
      });

      // ── 9. Chapter 8: The Toolshed Workbench (x: 8, y: 4) ──
      renderables.push({
        y: 6 * TILE_SIZE,
        render: () => {
          const sx = 7 * TILE_SIZE;
          const sy = 2 * TILE_SIZE;
          // Pegboard Wall with Tools
          ctx.drawImage(tileset, 6 * TILE_SIZE, 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE, sx, sy, TILE_SIZE, TILE_SIZE);
          ctx.drawImage(tileset, 6 * TILE_SIZE, 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE, sx + TILE_SIZE, sy, TILE_SIZE, TILE_SIZE);
          // Iron Anvil on Stump
          ctx.drawImage(tileset, 6 * TILE_SIZE, 3 * TILE_SIZE, TILE_SIZE, TILE_SIZE, sx + 2 * TILE_SIZE, sy + 1 * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        },
      });

      // ── 10. Trees & Foliage (Oak, Blossom, Pine) ──
      // Oak Tree (x: 3, y: 9)
      renderables.push({
        y: 11 * TILE_SIZE,
        render: () => {
          ctx.drawImage(tileset, 0, 5 * TILE_SIZE, TILE_SIZE, TILE_SIZE, 3 * TILE_SIZE, 9 * TILE_SIZE, TILE_SIZE, TILE_SIZE);
          ctx.drawImage(tileset, 1 * TILE_SIZE, 5 * TILE_SIZE, TILE_SIZE, TILE_SIZE, 3 * TILE_SIZE, 10 * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        },
      });

      // Cherry Blossom Tree (x: 10, y: 6)
      renderables.push({
        y: 8 * TILE_SIZE,
        render: () => {
          ctx.drawImage(tileset, 2 * TILE_SIZE, 5 * TILE_SIZE, TILE_SIZE, TILE_SIZE, 10 * TILE_SIZE, 6 * TILE_SIZE, TILE_SIZE, TILE_SIZE);
          ctx.drawImage(tileset, 3 * TILE_SIZE, 5 * TILE_SIZE, TILE_SIZE, TILE_SIZE, 10 * TILE_SIZE, 7 * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        },
      });

      // Pine Tree (x: 21, y: 4)
      renderables.push({
        y: 6 * TILE_SIZE,
        render: () => {
          ctx.drawImage(tileset, 4 * TILE_SIZE, 5 * TILE_SIZE, TILE_SIZE, TILE_SIZE, 21 * TILE_SIZE, 4 * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        },
      });

      // Berry Bush (x: 14, y: 13)
      renderables.push({
        y: 14 * TILE_SIZE,
        render: () => {
          ctx.drawImage(tileset, 5 * TILE_SIZE, 5 * TILE_SIZE, TILE_SIZE, TILE_SIZE, 14 * TILE_SIZE, 13 * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        },
      });

      // ── 11. Pip the Farmer ──
      renderables.push({
        y: pip.y + 30, // foot Y
        render: () => {
          const pipImg = state.images.pip;
          if (pipImg) {
            ctx.drawImage(pipImg, pip.frame * 16, pip.dir * 32, 16, 32, Math.floor(pip.x), Math.floor(pip.y), 16, 32);
          }
        },
      });

      // Sort all renderables by foot Y for depth sorting
      renderables.sort((a, b) => a.y - b.y);
      renderables.forEach((item) => item.render());

      ctx.restore();

      // ── Day / Night Light Color Grading Tint ──
      const hour = new Date().getHours();
      let tintColor = null;

      if (hour < 5 || hour >= 20) {
        // Deep Night: Navy Blue tint
        tintColor = 'rgba(15, 23, 42, 0.42)';
      } else if (hour >= 5 && hour < 8) {
        // Morning Dawn: Rose Golden tint
        tintColor = 'rgba(251, 146, 60, 0.08)';
      } else if (hour >= 17 && hour < 20) {
        // Sunset Dusk: Warm Amber Amber tint
        tintColor = 'rgba(217, 119, 6, 0.12)';
      } else {
        // Daytime Sunlight: Subtle Warmth
        tintColor = 'rgba(254, 240, 138, 0.04)';
      }

      if (tintColor) {
        ctx.fillStyle = tintColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [reducedMotion]);

  return (
    <div
      className={`pixel-world-viewport ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        background: '#120b06',
        ...style,
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          imageRendering: 'pixelated',
        }}
      />
    </div>
  );
}
