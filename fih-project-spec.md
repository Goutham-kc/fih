# fih — Personal Life Dashboard with WhatsApp Integration

A single-user (or small multi-user) web app to track to-dos, debts, deadlines, important dates, and a watchlist — fully usable from a browser (desktop + mobile) and from WhatsApp, hosted 24/7 on free-tier infrastructure at $0/month.

---

## Table of Contents
1. Overview & Goals
2. Core Features (detailed specs)
3. WhatsApp Command Grammar (full reference)
4. Data Models (Mongoose schemas, full validators)
5. API Route Reference (every endpoint, request/response shapes)
6. Architecture & Tech Stack
7. WhatsApp Integration (webhook, signature verification, parsing, clarification flow)
8. Reminder Scheduling System
9. Authentication
10. Free Hosting Plan (account setup, limits)
11. Folder Structure
12. Environment Variables
13. Deployment Steps (step-by-step)
14. Security Considerations
15. Testing Strategy
16. Future Enhancements

---

## 1. Overview & Goals

| Aspect | Decision | Reasoning |
|---|---|---|
| Frontend | React (via Next.js) | Matches your existing JS/React comfort |
| Backend | Next.js API routes (Node.js) | One deployable unit → simpler free hosting than separate Express server |
| Database | MongoDB Atlas (free M0 cluster) | Matches your MERN experience (OAQ, rental system), always-on, free forever |
| Auth | JWT in httpOnly cookie | Simple, no third-party auth provider needed for 1–few users |
| WhatsApp | Meta WhatsApp Cloud API | Free indefinitely for up to 5 whitelisted numbers, no sandbox re-join requirement (unlike Twilio) |
| Scheduling | GitHub Actions cron | Free, reliable, no server needed to "stay awake" |
| Hosting | Vercel (Hobby tier) | Always-on for HTTP requests, no sleep-on-inactivity problem |
| PWA | Web manifest + service worker | Installable on mobile home screen without an app store |

**Non-goals for v1:** multi-tenant user management, payment/billing, native mobile apps, offline-first sync. These can be added later if needed (see Section 16).

---

## 2. Core Features

### 2.1 To-Do List
**Fields:** `title` (required), `description` (optional), `dueDate` (optional, datetime), `priority` (`low` | `medium` | `high`, default `medium`), `status` (`open` | `done`, default `open`), `createdAt`, `completedAt`.

**Website behavior:**
- List view grouped by status (Open / Done), sortable by due date or priority.
- Inline "mark done" checkbox; completing a todo sets `completedAt` and moves it to the Done group.
- Overdue todos (dueDate in the past, status still open) are visually flagged (e.g. red badge).
- Edit-in-place for title/description/dueDate/priority.
- Delete with confirmation.

**WhatsApp behavior:**
- Add: `>todo Buy groceries` or with a due date: `>todo Buy groceries | 2026-08-01`
- Complete: `>done Buy groceries` (fuzzy-matches against open todo titles; if more than one match, bot lists them and asks which one by number)
- List: `>list todo` replies with all open todos, numbered, soonest-due first.

**Edge cases:**
- Empty title after `>todo` → treated as invalid command, triggers a clarification question ("What should the to-do say?").
- `>done` with no clear match → bot replies "I couldn't find an open to-do matching that. Try `>list todo` to see them."

### 2.2 Debts ("Owed To Me" / "I Owe")
**Fields:** `person` (required), `amount` (required, positive number), `currency` (default `INR`), `direction` (`i_owe` | `owed_to_me`, required), `note` (optional), `settled` (bool, default `false`), `settledDate`, `createdAt`.

**Website behavior:**
- Dashboard summary card: total you owe, total owed to you, net balance (color-coded green/red).
- Per-person breakdown table: name, net amount, direction, "settle" button.
- Settling marks all of that person's unsettled debts as `settled: true` (or lets you settle a specific entry).
- Filter by settled/unsettled, by person, by direction.

**WhatsApp behavior:**
- `>debt owe Rahul 500 lunch` → you owe Rahul ₹500, note "lunch"
- `>debt owed Priya 2000 rent` → Priya owes you ₹2000, note "rent"
- `>debt settle Rahul` → marks all unsettled "owe Rahul" entries as settled, replies with what was settled
- `>list debt` → replies with net balance per person

