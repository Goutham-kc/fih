import puppeteer from 'puppeteer-core';
import http from 'http';
import fs from 'fs';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const OUT_DIR = path.resolve('docs/redesign/before');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

// Sample Dev Mode Data
const SAMPLE_DATA = {
  todos: [
    { title: 'Water autumn parsnips and beets', priority: 'high', due: 'Today 5:00 PM', done: false },
    { title: 'Mend broken coop fence', priority: 'medium', due: 'Tomorrow 9:00 AM', done: false },
    { title: 'Stock firewood by the farmhouse porch', priority: 'low', due: 'Nov 6', done: false },
    { title: 'Inspect stone greenhouse roof', priority: 'low', due: 'Completed', done: true },
  ],
  reminders: [
    { title: 'Feed livestock & gather fresh eggs', time: 'Tomorrow 8:00 AM', status: 'upcoming' },
    { title: 'Weekly village market bulletin', time: 'Friday 2:00 PM', status: 'upcoming' },
    { title: 'Town doctor checkup & vitamins', time: 'Yesterday 10:00 AM', status: 'sent' },
  ],
  deadlines: [
    { title: 'End Semester Project Submission', cat: 'academic', countdown: 'In 2d 4h', date: 'Nov 6, 2026' },
    { title: 'Autumn Harvest Delivery to Market', cat: 'personal', countdown: '3h 15m left', date: 'Today 6:00 PM' },
    { title: 'Archive Library Book Return', cat: 'personal', countdown: 'Overdue by 1d 2h', date: 'Nov 3, 2026' },
  ],
  debts: [
    { person: 'Arjun', amount: 2080, dir: 'owed_to_me', note: 'Advance for mountain trek', settled: false },
    { person: 'Hanan', amount: 500, dir: 'i_owe', note: 'Dinner at saloon', settled: false },
    { person: 'Sarah', amount: 300, dir: 'owed_to_me', note: 'Tools loan', settled: true },
  ],
  dates: [
    { title: 'Starlight Solstice Festival', date: 'Nov 8, 2026', days: 'In 4 days' },
    { title: "Sister's Birthday Celebration", date: 'Nov 20, 2026', days: 'In 16 days' },
    { title: 'New Year Valley Gathering', date: 'Jan 1, 2027', days: 'In 58 days' },
  ],
  watchlist: [
    { title: 'Princess Mononoke', type: 'movie', status: 'planned', notes: 'Studio Ghibli classic' },
    { title: 'Spirited Away', type: 'movie', status: 'in_progress', notes: 'Rewatch with friends' },
    { title: 'The Way of Kings', type: 'book', status: 'done', rating: '9/10', notes: 'Brandon Sanderson' },
  ],
  audit: [
    { action: 'CREATE', module: 'todo', desc: 'Created to-do via WhatsApp: "Water parsnips"', src: 'whatsapp', time: '10 mins ago' },
    { action: 'CREATE', module: 'debt', desc: 'Recorded debt via WhatsApp: owed ₹2,080', src: 'whatsapp', time: '1 hour ago' },
    { action: 'UPDATE', module: 'deadline', desc: 'Updated deadline: "End Semester Project"', src: 'web', time: 'Yesterday' },
    { action: 'NOTIFICATION', module: 'reminder', desc: 'Dispatched WhatsApp reminder: "Feed livestock"', src: 'whatsapp', time: '2 days ago' },
  ],
};

