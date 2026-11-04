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

  // High-Contrast SNES / GBA RPG Palette
  const P = {
    // Grass
    grassDark: '#2d5a22',
    grassMid: '#4d8a2f',
    grassLight: '#6eb83d',
    grassHigh: '#8ed953',
    
    // Dirt Path
    dirtBorder: '#5c3818',
    dirtDark: '#8a5323',
    dirtMid: '#b8783d',
    dirtLight: '#d99959',
    dirtHigh: '#f3c486',
    
    // Water & Pond
    waterDeep: '#173f9e',
    waterMid: '#2563eb',
    waterLight: '#60a5fa',
    waterFoam: '#dbeafe',
    
    // Wood & Timber
    woodBorder: '#231207',
    woodDark: '#3d200f',
    woodMid: '#633719',
    woodLight: '#94582a',
    woodHigh: '#bf7940',

    // Half-Timber Plaster Wall (High Contrast Cream)
    plasterBorder: '#3d200f',
    plasterDark: '#fef08a',
    plasterMid: '#fef9c3',
    plasterLight: '#ffffff',

    // Roof (Terracotta Shingles)
    roofDark: '#781c1c',
    roofMid: '#a82929',
    roofLight: '#d64545',
    roofHighlight: '#f87171',

    // Stone & Cobble
    stoneDark: '#263342',
    stoneMid: '#475569',
    stoneLight: '#78889b',
    stoneHighlight: '#cbd5e1',

    // Velvet Counter Felt
    feltDark: '#0a361a',
    feltMid: '#14532d',
    feltLight: '#16a34a',

    // Gold & Brass
    goldDark: '#78350f',
    goldMid: '#ca8a04',
    goldLight: '#facc15',
    goldHigh: '#fef08a',
    goldShine: '#ffffff',

    // Flowers & Accents
    flowerRed: '#ef4444',
    flowerBlue: '#38bdf8',
    flowerPink: '#f472b6',
    white: '#ffffff',
    black: '#0f172a',
    shadow: 'rgba(15, 23, 42, 0.45)',
  };

  function drawTile(col, row, drawFn) {
    tctx.save();
    tctx.translate(col * TILE, row * TILE);
    drawFn(tctx);
    tctx.restore();
  }

  // Row 0: Grass and Path
  // Tile 0,0: Plain Grass with fine blades
  drawTile(0, 0, (g) => {
    g.fillStyle = P.grassMid;
    g.fillRect(0, 0, 16, 16);
    // Grass blade texture
    g.fillStyle = P.grassDark;
    g.fillRect(2, 3, 1, 2);
    g.fillRect(8, 7, 1, 2);
    g.fillRect(13, 12, 1, 2);
    g.fillStyle = P.grassLight;
    g.fillRect(3, 2, 1, 2);
    g.fillRect(9, 6, 1, 2);
    g.fillRect(14, 11, 1, 2);
  });

  // Tile 1,0: Grass with Clover Tuft & Daisies
  drawTile(1, 0, (g) => {
    g.fillStyle = P.grassMid;
    g.fillRect(0, 0, 16, 16);
    // Clover tuft
    g.fillStyle = P.grassDark;
    g.fillRect(5, 7, 5, 5);
    g.fillStyle = P.grassHigh;
    g.fillRect(5, 6, 2, 2);
    g.fillRect(8, 6, 2, 2);
    g.fillRect(6, 8, 3, 2);
    // White Daisy
    g.fillStyle = P.white;
    g.fillRect(11, 4, 3, 3);
    g.fillStyle = P.goldLight;
    g.fillRect(12, 5, 1, 1);
  });

  // Tile 2,0: Grass with Red Poppies
  drawTile(2, 0, (g) => {
    g.fillStyle = P.grassMid;
    g.fillRect(0, 0, 16, 16);
    // Poppy 1
    g.fillStyle = P.grassDark;
    g.fillRect(3, 8, 2, 4);
    g.fillStyle = P.flowerRed;
    g.fillRect(2, 6, 4, 4);
    g.fillStyle = P.black;
    g.fillRect(3, 7, 2, 2);
    g.fillStyle = P.goldLight;
    g.fillRect(4, 7, 1, 1);
    // Poppy 2
    g.fillStyle = P.flowerRed;
    g.fillRect(11, 10, 3, 3);
    g.fillStyle = P.black;
    g.fillRect(12, 11, 1, 1);
  });

  // Tile 3,0: Grass with Bluebell Flowers & Pebble
  drawTile(3, 0, (g) => {
    g.fillStyle = P.grassMid;
    g.fillRect(0, 0, 16, 16);
    // Blue flower
    g.fillStyle = P.flowerBlue;
    g.fillRect(3, 5, 3, 3);
    g.fillStyle = P.white;
    g.fillRect(4, 6, 1, 1);
    // River pebble
    g.fillStyle = P.stoneDark;
    g.fillRect(9, 10, 4, 3);
    g.fillStyle = P.stoneHighlight;
    g.fillRect(10, 10, 2, 1);
  });

  // Tile 4,0: Sandy Dirt Path Center
  drawTile(4, 0, (g) => {
    g.fillStyle = P.dirtMid;
    g.fillRect(0, 0, 16, 16);
    // Earthy stones & sand highlights
    g.fillStyle = P.dirtLight;
    g.fillRect(2, 3, 3, 2);
    g.fillRect(9, 8, 4, 2);
    g.fillRect(5, 13, 3, 1);
    g.fillStyle = P.dirtHigh;
    g.fillRect(3, 3, 1, 1);
    g.fillRect(10, 8, 2, 1);
    g.fillStyle = P.dirtDark;
    g.fillRect(6, 4, 2, 1);
    g.fillRect(12, 11, 2, 1);
  });

  // Tile 5,0: Dirt Path Top Edge with Grass Fringe
  drawTile(5, 0, (g) => {
    g.fillStyle = P.dirtMid;
    g.fillRect(0, 0, 16, 16);
    // Grass top border
    g.fillStyle = P.grassMid;
    g.fillRect(0, 0, 16, 5);
    // Spiky grass teeth
    g.fillRect(1, 5, 2, 3);
    g.fillRect(6, 5, 3, 2);
    g.fillRect(11, 5, 3, 3);
    g.fillStyle = P.grassDark;
    g.fillRect(0, 4, 16, 1);
    g.fillRect(1, 7, 2, 1);
    g.fillRect(11, 7, 3, 1);
    g.fillStyle = P.grassHigh;
    g.fillRect(2, 5, 1, 2);
    g.fillRect(7, 5, 1, 1);
    g.fillRect(12, 5, 1, 2);
  });

  // Tile 6,0: Dirt Path Bottom Edge with Grass Fringe
  drawTile(6, 0, (g) => {
    g.fillStyle = P.dirtMid;
    g.fillRect(0, 0, 16, 16);
    // Grass bottom border
    g.fillStyle = P.grassMid;
    g.fillRect(0, 11, 16, 5);
    // Spiky grass teeth extending upward
    g.fillRect(2, 8, 2, 3);
    g.fillRect(7, 9, 3, 2);
    g.fillRect(12, 8, 3, 3);
    g.fillStyle = P.grassDark;
    g.fillRect(0, 11, 16, 1);
    g.fillRect(2, 8, 2, 1);
    g.fillRect(12, 8, 3, 1);
    g.fillStyle = P.grassHigh;
    g.fillRect(2, 9, 1, 2);
    g.fillRect(8, 10, 1, 1);
    g.fillRect(13, 9, 1, 2);
  });

  // Tile 7,0: Tilled Garden Soil Plot
  drawTile(7, 0, (g) => {
    g.fillStyle = '#261309';
    g.fillRect(0, 0, 16, 16);
    // Rich brown soil furrows
    g.fillStyle = '#422415';
    g.fillRect(1, 2, 14, 3);
    g.fillRect(1, 7, 14, 3);
    g.fillRect(1, 12, 14, 3);
    g.fillStyle = '#613720';
    g.fillRect(2, 2, 12, 1);
    g.fillRect(2, 7, 12, 1);
    g.fillRect(2, 12, 12, 1);
    // Sprout seeds
    g.fillStyle = P.grassHigh;
    g.fillRect(4, 3, 2, 1);
    g.fillRect(10, 8, 2, 1);
    g.fillRect(6, 13, 2, 1);
  });

  // Row 1: Water, Fences & Objects
  // Tile 0,1: Deep Water Shoreline
  drawTile(0, 1, (g) => {
    g.fillStyle = P.waterMid;
    g.fillRect(0, 0, 16, 16);
    g.fillStyle = P.waterDeep;
    g.fillRect(0, 8, 16, 8);
    // Water ripples
    g.fillStyle = P.waterLight;
    g.fillRect(3, 4, 5, 1);
    g.fillRect(9, 11, 5, 1);
    g.fillStyle = P.waterFoam;
    g.fillRect(4, 3, 2, 1);
    g.fillRect(10, 10, 2, 1);
    // Lily pad
    g.fillStyle = '#15803d';
    g.fillRect(1, 11, 4, 3);
    g.fillStyle = '#86efac';
    g.fillRect(2, 11, 2, 1);
    // Pink blossom petal floating
    g.fillStyle = P.flowerPink;
    g.fillRect(13, 5, 2, 2);
  });

  // Tile 1,1: Deep Water Frame 2 (animated shimmer)
  drawTile(1, 1, (g) => {
    g.fillStyle = P.waterMid;
    g.fillRect(0, 0, 16, 16);
    g.fillStyle = P.waterDeep;
    g.fillRect(0, 6, 16, 10);
    g.fillStyle = P.waterLight;
    g.fillRect(5, 5, 5, 1);
    g.fillRect(7, 12, 5, 1);
    g.fillStyle = P.waterFoam;
    g.fillRect(6, 4, 2, 1);
    g.fillRect(8, 11, 2, 1);
  });

  // Tile 2,1: Wooden Rail Fence (Clean outlines & grain)
  drawTile(2, 1, (g) => {
    g.fillStyle = P.grassMid;
    g.fillRect(0, 0, 16, 16);
    // Fence shadow
    g.fillStyle = P.shadow;
    g.fillRect(1, 13, 14, 2);
    // Upper & Lower Rails with dark outline
    g.fillStyle = P.woodBorder;
    g.fillRect(0, 4, 16, 4);
    g.fillRect(0, 9, 16, 4);
    // Wood body
    g.fillStyle = P.woodLight;
    g.fillRect(0, 5, 16, 2);
    g.fillRect(0, 10, 16, 2);
    g.fillStyle = P.woodHigh;
    g.fillRect(0, 5, 16, 1);
    // Post
    g.fillStyle = P.woodBorder;
    g.fillRect(5, 1, 6, 14);
    g.fillStyle = P.woodLight;
    g.fillRect(6, 2, 4, 12);
    g.fillStyle = P.woodHigh;
    g.fillRect(6, 2, 2, 12);
    // Pointed post top
    g.fillStyle = P.woodBorder;
    g.fillRect(7, 0, 2, 1);
  });

  // Tile 3,1: Wooden Rail Fence Corner Post
  drawTile(3, 1, (g) => {
    g.fillStyle = P.grassMid;
    g.fillRect(0, 0, 16, 16);
    g.fillStyle = P.shadow;
    g.fillRect(4, 13, 8, 3);
    g.fillStyle = P.woodBorder;
    g.fillRect(5, 1, 6, 14);
    g.fillRect(7, 0, 2, 1);
    g.fillStyle = P.woodLight;
    g.fillRect(6, 2, 4, 12);
    g.fillStyle = P.woodHigh;
    g.fillRect(6, 2, 2, 12);
  });

  // Tile 4,1: Village Cobblestone Paving
  drawTile(4, 1, (g) => {
    g.fillStyle = P.stoneDark; // Mortar
    g.fillRect(0, 0, 16, 16);
    // Stone 1 (Top Left)
    g.fillStyle = P.stoneMid;
    g.fillRect(1, 1, 6, 6);
    g.fillStyle = P.stoneHighlight;
    g.fillRect(2, 2, 4, 2);
    // Stone 2 (Top Right)
    g.fillStyle = P.stoneMid;
    g.fillRect(8, 1, 7, 6);
    g.fillStyle = P.stoneHighlight;
    g.fillRect(9, 2, 5, 2);
    // Stone 3 (Bottom Center)
    g.fillStyle = P.stoneMid;
    g.fillRect(3, 8, 10, 7);
    g.fillStyle = P.stoneHighlight;
    g.fillRect(5, 9, 6, 2);
    // Stone 4 (Bottom Left)
    g.fillStyle = P.stoneLight;
    g.fillRect(1, 8, 2, 7);
    // Stone 5 (Bottom Right)
    g.fillStyle = P.stoneLight;
    g.fillRect(13, 8, 2, 7);
  });

  // Tile 5,1: Ledger Counter Desk (Mahogany Frame with Green Velvet Mat!)
  drawTile(5, 1, (g) => {
    // Dark mahogany border
    g.fillStyle = P.woodBorder;
    g.fillRect(0, 0, 16, 16);
    // Polished mahogany wood base
    g.fillStyle = P.woodMid;
    g.fillRect(1, 1, 14, 14);
    // Green velvet counter mat in center
    g.fillStyle = P.feltDark;
    g.fillRect(1, 3, 14, 10);
    g.fillStyle = P.feltMid;
    g.fillRect(2, 4, 12, 8);
    g.fillStyle = P.feltLight;
    g.fillRect(3, 4, 10, 1);
    // Brass corner brackets
    g.fillStyle = P.goldLight;
    g.fillRect(1, 1, 2, 2);
    g.fillRect(13, 1, 2, 2);
    g.fillRect(1, 13, 2, 2);
    g.fillRect(13, 13, 2, 2);
  });

  // Tile 6,1: Brass Balance Scale (High-Contrast, Crisp 1px Outline)
  drawTile(6, 1, (g) => {
    // Drop shadow
    g.fillStyle = P.shadow;
    g.fillRect(4, 14, 8, 2);
    // Black / Dark perimeter outline
    g.fillStyle = P.black;
    // Base & Column
    g.fillRect(5, 13, 6, 3);
    g.fillRect(7, 3, 2, 11);
    // Horizontal Crossbeam
    g.fillRect(1, 3, 14, 3);
    // Left Hanging Pan
    g.fillRect(1, 6, 1, 4);
    g.fillRect(5, 6, 1, 4);
    g.fillRect(1, 10, 5, 2);
    // Right Hanging Pan
    g.fillRect(10, 6, 1, 4);
    g.fillRect(14, 6, 1, 4);
    g.fillRect(10, 10, 5, 2);

    // Brass Fill & Gleam Highlights
    // Column & Base
    g.fillStyle = P.goldMid;
    g.fillRect(6, 13, 4, 2);
    g.fillRect(7, 4, 2, 9);
    g.fillStyle = P.goldLight;
    g.fillRect(7, 4, 1, 9);
    // Crossbeam
    g.fillRect(2, 4, 12, 1);
    g.fillStyle = P.goldHigh;
    g.fillRect(4, 4, 8, 1);
    // Top Finial Specular Gleam
    g.fillStyle = P.white;
    g.fillRect(7, 2, 2, 2);

    // Left Pan with Gold Coins
    g.fillStyle = P.goldLight;
    g.fillRect(2, 10, 3, 1);
    g.fillStyle = P.goldHigh;
    g.fillRect(2, 9, 2, 1); // Gold coin in left pan

    // Right Pan with Heavier Gold Coins
    g.fillStyle = P.goldLight;
    g.fillRect(11, 10, 3, 1);
    g.fillStyle = P.goldHigh;
    g.fillRect(11, 8, 3, 2); // 2 Gold coins stacked
    g.fillStyle = P.white;
    g.fillRect(12, 8, 1, 1); // Gleam
  });

  // Tile 7,1: Bulging Gold Coin Sack (High Contrast, Spilling Coins)
  drawTile(7, 1, (g) => {
    // Drop shadow
    g.fillStyle = P.shadow;
    g.fillRect(2, 13, 12, 3);

    // Dark perimeter outline
    g.fillStyle = P.black;
    g.fillRect(3, 5, 10, 10);
    g.fillRect(4, 2, 8, 4);

    // Burlap Sack Body (Warm golden canvas)
    g.fillStyle = '#b45309'; // Shadow
    g.fillRect(4, 6, 8, 8);
    g.fillStyle = '#f59e0b'; // Midtone
    g.fillRect(5, 6, 6, 7);
    g.fillStyle = '#fde68a'; // Highlight fold
    g.fillRect(6, 7, 4, 4);

    // Fluted Neck Top
    g.fillStyle = '#b45309';
    g.fillRect(5, 3, 6, 2);
    g.fillStyle = '#f59e0b';
    g.fillRect(6, 3, 4, 1);

    // Crimson Tie Ribbon with Bow
    g.fillStyle = P.flowerRed;
    g.fillRect(4, 5, 8, 2);
    g.fillStyle = '#b91c1c';
    g.fillRect(4, 6, 2, 2); // Ribbon tails
    g.fillRect(10, 6, 2, 2);

    // Spilling Shiny Gold Coins!
    g.fillStyle = P.black;
    g.fillRect(10, 11, 5, 5); // Coin outline
    g.fillStyle = P.goldLight;
    g.fillRect(11, 12, 3, 3);
    g.fillStyle = P.white;
    g.fillRect(12, 12, 1, 1); // Specular gleam
  });

  // Row 2: Building Components (High-Contrast Half-Timber Architecture)
  // Tile 0,2: Terracotta Shingled Roof
  drawTile(0, 2, (g) => {
    // Dark under-shadow
    g.fillStyle = P.roofDark;
    g.fillRect(0, 0, 16, 16);
    // Shingle row 1
    g.fillStyle = P.roofMid;
    g.fillRect(0, 2, 16, 4);
    g.fillStyle = P.roofHighlight;
    g.fillRect(1, 2, 6, 1);
    g.fillRect(9, 2, 6, 1);
    // Shingle row 2
    g.fillStyle = P.roofDark;
    g.fillRect(0, 6, 16, 1);
    g.fillStyle = P.roofMid;
    g.fillRect(0, 7, 16, 4);
    g.fillStyle = P.roofHighlight;
    g.fillRect(4, 7, 7, 1);
    // Shingle row 3 (Eaves)
    g.fillStyle = P.roofDark;
    g.fillRect(0, 11, 16, 1);
    g.fillStyle = P.roofMid;
    g.fillRect(0, 12, 16, 4);
    g.fillStyle = P.roofHighlight;
    g.fillRect(1, 12, 6, 1);
    g.fillRect(9, 12, 6, 1);
  });

  // Tile 1,2: Half-Timber Plaster Wall (High-Contrast Cream with Dark Oak Beams)
  drawTile(1, 2, (g) => {
    // Warm Cream Plaster Base
    g.fillStyle = P.plasterMid;
    g.fillRect(0, 0, 16, 16);
    g.fillStyle = P.plasterDark;
    g.fillRect(0, 14, 16, 2); // Bottom shadow
    // Dark Oak Timber Posts
    g.fillStyle = P.woodBorder;
    g.fillRect(0, 0, 3, 16);  // Left vertical beam
    g.fillRect(13, 0, 3, 16); // Right vertical beam
    g.fillRect(0, 0, 16, 2);  // Top horizontal beam
    g.fillRect(0, 14, 16, 2); // Bottom horizontal sill
    // Wood grain highlight
    g.fillStyle = P.woodMid;
    g.fillRect(1, 1, 1, 14);
    g.fillRect(14, 1, 1, 14);
  });

  // Tile 2,2: Half-Timber Wall with Glowing Leaded-Glass Window & Shutters
  drawTile(2, 2, (g) => {
    // Cream plaster base
    g.fillStyle = P.plasterMid;
    g.fillRect(0, 0, 16, 16);
    // Window opening frame
    g.fillStyle = P.woodBorder;
    g.fillRect(3, 2, 10, 11);
    // Glowing warm amber-gold window panes!
    g.fillStyle = P.goldLight;
    g.fillRect(5, 4, 6, 7);
    g.fillStyle = P.goldHigh;
    g.fillRect(6, 5, 4, 3);
    g.fillStyle = P.white;
    g.fillRect(6, 5, 2, 2); // Window glow reflection
    // Dark leaded glass window crossbars
    g.fillStyle = P.woodBorder;
    g.fillRect(7, 4, 1, 7);
    g.fillRect(5, 7, 6, 1);
    // Dark oak wooden shutters on sides
    g.fillStyle = P.woodMid;
    g.fillRect(2, 3, 2, 9);
    g.fillRect(12, 3, 2, 9);
    g.fillStyle = P.woodLight;
    g.fillRect(2, 4, 1, 7);
    g.fillRect(12, 4, 1, 7);
  });

  // Tile 3,2: Heavy Oak Merchant Door with Arched Stone Frame
  drawTile(3, 2, (g) => {
    // Stone arch outline
    g.fillStyle = P.stoneDark;
    g.fillRect(1, 0, 14, 16);
    g.fillStyle = P.stoneMid;
    g.fillRect(2, 1, 12, 15);
    // Dark door recess
    g.fillStyle = P.woodBorder;
    g.fillRect(3, 2, 10, 14);
    // Oak door planks
    g.fillStyle = P.woodMid;
    g.fillRect(4, 3, 8, 13);
    g.fillStyle = P.woodDark;
    g.fillRect(7, 3, 1, 13); // Vertical plank divide
    // Iron strap hinges
    g.fillStyle = P.stoneDark;
    g.fillRect(4, 5, 5, 2);
    g.fillRect(4, 11, 5, 2);
    // Brass door knocker / handle
    g.fillStyle = P.goldLight;
    g.fillRect(9, 8, 2, 2);
    g.fillStyle = P.white;
    g.fillRect(9, 8, 1, 1);
  });

  // Tile 4,2: Hanging Wooden Shop Signboard ("LEDGER")
  drawTile(4, 2, (g) => {
    g.fillStyle = P.plasterMid;
    g.fillRect(0, 0, 16, 16);
    // Iron hanging chains
    g.fillStyle = P.black;
    g.fillRect(4, 1, 1, 4);
    g.fillRect(11, 1, 1, 4);
    // Wooden sign plaque with dark outline
    g.fillStyle = P.woodBorder;
    g.fillRect(2, 4, 12, 10);
    g.fillStyle = P.woodLight;
    g.fillRect(3, 5, 10, 8);
    // Carved golden coin balance icon on plaque
    g.fillStyle = P.goldLight;
    g.fillRect(5, 7, 6, 4);
    g.fillStyle = P.black;
    g.fillRect(7, 6, 2, 1);
    g.fillStyle = P.white;
    g.fillRect(6, 8, 1, 1);
  });

  assets.tileset = tileCanvas.toDataURL('image/png');

  // -------------------------------------------------------------
  // 2. CHARACTER: PIP THE FARMER (16x32 native, 4 directions x 4 frames walk)
  // High-Contrast Selective Outlines, Defined Features, Vibrant Denim & Straw
  // -------------------------------------------------------------
  const { c: pipCanvas, ctx: pctx } = createCanvas(64, 128);

  function drawPip(col, row, dir, frame) {
    pctx.save();
    pctx.translate(col * 16, row * 32);

    const bounce = (frame === 1 || frame === 3) ? 1 : 0;
    const legOffset = (frame === 1) ? -1 : (frame === 3) ? 1 : 0;

    // Ground Shadow (High clarity)
    pctx.fillStyle = 'rgba(15, 23, 42, 0.4)';
    pctx.beginPath();
    pctx.ellipse(8, 30, 6, 2.5, 0, 0, Math.PI * 2);
    pctx.fill();

    // ── 1. BOOTS (Y: 26-30) ──
    pctx.fillStyle = '#1e1008'; // Dark boot outline
    if (dir === 'down' || dir === 'up') {
      pctx.fillRect(3, 26 + legOffset, 4, 4 - legOffset);
      pctx.fillRect(9, 26 - legOffset, 4, 4 + legOffset);
      pctx.fillStyle = '#633719'; // Leather boot fill
      pctx.fillRect(4, 27 + legOffset, 2, 2);
      pctx.fillRect(10, 27 - legOffset, 2, 2);
    } else if (dir === 'left') {
      pctx.fillRect(4 + legOffset, 26, 5, 4);
      pctx.fillRect(8 - legOffset, 26, 4, 4);
      pctx.fillStyle = '#633719';
      pctx.fillRect(5 + legOffset, 27, 3, 2);
      pctx.fillRect(9 - legOffset, 27, 2, 2);
    } else { // right
      pctx.fillRect(3 - legOffset, 26, 4, 4);
      pctx.fillRect(7 + legOffset, 26, 5, 4);
      pctx.fillStyle = '#633719';
      pctx.fillRect(4 - legOffset, 27, 2, 2);
      pctx.fillRect(8 + legOffset, 27, 3, 2);
    }

    // ── 2. INDIGO DENIM OVERALLS (Y: 18-26) ──
    // Dark outline perimeter
    pctx.fillStyle = '#0f172a';
    pctx.fillRect(3, 18 + bounce, 10, 9);
    // Denim body fill
    pctx.fillStyle = '#1d4ed8';
    pctx.fillRect(4, 19 + bounce, 8, 7);
    // Leg divide
    if (dir === 'down' || dir === 'up') {
      pctx.fillStyle = '#0f172a';
      pctx.fillRect(7, 22 + bounce, 2, 5);
    }
    // Overalls bib and shoulder straps
    pctx.fillStyle = '#0f172a';
    pctx.fillRect(4, 14 + bounce, 8, 5);
    pctx.fillStyle = '#2563eb';
    pctx.fillRect(5, 15 + bounce, 6, 4);
    // Golden brass buckle fasteners
    pctx.fillStyle = P.goldLight;
    pctx.fillRect(5, 15 + bounce, 1, 1);
    pctx.fillRect(10, 15 + bounce, 1, 1);
    // Front utility pocket & wheat sprig
    pctx.fillStyle = '#1d4ed8';
    pctx.fillRect(6, 17 + bounce, 4, 2);
    pctx.fillStyle = P.goldLight;
    pctx.fillRect(8, 16 + bounce, 1, 1); // Wheat sprig

    // ── 3. WHITE ROLL-UP SHIRT & ARMS (Y: 13-18) ──
    pctx.fillStyle = '#0f172a'; // Arm outline
    if (dir === 'down') {
      pctx.fillRect(1, 15 + bounce - legOffset, 3, 5);
      pctx.fillRect(12, 15 + bounce + legOffset, 3, 5);
      pctx.fillStyle = '#ffffff'; // White shirt sleeves
      pctx.fillRect(2, 16 + bounce - legOffset, 2, 2);
      pctx.fillRect(12, 16 + bounce + legOffset, 2, 2);
      pctx.fillStyle = '#fed7aa'; // Peach hands
      pctx.fillRect(2, 18 + bounce - legOffset, 2, 2);
      pctx.fillRect(12, 18 + bounce + legOffset, 2, 2);
    } else if (dir === 'up') {
      pctx.fillRect(1, 15 + bounce + legOffset, 3, 5);
      pctx.fillRect(12, 15 + bounce - legOffset, 3, 5);
      pctx.fillStyle = '#ffffff';
      pctx.fillRect(2, 16 + bounce + legOffset, 2, 3);
      pctx.fillRect(12, 16 + bounce - legOffset, 2, 3);
    } else if (dir === 'left') {
      pctx.fillRect(2, 15 + bounce, 3, 6);
      pctx.fillStyle = '#ffffff';
      pctx.fillRect(3, 16 + bounce, 2, 3);
      pctx.fillStyle = '#fed7aa';
      pctx.fillRect(2, 19 + bounce, 2, 2);
    } else { // right
      pctx.fillRect(11, 15 + bounce, 3, 6);
      pctx.fillStyle = '#ffffff';
      pctx.fillRect(11, 16 + bounce, 2, 3);
      pctx.fillStyle = '#fed7aa';
      pctx.fillRect(12, 19 + bounce, 2, 2);
    }

    // ── 4. HEAD, FACE & HAIR (Y: 8-14) ──
    // Head base outline
    pctx.fillStyle = '#1e1008';
    pctx.fillRect(3, 8 + bounce, 10, 7);
    // Peach skin
    pctx.fillStyle = '#fed7aa';
    pctx.fillRect(4, 9 + bounce, 8, 5);
    // Chestnut brown curly hair
    pctx.fillStyle = '#5c341b';
    pctx.fillRect(4, 8 + bounce, 8, 2);
    pctx.fillRect(3, 10 + bounce, 1, 2);
    pctx.fillRect(12, 10 + bounce, 1, 2);

    if (dir === 'down') {
      // Expressive Anime Eyes (Dark pupil + Specular glint)
      pctx.fillStyle = '#0f172a';
      pctx.fillRect(5, 10 + bounce, 2, 2);
      pctx.fillRect(9, 10 + bounce, 2, 2);
      pctx.fillStyle = P.white;
      pctx.fillRect(5, 10 + bounce, 1, 1);
      pctx.fillRect(9, 10 + bounce, 1, 1);
      // Rosy anime cheeks
      pctx.fillStyle = '#f472b6';
      pctx.fillRect(4, 12 + bounce, 2, 1);
      pctx.fillRect(10, 12 + bounce, 2, 1);
    } else if (dir === 'left') {
      pctx.fillStyle = '#0f172a';
      pctx.fillRect(4, 10 + bounce, 2, 2);
      pctx.fillStyle = P.white;
      pctx.fillRect(4, 10 + bounce, 1, 1);
      pctx.fillStyle = '#f472b6';
      pctx.fillRect(4, 12 + bounce, 2, 1);
    } else if (dir === 'right') {
      pctx.fillStyle = '#0f172a';
      pctx.fillRect(10, 10 + bounce, 2, 2);
      pctx.fillStyle = P.white;
      pctx.fillRect(11, 10 + bounce, 1, 1);
      pctx.fillStyle = '#f472b6';
      pctx.fillRect(10, 12 + bounce, 2, 1);
    }

    // ── 5. WOVEN STRAW HAT WITH SCARLET RIBBON (Y: 2-8) ──
    // Dark outline perimeter
    pctx.fillStyle = '#3d200f';
    pctx.fillRect(0, 7 + bounce, 16, 3);
    pctx.fillRect(3, 2 + bounce, 10, 6);
    // Straw thatch gold brim
    pctx.fillStyle = '#ca8a04';
    pctx.fillRect(1, 8 + bounce, 14, 1);
    pctx.fillStyle = '#fde047';
    pctx.fillRect(2, 7 + bounce, 12, 1);
    // Hat crown
    pctx.fillStyle = '#ca8a04';
    pctx.fillRect(4, 3 + bounce, 8, 4);
    pctx.fillStyle = '#fde047';
    pctx.fillRect(5, 3 + bounce, 6, 2);
    // Scarlet Red Hat Band
    pctx.fillStyle = '#dc2626';
    pctx.fillRect(4, 6 + bounce, 8, 1);
    pctx.fillStyle = '#991b1b';
    pctx.fillRect(dir === 'right' ? 3 : 11, 6 + bounce, 2, 2); // Fluttering ribbon knot

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
  // 3. CHARACTER: BRAM THE BADGER FACTOR (24x32 frame)
  // Striking White Facial Stripes, Golden Glasses, Accountant Visor, Tweed Coat
  // -------------------------------------------------------------
  const { c: bramCanvas, ctx: bctx } = createCanvas(96, 32);

  function drawBram(col, isTalk, frame) {
    bctx.save();
    bctx.translate(col * 24, 0);

    const bob = (frame === 1) ? 1 : 0;

    // Ground Shadow
    bctx.fillStyle = 'rgba(15, 23, 42, 0.45)';
    bctx.beginPath();
    bctx.ellipse(12, 30, 8, 2.5, 0, 0, Math.PI * 2);
    bctx.fill();

    // ── 1. BODY & ATTIRE (Y: 15-28) ──
    // Dark perimeter outline
    bctx.fillStyle = '#0f172a';
    bctx.fillRect(5, 15 + bob, 14, 13);
    // Chocolate Tweed Coat
    bctx.fillStyle = '#3d200f';
    bctx.fillRect(6, 16 + bob, 12, 11);
    // Crisp White Shirt Collar
    bctx.fillStyle = '#ffffff';
    bctx.fillRect(9, 16 + bob, 6, 3);
    // Crimson Bowtie / Cravat
    bctx.fillStyle = '#dc2626';
    bctx.fillRect(10, 18 + bob, 4, 2);
    bctx.fillStyle = '#991b1b';
    bctx.fillRect(11, 18 + bob, 2, 1);
    // Forest-Green Tweed Waistcoat
    bctx.fillStyle = '#14532d';
    bctx.fillRect(8, 20 + bob, 8, 6);
    // Golden Pocket Watch Chain
    bctx.fillStyle = P.goldLight;
    bctx.fillRect(9, 22 + bob, 6, 1);
    bctx.fillRect(14, 23 + bob, 1, 1); // Pocket fob

    // ── 2. BADGER HEAD & STRIPES (Y: 4-15) ──
    // Dark perimeter outline
    bctx.fillStyle = '#0f172a';
    bctx.fillRect(4, 4 + bob, 16, 12);

    // Dark charcoal fur bands across eyes/cheeks
    bctx.fillStyle = '#1e293b';
    bctx.fillRect(5, 5 + bob, 14, 10);

    // PURE WHITE BADGER STRIPES (High Contrast!)
    bctx.fillStyle = '#ffffff';
    // Center forehead & snout stripe
    bctx.fillRect(10, 4 + bob, 4, 10);
    // Left & Right cheek stripes
    bctx.fillRect(5, 8 + bob, 2, 6);
    bctx.fillRect(17, 8 + bob, 2, 6);
    // White ear tips
    bctx.fillRect(5, 3 + bob, 3, 2);
    bctx.fillRect(16, 3 + bob, 3, 2);

    // Black button nose
    bctx.fillStyle = '#0f172a';
    bctx.fillRect(11, 12 + bob, 2, 2);
    bctx.fillStyle = '#ffffff';
    bctx.fillRect(11, 12 + bob, 1, 1); // Nose shine

    // ── 3. ROUND GOLD WIRE SPECTACLES ──
    // Golden frames
    bctx.fillStyle = P.goldLight;
    bctx.fillRect(7, 7 + bob, 4, 4);
    bctx.fillRect(13, 7 + bob, 4, 4);
    bctx.fillRect(11, 8 + bob, 2, 1); // Bridge
    // Reflective glass lenses
    bctx.fillStyle = '#e0f2fe';
    bctx.fillRect(8, 8 + bob, 2, 2);
    bctx.fillRect(14, 8 + bob, 2, 2);
    // Dark pupils behind glass
    bctx.fillStyle = '#0f172a';
    bctx.fillRect(9, 8 + bob, 1, 1);
    bctx.fillRect(15, 8 + bob, 1, 1);

    // ── 4. EMERALD ACCOUNTANT VISOR ──
    bctx.fillStyle = '#0f172a';
    bctx.fillRect(3, 4 + bob, 18, 3);
    bctx.fillStyle = '#15803d';
    bctx.fillRect(4, 4 + bob, 16, 2);
    bctx.fillStyle = '#4ade80'; // Bright visor rim
    bctx.fillRect(3, 6 + bob, 18, 1);

    // ── 5. FEATHER QUILL PEN IN HAND (Y: 14-23) ──
    bctx.fillStyle = '#0f172a';
    bctx.fillRect(19, 13 + bob, 3, 8);
    bctx.fillStyle = '#ffffff'; // White feather
    bctx.fillRect(20, 14 + bob, 2, 6);
    bctx.fillStyle = '#9333ea'; // Purple ink tip
    bctx.fillRect(20, 12 + bob, 2, 3);

    // Mouth for talking frame
    if (isTalk && frame === 1) {
      bctx.fillStyle = '#881337';
      bctx.fillRect(11, 14 + bob, 2, 2);
    }

    bctx.restore();
  }

  // Col 0: Idle Frame 1
  drawBram(0, false, 0);
  // Col 1: Idle Frame 2
  drawBram(1, false, 1);
  // Col 2: Talk Frame 1
  drawBram(2, true, 0);
  // Col 3: Talk Frame 2
  drawBram(3, true, 1);

  assets.bram_factor = bramCanvas.toDataURL('image/png');

  // -------------------------------------------------------------
  // 4. UI ATLAS (9-slice parchment frame & hotbar slots)
  // -------------------------------------------------------------
  const { c: uiCanvas, ctx: uctx } = createCanvas(128, 64);

  // Stepped pixel frame (32x32)
  uctx.fillStyle = '#3d200f';
  uctx.fillRect(0, 0, 32, 32);
  uctx.fillStyle = '#784323';
  uctx.fillRect(2, 2, 28, 28);
  uctx.fillStyle = '#fef9c3';
  uctx.fillRect(4, 4, 24, 24);

  // Hotbar item slot (24x24)
  uctx.fillStyle = '#1e1208';
  uctx.fillRect(36, 0, 24, 24);
  uctx.fillStyle = '#5c341b';
  uctx.fillRect(38, 2, 20, 20);
  uctx.fillStyle = '#2b1408';
  uctx.fillRect(40, 4, 16, 16);

  assets.ui_atlas = uiCanvas.toDataURL('image/png');

  return assets;
};
</script>
</body>
</html>`;
}

async function run() {
  console.log('Generating polished 16-bit RPG pixel assets...');

  const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(getAssetGeneratorHtml());
  });

  server.listen(4999, async () => {
    try {
      const browser = await puppeteer.launch({
        executablePath: EDGE_PATH,
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });

      const page = await browser.newPage();
      await page.goto('http://localhost:4999');

      const assets = await page.evaluate(() => {
        return window.generateAllAssets();
      });

      function saveBase64Png(dataUrl, outPath) {
        const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
        fs.writeFileSync(outPath, Buffer.from(base64Data, 'base64'));
        console.log(`Saved: ${outPath}`);
      }

      saveBase64Png(assets.tileset, path.join(TILESETS_DIR, 'village_tileset.png'));
      saveBase64Png(assets.pip_walk, path.join(CHARACTERS_DIR, 'pip_walk.png'));
      saveBase64Png(assets.bram_factor, path.join(CHARACTERS_DIR, 'bram_factor.png'));
      saveBase64Png(assets.ui_atlas, path.join(UI_DIR, 'ui_atlas.png'));

      await browser.close();
      server.close();
      console.log('Successfully polished all 16-bit pixel assets!');
      process.exit(0);
    } catch (err) {
      console.error('Error generating assets:', err);
      server.close();
      process.exit(1);
    }
  });
}

run();
