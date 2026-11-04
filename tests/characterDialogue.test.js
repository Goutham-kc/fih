import { describe, it, expect, vi } from 'vitest';
import { CHARACTER_META } from '../components/character/CharacterSprite';
import { CHARACTERS } from '../lib/pixelValleyTheme';
import { VILLAGE_DIALOGUE, getContextualDialogue } from '../content/dialogue';
import { soundManager } from '../lib/soundManager';

const FORBIDDEN_NAMES = [
  'pierre',
  'robin',
  'evelyn',
  'lewis',
  'gunther',
  'junimo',
  'pelican town',
  'stardew',
];

describe('Original Cast Roster & IP Compliance (Spec Section 2.1 & 6)', () => {
  const EXPECTED_CHARACTERS = [
    'pip',
    'hoot',
    'marigold',
    'bram',
    'juniper',
    'moss',
    'wren',
    'clover',
    'rowan',
  ];

  it('contains exactly the 9 original Fih Valley characters in metadata', () => {
    EXPECTED_CHARACTERS.forEach((id) => {
      expect(CHARACTER_META[id]).toBeDefined();
      expect(CHARACTER_META[id].name).toBeTruthy();
      expect(CHARACTER_META[id].role).toBeTruthy();
      expect(CHARACTER_META[id].color).toMatch(/^#[0-9a-fA-F]{6}$/);
    });
  });

  it('contains all 9 characters in the theme registry with defined chapters', () => {
    EXPECTED_CHARACTERS.forEach((id) => {
      expect(CHARACTERS[id]).toBeDefined();
      expect(CHARACTERS[id].chapter).toBeTruthy();
      expect(CHARACTERS[id].themeColor).toBeTruthy();
    });
  });

  it('strictly contains zero forbidden Stardew Valley names in any character data', () => {
    const metaString = JSON.stringify(CHARACTER_META).toLowerCase();
    const themeString = JSON.stringify(CHARACTERS).toLowerCase();

    FORBIDDEN_NAMES.forEach((name) => {
      expect(metaString).not.toContain(name);
      expect(themeString).not.toContain(name);
    });
  });
});

describe('Village Dialogue Engine & Lore (Spec Section 6)', () => {
  const REQUIRED_TABS = [
    'todos',
    'reminders',
    'deadlines',
    'debts',
    'dates',
    'watchlist',
    'audit',
    'settings',
  ];

  it('has complete dialogue sets for every chapter tab', () => {
    REQUIRED_TABS.forEach((tab) => {
      const chapter = VILLAGE_DIALOGUE[tab];
      expect(chapter).toBeDefined();
      expect(chapter.character).toBeTruthy();
      expect(chapter.chapterTitle).toBeTruthy();
      expect(chapter.tales.length).toBeGreaterThanOrEqual(2);
      expect(chapter.morning).toBeTruthy();
      expect(chapter.evening).toBeTruthy();
      expect(chapter.night).toBeTruthy();
      expect(chapter.rain).toBeTruthy();
      expect(chapter.snow).toBeTruthy();
    });
  });

  it('contains zero forbidden names in all dialogue lines', () => {
    const dialogueString = JSON.stringify(VILLAGE_DIALOGUE).toLowerCase();
    FORBIDDEN_NAMES.forEach((name) => {
      expect(dialogueString).not.toContain(name);
    });
  });

  it('selects contextual dialogue matching weather, time, and empty states', () => {
    const rainText = getContextualDialogue('todos', { weather: 'rain' });
    expect(rainText).toContain('rain');

    const snowText = getContextualDialogue('todos', { weather: 'snow' });
    expect(snowText).toContain('Frost');

    const morningText = getContextualDialogue('todos', { timeOfDay: 'morning' });
    expect(morningText).toContain('morning');

    const emptyText = getContextualDialogue('debts', { isEmpty: true });
    expect(emptyText).toContain('clean');
  });
});

describe('Dialogue Audio Synthesis (Spec Section 8.3)', () => {
  it('supports character-specific dialogue blips without throwing', () => {
    expect(() => {
      soundManager.playDialogueBlip('pip');
      soundManager.playDialogueBlip('hoot');
      soundManager.playDialogueBlip('bram');
      soundManager.playDialogueBlip('marigold');
      soundManager.playDialogueBlip('juniper');
      soundManager.playDialogueBlip('moss');
      soundManager.playDialogueBlip('wren');
      soundManager.playDialogueBlip('clover');
      soundManager.playDialogueBlip('rowan');
    }).not.toThrow();
  });
});
