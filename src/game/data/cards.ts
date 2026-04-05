import type { CardDef } from './types';

export const CARDS: Record<string, CardDef> = {
  // ============ GENERATION (text) ============
  prompt: {
    id: 'prompt', name: 'Prompt', category: 'text', rarity: 'starter', cost: 1,
    target: 'singleEnemy', act: 1,
    description: 'Deal 6 damage.',
    effects: [{ type: 'damage', amount: 6 }],
    upgraded: { description: 'Deal 9 damage.', effects: [{ type: 'damage', amount: 9 }] },
  },
  autocomplete: {
    id: 'autocomplete', name: 'Autocomplete', category: 'text', rarity: 'starter', cost: 0,
    target: 'singleEnemy', act: 1,
    description: 'Deal 3 damage.',
    effects: [{ type: 'damage', amount: 3 }],
    upgraded: { description: 'Deal 5 damage.', effects: [{ type: 'damage', amount: 5 }] },
  },
  verboseOutput: {
    id: 'verboseOutput', name: 'Verbose Output', category: 'text', rarity: 'common', cost: 2,
    target: 'singleEnemy', act: 1,
    description: 'Deal 14 damage.',
    effects: [{ type: 'damage', amount: 14 }],
    upgraded: { description: 'Deal 18 damage.', effects: [{ type: 'damage', amount: 18 }] },
  },
  summarize: {
    id: 'summarize', name: 'Summarize', category: 'text', rarity: 'common', cost: 1,
    target: 'none', act: 1,
    description: 'Draw 2 cards.',
    effects: [{ type: 'draw', amount: 2 }],
    upgraded: { description: 'Draw 3 cards.', effects: [{ type: 'draw', amount: 3 }] },
  },
  systemPrompt: {
    id: 'systemPrompt', name: 'System Prompt', category: 'text', rarity: 'uncommon', cost: 1,
    target: 'singleEnemy', act: 2,
    description: 'Deal 4 damage. Gain 2 Context.',
    effects: [{ type: 'damage', amount: 4 }, { type: 'gainContext', amount: 2 }],
    upgraded: { description: 'Deal 6 damage. Gain 3 Context.', effects: [{ type: 'damage', amount: 6 }, { type: 'gainContext', amount: 3 }] },
  },
  chainOfThought: {
    id: 'chainOfThought', name: 'Chain of Thought', category: 'text', rarity: 'rare', cost: 2,
    target: 'singleEnemy', act: 3,
    description: 'Deal 8 damage twice.',
    effects: [{ type: 'damage', amount: 8, times: 2 }],
    upgraded: { description: 'Deal 10 damage twice.', effects: [{ type: 'damage', amount: 10, times: 2 }] },
  },
  fewShotExample: {
    id: 'fewShotExample', name: 'Few-Shot Example', category: 'text', rarity: 'uncommon', cost: 1,
    target: 'none', act: 2,
    description: 'Replay the last card you played this turn for free.',
    effects: [{ type: 'replayLastCard' }],
    upgraded: { cost: 0, description: 'Replay the last card you played this turn for free.' },
  },
  fineTune: {
    id: 'fineTune', name: 'Fine-Tune', category: 'text', rarity: 'rare', cost: 3,
    target: 'singleEnemy', act: 3, keywords: ['exhaust'],
    description: 'Deal 20 damage. Exhaust. Permanently upgrade a random Prompt in your deck.',
    effects: [{ type: 'damage', amount: 20 }, { type: 'permanentUpgradePrompt' }],
    upgraded: { description: 'Deal 28 damage. Exhaust. Permanently upgrade a random Prompt.', effects: [{ type: 'damage', amount: 28 }, { type: 'permanentUpgradePrompt' }] },
  },
  streamingResponse: {
    id: 'streamingResponse', name: 'Streaming Response', category: 'text', rarity: 'rare', cost: 1,
    target: 'singleEnemy', act: 3,
    description: 'Deal 1 damage 6 times.',
    effects: [{ type: 'damage', amount: 1, times: 6 }],
    upgraded: { description: 'Deal 1 damage 8 times.', effects: [{ type: 'damage', amount: 1, times: 8 }] },
  },

  // ============ GROUNDING (structure) ============
  errorHandle: {
    id: 'errorHandle', name: 'Error Handle', category: 'structure', rarity: 'starter', cost: 1,
    target: 'self', act: 1,
    description: 'Gain 5 Firewall.',
    effects: [{ type: 'firewall', amount: 5 }],
    upgraded: { description: 'Gain 8 Firewall.', effects: [{ type: 'firewall', amount: 8 }] },
  },
  inputValidation: {
    id: 'inputValidation', name: 'Input Validation', category: 'structure', rarity: 'common', cost: 1,
    target: 'self', act: 1,
    description: 'Gain 5 Firewall. Remove 1 Confused.',
    effects: [{ type: 'firewall', amount: 5 }, { type: 'removeStatus', status: 'confused', target: 'self' }],
    upgraded: { description: 'Gain 7 Firewall. Remove 1 Confused.', effects: [{ type: 'firewall', amount: 7 }, { type: 'removeStatus', status: 'confused', target: 'self' }] },
  },
  cacheHit: {
    id: 'cacheHit', name: 'Cache Hit', category: 'structure', rarity: 'common', cost: 0,
    target: 'self', act: 1,
    description: 'Gain 3 Firewall. If played last turn, gain 8 instead.',
    effects: [{ type: 'firewall', amount: 3 }], // conditional handled in CombatSystem
    upgraded: { description: 'Gain 4 Firewall. If played last turn, gain 11 instead.', effects: [{ type: 'firewall', amount: 4 }] },
  },
  databaseQuery: {
    id: 'databaseQuery', name: 'Database Query', category: 'structure', rarity: 'uncommon', cost: 1,
    target: 'self', act: 2,
    description: 'Gain 7 Firewall. Gain 2 Context.',
    effects: [{ type: 'firewall', amount: 7 }, { type: 'gainContext', amount: 2 }],
    upgraded: { description: 'Gain 9 Firewall. Gain 3 Context.', effects: [{ type: 'firewall', amount: 9 }, { type: 'gainContext', amount: 3 }] },
  },
  groundTruth: {
    id: 'groundTruth', name: 'Ground Truth', category: 'structure', rarity: 'uncommon', cost: 1,
    target: 'self', act: 2,
    description: 'Gain 2 Grounded.',
    effects: [{ type: 'gainGrounded', amount: 2 }],
    upgraded: { description: 'Gain 3 Grounded.', effects: [{ type: 'gainGrounded', amount: 3 }] },
  },
  citeSource: {
    id: 'citeSource', name: 'Cite Source', category: 'structure', rarity: 'rare', cost: 2,
    target: 'self', act: 2,
    description: 'Gain 10 Firewall. Gain 3 Grounded.',
    effects: [{ type: 'firewall', amount: 10 }, { type: 'gainGrounded', amount: 3 }],
    upgraded: { description: 'Gain 13 Firewall. Gain 4 Grounded.', effects: [{ type: 'firewall', amount: 13 }, { type: 'gainGrounded', amount: 4 }] },
  },
  schemaEnforce: {
    id: 'schemaEnforce', name: 'Schema Enforce', category: 'structure', rarity: 'uncommon', cost: 1,
    target: 'self', act: 2,
    description: 'Gain 8 Firewall. Exhaust a card in your hand.',
    effects: [{ type: 'firewall', amount: 8 }, { type: 'exhaustFromHand' }],
    upgraded: { description: 'Gain 11 Firewall. Exhaust a card in your hand.', effects: [{ type: 'firewall', amount: 11 }, { type: 'exhaustFromHand' }] },
  },
  persistentMemory: {
    id: 'persistentMemory', name: 'Persistent Memory', category: 'structure', rarity: 'rare', cost: 2,
    target: 'self', act: 3, keywords: ['retain'],
    description: 'Gain 12 Firewall. Retain.',
    effects: [{ type: 'firewall', amount: 12 }],
    upgraded: { description: 'Gain 16 Firewall. Retain.', effects: [{ type: 'firewall', amount: 16 }] },
  },
  backupRestore: {
    id: 'backupRestore', name: 'Backup & Restore', category: 'structure', rarity: 'uncommon', cost: 1,
    target: 'self', act: 3,
    description: 'Gain Firewall equal to your missing Integrity.',
    effects: [{ type: 'firewallFromMissingHp' }],
    upgraded: { description: 'Gain Firewall equal to missing Integrity. Heal 3.', effects: [{ type: 'firewallFromMissingHp' }, { type: 'heal', amount: 3 }] },
  },

  // ============ REASONING (logic) ============
  webSearch: {
    id: 'webSearch', name: 'Web Search', category: 'logic', rarity: 'common', cost: 1,
    target: 'none', act: 1,
    description: 'Draw 2 cards. Gain 1 Context.',
    effects: [{ type: 'draw', amount: 2 }, { type: 'gainContext', amount: 1 }],
    upgraded: { description: 'Draw 2 cards. Gain 2 Context.', effects: [{ type: 'draw', amount: 2 }, { type: 'gainContext', amount: 2 }] },
  },
  retryLogic: {
    id: 'retryLogic', name: 'Retry Logic', category: 'logic', rarity: 'common', cost: 1,
    target: 'singleEnemy', act: 1,
    description: 'Deal 5 damage. If enemy HP > 50%, deal 5 again.',
    effects: [{ type: 'damage', amount: 5 }, { type: 'conditionalDamage', amount: 5, condition: 'enemyAboveHalfHp' }],
    upgraded: { description: 'Deal 7 damage. If enemy HP > 50%, deal 7 again.', effects: [{ type: 'damage', amount: 7 }, { type: 'conditionalDamage', amount: 7, condition: 'enemyAboveHalfHp' }] },
  },
  apiCall: {
    id: 'apiCall', name: 'API Call', category: 'logic', rarity: 'uncommon', cost: 1,
    target: 'singleEnemy', act: 2,
    description: 'Deal 8 damage. Draw 1 card.',
    effects: [{ type: 'damage', amount: 8 }, { type: 'draw', amount: 1 }],
    upgraded: { description: 'Deal 11 damage. Draw 1 card.', effects: [{ type: 'damage', amount: 11 }, { type: 'draw', amount: 1 }] },
  },
  toolUse: {
    id: 'toolUse', name: 'Tool Use', category: 'logic', rarity: 'uncommon', cost: 1,
    target: 'none', act: 2, keywords: ['autoplay'],
    description: 'Play the top card of your draw pile for free.',
    effects: [{ type: 'playFromDraw', maxPlays: 1 }],
    upgraded: { description: 'Play the top card of your draw pile for free. Draw 1.', effects: [{ type: 'playFromDraw', maxPlays: 1 }, { type: 'draw', amount: 1 }] },
  },
  planAhead: {
    id: 'planAhead', name: 'Plan Ahead', category: 'logic', rarity: 'uncommon', cost: 1,
    target: 'none', act: 2,
    description: 'Look at the top 3 cards of your draw pile. Put 1 in your hand.',
    effects: [{ type: 'scry', amount: 3 }],
    upgraded: { description: 'Look at the top 5 cards. Put 1 in your hand.', effects: [{ type: 'scry', amount: 5 }] },
  },
  agentLoop: {
    id: 'agentLoop', name: 'Agent Loop', category: 'logic', rarity: 'rare', cost: 2,
    target: 'none', act: 3, keywords: ['autoplay'],
    description: 'Play the top card of your draw pile. If it dealt damage, repeat (max 3).',
    effects: [{ type: 'playFromDraw', maxPlays: 3, onlyIfDamage: true }],
    upgraded: { description: 'Play top card. If damage, repeat (max 4).', effects: [{ type: 'playFromDraw', maxPlays: 4, onlyIfDamage: true }] },
  },
  orchestrator: {
    id: 'orchestrator', name: 'Orchestrator', category: 'logic', rarity: 'rare', cost: 3,
    target: 'none', act: 3, keywords: ['exhaust', 'autoplay'],
    description: 'Play 3 random cards from your hand for free. Exhaust.',
    effects: [{ type: 'playFromHand', count: 3 }],
    upgraded: { description: 'Play 4 random cards from your hand for free. Exhaust.', effects: [{ type: 'playFromHand', count: 4 }] },
  },
  mcpConnect: {
    id: 'mcpConnect', name: 'MCP Connect', category: 'logic', rarity: 'rare', cost: 1,
    target: 'singleEnemy', act: 3,
    description: "Copy the enemy's next intent as a free card in your hand.",
    effects: [{ type: 'copyEnemyIntent' }],
    upgraded: { description: "Copy enemy's intent as a free card. Gain 4 Firewall.", effects: [{ type: 'copyEnemyIntent' }, { type: 'firewall', amount: 4 }] },
  },

  // ============ ANALYSIS (vision) ============
  patternMatch: {
    id: 'patternMatch', name: 'Pattern Match', category: 'vision', rarity: 'common', cost: 1,
    target: 'singleEnemy', act: 1,
    description: 'Deal 4 damage. Apply 1 Vulnerable.',
    effects: [{ type: 'damage', amount: 4 }, { type: 'applyStatus', status: 'vulnerable', stacks: 1, target: 'enemy' }],
    upgraded: { description: 'Deal 6 damage. Apply 2 Vulnerable.', effects: [{ type: 'damage', amount: 6 }, { type: 'applyStatus', status: 'vulnerable', stacks: 2, target: 'enemy' }] },
  },
  classify: {
    id: 'classify', name: 'Classify', category: 'vision', rarity: 'common', cost: 1,
    target: 'singleEnemy', act: 1,
    description: 'Apply 2 Weak.',
    effects: [{ type: 'applyStatus', status: 'weak', stacks: 2, target: 'enemy' }],
    upgraded: { description: 'Apply 3 Weak.', effects: [{ type: 'applyStatus', status: 'weak', stacks: 3, target: 'enemy' }] },
  },
  scan: {
    id: 'scan', name: 'Scan', category: 'vision', rarity: 'uncommon', cost: 0,
    target: 'singleEnemy', act: 2,
    description: 'Gain 1 Context. (Reveals enemy intent patterns.)',
    effects: [{ type: 'gainContext', amount: 1 }],
    upgraded: { description: 'Gain 2 Context.', effects: [{ type: 'gainContext', amount: 2 }] },
  },
  anomalyDetection: {
    id: 'anomalyDetection', name: 'Anomaly Detection', category: 'vision', rarity: 'uncommon', cost: 1,
    target: 'singleEnemy', act: 2,
    description: "Deal damage equal to 3x the enemy's Hallucination stacks.",
    effects: [{ type: 'damage', amount: 0 }], // computed in CombatSystem
    upgraded: { description: "Deal 4x enemy's Hallucination stacks.", effects: [{ type: 'damage', amount: 0 }] },
  },
  benchmark: {
    id: 'benchmark', name: 'Benchmark', category: 'vision', rarity: 'rare', cost: 2,
    target: 'self', act: 3,
    description: 'Double your Context stacks (max 8).',
    effects: [{ type: 'gainContext', amount: 0 }], // computed: double current
    upgraded: { description: 'Double Context (max 8). Draw 1.', effects: [{ type: 'gainContext', amount: 0 }, { type: 'draw', amount: 1 }] },
  },

  // ============ CHAOS (noise) ============
  brainstorm: {
    id: 'brainstorm', name: 'Brainstorm', category: 'noise', rarity: 'starter', cost: 1,
    target: 'allEnemies', act: 1,
    description: 'Deal 3 damage to ALL enemies. Gain 1 Hallucination.',
    effects: [{ type: 'damageAll', amount: 3 }, { type: 'applyStatus', status: 'hallucination', stacks: 1, target: 'self' }],
    upgraded: { description: 'Deal 5 damage to ALL. Gain 1 Hallucination.', effects: [{ type: 'damageAll', amount: 5 }, { type: 'applyStatus', status: 'hallucination', stacks: 1, target: 'self' }] },
  },
  temperatureMax: {
    id: 'temperatureMax', name: 'Temperature Max', category: 'noise', rarity: 'common', cost: 1,
    target: 'singleEnemy', act: 1,
    description: 'Deal 1-20 random damage. Gain 1 Hallucination.',
    effects: [{ type: 'damageRandom', min: 1, max: 20 }, { type: 'applyStatus', status: 'hallucination', stacks: 1, target: 'self' }],
    upgraded: { description: 'Deal 1-26 random damage. Gain 1 Hallucination.', effects: [{ type: 'damageRandom', min: 1, max: 26 }, { type: 'applyStatus', status: 'hallucination', stacks: 1, target: 'self' }] },
  },
  temperatureZero: {
    id: 'temperatureZero', name: 'Temperature Zero', category: 'noise', rarity: 'common', cost: 1,
    target: 'singleEnemy', act: 1,
    description: 'Deal exactly 7 damage.',
    effects: [{ type: 'damage', amount: 7 }],
    upgraded: { description: 'Deal exactly 10 damage.', effects: [{ type: 'damage', amount: 10 }] },
  },
  jailbreak: {
    id: 'jailbreak', name: 'Jailbreak', category: 'noise', rarity: 'rare', cost: 0,
    target: 'self', act: 3, keywords: ['exhaust'],
    description: 'Remove ALL your status effects (good and bad). Exhaust.',
    effects: [{ type: 'removeStatus', status: 'all', target: 'self' }],
    upgraded: { description: 'Remove ALL status effects. Draw 2. Exhaust.', effects: [{ type: 'removeStatus', status: 'all', target: 'self' }, { type: 'draw', amount: 2 }] },
  },
  hallucinateData: {
    id: 'hallucinateData', name: 'Hallucinate Data', category: 'noise', rarity: 'common', cost: 1,
    target: 'self', act: 1,
    description: 'Gain 15 Firewall. Gain 2 Hallucination.',
    effects: [{ type: 'firewall', amount: 15 }, { type: 'applyStatus', status: 'hallucination', stacks: 2, target: 'self' }],
    upgraded: { description: 'Gain 20 Firewall. Gain 2 Hallucination.', effects: [{ type: 'firewall', amount: 20 }, { type: 'applyStatus', status: 'hallucination', stacks: 2, target: 'self' }] },
  },
  overfitTraining: {
    id: 'overfitTraining', name: 'Overfit Training', category: 'noise', rarity: 'uncommon', cost: 2,
    target: 'singleEnemy', act: 2,
    description: 'Deal 18 damage. Gain 3 Overfit.',
    effects: [{ type: 'damage', amount: 18 }, { type: 'applyStatus', status: 'overfit', stacks: 3, target: 'self' }],
    upgraded: { description: 'Deal 24 damage. Gain 3 Overfit.', effects: [{ type: 'damage', amount: 24 }, { type: 'applyStatus', status: 'overfit', stacks: 3, target: 'self' }] },
  },
  dataPoisoning: {
    id: 'dataPoisoning', name: 'Data Poisoning', category: 'noise', rarity: 'uncommon', cost: 2,
    target: 'singleEnemy', act: 2,
    description: 'Apply 3 Hallucination to an enemy.',
    effects: [{ type: 'applyStatus', status: 'hallucination', stacks: 3, target: 'enemy' }],
    upgraded: { description: 'Apply 4 Hallucination.', effects: [{ type: 'applyStatus', status: 'hallucination', stacks: 4, target: 'enemy' }] },
  },
  randomSeed: {
    id: 'randomSeed', name: 'Random Seed', category: 'noise', rarity: 'common', cost: 0,
    target: 'none', act: 1, keywords: ['exhaust'],
    description: 'Add 2 random common cards to your hand (cost 0 this turn). Exhaust.',
    effects: [{ type: 'addRandomCards', rarity: 'common', count: 2, costOverride: 0 }],
    upgraded: { description: 'Add 3 random common cards (cost 0). Exhaust.', effects: [{ type: 'addRandomCards', rarity: 'common', count: 3, costOverride: 0 }] },
  },
  modelCollapse: {
    id: 'modelCollapse', name: 'Model Collapse', category: 'noise', rarity: 'rare', cost: 0,
    target: 'allEnemies', act: 3, keywords: ['exhaust'],
    description: 'Deal damage to ALL enemies equal to exhausted cards x3. Exhaust.',
    effects: [{ type: 'damagePerExhaust', multiplier: 3 }],
    upgraded: { description: 'Deal exhausted cards x4 to ALL. Exhaust.', effects: [{ type: 'damagePerExhaust', multiplier: 4 }] },
  },

  // ============ CURSE CARDS ============
  hallucination: {
    id: 'hallucination', name: 'Glitch', category: 'curse', rarity: 'curse', cost: 0,
    target: 'self', act: 1,
    description: 'CURSE. Cannot be played. Deals 3 damage at end of turn, then exhausts.',
    effects: [{ type: 'damage', amount: 3 }],
  },

  // ============ TEMPORARY CARDS ============
  intentMirror: {
    id: 'intentMirror', name: 'Intent Mirror', category: 'logic', rarity: 'common', cost: 0,
    target: 'singleEnemy', act: 1, keywords: ['exhaust'],
    description: 'Mirrored enemy intent. Deal 5 damage.',
    effects: [{ type: 'damage', amount: 5 }],
  },

  // ============ POWER CARDS ============
  monitoring: {
    id: 'monitoring', name: 'Monitoring', category: 'structure', rarity: 'uncommon', cost: 1,
    target: 'self', act: 1, keywords: ['power'],
    description: 'POWER. Gain 3 Block at the start of each turn.',
    effects: [{ type: 'power_blockPerTurn', amount: 3 }],
    upgraded: { description: 'POWER. Gain 5 Block at the start of each turn.', effects: [{ type: 'power_blockPerTurn', amount: 5 }] },
  },
  autoCompletePower: {
    id: 'autoCompletePower', name: 'Auto-Complete', category: 'text', rarity: 'uncommon', cost: 1,
    target: 'self', act: 1, keywords: ['power'],
    description: 'POWER. Draw 1 additional card each turn.',
    effects: [{ type: 'power_drawPerTurn', amount: 1 }],
    upgraded: { description: 'POWER. Draw 2 additional cards each turn.', effects: [{ type: 'power_drawPerTurn', amount: 2 }] },
  },
  rateLimiter: {
    id: 'rateLimiter', name: 'Rate Limiter', category: 'structure', rarity: 'rare', cost: 2,
    target: 'self', act: 2, keywords: ['power'],
    description: 'POWER. Enemies deal 1 less damage per hit.',
    effects: [{ type: 'power_reduceDamage', amount: 1 }],
    upgraded: { description: 'POWER. Enemies deal 2 less damage per hit.', effects: [{ type: 'power_reduceDamage', amount: 2 }] },
  },
  batchProcessing: {
    id: 'batchProcessing', name: 'Batch Processing', category: 'logic', rarity: 'uncommon', cost: 1,
    target: 'self', act: 2, keywords: ['power'],
    description: 'POWER. First card you play each turn costs 0.',
    effects: [{ type: 'power_firstCardFree' }],
    upgraded: { cost: 0, description: 'POWER. First card you play each turn costs 0.' },
  },
  ensembleModel: {
    id: 'ensembleModel', name: 'Ensemble Model', category: 'logic', rarity: 'rare', cost: 3,
    target: 'self', act: 3, keywords: ['power'],
    description: 'POWER. When you play an Attack, deal 3 damage to ALL enemies.',
    effects: [{ type: 'power_attackSplash', amount: 3 }],
    upgraded: { description: 'POWER. When you play an Attack, deal 5 damage to ALL enemies.', effects: [{ type: 'power_attackSplash', amount: 5 }] },
  },
};

// Helper: get all non-starter, non-temp cards available in a given act
export function getCardPool(act: 1 | 2 | 3): CardDef[] {
  return Object.values(CARDS).filter(
    (c) => c.rarity !== 'starter' && c.rarity !== 'curse' && c.id !== 'intentMirror' && c.act <= act
  );
}

// Helper: get starter deck card IDs
export function getStarterDeckIds(): string[] {
  // 7-card starter deck — simpler for beginners.
  // 3 attack + 2 defense + 1 combo enabler + 1 combo payoff
  return [
    'prompt', 'prompt', 'prompt',        // 3 attacks (deal 6 damage)
    'errorHandle', 'errorHandle',         // 2 blocks (gain 5 firewall)
    'autocomplete',                       // draw 1 + deal 3 (utility)
    'brainstorm',                         // AoE damage (introduces multi-target)
  ];
}
