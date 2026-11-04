// Pixel Valley - 32-Color Warm Village Palette & Theme Constants
// Strictly original design tokens adhering to spec Section 3.2

export const PIXEL_VALLEY_PALETTE = {
  // Vegetation & Terrain
  grassLight: '#8fc45a',
  grassDark: '#5e9440',
  soil: '#7a4e2d',
  soilDark: '#54331a',

  // Timber & Architecture
  woodLight: '#c98f55',
  woodMedium: '#a36c3a',
  woodDark: '#7b4a28',
  woodDeep: '#4a2811',

  // Canvas & Ink (10.4:1 contrast ratio, WCAG AAA compliant)
  parchment: '#f4e4bc',
  parchmentLight: '#fbf3dd',
  parchmentDark: '#e5cca0',
  parchmentBorder: '#d3b27d',
  ink: '#3b2a1e',
  inkMuted: '#6d5543',
  inkLight: '#8c735d',

  // Skies & Weather
  skyDay: '#9fd8f0',
  skyDusk: '#f3a65f',
  skyNight: '#1f2a4d',
  water: '#4f9bd1',

  // Rewards & Accents
  gold: '#f2c230',
  goldDark: '#c49615',
  goldLight: '#fde047',
  berry: '#c2415a',
  berryDark: '#991b1b',
  berryLight: '#f43f5e',

  // Stones & Neutrals
  stoneLight: '#b0ada8',
  stone: '#8d8a86',
  stoneDark: '#5c5956',
  stoneDeep: '#343230',

  // Night & Shadow
  nightVoid: '#0f1424',
  shadowSoft: 'rgba(59, 42, 30, 0.35)',
  shadowHard: 'rgba(20, 15, 10, 0.65)',
};

export const PIXEL_RENDERING = {
  crispImage: 'image-rendering: pixelated; image-rendering: -moz-crisp-edges; image-rendering: crisp-edges;',
  crispSvg: 'shape-rendering: crispEdges;',
  scale2x: 'transform: scale(2); transform-origin: top left;',
  scale3x: 'transform: scale(3); transform-origin: top left;',
};

export const CHARACTERS = {
  pip: {
    id: 'pip',
    name: 'Pip',
    role: 'Homestead Farmer',
    chapter: 'The Farmhouse Mornings',
    tab: 'todos',
    avatar: '👨‍🌾',
    themeColor: '#8fc45a',
  },
  hoot: {
    id: 'hoot',
    name: 'Hoot',
    role: 'Clock Tower Owl',
    chapter: 'The Bell Tower',
    tab: 'reminders',
    avatar: '🦉',
    themeColor: '#4f9bd1',
  },
  marigold: {
    id: 'marigold',
    name: 'Marigold',
    role: 'Market Board Rabbit',
    chapter: 'The Harvest Calendar',
    tab: 'deadlines',
    avatar: '🐇',
    themeColor: '#c2415a',
  },
  bram: {
    id: 'bram',
    name: 'Bram',
    role: 'Ledger Badger',
    chapter: 'The Ledger Hut',
    tab: 'debts',
    avatar: '🦡',
    themeColor: '#f2c230',
  },
  juniper: {
    id: 'juniper',
    name: 'Juniper',
    role: 'Projectionist Fox',
    chapter: 'The Moonlight Cinema',
    tab: 'watchlist',
    avatar: '🦊',
    themeColor: '#9333ea',
  },
  moss: {
    id: 'moss',
    name: 'Moss',
    role: 'Archivist Turtle',
    chapter: 'The Archive Cellar',
    tab: 'audit',
    avatar: '🐢',
    themeColor: '#5e9440',
  },
  wren: {
    id: 'wren',
    name: 'Wren',
    role: 'Messenger Pigeon',
    chapter: 'Cross-Chapter Dispatch',
    tab: 'whatsapp',
    avatar: '🕊️',
    themeColor: '#38bdf8',
  },
  clover: {
    id: 'clover',
    name: 'Clover',
    role: 'Village Elder & Gardener',
    chapter: 'The Festival Grounds',
    tab: 'dates',
    avatar: '🐐',
    themeColor: '#ec4899',
  },
  rowan: {
    id: 'rowan',
    name: 'Rowan',
    role: 'Village Builder & Tinkerer',
    chapter: 'The Toolshed',
    tab: 'settings',
    avatar: '🦔',
    themeColor: '#c98f55',
  },
};