**Edge cases:**
- Non-numeric amount (`>debt owe Rahul five hundred`) → clarification: "How much do you owe Rahul? (please send a number)"
- `>debt settle` with a name that has no unsettled entries → "No unsettled debts found for that name."

### 2.3 Deadlines
**Fields:** `title` (required), `dueDate` (required, datetime), `category` (`academic` | `internship` | `personal`, default `personal`), `reminderOffsets` (array of minutes-before, default `[1440, 60]` = 1 day and 1 hour before), `remindersSent` (array tracking which offsets already fired), `createdAt`.

**Website behavior:**
- Calendar/list view sorted by due date.
- Color-coded by category.
- Countdown display ("in 2 days", "overdue by 3 hours").
- Editable reminder offsets per deadline (e.g. add a "1 week before" reminder).

**WhatsApp behavior:**
- `>deadline Submit 24CSP503 assignment | 2026-08-05 18:00`
- Optional category: `>deadline Submit assignment | 2026-08-05 18:00 | academic`

**Edge cases:**
- Missing date → clarification: "When is '<title>' due? (e.g. 2026-08-05 18:00)"
- Date in the past → bot warns but still allows it (in case you're backfilling records), asking "That date's in the past — add anyway? (yes/no)"

### 2.4 Important Dates
**Fields:** `title` (required), `date` (required — `MM-DD` if recurring, `YYYY-MM-DD` if one-time), `recurring` (`yearly` | `monthly` | `none`, default `none`), `notes` (optional), `createdAt`.

**Website behavior:**
- Upcoming list, sorted by next occurrence (recurring dates computed against the current year).
- "This week" / "This month" grouping.

**WhatsApp behavior:**
- `>date Mom's birthday | 09-14 | yearly`
- `>date Lease renewal | 2026-11-01` (defaults to one-time / `none`)

**Edge cases:**
- Ambiguous date format (`>date Mom's birthday | 14-09`) → clarification asking for MM-DD or YYYY-MM-DD explicitly, since day/month order is ambiguous.

### 2.5 Watchlist
**Fields:** `title` (required), `type` (`movie` | `show` | `anime` | `book` | `paper`, default `show`), `status` (`planned` | `in_progress` | `done`, default `planned`), `rating` (optional, 1–10), `notes` (optional), `createdAt`.

**Website behavior:**
- Kanban-style columns: Planned / In Progress / Done.
- Rating shown as stars once marked done.

**WhatsApp behavior:**
- `>watch The Expanse | show`
- `>watch The Expanse done 9` → marks as done with rating 9 (fuzzy title match, same pattern as `>done` for todos)

---

## 3. WhatsApp Command Grammar (Full Reference)

```
>todo <text> [| <due-date>]
>done <fuzzy-match text>
>debt owe <person> <amount> [note]
>debt owed <person> <amount> [note]
>debt settle <person>
>deadline <title> | <date> [time] [| category]
>date <title> | <MM-DD or YYYY-MM-DD> [| yearly|monthly]
>watch <title> [| type]
>watch <fuzzy-match text> done [rating]
>list <todo|debt|deadline|date|watch>
>help
cancel                          -- cancels any pending clarification question
<free text, when a question is pending>  -- answers the pending question
```

**Parsing pipeline for every inbound message:**
1. Strip leading/trailing whitespace.
2. Check for an active `PendingIntent` for this user → if found, treat as an answer (Section 7.4), skip steps 3+.
3. Check if the message starts with `>` → if not, and no pending intent, reply with a short nudge: "Commands start with `>` — try `>help` for the list."
4. Split off the first token (module name) and match against known modules using exact match, then fallback to Levenshtein distance ≤ 2 for a "did you mean" suggestion.
5. Route to the module-specific sub-parser (todo / debt / deadline / date / watch / done / list / help).
6. Sub-parser validates required fields; on missing/invalid fields, creates a `PendingIntent` and replies with a targeted question (Section 7.4) instead of failing silently.
7. On full success, persist to MongoDB and reply with a confirmation message summarizing what was saved.

---

## 4. Data Models (Mongoose, with validators)

```js
// models/User.js
const UserSchema = new Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  whatsappNumber: { type: String, required: true, unique: true }, // E.164 format, e.g. +9198xxxxxxx
  createdAt: { type: Date, default: Date.now }
});

// models/Todo.js
const TodoSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  dueDate: { type: Date, default: null },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  status: { type: String, enum: ['open', 'done'], default: 'open' },
  createdAt: { type: Date, default: Date.now },
  completedAt: { type: Date, default: null }
});

// models/Debt.js
const DebtSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  person: { type: String, required: true, trim: true },
  amount: { type: Number, required: true, min: 0.01 },
  currency: { type: String, default: 'INR' },
  direction: { type: String, enum: ['i_owe', 'owed_to_me'], required: true },
  note: { type: String, default: '' },
  settled: { type: Boolean, default: false },
  settledDate: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now }
});

// models/Deadline.js
const DeadlineSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true },
  dueDate: { type: Date, required: true },
  category: { type: String, enum: ['academic', 'internship', 'personal'], default: 'personal' },
  reminderOffsets: { type: [Number], default: [1440, 60] }, // minutes before dueDate
  remindersSent: { type: [Number], default: [] },
  createdAt: { type: Date, default: Date.now }
});

// models/ImportantDate.js
const ImportantDateSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true },
  date: { type: String, required: true }, // "MM-DD" or "YYYY-MM-DD"
  recurring: { type: String, enum: ['yearly', 'monthly', 'none'], default: 'none' },
  notes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

// models/WatchlistItem.js
const WatchlistItemSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true },
  type: { type: String, enum: ['movie', 'show', 'anime', 'book', 'paper'], default: 'show' },
  status: { type: String, enum: ['planned', 'in_progress', 'done'], default: 'planned' },
  rating: { type: Number, min: 1, max: 10, default: null },
  notes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

// models/PendingIntent.js
const PendingIntentSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  module: { type: String, required: true }, // e.g. "deadline"
  partialData: { type: Schema.Types.Mixed, default: {} },
  missingField: { type: String, required: true },
  question: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true, index: { expires: 0 } } // TTL index, auto-deletes
});
```

Note the `expires: 0` TTL index on `PendingIntent.expiresAt` — MongoDB will automatically delete expired pending intents in the background, so stale clarification questions never linger.

---

## 5. API Route Reference

All routes below live under `/api/` and require a valid auth cookie (Section 9) except the WhatsApp webhook and cron endpoint, which use their own verification.

### Todos
| Method | Path | Body | Response |
|---|---|---|---|
| GET | `/api/todos` | — | `{ todos: [...] }` |
| POST | `/api/todos` | `{ title, description?, dueDate?, priority? }` | `201 { todo }` |
| PATCH | `/api/todos/:id` | any subset of fields | `200 { todo }` |
| DELETE | `/api/todos/:id` | — | `204` |

### Debts
| Method | Path | Body | Response |
|---|---|---|---|
| GET | `/api/debts` | — | `{ debts: [...], summary: { totalOwe, totalOwed, net } }` |
| POST | `/api/debts` | `{ person, amount, direction, note? }` | `201 { debt }` |
| PATCH | `/api/debts/:id` | `{ settled: true }` etc. | `200 { debt }` |
| DELETE | `/api/debts/:id` | — | `204` |

### Deadlines
| Method | Path | Body | Response |
|---|---|---|---|
| GET | `/api/deadlines` | — | `{ deadlines: [...] }` |
| POST | `/api/deadlines` | `{ title, dueDate, category?, reminderOffsets? }` | `201 { deadline }` |
| PATCH | `/api/deadlines/:id` | any subset | `200 { deadline }` |
| DELETE | `/api/deadlines/:id` | — | `204` |

### Important Dates
| Method | Path | Body | Response |
|---|---|---|---|
| GET | `/api/dates` | — | `{ dates: [...] }` |
| POST | `/api/dates` | `{ title, date, recurring?, notes? }` | `201 { date }` |
| DELETE | `/api/dates/:id` | — | `204` |

### Watchlist
| Method | Path | Body | Response |
|---|---|---|---|
| GET | `/api/watchlist` | — | `{ items: [...] }` |
| POST | `/api/watchlist` | `{ title, type? }` | `201 { item }` |
| PATCH | `/api/watchlist/:id` | `{ status?, rating? }` | `200 { item }` |
| DELETE | `/api/watchlist/:id` | — | `204` |

### Auth
| Method | Path | Body | Response |
|---|---|---|---|
| POST | `/api/auth/login` | `{ email, password }` | `200`, sets httpOnly cookie |
| POST | `/api/auth/logout` | — | `200`, clears cookie |

### WhatsApp & Cron (special auth)
| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/whatsapp/webhook` | Meta verify token in query string | Webhook subscription handshake |
| POST | `/api/whatsapp/webhook` | Meta signature header (`X-Hub-Signature-256`) | Receives inbound WhatsApp messages |
| POST/GET | `/api/cron/reminders` | Shared secret in header or query | Triggered by GitHub Actions on a schedule |

All error responses follow `{ error: { message, code } }` with an appropriate HTTP status (400 validation, 401 unauthenticated, 404 not found, 500 server error).

---

## 6. Architecture & Tech Stack

```
+---------------------+        +----------------------------+
|   Browser (PWA)     |<------>|   Next.js on Vercel        |
| desktop + mobile     |  HTTPS |  - React frontend          |
+---------------------+        |  - /api/* route handlers   |
                                |  - JWT auth middleware     |
+---------------------+        |  - /api/whatsapp/webhook   |
|  WhatsApp (Meta      |<------>  - /api/cron/reminders     |
|  Cloud API)          |        +-------------+--------------+
+---------------------+                       |
                                               v
                                   +------------------------+
                                   |  MongoDB Atlas (M0)     |
                                   |  free 512MB cluster     |
                                   +------------------------+
        ^
        | triggers every N minutes (HTTP call with secret)
+--------------------+
| GitHub Actions cron |
| workflow            |
+--------------------+
```

**Alternative Stack (classic MERN, if you'd rather keep Express + Socket.io):**
- Frontend: React (Create React App or Vite) on Vercel/Netlify — free, static.
- Backend: Express app — needs an always-on host, since Render/Railway free tiers sleep after ~15 min idle. Best free option is an **Oracle Cloud "Always Free" VM** (genuinely always-on ARM instance) running Express via PM2.
- Real-time updates (Socket.io) become useful here if you want the website dashboard to live-update the instant a WhatsApp command lands, without a page refresh — something Next.js API routes alone don't give you for free (serverless functions don't hold open socket connections well). If live-updating UI matters more than minimal ops work, this alternative is worth it; otherwise Next.js + occasional polling/refresh is simpler to run for free.

---

## 7. WhatsApp Integration

### 7.1 Why Meta Cloud API over Twilio
Twilio's WhatsApp sandbox is free but requires re-joining every 72 hours of inactivity and is meant for testing, not indefinite personal use. Meta's Cloud API gives a free test phone number you control directly, with up to 5 whitelisted recipient numbers that can message it indefinitely, no business verification needed at this scale — a better fit for an always-on personal tool.

### 7.2 Webhook Setup (verification handshake)
Meta requires a GET verification step before it'll send you real messages:

```js
// pages/api/whatsapp/webhook.js
export default async function handler(req, res) {
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
      return res.status(200).send(challenge);
    }
    return res.status(403).end();
  }
  if (req.method === 'POST') {
    // signature check + message handling, see 7.3
  }
}
```

### 7.3 Signature Verification (security)
Every inbound POST from Meta includes an `X-Hub-Signature-256` header — an HMAC-SHA256 of the raw body, signed with your app secret. Verify it before trusting anything in the payload:

```js
import crypto from 'crypto';

function isValidSignature(rawBody, signatureHeader, appSecret) {
  const expected = 'sha256=' + crypto
    .createHmac('sha256', appSecret)
    .update(rawBody)
    .digest('hex');
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signatureHeader));
}
```

Reject the request (`403`) if the signature doesn't match — this stops anyone else from POSTing fake messages to your webhook.

### 7.4 Clarification Follow-ups (state machine)
WhatsApp messages arrive as one-off events, so a real back-and-forth needs a stored `PendingIntent` (Section 4) to bridge messages.

**Flow:**
1. Inbound message arrives → look up `PendingIntent` for this `userId` (matched by `whatsappNumber`).
2. **Pending intent exists:**
   - Merge the new message into `partialData` at the `missingField` key.
   - Re-run validation for the module.
   - Valid now → persist the full record, delete the `PendingIntent`, send a confirmation.
   - Still invalid → keep the `PendingIntent` (update its `question` if needed), re-ask.
   - Message is exactly `cancel` → delete the `PendingIntent`, reply "Cancelled."
3. **No pending intent → parse as a fresh command:**
   - Unknown module word → Levenshtein-suggest the closest known command, point to `>help`.
   - Known module, missing required field → create a `PendingIntent` with a specific question, reply with that question.
   - Known module, field present but fails validation (bad date format, non-numeric amount) → don't create a generic error; ask specifically what's wrong and what format is expected, and remember what was already parsed so you don't have to retype everything.
   - Fully valid → persist immediately, reply with a specific confirmation echoing back what was saved (so mistakes are visible immediately, e.g. "Added deadline: Submit report — due Aug 5, 6:00 PM (academic)").

**Example conversation:**
```
You:  >deadline Submit report
Bot:  When is 'Submit report' due? (e.g. 2026-08-05 18:00)
You:  aug 5
Bot:  I couldn't read that date — try YYYY-MM-DD or YYYY-MM-DD HH:MM.
You:  2026-08-05 18:00
Bot:  Added deadline: Submit report — due Aug 5, 6:00 PM (personal)
```

### 7.5 Fuzzy Matching for `>done` and "mark watched"
For commands that reference an existing item by text (`>done Buy groceries`, `>watch The Expanse done 9`), use a simple string-similarity match (e.g. Dice coefficient or Levenshtein ratio) against titles of open items for that user:
- Single confident match (similarity above a threshold, e.g. 0.6) → act on it directly.
- Multiple plausible matches → reply with a numbered list and create a `PendingIntent` expecting a number back ("Which one? 1) Buy groceries for party 2) Buy groceries for week").
- No match → "I couldn't find anything matching that. Try `>list todo` to see open items."

---

## 8. Reminder Scheduling System

### 8.1 GitHub Actions Workflow
```yaml
# .github/workflows/reminders.yml
name: Send Reminders
on:
  schedule:
    - cron: '*/15 * * * *'   # every 15 minutes
  workflow_dispatch: {}        # allows manual trigger too
jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger reminder check
        run: |
          curl -f -X POST "https://fih.vercel.app/api/cron/reminders" \
            -H "x-cron-secret: ${{ secrets.CRON_SECRET }}"
```
Note: GitHub Actions cron is "best effort" — under load, triggers can be delayed by a few minutes. That's acceptable here since reminders are for deadlines/todos, not split-second alerts.

### 8.2 Reminder Logic (`/api/cron/reminders`)
1. Verify the `x-cron-secret` header matches `process.env.CRON_SECRET`. Reject with `401` otherwise.
2. Query `Deadline` documents where `dueDate - now` matches one of `reminderOffsets` (within a tolerance window, e.g. ±10 minutes to account for the 15-minute cron interval) **and** that offset isn't already in `remindersSent`.
3. Query `Todo` documents with a `dueDate` in the near future and `status: 'open'` (e.g. remind once, 1 hour before).
4. Query `ImportantDate` documents where today's month/day matches `date` (handling `recurring: 'yearly'` by comparing only MM-DD; `recurring: 'monthly'` by comparing only DD).
5. For each match, call the WhatsApp Cloud API send-message endpoint, then update `remindersSent` (for deadlines) so the same reminder never fires twice.
6. Log a summary (count of reminders sent) for basic observability — visible in the GitHub Actions run log.

### 8.3 Message Templates
- Deadline reminder: `"Reminder: '<title>' is due in <human-readable time>."`
- Todo reminder: `"Reminder: '<title>' is due soon."`
- Important date: `"Today is <title>!"`

---

## 9. Authentication

- One (or a few) `User` records with bcrypt-hashed passwords — no need for OAuth/social login/password-reset flows for a personal tool, though they can be added later.
- `/api/auth/login` verifies email + password, issues a signed JWT, sets it as an httpOnly, `Secure`, `SameSite=Lax` cookie.
- A small `withAuth` middleware wraps every protected API route: verifies the JWT, attaches `req.userId`, returns `401` if missing/invalid/expired.
- Frontend: a simple login page; once logged in, the cookie is sent automatically on every request — no token management needed in React state.
- WhatsApp messages are matched to a `User` by the sender's phone number (`whatsappNumber` field), not by JWT — the webhook trusts Meta's signature (Section 7.3) instead.

```js
// lib/auth.js (sketch)
import jwt from 'jsonwebtoken';

export function signToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '30d' });
}

