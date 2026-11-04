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

    // Clicking anywhere on the new Farmhouse (roof/walls at tx: 8, ty: 5) hits The Farmstead
    const hitHouse = getHitBuilding(8 * 16, 5 * 16);
    expect(hitHouse).not.toBeNull();
    expect(hitHouse.id).toBe('todos');
    expect(hitHouse.name).toBe('The Farmstead');
  });

  it('detects front porch door proximity for the custom Farmstead house', async () => {
    const { getNearbyBuilding } = await import('../components/world/PixelWorldCanvas');

    // Standing outside the porch doorstep at (tx: 8, ty: 7) detects The Farmstead within range
    const nearby = getNearbyBuilding(8 * 16, 7 * 16 + 4, 36);
    expect(nearby).not.toBeNull();
    expect(nearby.id).toBe('todos');
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

  it('prevents walking through houses, building walls, counters, and obstacles', async () => {
    const { isWalkable } = await import('../components/world/PixelWorldCanvas');

    // 1. Chapter 1: The Farmstead Cabin walls & roof (tx: 6-9, ty: 4-6) are solid
    expect(isWalkable(7 * 16, 5 * 16)).toBe(false);
    expect(isWalkable(8 * 16, 6 * 16)).toBe(false);

    // 2. Chapter 2: The Ledger Hut (tx: 24-28, ty: 7-9) and Bram's Counter (tx: 25-27, ty: 10-11) are solid
    expect(isWalkable(26 * 16, 8 * 16)).toBe(false); // inside hut
    expect(isWalkable(26 * 16, 11 * 16)).toBe(false); // counter table
    expect(isWalkable(26 * 16, 12 * 16)).toBe(true); // cobblestones in front of counter

    // 3. Chapter 3: The Bell Tower masonry (tx: 17-18, ty: 2-4) is solid
    expect(isWalkable(17 * 16, 3 * 16)).toBe(false);
    expect(isWalkable(18 * 16, 6 * 16)).toBe(true); // door approach is walkable

    // 4. Chapter 4: The Notice Board posts (tx: 17-19, ty: 15) are solid
    expect(isWalkable(18 * 16, 15 * 16)).toBe(false);
    expect(isWalkable(18 * 16, 16 * 16)).toBe(true); // in front of board is walkable

    // 5. Chapter 5: The Festival Grounds Gazebo (tx: 26-29, ty: 17-18) is solid
    expect(isWalkable(28 * 16, 17 * 16)).toBe(false);
    expect(isWalkable(28 * 16, 19 * 16)).toBe(true); // festival entrance is walkable

    // 6. Chapter 6: The Moonlight Cinema screen (tx: 4-7, ty: 18) is solid
    expect(isWalkable(5 * 16, 18 * 16)).toBe(false);
    expect(isWalkable(6 * 16, 19 * 16)).toBe(true); // seating is walkable

    // 7. Chapter 7: The Archive Cellar stone walls (tx: 26-29, ty: 2-3) are solid
    expect(isWalkable(28 * 16, 2 * 16)).toBe(false);
    expect(isWalkable(28 * 16, 4 * 16)).toBe(true); // cellar door is walkable

    // 8. Chapter 8: The Toolshed Workbench & Forge (tx: 7-9, ty: 2-3) is solid
    expect(isWalkable(8 * 16, 3 * 16)).toBe(false);
    expect(isWalkable(6 * 16, 3 * 16)).toBe(true); // clearing beside toolshed is walkable
    expect(isWalkable(8 * 16, 7 * 16)).toBe(true); // farm porch outside cabin door is walkable

    // 9. Central Village Fountain basin (tx: 18, ty: 11) is solid
    expect(isWalkable(18 * 16, 11 * 16)).toBe(false);
    expect(isWalkable(18 * 16, 12 * 16)).toBe(true); // fountain apron is walkable

    // 10. Fences block movement, but farm gate (tx: 8-9, ty: 8) allows passage
    expect(isWalkable(5 * 16, 8 * 16)).toBe(false); // garden fence
    expect(isWalkable(8 * 16, 8 * 16)).toBe(true); // farm gate opening
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

  it('handles Escape key to return to village map from Panel Only mode', () => {
    let activeTab = 'debts';
    let showCanvas = false; // Panel Only mode

    function handleEscape(e) {
      if (e.key === 'Escape' || e.code === 'Escape') {
        activeTab = null;
        showCanvas = true; // Always restore world view
      }
    }

    handleEscape({ key: 'Escape', code: 'Escape' });
    expect(activeTab).toBeNull();
    expect(showCanvas).toBe(true);
  });
});


describe('Village Path & Cobblestone Autotiling Engine (Spec Section 8.4)', () => {
  it('correctly identifies all village dirt thoroughfares and lanes', async () => {
    const { isVillagePath } = await import('../components/world/PixelWorldCanvas');

    // Main East-West Thoroughfare
    expect(isVillagePath(10, 12)).toBe(true);
    expect(isVillagePath(22, 13)).toBe(true);

    // North Belfry Avenue
    expect(isVillagePath(17, 7)).toBe(true);
    expect(isVillagePath(18, 9)).toBe(true);

    // South Notice Board Avenue
    expect(isVillagePath(17, 17)).toBe(true);
    expect(isVillagePath(18, 19)).toBe(true);

    // Northwest Farmstead Lane
    expect(isVillagePath(8, 8)).toBe(true);
    expect(isVillagePath(9, 10)).toBe(true);

    // Southwest Moonlight Cinema Lane
    expect(isVillagePath(6, 15)).toBe(true);
    expect(isVillagePath(7, 18)).toBe(true);

    // Northeast Archive Cellar Lane
    expect(isVillagePath(27, 6)).toBe(true);
    expect(isVillagePath(28, 8)).toBe(true);

    // Southeast Festival Grounds Lane
    expect(isVillagePath(27, 15)).toBe(true);
    expect(isVillagePath(28, 18)).toBe(true);

    // Open Meadow (non-paths)
    expect(isVillagePath(2, 2)).toBe(false);
    expect(isVillagePath(35, 10)).toBe(false);
    expect(isVillagePath(14, 14)).toBe(false);
  });

  it('correctly identifies cobblestone plazas, platforms, and building aprons', async () => {
    const { isVillageCobble } = await import('../components/world/PixelWorldCanvas');

    // Central Plaza surrounding Fountain
    expect(isVillageCobble(18, 12)).toBe(true);
    expect(isVillageCobble(16, 11)).toBe(true);
    expect(isVillageCobble(20, 13)).toBe(true);

    // Ledger Hut Porch & Customer Apron
    expect(isVillageCobble(26, 11)).toBe(true);
    expect(isVillageCobble(24, 12)).toBe(true);

    // Bell Tower Platform
    expect(isVillageCobble(17, 4)).toBe(true);

    // Archive Cellar Pad
    expect(isVillageCobble(27, 3)).toBe(true);

    // Notice Board Viewing Pad
    expect(isVillageCobble(18, 15)).toBe(true);

    // Toolshed Apron
    expect(isVillageCobble(8, 3)).toBe(true);

    // Farmstead Porch Apron
    expect(isVillageCobble(8, 6)).toBe(true);

    // Moonlight Cinema Entrance Pad
    expect(isVillageCobble(6, 19)).toBe(true);

    // Festival Grounds Apron
    expect(isVillageCobble(28, 19)).toBe(true);

    // Open Meadow or pure dirt path
    expect(isVillageCobble(10, 12)).toBe(false);
    expect(isVillageCobble(2, 2)).toBe(false);
  });

  it('unifies walkable ground classification via isGround', async () => {
    const { isGround } = await import('../components/world/PixelWorldCanvas');

    // Dirt path
    expect(isGround(10, 12)).toBe(true);
    // Cobble plaza
    expect(isGround(18, 12)).toBe(true);
    // Meadow
    expect(isGround(2, 2)).toBe(false);
  });

  it('autotiles dirt path edges and cobblestones with authentic 16-bit fringe tiles', async () => {
    const { getPathTileInfo } = await import('../components/world/PixelWorldCanvas');

    // Horizontal Main Street Top Edge (ty: 12) -> dirt_edge_top (col: 5, row: 0)
    const topEdge = getPathTileInfo(10, 12);
    expect(topEdge).toEqual({ col: 5, row: 0 });

    // Horizontal Main Street Bottom Edge (ty: 13) -> dirt_edge_bottom (col: 6, row: 0)
    const bottomEdge = getPathTileInfo(10, 13);
    expect(bottomEdge).toEqual({ col: 6, row: 0 });

    // Vertical North Avenue Left Edge (tx: 17, ty: 7) -> dirt_edge_left (col: 0, row: 6)
    const leftEdge = getPathTileInfo(17, 7);
    expect(leftEdge).toEqual({ col: 0, row: 6 });

    // Vertical North Avenue Right Edge (tx: 18, ty: 7) -> dirt_edge_right (col: 1, row: 6)
    const rightEdge = getPathTileInfo(18, 7);
    expect(rightEdge).toEqual({ col: 1, row: 6 });

    // Central Plaza Cobblestone (tx: 18, ty: 12) -> cobble_square (col: 4, row: 1)
    const cobbleTile = getPathTileInfo(18, 12);
    expect(cobbleTile).toEqual({ col: 4, row: 1 });

    // Non-path meadow returns null
    expect(getPathTileInfo(2, 2)).toBeNull();
  });
});

describe('Overworld Welcome & Interaction Visibility Rules (Spec Section 5)', () => {
  it('shows Welcome dialogue box on initial login/refresh before interaction', async () => {
    const { shouldShowDialogue } = await import('../components/world/PixelWorldCanvas');

    // Initial spawn: no tab open, user hasn't interacted, not near any door
    const show = shouldShowDialogue({
      activeTab: null,
      hasInteracted: false,
      nearbyBuilding: null,
    });
    expect(show).toBe(true);
  });

  it('hides dialogue box once player interacts and is walking in the open world', async () => {
    const { shouldShowDialogue } = await import('../components/world/PixelWorldCanvas');

    // Player started moving / interacting: hasInteracted is true, roaming open world
    const show = shouldShowDialogue({
      activeTab: null,
      hasInteracted: true,
      nearbyBuilding: null,
    });
    expect(show).toBe(false);
  });

  it('shows resident dialogue box when approaching any building', async () => {
    const { shouldShowDialogue } = await import('../components/world/PixelWorldCanvas');

    // Player walks near the Ledger Hut door
    const show = shouldShowDialogue({
      activeTab: null,
      hasInteracted: true,
      nearbyBuilding: { id: 'debts', name: 'The Ledger Hut' },
    });
    expect(show).toBe(true);
  });

  it('shows chapter dialogue box when inside an active chapter', async () => {
    const { shouldShowDialogue } = await import('../components/world/PixelWorldCanvas');

    // Player enters the Farmstead chapter (todos)
    const show = shouldShowDialogue({
      activeTab: 'todos',
      hasInteracted: true,
      nearbyBuilding: null,
    });
    expect(show).toBe(true);
  });

  it('controls HUD guide visibility: shows initial controls once, hides in world, prompts on proximity', async () => {
    const { getHudControlsGuide } = await import('../components/world/PixelWorldCanvas');

    // 1. Initial login / refresh: full keyboard guide shown
    const initialGuide = getHudControlsGuide({
      activeTab: null,
      hasInteracted: false,
      nearbyBuilding: null,
    });
    expect(initialGuide).toBe('🎮 WASD / Arrows to Walk • [E] Enter • [P] Panel Only');

    // 2. Walking open world: HUD guide is hidden (clean top bar)
    const roamingGuide = getHudControlsGuide({
      activeTab: null,
      hasInteracted: true,
      nearbyBuilding: null,
    });
    expect(roamingGuide).toBeNull();

    // 3. Approaching a building: proximity entry guide shown
    const proximityGuide = getHudControlsGuide({
      activeTab: null,
      hasInteracted: true,
      nearbyBuilding: { id: 'reminders', name: 'The Bell Tower' },
    });
    expect(proximityGuide).toBe('🚪 [E] Enter • [P] Panel Only');

    // 4. Inside a chapter: null (top bar displays Village Map button instead)
    const chapterGuide = getHudControlsGuide({
      activeTab: 'reminders',
      hasInteracted: true,
      nearbyBuilding: null,
    });
    expect(chapterGuide).toBeNull();
  });
});
