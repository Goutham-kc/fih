# "Pixel Valley" Redesign Plan (Phase 0)

> **Document Status:** Complete & Ready for Review  
> **Target Branch:** `pixel-valley-redesign`  
> **Protection Authority:** Section 0.5 of `stardew-redesign-spec.md` (Overrides all aesthetic and architectural decisions)

---

## 1. Stack & Architecture Discovered

| Layer | Discovered Technology | Details & Notes |
| :--- | :--- | :--- |
| **Framework** | **Next.js 16.2.12** (Pages Router) | `pages/index.js`, `pages/_app.js`, `pages/_document.js`, `pages/login.js`, `pages/switch-mode.js`. React 19.2.4. |
| **Routing** | Page + Query Parameter State | The single dashboard page `pages/index.js` manages active tab state via `useState` and synchronizes shallow query params (`/?tab=todos`, `/?tab=debts`, etc.). Deep links and back/forward navigation work via `router.replace({ query: { tab } }, undefined, { shallow: true })`. |
| **State Management** | Local React Hooks & Native Fetch | No external global state store (no Redux, Zustand, or MobX). Each view component (`TodoList`, `DebtTracker`, etc.) fetches its own data on mount via native `fetch('/api/...')` and manages local React state (`useState`, `useEffect`). |
| **Styling Approach** | Global CSS + Design Tokens | `styles/globals.css` with CSS custom properties (`--bg-dark`, `--accent-primary`, etc.). Components use a combination of utility classes (`.fih-card`, `.btn`) and inline styles. Dark/Light mode is controlled via `data-theme` on `<html>` and managed via `lib/theme.js`. |
| **API Client** | Native Browser Fetch | Standard REST calls to Next.js API endpoints (`/api/todos`, `/api/debts`, `/api/reminders`, `/api/deadlines`, `/api/dates`, `/api/watchlist`, `/api/audit-logs`, `/api/user/settings`). |
| **WhatsApp Integration** | Webhook + Shared Database | `pages/api/whatsapp/webhook.js` processes inbound WhatsApp messages, executes commands via NLP (`lib/naturalParser.js`, `lib/commandParser.js`), and writes directly to MongoDB collections (`Todo`, `Debt`, etc.). Each action logs an entry in `AuditLog`. The frontend displays these entries in `AuditLogView.jsx`. |
| **Database & Models** | MongoDB via Mongoose 9.8 | Models: `User`, `Todo`, `Debt`, `Deadline`, `Reminder`, `ImportantDate`, `WatchlistItem`, `AuditLog`, `ProcessedMessage`. |
| **Testing Infrastructure** | Zero Automated Test Runners | `package.json` contains only `dev`, `build`, `start`, `lint`. No Jest, Vitest, Cypress, or Playwright configured. |

---

## 2. Baseline Verification Results

1. **Production Build (`npm run build`):**
   - **Status:** **PASS** (Compiled successfully in 1,583ms via Next.js Turbopack).
   - All static pages (`/`, `/404`, `/login`, `/switch-mode`) and 21 API routes generated without error.
2. **ESLint (`npm run lint`):**
   - **Status:** **21 pre-existing warnings/errors** in existing code (e.g. Next.js 16 / React 19 rules against `setState` in `useEffect` in `AuditLogView.jsx`, `DeadlineBoard.jsx`, `DebtTracker.jsx`, etc., and `Date.now()` purity warnings).
   - *Action per Section 0.5 Rule 4:* Pre-existing logic and lint issues will **not** be refactored or broken. They are logged here as baseline.

---

## 3. Mapping of Current Features to the Six Chapters

