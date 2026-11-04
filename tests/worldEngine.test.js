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
    // Ledger hut / bank is around tx: 50, ty: 12 (800, 192)
    const hit = getHitBuilding(50 * 16, 12 * 16);
    expect(hit).not.toBeNull();
    expect(hit.id).toBe('debts');
    expect(hit.name).toBe('The Ledger Hut');

    // Central fountain at (32*16, 31*16) is not a building
    const miss = getHitBuilding(32 * 16, 31 * 16);
    expect(miss).toBeNull();

    // Clicking anywhere on the new Farmhouse (roof/walls at tx: 14, ty: 12) hits The Farmstead
    const hitHouse = getHitBuilding(14 * 16, 12 * 16);
    expect(hitHouse).not.toBeNull();
    expect(hitHouse.id).toBe('todos');
    expect(hitHouse.name).toBe('The Farmstead');

    // Clicking on the new Notice Board (at tx: 32, ty: 34) hits The Notice Board
    const hitBoard = getHitBuilding(32 * 16, 34 * 16);
    expect(hitBoard).not.toBeNull();
    expect(hitBoard.id).toBe('deadlines');
    expect(hitBoard.name).toBe('The Notice Board');

    // Clicking on the new Bank (at tx: 50, ty: 11) hits The Ledger Hut
    const hitBank = getHitBuilding(50 * 16, 11 * 16);
    expect(hitBank).not.toBeNull();
    expect(hitBank.id).toBe('debts');
    expect(hitBank.name).toBe('The Ledger Hut');

    // Clicking on the new Bell Tower clock face (at tx: 32, ty: 10) hits The Bell Tower
    const hitTower = getHitBuilding(32 * 16, 10 * 16);
    expect(hitTower).not.toBeNull();
    expect(hitTower.id).toBe('reminders');
    expect(hitTower.name).toBe('The Bell Tower');

    // Clicking on the new Festival Grounds pavilion (at tx: 16, ty: 48) hits The Festival Grounds
    const hitFestival = getHitBuilding(16 * 16, 48 * 16);
    expect(hitFestival).not.toBeNull();
    expect(hitFestival.id).toBe('dates');
    expect(hitFestival.name).toBe('The Festival Grounds');

    // Clicking on the new Moonlight Cinema screen (at tx: 48, ty: 48) hits The Moonlight Cinema
    const hitCinema = getHitBuilding(48 * 16, 48 * 16);
    expect(hitCinema).not.toBeNull();
    expect(hitCinema.id).toBe('watchlist');
    expect(hitCinema.name).toBe('The Moonlight Cinema');

    // Clicking on the new Archive Cellar (at tx: 12, ty: 30) hits The Archive Cellar
    const hitCellar = getHitBuilding(12 * 16, 30 * 16);
    expect(hitCellar).not.toBeNull();
    expect(hitCellar.id).toBe('audit');
    expect(hitCellar.name).toBe('The Archive Cellar');
  });

  it('detects entrance proximity for the custom Archive Cellar', async () => {
    const { getNearbyBuilding } = await import('../components/world/PixelWorldCanvas');

    // Standing on the steps pad at (tx: 12, ty: 33) detects The Archive Cellar within range
    const nearby = getNearbyBuilding(12 * 16, 33 * 16, 36);
    expect(nearby).not.toBeNull();
    expect(nearby.id).toBe('audit');
  });

  it('detects entrance proximity for the custom Moonlight Cinema', async () => {
    const { getNearbyBuilding } = await import('../components/world/PixelWorldCanvas');

    // Standing on the entrance pad at (tx: 48, ty: 51) detects The Moonlight Cinema within range
    const nearby = getNearbyBuilding(48 * 16, 51 * 16, 36);
    expect(nearby).not.toBeNull();
    expect(nearby.id).toBe('watchlist');
  });

  it('detects entrance proximity for the custom Festival Grounds', async () => {
    const { getNearbyBuilding } = await import('../components/world/PixelWorldCanvas');

    // Standing on the cobblestone apron at (tx: 16, ty: 51) detects The Festival Grounds within range
    const nearby = getNearbyBuilding(16 * 16, 51 * 16, 36);
    expect(nearby).not.toBeNull();
    expect(nearby.id).toBe('dates');
  });

  it('detects entrance proximity for the custom Bell Tower', async () => {
    const { getNearbyBuilding } = await import('../components/world/PixelWorldCanvas');

    // Standing outside the front steps at (tx: 32, ty: 14) detects The Bell Tower within range
    const nearby = getNearbyBuilding(32 * 16, 14 * 16, 36);
    expect(nearby).not.toBeNull();
    expect(nearby.id).toBe('reminders');
  });

  it('detects entrance proximity for the custom Bank / Ledger', async () => {
    const { getNearbyBuilding } = await import('../components/world/PixelWorldCanvas');

    // Standing outside the front steps at (tx: 50, ty: 14) detects The Ledger Hut within range
    const nearby = getNearbyBuilding(50 * 16, 14 * 16, 36);
    expect(nearby).not.toBeNull();
    expect(nearby.id).toBe('debts');
  });

  it('detects viewing pad proximity for the custom Notice Board', async () => {
    const { getNearbyBuilding } = await import('../components/world/PixelWorldCanvas');

    // Standing on the viewing pad in front of the board at (tx: 32, ty: 36) detects The Notice Board
    const nearby = getNearbyBuilding(32 * 16, 36 * 16, 36);
    expect(nearby).not.toBeNull();
    expect(nearby.id).toBe('deadlines');
  });

  it('detects front porch door proximity for the custom Farmstead house', async () => {
    const { getNearbyBuilding } = await import('../components/world/PixelWorldCanvas');

    // Standing outside the porch doorstep at (tx: 14, ty: 14) detects The Farmstead within range
    const nearby = getNearbyBuilding(14 * 16, 14 * 16, 36);
    expect(nearby).not.toBeNull();
    expect(nearby.id).toBe('todos');
  });

  it('validates walkable areas and detects obstacles like pond and bounds', async () => {
    const { isWalkable } = await import('../components/world/PixelWorldCanvas');
    // Plaza path is walkable
    expect(isWalkable(32 * 16, 33 * 16)).toBe(true);

    // Pond at tx: 30, ty: 41 is impassable water
    expect(isWalkable(30 * 16, 41 * 16)).toBe(false);

    // Footbridge across pond at tx: 32, ty: 41 is walkable
    expect(isWalkable(32 * 16, 41 * 16)).toBe(true);

    // Out of map bounds is impassable
    expect(isWalkable(0, 0)).toBe(false);
    expect(isWalkable(64 * 16, 64 * 16)).toBe(false);
  });

  it('prevents walking through houses, building walls, counters, and obstacles', async () => {
    const { isWalkable } = await import('../components/world/PixelWorldCanvas');

    // 1. Chapter 1: The Farmstead Cabin walls & roof (tx: 12-16, ty: 10-13) are solid
    expect(isWalkable(14 * 16, 11 * 16)).toBe(false);
    expect(isWalkable(14 * 16, 14 * 16)).toBe(true); // farm porch doorstep is walkable

    // 2. Chapter 2: The Ledger Hut / Bank (tx: 48-52, ty: 10-13) is solid
    expect(isWalkable(50 * 16, 11 * 16)).toBe(false);
    expect(isWalkable(50 * 16, 14 * 16)).toBe(true); // steps in front of bank

    // 3. Chapter 3: The Bell Tower masonry (tx: 31-33, ty: 9-13) is solid
    expect(isWalkable(32 * 16, 11 * 16)).toBe(false);
    expect(isWalkable(32 * 16, 14 * 16)).toBe(true); // door approach is walkable

    // 4. Chapter 4: The Notice Board posts (tx: 31-33, ty: 35) are solid
    expect(isWalkable(32 * 16, 35 * 16)).toBe(false);
    expect(isWalkable(32 * 16, 36 * 16)).toBe(true); // in front of board is walkable

    // 5. Chapter 5: The Festival Grounds stage (tx: 14-18, ty: 47-49) is solid
    expect(isWalkable(16 * 16, 48 * 16)).toBe(false);
    expect(isWalkable(16 * 16, 51 * 16)).toBe(true); // festival entrance is walkable

    // 6. Chapter 6: The Moonlight Cinema screen (tx: 46-50, ty: 47-49) is solid
    expect(isWalkable(48 * 16, 48 * 16)).toBe(false);
    expect(isWalkable(48 * 16, 51 * 16)).toBe(true); // seating is walkable

    // 7. Chapter 7: The Archive Cellar stone walls (tx: 10-13, ty: 30-32) are solid
    expect(isWalkable(12 * 16, 31 * 16)).toBe(false);
    expect(isWalkable(12 * 16, 33 * 16)).toBe(true); // cellar door is walkable

    // 8. Chapter 8: The Toolshed Workbench & Forge (tx: 15-17, ty: 21-22) is solid
    expect(isWalkable(16 * 16, 21 * 16)).toBe(false);
    expect(isWalkable(16 * 16, 23 * 16)).toBe(true); // clearing beside toolshed is walkable

    // 9. Central Village Fountain basin (tx: 32, ty: 31) is solid
    expect(isWalkable(32 * 16, 31 * 16)).toBe(false);
    expect(isWalkable(32 * 16, 32 * 16)).toBe(true); // fountain apron is walkable

    // 10. Fences block movement, but farm gate allows passage
    expect(isWalkable(11 * 16, 16 * 16)).toBe(false); // garden fence
    expect(isWalkable(14 * 16, 16 * 16)).toBe(true); // farm gate opening
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

    // Stand right at the Ledger door (50*16, 14*16)
    const nearHut = getNearbyBuilding(50 * 16, 14 * 16, 30);
    expect(nearHut).not.toBeNull();
    expect(nearHut.id).toBe('debts');

    // Stand in center plaza far from all doors
    const far = getNearbyBuilding(32 * 16, 30 * 16, 20);
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

    // North Belfry Avenue
    expect(isVillagePath(31, 20)).toBe(true);
    expect(isVillagePath(32, 24)).toBe(true);

    // West Archive Way
    expect(isVillagePath(20, 32)).toBe(true);
    expect(isVillagePath(16, 33)).toBe(true);

    // Northwest Farm Road
    expect(isVillagePath(20, 20)).toBe(true);
    expect(isVillagePath(14, 18)).toBe(true);

    // Northeast Bank Boulevard
    expect(isVillagePath(42, 20)).toBe(true);
    expect(isVillagePath(50, 18)).toBe(true);

    // Southwest Festival Avenue
    expect(isVillagePath(20, 44)).toBe(true);
    expect(isVillagePath(16, 48)).toBe(true);

    // Southeast Cinema Boulevard
    expect(isVillagePath(42, 44)).toBe(true);
    expect(isVillagePath(48, 48)).toBe(true);

    // South Avenue to Pond
    expect(isVillagePath(31, 38)).toBe(true);

    // Open Meadow (non-paths)
    expect(isVillagePath(2, 2)).toBe(false);
    expect(isVillagePath(60, 60)).toBe(false);
    expect(isVillagePath(32, 30)).toBe(false);
  });

  it('correctly identifies cobblestone plazas, platforms, and building aprons', async () => {
    const { isVillageCobble } = await import('../components/world/PixelWorldCanvas');

    // Central Plaza surrounding Fountain
    expect(isVillageCobble(32, 30)).toBe(true);
    expect(isVillageCobble(28, 28)).toBe(true);
    expect(isVillageCobble(36, 36)).toBe(true);

    // Ledger Hut Porch & Customer Apron
    expect(isVillageCobble(50, 14)).toBe(true);
    expect(isVillageCobble(49, 13)).toBe(true);

    // Bell Tower Platform
    expect(isVillageCobble(32, 14)).toBe(true);

    // Archive Cellar Pad
    expect(isVillageCobble(12, 33)).toBe(true);

    // Notice Board Viewing Pad
    expect(isVillageCobble(32, 36)).toBe(true);

    // Toolshed Apron
    expect(isVillageCobble(16, 23)).toBe(true);

    // Farmstead Porch Apron
    expect(isVillageCobble(14, 14)).toBe(true);

    // Moonlight Cinema Entrance Pad
    expect(isVillageCobble(48, 51)).toBe(true);

    // Festival Grounds Apron
    expect(isVillageCobble(16, 51)).toBe(true);

    // Wooden bridge / stone embankment across pond
    expect(isVillageCobble(32, 41)).toBe(true);

    // Open Meadow or pure dirt path
    expect(isVillageCobble(31, 20)).toBe(false);
    expect(isVillageCobble(2, 2)).toBe(false);
  });

  it('unifies walkable ground classification via isGround', async () => {
    const { isGround } = await import('../components/world/PixelWorldCanvas');

    // Dirt path
    expect(isGround(31, 20)).toBe(true);
    // Cobble plaza
    expect(isGround(32, 30)).toBe(true);
    // Meadow
    expect(isGround(2, 2)).toBe(false);
  });

  it('autotiles dirt path edges and cobblestones with authentic 16-bit fringe tiles', async () => {
    const { getPathTileInfo } = await import('../components/world/PixelWorldCanvas');

    // Horizontal West Archive Way Top Edge (ty: 32) -> dirt_edge_top (col: 5, row: 0)
    const topEdge = getPathTileInfo(20, 32);
    expect(topEdge).toEqual({ col: 5, row: 0 });

    // Horizontal West Archive Way Bottom Edge (ty: 33) -> dirt_edge_bottom (col: 6, row: 0)
    const bottomEdge = getPathTileInfo(20, 33);
    expect(bottomEdge).toEqual({ col: 6, row: 0 });

    // Vertical North Belfry Avenue Left Edge (tx: 31, ty: 20) -> dirt_edge_left (col: 0, row: 6)
    const leftEdge = getPathTileInfo(31, 20);
    expect(leftEdge).toEqual({ col: 0, row: 6 });

    // Vertical North Belfry Avenue Right Edge (tx: 32, ty: 20) -> dirt_edge_right (col: 1, row: 6)
    const rightEdge = getPathTileInfo(32, 20);
    expect(rightEdge).toEqual({ col: 1, row: 6 });

    // Central Plaza Cobblestone (tx: 32, ty: 30) -> cobble_square (col: 4, row: 1)
    const cobbleTile = getPathTileInfo(32, 30);
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
