import puppeteer from 'puppeteer-core';
import http from 'http';
import fs from 'fs';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const OUT_DIR = path.resolve('docs/redesign/all-chapters');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

const PORT = 4322;

const CHAPTERS = [
  {
    id: 'todos',
    num: 1,
    title: 'Chapter 1: The Farmstead (Daily Quests)',
    resident: 'Pip the Farmhand',
    role: 'Chore Master',
    quote: '“The morning sun breaks over the meadow! Water the crops, mend the fences, and cross off today’s chores.”',
    anchor: { x: 8, y: 12 },
    dataHeader: 'DAILY FARMSTEAD QUESTS',
    badge: '🌾 PARSNIP HARVEST',
    items: [
      { title: 'Water autumn parsnips and beets', tag: 'HIGH PRIORITY', tagBg: '#fee2e2', tagColor: '#991b1b', note: 'Due Today 5:00 PM', src: '💬 WHATSAPP', done: false },
      { title: 'Mend broken coop fence', tag: 'MEDIUM', tagBg: '#fef3c7', tagColor: '#92400e', note: 'Due Tomorrow 9:00 AM', src: '🌐 WEB', done: false },
      { title: 'Stock firewood by the porch', tag: 'NORMAL', tagBg: '#e0e7ff', tagColor: '#3730a3', note: 'Due Nov 6', src: '💬 WHATSAPP', done: false },
      { title: 'Inspect greenhouse glass panes', tag: 'DONE', tagBg: '#dcfce7', tagColor: '#166534', note: 'Harvested Today', src: '🌐 WEB', done: true },
    ]
  },
  {
    id: 'reminders',
    num: 2,
    title: 'Chapter 2: The Bell Tower (Mailbox & Alerts)',
    resident: 'Hoot the Timekeeper',
    role: 'Bell Tower Owl',
    quote: '“Hoo-hoo! The tower bells mark each promised hour. Keep your alerts set, and Pixel Valley moves in harmony.”',
    anchor: { x: 18, y: 6 },
    dataHeader: 'HANGING BRONZE BELLS & ALERTS',
    badge: '🔔 TIMEKEEPER TOWER',
    items: [
      { title: 'Feed livestock & gather fresh eggs', tag: 'UPCOMING', tagBg: '#dbeafe', tagColor: '#1e40af', note: 'Tomorrow 8:00 AM', src: '💬 WHATSAPP', done: false },
      { title: 'Weekly village market bulletin', tag: 'UPCOMING', tagBg: '#dbeafe', tagColor: '#1e40af', note: 'Friday 2:00 PM', src: '🌐 WEB', done: false },
      { title: 'Town doctor checkup & vitamins', tag: 'SENT', tagBg: '#e5e7eb', tagColor: '#374151', note: 'Dispatched yesterday', src: '💬 WHATSAPP', done: true },
    ]
  },
  {
    id: 'debts',
    num: 3,
    title: 'Chapter 3: The Ledger Hut (Gold Ledger)',
    resident: 'Bram the Honest Factor',
    role: 'Ledger Banker',
    quote: '“Clear accounts make steadfast friends! Settle your tabs before the fair, and your pouch will always jingle.”',
    anchor: { x: 26, y: 11 },
    dataHeader: 'BRAM’S GOLD SCALE & TABS',
    badge: '🪙 NET: +₹1,580g',
    items: [
      { title: 'Arjun', tag: 'OWES ME', tagBg: '#dcfce7', tagColor: '#166534', note: 'Advance for mountain supplies: ₹2,080', src: '💬 WHATSAPP', done: false },
      { title: 'Hanan', tag: 'I OWE', tagBg: '#fee2e2', tagColor: '#991b1b', note: 'Dinner at the Starlight Saloon: ₹500', src: '🌐 WEB', done: false },
      { title: 'Sarah', tag: 'SETTLED', tagBg: '#e5e7eb', tagColor: '#4b5563', note: 'Tools loan for harvest: ₹300', src: '🌐 WEB', done: true },
    ]
  },
  {
    id: 'deadlines',
    num: 4,
    title: 'Chapter 4: The Notice Board (Town Deadlines)',
    resident: 'Marigold the Festival Herald',
    role: 'Town Crier',
    quote: '“A punctual harvest is the pride of Pixel Valley! Deliver your projects and prep before the final season bell.”',
    anchor: { x: 18, y: 16 },
    dataHeader: 'PINNED TOWN DEADLINES & NOTICES',
    badge: '📌 COUNTDOWN FIELD',
    items: [
      { title: 'End Semester Project Submission', tag: 'IN 2D 4H', tagBg: '#fef3c7', tagColor: '#92400e', note: 'Due Nov 6, 2026 (Academic)', src: '💬 WHATSAPP', done: false },
      { title: 'Autumn Harvest Delivery to Market', tag: '3H 15M LEFT', tagBg: '#fee2e2', tagColor: '#991b1b', note: 'Due Today 6:00 PM (Personal)', src: '🌐 WEB', done: false },
      { title: 'Archive Library Book Return', tag: 'OVERDUE', tagBg: '#fee2e2', tagColor: '#b91c1c', note: 'Due Nov 3, 2026', src: '🌐 WEB', done: false },
    ]
  },
  {
    id: 'dates',
    num: 5,
    title: 'Chapter 5: The Festival Grounds (Milestones & Solstices)',
    resident: 'Clover the Village Elder',
    role: 'Festival Keeper',
    quote: '“Flowers may wither in winter, but the warmth of remembered birthdays blooms forever. Mark milestones with joy!”',
    anchor: { x: 28, y: 19 },
    dataHeader: 'FESTIVAL CALENDAR & SOLSTICES',
    badge: '🌸 BUNTING & LANTERNS',
    items: [
      { title: 'Starlight Solstice Festival', tag: 'IN 4 DAYS', tagBg: '#dbeafe', tagColor: '#1e40af', note: 'Nov 8, 2026 • Valley Solstice', src: '🌐 WEB', done: false },
      { title: "Sister's Birthday Gathering", tag: 'IN 16 DAYS', tagBg: '#fce7f3', tagColor: '#9d174d', note: 'Nov 20, 2026 • Family Milestone', src: '💬 WHATSAPP', done: false },
      { title: 'New Year Valley Gathering', tag: 'IN 58 DAYS', tagBg: '#e0e7ff', tagColor: '#3730a3', note: 'Jan 1, 2027 • Plaza Party', src: '🌐 WEB', done: false },
    ]
  },
  {
    id: 'watchlist',
    num: 6,
    title: 'Chapter 6: The Moonlight Cinema (Watchlist & Books)',
    resident: 'Juniper the Projectionist',
    role: 'Cinema Fox',
    quote: '“Stars above, reels whirring below! Grab a log bench, fireflies are dancing in the projector beam.”',
    anchor: { x: 6, y: 19 },
    dataHeader: 'OPEN-AIR CINEMA & READING ROOM',
    badge: '🎬 FILM REELS QUEUE',
    items: [
      { title: 'Princess Mononoke', tag: 'PLAN TO WATCH', tagBg: '#e0e7ff', tagColor: '#3730a3', note: 'Studio Ghibli • Masterpiece Animation', src: '🌐 WEB', done: false },
      { title: 'Spirited Away', tag: 'WATCHING', tagBg: '#dcfce7', tagColor: '#166534', note: 'Rewatch with friends at amphitheater', src: '💬 WHATSAPP', done: false },
      { title: 'The Way of Kings', tag: 'COMPLETED', tagBg: '#fef3c7', tagColor: '#92400e', note: 'Book • Rating: 9/10 • Brandon Sanderson', src: '🌐 WEB', done: true },
    ]
  },
  {
    id: 'audit',
    num: 7,
    title: 'Chapter 7: The Archive Cellar (The Chronicle)',
    resident: 'Moss the Ancient Chronicler',
    role: 'Village Archivist',
    quote: '“Every verified transaction, dispatched reminder, and completed chore rests safely upon these cedar shelves.”',
    anchor: { x: 28, y: 4 },
    dataHeader: 'IMMUTABLE VALLEY CHRONICLE',
    badge: '📜 ARCHIVAL TOMES',
    items: [
      { title: 'Recorded debt via WhatsApp: ₹2,080', tag: 'CREATE', tagBg: '#dcfce7', tagColor: '#166534', note: 'Module: Debt • 1 hour ago', src: '💬 WHATSAPP', done: true },
      { title: 'Created quest via WhatsApp: "Water parsnips"', tag: 'CREATE', tagBg: '#dcfce7', tagColor: '#166534', note: 'Module: Todo • 2 hours ago', src: '💬 WHATSAPP', done: true },
      { title: 'Updated deadline: "End Semester Project"', tag: 'UPDATE', tagBg: '#fef3c7', tagColor: '#92400e', note: 'Module: Deadline • Yesterday', src: '🌐 WEB', done: true },
      { title: 'Dispatched alert: "Feed livestock"', tag: 'NOTIFICATION', tagBg: '#dbeafe', tagColor: '#1e40af', note: 'Module: Reminder • 2 days ago', src: '💬 WHATSAPP', done: true },
    ]
  },
  {
    id: 'settings',
    num: 8,
    title: 'Chapter 8: The Toolshed Workbench (Homestead Controls)',
    resident: 'Rowan the Artisan Builder',
    role: 'Workshop Blacksmith',
    quote: '“A master builder tunes her workshop to match her rhythm. Set your audio levels and sandbox controls.”',
    anchor: { x: 8, y: 4 },
    dataHeader: 'VALLEY PREFERENCES & SANDBOX',
    badge: '🔧 ANVIL & LEVER',
    items: [
      { title: 'Environment Mode: Development Sandbox', tag: 'ACTIVE', tagBg: '#fef3c7', tagColor: '#92400e', note: 'Sandbox active: isolated from live data', src: '⚙️ SYSTEM', done: true },
      { title: 'Chiptune Sound Effects & Dialogue Blips', tag: 'ENABLED', tagBg: '#dcfce7', tagColor: '#166534', note: 'Web Audio API procedural sound engine', src: '🎵 AUDIO', done: true },
      { title: 'Smooth Camera Panning Animation', tag: 'ENABLED', tagBg: '#e0e7ff', tagColor: '#3730a3', note: 'Prefers-reduced-motion fallback ready', src: '🗺️ CAMERA', done: true },
    ]
  },
];