function generateHtml(tab) {
  return `<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="utf-8">
  <title>fih — Pixel Valley (${tab}) [DEV MODE]</title>
  <style>
    :root {
      --bg-dark: #0f1424;
      --bg-surface: #1a1512;
      --pv-parchment: #f4e4bc;
      --pv-ink: #3b2a1e;
      --pv-wood-dark: #7b4a28;
      --pv-wood-light: #c98f55;
      --pv-gold: #f2c230;
      --pv-grass-light: #8fc45a;
      --pv-berry: #c2415a;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    body {
      margin: 0;
      background: #140d08;
      color: #fdf6e2;
      padding: 24px;
      box-sizing: border-box;
    }
    .hud-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: linear-gradient(180deg, #2b1a11 0%, #1f130b 100%);
      border: 3px solid #7b4a28;
      border-radius: 14px;
      padding: 14px 20px;
      margin-bottom: 20px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.5);
    }
    .dev-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: 6px;
      background: rgba(242, 194, 48, 0.2);
      border: 2px solid #f2c230;
      color: #fde047;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.08em;
    }
    .chapter-card {
      background: linear-gradient(180deg, #24140b 0%, #170d07 100%);
      border: 3px solid #7b4a28;
      border-radius: 14px;
      padding: 20px;
      margin-bottom: 20px;
    }
    .story-bubble {
      display: flex;
      gap: 14px;
      align-items: center;
      background: rgba(0,0,0,0.3);
      border: 2px solid #a36c3a;
      border-radius: 10px;
      padding: 12px 16px;
      margin-bottom: 18px;
    }
    .avatar {
      font-size: 32px;
      width: 50px;
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #3d2315;
      border: 2px solid #c98f55;
      border-radius: 8px;
    }
    .data-card {
      background: linear-gradient(180deg, #fdf6e2 0%, #f4e4bc 100%);
      color: #3b2a1e;
      border: 2px solid #7b4a28;
      border-radius: 10px;
      padding: 14px 18px;
      margin-bottom: 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 3px 8px rgba(0,0,0,0.2);
    }
    .badge {
      padding: 2px 7px;
      border-radius: 5px;
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
    }
    .badge-urgent { background: rgba(194, 65, 90, 0.2); color: #c2415a; border: 1px solid #c2415a; }
    .badge-normal { background: rgba(143, 196, 90, 0.2); color: #5e9440; border: 1px solid #5e9440; }
    .badge-whatsapp { background: rgba(56, 189, 248, 0.2); color: #0284c7; border: 1px solid #0284c7; }
    .nav-pills { display: flex; gap: 8px; margin-bottom: 18px; flex-wrap: wrap; }
    .nav-pill { padding: 6px 12px; border-radius: 6px; border: 2px solid #7b4a28; background: #2b1a11; color: #fdf6e2; font-size: 12px; font-weight: 700; text-decoration: none; }
    .nav-pill.active { background: #c98f55; color: #ffffff; border-color: #54331a; }
  </style>
</head>
<body>
  <!-- Persistent HUD -->
  <div class="hud-bar">
    <div style="display:flex; align-items:center; gap:12px;">
      <span style="font-size:24px;">🍂</span>
      <div>
        <div style="font-weight:800; font-size:15px; color:#fdf6e2;">Wed. 4 of Fall</div>
        <div style="font-size:11px; color:#c98f55;">10:35 pm • Pixel Valley</div>
      </div>
      <div style="margin-left:14px; background:rgba(242,194,48,0.15); border:1px solid #f2c230; padding:3px 9px; border-radius:6px; color:#fde047; font-weight:800; font-size:12px;">
        🪙 +₹1,580g GOLD
      </div>
    </div>

    <!-- Persistent Dev Mode Indicator (Constraint 4) -->
    <div class="dev-badge">
      <span style="width:7px; height:7px; background:#f2c230; border-radius:2px; display:inline-block;"></span>
      DEV SANDBOX ACTIVE
    </div>
  </div>

  <!-- Navigation -->
  <div class="nav-pills">
    <span class="nav-pill ${tab === 'overview' ? 'active' : ''}">Overview</span>
    <span class="nav-pill ${tab === 'todos' ? 'active' : ''}">Quests</span>
    <span class="nav-pill ${tab === 'reminders' ? 'active' : ''}">Mailbox</span>
    <span class="nav-pill ${tab === 'deadlines' ? 'active' : ''}">Board</span>
    <span class="nav-pill ${tab === 'debts' ? 'active' : ''}">Ledger</span>
    <span class="nav-pill ${tab === 'dates' ? 'active' : ''}">Festivals</span>
    <span class="nav-pill ${tab === 'watchlist' ? 'active' : ''}">Library</span>
    <span class="nav-pill ${tab === 'audit' ? 'active' : ''}">Archive</span>
  </div>

  <!-- Chapter Scene -->
  <div class="chapter-card">
    ${renderSceneContent(tab)}
  </div>
</body>
</html>`;
}

