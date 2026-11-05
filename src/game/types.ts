export interface SpriteManifestEntry {
  frame_size: [number, number];
  frame_len?: number;
  duration?: number;
  offset?: {
    horizontal?: string | number;
    vertical?: string | number;
  };
}

export type VillageManifest = Record<string, SpriteManifestEntry>;

export interface MovementVector {
  vx: number;
  vy: number;
}

export interface PlayerDirection {
  current: 'up' | 'down' | 'left' | 'right';
}
