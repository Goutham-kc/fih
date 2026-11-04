import { describe, it, expect, beforeEach, vi } from 'vitest';
import { eventBus, EVENTS } from '../lib/eventBus';
import { getDateSeededWeather, getTimeOfDay } from '../components/world/WeatherEngine';
import { soundManager } from '../lib/soundManager';

describe('EventBus (Spec Section 8.1)', () => {
  beforeEach(() => {
    eventBus.clear();
  });

  it('delivers events to subscribers', () => {
    let received = null;
    const unsub = eventBus.on(EVENTS.TASK_COMPLETED, (data) => {
      received = data;
    });

    eventBus.emit(EVENTS.TASK_COMPLETED, { taskId: '123', title: 'Water crops' });
    expect(received).toEqual({ taskId: '123', title: 'Water crops' });
    unsub();
  });

  it('unsubscribes listeners cleanly via returned function', () => {
    let count = 0;
    const unsub = eventBus.on(EVENTS.DEBT_SETTLED, () => {
      count++;
    });

    eventBus.emit(EVENTS.DEBT_SETTLED);
    expect(count).toBe(1);

    unsub();
    eventBus.emit(EVENTS.DEBT_SETTLED);
    expect(count).toBe(1); // Did not increment after unsubscribe
  });

  it('manages listener counts and clears all listeners', () => {
    expect(eventBus.listenerCount(EVENTS.CHAPTER_ENTERED)).toBe(0);

    const unsub1 = eventBus.on(EVENTS.CHAPTER_ENTERED, () => {});
    const unsub2 = eventBus.on(EVENTS.CHAPTER_ENTERED, () => {});
    expect(eventBus.listenerCount(EVENTS.CHAPTER_ENTERED)).toBe(2);

    unsub1();
    expect(eventBus.listenerCount(EVENTS.CHAPTER_ENTERED)).toBe(1);

    eventBus.clear();
    expect(eventBus.listenerCount(EVENTS.CHAPTER_ENTERED)).toBe(0);
    unsub2(); // Safe no-op
  });

  it('isolates handler exceptions without interrupting other listeners', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    let secondHandlerRan = false;

    eventBus.on(EVENTS.WEATHER_CHANGED, () => {
      throw new Error('Handler fault');
    });
    eventBus.on(EVENTS.WEATHER_CHANGED, () => {
      secondHandlerRan = true;
    });

    expect(() => {
      eventBus.emit(EVENTS.WEATHER_CHANGED, { weather: 'rain' });
    }).not.toThrow();

    expect(secondHandlerRan).toBe(true);
    errorSpy.mockRestore();
  });
});

describe('WeatherEngine Logic (Spec Section 8.2)', () => {
  it('correctly maps 24-hour clock to day/night phases', () => {
    expect(getTimeOfDay(5)).toBe('dawn');
    expect(getTimeOfDay(6)).toBe('dawn');
    expect(getTimeOfDay(7)).toBe('day');
    expect(getTimeOfDay(12)).toBe('day');
    expect(getTimeOfDay(16)).toBe('day');
    expect(getTimeOfDay(17)).toBe('dusk');
    expect(getTimeOfDay(18)).toBe('dusk');
    expect(getTimeOfDay(19)).toBe('night');
    expect(getTimeOfDay(23)).toBe('night');
    expect(getTimeOfDay(2)).toBe('night');
  });

  it('generates deterministic date-seeded weather for the same day', () => {
    const testDate1 = new Date(2026, 6, 15); // Summer
    const weatherA = getDateSeededWeather(testDate1);
    const weatherB = getDateSeededWeather(testDate1);

    expect(weatherA).toBe(weatherB);
    expect(['clear', 'fireflies']).toContain(weatherA);

    const winterDate = new Date(2026, 0, 15); // January
    const winterWeather = getDateSeededWeather(winterDate);
    expect(['clear', 'snow']).toContain(winterWeather);
  });
});

describe('SoundManager Controls (Spec Section 8.3)', () => {
  it('clamps master, sfx, and ambience volumes between 0 and 1', () => {
    soundManager.setMasterVolume(1.5);
    expect(soundManager.masterVolume).toBe(1);

    soundManager.setMasterVolume(-0.5);
    expect(soundManager.masterVolume).toBe(0);

    soundManager.setMasterVolume(0.75);
    expect(soundManager.masterVolume).toBe(0.75);

    soundManager.setSfxVolume(2.0);
    expect(soundManager.sfxVolume).toBe(1);

    soundManager.setAmbienceVolume(-1);
    expect(soundManager.ambienceVolume).toBe(0);
  });

  it('returns 0 effective volume when sound is muted', () => {
    soundManager.setMasterVolume(0.8);
    soundManager.setSfxVolume(0.8);

    if (!soundManager.isMuted()) {
      soundManager.toggleMute();
    }
    expect(soundManager.isMuted()).toBe(true);
    expect(soundManager.getEffectiveVolume('sfx')).toBe(0);
    expect(soundManager.getEffectiveVolume('ambience')).toBe(0);
  });
});

describe('Continuous Village Chapter Anchors (Addendum Section 3)', () => {
  it('defines all 8 chapter anchors with valid coordinates and original residents', async () => {
    const { CHAPTER_ANCHORS } = await import('../components/world/PixelWorldCanvas');
    const expectedChapters = ['todos', 'debts', 'reminders', 'deadlines', 'dates', 'watchlist', 'audit', 'settings'];

    expectedChapters.forEach((chId) => {
      expect(CHAPTER_ANCHORS).toHaveProperty(chId);
      const anchor = CHAPTER_ANCHORS[chId];
      expect(typeof anchor.x).toBe('number');
      expect(typeof anchor.y).toBe('number');
      expect(anchor.x).toBeGreaterThan(0);
      expect(anchor.y).toBeGreaterThan(0);
      expect(typeof anchor.name).toBe('string');
      expect(typeof anchor.resident).toBe('string');
      expect(typeof anchor.chapterTitle).toBe('string');
    });
  });
});