function renderSceneContent(tab) {
  switch (tab) {
    case 'todos':
      return `
        <div class="story-bubble">
          <div class="avatar">👨‍🌾</div>
          <div>
            <div style="font-weight:800; color:#8fc45a; font-size:14px;">Pip • Homestead Farmer</div>
            <div style="font-style:italic; font-size:13px; color:#f4e4bc; margin-top:2px;">
              “The morning sun breaks over the farmstead. Water the parsnips, mend the fences, and cross off today’s chores!”
            </div>
          </div>
        </div>
        <h3 style="color:#f2c230; margin-bottom:12px;">Chapter 1: The Farmhouse Mornings (4 items)</h3>
        ${SAMPLE_DATA.todos.map(t => `
          <div class="data-card">
            <div>
              <div style="font-weight:700; ${t.done ? 'text-decoration:line-through; opacity:0.6;' : ''}">${t.done ? '🌾' : '🌱'} ${t.title}</div>
              <div style="font-size:11px; color:#6d5543; margin-top:2px;">Due: ${t.due}</div>
            </div>
            <span class="badge ${t.priority === 'high' ? 'badge-urgent' : 'badge-normal'}">${t.priority}</span>
          </div>
        `).join('')}
      `;

    case 'reminders':
      return `
        <div class="story-bubble">
          <div class="avatar">🦉</div>
          <div>
            <div style="font-weight:800; color:#4f9bd1; font-size:14px;">Hoot • Clock Tower Keeper</div>
            <div style="font-style:italic; font-size:13px; color:#f4e4bc; margin-top:2px;">
              “Hoo-hoo! The village bell tower stands tall. Each hanging bell marks a promised hour!”
            </div>
          </div>
        </div>
        <h3 style="color:#f2c230; margin-bottom:12px;">Chapter 2: The Bell Tower Garland (3 alerts)</h3>
        ${SAMPLE_DATA.reminders.map(r => `
          <div class="data-card">
            <div>
              <div style="font-weight:700;">🔔 ${r.title}</div>
              <div style="font-size:11px; color:#6d5543; margin-top:2px;">Remind At: ${r.time}</div>
            </div>
            <span class="badge ${r.status === 'upcoming' ? 'badge-normal' : 'badge-urgent'}">${r.status}</span>
          </div>
        `).join('')}
      `;

    case 'deadlines':
      return `
        <div class="story-bubble">
          <div class="avatar">🐇</div>
          <div>
            <div style="font-weight:800; color:#c2415a; font-size:14px;">Marigold • Notice Board Keeper</div>
            <div style="font-style:italic; font-size:13px; color:#f4e4bc; margin-top:2px;">
              “Welcome to the Village Notice Board! Every deadline is a crop in the countdown field.”
            </div>
          </div>
        </div>
        <h3 style="color:#f2c230; margin-bottom:12px;">Chapter 3: The Harvest Countdown Board (3 items)</h3>
        ${SAMPLE_DATA.deadlines.map(d => `
          <div class="data-card">
            <div>
              <div style="font-weight:700;">📌 ${d.title}</div>
              <div style="font-size:11px; color:#6d5543; margin-top:2px;">Date: ${d.date} • [${d.cat}]</div>
            </div>
            <span class="badge ${d.countdown.includes('Overdue') ? 'badge-urgent' : 'badge-normal'}">${d.countdown}</span>
          </div>
        `).join('')}
      `;

    case 'debts':
      return `
        <div class="story-bubble">
          <div class="avatar">🦡</div>
          <div>
            <div style="font-weight:800; color:#f2c230; font-size:14px;">Bram • Ledger Badger</div>
            <div style="font-style:italic; font-size:13px; color:#f4e4bc; margin-top:2px;">
              “Step inside the oak trading post! The brass balance scales never lie. Clear accounts make steadfast friends.”
            </div>
          </div>
        </div>
        <h3 style="color:#f2c230; margin-bottom:12px;">Chapter 4: The Ledger Hut (3 records)</h3>
        ${SAMPLE_DATA.debts.map(d => `
          <div class="data-card">
            <div>
              <div style="font-weight:700;">⚖️ ${d.person}: ${d.dir === 'owed_to_me' ? 'owes you' : 'you owe'} ₹${d.amount}g</div>
              <div style="font-size:11px; color:#6d5543; margin-top:2px;">Note: ${d.note}</div>
            </div>
            <span class="badge ${d.settled ? 'badge-normal' : 'badge-urgent'}">${d.settled ? 'SETTLED' : 'ACTIVE'}</span>
          </div>
        `).join('')}
      `;

    case 'dates':
      return `
        <div class="story-bubble">
          <div class="avatar">🐐</div>
          <div>
            <div style="font-weight:800; color:#ec4899; font-size:14px;">Clover • Village Elder & Gardener</div>
            <div style="font-style:italic; font-size:13px; color:#f4e4bc; margin-top:2px;">
              “Dearie, look at our village festival calendar! Every celebration draws our valley family closer together.”
            </div>
          </div>
        </div>
        <h3 style="color:#f2c230; margin-bottom:12px;">Chapter 5: The Festival Grounds (3 events)</h3>
        ${SAMPLE_DATA.dates.map(d => `
          <div class="data-card">
            <div>
              <div style="font-weight:700;">🌸 ${d.title}</div>
              <div style="font-size:11px; color:#6d5543; margin-top:2px;">Date: ${d.date}</div>
            </div>
            <span class="badge badge-normal">${d.days}</span>
          </div>
        `).join('')}
      `;

    case 'watchlist':
      return `
        <div class="story-bubble">
          <div class="avatar">🦊</div>
          <div>
            <div style="font-weight:800; color:#9333ea; font-size:14px;">Juniper • Projectionist Fox</div>
            <div style="font-style:italic; font-size:13px; color:#f4e4bc; margin-top:2px;">
              “Welcome to the open-air cinema under the stars! What story shall we project on the big screen tonight?”
            </div>
          </div>
        </div>
        <h3 style="color:#f2c230; margin-bottom:12px;">Chapter 6: The Moonlight Cinema (3 items)</h3>
        ${SAMPLE_DATA.watchlist.map(w => `
          <div class="data-card">
            <div>
              <div style="font-weight:700;">🎞️ ${w.title} [${w.type}]</div>
              <div style="font-size:11px; color:#6d5543; margin-top:2px;">Notes: ${w.notes} ${w.rating ? '• Rating: ' + w.rating : ''}</div>
            </div>
            <span class="badge badge-normal">${w.status}</span>
          </div>
        `).join('')}
      `;

    case 'audit':
      return `
        <div class="story-bubble">
          <div class="avatar">🐢</div>
          <div>
            <div style="font-weight:800; color:#5e9440; font-size:14px;">Moss • Archivist Turtle</div>
            <div style="font-style:italic; font-size:13px; color:#f4e4bc; margin-top:2px;">
              “Step softly. In this cellar, the records of Pixel Valley are inscribed into eternal volumes. History is never erased.”
            </div>
          </div>
        </div>
        <h3 style="color:#f2c230; margin-bottom:12px;">Chapter 7: The Archive Cellar (4 entries)</h3>
        ${SAMPLE_DATA.audit.map(a => `
          <div class="data-card">
            <div>
              <div style="font-weight:700;">📜 [${a.action}] ${a.desc}</div>
              <div style="font-size:11px; color:#6d5543; margin-top:2px;">Recorded: ${a.time} • Module: ${a.module}</div>
            </div>
            <span class="badge ${a.src === 'whatsapp' ? 'badge-whatsapp' : 'badge-normal'}">${a.src === 'whatsapp' ? '🕊️ WhatsApp' : '🪶 Web'}</span>
          </div>
        `).join('')}
      `;

    case 'overview':
    default:
      return `
        <div style="text-align:center; padding:20px;">
          <h2 style="color:#f2c230; margin-top:0;">🌾 Welcome to Pixel Valley</h2>
          <p style="color:#f4e4bc; max-width:600px; margin:0 auto 20px auto;">
            The village is quiet and prosperous in Dev Sandbox Mode. All chapter landmarks are standing ready.
          </p>
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:12px; margin-top:20px;">
            <div class="data-card" style="display:block; text-align:center;">
              <div style="font-size:24px;">👨‍🌾</div>
              <div style="font-weight:800; margin-top:6px;">4 Quests</div>
              <div style="font-size:11px; color:#6d5543;">Farmhouse Porch</div>
            </div>
            <div class="data-card" style="display:block; text-align:center;">
              <div style="font-size:24px;">🦉</div>
              <div style="font-weight:800; margin-top:6px;">3 Bells</div>
              <div style="font-size:11px; color:#6d5543;">The Bell Tower</div>
            </div>
            <div class="data-card" style="display:block; text-align:center;">
              <div style="font-size:24px;">⚖️</div>
              <div style="font-weight:800; margin-top:6px;">+₹1,580g Gold</div>
              <div style="font-size:11px; color:#6d5543;">The Ledger Hut</div>
            </div>
            <div class="data-card" style="display:block; text-align:center;">
              <div style="font-size:24px;">🐇</div>
              <div style="font-weight:800; margin-top:6px;">3 Due Dates</div>
              <div style="font-size:11px; color:#6d5543;">Harvest Calendar</div>
            </div>
          </div>
        </div>
      `;
  }
}

