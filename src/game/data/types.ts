// === Core Game Types ===

export type SynthType = 'text' | 'structure' | 'logic' | 'vision' | 'noise';

export type StatusEffect = 'hallucinating' | 'overfit' | 'throttled' | 'confused' | 'grounded';

export interface Move {
  id: string;
  name: string;
  type: SynthType;
  power: number; // 0 = status move
  accuracy: number; // 0-100
  pp: number; // max uses
  description: string;
  statusEffect?: {
    target: 'self' | 'opponent';
    effect: StatusEffect;
    chance: number; // 0-100
    duration: number; // turns
  };
  statModifier?: {
    target: 'self' | 'opponent';
    stat: keyof SynthStats;
    stages: number; // negative = debuff
  };
  charge?: boolean; // takes a turn to charge
}

export interface SynthStats {
  output: number;   // attack
  clarity: number;  // defense
  memory: number;   // HP
  speed: number;
  confidence: number; // accuracy modifier
}

export interface SynthEvolution {
  into: string; // synth ID
  condition: EvolutionCondition;
}

export type EvolutionCondition =
  | { type: 'level'; level: number }
  | { type: 'hasMove'; moveType: SynthType }
  | { type: 'hasStat'; stat: keyof SynthStats; min: number }
  | { type: 'partyHasType'; synthType: SynthType }
  | { type: 'statusCount'; status: StatusEffect; count: number };

export interface SynthSpecies {
  id: string;
  name: string;
  description: string;
  types: SynthType[];
  baseStats: SynthStats;
  learnset: { level: number; moveId: string }[];
  evolution?: SynthEvolution;
  captureRate: number; // 0-255
}

export interface SynthInstance {
  id: string; // unique instance ID
  speciesId: string;
  nickname?: string;
  level: number;
  xp: number;
  stats: SynthStats;
  currentMemory: number; // current HP
  moves: { moveId: string; currentPP: number }[];
  statusEffects: { effect: StatusEffect; turnsLeft: number }[];
  equippedItem?: string;
}

// === Map Types ===

export interface TileLayer {
  name: string;
  data: number[];
  width: number;
  height: number;
  visible: boolean;
}

export interface MapObject {
  id: number;
  name: string;
  type: 'npc' | 'warp' | 'data-stream' | 'item' | 'sign';
  x: number;
  y: number;
  width: number;
  height: number;
  properties?: Record<string, string | number | boolean>;
}

export interface GameMap {
  id: string;
  name: string;
  width: number; // in tiles
  height: number;
  tileSize: number;
  layers: TileLayer[];
  collisionLayer: number[]; // 0 = walkable, 1 = solid
  objects: MapObject[];
  encounterRate?: number; // chance per step in data streams
  encounters?: { synthId: string; minLevel: number; maxLevel: number; weight: number }[];
}

// === NPC / Dialog Types ===

export interface DialogLine {
  speaker?: string;
  text: string;
  condition?: string; // flag that must be set
}

export interface NPC {
  id: string;
  name: string;
  spriteId: string;
  dialog: DialogLine[];
  direction: Direction;
}

export type Direction = 'up' | 'down' | 'left' | 'right';

// === Item Types ===

export interface Item {
  id: string;
  name: string;
  description: string;
  category: 'healing' | 'capture' | 'equip' | 'key' | 'battle';
  effect?: ItemEffect;
}

export type ItemEffect =
  | { type: 'heal'; amount: number }
  | { type: 'capture'; rateBonus: number }
  | { type: 'cureStatus'; status: StatusEffect | 'all' }
  | { type: 'teachMove'; moveId: string }
  | { type: 'equipStat'; stat: keyof SynthStats; bonus: number };

// === Battle Types ===

export type BattleAction =
  | { type: 'move'; moveIndex: number }
  | { type: 'switch'; synthIndex: number }
  | { type: 'item'; itemId: string; targetIndex?: number }
  | { type: 'flee' }
  | { type: 'capture'; itemId: string };

export interface BattleState {
  type: 'wild' | 'trainer';
  playerSynth: SynthInstance;
  opponentSynth: SynthInstance;
  opponentParty?: SynthInstance[];
  opponentName?: string;
  turn: number;
  log: string[];
  phase: 'select' | 'animating' | 'ended';
  result?: 'win' | 'lose' | 'flee' | 'capture';
}

// === Player / Progress Types ===

export interface PlayerState {
  name: string;
  rank: number;
  rankTitle: string;
  badges: string[];
  flags: Record<string, boolean>;
  currentMapId: string;
  position: { x: number; y: number };
  direction: Direction;
  money: number;
  playtime: number;
  libraryNotes: string[]; // unlocked "aha" concept notes
}
