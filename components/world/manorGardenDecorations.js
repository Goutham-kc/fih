/**
 * Manor Garden Decorations & Authentic Crops Renderer
 * Adds rich, animated Fields of Mistria crops, flowers, and estate garden decor
 * to the northern Manor House grounds.
 */

// Colors authentic to Fields of Mistria palette
const C = {
  soilDark: '#6b3c1b',
  soilWet: '#542d13',
  greenDark: '#235334',
  greenMid: '#387847',
  greenBright: '#5cb85c',
  greenSprout: '#8ae06a',
  strawbRed: '#e53935',
  strawbPink: '#f87171',
  strawbHighlight: '#fca5a5',
  sunYellow: '#facc15',
  sunGold: '#eab308',
  sunOrange: '#ca8a04',
  sunCenter: '#543015',
  sunCenterLight: '#78431b',
  wheatGold: '#fde047',
  wheatTassel: '#d97706',
  wheatStem: '#84cc16',
  tulipRed: '#dc2626',
  tulipPink: '#f472b6',
  tulipYellow: '#fbbf24',
  lavenderPurp: '#a855f7',
  lavenderDeep: '#7e22ce',
  chamomileWhite: '#fdfbf4',
  pumpkinOrange: '#ea580c',
  pumpkinShade: '#c2410c',
  pumpkinStem: '#4d7c0f',
  cabbageOuter: '#166534',
  cabbageMid: '#22c55e',
  cabbageHeart: '#86efac',
  woodDark: '#452b1a',
  woodMid: '#784d2a',
  woodLight: '#a76d3f',
  stoneDark: '#5c554a',
  stoneMid: '#8e867b',
  stoneLight: '#c4bdb2',
  stoneHi: '#eae5dc',
  bronze: '#b45309',
  waterSky: '#38bdf8',
  waterDeep: '#0284c7',
};

/**
 * Draws a strawberry bush with leaves, berries, and white blossoms
 */