export function withAuth(handler) {
  return async (req, res) => {
    try {
      const token = req.cookies.token;
      const { userId } = jwt.verify(token, process.env.JWT_SECRET);
      req.userId = userId;
      return handler(req, res);
    } catch {
      return res.status(401).json({ error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } });
    }
  };
}
```

---

## 10. Free Hosting Plan — Account Setup & Limits

| Layer | Service | Free tier limit | Setup steps |
|---|---|---|---|
| Frontend + API | Vercel (Hobby) | Generous bandwidth/requests for personal scale | Sign up with GitHub → import repo → set env vars → deploy |
| Database | MongoDB Atlas M0 | 512MB storage, always on | Create free cluster → add DB user → whitelist `0.0.0.0/0` (or Vercel's IPs) → copy connection string |
| Scheduling | GitHub Actions | 2,000 free minutes/month (private repo), unlimited on public repos | Add `.github/workflows/reminders.yml`, add `CRON_SECRET` to repo secrets |
| WhatsApp | Meta Cloud API | Free tier conversations, 5 free test recipients | Create Meta Developer account → create an App → add WhatsApp product → get test number → add your number as a recipient → generate a permanent access token |
| Domain | `fih.vercel.app` | Free | Optional custom domain requires a paid registration later |

None of these require a credit card, and none sleep on inactivity — the common "free tier goes to sleep" problem (Render, Railway, Heroku free tiers) doesn't apply to this combination.

---

## 11. Folder Structure

```
fih/
├── pages/
│   ├── api/
│   │   ├── auth/login.js
│   │   ├── auth/logout.js
│   │   ├── todos/index.js
│   │   ├── todos/[id].js
│   │   ├── debts/index.js
│   │   ├── debts/[id].js
│   │   ├── deadlines/index.js
│   │   ├── deadlines/[id].js
│   │   ├── dates/index.js
│   │   ├── dates/[id].js
│   │   ├── watchlist/index.js
│   │   ├── watchlist/[id].js
│   │   ├── whatsapp/webhook.js
│   │   └── cron/reminders.js
│   ├── index.js            # dashboard
│   ├── login.js
├── components/
│   ├── TodoList.jsx
│   ├── DebtTracker.jsx
│   ├── DeadlineBoard.jsx
│   ├── ImportantDates.jsx
│   └── Watchlist.jsx
├── lib/
│   ├── db.js                 # mongoose connection (cached for serverless)
│   ├── auth.js                # jwt sign/verify + withAuth middleware
│   ├── whatsapp.js            # Cloud API send-message + signature verify helpers
│   ├── commandParser.js        # ">todo ..." grammar parser + Levenshtein "did you mean"
│   ├── pendingIntent.js        # conversation-state helpers (create/resolve/expire)
│   └── fuzzyMatch.js           # string similarity for >done / watch-done matching
├── models/
│   ├── User.js
│   ├── Todo.js
│   ├── Debt.js
│   ├── Deadline.js
│   ├── ImportantDate.js
│   ├── WatchlistItem.js
│   └── PendingIntent.js
├── public/
│   ├── manifest.json          # PWA manifest
│   └── icons/                 # app icons for home-screen install
└── .github/workflows/reminders.yml
```

---

## 12. Environment Variables

| Variable | Used by | Notes |
|---|---|---|
| `MONGODB_URI` | `lib/db.js` | Atlas connection string |
| `JWT_SECRET` | `lib/auth.js` | Random 32+ char string |
| `WHATSAPP_VERIFY_TOKEN` | webhook GET handshake | Any string you choose, set to match in Meta dashboard |
| `WHATSAPP_APP_SECRET` | signature verification | From Meta App dashboard |
| `WHATSAPP_ACCESS_TOKEN` | sending messages via Cloud API | Permanent token generated in Meta dashboard |
| `WHATSAPP_PHONE_NUMBER_ID` | sending messages | From Meta Cloud API test number setup |
| `CRON_SECRET` | `/api/cron/reminders` | Shared secret, also stored as a GitHub Actions repo secret |

All of these get set in Vercel's Project Settings → Environment Variables, and the relevant ones also as GitHub Actions repo secrets.

---

## 13. Deployment Steps (Step-by-Step)

1. **Scaffold**: `npx create-next-app fih`, add the folder structure above.
2. **Database**: create a MongoDB Atlas free cluster, add a DB user, whitelist all IPs (or Vercel's), copy the connection string into `MONGODB_URI`.
3. **Models**: implement all Mongoose schemas from Section 4, including the `PendingIntent` TTL index.
4. **Auth**: implement `/api/auth/login`, `withAuth` middleware, and a basic login page.
5. **CRUD routes**: implement all routes from Section 5 for todos/debts/deadlines/dates/watchlist.
6. **Dashboard UI**: build the React components, wire them to the CRUD routes.
7. **Meta setup**: create a Meta Developer account and App, add the WhatsApp product, note the test phone number ID, generate an access token, add your own number as a verified recipient.
8. **Webhook**: implement `/api/whatsapp/webhook` (GET handshake + POST handler with signature check), deploy, then register the webhook URL in the Meta dashboard and subscribe to the `messages` field.
9. **Command parser + PendingIntent flow**: implement `commandParser.js`, `pendingIntent.js`, `fuzzyMatch.js` per Sections 3 and 7.
10. **Reminders**: implement `/api/cron/reminders`, add `.github/workflows/reminders.yml`, add `CRON_SECRET` as both a Vercel env var and a GitHub Actions repo secret.
11. **PWA**: add `manifest.json` + icons so the site can be installed to a mobile home screen.
12. **Test end-to-end**: send test commands from WhatsApp, confirm reminders fire, confirm the dashboard reflects WhatsApp-added items and vice versa.
13. **Deploy**: push to GitHub, import into Vercel, set all environment variables, deploy.

---

## 14. Security Considerations

- **Webhook signature verification** (Section 7.3) is mandatory — without it, anyone who discovers your webhook URL could POST fake messages and write arbitrary data.
- **Cron secret**: the reminders endpoint must reject requests without the correct `x-cron-secret` header, or anyone could trigger duplicate reminder sends.
- **Rate limiting on login**: consider a basic attempt limit on `/api/auth/login` (e.g. lock out after 5 failed attempts for a few minutes) since it's internet-facing.
- **JWT expiry**: 30 days is convenient for a personal tool but means a stolen cookie is valid a while — shorten if you want tighter security, at the cost of logging in more often.
- **Environment variables**: never commit `.env.local` to git; use Vercel's environment variable UI and GitHub Actions secrets exclusively.
- **WhatsApp number spoofing**: Meta's payload includes the verified sender's WhatsApp ID, not something a client can fake, since it comes from Meta's own signed webhook — this is why signature verification (not just "check the phone number field") is the real security boundary.

---

## 15. Testing Strategy

- **Unit tests** (Jest) for `commandParser.js` — cover every command type, missing fields, malformed dates, unknown commands, Levenshtein suggestions.
- **Unit tests** for `fuzzyMatch.js` — confirm thresholds behave sensibly on close/ambiguous titles.
- **Integration tests** for API routes using an in-memory MongoDB (e.g. `mongodb-memory-server`) — CRUD correctness, auth rejection on missing/invalid cookies.
- **Manual end-to-end pass** before relying on it daily: send every command type from actual WhatsApp, confirm dashboard reflects changes, let a reminder cycle run naturally to confirm the cron path works, not just the parser.

---

## 16. Future Enhancements (optional, not required for v1)
- Shared debts between multiple registered users (auto-resolve "who owes whom" across a group).
- Analytics view (net debt over time, todo completion rate) via Recharts.
- Two-way WhatsApp interactive buttons (Meta Cloud API supports button/list message templates, avoiding free-text replies for simple confirmations).
- Web push notifications alongside WhatsApp.
- Socket.io live-updating dashboard (see Alternative Stack note in Section 6) if instant UI updates on WhatsApp-added items matter more than minimal hosting complexity.
- Voice-note parsing (Meta Cloud API can deliver audio messages; would need a transcription step before the command parser).
