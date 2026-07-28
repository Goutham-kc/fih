# FIH — AI Personal Life Assistant & WhatsApp Intent Engine 🤖✨

An intelligent personal productivity platform built with **Next.js 16**, **MongoDB**, **Tailwind CSS**, and **Meta WhatsApp Cloud API**.

FIH converts plain WhatsApp text messages, student group announcements, class timetables, forwarded emails, and financial IOUs into organized tasks, reminders, deadlines, debt balances, and watchlists — all with zero friction and smart natural language parsing.

---

## 🌟 Key Features

### 1. 🤖 WhatsApp Natural Language Processing (NLP) Engine
- **Zero-Friction Classification**: Automatically categorizes forwarded announcements, emails, class schedules, and informal text into To-dos, Reminders, Deadlines, Debts, or Watchlist items.
- **Smart Time & Slang Normalizer**: Recognizes chat abbreviations (`tmr`, `tmrw`, `2moro`, `b4`, `eval`, `pls`, `nxt wk`) and parses exact times (`4.10pm`, `10:30 am`, `6th hr`).
- **Plus/Minus Financial Shorthand**:
  - `Hanan +100` / `Hanan + 500 for dinner` → Records `Hanan owes you ₹500`
  - `Hanan -100` / `-50 Amir for coffee` → Records `You owe Amir ₹50`
- **Natural Language Queries**: Ask `"how much i owe Amir"`, `"show my debts sorted by person"`, `"list tasks by priority"`, or `"show my reminders"`.
- **Failsafe System**: Every action includes `(Wrong? Reply 'undo' to revert)` so you can undo any mistake in one tap.
- **Webhook Deduplication**: Built-in 24-hour TTL message deduplication (`ProcessedMessage`) to prevent Meta webhook retries from sending duplicate responses.

### 2. 📱 Modern Executive Web Dashboard
- **Responsive Dark Mode Dashboard**: Complete management UI for To-dos, Debt Ledger, Deadlines, Reminders, Important Dates, and Watchlist.
- **Reminders Board**: Real-time countdown badges (`In 15 mins`, `Overdue`), manual reminder creation, history tracking, and manual refresh controls.
- **Debt Ledger & Journal**: Complete ledger showing live balances (`Total I Owe`, `Total Owed to Me`, `Net Position`), plus a **Transaction Journal** to trace settled payments over time.
- **Visual Design**: Glassmorphic card layouts, glowing ring branding, and custom SVG favicons.

### 3. ⏰ Automated Notification Pipeline
- **Cron Worker (`/api/cron/reminders`)**: Automated worker that queries due reminders and deadlines, dispatching instant WhatsApp notifications to your phone.

---

## 🚀 WhatsApp Natural Language Commands & Examples

| Intent | Natural Language Example | Result |
| :--- | :--- | :--- |
| **Debt (+)** | `Hanan +100` or `Hanan owes me 500` | 💰 Records Hanan owes you ₹100 |
| **Debt (-)** | `Hanan -100` or `i owe Hanan 200` | 💰 Records you owe Hanan ₹100 |
| **Balance Query** | `how much i owe Amir` | 💰 Displays balance breakdown & net position with Amir |
| **Reminder** | `ticket book tmr` or `R5B tmr 3rd hr SE` | 🔔 Schedules reminder for tomorrow at 9:00 AM / period time |
| **Deadline** | `This Friday 2,3 hour srp project evaluation` | ⏳ Schedules Academic Deadline due Friday |
| **Multi-Item** | `R5B tomorrow 4th hr AWT, 5 th hr DAA` | 📌 Schedules multiple reminders simultaneously |
| **List Query** | `show my debts sorted by person` | 📋 Displays debts grouped by person |
| **Undo Failsafe**| Reply `undo` | ↩️ Instantly reverts last created entry |
| **Cancel Question**| Reply `cancel` | 🚫 Clears active pending prompt |

---

## 🛠️ Tech Stack & Architecture

- **Framework**: Next.js 16 (Pages Router, API Routes)
- **Database**: MongoDB with Mongoose Schema Models
- **Styling**: Tailwind CSS & Vanilla CSS Design System
- **Integration**: Meta WhatsApp Cloud API (Webhooks & Graph API v19.0)
- **Authentication**: JWT Cookie Sessions with bcryptjs password hashing
- **Deployment**: Vercel Serverless Functions

---

## 📁 Repository Structure

```
├── components/
│   ├── DebtTracker.jsx       # Debt Ledger, Summary Cards & Transaction Journal
│   ├── ReminderBoard.jsx     # Reminders management & countdown badges
│   └── Watchlist.jsx         # Watchlist management (Movies, Shows, Books)
├── lib/
│   ├── naturalParser.js      # Semantic Token NLP Engine & Text Normalizer
│   ├── commandParser.js      # Fast Levenshtein command parser (>command syntax)
│   ├── whatsapp.js           # WhatsApp Graph API integration & signature verifier
│   └── db.js                 # Mongoose cached connection pooling
├── models/
│   ├── Debt.js               # Debt & IOU Mongoose schema
│   ├── Reminder.js           # Reminder Mongoose schema
│   ├── Todo.js               # Task Mongoose schema
│   ├── Deadline.js           # Deadline Mongoose schema
│   ├── ProcessedMessage.js   # Webhook deduplication with 24-hr TTL index
│   └── PendingIntent.js      # Multi-step conversational state model
├── pages/
│   ├── api/                  # REST API endpoints & Webhook handlers
│   │   ├── whatsapp/webhook.js # WhatsApp Meta Webhook receiver
│   │   ├── cron/reminders.js   # Cron worker for WhatsApp alerts
│   │   ├── debts/            # Debt API handlers
│   │   └── reminders/        # Reminders API handlers
│   ├── index.js              # Main Dashboard Page
│   └── login.js              # Authentication Login Page
└── public/
    └── icon.svg              # Circular SVG Favicon
```

---

## ⚙️ Environment Variables Setup

Create a `.env.local` file in the root directory:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/fih
JWT_SECRET=your_jwt_secret_key

# WhatsApp Cloud API Credentials
WHATSAPP_ACCESS_TOKEN=your_whatsapp_permanent_access_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_APP_SECRET=your_facebook_app_secret
WHATSAPP_VERIFY_TOKEN=your_custom_webhook_verify_token
```

---

## 🚀 Development & Deployment

### Local Development:
```bash
npm install
npm run dev
```

### Production Deployment (Vercel):
```bash
git add .
git commit -m "feat: updates"
git push origin main
```