| # | Current Feature / Tab | Spec Chapter & Title | Village Location | Resident Character | Themed Props & Visual Manifestation |
| :---: | :--- | :--- | :--- | :--- | :--- |
| **1** | **To-do List** (`todos`) | **Chapter 1: The Farmhouse Mornings** | Farmhouse porch & garden | **Pip** (the farmer protagonist) | Tilled soil plots, seed packets for open tasks, watering can, basket for completed tasks. Toggle between Garden Plot View & Parchment Checklist View. |
| **2** | **Reminders** (`reminders`) | **Chapter 2: The Bell Tower** | Village Bell Tower | **Hoot** (the clock tower owl) | Hanging bell garland along the tower, next reminder clock face, silent bells drawer for past history, bell ring / letter drop animations. |
| **3** | **Deadlines** (`deadlines`) | **Chapter 3: The Harvest Calendar** | Wooden bulletin & countdown field | **Marigold** (the market rabbit) | Pinned wooden notice board, crops that ripen as due date approaches, withered crops with crows for overdue items, harvest stamp on completion. |
| **4** | **Debts** (`debts`) | **Chapter 4: The Ledger Hut** | Bank hut & trading post | **Bram** (the ledger badger) | Brass balance scale tipping proportionally to net balance, coin sacks, wax seal stamps on settled debts, orchard growth tracking payoff progress. |
| **5** | **Watchlist** (`watchlist`) | **Chapter 5: The Moonlight Cinema** | Open-air night cinema | **Juniper** (the fox projectionist) | Permanent twilight/night setting, projector beam with moths/fireflies, film reels and ticket stubs for Planned/In-Progress/Watched. "Surprise me" reel shuffle. |
| **6** | **Audit Log** (`audit`) | **Chapter 6: The Archive Cellar** | Underground archive cellar | **Moss** (the archivist turtle) | Cobblestone cellar, shelves of glowing books and scrolls, quill vs messenger-bird stamps for web vs WhatsApp origin, dense searchable parchment table. Read-only. |
| **+** | **Overview / Dashboard** | **The Village Square** | Village square & fountain | All characters mingling | Central bulletin board with live summary plaques for all 6 chapters, winding cobblestone path to landmarks. |
| **+** | **Important Dates** (`dates`) | **The Festival Grounds** | Village gazebo & festival meadow | **Evelyn** & villagers | Seasonal calendar garland, party bunting, birthday gift boxes, festival milestone countdowns. |
| **+** | **Settings** (`settings`) | **The Toolshed** | Rustic workshop | **Robin** | Wooden workbench, switches for audio levels (SFX/Ambience/Music), Weather override, Season/Hemisphere, Display toggles (Scene vs List), reduced motion override. |

---

## 4. Codebase vs. Spec Discrepancies & Deviations

1. **Debts Model (`models/Debt.js`):**
   - *Spec Mention:* Mentions `due date` on debt items.
   - *Code Reality:* The `Debt` model contains only `person`, `amount`, `direction` (`i_owe` | `owed_to_me`), `note`, and `settled` (boolean). There is **no due date** field.
   - *Resolution:* Follow existing code. Debts will display counterparty, amount, direction, note, and settled status without fabricating a due date.
2. **To-Do Ordering (`models/Todo.js`):**
   - *Spec Mention:* Suggests dragging to reorder plots if supported.
   - *Code Reality:* The database has no `order` or `rank` field; tasks are sorted by due date and priority (`high` $\rightarrow$ `medium` $\rightarrow$ `low`).
   - *Resolution:* Follow existing code. Keep sorting predictable and reliable based on real fields; provide visual priority badges and filter toggles.
3. **Audit Log Source Identification (`models/AuditLog.js`):**
   - *Spec Mention:* Mentions an `actor` or `channel` field for WhatsApp vs Web badges.
   - *Code Reality:* `AuditLog` stores `action`, `module`, `description`, `timestamp`, `environmentMode`.
   - *Resolution:* Safely derive source from description text (e.g. `description.includes('via WhatsApp')` $\rightarrow$ Messenger Bird badge, otherwise $\rightarrow$ Quill badge).
4. **Real-time WhatsApp Synchronization:**
   - *Spec Mention:* Section 9.1 suggests SSE or WebSockets if available, otherwise gentle polling or window focus refetching.
   - *Code Reality:* No WebSocket or SSE server is implemented.
   - *Resolution:* Implement non-invasive frontend window focus refetch (`window.addEventListener('focus', ...)`) plus a gentle 30-second interval poll in the background. Zero backend changes required.

---

## 5. Files Expected to be Touched / Created

