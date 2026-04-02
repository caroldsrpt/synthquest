// === Card Types ===

export type CardCategory = 'text' | 'structure' | 'logic' | 'vision' | 'noise';
export type CardRarity = 'starter' | 'common' | 'uncommon' | 'rare';
export type CardTarget = 'singleEnemy' | 'allEnemies' | 'self' | 'none';

export interface CardDef {
  id: string;
  name: string;
  category: CardCategory;
  rarity: CardRarity;
  cost: number;
  target: CardTarget;
  description: string;
  effects: CardEffect[];
  upgraded?: Partial<Pick<CardDef, 'cost' | 'description' | 'effects'>>;
  keywords?: CardKeyword[];
  act: 1 | 2 | 3; // earliest act this card appears
}

export type CardKeyword = 'exhaust' | 'retain' | 'autoplay';

export interface CardInstance {
  id: string; // unique instance ID
  defId: string; // references CardDef.id
  upgraded: boolean;
  costOverride?: number; // temporary cost changes (e.g., Random Seed makes cards cost 0)
}

export type CardEffect =
  | { type: 'damage'; amount: number; times?: number }
  | { type: 'damageRandom'; min: number; max: number }
  | { type: 'damageAll'; amount: number }
  | { type: 'firewall'; amount: number }
  | { type: 'firewallFromMissingHp' }
  | { type: 'applyStatus'; status: StatusType; stacks: number; target: 'self' | 'enemy' }
  | { type: 'removeStatus'; status: StatusType | 'all'; target: 'self' }
  | { type: 'draw'; amount: number }
  | { type: 'gainContext'; amount: number }
  | { type: 'gainGrounded'; amount: number }
  | { type: 'conditionalDamage'; amount: number; condition: 'enemyAboveHalfHp' }
  | { type: 'playFromDraw'; maxPlays?: number; onlyIfDamage?: boolean }
  | { type: 'replayLastCard' }
  | { type: 'playFromHand'; count: number }
  | { type: 'addTempCards'; cardId: string; count: number; costOverride?: number }
  | { type: 'addRandomCards'; rarity: CardRarity; count: number; costOverride?: number }
  | { type: 'exhaustFromHand' } // player picks a card to exhaust
  | { type: 'scry'; amount: number } // look at top N, pick 1
  | { type: 'copyEnemyIntent' }
  | { type: 'permanentUpgradePrompt' }
  | { type: 'heal'; amount: number }
  | { type: 'damagePerExhaust'; multiplier: number };

// === Status Effects ===

export type StatusType =
  | 'hallucination'
  | 'vulnerable'
  | 'weak'
  | 'throttled'
  | 'confused'
  | 'overfit'
  | 'grounded'
  | 'context'
  | 'intangible';

export interface StatusStack {
  status: StatusType;
  stacks: number;
}

// === Enemy Types ===

export type IntentType =
  | { type: 'attack'; damage: number }
  | { type: 'attackMulti'; damage: number; times: number }
  | { type: 'defend'; firewall: number }
  | { type: 'buff'; description: string }
  | { type: 'debuff'; status: StatusType; stacks: number }
  | { type: 'attackDebuff'; damage: number; status: StatusType; stacks: number }
  | { type: 'unknown' };

export interface EnemyDef {
  id: string;
  name: string;
  type: 'normal' | 'elite' | 'boss';
  baseHp: number;
  baseFirewall?: number;
  acts: number[]; // which acts this enemy appears in
  intentPattern: 'cycle' | 'ai'; // cycle = fixed pattern, ai = computed
}

export interface EnemyInstance {
  id: string;
  defId: string;
  hp: number;
  maxHp: number;
  firewall: number;
  statusEffects: StatusStack[];
  currentIntent: IntentType;
  intentHistory: IntentType[];
  turnCounter: number;
  // Boss-specific
  phase?: number;
  customState?: Record<string, number>;
}

// === Relic Types ===

export interface RelicDef {
  id: string;
  name: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'boss';
  description: string;
  aiConcept: string;
}

// === Event Types ===

export interface EventChoice {
  label: string;
  description: string;
  effect: EventEffect[];
}

export type EventEffect =
  | { type: 'addCard'; cardId: string }
  | { type: 'addRandomCard'; category?: CardCategory; rarity?: CardRarity }
  | { type: 'removeCard' } // player picks
  | { type: 'gold'; amount: number }
  | { type: 'maxIntegrity'; amount: number }
  | { type: 'heal'; percent: number }
  | { type: 'startNextCombatWith'; status: StatusType; stacks: number }
  | { type: 'startNextCombatWithFirewall'; amount: number; combats: number }
  | { type: 'loseIntegrity'; amount: number }
  | { type: 'tempMaxEnergy'; amount: number; combats: number }
  | { type: 'exhaustRandomCards'; count: number };

export interface EventDef {
  id: string;
  name: string;
  description: string;
  act: 1 | 2 | 3;
  choices: EventChoice[];
}

// === Map Types ===

export type MapNodeType = 'combat' | 'elite' | 'event' | 'shop' | 'rest' | 'boss';

export interface MapNode {
  id: string;
  row: number;
  col: number;
  type: MapNodeType;
  connections: string[]; // IDs of nodes in next row
  visited: boolean;
  // Combat-specific
  enemies?: string[]; // enemy def IDs for this encounter
}

// === Run State ===

export interface RunState {
  active: boolean;
  act: 1 | 2 | 3;
  floor: number;
  maxIntegrity: number;
  currentIntegrity: number;
  gold: number;
  deck: CardInstance[];
  relics: string[];
  map: MapNode[][];
  currentNodeId: string | null;
  visitedNodeIds: string[];
  cardRemovalCount: number;
  teachingTriggersShown: string[];
  // Temporary per-combat event buffs
  nextCombatStatus?: { status: StatusType; stacks: number }[];
  nextCombatFirewall?: { amount: number; combatsLeft: number };
  tempMaxEnergy?: { amount: number; combatsLeft: number };
}

// === Combat State ===

export type CombatPhase = 'start' | 'playerTurn' | 'targeting' | 'enemyTurn' | 'reward' | 'ended';

export interface CombatState {
  active: boolean;
  turn: number;
  energy: number;
  maxEnergy: number;
  hand: CardInstance[];
  drawPile: CardInstance[];
  discardPile: CardInstance[];
  exhaustPile: CardInstance[];
  enemies: EnemyInstance[];
  playerFirewall: number;
  playerStatus: StatusStack[];
  phase: CombatPhase;
  selectedCardIndex: number | null;
  targetingCardIndex: number | null;
  log: string[];
  lastCardPlayedId: string | null;
  lastTargetedEnemyId: string | null;
  totalDamageDealtThisTurn: number;
  totalFirewallGainedThisTurn: number;
  cardsPlayedThisTurn: string[]; // card def IDs
  categoryCountThisTurn: Record<CardCategory, number>;
  goldReward: number;
  cardRewards: CardDef[];
  relicReward: RelicDef | null;
}

// === Meta State (persistent across runs) ===

export interface MetaState {
  knowledgeUnlocked: string[];
  totalRuns: number;
  bestAct: number;
  wins: number;
  cardsSeenIds: string[];
}

// === Screen State ===

export type GameScreen =
  | 'title'
  | 'map'
  | 'combat'
  | 'reward'
  | 'event'
  | 'shop'
  | 'rest'
  | 'gameOver'
  | 'victory'
  | 'knowledgeBase';