let activeChapter = CHAPTERS[0];

const server = http.createServer((req, res) => {
  const url = req.url.split('?')[0];

  if (url.startsWith('/fonts/')) {
    const fontPath = path.resolve('public', url.slice(1));
    if (fs.existsSync(fontPath)) {
      res.writeHead(200, { 'Content-Type': 'font/woff2' });
      return fs.createReadStream(fontPath).pipe(res);
    }
  }

  if (url.startsWith('/assets/')) {
    const assetPath = path.resolve('public', url.slice(1));
    if (fs.existsSync(assetPath)) {
      res.writeHead(200, { 'Content-Type': 'image/png' });
      return fs.createReadStream(assetPath).pipe(res);
    }
  }

  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(generateHtml(activeChapter));
});

function generateHtml(ch) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
  <title>fih — Pixel Valley [${ch.title}]</title>
  <style>
    @font-face {
      font-family: 'Press Start 2P';
      src: url('/fonts/PressStart2P-Regular.woff2') format('woff2');
      font-weight: normal;
      font-style: normal;
      font-display: swap;
    }
    @font-face {
      font-family: 'Silkscreen';
      src: url('/fonts/Silkscreen-Regular.woff2') format('woff2');
      font-weight: normal;
      font-style: normal;
      font-display: swap;
    }
    @font-face {
      font-family: 'Silkscreen';
      src: url('/fonts/Silkscreen-Bold.woff2') format('woff2');
      font-weight: bold;
      font-style: normal;
      font-display: swap;
    }

    :root {
      --font-pixel-display: 'Press Start 2P', monospace;
      --font-pixel-body: 'Silkscreen', monospace;
      --pv-wood-dark: #452817;
      --pv-gold: #f2c230;
      --pv-parchment: #f4e4bc;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      background: #120b06;
      font-family: var(--font-pixel-body);
      color: #fdf6e2;
      overflow: hidden;
      width: 100vw;
      height: 100vh;
      position: relative;
      image-rendering: pixelated;
    }

    .pixel-frame-wood {
      background: #23140c;
      border: 3px solid #5a341a;
      box-shadow: inset 2px 2px 0 #7b4a28, inset -2px -2px 0 #120a06, 0 4px 12px rgba(0,0,0,0.5);
    }

    .pixel-frame-parchment {
      background: #f4e4bc;
      border: 3px solid #784323;
      color: #2b1a0e;
      box-shadow: inset 2px 2px 0 #fff5d9, inset -2px -2px 0 #c7a46e, 0 4px 16px rgba(0,0,0,0.4);
    }

    .pixel-btn {
      background: #5a341a;
      color: #fdf6e2;
      font-family: var(--font-pixel-display);
      font-size: 8px;
      padding: 6px 12px;
      border: 2px solid #8b572a;
      box-shadow: inset 1px 1px 0 #a36c3a, inset -1px -1px 0 #2b140c;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .pixel-btn-gold {
      background: #f2c230;
      color: #2b1a0e;
      border-color: #9c6c10;
      box-shadow: inset 1px 1px 0 #ffe082, inset -1px -1px 0 #7a4f08;
    }

    /* HUD */
    .hud-bar {
      position: fixed;
      top: 12px;
      left: 14px;
      z-index: 100;
      padding: 7px 12px;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .hud-badge-dev {
      background: #78350f;
      border: 2px solid #f59e0b;
      color: #fef3c7;
      font-family: var(--font-pixel-display);
      font-size: 8px;
      padding: 3px 6px;
      letter-spacing: 0.05em;
    }

    /* Hotbar */
    .rpg-hotbar {
      position: fixed;
      bottom: 12px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 100;
      display: flex;
      gap: 6px;
      padding: 6px 10px;
      background: #1b1008;
      border: 3px solid #5a341a;
      box-shadow: inset 2px 2px 0 #7b4a28, inset -2px -2px 0 #0d0704;
    }

    .hotbar-slot {
      width: 44px;
      height: 44px;
      background: #2a180e;
      border: 2px solid #452817;
      box-shadow: inset 1px 1px 0 #120a06, inset -1px -1px 0 #5a341a;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      position: relative;
    }

    .hotbar-slot.active {
      background: #3b2214;
      border: 2px solid #f2c230;
      box-shadow: 0 0 8px rgba(242, 194, 48, 0.4), inset 1px 1px 0 #ffe082;
    }

    .hotbar-slot .key-num {
      position: absolute;
      top: 2px;
      left: 3px;
      font-family: var(--font-pixel-display);
      font-size: 7px;
      color: #a89484;
    }

    .hotbar-slot.active .key-num {
      color: #f2c230;
    }

    /* Dialogue */
    .dialogue-box {
      position: fixed;
      bottom: 74px;
      left: 14px;
      z-index: 90;
      width: 540px;
      max-width: calc(100vw - 28px);
      padding: 12px 14px;
      display: flex;
      gap: 12px;
    }

    .dialogue-portrait {
      width: 48px;
      height: 48px;
      background: #3a2213;
      border: 2px solid #7b4a28;
      box-shadow: inset 1px 1px 0 #120a06, inset -1px -1px 0 #a36c3a;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      overflow: hidden;
      font-size: 24px;
    }

    /* Side Parchment Card (Desktop) */
    .parchment-stage {
      position: fixed;
      top: 14px;
      right: 14px;
      bottom: 74px;
      width: 480px;
      max-width: calc(100vw - 28px);
      z-index: 80;
      overflow-y: auto;
      padding: 18px 20px;
    }

    /* Mobile Overrides */
    @media (max-width: 768px) {
      #world-canvas {
        height: 38vh !important;
        position: absolute;
        top: 0;
        left: 0;
        width: 100vw !important;
      }
      .hud-bar {
        top: 8px;
        left: 8px;
        padding: 4px 8px;
        gap: 6px;
      }
      .hud-bar .hide-mobile {
        display: none !important;
      }
      .dialogue-box {
        display: none !important;
      }
      .parchment-stage {
        top: 38vh !important;
        right: 8px !important;
        left: 8px !important;
        bottom: 64px !important;
        width: auto !important;
        max-width: none !important;
        padding: 12px 14px;
      }
      .rpg-hotbar {
        bottom: 6px;
        padding: 3px 6px;
        gap: 3px;
      }
      .hotbar-slot {
        width: 34px;
        height: 34px;
        font-size: 14px;
      }
    }
  </style>