### New Files to Create (Pure Presentation Layer):
- `ASSETS_LICENSES.md`: Attribution record for all fonts, sound synthesizers, and pixel assets (OFL, CC0, MIT).
- `content/dialogue.js`: Structured dialogue tables for all 6 characters + Wren across all situations.
- `content/milestones.js`: Village growth formulas and keepsake definitions derived from existing data.
- `lib/pixelValleyTheme.js`: Unified 32-color palette tokens, pixel scaling rules, and theme helpers.
- `lib/eventBus.js`: Central typed pub/sub event bus decoupling components from animations.
- `lib/soundManager.js`: Enhanced Web Audio synthesizer / audio manager with independent channel volumes.
- `components/ui/WoodPanel.jsx`: 9-slice styled wooden panel with parchment canvas.
- `components/ui/PixelButton.jsx`: Accessible 3-state tactile pixel button.
- `components/ui/SpeechBubble.jsx`: RPG-style typewriter dialogue balloon with ARIA live announcements.
- `components/ui/PixelToast.jsx`: Wren messenger bird drop toast.
- `components/world/VillageWorld.jsx`: Parallax continuous village backdrop and camera pan coordinator.
- `components/world/WeatherEngine.jsx`: Day/night gradient sky + Open-Meteo / date-seeded weather layer.
- `components/characters/PixelSprite.jsx`: Sprite animator with integer-scaled frames and state machine.
- `components/chapters/FarmhouseChapter.jsx`: Chapter 1 (To-do) scene wrapper.
- `components/chapters/BellTowerChapter.jsx`: Chapter 2 (Reminders) scene wrapper.
- `components/chapters/HarvestCalendarChapter.jsx`: Chapter 3 (Deadlines) scene wrapper.
- `components/chapters/LedgerHutChapter.jsx`: Chapter 4 (Debts) scene wrapper.
- `components/chapters/MoonlightCinemaChapter.jsx`: Chapter 5 (Watchlist) scene wrapper.
- `components/chapters/ArchiveCellarChapter.jsx`: Chapter 6 (Audit log) scene wrapper.
- `components/chapters/VillageSquareChapter.jsx`: Overview landing scene.
- `components/chapters/FestivalChapter.jsx`: Important dates scene.
- `components/chapters/ToolshedChapter.jsx`: Settings & preferences scene.

### Existing Files Expected to be Restyled / Wrapped:
- `pages/index.js`: Replace layout shell with `VillageWorld` shell, HUD bar, and chapter transitions.
- `components/TodoList.jsx`: Restyled with `FarmhouseChapter` garden plot + list views; preserve all handler logic.
- `components/ReminderBoard.jsx`: Restyled with `BellTowerChapter` bell garland; preserve all handler logic.
- `components/DeadlineBoard.jsx`: Restyled with `HarvestCalendarChapter` ripening crops; preserve all handler logic.
- `components/DebtTracker.jsx`: Restyled with `LedgerHutChapter` balance scales & coin sacks; preserve all handler logic.
- `components/Watchlist.jsx`: Restyled with `MoonlightCinemaChapter` night reels; preserve all handler logic.
- `components/AuditLogView.jsx`: Restyled with `ArchiveCellarChapter` books & dense parchment table; preserve all handler logic.
- `components/ImportantDates.jsx`: Restyled with `FestivalChapter` calendar garland; preserve all handler logic.
- `components/SettingsView.jsx`: Restyled with `ToolshedChapter` workbench; preserve all handler logic.
- `styles/globals.css`: Integrate pixel-art tokens, integer scaling utilities, and font definitions.

### STRICTLY PROTECTED FILES (Will NOT be touched):
- `pages/api/**` (all API routes and handlers)
- `models/**` (all Mongoose schemas and models)
- `lib/db.js`, `lib/auth.js`, `lib/audit.js`, `lib/commandParser.js`, `lib/naturalParser.js`, `lib/pendingIntent.js`, `lib/whatsapp.js`
- Environment variables & deployment configurations

---

## 6. Risks to Business Logic & Mitigation Strategy

