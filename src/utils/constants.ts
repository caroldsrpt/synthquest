export const TILE_SIZE = 16;
export const SCALE = 3; // pixel art upscale
export const SCALED_TILE = TILE_SIZE * SCALE; // 48px rendered

export const VIEWPORT_TILES_X = 15; // odd number for centering
export const VIEWPORT_TILES_Y = 11;
export const VIEWPORT_WIDTH = VIEWPORT_TILES_X * SCALED_TILE; // 720
export const VIEWPORT_HEIGHT = VIEWPORT_TILES_Y * SCALED_TILE; // 528

export const PLAYER_SPEED = 3; // tiles per second
export const ENCOUNTER_CHECK_STEPS = 4; // check every N steps in data streams

export const MAX_PARTY_SIZE_BY_RANK = [1, 2, 3, 4, 5, 6];
export const MAX_MOVES = 4;

export const XP_BASE = 50; // XP needed for level 2
export const XP_GROWTH = 1.2; // multiplier per level

export const COLORS = {
  bg: '#1a1a2e',
  text: '#e0e0e0',
  textDark: '#0f0f23',
  accent: '#7b68ee',
  hp: '#4ade80',
  hpLow: '#ef4444',
  xp: '#60a5fa',
  types: {
    text: '#a78bfa',
    structure: '#60a5fa',
    logic: '#f472b6',
    vision: '#fbbf24',
    noise: '#34d399',
  },
} as const;
