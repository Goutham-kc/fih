import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const OUT_DIR = path.resolve('public/assets/trees');
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

function createBuffer(w, h) {
  return Buffer.alloc(w * h * 4, 0);
}

function setPixel(buf, w, x, y, r, g, b, a = 255) {
  if (x < 0 || x >= w || y < 0 || y >= buf.length / (w * 4)) return;
  const idx = (y * w + x) * 4;
  buf[idx] = r;
  buf[idx + 1] = g;
  buf[idx + 2] = b;
  buf[idx + 3] = a;
}

function getPixel(buf, w, x, y) {
  if (x < 0 || x >= w || y < 0 || y >= buf.length / (w * 4)) return null;
  const idx = (y * w + x) * 4;
  return {
    r: buf[idx],
    g: buf[idx + 1],
    b: buf[idx + 2],
    a: buf[idx + 3],
  };
}

// -------------------------------------------------------------
// 1. OAK LARGE (32x48 px)
// -------------------------------------------------------------
function generateOakLarge() {
  const w = 32, h = 48;
  const buf = createBuffer(w, h);

  // Ground drop shadow (translucent ellipse under roots)
  for (let y = 42; y <= 47; y++) {
    for (let x = 6; x <= 26; x++) {
      const dx = (x - 16) / 9.5;
      const dy = (y - 45) / 2.2;
      if (dx * dx + dy * dy <= 1) {
        setPixel(buf, w, x, y, 15, 25, 10, 110);
      }
    }
  }

  // Trunk & Gnarled Roots
  for (let y = 24; y <= 45; y++) {
    const rootSpread = y > 38 ? Math.floor((y - 38) * 1.1) : 0;
    const lx = 14 - rootSpread;
    const rx = 18 + rootSpread;
    for (let x = lx; x <= rx; x++) {
      if (x === lx || x === rx || y === 45) {
        setPixel(buf, w, x, y, 38, 19, 7); // dark outline
      } else if (x < 15) {
        setPixel(buf, w, x, y, 69, 26, 3); // shadow
      } else if (x <= 17) {
        setPixel(buf, w, x, y, 120, 53, 15); // mid bark
      } else {
        setPixel(buf, w, x, y, 146, 64, 14); // highlight
      }
    }
  }

  // Canopy clumps (organic overlapping spheres)
  const clumps = [
    { cx: 16, cy: 15, rx: 13, ry: 12 },
    { cx: 9, cy: 19, rx: 8, ry: 7 },
    { cx: 23, cy: 19, rx: 8, ry: 7 },
    { cx: 16, cy: 9, rx: 9, ry: 8 },
    { cx: 11, cy: 11, rx: 7, ry: 7 },
    { cx: 21, cy: 11, rx: 7, ry: 7 },
    { cx: 16, cy: 23, rx: 11, ry: 6 },
  ];

  // Leaf color palette
  const colOutline = [20, 53, 19];
  const colShadow = [28, 74, 27];
  const colBase = [45, 106, 39];
  const colMid = [63, 138, 50];
  const colLight = [92, 184, 60];
  const colSun = [126, 217, 87];

  for (let y = 1; y <= 33; y++) {
    for (let x = 1; x <= 30; x++) {
      let inCanopy = false;
      let minRelDist = 999;
      let dominantClump = null;

      for (const c of clumps) {
        const dx = (x - c.cx) / c.rx;
        const dy = (y - c.cy) / c.ry;
        const d = dx * dx + dy * dy;
        if (d <= 1) {
          inCanopy = true;
          if (d < minRelDist) {
            minRelDist = d;
            dominantClump = c;
          }
        }
      }

      if (inCanopy && dominantClump) {
        // Outline check: if any neighbor is outside canopy
        let isEdge = false;
        for (let ny = y - 1; ny <= y + 1; ny++) {
          for (let nx = x - 1; nx <= x + 1; nx++) {
            let neighborIn = false;
            for (const c of clumps) {
              const dx = (nx - c.cx) / c.rx;
              const dy = (ny - c.cy) / c.ry;
              if (dx * dx + dy * dy <= 1) {
                neighborIn = true;
                break;
              }
            }
            if (!neighborIn) {
              isEdge = true;
              break;
            }
          }
          if (isEdge) break;
        }

        if (isEdge) {
          setPixel(buf, w, x, y, ...colOutline);
        } else {
          // Shading: light source is from top-left (dx < 0, dy < 0)
          const localDx = (x - dominantClump.cx) / dominantClump.rx;
          const localDy = (y - dominantClump.cy) / dominantClump.ry;
          const globalYNorm = y / 32;

          // Clump shading + global top-to-bottom ambient
          const lightScore = (-localDx * 0.7 - localDy * 0.9) - (globalYNorm * 0.5);

          // Subtle dither texture
          const dither = ((x * 7 + y * 13) % 5 - 2) * 0.08;
          const score = lightScore + dither;

          if (score > 0.45) {
            setPixel(buf, w, x, y, ...colSun);
          } else if (score > 0.15) {
            setPixel(buf, w, x, y, ...colLight);
          } else if (score > -0.15) {
            setPixel(buf, w, x, y, ...colMid);
          } else if (score > -0.45) {
            setPixel(buf, w, x, y, ...colBase);
          } else {
            setPixel(buf, w, x, y, ...colShadow);
          }
        }
      }
    }
  }

  return sharp(buf, { raw: { width: w, height: h, channels: 4 } }).png().toBuffer();
}

