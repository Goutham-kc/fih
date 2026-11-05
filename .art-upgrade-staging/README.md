# FIH — AI Personal Assistant & WhatsApp Companion

**FIH** is a self-hosted personal productivity platform and WhatsApp companion. It transforms everyday text messages, student group announcements, class timetables, forwarded emails, and financial IOUs into organized tasks, reminders, deadlines, debt ledgers, and watchlists — synced in real time with a modern web dashboard.

---

## 📑 Table of Contents

- [Features Overview](#-features-overview)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Quickstart & Setup](#-quickstart--setup)
  - [1. Clone the Repository](#1-clone-the-repository)
  - [2. Install Dependencies](#2-install-dependencies)
  - [3. Configure Environment Variables](#3-configure-environment-variables)
  - [4. Seed the Admin User](#4-seed-the-admin-user)
  - [5. Run the Application](#5-run-the-application)
- [WhatsApp Cloud API Configuration](#-whatsapp-cloud-api-configuration)
  - [Meta Developer Portal Setup](#meta-developer-portal-setup)
  - [Local Testing with Tunneling (ngrok)](#local-testing-with-tunneling-ngrok)
- [How to Use via WhatsApp](#-how-to-use-via-whatsapp)
  - [Greetings & Help](#greetings--help)
  - [To-Dos & Tasks](#to-dos--tasks)
  - [Reminders & Timetables](#reminders--timetables)
  - [Academic Deadlines & Projects](#academic-deadlines--projects)
  - [Debts & Financial IOUs](#debts--financial-ious)
  - [Announcements & Long Notices](#announcements--long-notices)
  - [Watchlist (Movies, Series, Books)](#watchlist-movies-series-books)
  - [Important Dates & Anniversaries](#important-dates--anniversaries)
  - [Failsafes, Undo & Control Commands](#failsafes-undo--control-commands)
- [How to Use the Web Dashboard](#-how-to-use-the-web-dashboard)
- [Automated Reminders & Cron Setup](#-automated-reminders--cron-setup)
- [Deployment (Vercel)](#-deployment-vercel)
- [Running Tests](#-running-tests)
- [License](#-license)

---

## 🚀 Features Overview

- **Natural Language Understanding (NLU)**: Conversational parser tailored for IST (`Asia/Kolkata`), handling slang (`tmr`, `bday`), relative times (`in 30 mins`, `tomorrow 3pm`), and ordinal days (`26th`).
- **WhatsApp Cloud API Integration**: Full bidirectional communication supporting text messages, interactive lists, button replies, and webhook signature verification (`X-Hub-Signature-256`).
- **Multi-Module Productivity**:
  - **Tasks & To-Dos**: Fast creation, priority levels, status tracking.
  - **Smart Reminders**: Automated WhatsApp alerts delivered at target times.
  - **Deadlines & Academic Tracker**: Due date countdowns, academic course registration, and lab evaluation tracking.
  - **Debt Ledger & IOUs**: Net balance calculation (`i_owe` vs `owed_to_me`), per-person filtering, transaction journal, and individual/bulk settlements.
  - **Media & Reading Watchlist**: Track movies, series, books, anime, and papers with rating badges.
  - **Important Dates**: Annual recurring reminders for birthdays and events.
- **Audit Log Timeline**: Complete immutable log tracking creations, completions, settlements, mode switches, and automated notifications.
- **Dual Environment Modes (`Live` vs `Development`)**: Safely test commands and changes in an isolated development sandbox, with password-authenticated mode switching.

---

## 🛠 Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (Pages Router)
- **UI & Components**: [React](https://react.dev/), Tailwind-style CSS Modules
- **Database**: [MongoDB](https://www.mongodb.com/) via [Mongoose](https://mongoosejs.com/)
- **Natural Language Parsing**: [chrono-node](https://github.com/wanasit/chrono-node), [fastest-levenshtein](https://github.com/ka-weihe/fastest-levenshtein), and custom rule-based intent extractors
- **Authentication**: JWT, HTTP-only Cookies, Bcrypt password hashing
- **Messaging API**: [Meta WhatsApp Business Cloud API](https://developers.facebook.com/docs/whatsapp/cloud-api)

---

## 📋 Prerequisites

Before setting up FIH, make sure you have:

1. **Node.js**: v18.17.0 or newer (v20+ recommended).
2. **MongoDB**: A running instance (local MongoDB server or free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster).
3. **Meta Developer Account**: Access to [Meta for Developers](https://developers.facebook.com/) to configure WhatsApp Cloud API.
4. **Tunneling Tool (for local development)**: [ngrok](https://ngrok.com/) or [Cloudflare Tunnel](https://developers.cloudflare.com/pages/how-to/preview-with-cloudflare-tunnel/) to expose your local webhook to Meta.

---

## ⚡ Quickstart & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/fih.git
cd fih
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy the example environment configuration:

```bash
# Linux / macOS
cp .env.local.example .env.local

# Windows (PowerShell)
Copy-Item .env.local.example .env.local
```

Open `.env.local` and populate the required variables:

| Variable | Description | Example / How to Generate |
| :--- | :--- | :--- |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/fih?retryWrites=true&w=majority` |
| `JWT_SECRET` | Secret key for signing dashboard session tokens | Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `NEXT_PUBLIC_BASE_URL` | Public URL of the app (used for mode-switch authentication links) | `http://localhost:3000` (or your production domain `https://fih-app.com`) |
| `WHATSAPP_VERIFY_TOKEN` | Any secret token you choose for Meta webhook handshake | `my_fih_verify_token_123` |
| `WHATSAPP_APP_SECRET` | App Secret from Meta Developer Portal | Found in Meta App Dashboard &rarr; App Settings &rarr; Basic |
| `WHATSAPP_ACCESS_TOKEN` | Permanent System User Token or Temporary Access Token | Found in Meta Developer Portal &rarr; WhatsApp &rarr; API Setup |
| `WHATSAPP_PHONE_NUMBER_ID` | WhatsApp Phone Number ID | Found in Meta Developer Portal &rarr; WhatsApp &rarr; API Setup |
| `CRON_SECRET` | Secret key to protect the automated reminder endpoint | Any secure random string (e.g. `cron_secret_abc123`) |
| `SEED_SECRET` | Secret key to authorize the one-time user creation endpoint | Any secure random string (e.g. `seed_secret_xyz789`) |

---

### 4. Seed the Admin User

FIH is designed as a single-user personal assistant. Start the application locally or run the seed API to create your account:

1. Start the server:
   ```bash
   npm run dev
   ```
2. Trigger the seed endpoint to register your email, password, and WhatsApp phone number:

> [!IMPORTANT]
> The `whatsappNumber` must be in international E.164 format without any symbols or leading `+` (for example, India `919876543210` or US `12345678900`).

#### Using cURL:
```bash
curl -X POST http://localhost:3000/api/seed \
  -H "Content-Type: application/json" \
  -H "x-seed-secret: replace_with_your_SEED_SECRET" \
  -d '{
    "email": "you@example.com",
    "password": "yourStrongPassword123",
    "whatsappNumber": "919876543210"
  }'
```

#### Using PowerShell:
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/seed" -Method POST `
  -Headers @{ "Content-Type" = "application/json"; "x-seed-secret" = "replace_with_your_SEED_SECRET" } `
  -Body '{"email":"you@example.com","password":"yourStrongPassword123","whatsappNumber":"919876543210"}'
```

Once executed, you will receive `{"ok": true, "userId": "..."}`. You can now log into the web dashboard at `http://localhost:3000/login`.

---

### 5. Run the Application

```bash
# Start Next.js in development mode
npm run dev

# Or create a production build and run
npm run build
npm start
```

Visit [http://localhost:3000](http://localhost:3000) to view your dashboard.

---

## 📱 WhatsApp Cloud API Configuration

### Meta Developer Portal Setup

1. Go to the [Meta Developer Portal](https://developers.facebook.com/) and create an app (Type: **Other** &rarr; Select **Business**).
2. Under "Add products to your app", click **Set up** on **WhatsApp**.
3. Under **WhatsApp &rarr; API Setup**:
   - Copy your **Phone Number ID** into `WHATSAPP_PHONE_NUMBER_ID` in `.env.local`.
   - Add your personal phone number to the recipient test list to receive messages during development.
   - Generate an Access Token and paste it into `WHATSAPP_ACCESS_TOKEN`. For production, create a **System User** under Meta Business Manager with `whatsapp_business_messaging` permissions to get a non-expiring permanent token.
4. Under **WhatsApp &rarr; Configuration**:
   - Click **Edit** next to Webhook.
   - **Callback URL**: `https://<your-domain-or-ngrok-url>/api/whatsapp/webhook`
   - **Verify Token**: Must match `WHATSAPP_VERIFY_TOKEN` in `.env.local`.
   - Click **Verify and Save**.
   - Under Webhook Fields, click **Manage** and subscribe to **`messages`**.

### Local Testing with Tunneling (ngrok)

If testing locally on your machine, expose port 3000 to the internet using ngrok:

```bash
ngrok http 3000
```

Copy the forwarding HTTPS URL (e.g., `https://a1b2-c3d4.ngrok-free.app`) and set your webhook URL in Meta to:
```text
https://a1b2-c3d4.ngrok-free.app/api/whatsapp/webhook
```

---

## 💬 How to Use via WhatsApp

You can talk to FIH on WhatsApp using either natural English phrases or direct commands prefixed with `>`.

### Greetings & Help
| Message | Description |
| :--- | :--- |
| `Hi` / `Hello` / `Hey fih` | Introduces the assistant and lists available actions. |
| `help` or `>help` | Displays the full command and syntax reference. |

### To-Dos & Tasks
| Message | Action |
| :--- | :--- |
| `Buy groceries` | Creates an open to-do item. |
| `>todo Finish lab report` | Creates a to-do explicitly. |
| `>done groceries` | Marks the matching to-do complete (fuzzy matching). |
| `>list todo` | Lists all active to-dos. |

### Reminders & Timetables
| Message | Action |
| :--- | :--- |
| `Remind me tomorrow at 9am to submit forms` | Schedules a reminder for 9:00 AM IST tomorrow. |
| `Azithromycin tomorrow 3pm` | Schedules a reminder for 3:00 PM IST tomorrow. |
| `ticket book tmr` | Schedules a reminder (defaults to 9:00 AM IST tomorrow). |
| `R5B tomorrow 4th hr AWT, 5th hr DAA` | Parses multi-item timetable schedules and creates separate reminders. |

### Academic Deadlines & Projects
| Message | Action |
| :--- | :--- |
| `Submit AI lab report by Friday 5pm` | Creates an academic deadline due on Friday at 5:00 PM IST. |
| `WT Evaluation on 11.08.2026 Tuesday` | Creates a deadline for the specified calendar date. |
| `Remind me Gate exam registration last date is 26th` | Calculates the upcoming 26th and sets a reminder. |

### Debts & Financial IOUs
| Message | Action |
| :--- | :--- |
| `Hanan +100` / `Hanan +500 for dinner` | Records that Hanan owes you money (direction: `owed_to_me`). |
| `Hanan -100` / `i owe Hanan 200 for lunch` | Records a debt you owe to Hanan (direction: `i_owe`). |
| `how much i owe Hanan` / `how much Hanan owes me` | Displays net balance, total owed, total owing, and net position with Hanan. |
| `what is my total balance` / `how much do i owe in total` | Summarizes overall financial position across all contacts. |
| `>settle Hanan` | Displays all unsettled debts with Hanan and prompts to settle individually or type `all`. |

### Announcements & Long Notices
Forward lengthy official messages or class circulars directly to the bot:
```text
All students who have not yet registered for the NPTEL SWAYAM MOOC course examination on COI must complete their registration today and enter all the required details before 4:00 PM today.
```
*Result:* Automatically extracts the title (`NPTEL SWAYAM MOOC course examination on COI registration`) and sets a deadline for `4:00 PM today` in IST.

### Watchlist (Movies, Series, Books)
| Message | Action |
| :--- | :--- |
| `Minions and Monster to watch` | Adds "Minions and Monster" as a show/movie to your watchlist. |
| `Harry Potter to read` | Adds "Harry Potter" as a book to your watchlist. |
| `>list watch` | Lists currently unwatched/unread titles. |
| `>watched Minions 8/10` | Marks the item completed with an optional rating. |

### Important Dates & Anniversaries
| Message | Action |
| :--- | :--- |
| `Save the date: Wedding on Oct 5` | Saves an event date. |
| `Mom's birthday on 14th Sept` | Saves an annually recurring birthday. |

### Failsafes, Undo & Control Commands
| Command | Action |
| :--- | :--- |
| `undo` | Immediately deletes the last created entry if made by mistake. |
| `cancel` | Clears any pending interactive question or multi-step prompt. |
| `mode dev` / `mode live` | Generates a single-use, 10-minute secure link to switch environments. |

---

## 🖥 How to Use the Web Dashboard

The web dashboard provides an interactive overview of your entire workspace:

1. **Sign In**: Navigate to `/login` and sign in with your seeded credentials.
2. **Dashboard Overview**: View summary cards of total active tasks, upcoming deadlines, active reminders, and net debt position.
3. **Dedicated Tabs**:
   - **Tasks**: Filter by priority, mark done, or delete.
   - **Debts**: Grouped cards by person, live net balances, and transaction history journal.
   - **Deadlines**: Academic and personal deadlines with real-time countdown chips.
   - **Reminders**: Active and sent tabs with countdown badges.
   - **Important Dates**: Anniversaries and birthdays.
   - **Watchlist**: Filter by shows/movies/books, update ratings, or mark watched.
   - **Audit Log**: Timeline of all activities across WhatsApp and web interactions.
4. **Environment Switcher**: Toggle between `Live` and `Development` modes from the settings menu.

---

## ⏰ Automated Reminders & Cron Setup

FIH alerts you via WhatsApp when tasks, deadlines, or reminders are due. Automated checks are handled by `/api/cron/reminders`.

### Option A: Vercel Cron (Built-in)
The included [`vercel.json`](file:///c:/Users/gouth/Projects/fih/vercel.json) configures automatic execution:
```json
{
  "crons": [
    {
      "path": "/api/cron/reminders",
      "schedule": "0 0 * * *"
    }
  ]
}
```

### Option B: External Cron Service (e.g. cron-job.org or GitHub Actions)
You can configure any external cron service to send a `GET` request every 5–15 minutes:
```text
https://<your-domain>/api/cron/reminders?secret=YOUR_CRON_SECRET
```
Or send an `x-cron-secret` header matching `CRON_SECRET` in `.env.local`.

---

## ☁️ Deployment (Vercel)

1. Push your repository to GitHub or GitLab.
2. Import the project into [Vercel](https://vercel.com).
3. In your Vercel Project Settings &rarr; **Environment Variables**, add all keys from `.env.local`:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `NEXT_PUBLIC_BASE_URL` (set to your Vercel domain `https://your-app.vercel.app`)
   - `WHATSAPP_VERIFY_TOKEN`
   - `WHATSAPP_APP_SECRET`
   - `WHATSAPP_ACCESS_TOKEN`
   - `WHATSAPP_PHONE_NUMBER_ID`
   - `CRON_SECRET`
   - `SEED_SECRET`
4. Click **Deploy**.
5. Update your Meta Developer Portal Webhook Callback URL to:
   ```text
   https://your-app.vercel.app/api/whatsapp/webhook
   ```
6. Seed your production user by sending a `POST` request to `https://your-app.vercel.app/api/seed`.

---

## 🧪 Running Tests

The test suite validates natural language parsing, date computations, IST offsets, and intent classifications:

```bash
# Run NLP edge case tests (130+ test cases)
node scratch/test_nlp_edge_cases.mjs

# Run Next.js production build check
npm run build

# Run linter
npm run lint
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