async function run() {
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost:4124');
    const tab = url.searchParams.get('tab') || 'overview';
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(generateHtml(tab));
  });

  await new Promise((resolve) => server.listen(4124, resolve));
  console.log('Capture server running on port 4124');

  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  const tabs = ['overview', 'todos', 'reminders', 'deadlines', 'debts', 'dates', 'watchlist', 'audit'];

  for (const tab of tabs) {
    // Desktop screenshot (1280x800)
    await page.setViewport({ width: 1280, height: 800 });
    await page.goto(`http://localhost:4124/?tab=${tab}`, { waitUntil: 'load' });
    const desktopTarget = path.join(OUT_DIR, `${tab}-desktop.png`);
    await page.screenshot({ path: desktopTarget });
    console.log(`Saved: ${tab}-desktop.png`);

    // Mobile screenshot (390x844)
    await page.setViewport({ width: 390, height: 844 });
    await page.goto(`http://localhost:4124/?tab=${tab}`, { waitUntil: 'load' });
    const mobileTarget = path.join(OUT_DIR, `${tab}-mobile.png`);
    await page.screenshot({ path: mobileTarget });
    console.log(`Saved: ${tab}-mobile.png`);
  }

  await browser.close();
  server.close();
  console.log('✅ All before-screenshots captured successfully!');
  process.exit(0);
}

run().catch((err) => {
  console.error('Capture failed:', err);
  process.exit(1);
});