// -------------------------------------------------------------
// 2. PINE LARGE (32x48 px) - Tiered Evergreen Conifer
// -------------------------------------------------------------
function generatePineLarge() {
  const w = 32, h = 48;
  const buf = createBuffer(w, h);

  // Ground shadow
  for (let y = 42; y <= 47; y++) {
    for (let x = 8; x <= 24; x++) {
      const dx = (x - 16) / 7.5;
      const dy = (y - 45) / 2.0;
      if (dx * dx + dy * dy <= 1) {
        setPixel(buf, w, x, y, 10, 20, 15, 110);
      }
    }
  }

  // Trunk
  for (let y = 36; y <= 45; y++) {
    for (let x = 14; x <= 18; x++) {
      if (x === 14 || x === 18 || y === 45) {
        setPixel(buf, w, x, y, 35, 18, 7);
      } else if (x <= 15) {
        setPixel(buf, w, x, y, 69, 26, 3);
      } else {
        setPixel(buf, w, x, y, 120, 53, 15);
      }
    }
  }

  // 4 Stepped Conical Tiers
  // Tier: [topY, bottomY, baseHalfWidth, peakY]
  const tiers = [
    { topY: 3, botY: 15, halfW: 7, peakX: 16 },
    { topY: 12, botY: 24, halfW: 10, peakX: 16 },
    { topY: 20, botY: 33, halfW: 13, peakX: 16 },
    { topY: 28, botY: 41, halfW: 14.5, peakX: 16 },
  ];

  const colOutline = [2, 44, 34];
  const colShadow = [6, 78, 59];
  const colMid = [4, 120, 87];
  const colEmerald = [5, 150, 105];
  const colLight = [16, 185, 129];
  const colSun = [52, 211, 153];

  function inPine(x, y) {
    for (let ti = 0; ti < tiers.length; ti++) {
      const t = tiers[ti];
      if (y >= t.topY && y <= t.botY) {
        const prog = (y - t.topY) / (t.botY - t.topY);
        // Scalloped / saw-tooth pine needle edge
        const scallopedW = t.halfW * Math.pow(prog, 0.85);
        const dx = Math.abs(x - t.peakX);
        if (dx <= scallopedW) return { inside: true, tierIdx: ti, prog };
      }
    }
    return { inside: false };
  }

  for (let y = 3; y <= 41; y++) {
    for (let x = 1; x <= 30; x++) {
      const p = inPine(x, y);
      if (p.inside) {
        // Outline check
        let isEdge = false;
        for (let ny = y - 1; ny <= y + 1; ny++) {
          for (let nx = x - 1; nx <= x + 1; nx++) {
            if (!inPine(nx, ny).inside) {
              isEdge = true;
              break;
            }
          }
          if (isEdge) break;
        }

        if (isEdge) {
          setPixel(buf, w, x, y, ...colOutline);
        } else {
          // Shading: light from top-left, shadows under tier overlaps
          const nx = (x - 16) / 14;
          const underTierShadow = p.prog < 0.25 && p.tierIdx > 0 ? 0.35 : 0;
          const score = (-nx * 0.8 - p.prog * 0.5) - underTierShadow;

          if (score > 0.35) {
            setPixel(buf, w, x, y, ...colSun);
          } else if (score > 0.1) {
            setPixel(buf, w, x, y, ...colLight);
          } else if (score > -0.2) {
            setPixel(buf, w, x, y, ...colEmerald);
          } else if (score > -0.5) {
            setPixel(buf, w, x, y, ...colMid);
          } else {
            setPixel(buf, w, x, y, ...colShadow);
          }
        }
      }
    }
  }

  return sharp(buf, { raw: { width: w, height: h, channels: 4 } }).png().toBuffer();
}