| Risk | Potential Impact | Mitigation Strategy |
| :--- | :--- | :--- |
| **Accidental API/Schema Break** | Backend errors, failed WhatsApp parsing | Keep all existing API calls identical. Do not alter request bodies, HTTP methods, or model imports. Wrap UI around existing components. |
| **Number & Balance Display Distortion** | User misinterprets money owed or deadline due date | Display all figures (₹ amounts, countdown dates, task counts) in plain, unambiguous text on parchment panels alongside visual metaphors. |
| **Performance Degradation from Pixel Animations** | Dropped frames on mobile devices | Use CSS `steps()` for sprite frames, CSS `transform`/`opacity` only, limit particle counts (max 20 on desktop, max 10 on mobile), pause loops when tab hidden via `document.hidden`. |
| **Accessibility Regression** | Unusable with screen reader or keyboard | Provide direct "List View" fallback for every chapter. Maintain native `<button>`, `<input>`, semantic labels, and `aria-live="polite"` for dialogue. Full keyboard tab order and visible gold focus rings. |
| **WhatsApp Bot Interference** | Bot fails to process incoming WhatsApp messages | Zero code changes to `webhook.js` or `whatsapp.js`. The web app only *reads* from the existing database. |

---

## 7. Manual Smoke-Test Checklist (Run at Every Phase)

### Core Dashboard & Navigation:
- [ ] Load `http://localhost:3000` — Dashboard renders without console errors.
- [ ] Navigate to each chapter via village path and mobile bar (`todos`, `reminders`, `deadlines`, `debts`, `dates`, `watchlist`, `audit`, `settings`).
- [ ] Direct URL deep links work (`/?tab=debts`, `/?tab=reminders`, etc.).
- [ ] Browser back and forward buttons update active chapter smoothly.

### Chapter 1: To-dos (Farmhouse Mornings)
- [ ] Add a new task with title and due date $\rightarrow$ appears in list.
- [ ] Toggle task completion $\rightarrow$ marks complete, confetti/chime plays, increments completed count.
- [ ] Delete a task $\rightarrow$ removed from list.
- [ ] Filter by priority (`high`, `medium`, `low`, `all`) $\rightarrow$ filters open tasks correctly.

### Chapter 2: Reminders (Bell Tower)
- [ ] Add a new reminder with title and future datetime $\rightarrow$ appears in upcoming list.
- [ ] Toggle sent status $\rightarrow$ moves between Upcoming and Sent/Past tabs.
- [ ] Delete a reminder $\rightarrow$ removed from list.

### Chapter 3: Deadlines (Harvest Calendar)
- [ ] Add a deadline with title, category, and date $\rightarrow$ appears on board with countdown.
- [ ] Filter by category (`academic`, `internship`, `personal`) $\rightarrow$ updates display.
- [ ] Delete a deadline $\rightarrow$ removed from board.

### Chapter 4: Debts (Ledger Hut)
- [ ] Add a debt record (I owe / Owed to me) $\rightarrow$ updates totals and ledger correctly.
- [ ] Settle a single debt $\rightarrow$ marked settled, updates net position.
- [ ] Settle all debts for a person $\rightarrow$ marks all settled with celebration.
- [ ] Net position calculation exactly matches pre-redesign values.

### Chapter 5: Watchlist (Moonlight Cinema)
- [ ] Add movie/show/book title $\rightarrow$ appears under Planned.
- [ ] Change status to In Progress and Done $\rightarrow$ moves between shelves.
- [ ] Rate a completed title $\rightarrow$ saves rating correctly.
- [ ] Delete a watchlist item $\rightarrow$ removed from list.

### Chapter 6: Audit Log (Archive Cellar)
- [ ] Open Audit Log $\rightarrow$ displays historical actions in chronological order.
- [ ] Verify WhatsApp entries carry messenger-bird stamp and web entries carry quill stamp.
- [ ] Confirm strictly read-only: no edit or delete controls exist.

### Settings & Mode Switch (The Toolshed)
- [ ] Toggle environment mode (Live $\leftrightarrow$ Dev) via password link $\rightarrow$ switches sandbox cleanly.
- [ ] Toggle sound and adjust volume sliders $\rightarrow$ persists preference in `localStorage`.
- [ ] Toggle reduced motion $\rightarrow$ turns off camera pans and weather particles.

### WhatsApp Bot Live Integration:
- [ ] Send WhatsApp test command (e.g. `>todo Water crops` or `>help`) $\rightarrow$ receives valid response from bot.
- [ ] Confirm item created via WhatsApp appears on website upon window focus / refresh.

---

## 8. Baseline Build Command

```bash
npm run build
```
*Current result: 0 errors, static pages & 21 API routes generated successfully.*