</head>
<body>

  <!-- 1. The 16-Bit Tile-Map Canvas World -->
  <canvas id="world-canvas" style="position: absolute; inset: 0; width: 100%; height: 100%; z-index: 1;"></canvas>

  <!-- 2. Top-Left Pixel HUD -->
  <header class="hud-bar pixel-frame-wood">
    <div style="display: flex; align-items: center; gap: 5px;">
      <span style="font-size: 13px;">🌾</span>
      <span style="font-family: var(--font-pixel-display); font-size: 9px; color: #facc15;">PIXEL VALLEY</span>
    </div>

    <div class="hud-badge-dev">
      DEV SANDBOX
    </div>

    <div style="font-size: 10px; color: #fdf6e2; display: flex; align-items: center; gap: 4px;">
      <span>🍂 Autumn 4</span>
      <span style="color: #facc15;" class="hide-mobile">• 14:32</span>
    </div>

    <div style="font-size: 10px; color: #8fc45a; font-weight: bold;">
      🪙 +₹1,580g
    </div>

    <div style="font-size: 9px; color: #60a5fa;" class="hide-mobile">
      ☀️ Clear
    </div>
  </header>

  <!-- 3. Side Parchment Data Panel: Active Chapter -->
  <div class="parchment-stage pixel-frame-parchment">
    <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px dashed #784323; padding-bottom: 8px; margin-bottom: 12px;">
      <div>
        <div style="font-family: var(--font-pixel-display); font-size: 11px; color: #452817; letter-spacing: 0.04em;">
          ${ch.title.toUpperCase()}
        </div>
        <div style="font-size: 10px; color: #784323; margin-top: 3px;">
          ${ch.resident} • ${ch.role}
        </div>
      </div>
      <button class="pixel-btn pixel-btn-gold" style="font-size: 8px;">
        + ACTION
      </button>
    </div>

    <!-- Chapter Summary Banner -->
    <div style="background: rgba(120, 67, 35, 0.12); border: 2px solid #a36c3a; padding: 10px 12px; margin-bottom: 14px; display: flex; align-items: center; justify-content: space-between;">
      <div>
        <div style="font-size: 9px; font-family: var(--font-pixel-display); color: #784323;">${ch.dataHeader}</div>
        <div style="font-size: 14px; font-weight: bold; color: #2e6930; font-family: var(--font-pixel-display); margin-top: 4px;">
          ${ch.badge}
        </div>
        <div style="font-size: 9px; color: #5a341a; margin-top: 2px;">
          ${ch.items.length} records registered in the village
        </div>
      </div>
      <div style="font-size: 28px;">
        ${ch.id === 'todos' ? '🌾' : ch.id === 'reminders' ? '🔔' : ch.id === 'debts' ? '⚖️' : ch.id === 'deadlines' ? '📌' : ch.id === 'dates' ? '🌸' : ch.id === 'watchlist' ? '🎬' : ch.id === 'audit' ? '📜' : '🔧'}
      </div>
    </div>

    <!-- Active Records List -->
    <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 14px;">
      ${ch.items.map(item => `
        <div style="background: #fff9ea; border: 2px solid #8b572a; padding: 8px 10px; display: flex; justify-content: space-between; align-items: center; box-shadow: 1px 1px 0 #c7a46e; ${item.done ? 'opacity: 0.75; text-decoration: line-through;' : ''}">
          <div>
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="font-family: var(--font-pixel-display); font-size: 9px; color: #2b1a0e;">${item.title}</span>
              <span style="font-size: 7px; background: ${item.tagBg}; color: ${item.tagColor}; padding: 1px 4px; border: 1px solid rgba(0,0,0,0.15); font-weight: bold;">${item.tag}</span>
              <span style="font-size: 7px; background: #e0e7ff; color: #3730a3; padding: 1px 4px; border: 1px solid #a5b4fc;">${item.src}</span>
            </div>
            <div style="font-size: 9px; color: #784323; margin-top: 3px;">
              ${item.note}
            </div>
          </div>
          <button class="pixel-btn" style="padding: 2px 6px; font-size: 7px;">DETAILS</button>
        </div>
      `).join('')}
    </div>

    <div style="font-size: 9px; color: #784323; border-top: 1px solid #d4b896; padding-top: 8px; font-style: italic;">
      * Resident ${ch.resident} keeps watch over this zone. Click in-world objects to inspect records directly.
    </div>
  </div>

  <!-- 4. Resident Dialogue Box -->
  <div class="dialogue-box pixel-frame-wood">
    <div class="dialogue-portrait">
      ${ch.id === 'debts' ? '<img src="/assets/characters/bram_factor.png" style="width: 48px; height: 64px; object-fit: cover; object-position: 0 0; image-rendering: pixelated; margin-top: -4px;" alt="Bram" />' : (ch.id === 'todos' ? '🌾' : ch.id === 'reminders' ? '🦉' : ch.id === 'deadlines' ? '👒' : ch.id === 'dates' ? '🌸' : ch.id === 'watchlist' ? '🦊' : ch.id === 'audit' ? '🦔' : '🔧')}
    </div>
    <div style="flex: 1;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
        <span style="font-family: var(--font-pixel-display); font-size: 9px; color: #f2c230;">${ch.resident.toUpperCase()}</span>
        <span style="font-size: 9px; color: #a89484;">${ch.title}</span>
      </div>
      <div style="font-size: 11px; line-height: 1.5; color: #fdf6e2;">
        ${ch.quote}
      </div>
    </div>
    <div style="align-self: flex-end; font-size: 10px; color: #f2c230;">
      ▼
    </div>
  </div>

  <!-- 5. 8-Slot RPG Hotbar -->
  <nav class="rpg-hotbar">
    <div class="hotbar-slot ${ch.id === 'todos' ? 'active' : ''}"><span class="key-num">1</span><span>🌾</span></div>
    <div class="hotbar-slot ${ch.id === 'reminders' ? 'active' : ''}"><span class="key-num">2</span><span>🔔</span></div>
    <div class="hotbar-slot ${ch.id === 'debts' ? 'active' : ''}"><span class="key-num">3</span><span>🪙</span></div>
    <div class="hotbar-slot ${ch.id === 'deadlines' ? 'active' : ''}"><span class="key-num">4</span><span>📌</span></div>
    <div class="hotbar-slot ${ch.id === 'dates' ? 'active' : ''}"><span class="key-num">5</span><span>🌸</span></div>
    <div class="hotbar-slot ${ch.id === 'watchlist' ? 'active' : ''}"><span class="key-num">6</span><span>🎬</span></div>
    <div class="hotbar-slot ${ch.id === 'audit' ? 'active' : ''}"><span class="key-num">7</span><span>📜</span></div>
    <div class="hotbar-slot ${ch.id === 'settings' ? 'active' : ''}"><span class="key-num">8</span><span>🔧</span></div>
  </nav>

  <!-- 6. Canvas 16-Bit Engine Script -->
  <script>
    const canvas = document.getElementById('world-canvas');
    const ctx = canvas.getContext('2d');

    const images = {};
    const imgList = [
      { key: 'tileset', src: '/assets/tilesets/village_tileset.png' },
      { key: 'pip', src: '/assets/characters/pip_walk.png' },
      { key: 'bram', src: '/assets/characters/bram_factor.png' }
    ];

    let loadedCount = 0;
    imgList.forEach(({ key, src }) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        images[key] = img;
        loadedCount++;
        if (loadedCount === imgList.length) {
          initWorld();
        }
      };
    });

    const TILE_SIZE = 16;
    const MAP_WIDTH = 38;
    const MAP_HEIGHT = 26;

    function resize() {
      const isMobile = window.innerWidth <= 768;
      canvas.width = window.innerWidth;
      canvas.height = isMobile ? Math.floor(window.innerHeight * 0.38) : window.innerHeight;
      ctx.imageSmoothingEnabled = false;
    }
    window.addEventListener('resize', resize);
    resize();

    function initWorld() {
      resize();
      const isMobile = window.innerWidth <= 768;
      const scale = isMobile ? 3 : 4;
      
      const camX = ${ch.anchor.x} * TILE_SIZE;
      const camY = ${ch.anchor.y} * TILE_SIZE;

      ctx.imageSmoothingEnabled = false;
      ctx.fillStyle = '#120b06';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.scale(scale, scale);

      const viewW = canvas.width / scale;
      const viewH = canvas.height / scale;

      const offsetX = Math.floor(viewW / 2 - camX);
      const offsetY = Math.floor(viewH / 2 - camY);
      ctx.translate(offsetX, offsetY);

      const tileset = images.tileset;

      // Ground
      for (let ty = 0; ty < MAP_HEIGHT; ty++) {
        for (let tx = 0; tx < MAP_WIDTH; tx++) {
          const wx = tx * TILE_SIZE;
          const wy = ty * TILE_SIZE;

          let tileCol = (tx * 7 + ty * 13) % 4;

          const isMainEastWest = ty >= 12 && ty <= 13 && tx >= 4 && tx <= 32;
          const isMainNorthSouth = tx >= 17 && tx <= 18 && ty >= 5 && ty <= 21;
          const isWestNorthBranch = tx === 8 && ty >= 4 && ty <= 12;
          const isWestSouthBranch = tx === 6 && ty >= 14 && ty <= 20;
          const isEastNorthBranch = tx === 28 && ty >= 4 && ty <= 11;
          const isEastSouthBranch = tx === 28 && ty >= 14 && ty <= 20;

          if (isMainEastWest || isMainNorthSouth || isWestNorthBranch || isWestSouthBranch || isEastNorthBranch || isEastSouthBranch) {
            tileCol = 4;
          }

          if (tx >= 12 && tx <= 15 && ty >= 16 && ty <= 18) {
            ctx.drawImage(tileset, 0, 1 * TILE_SIZE, TILE_SIZE, TILE_SIZE, wx, wy, TILE_SIZE, TILE_SIZE);
            continue;
          }

          if (tx >= 5 && tx <= 7 && ty >= 9 && ty <= 10) {
            ctx.drawImage(tileset, 7 * TILE_SIZE, 0 * TILE_SIZE, TILE_SIZE, TILE_SIZE, wx, wy, TILE_SIZE, TILE_SIZE);
            continue;
          }

          ctx.drawImage(tileset, tileCol * TILE_SIZE, 0, TILE_SIZE, TILE_SIZE, wx, wy, TILE_SIZE, TILE_SIZE);
        }
      }

      // Cobblestone Plazas
      for (let cx = 16; cx <= 20; cx++) {
        for (let cy = 11; cy <= 13; cy++) {
          ctx.drawImage(tileset, 4 * TILE_SIZE, 1 * TILE_SIZE, TILE_SIZE, TILE_SIZE, cx * TILE_SIZE, cy * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
      }
      for (let cx = 24; cx <= 28; cx++) {
        for (let cy = 11; cy <= 13; cy++) {
          ctx.drawImage(tileset, 4 * TILE_SIZE, 1 * TILE_SIZE, TILE_SIZE, TILE_SIZE, cx * TILE_SIZE, cy * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
      }

      // Fences
      for (let fx = 4; fx <= 10; fx++) {
        ctx.drawImage(tileset, 2 * TILE_SIZE, 1 * TILE_SIZE, TILE_SIZE, TILE_SIZE, fx * TILE_SIZE, 8 * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      }
      for (let fx = 19; fx <= 24; fx++) {
        ctx.drawImage(tileset, 2 * TILE_SIZE, 1 * TILE_SIZE, TILE_SIZE, TILE_SIZE, fx * TILE_SIZE, 14 * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      }

      const renderables = [];

      // Farmhouse Cabin (x: 6, y: 4)
      renderables.push({
        y: 8 * TILE_SIZE,
        render: () => {
          const bx = 6 * TILE_SIZE;
          const by = 4 * TILE_SIZE;
          for (let rx = 0; rx < 4; rx++) {
            ctx.drawImage(tileset, 0, 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE, bx + rx * TILE_SIZE, by, TILE_SIZE, TILE_SIZE);
            ctx.drawImage(tileset, 0, 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE, bx + rx * TILE_SIZE, by + TILE_SIZE, TILE_SIZE, TILE_SIZE);
            if (rx === 2) ctx.drawImage(tileset, 3 * TILE_SIZE, 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE, bx + rx * TILE_SIZE, by + 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            else if (rx === 1) ctx.drawImage(tileset, 2 * TILE_SIZE, 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE, bx + rx * TILE_SIZE, by + 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            else ctx.drawImage(tileset, 1 * TILE_SIZE, 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE, bx + rx * TILE_SIZE, by + 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE);
          }
          // Garden Crops
          ctx.drawImage(tileset, 2 * TILE_SIZE, 4 * TILE_SIZE, TILE_SIZE, TILE_SIZE, 5 * TILE_SIZE, 9 * TILE_SIZE, TILE_SIZE, TILE_SIZE);
          ctx.drawImage(tileset, 2 * TILE_SIZE, 4 * TILE_SIZE, TILE_SIZE, TILE_SIZE, 6 * TILE_SIZE, 9 * TILE_SIZE, TILE_SIZE, TILE_SIZE);
          ctx.drawImage(tileset, 3 * TILE_SIZE, 4 * TILE_SIZE, TILE_SIZE, TILE_SIZE, 7 * TILE_SIZE, 10 * TILE_SIZE, TILE_SIZE, TILE_SIZE);
          // Wren Courier on Post
          ctx.drawImage(tileset, 7 * TILE_SIZE, 5 * TILE_SIZE, TILE_SIZE, TILE_SIZE, 9 * TILE_SIZE, 12 * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
      });

      // Ledger Hut Cabin (x: 24, y: 7)
      renderables.push({
        y: 10 * TILE_SIZE,
        render: () => {
          const hx = 24 * TILE_SIZE;
          const hy = 7 * TILE_SIZE;
          for (let rx = 0; rx < 5; rx++) {
            ctx.drawImage(tileset, 0, 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE, hx + rx * TILE_SIZE, hy, TILE_SIZE, TILE_SIZE);
            ctx.drawImage(tileset, 0, 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE, hx + rx * TILE_SIZE, hy + TILE_SIZE, TILE_SIZE, TILE_SIZE);
            if (rx === 3) ctx.drawImage(tileset, 3 * TILE_SIZE, 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE, hx + rx * TILE_SIZE, hy + 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            else if (rx === 0 || rx === 4) ctx.drawImage(tileset, 2 * TILE_SIZE, 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE, hx + rx * TILE_SIZE, hy + 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            else ctx.drawImage(tileset, 1 * TILE_SIZE, 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE, hx + rx * TILE_SIZE, hy + 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE);
          }
          ctx.drawImage(tileset, 4 * TILE_SIZE, 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE, hx + 4 * TILE_SIZE, hy + 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE);
          ctx.fillStyle = 'rgba(15, 23, 42, 0.35)';
          ctx.fillRect(hx, hy + 2 * TILE_SIZE, 5 * TILE_SIZE, 2);
        }
      });

      // Bram
      renderables.push({
        y: 11 * TILE_SIZE + 2,
        render: () => {
          if (images.bram) {
            ctx.drawImage(images.bram, 0, 0, 24, 32, 26 * TILE_SIZE - 4, 10 * TILE_SIZE, 24, 32);
          }
        }
      });

      // Counter Desk & Props
      renderables.push({
        y: 11 * TILE_SIZE + 8,
        render: () => {
          const cx = 25 * TILE_SIZE;
          const cy = 11 * TILE_SIZE;
          ctx.drawImage(tileset, 5 * TILE_SIZE, 1 * TILE_SIZE, TILE_SIZE, TILE_SIZE, cx, cy, TILE_SIZE, TILE_SIZE);
          ctx.drawImage(tileset, 5 * TILE_SIZE, 1 * TILE_SIZE, TILE_SIZE, TILE_SIZE, cx + TILE_SIZE, cy, TILE_SIZE, TILE_SIZE);
          ctx.drawImage(tileset, 5 * TILE_SIZE, 1 * TILE_SIZE, TILE_SIZE, TILE_SIZE, cx + 2 * TILE_SIZE, cy, TILE_SIZE, TILE_SIZE);

          ctx.save();
          ctx.translate(cx + TILE_SIZE + 8, cy + 2);
          ctx.rotate(0.12);
          ctx.drawImage(tileset, 6 * TILE_SIZE, 1 * TILE_SIZE, TILE_SIZE, TILE_SIZE, -8, -8, TILE_SIZE, TILE_SIZE);
          ctx.restore();

          ctx.drawImage(tileset, 7 * TILE_SIZE, 1 * TILE_SIZE, TILE_SIZE, TILE_SIZE, cx + 2, cy - 2, TILE_SIZE, TILE_SIZE);
          ctx.drawImage(tileset, 7 * TILE_SIZE, 1 * TILE_SIZE, TILE_SIZE, TILE_SIZE, cx + 8, cy - 4, TILE_SIZE, TILE_SIZE);
        }
      });

      // Bell Tower (x: 18, y: 5)
      renderables.push({
        y: 7 * TILE_SIZE,
        render: () => {
          const tx = 17 * TILE_SIZE;
          const ty = 2 * TILE_SIZE;
          ctx.drawImage(tileset, 0, 3 * TILE_SIZE, TILE_SIZE, TILE_SIZE, tx, ty, TILE_SIZE, TILE_SIZE);
          ctx.drawImage(tileset, 0, 3 * TILE_SIZE, TILE_SIZE, TILE_SIZE, tx + TILE_SIZE, ty, TILE_SIZE, TILE_SIZE);
          ctx.drawImage(tileset, 1 * TILE_SIZE, 3 * TILE_SIZE, TILE_SIZE, TILE_SIZE, tx, ty + TILE_SIZE, TILE_SIZE, TILE_SIZE);
          ctx.drawImage(tileset, 2 * TILE_SIZE, 3 * TILE_SIZE, TILE_SIZE, TILE_SIZE, tx + TILE_SIZE, ty + TILE_SIZE, TILE_SIZE, TILE_SIZE);
          ctx.drawImage(tileset, 5 * TILE_SIZE, 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE, tx, ty + 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE);
          ctx.drawImage(tileset, 5 * TILE_SIZE, 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE, tx + TILE_SIZE, ty + 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
      });

      // Notice Board (x: 18, y: 16)
      renderables.push({
        y: 17 * TILE_SIZE,
        render: () => {
          const nx = 17 * TILE_SIZE;
          const ny = 15 * TILE_SIZE;
          ctx.drawImage(tileset, 4 * TILE_SIZE, 4 * TILE_SIZE, TILE_SIZE, TILE_SIZE, nx, ny, TILE_SIZE, TILE_SIZE);
          ctx.drawImage(tileset, 4 * TILE_SIZE, 4 * TILE_SIZE, TILE_SIZE, TILE_SIZE, nx + TILE_SIZE, ny, TILE_SIZE, TILE_SIZE);
          ctx.drawImage(tileset, 6 * TILE_SIZE, 5 * TILE_SIZE, TILE_SIZE, TILE_SIZE, nx + 2 * TILE_SIZE, ny, TILE_SIZE, TILE_SIZE);
        }
      });

      // Central Fountain (x: 18, y: 12)
      renderables.push({
        y: 13 * TILE_SIZE,
        render: () => {
          ctx.drawImage(tileset, 5 * TILE_SIZE, 4 * TILE_SIZE, TILE_SIZE, TILE_SIZE, 18 * TILE_SIZE, 11 * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
      });

      // Festival Gazebo (x: 28, y: 19)
      renderables.push({
        y: 20 * TILE_SIZE,
        render: () => {
          const gx = 27 * TILE_SIZE;
          const gy = 17 * TILE_SIZE;
          ctx.drawImage(tileset, 7 * TILE_SIZE, 3 * TILE_SIZE, TILE_SIZE, TILE_SIZE, gx, gy, TILE_SIZE, TILE_SIZE);
          ctx.drawImage(tileset, 7 * TILE_SIZE, 3 * TILE_SIZE, TILE_SIZE, TILE_SIZE, gx + TILE_SIZE, gy, TILE_SIZE, TILE_SIZE);
          ctx.drawImage(tileset, 7 * TILE_SIZE, 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE, gx - TILE_SIZE, gy + TILE_SIZE, TILE_SIZE, TILE_SIZE);
          ctx.drawImage(tileset, 7 * TILE_SIZE, 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE, gx + 2 * TILE_SIZE, gy + TILE_SIZE, TILE_SIZE, TILE_SIZE);
          ctx.drawImage(tileset, 7 * TILE_SIZE, 4 * TILE_SIZE, TILE_SIZE, TILE_SIZE, gx - TILE_SIZE, gy + 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE);
          ctx.drawImage(tileset, 6 * TILE_SIZE, 4 * TILE_SIZE, TILE_SIZE, TILE_SIZE, gx + TILE_SIZE, gy + 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
      });

      // Moonlight Cinema (x: 6, y: 19)
      renderables.push({
        y: 20 * TILE_SIZE,
        render: () => {
          const mx = 4 * TILE_SIZE;
          const my = 18 * TILE_SIZE;
          ctx.drawImage(tileset, 4 * TILE_SIZE, 3 * TILE_SIZE, TILE_SIZE, TILE_SIZE, mx, my, TILE_SIZE, TILE_SIZE);
          ctx.drawImage(tileset, 4 * TILE_SIZE, 3 * TILE_SIZE, TILE_SIZE, TILE_SIZE, mx + TILE_SIZE, my, TILE_SIZE, TILE_SIZE);
          ctx.drawImage(tileset, 3 * TILE_SIZE, 3 * TILE_SIZE, TILE_SIZE, TILE_SIZE, mx + 3 * TILE_SIZE, my + 1 * TILE_SIZE, TILE_SIZE, TILE_SIZE);
          ctx.drawImage(tileset, 6 * TILE_SIZE, 4 * TILE_SIZE, TILE_SIZE, TILE_SIZE, mx + 2 * TILE_SIZE, my + 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
      });

      // Archive Cellar (x: 28, y: 4)
      renderables.push({
        y: 6 * TILE_SIZE,
        render: () => {
          const ax = 27 * TILE_SIZE;
          const ay = 2 * TILE_SIZE;
          ctx.drawImage(tileset, 5 * TILE_SIZE, 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE, ax, ay, TILE_SIZE, TILE_SIZE);
          ctx.drawImage(tileset, 5 * TILE_SIZE, 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE, ax + TILE_SIZE, ay, TILE_SIZE, TILE_SIZE);
          ctx.drawImage(tileset, 5 * TILE_SIZE, 3 * TILE_SIZE, TILE_SIZE, TILE_SIZE, ax + 2 * TILE_SIZE, ay + 1 * TILE_SIZE, TILE_SIZE, TILE_SIZE);
          ctx.drawImage(tileset, 7 * TILE_SIZE, 4 * TILE_SIZE, TILE_SIZE, TILE_SIZE, ax - 1 * TILE_SIZE, ay + 1 * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
      });

      // Toolshed (x: 8, y: 4)
      renderables.push({
        y: 6 * TILE_SIZE,
        render: () => {
          const sx = 7 * TILE_SIZE;
          const sy = 2 * TILE_SIZE;
          ctx.drawImage(tileset, 6 * TILE_SIZE, 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE, sx, sy, TILE_SIZE, TILE_SIZE);
          ctx.drawImage(tileset, 6 * TILE_SIZE, 2 * TILE_SIZE, TILE_SIZE, TILE_SIZE, sx + TILE_SIZE, sy, TILE_SIZE, TILE_SIZE);
          ctx.drawImage(tileset, 6 * TILE_SIZE, 3 * TILE_SIZE, TILE_SIZE, TILE_SIZE, sx + 2 * TILE_SIZE, sy + 1 * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
      });

      // Trees
      renderables.push({
        y: 11 * TILE_SIZE,
        render: () => {
          ctx.drawImage(tileset, 0, 5 * TILE_SIZE, TILE_SIZE, TILE_SIZE, 3 * TILE_SIZE, 9 * TILE_SIZE, TILE_SIZE, TILE_SIZE);
          ctx.drawImage(tileset, 1 * TILE_SIZE, 5 * TILE_SIZE, TILE_SIZE, TILE_SIZE, 3 * TILE_SIZE, 10 * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
      });
      renderables.push({
        y: 8 * TILE_SIZE,
        render: () => {
          ctx.drawImage(tileset, 2 * TILE_SIZE, 5 * TILE_SIZE, TILE_SIZE, TILE_SIZE, 10 * TILE_SIZE, 6 * TILE_SIZE, TILE_SIZE, TILE_SIZE);
          ctx.drawImage(tileset, 3 * TILE_SIZE, 5 * TILE_SIZE, TILE_SIZE, TILE_SIZE, 10 * TILE_SIZE, 7 * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
      });

      // Pip the Farmer
      renderables.push({
        y: (${ch.anchor.y} + 1) * TILE_SIZE + 30,
        render: () => {
          if (images.pip) {
            const px = (${ch.anchor.x} - 2) * TILE_SIZE;
            const py = (${ch.anchor.y} + 1) * TILE_SIZE;
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.beginPath();
            ctx.ellipse(px + 8, py + 29, 6, 3, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.drawImage(images.pip, 1 * 16, 2 * 32, 16, 32, px, py, 16, 32);
          }
        }
      });

      renderables.sort((a, b) => a.y - b.y);
      renderables.forEach(r => r.render());

      ctx.restore();

      ctx.fillStyle = 'rgba(255, 235, 180, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  </script>
</body>
</html>`;
}

async function run() {
  server.listen(PORT, async () => {
    console.log(`Server started on http://localhost:${PORT}`);

    try {
      const browser = await puppeteer.launch({
        executablePath: EDGE_PATH,
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none'],
      });

      for (const ch of CHAPTERS) {
        activeChapter = ch;
        console.log(`Capturing ${ch.id} (Desktop 1280x800)...`);

        const pDesk = await browser.newPage();
        await pDesk.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 });
        await pDesk.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle0' });
        await new Promise(r => setTimeout(r, 900));
        const deskPath = path.join(OUT_DIR, `${ch.id}-desktop.png`);
        await pDesk.screenshot({ path: deskPath });
        console.log(`Saved: ${deskPath}`);
        await pDesk.close();

        console.log(`Capturing ${ch.id} (Mobile 390x844)...`);
        const pMob = await browser.newPage();
        await pMob.setViewport({ width: 390, height: 844, isMobile: true, deviceScaleFactor: 2 });
        await pMob.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle0' });
        await new Promise(r => setTimeout(r, 900));
        const mobPath = path.join(OUT_DIR, `${ch.id}-mobile.png`);
        await pMob.screenshot({ path: mobPath });
        console.log(`Saved: ${mobPath}`);
        await pMob.close();
      }

      await browser.close();
      server.close();
      console.log('Successfully captured all 8 chapters!');
      process.exit(0);
    } catch (err) {
      console.error('Error during capture:', err);
      server.close();
      process.exit(1);
    }
  });
}

run();