function drawStrawberryBush(ctx, x, y, animFrame, seed = 0) {
  const sway = Math.sin(animFrame * 0.08 + seed) * 0.8;
  
  // Shadow
  ctx.fillStyle = 'rgba(25, 30, 20, 0.3)';
  ctx.beginPath();
  ctx.ellipse(x, y + 4, 8, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Foliage mound (stepped pixel cluster)
  ctx.fillStyle = C.greenDark;
  ctx.beginPath();
  ctx.ellipse(x + sway * 0.3, y, 7, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = C.greenMid;
  ctx.beginPath();
  ctx.ellipse(x + sway * 0.5, y - 2, 6, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = C.greenBright;
  ctx.beginPath();
  ctx.ellipse(x - 2 + sway * 0.7, y - 3, 4, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Strawberries (2-3 red berries)
  const berries = [
    { dx: -3, dy: 1, r: 2.2 },
    { dx: 3, dy: 0, r: 2 },
    { dx: 0, dy: 3, r: 2.2 },
  ];

  berries.forEach((b) => {
    const bx = x + b.dx + sway * 0.6;
    const by = y + b.dy;
    ctx.fillStyle = C.strawbRed;
    ctx.beginPath();
    ctx.arc(bx, by, b.r, 0, Math.PI * 2);
    ctx.fill();

    // Glint
    ctx.fillStyle = C.strawbHighlight;
    ctx.fillRect(bx - 0.5, by - 1, 1, 1);

    // Green cap
    ctx.fillStyle = C.greenSprout;
    ctx.fillRect(bx - 1, by - b.r - 0.5, 2, 1);
  });

  // White flower blossom
  const fx = x + 2 + sway * 0.8;
  const fy = y - 5;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(fx - 1.5, fy - 0.5, 3, 1);
  ctx.fillRect(fx - 0.5, fy - 1.5, 1, 3);
  ctx.fillStyle = C.sunYellow;
  ctx.fillRect(fx - 0.5, fy - 0.5, 1, 1);
}

/**
 * Draws a radiant sunflower swaying in the breeze
 */
function drawSunflower(ctx, x, y, animFrame, seed = 0) {
  const sway = Math.sin(animFrame * 0.06 + seed) * 1.5;

  // Shadow
  ctx.fillStyle = 'rgba(25, 30, 20, 0.3)';
  ctx.beginPath();
  ctx.ellipse(x, y + 2, 6, 2.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Thick Green Stem
  ctx.strokeStyle = C.greenMid;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x + sway * 0.4, y - 10, x + sway, y - 20);
  ctx.stroke();

  // Leaves along stem
  ctx.fillStyle = C.greenBright;
  ctx.beginPath();
  ctx.ellipse(x - 3 + sway * 0.3, y - 8, 4, 2, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + 3 + sway * 0.6, y - 14, 4, 2, 0.4, 0, Math.PI * 2);
  ctx.fill();

  // Flower Head
  const hx = x + sway;
  const hy = y - 20;

  // Petals (Outer star / ring)
  ctx.fillStyle = C.sunYellow;
  ctx.beginPath();
  ctx.arc(hx, hy, 6.5, 0, Math.PI * 2);
  ctx.fill();

  // Stepped ray points
  ctx.fillStyle = C.sunGold;
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
    const px = hx + Math.cos(a) * 6;
    const py = hy + Math.sin(a) * 6;
    ctx.fillRect(px - 1, py - 1, 2, 2);
  }

  // Large Brown Seed Center
  ctx.fillStyle = C.sunCenter;
  ctx.beginPath();
  ctx.arc(hx, hy, 3.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = C.sunCenterLight;
  ctx.fillRect(hx - 1, hy - 1, 2, 2);
}

/**
 * Draws a golden wheat cluster
 */
function drawWheatStalks(ctx, x, y, animFrame, seed = 0) {
  const sway = Math.sin(animFrame * 0.09 + seed) * 1.2;

  ctx.fillStyle = 'rgba(25, 30, 20, 0.25)';
  ctx.beginPath();
  ctx.ellipse(x, y + 1, 5, 2, 0, 0, Math.PI * 2);
  ctx.fill();

  // 3 stems
  [-2, 0, 2].forEach((offset, idx) => {
    const s = sway * (0.8 + idx * 0.2);
    const sx = x + offset;
    const topX = sx + s;
    const topY = y - 14 - idx;

    ctx.strokeStyle = C.wheatStem;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(sx, y);
    ctx.lineTo(topX, topY);
    ctx.stroke();

    // Grain head
    ctx.fillStyle = C.wheatTassel;
    ctx.fillRect(topX - 1.5, topY - 4, 3, 5);
    ctx.fillStyle = C.wheatGold;
    ctx.fillRect(topX - 1, topY - 5, 2, 4);
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(topX - 0.5, topY - 6, 1, 2);
  });
}

/**
 * Draws vibrant flower row (Tulips, Lavender, Chamomile)
 */
function drawFlowerRow(ctx, x, y, type, animFrame, seed = 0) {
  const sway = Math.sin(animFrame * 0.07 + seed) * 0.7;

  // Drop shadow
  ctx.fillStyle = 'rgba(25, 30, 20, 0.25)';
  ctx.beginPath();
  ctx.ellipse(x, y + 1, 5, 2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Stem
  ctx.strokeStyle = C.greenMid;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + sway, y - 8);
  ctx.stroke();

  // Little green base leaves
  ctx.fillStyle = C.greenBright;
  ctx.fillRect(x - 2, y - 3, 2, 2);
  ctx.fillRect(x + 1, y - 4, 2, 2);

  const fx = x + sway;
  const fy = y - 8;

  if (type === 'tulip_red') {
    ctx.fillStyle = C.tulipRed;
    ctx.fillRect(fx - 2, fy - 4, 4, 4);
    ctx.fillRect(fx - 1.5, fy - 5, 3, 1);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(fx - 1, fy - 3, 2, 2);
  } else if (type === 'tulip_pink') {
    ctx.fillStyle = C.tulipPink;
    ctx.fillRect(fx - 2, fy - 4, 4, 4);
    ctx.fillRect(fx - 1.5, fy - 5, 3, 1);
    ctx.fillStyle = '#fbcfe8';
    ctx.fillRect(fx - 1, fy - 3, 2, 2);
  } else if (type === 'lavender') {
    ctx.fillStyle = C.lavenderDeep;
    ctx.fillRect(fx - 1, fy - 7, 2, 7);
    ctx.fillStyle = C.lavenderPurp;
    ctx.fillRect(fx - 1.5, fy - 6, 3, 2);
    ctx.fillRect(fx - 1.5, fy - 3, 3, 2);
    ctx.fillStyle = '#d8b4fe';
    ctx.fillRect(fx - 0.5, fy - 8, 1, 2);
  } else {
    // Chamomile daisy
    ctx.fillStyle = C.chamomileWhite;
    ctx.fillRect(fx - 2.5, fy - 1, 5, 2);
    ctx.fillRect(fx - 1, fy - 2.5, 2, 5);
    ctx.fillStyle = C.sunYellow;
    ctx.fillRect(fx - 0.5, fy - 0.5, 1, 1);
  }
}

/**
 * Draws a plump harvest pumpkin with curly tendrils
 */
function drawPumpkin(ctx, x, y) {
  // Shadow
  ctx.fillStyle = 'rgba(25, 30, 20, 0.35)';
  ctx.beginPath();
  ctx.ellipse(x, y + 4, 10, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Pumpkin Body (3 overlapping segments)
  ctx.fillStyle = C.pumpkinShade;
  ctx.beginPath();
  ctx.ellipse(x - 4, y, 5, 6, -0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + 4, y, 5, 6, 0.15, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = C.pumpkinOrange;
  ctx.beginPath();
  ctx.ellipse(x, y, 6, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  // Top highlight
  ctx.fillStyle = '#fb923c';
  ctx.fillRect(x - 2, y - 5, 4, 2);

  // Curly green stem
  ctx.strokeStyle = C.pumpkinStem;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x, y - 6);
  ctx.quadraticCurveTo(x + 2, y - 10, x + 4, y - 8);
  ctx.stroke();

  // Curly tendril vine
  ctx.strokeStyle = C.greenSprout;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x - 3, y - 4);
  ctx.lineTo(x - 7, y - 2);
  ctx.stroke();
}

/**
 * Draws a crisp spring cabbage head
 */
function drawCabbage(ctx, x, y) {
  ctx.fillStyle = 'rgba(25, 30, 20, 0.3)';
  ctx.beginPath();
  ctx.ellipse(x, y + 2, 7, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Outer dark leaves
  ctx.fillStyle = C.cabbageOuter;
  ctx.beginPath();
  ctx.arc(x, y, 6, 0, Math.PI * 2);
  ctx.fill();

  // Mid leaves
  ctx.fillStyle = C.cabbageMid;
  ctx.beginPath();
  ctx.arc(x, y, 4.5, 0, Math.PI * 2);
  ctx.fill();

  // Heart
  ctx.fillStyle = C.cabbageHeart;
  ctx.beginPath();
  ctx.arc(x, y - 0.5, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Dew glint
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x - 1, y - 2, 1, 1);
}

/**
 * Draws the centerpiece: Carved Stone Garden Sundial & Birdbath
 * Located directly in the center of the octagonal stepping stones (x: 1478, y: 504)
 */
function drawManorSundialBirdbath(ctx, x, y, animFrame) {
  // 1. Soft Ground Shadow
  ctx.save();
  ctx.fillStyle = 'rgba(20, 25, 20, 0.4)';
  ctx.beginPath();
  ctx.ellipse(x, y + 8, 16, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // 2. Stepped Octagonal Stone Base
  ctx.fillStyle = C.stoneDark;
  ctx.fillRect(x - 14, y + 3, 28, 5);
  ctx.fillStyle = C.stoneMid;
  ctx.fillRect(x - 13, y + 2, 26, 4);
  ctx.fillStyle = C.stoneLight;
  ctx.fillRect(x - 13, y + 2, 26, 1);

  // Second step
  ctx.fillStyle = C.stoneDark;
  ctx.fillRect(x - 10, y - 1, 20, 4);
  ctx.fillStyle = C.stoneMid;
  ctx.fillRect(x - 9, y - 2, 18, 4);
  ctx.fillStyle = C.stoneHi;
  ctx.fillRect(x - 9, y - 2, 18, 1);

  // 3. Fluted Stone Pedestal Column
  ctx.fillStyle = C.stoneDark;
  ctx.fillRect(x - 5, y - 16, 10, 15);
  ctx.fillStyle = C.stoneMid;
  ctx.fillRect(x - 4, y - 16, 8, 15);
  ctx.fillStyle = C.stoneHi;
  ctx.fillRect(x - 4, y - 16, 2, 15);

  // 4. Carved Octagonal Stone Water Basin
  ctx.fillStyle = C.stoneDark;
  ctx.beginPath();
  ctx.ellipse(x, y - 17, 15, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = C.stoneMid;
  ctx.beginPath();
  ctx.ellipse(x, y - 18, 14, 5.5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = C.stoneHi;
  ctx.beginPath();
  ctx.ellipse(x, y - 19, 13, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // 5. Crystal Sky-Blue Water Basin Pool
  const waterGrad = ctx.createLinearGradient(x, y - 22, x, y - 16);
  waterGrad.addColorStop(0, C.waterSky);
  waterGrad.addColorStop(1, C.waterDeep);
  ctx.fillStyle = waterGrad;
  ctx.beginPath();
  ctx.ellipse(x, y - 19, 11, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Water Ripple Rings (Gentle animated ripples)
  const ripProg = (animFrame * 0.03) % 1;
  const ripR = 2 + ripProg * 7;
  const ripAlpha = (1 - ripProg) * 0.6;
  ctx.strokeStyle = `rgba(224, 242, 254, ${ripAlpha.toFixed(2)})`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(x, y - 19, ripR, ripR * 0.35, 0, 0, Math.PI * 2);
  ctx.stroke();

  // 6. Polished Bronze Sundial Plate & Gnomon
  ctx.fillStyle = C.bronze;
  ctx.beginPath();
  ctx.ellipse(x, y - 19, 4, 1.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Triangular bronze gnomon blade casting subtle shadow
  ctx.fillStyle = 'rgba(20, 20, 30, 0.4)';
  ctx.beginPath();
  ctx.moveTo(x + 1, y - 19);
  ctx.lineTo(x + 5, y - 18);
  ctx.lineTo(x + 2, y - 19);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.moveTo(x, y - 19);
  ctx.lineTo(x + 1, y - 25);
  ctx.lineTo(x + 3, y - 19);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#fef08a';
  ctx.fillRect(x + 1, y - 25, 1, 1);

  // 7. Little Bluebird perched on rim!
  const birdSway = Math.sin(animFrame * 0.1) * 0.5;
  const bx = x - 10;
  const by = y - 22 + birdSway;
  ctx.fillStyle = '#0284c7';
  ctx.beginPath();
  ctx.arc(bx, by, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(bx - 1.5, by - 1, 2, 2);
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(bx - 3, by, 1.5, 1);

  ctx.restore();
}

/**
 * Draws a rustic wooden garden bench
 */
function drawGardenBench(ctx, x, y) {
  ctx.save();
  // Shadow
  ctx.fillStyle = 'rgba(20, 25, 20, 0.35)';
  ctx.fillRect(x - 14, y + 4, 28, 4);

  // Legs
  ctx.fillStyle = C.woodDark;
  ctx.fillRect(x - 12, y, 3, 5);
  ctx.fillRect(x + 9, y, 3, 5);

  // Seat Planks
  ctx.fillStyle = C.woodMid;
  ctx.fillRect(x - 14, y - 2, 28, 4);
  ctx.fillStyle = C.woodLight;
  ctx.fillRect(x - 14, y - 2, 28, 1);
  ctx.fillRect(x - 14, y + 1, 28, 1);

  // Backrest Slats
  ctx.fillStyle = C.woodDark;
  ctx.fillRect(x - 12, y - 10, 3, 8);
  ctx.fillRect(x + 9, y - 10, 3, 8);

  ctx.fillStyle = C.woodMid;
  ctx.fillRect(x - 14, y - 10, 28, 3);
  ctx.fillStyle = C.woodLight;
  ctx.fillRect(x - 14, y - 10, 28, 1);

  ctx.restore();
}

/**
 * Draws a blooming oak barrel planter
 */
function drawPlanterBarrel(ctx, x, y) {
  ctx.save();
  // Shadow
  ctx.fillStyle = 'rgba(20, 25, 20, 0.35)';
  ctx.beginPath();
  ctx.ellipse(x, y + 4, 7, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Oak barrel tub
  ctx.fillStyle = C.woodDark;
  ctx.fillRect(x - 6, y - 6, 12, 10);
  ctx.fillStyle = C.woodMid;
  ctx.fillRect(x - 5, y - 6, 10, 10);

  // Iron Hoops
  ctx.fillStyle = '#64748b';
  ctx.fillRect(x - 6, y - 5, 12, 1.5);
  ctx.fillRect(x - 6, y + 1, 12, 1.5);

  // Blossoming Hydrangea Bush inside
  ctx.fillStyle = C.greenMid;
  ctx.beginPath();
  ctx.arc(x, y - 8, 6, 0, Math.PI * 2);
  ctx.fill();

  // Flowers (Pink and White petals)
  const flowers = [
    { dx: -2, dy: -9, color: '#f472b6' },
    { dx: 2, dy: -10, color: '#fbcfe8' },
    { dx: -3, dy: -6, color: '#ffffff' },
    { dx: 1, dy: -7, color: '#f472b6' },
    { dx: 3, dy: -7, color: '#fbcfe8' },
  ];
  flowers.forEach(f => {
    ctx.fillStyle = f.color;
    ctx.fillRect(x + f.dx, y + f.dy, 2, 2);
  });

  ctx.restore();
}

/**
 * Draws a gardener's wheelbarrow with spade and watering can
 */
function drawWheelbarrow(ctx, x, y) {
  ctx.save();
  // Shadow
  ctx.fillStyle = 'rgba(20, 25, 20, 0.35)';
  ctx.beginPath();
  ctx.ellipse(x, y + 4, 12, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Wheel
  ctx.fillStyle = '#334155';
  ctx.beginPath();
  ctx.arc(x - 10, y + 1, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#94a3b8';
  ctx.beginPath();
  ctx.arc(x - 10, y + 1, 2, 0, Math.PI * 2);
  ctx.fill();

  // Wooden Tray Bed
  ctx.fillStyle = C.woodDark;
  ctx.beginPath();
  ctx.moveTo(x - 10, y - 2);
  ctx.lineTo(x + 6, y - 2);
  ctx.lineTo(x + 8, y - 7);
  ctx.lineTo(x - 7, y - 7);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = C.woodMid;
  ctx.fillRect(x - 6, y - 6, 12, 4);

  // Handles
  ctx.fillStyle = C.woodLight;
  ctx.fillRect(x + 4, y - 3, 8, 1.5);
  ctx.fillRect(x + 10, y - 1, 2, 4);

  // Copper Watering Can sitting in tray
  ctx.fillStyle = '#b45309';
  ctx.fillRect(x - 2, y - 9, 5, 4);
  ctx.fillStyle = '#d97706';
  ctx.fillRect(x - 1, y - 9, 3, 3);
  ctx.strokeStyle = '#b45309';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x - 2, y - 8);
  ctx.lineTo(x - 5, y - 11);
  ctx.stroke();

  // Metal spade leaning
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x + 6, y - 13);
  ctx.lineTo(x + 1, y - 3);
  ctx.stroke();
  ctx.fillStyle = '#475569';
  ctx.fillRect(x, y - 3, 3, 3);

  ctx.restore();
}

/**
 * Draws carved stone urn with blooming cherry blossoms
 */
function drawFlowerUrn(ctx, x, y) {
  ctx.save();
  // Shadow
  ctx.fillStyle = 'rgba(20, 25, 20, 0.35)';
  ctx.beginPath();
  ctx.ellipse(x, y + 3, 6, 2.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Urn base and bowl
  ctx.fillStyle = C.stoneDark;
  ctx.fillRect(x - 3, y + 1, 6, 2);
  ctx.fillStyle = C.stoneMid;
  ctx.beginPath();
  ctx.ellipse(x, y - 3, 5, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = C.stoneHi;
  ctx.fillRect(x - 4, y - 6, 8, 1.5);

  // Blooming Cherry Blossom Sprigs
  ctx.fillStyle = '#f472b6';
  ctx.beginPath();
  ctx.arc(x, y - 9, 4.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#fbcfe8';
  ctx.fillRect(x - 2, y - 11, 2, 2);
  ctx.fillRect(x + 1, y - 8, 2, 2);

  ctx.restore();
}

/**
 * Main export: compiles all Manor garden renderables with proper Y-coordinates
 * for depth-sorting alongside the player!
 */
export function getManorGardenRenderables(ctx, animFrame, bounds = null) {
  // If viewport bounds provided, skip if entirely out of view
  if (bounds) {
    if (bounds.camMaxY < 250 || bounds.camMinY > 800 || bounds.camMaxX < 850 || bounds.camMinX > 1680) {
      return [];
    }
  }

  const items = [];

  // Helper to push with direct context closure
  function pushItem(y, drawFn) {
    items.push({
      y,
      render: () => drawFn(),
    });
  }

  // ── 1. Northwest Plot: Strawberries & Trellis (x: 1360..1422, y: 336..446) ──
  for (let row = 0; row < 6; row++) {
    const py = 348 + row * 16;
    for (let col = 0; col < 4; col++) {
      const px = 1370 + col * 15;
      const seed = row * 4 + col;
      pushItem(py, () => drawStrawberryBush(ctx, px, py, animFrame, seed));
    }
  }

  // ── 2. Northeast Plot: Sunflowers & Wheat (x: 1536..1598, y: 336..446) ──
  for (let row = 0; row < 6; row++) {
    const py = 348 + row * 16;
    for (let col = 0; col < 4; col++) {
      const px = 1546 + col * 15;
      const seed = row * 7 + col * 3;
      if ((row + col) % 2 === 0) {
        pushItem(py, () => drawSunflower(ctx, px, py, animFrame, seed));
      } else {
        pushItem(py, () => drawWheatStalks(ctx, px, py, animFrame, seed));
      }
    }
  }

  // ── 3. Southwest Plot: Royal Flower Sanctuary (x: 1360..1422, y: 560..670) ──
  const flowerTypes = ['tulip_red', 'tulip_pink', 'lavender', 'chamomile', 'tulip_red', 'lavender'];
  for (let row = 0; row < 6; row++) {
    const py = 572 + row * 16;
    const type = flowerTypes[row];
    for (let col = 0; col < 4; col++) {
      const px = 1370 + col * 15;
      const seed = row * 5 + col * 2;
      pushItem(py, () => drawFlowerRow(ctx, px, py, type, animFrame, seed));
    }
  }

  // ── 4. Southeast Plot: Autumn Harvest Pumpkins & Roots (x: 1536..1598, y: 560..670) ──
  for (let row = 0; row < 5; row++) {
    const py = 576 + row * 18;
    for (let col = 0; col < 3; col++) {
      const px = 1550 + col * 18;
      pushItem(py, () => drawPumpkin(ctx, px, py));
    }
  }

  // ── 5. Southwest Entrance Plot: Spring Cabbage (x: 928..980, y: 624..680) ──
  for (let row = 0; row < 3; row++) {
    const py = 636 + row * 15;
    for (let col = 0; col < 3; col++) {
      const px = 940 + col * 14;
      pushItem(py, () => drawCabbage(ctx, px, py));
    }
  }

  // ── 6. Southeast Entrance Plot: Floral Hydrangeas/Roses (x: 1200..1252, y: 624..680) ──
  for (let row = 0; row < 3; row++) {
    const py = 636 + row * 15;
    for (let col = 0; col < 3; col++) {
      const px = 1212 + col * 14;
      const seed = row * 3 + col;
      pushItem(py, () => drawStrawberryBush(ctx, px, py, animFrame, seed));
    }
  }

  // ── 7. Surrounding Estate Decorations ──

  // Centerpiece: Carved Stone Sundial & Birdbath
  pushItem(504, () => drawManorSundialBirdbath(ctx, 1478, 504, animFrame));

  // Garden Benches
  pushItem(416, () => drawGardenBench(ctx, 1478, 416));
  pushItem(592, () => drawGardenBench(ctx, 1478, 592));

  // Planter Barrels at intersection corners
  pushItem(468, () => drawPlanterBarrel(ctx, 1440, 468));
  pushItem(468, () => drawPlanterBarrel(ctx, 1516, 468));
  pushItem(540, () => drawPlanterBarrel(ctx, 1440, 540));
  pushItem(540, () => drawPlanterBarrel(ctx, 1516, 540));

  // Gardener's Station: Wheelbarrow & tools
  pushItem(504, () => drawWheelbarrow(ctx, 1616, 504));

  // Gazebo Entrance Urns
  pushItem(308, () => drawFlowerUrn(ctx, 1456, 308));
  pushItem(308, () => drawFlowerUrn(ctx, 1500, 308));

  return items;
}
