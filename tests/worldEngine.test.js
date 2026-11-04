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

  it('detects building clicks with getHitBuilding', async () => {
    const { getHitBuilding } = await import('../components/world/PixelWorldCanvas');
    // Ledger hut is around tx: 26, ty: 9 (416, 144)
    const hit = getHitBuilding(26 * 16, 9 * 16);
    expect(hit).not.toBeNull();
    expect(hit.id).toBe('debts');
    expect(hit.name).toBe('The Ledger Hut');

    // Central fountain at (18*16, 12*16) is not a building
    const miss = getHitBuilding(18 * 16, 12 * 16);
    expect(miss).toBeNull();
  });

  it('validates walkable areas and detects obstacles like pond and bounds', async () => {
    const { isWalkable } = await import('../components/world/PixelWorldCanvas');
    // Plaza path is walkable
    expect(isWalkable(18 * 16, 12 * 16)).toBe(true);

    // Pond at tx: 13, ty: 17 is impassable water
    expect(isWalkable(13 * 16, 17 * 16)).toBe(false);

    // Out of map bounds is impassable
    expect(isWalkable(0, 0)).toBe(false);
    expect(isWalkable(38 * 16, 26 * 16)).toBe(false);
  });

  it('computes normalized velocity vectors from keyboard inputs', async () => {
    const { getKeyboardVelocity } = await import('../components/world/PixelWorldCanvas');
    // Up only
    const up = getKeyboardVelocity(new Set(['KeyW']));
    expect(up.vx).toBe(0);
    expect(up.vy).toBe(-1);

    // Right Arrow
    const right = getKeyboardVelocity(new Set(['ArrowRight']));
    expect(right.vx).toBe(1);
    expect(right.vy).toBe(0);

    // Diagonal Up-Right
    const diag = getKeyboardVelocity(new Set(['KeyW', 'KeyD']));
    expect(diag.vx).toBeCloseTo(Math.SQRT1_2, 3);
    expect(diag.vy).toBeCloseTo(-Math.SQRT1_2, 3);

    // Opposing keys cancel out
    const cancel = getKeyboardVelocity(new Set(['KeyW', 'KeyS']));
    expect(cancel.vx).toBe(0);
    expect(cancel.vy).toBe(0);
  });

  it('identifies nearby buildings within interaction distance', async () => {
    const { getNearbyBuilding, BUILDING_HITBOXES } = await import('../components/world/PixelWorldCanvas');
    expect(BUILDING_HITBOXES.length).toBe(8);

    // Stand right at the Ledger door (26*16, 11*16)
    const nearHut = getNearbyBuilding(26 * 16, 11 * 16, 30);
    expect(nearHut).not.toBeNull();
    expect(nearHut.id).toBe('debts');

    // Stand in center plaza far from all doors
    const far = getNearbyBuilding(18 * 16, 12 * 16, 20);
    expect(far).toBeNull();
  });
});
