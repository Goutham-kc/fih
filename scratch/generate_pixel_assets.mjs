import puppeteer from 'puppeteer-core';
import http from 'http';
import fs from 'fs';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const ASSETS_DIR = path.resolve('public/assets');
const TILESETS_DIR = path.join(ASSETS_DIR, 'tilesets');
const CHARACTERS_DIR = path.join(ASSETS_DIR, 'characters');
const UI_DIR = path.join(ASSETS_DIR, 'ui');

[TILESETS_DIR, CHARACTERS_DIR, UI_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

function getAssetGeneratorHtml() {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin: 0; background: #000;">
<script>
window.generateAllAssets = function() {
  const assets = {};

  function createCanvas(w, h) {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    return { c, ctx };
  }

  // -------------------------------------------------------------
  // 1. TILESET (16x16 tiles in a 128x128 grid: 8 cols x 8 rows)
  // -------------------------------------------------------------
  const TILE = 16;
  const { c: tileCanvas, ctx: tctx } = createCanvas(128, 128);

  // Palette (16-bit SNES/GBA palette)
  const P = {
    grassDark: '#38732a',
    grassMid: '#599b32',
    grassLight: '#77bb43',
    grassHigh: '#99d959',
    
    dirtDark: '#8c532b',
    dirtMid: '#b87b40',
    dirtLight: '#d49b5c',
    dirtHigh: '#eec284',
    
    waterDeep: '#1d4ed8',
    waterMid: '#3b82f6',
    waterLight: '#60a5fa',
    waterFoam: '#bfdbfe',
    
    woodDark: '#452817',
    woodMid: '#784323',
    woodLight: '#a66538',
    woodHigh: '#c88550',

    roofDark: '#6b1d1d',
    roofMid: '#992b2b',
    roofLight: '#c24141',

    stoneDark: '#334155',
    stoneMid: '#64748b',
    stoneLight: '#94a3b8',

    goldDark: '#a16207',
    goldMid: '#eab308',
    goldLight: '#fde047',

    flowerRed: '#ef4444',
    flowerYellow: '#facc15',
    flowerPink: '#f472b6',
    white: '#ffffff',
    black: '#111827',
    shadow: 'rgba(15, 23, 42, 0.45)',
  };

  function drawTile(col, row, drawFn) {
    tctx.save();
    tctx.translate(col * TILE, row * TILE);
    drawFn(tctx);
    tctx.restore();
  }

  // Row 0: Grass variants
  // Tile 0,0: Plain Grass
  drawTile(0, 0, (g) => {
    g.fillStyle = P.grassMid;
    g.fillRect(0, 0, 16, 16);
    // Subtle texture spots
    g.fillStyle = P.grassDark;
    g.fillRect(3, 3, 2, 1);
    g.fillRect(11, 7, 2, 1);
    g.fillRect(6, 12, 2, 1);
    g.fillStyle = P.grassLight;
    g.fillRect(2, 8, 1, 1);
    g.fillRect(9, 2, 1, 1);
    g.fillRect(13, 14, 1, 1);
  });

  // Tile 1,0: Grass with Tuft
  drawTile(1, 0, (g) => {
    g.fillStyle = P.grassMid;
    g.fillRect(0, 0, 16, 16);
    g.fillStyle = P.grassDark;
    g.fillRect(2, 4, 1, 1);
    g.fillRect(12, 11, 1, 1);
    // Grass tuft
    g.fillStyle = P.grassDark;
    g.fillRect(6, 9, 4, 4);
    g.fillStyle = P.grassLight;
    g.fillRect(6, 7, 1, 3);
    g.fillRect(8, 6, 1, 4);
    g.fillRect(9, 8, 1, 2);
  });

  // Tile 2,0: Grass with Flowers
  drawTile(2, 0, (g) => {
    g.fillStyle = P.grassMid;
    g.fillRect(0, 0, 16, 16);
    // Red Flower
    g.fillStyle = P.grassDark;
    g.fillRect(4, 9, 2, 3);
    g.fillStyle = P.flowerRed;
    g.fillRect(3, 7, 3, 3);
    g.fillStyle = P.flowerYellow;
    g.fillRect(4, 8, 1, 1);
    // White Flower
    g.fillStyle = P.grassDark;
    g.fillRect(11, 10, 2, 2);
    g.fillStyle = P.white;
    g.fillRect(10, 8, 3, 3);
    g.fillStyle = P.flowerYellow;
    g.fillRect(11, 9, 1, 1);
  });

  // Tile 3,0: Grass with Pebbles
  drawTile(3, 0, (g) => {
    g.fillStyle = P.grassMid;
    g.fillRect(0, 0, 16, 16);
    g.fillStyle = P.stoneDark;
    g.fillRect(6, 8, 4, 3);
    g.fillStyle = P.stoneLight;
    g.fillRect(7, 8, 2, 2);
    g.fillStyle = P.stoneDark;
    g.fillRect(12, 4, 2, 2);
    g.fillStyle = P.stoneLight;
    g.fillRect(12, 4, 1, 1);
  });

  // Row 0 Col 4-7: Dirt Path tiles
  // Tile 4,0: Dirt Center
  drawTile(4, 0, (g) => {
    g.fillStyle = P.dirtLight;
    g.fillRect(0, 0, 16, 16);
    g.fillStyle = P.dirtMid;
    g.fillRect(2, 3, 2, 1);
    g.fillRect(8, 7, 2, 1);
    g.fillRect(5, 12, 2, 1);
    g.fillRect(13, 2, 1, 1);
    g.fillStyle = P.dirtDark;
    g.fillRect(4, 4, 1, 1);
    g.fillRect(10, 11, 1, 1);
    g.fillStyle = P.dirtHigh;
    g.fillRect(1, 10, 1, 1);
    g.fillRect(12, 8, 1, 1);
  });

  // Tile 5,0: Dirt Path Top Edge (Grass transitioning down into dirt)
  drawTile(5, 0, (g) => {
    g.fillStyle = P.dirtLight;
    g.fillRect(0, 0, 16, 16);
    g.fillStyle = P.grassMid;
    g.fillRect(0, 0, 16, 6);
    // Irregular teeth
    g.fillRect(2, 6, 3, 2);
    g.fillRect(8, 6, 2, 1);
    g.fillRect(12, 6, 3, 2);
    g.fillStyle = P.grassDark;
    g.fillRect(0, 5, 16, 1);
    g.fillRect(2, 8, 3, 1);
    g.fillRect(12, 8, 3, 1);
  });

  // Tile 6,0: Dirt Path Bottom Edge
  drawTile(6, 0, (g) => {
    g.fillStyle = P.dirtLight;
    g.fillRect(0, 0, 16, 16);
    g.fillStyle = P.grassMid;
    g.fillRect(0, 10, 16, 6);
    g.fillRect(1, 8, 3, 2);
    g.fillRect(9, 9, 3, 1);
    g.fillRect(13, 8, 2, 2);
    g.fillStyle = P.grassDark;
    g.fillRect(1, 8, 3, 1);
    g.fillRect(9, 9, 3, 1);
    g.fillRect(13, 8, 2, 1);
  });

  // Tile 7,0: Tilled Soil Plot
  drawTile(7, 0, (g) => {
    g.fillStyle = '#3a2012';
    g.fillRect(0, 0, 16, 16);
    // Furrows
    g.fillStyle = '#54301a';
    g.fillRect(1, 2, 14, 3);
    g.fillRect(1, 7, 14, 3);
    g.fillRect(1, 12, 14, 3);
    g.fillStyle = '#26140b';
    g.fillRect(1, 5, 14, 2);
    g.fillRect(1, 10, 14, 2);
    g.fillRect(1, 15, 14, 1);
  });

  // Row 1: Water & Fences
  // Tile 0,1: Deep Water Frame 1
  drawTile(0, 1, (g) => {
    g.fillStyle = P.waterMid;
    g.fillRect(0, 0, 16, 16);
    g.fillStyle = P.waterDeep;
    g.fillRect(0, 8, 16, 8);
    // Wave ripple
    g.fillStyle = P.waterLight;
    g.fillRect(3, 4, 4, 1);
    g.fillRect(10, 11, 4, 1);
    g.fillStyle = P.waterFoam;
    g.fillRect(4, 3, 2, 1);
    g.fillRect(11, 10, 2, 1);
  });

  // Tile 1,1: Deep Water Frame 2 (animated shift)
  drawTile(1, 1, (g) => {
    g.fillStyle = P.waterMid;
    g.fillRect(0, 0, 16, 16);
    g.fillStyle = P.waterDeep;
    g.fillRect(0, 6, 16, 10);
    g.fillStyle = P.waterLight;
    g.fillRect(5, 5, 4, 1);
    g.fillRect(8, 12, 4, 1);
    g.fillStyle = P.waterFoam;
    g.fillRect(6, 4, 2, 1);
    g.fillRect(9, 11, 2, 1);
  });

  // Tile 2,1: Wooden Rail Fence Horizontal
  drawTile(2, 1, (g) => {
    g.fillStyle = P.grassMid;
    g.fillRect(0, 0, 16, 16);
    // Ground shadow
    g.fillStyle = P.shadow;
    g.fillRect(2, 13, 12, 2);
    // Fence Rails
    g.fillStyle = P.woodDark;
    g.fillRect(0, 5, 16, 3);
    g.fillRect(0, 10, 16, 3);
    g.fillStyle = P.woodMid;
    g.fillRect(0, 6, 16, 1);
    g.fillRect(0, 11, 16, 1);
    // Post in center
    g.fillStyle = P.woodDark;
    g.fillRect(6, 2, 4, 13);
    g.fillStyle = P.woodMid;
    g.fillRect(7, 3, 2, 11);
    g.fillStyle = P.woodHigh;
    g.fillRect(7, 2, 2, 1);
  });

  // Tile 3,1: Wooden Rail Fence Vertical / Post
  drawTile(3, 1, (g) => {
    g.fillStyle = P.grassMid;
    g.fillRect(0, 0, 16, 16);
    g.fillStyle = P.shadow;
    g.fillRect(5, 13, 6, 3);
    g.fillStyle = P.woodDark;
    g.fillRect(6, 0, 4, 15);
    g.fillStyle = P.woodMid;
    g.fillRect(7, 0, 2, 14);
    g.fillStyle = P.woodHigh;
    g.fillRect(7, 0, 2, 1);
  });

  // Tile 4,1: Cobblestone / Village Square
  drawTile(4, 1, (g) => {
    g.fillStyle = P.stoneMid;
    g.fillRect(0, 0, 16, 16);
    g.fillStyle = P.stoneDark;
    // Mortar lines
    g.fillRect(0, 7, 16, 1);
    g.fillRect(0, 15, 16, 1);
    g.fillRect(7, 0, 1, 8);
    g.fillRect(3, 8, 1, 8);
    g.fillRect(11, 8, 1, 8);
    // Highlights
    g.fillStyle = P.stoneLight;
    g.fillRect(1, 1, 5, 2);
    g.fillRect(9, 1, 5, 2);
    g.fillRect(4, 9, 6, 2);
  });

  // Tile 5,1: Ledger Counter Table Top
  drawTile(5, 1, (g) => {
    g.fillStyle = P.woodDark;
    g.fillRect(0, 0, 16, 16);
    g.fillStyle = P.woodMid;
    g.fillRect(0, 2, 16, 12);
    g.fillStyle = P.woodLight;
    g.fillRect(0, 3, 16, 3);
    g.fillStyle = P.woodDark;
    g.fillRect(0, 14, 16, 2);
  });

  // Tile 6,1: Brass Balance Scale (Item Prop on counter)
  drawTile(6, 1, (g) => {
    // Transparent background
    // Base & Post
    g.fillStyle = P.goldDark;
    g.fillRect(6, 14, 4, 2);
    g.fillRect(7, 4, 2, 10);
    g.fillStyle = P.goldMid;
    g.fillRect(7, 5, 2, 9);
    // Horizontal beam
    g.fillStyle = P.goldDark;
    g.fillRect(2, 4, 12, 2);
    g.fillStyle = P.goldLight;
    g.fillRect(3, 4, 10, 1);
    // Left Pan
    g.fillStyle = P.goldDark;
    g.fillRect(1, 6, 1, 3);
    g.fillRect(5, 6, 1, 3);
    g.fillRect(1, 9, 5, 2);
    g.fillStyle = P.goldMid;
    g.fillRect(2, 9, 3, 1);
    // Right Pan
    g.fillStyle = P.goldDark;
    g.fillRect(10, 6, 1, 3);
    g.fillRect(14, 6, 1, 3);
    g.fillRect(10, 9, 5, 2);
    g.fillStyle = P.goldMid;
    g.fillRect(11, 9, 3, 1);
  });

  // Tile 7,1: Coin Sack (Item Prop)
  drawTile(7, 1, (g) => {
    // Shadow
    g.fillStyle = P.shadow;
    g.fillRect(3, 13, 10, 3);
    // Sack body
    g.fillStyle = P.dirtDark;
    g.fillRect(4, 7, 8, 8);
    g.fillRect(3, 9, 10, 5);
    g.fillStyle = P.dirtLight;
    g.fillRect(5, 8, 6, 6);
    // Cord tie
    g.fillStyle = P.goldMid;
    g.fillRect(6, 6, 4, 2);
    // Fluted top
    g.fillStyle = P.dirtDark;
    g.fillRect(5, 3, 6, 3);
    g.fillStyle = P.dirtLight;
    g.fillRect(6, 4, 4, 2);
    // Glimmer of gold coin
    g.fillStyle = P.goldLight;
    g.fillRect(7, 10, 2, 2);
  });

  // Row 2-4: Building components
  // Ledger Hut Shingled Roof Tile
  drawTile(0, 2, (g) => {
    g.fillStyle = P.roofMid;
    g.fillRect(0, 0, 16, 16);
    g.fillStyle = P.roofDark;
    g.fillRect(0, 5, 16, 2);
    g.fillRect(0, 11, 16, 2);
    g.fillStyle = P.roofLight;
    g.fillRect(0, 0, 16, 2);
    g.fillRect(0, 6, 16, 1);
    g.fillRect(0, 12, 16, 1);
  });

  // Ledger Hut Timber Wall with Window (warm lantern light)
  drawTile(1, 2, (g) => {
    g.fillStyle = P.woodMid;
    g.fillRect(0, 0, 16, 16);
    // Log joints
    g.fillStyle = P.woodDark;
    g.fillRect(0, 0, 16, 1);
    g.fillRect(0, 5, 16, 1);
    g.fillRect(0, 10, 16, 1);
    g.fillRect(0, 15, 16, 1);
    // Window with lantern light
    g.fillStyle = P.woodDark;
    g.fillRect(4, 4, 8, 8);
    g.fillStyle = P.goldLight;
    g.fillRect(5, 5, 6, 6);
    g.fillStyle = P.white;
    g.fillRect(6, 6, 2, 2);
    // Window cross
    g.fillStyle = P.woodDark;
    g.fillRect(7, 5, 1, 6);
    g.fillRect(5, 7, 6, 1);
  });

  // Ledger Hut Timber Door
  drawTile(2, 2, (g) => {
    g.fillStyle = P.woodMid;
    g.fillRect(0, 0, 16, 16);
    // Door arch
    g.fillStyle = P.woodDark;
    g.fillRect(3, 2, 10, 14);
    g.fillStyle = '#2b1a11';
    g.fillRect(4, 3, 8, 13);
    // Planks & iron handle
    g.fillStyle = P.woodMid;
    g.fillRect(5, 4, 3, 11);
    g.fillRect(9, 4, 2, 11);
    g.fillStyle = P.goldMid;
    g.fillRect(9, 9, 2, 2);
  });

  // Notice Board Post & Board
  drawTile(3, 2, (g) => {
    g.fillStyle = P.grassMid;
    g.fillRect(0, 0, 16, 16);
    // Wooden frame
    g.fillStyle = P.woodDark;
    g.fillRect(2, 2, 12, 11);
    // Cork / parchment note
    g.fillStyle = '#fef08a';
    g.fillRect(4, 4, 8, 7);
    g.fillStyle = '#ca8a04';
    g.fillRect(5, 6, 6, 1);
    g.fillRect(5, 8, 4, 1);
    // Red pin
    g.fillStyle = P.flowerRed;
    g.fillRect(7, 3, 2, 2);
    // Post
    g.fillStyle = P.woodDark;
    g.fillRect(7, 13, 2, 3);
  });

  assets.tileset = tileCanvas.toDataURL('image/png');

  // -------------------------------------------------------------
  // 2. CHARACTER: PIP (16x32 frame, 4 directions x 4 frames walk)
  // Total canvas: 64x128 (4 cols x 4 rows)
  // Rows: 0=Down, 1=Left, 2=Right, 3=Up
  // -------------------------------------------------------------
  const { c: pipCanvas, ctx: pctx } = createCanvas(64, 128);

  function drawPip(col, row, dir, frame) {
    pctx.save();
    pctx.translate(col * 16, row * 32);

    // Bounce offset
    const bounce = (frame === 1 || frame === 3) ? 1 : 0;
    const legOffset = (frame === 1) ? -1 : (frame === 3) ? 1 : 0;

    // Ground Shadow
    pctx.fillStyle = P.shadow;
    pctx.beginPath();
    pctx.ellipse(8, 30, 6, 2, 0, 0, Math.PI * 2);
    pctx.fill();

    // Boots (Y: 26-29)
    pctx.fillStyle = '#542810';
    if (dir === 'down' || dir === 'up') {
      pctx.fillRect(4, 27 + legOffset, 3, 3 - legOffset);
      pctx.fillRect(9, 27 - legOffset, 3, 3 + legOffset);
    } else if (dir === 'left') {
      pctx.fillRect(5 + legOffset, 27, 4, 3);
      pctx.fillRect(8 - legOffset, 27, 3, 3);
    } else { // right
      pctx.fillRect(4 - legOffset, 27, 3, 3);
      pctx.fillRect(7 + legOffset, 27, 4, 3);
    }

    // Overalls / Legs (Y: 19-26)
    pctx.fillStyle = '#1d4ed8'; // Blue denim
    pctx.fillRect(4, 19 + bounce, 8, 8);
    // Straps & bib
    pctx.fillStyle = '#2563eb';
    pctx.fillRect(5, 15 + bounce, 6, 5);
    // Brass buttons on straps
    pctx.fillStyle = P.goldLight;
    pctx.fillRect(5, 15 + bounce, 1, 1);
    pctx.fillRect(10, 15 + bounce, 1, 1);

    // Shirt sleeves (Y: 15-18)
    pctx.fillStyle = '#f8fafc'; // White shirt
    if (dir === 'down') {
      pctx.fillRect(2, 16 + bounce - legOffset, 2, 4);
      pctx.fillRect(12, 16 + bounce + legOffset, 2, 4);
      // Skin hands
      pctx.fillStyle = '#fbcfe8';
      pctx.fillRect(2, 20 + bounce - legOffset, 2, 2);
      pctx.fillRect(12, 20 + bounce + legOffset, 2, 2);
    } else if (dir === 'up') {
      pctx.fillRect(2, 16 + bounce + legOffset, 2, 4);
      pctx.fillRect(12, 16 + bounce - legOffset, 2, 4);
    } else if (dir === 'left') {
      pctx.fillRect(3, 16 + bounce, 3, 5);
      pctx.fillStyle = '#fbcfe8';
      pctx.fillRect(3, 20 + bounce, 2, 2);
    } else { // right
      pctx.fillRect(10, 16 + bounce, 3, 5);
      pctx.fillStyle = '#fbcfe8';
      pctx.fillRect(11, 20 + bounce, 2, 2);
    }

    // Head & Face (Y: 9-14)
    pctx.fillStyle = '#fbcfe8'; // Skin tone
    pctx.fillRect(4, 9 + bounce, 8, 6);

    if (dir === 'down') {
      // Eyes
      pctx.fillStyle = P.black;
      pctx.fillRect(5, 11 + bounce, 2, 2);
      pctx.fillRect(9, 11 + bounce, 2, 2);
      // Eye shine
      pctx.fillStyle = P.white;
      pctx.fillRect(5, 11 + bounce, 1, 1);
      pctx.fillRect(9, 11 + bounce, 1, 1);
      // Cheerful blush
      pctx.fillStyle = '#f472b6';
      pctx.fillRect(4, 13 + bounce, 2, 1);
      pctx.fillRect(10, 13 + bounce, 2, 1);
    } else if (dir === 'left') {
      pctx.fillStyle = P.black;
      pctx.fillRect(4, 11 + bounce, 2, 2);
      pctx.fillStyle = P.white;
      pctx.fillRect(4, 11 + bounce, 1, 1);
      pctx.fillStyle = '#f472b6';
      pctx.fillRect(4, 13 + bounce, 2, 1);
    } else if (dir === 'right') {
      pctx.fillStyle = P.black;
      pctx.fillRect(10, 11 + bounce, 2, 2);
      pctx.fillStyle = P.white;
      pctx.fillRect(11, 11 + bounce, 1, 1);
      pctx.fillStyle = '#f472b6';
      pctx.fillRect(10, 13 + bounce, 2, 1);
    }

    // Straw Hat (Y: 3-9)
    pctx.fillStyle = '#ca8a04'; // Straw hat brim
    pctx.fillRect(1, 8 + bounce, 14, 2);
    pctx.fillStyle = '#eab308'; // Hat crown
    pctx.fillRect(4, 4 + bounce, 8, 4);
    pctx.fillStyle = '#fde047'; // Hat top highlight
    pctx.fillRect(5, 3 + bounce, 6, 1);
    // Red Ribbon on hat
    pctx.fillStyle = '#dc2626';
    pctx.fillRect(4, 7 + bounce, 8, 1);

    pctx.restore();
  }

  // Draw 4 rows: 0=Down, 1=Left, 2=Right, 3=Up
  const dirs = ['down', 'left', 'right', 'up'];
  dirs.forEach((dir, row) => {
    for (let f = 0; f < 4; f++) {
      drawPip(f, row, dir, f);
    }
  });

  assets.pip_walk = pipCanvas.toDataURL('image/png');

  // -------------------------------------------------------------
  // 3. CHARACTER: BRAM THE BADGER (24x32 frame: idle 2 frames, talk 2 frames)
  // Total canvas: 96x32 (4 cols x 1 row)
  // -------------------------------------------------------------
  const { c: bramCanvas, ctx: bctx } = createCanvas(96, 32);

  function drawBram(col, isTalk, frame) {
    bctx.save();
    bctx.translate(col * 24, 0);

    const bob = (frame === 1) ? 1 : 0;

    // Ground Shadow
    bctx.fillStyle = P.shadow;
    bctx.beginPath();
    bctx.ellipse(12, 30, 8, 2.5, 0, 0, Math.PI * 2);
    bctx.fill();

    // Body / Vest (Y: 16-28)
    bctx.fillStyle = '#452817'; // Tweed jacket
    bctx.fillRect(6, 16 + bob, 12, 12);
    bctx.fillStyle = '#16a34a'; // Green waistcoat
    bctx.fillRect(8, 17 + bob, 8, 9);
    // Gold pocket watch chain
    bctx.fillStyle = P.goldLight;
    bctx.fillRect(9, 21 + bob, 4, 1);

    // Badger Head (Y: 6-16)
    bctx.fillStyle = '#374151'; // Dark grey fur
    bctx.fillRect(5, 6 + bob, 14, 10);
    // White badger facial stripes!
    bctx.fillStyle = '#f9fafb';
    bctx.fillRect(7, 6 + bob, 3, 9);
    bctx.fillRect(14, 6 + bob, 3, 9);
    bctx.fillRect(10, 12 + bob, 4, 3); // Snout
    // Black nose
    bctx.fillStyle = '#111827';
    bctx.fillRect(11, 13 + bob, 2, 1);

    // Round Spectacles
    bctx.fillStyle = P.goldMid;
    bctx.fillRect(7, 9 + bob, 4, 3);
    bctx.fillRect(13, 9 + bob, 4, 3);
    bctx.fillRect(11, 10 + bob, 2, 1); // Bridge
    // Eyes behind glass
    bctx.fillStyle = P.white;
    bctx.fillRect(8, 10 + bob, 2, 2);
    bctx.fillRect(14, 10 + bob, 2, 2);
    bctx.fillStyle = P.black;
    bctx.fillRect(9, 10 + bob, 1, 1);
    bctx.fillRect(15, 10 + bob, 1, 1);

    // Green Accountant Visor
    bctx.fillStyle = '#15803d';
    bctx.fillRect(5, 5 + bob, 14, 2);
    bctx.fillRect(4, 6 + bob, 16, 1); // Brim sticking out

    // Quill in hand (Y: 18-24)
    bctx.fillStyle = '#f8fafc'; // White quill feather
    bctx.fillRect(18, 14 + bob, 2, 6);
    bctx.fillRect(17, 13 + bob, 1, 3);
    bctx.fillStyle = '#a855f7'; // Purple feather tip
    bctx.fillRect(18, 12 + bob, 2, 3);

    // Mouth animation for talk
    if (isTalk && frame === 1) {
      bctx.fillStyle = '#7f1d1d';
      bctx.fillRect(11, 15 + bob, 2, 2);
    }

    bctx.restore();
  }

  // Col 0: Idle Frame 1
  drawBram(0, false, 0);
  // Col 1: Idle Frame 2 (subtle ear/body twitch)
  drawBram(1, false, 1);
  // Col 2: Talk Frame 1
  drawBram(2, true, 0);
  // Col 3: Talk Frame 2 (mouth open)
  drawBram(3, true, 1);

  assets.bram_factor = bramCanvas.toDataURL('image/png');

  // -------------------------------------------------------------
  // 4. UI ATLAS (Hotbar icons, Stepped 9-slice panel, Pixel cursor)
  // -------------------------------------------------------------
  const { c: uiCanvas, ctx: uctx } = createCanvas(128, 64);

  // 9-slice parchment frame (32x32)
  uctx.fillStyle = '#2b1a11'; // Dark wood outer bevel
  uctx.fillRect(0, 0, 32, 32);
  uctx.fillStyle = '#784323'; // Mid wood bevel
  uctx.fillRect(2, 2, 28, 28);
  uctx.fillStyle = '#fef08a'; // Parchment paper center
  uctx.fillRect(4, 4, 24, 24);
  uctx.fillStyle = '#fde047'; // Stepped inner border
  uctx.strokeRect(4.5, 4.5, 23, 23);

  // Hotbar Item Slot (24x24) at x: 36, y: 0
  uctx.fillStyle = '#1e130c';
  uctx.fillRect(36, 0, 24, 24);
  uctx.fillStyle = '#452817';
  uctx.fillRect(38, 2, 20, 20);
  uctx.fillStyle = '#784323';
  uctx.fillRect(39, 3, 18, 18);
  uctx.fillStyle = '#2b1a11';
  uctx.fillRect(41, 5, 14, 14);

  // Active Hotbar Golden Bracket (24x24) at x: 64, y: 0
  uctx.fillStyle = P.goldLight;
  uctx.fillRect(64, 0, 4, 2);
  uctx.fillRect(64, 0, 2, 4);
  uctx.fillRect(84, 0, 4, 2);
  uctx.fillRect(86, 0, 2, 4);
  uctx.fillRect(64, 22, 4, 2);
  uctx.fillRect(64, 20, 2, 4);
  uctx.fillRect(84, 22, 4, 2);
  uctx.fillRect(86, 20, 2, 4);

  // 16-bit Pixel Hand Cursor (16x16) at x: 96, y: 0
  uctx.fillStyle = P.black;
  uctx.fillRect(98, 2, 4, 12);
  uctx.fillRect(96, 6, 8, 8);
  uctx.fillStyle = P.white;
  uctx.fillRect(99, 3, 2, 10);
  uctx.fillRect(97, 7, 6, 6);

  assets.ui_atlas = uiCanvas.toDataURL('image/png');

  return assets;
};
</script>
</body>
</html>`;
}

async function run() {
  console.log('[Pixel Assets] Launching Edge browser...');
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(getAssetGeneratorHtml());
  });

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;

  const page = await browser.newPage();
  await page.goto(`http://127.0.0.1:${port}`, { waitUntil: 'load' });

  console.log('[Pixel Assets] Rendering 16-bit tilesets and character sprites...');
  const assets = await page.evaluate(() => window.generateAllAssets());

  function saveBase64(dataUrl, destPath) {
    const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
    fs.writeFileSync(destPath, Buffer.from(base64Data, 'base64'));
    console.log(`Saved: ${destPath}`);
  }

  saveBase64(assets.tileset, path.join(TILESETS_DIR, 'village_tileset.png'));
  saveBase64(assets.pip_walk, path.join(CHARACTERS_DIR, 'pip_walk.png'));
  saveBase64(assets.bram_factor, path.join(CHARACTERS_DIR, 'bram_factor.png'));
  saveBase64(assets.ui_atlas, path.join(UI_DIR, 'ui_atlas.png'));

  await browser.close();
  server.close();

  console.log('[Pixel Assets] Generation complete!');
}

run().catch((err) => {
  console.error('[Pixel Assets] Error:', err);
  process.exit(1);
});