// -------------------------------------------------------------
// 3. BLOSSOM LARGE (32x48 px) - Pink Cherry Blossom
// -------------------------------------------------------------
function generateBlossomLarge() {
  const w = 32, h = 48;
  const buf = createBuffer(w, h);

  // Ground shadow with pinkish undertone
  for (let y = 42; y <= 47; y++) {
    for (let x = 6; x <= 26; x++) {
      const dx = (x - 16) / 9.5;
      const dy = (y - 45) / 2.2;
      if (dx * dx + dy * dy <= 1) {
        setPixel(buf, w, x, y, 30, 15, 25, 110);
      }
    }
  }

  // Trunk
  for (let y = 24; y <= 45; y++) {
    const rootSpread = y > 38 ? Math.floor((y - 38) * 1.1) : 0;
    const lx = 14 - rootSpread;
    const rx = 18 + rootSpread;
    for (let x = lx; x <= rx; x++) {
      if (x === lx || x === rx || y === 45) {
        setPixel(buf, w, x, y, 45, 15, 20); // dark cherry bark
      } else if (x < 15) {
        setPixel(buf, w, x, y, 75, 25, 30);
      } else {
        setPixel(buf, w, x, y, 115, 45, 45);
      }
    }
  }

  // Blossom Clumps
  const clumps = [
    { cx: 16, cy: 15, rx: 13, ry: 12 },
    { cx: 9, cy: 19, rx: 8, ry: 7 },
    { cx: 23, cy: 19, rx: 8, ry: 7 },
    { cx: 16, cy: 9, rx: 9, ry: 8 },
    { cx: 11, cy: 11, rx: 7, ry: 7 },
    { cx: 21, cy: 11, rx: 7, ry: 7 },
    { cx: 16, cy: 23, rx: 11, ry: 6 },
  ];

  const colOutline = [76, 5, 25];
  const colShadow = [131, 24, 67];
  const colBase = [190, 24, 93];
  const colMid = [219, 39, 119];
  const colLight = [244, 114, 182];
  const colSun = [251, 207, 232];

  for (let y = 1; y <= 33; y++) {
    for (let x = 1; x <= 30; x++) {
      let inCanopy = false;
      let minRelDist = 999;
      let dominantClump = null;

      for (const c of clumps) {
        const dx = (x - c.cx) / c.rx;
        const dy = (y - c.cy) / c.ry;
        const d = dx * dx + dy * dy;
        if (d <= 1) {
          inCanopy = true;
          if (d < minRelDist) {
            minRelDist = d;
            dominantClump = c;
          }
        }
      }

      if (inCanopy && dominantClump) {
        let isEdge = false;
        for (let ny = y - 1; ny <= y + 1; ny++) {
          for (let nx = x - 1; nx <= x + 1; nx++) {
            let neighborIn = false;
            for (const c of clumps) {
              const dx = (nx - c.cx) / c.rx;
              const dy = (ny - c.cy) / c.ry;
              if (dx * dx + dy * dy <= 1) {
                neighborIn = true;
                break;
              }
            }
            if (!neighborIn) {
              isEdge = true;
              break;
            }
          }
          if (isEdge) break;
        }

        if (isEdge) {
          setPixel(buf, w, x, y, ...colOutline);
        } else {
          const localDx = (x - dominantClump.cx) / dominantClump.rx;
          const localDy = (y - dominantClump.cy) / dominantClump.ry;
          const globalYNorm = y / 32;

          const lightScore = (-localDx * 0.7 - localDy * 0.9) - (globalYNorm * 0.5);
          const dither = ((x * 11 + y * 7) % 5 - 2) * 0.08;
          const score = lightScore + dither;

          if (score > 0.42) {
            setPixel(buf, w, x, y, ...colSun);
          } else if (score > 0.15) {
            setPixel(buf, w, x, y, ...colLight);
          } else if (score > -0.15) {
            setPixel(buf, w, x, y, ...colMid);
          } else if (score > -0.45) {
            setPixel(buf, w, x, y, ...colBase);
          } else {
            setPixel(buf, w, x, y, ...colShadow);
          }
        }
      }
    }
  }

  return sharp(buf, { raw: { width: w, height: h, channels: 4 } }).png().toBuffer();
}

