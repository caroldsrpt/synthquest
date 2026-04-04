export const VIEWPORT_WIDTH = 960;
export const VIEWPORT_HEIGHT = 600;

// Combat balance
export const BASE_ENERGY = 3;
export const BASE_INTEGRITY = 70;
export const HAND_SIZE = 5;
export const CONTEXT_CAP = 8;
export const HALLUCINATION_TRIGGER_CHANCE = 0.3;
export const HALLUCINATION_SELF_DAMAGE = 3;

// Gold economy
export const STARTING_GOLD = 99;
export const COMBAT_GOLD_MIN = 10;
export const COMBAT_GOLD_MAX = 20;
export const ELITE_GOLD_MIN = 25;
export const ELITE_GOLD_MAX = 35;
export const BOSS_GOLD_MIN = 50;
export const BOSS_GOLD_MAX = 75;

// Shop prices
export const SHOP_PRICE_COMMON = 50;
export const SHOP_PRICE_UNCOMMON = 75;
export const SHOP_PRICE_RARE = 150;
export const SHOP_CARD_REMOVAL_BASE = 75;
export const SHOP_CARD_REMOVAL_INCREMENT = 25;
export const SHOP_RELIC_COMMON = 150;
export const SHOP_RELIC_UNCOMMON = 250;

// Card reward rarity weights
export const REWARD_WEIGHTS = {
  normal: { common: 60, uncommon: 30, rare: 10 },
  elite: { common: 25, uncommon: 50, rare: 25 },
  boss: { common: 0, uncommon: 40, rare: 60 },
} as const;

// Rest site
export const REST_HEAL_PERCENT = 0.3;

// Between acts
export const BETWEEN_ACT_HEAL_PERCENT = 0.25;

// Map
export const MAP_COLS = 7;
export const MAP_ROWS = 15;

export const COLORS = {
  bg: '#0f0f23',
  bgLight: '#1a1a3e',
  text: '#e0e0e0',
  textDim: '#6b7280',
  textMuted: '#4b5563',
  accent: '#7b68ee',
  accentDim: 'rgba(123, 104, 238, 0.2)',
  border: '#2d2d5e',
  borderDim: '#374151',
  hp: '#4ade80',
  hpLow: '#ef4444',
  hpMid: '#fbbf24',
  firewall: '#60a5fa',
  energy: '#fbbf24',
  gold: '#fbbf24',
  categories: {
    text: '#a78bfa',
    structure: '#60a5fa',
    logic: '#f472b6',
    vision: '#fbbf24',
    noise: '#34d399',
    curse: '#ef4444',
  } as Record<string, string>,
  rarity: {
    starter: '#9ca3af',
    common: '#e0e0e0',
    uncommon: '#60a5fa',
    rare: '#fbbf24',
    curse: '#ef4444',
  } as Record<string, string>,
} as const;
