# 📖 fih (Personal Life Assistant) - Usage Guide

Welcome to **fih**! This is your unified personal life assistant, consisting of a powerful WhatsApp bot and a sleek Web Dashboard. 

You can interact with `fih` natively through natural language on WhatsApp or by using explicit commands. Everything syncs instantly to your Web Dashboard.

---

## 📱 1. WhatsApp Interaction (Natural Language)

`fih` uses AI to understand conversational English and forwarded messages. You don't always need to remember strict commands.

*   **Reminders:** "Remind me to check WhatsApp Flow in a month", "Remind me to call Mom tomorrow at 5pm"
*   **Debts:** "I owe Alex 50 bucks for lunch", "Sarah paid me back 200 rs"
*   **Deadlines:** "Please submit the assignment by Friday 10 PM" (You can forward messages directly from your class groups!)
*   **Watchlist:** "Add Inception to my watchlist", "I watched Dune, rate it 9/10"
*   **Class Schedules:** Forward your daily timetable (e.g., "1st hour physics, 2nd hour math"), and it will automatically set reminders for each class.

If `fih` isn't entirely sure what you meant (for example, if a deadline is missing a date), it will reply back and politely ask you to clarify!

---

## ⚡ 2. WhatsApp Interaction (Explicit Commands)

If you prefer exact control, you can use explicit commands by starting your message with `>`. 
*(Note: Use the pipe `|` character to separate arguments where specified).*

### 📋 To-Dos
*   **Add:** `>todo Buy groceries`
*   **Add with Due Date:** `>todo Submit report | 2026-08-10`
*   **Complete:** `>done groceries` (Uses fuzzy search, so you don't need the exact title).

### ⏰ Reminders
*   **Set:** `>reminder Buy tickets | today 8pm` or `>reminder Pay rent | 2026-09-01 10:00`
*   *(The bot will message you back exactly at the scheduled time!)*

### 💸 Debts (IOUs)
*   **You owe someone:** `>debt owe Alex 500 Lunch`
*   **Someone owes you:** `>debt owed Sarah 1200 Movie tickets`
*   **Settle up:** `>debt settle Alex` (Clears all open debts with Alex)
*   **View History:** `>debt journal` (Shows the last 10 transactions)

### ⏳ Deadlines
*   **Add:** `>deadline OS Assignment | tomorrow 5pm | academic`
*   *(Valid categories: `academic`, `personal`, `internship`. Defaults to `personal`)*

### 📅 Important Dates (Birthdays/Anniversaries)
*   **Add Recurring:** `>date Mom's Birthday | 09-14 | yearly`
*   **Add One-Time:** `>date Concert | 2026-11-20 | none`

### 🍿 Watchlist (Movies/Shows/Books)
*   **Add:** `>watch The Office`
*   **Mark as Watched:** `>watch The Office done`
*   **Mark as Watched with Rating:** `>watch The Office done 9` (Rating out of 10)

### 📃 Listings
You can ask the bot to list your open items directly in chat:
*   `>list todo` (Add `| priority` or `| time` to sort)
*   `>list debt` (Add `| Alex` to filter by person)
*   `>list deadline`
*   `>list watch`

---

## 💻 3. Web Dashboard

You can access your dashboard by logging in via the web URL. The dashboard provides a beautiful, real-time overview of everything managed by the bot.

### Navigation
Your dashboard is split into tabs (preserved when you refresh the page):
*   **Todos:** View open and completed tasks.
*   **Reminders:** See upcoming alerts and past notifications.
*   **Debts:** A split-pane view showing who owes you and who you owe, with 1-click settlement buttons.
*   **Deadlines:** Cards showing upcoming deadlines and their urgency.
*   **Important Dates:** A timeline of upcoming birthdays and events.
*   **Watchlist:** A grid of your movies, shows, and books.

### Live vs Development Mode
In the **Settings** tab (or via the mobile menu), you can switch between `Live` and `Development` modes. 
*   **Live Mode:** Your actual, real-world data.
*   **Development Mode:** A safe, isolated sandbox where you can test bot commands, add dummy data, and mess around without polluting your real lists. (A colored badge in the bottom-left will constantly remind you which mode you are currently in).

---

## ⚙️ 4. Timezones

The entire application is hardcoded to operate in **Indian Standard Time (IST / UTC+5:30)**. 
When you say "tomorrow 8pm" or "in 2 hours", the AI strictly calculates the target time relative to the current IST time, ensuring you never receive delayed or early notifications.