// -------------------------------------------------------------
// 4. FALLEN LOG (32x16 px)
// -------------------------------------------------------------
function generateFallenLog() {
  const w = 32, h = 16;
  const buf = createBuffer(w, h);

  // Shadow under log
  for (let y = 11; y <= 15; y++) {
    for (let x = 2; x <= 30; x++) {
      setPixel(buf, w, x, y, 15, 25, 10, 110);
    }
  }

  // Horizontal log body
  for (let y = 5; y <= 12; y++) {
    for (let x = 6; x <= 29; x++) {
      if (y === 5 || y === 12 || x === 29) {
        setPixel(buf, w, x, y, 35, 18, 7); // dark outline
      } else if (y === 6) {
        // Moss on top
        if ((x + y) % 3 !== 0) {
          setPixel(buf, w, x, y, 77, 138, 47); // moss light
        } else {
          setPixel(buf, w, x, y, 45, 90, 34); // moss dark
        }
      } else if (y >= 10) {
        setPixel(buf, w, x, y, 69, 26, 3); // log under-shadow
      } else {
        // bark lines
        setPixel(buf, w, x, y, (x % 4 === 0) ? 92 : 120, 53, 15);
      }
    }
  }

  // Cut end of log on left (x: 2..6, y: 5..12)
  for (let y = 5; y <= 12; y++) {
    for (let x = 2; x <= 6; x++) {
      const dx = (x - 4) / 2.0;
      const dy = (y - 8.5) / 3.5;
      if (dx * dx + dy * dy <= 1) {
        if (dx * dx + dy * dy >= 0.75) {
          setPixel(buf, w, x, y, 35, 18, 7); // bark rim
        } else if (dx * dx + dy * dy >= 0.3) {
          setPixel(buf, w, x, y, 202, 138, 4); // sapwood ring
        } else {
          setPixel(buf, w, x, y, 120, 53, 15); // heartwood center
        }
      }
    }
  }

  // Little sprouting mushroom on log
  setPixel(buf, w, 20, 4, 239, 68, 68); // red cap
  setPixel(buf, w, 21, 4, 254, 242, 242); // white spot
  setPixel(buf, w, 20, 5, 250, 250, 249); // stalk

  return sharp(buf, { raw: { width: w, height: h, channels: 4 } }).png().toBuffer();
}

// -------------------------------------------------------------
// 5. ROCK MOSSY (16x16 px) - River Boulder
// -------------------------------------------------------------
function generateRockMoss() {
  const w = 16, h = 16;
  const buf = createBuffer(w, h);

  // Shadow
  for (let y = 12; y <= 15; y++) {
    for (let x = 2; x <= 14; x++) {
      const dx = (x - 8) / 5.5;
      const dy = (y - 13.5) / 1.5;
      if (dx * dx + dy * dy <= 1) {
        setPixel(buf, w, x, y, 15, 25, 15, 110);
      }
    }
  }

  // Boulder oval
  for (let y = 4; y <= 13; y++) {
    for (let x = 2; x <= 14; x++) {
      const dx = (x - 8) / 5.5;
      const dy = (y - 8.5) / 4.2;
      if (dx * dx + dy * dy <= 1) {
        // Outline check
        let isEdge = false;
        for (let ny = y - 1; ny <= y + 1; ny++) {
          for (let nx = x - 1; nx <= x + 1; nx++) {
            const ndx = (nx - 8) / 5.5;
            const ndy = (ny - 8.5) / 4.2;
            if (ndx * ndx + ndy * ndy > 1) {
              isEdge = true;
              break;
            }
          }
          if (isEdge) break;
        }

        if (isEdge) {
          setPixel(buf, w, x, y, 30, 41, 59); // slate outline
        } else if (y <= 7 && (x + y) % 2 === 0) {
          // Lush green moss patch on top
          setPixel(buf, w, x, y, 77, 138, 47);
        } else if (y <= 7) {
          setPixel(buf, w, x, y, 45, 90, 34);
        } else if (x <= 6 && y <= 9) {
          setPixel(buf, w, x, y, 148, 163, 184); // stone highlight
        } else if (y >= 11) {
          setPixel(buf, w, x, y, 51, 65, 85); // stone shadow
        } else {
          setPixel(buf, w, x, y, 71, 85, 105); // mid slate
        }
      }
    }
  }

  return sharp(buf, { raw: { width: w, height: h, channels: 4 } }).png().toBuffer();
}

