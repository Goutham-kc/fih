// Pixel Valley - Central Typed Event Bus
// Decouples UI components from animations, character reactions, audio, and visual systems (Spec Section 8.1)

class EventBus {
  constructor() {
    this.listeners = new Map();
  }

  /**
   * Subscribe to an event
   * @param {string} event - Event name (e.g. 'task.completed', 'chapter.entered')
   * @param {Function} callback - Callback function
   * @returns {Function} Unsubscribe function
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);

    // Return cleanup function for React useEffect hooks
    return () => this.off(event, callback);
  }

  /**
   * Unsubscribe from an event
   */
  off(event, callback) {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.delete(callback);
      if (handlers.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  /**
   * Emit an event with payload
   * @param {string} event - Event name
   * @param {any} data - Event payload
   */
  emit(event, data) {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.forEach((callback) => {
        try {
          callback(data);
        } catch (err) {
          console.error(`[EventBus] Error in handler for "${event}":`, err);
        }
      });
    }
  }

  /**
   * Clear all handlers (useful for testing)
   */
  clear() {
    this.listeners.clear();
  }

  /**
   * Count active listeners for an event
   */
  listenerCount(event) {
    return this.listeners.get(event)?.size || 0;
  }
}

// Global singleton instance
export const eventBus = new EventBus();

// Standard event types for Pixel Valley
export const EVENTS = {
  // Task / To-do events
  TASK_CREATED: 'task.created',
  TASK_COMPLETED: 'task.completed',
  TASK_DELETED: 'task.deleted',

  // Reminder events
  REMINDER_CREATED: 'reminder.created',
  REMINDER_FIRED: 'reminder.fired',
  REMINDER_DISMISSED: 'reminder.dismissed',

  // Deadline events
  DEADLINE_CREATED: 'deadline.created',
  DEADLINE_COMPLETED: 'deadline.completed',
  DEADLINE_OVERDUE: 'deadline.overdue',

  // Debt & Ledger events
  DEBT_CREATED: 'debt.created',
  DEBT_PAYMENT: 'debt.payment',
  DEBT_SETTLED: 'debt.settled',

  // Watchlist & Library events
  WATCH_ADDED: 'watch.added',
  WATCH_STATUS: 'watch.status',

  // Navigation & World events
  CHAPTER_ENTERED: 'chapter.entered',
  TIME_CHANGED: 'time.changed',
  WEATHER_CHANGED: 'weather.changed',
  SEASON_CHANGED: 'season.changed',

  // Sound & Motion toggles
  SOUND_TOGGLED: 'sound.toggled',
  MOTION_TOGGLED: 'motion.toggled',

  // WhatsApp arrival events
  WHATSAPP_ITEM_RECEIVED: 'whatsapp.item_received',

  // User profile events
  USER_UPDATED: 'user.updated',
};
