# FIH — AI Personal Assistant & WhatsApp Companion 🤖✨

**FIH** is an intelligent personal life assistant that turns plain WhatsApp text messages, student group announcements, class timetables, forwarded emails, and financial IOUs into organized tasks, reminders, deadlines, debt balances, and watchlists.

---

## 🚀 WhatsApp Natural Language Commands & Examples

Simply text or forward messages to the bot on WhatsApp using natural English. No complex syntax required!

| Feature / Intent | Example WhatsApp Text | What FIH Does |
| :--- | :--- | :--- |
| 💰 **Record Money Owed To You** | `Hanan +100` or `Hanan + 500 for dinner` or `Hanan owes me 500` | Records that Hanan owes you money in your Debt Ledger. |
| 💰 **Record Money You Owe** | `Hanan -100` or `Amir - 50 for coffee` or `i owe Hanan 200` | Records a debt that you owe in your Debt Ledger. |
| 📊 **Check Balance With Person** | `how much i owe Amir` or `how much Amir owes me` | Calculates net balance, total owed, total owing, and net position. |
| 📊 **Check Total Debt Summary** | `how much do i owe in total` or `what is my total balance` | Displays your total debt summary across all people. |
| 🔔 **Set Timed Reminder** | `ticket book tmr` or `R5B tmr 3rd hr SE` | Schedules a reminder (defaults to 9:00 AM if no time is given). |
| ⏳ **Set Academic Deadline** | `This Friday 2,3 hour srp project evaluation` | Schedules a deadline on your calendar with countdown alerts. |
| 📌 **Multi-Item Schedules** | `R5B tomorrow 4th hr AWT, 5 th hr DAA` | Parses and creates multiple reminders simultaneously. |
| 📋 **List & Filter Items** | `show my debts sorted by person` or `show tasks by priority` | Displays your items filtered and sorted by person, time, or priority. |
| ↩️ **Undo Mistake** | Reply `undo` | Reverts the last entry created by the bot. |
| 🚫 **Cancel Question** | Reply `cancel` | Clears any active pending prompt. |

---

## 📱 App Modules & Functionalities

### 1. 📋 To-Do & Task Manager
- Instant task creation by forwarding any task notice.
- Filter tasks by priority (**High**, **Medium**, **Low**).
- Mark items complete directly from WhatsApp or the Web Dashboard.

### 2. 💰 Debt & Financial Ledger
- **Live Summary Cards**: Real-time totals for *Total You Owe*, *Total Owed to You*, and *Net Position*.
- **Transaction Journal**: Keeps a historical record of all past settled transactions even after debts are cleared.
- **Grouped Person View**: Easily see all active IOUs grouped by person.

### 3. 🔔 Reminders Board
- **Live Countdown Badges**: Visual badges (`In 15 mins`, `Overdue`, `Tomorrow`) for upcoming reminders.
- **WhatsApp Text Alerts**: Automated alerts sent directly to your WhatsApp when a reminder is due.
- **History & Sent Tabs**: View past delivered reminders and mark items sent/done.

### 4. ⏳ Deadlines & Academic Tracker
- Tracks project submissions, exams, vivas, and presentation dates.
- Automatic day calculations (*due Friday*, *due on 24th*).

### 5. ⭐ Important Dates & 🎬 Watchlist
- **Important Dates**: Store birthdays, recurring annual dates, and anniversaries.
- **Watchlist**: Track movies, TV shows, anime, books, and research papers with ratings and status (**Planned**, **In Progress**, **Done**).