// -------------------------------------------------------------
// 6. MUSHROOMS (16x16 px) - Amanita Cluster
// -------------------------------------------------------------
function generateMushrooms() {
  const w = 16, h = 16;
  const buf = createBuffer(w, h);

  // Shadow
  for (let y = 13; y <= 15; y++) {
    for (let x = 2; x <= 14; x++) {
      setPixel(buf, w, x, y, 15, 25, 15, 90);
    }
  }

  // Mushroom 1 (Center-Left large)
  // Stalk
  for (let y = 8; y <= 13; y++) {
    for (let x = 4; x <= 7; x++) {
      if (x === 4 || x === 7 || y === 13) {
        setPixel(buf, w, x, y, 80, 50, 30);
      } else {
        setPixel(buf, w, x, y, 250, 250, 245);
      }
    }
  }
  // Cap (x: 2..9, y: 4..8)
  for (let y = 4; y <= 8; y++) {
    for (let x = 2; x <= 9; x++) {
      const dx = (x - 5.5) / 3.8;
      const dy = (y - 6.5) / 2.5;
      if (dx * dx + dy * dy <= 1) {
        if (y === 8 || dx * dx + dy * dy > 0.85) {
          setPixel(buf, w, x, y, 127, 29, 29); // dark red rim
        } else if ((x === 4 && y === 5) || (x === 7 && y === 6)) {
          setPixel(buf, w, x, y, 255, 255, 255); // white spots
        } else if (y <= 5) {
          setPixel(buf, w, x, y, 248, 113, 113); // highlight red
        } else {
          setPixel(buf, w, x, y, 239, 68, 68); // vibrant red
        }
      }
    }
  }

  // Mushroom 2 (Right small)
  // Stalk
  for (let y = 10; y <= 14; y++) {
    for (let x = 11; x <= 13; x++) {
      if (x === 11 || x === 13 || y === 14) {
        setPixel(buf, w, x, y, 80, 50, 30);
      } else {
        setPixel(buf, w, x, y, 250, 250, 245);
      }
    }
  }
  // Cap (x: 9..14, y: 7..10)
  for (let y = 7; y <= 10; y++) {
    for (let x = 9; x <= 14; x++) {
      const dx = (x - 11.5) / 2.8;
      const dy = (y - 8.5) / 1.8;
      if (dx * dx + dy * dy <= 1) {
        if (y === 10 || dx * dx + dy * dy > 0.85) {
          setPixel(buf, w, x, y, 127, 29, 29);
        } else if (x === 11 && y === 8) {
          setPixel(buf, w, x, y, 255, 255, 255);
        } else {
          setPixel(buf, w, x, y, 239, 68, 68);
        }
      }
    }
  }

  return sharp(buf, { raw: { width: w, height: h, channels: 4 } }).png().toBuffer();
}

async function main() {
  console.log('Generating woodland tree and environmental prop sprites...');

  const oakBuf = await generateOakLarge();
  fs.writeFileSync(path.join(OUT_DIR, 'oak_large.png'), oakBuf);
  console.log('Saved oak_large.png (32x48)');

  const pineBuf = await generatePineLarge();
  fs.writeFileSync(path.join(OUT_DIR, 'pine_large.png'), pineBuf);
  console.log('Saved pine_large.png (32x48)');

  const blossomBuf = await generateBlossomLarge();
  fs.writeFileSync(path.join(OUT_DIR, 'blossom_large.png'), blossomBuf);
  console.log('Saved blossom_large.png (32x48)');

  const logBuf = await generateFallenLog();
  fs.writeFileSync(path.join(OUT_DIR, 'fallen_log.png'), logBuf);
  console.log('Saved fallen_log.png (32x16)');

  const rockBuf = await generateRockMoss();
  fs.writeFileSync(path.join(OUT_DIR, 'rock_moss.png'), rockBuf);
  console.log('Saved rock_moss.png (16x16)');

  const mushroomBuf = await generateMushrooms();
  fs.writeFileSync(path.join(OUT_DIR, 'mushrooms.png'), mushroomBuf);
  console.log('Saved mushrooms.png (16x16)');

  console.log('All forest sprites generated successfully!');
}

main().catch(console.error);
