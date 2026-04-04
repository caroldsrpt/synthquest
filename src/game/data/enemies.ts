import type { EnemyDef, EnemyInstance, IntentType } from './types';
import { uid } from '../../utils/random';

export const ENEMIES: Record<string, EnemyDef> = {
  // Act 1
  staleCache: {
    id: 'staleCache', name: 'Stale Cache', type: 'normal', baseHp: 25, acts: [1],
    intentPattern: 'cycle',
  },
  tokenFlood: {
    id: 'tokenFlood', name: 'Token Flood', type: 'normal', baseHp: 18, acts: [1],
    intentPattern: 'cycle',
  },
  theParrot: {
    id: 'theParrot', name: 'The Parrot', type: 'normal', baseHp: 35, acts: [1],
    intentPattern: 'ai',
  },
  junkGenerator: {
    id: 'junkGenerator', name: 'Junk Generator', type: 'normal', baseHp: 30, acts: [1],
    intentPattern: 'cycle',
  },
  promptInjector: {
    id: 'promptInjector', name: 'Prompt Injector', type: 'elite', baseHp: 70, acts: [1],
    intentPattern: 'cycle',
  },
  confabulator: {
    id: 'confabulator', name: 'The Confabulator', type: 'boss', baseHp: 160, acts: [1],
    intentPattern: 'ai',
  },

  // Act 2
  timeoutError: {
    id: 'timeoutError', name: 'Timeout Error', type: 'normal', baseHp: 26, acts: [2],
    intentPattern: 'cycle',
  },
  dataSilo: {
    id: 'dataSilo', name: 'Data Silo', type: 'normal', baseHp: 52, baseFirewall: 15, acts: [2],
    intentPattern: 'cycle',
  },
  ghostEndpoint: {
    id: 'ghostEndpoint', name: 'Ghost Endpoint', type: 'normal', baseHp: 39, acts: [2],
    intentPattern: 'cycle',
  },
  theMonolith: {
    id: 'theMonolith', name: 'The Monolith', type: 'elite', baseHp: 95, acts: [2],
    intentPattern: 'ai',
  },
  theSilo: {
    id: 'theSilo', name: 'The Silo', type: 'boss', baseHp: 220, acts: [2],
    intentPattern: 'ai',
  },
  dataFragment: {
    id: 'dataFragment', name: 'Data Fragment', type: 'normal', baseHp: 20, acts: [2],
    intentPattern: 'cycle',
  },

  // Act 3
  theCopycat: {
    id: 'theCopycat', name: 'The Copycat', type: 'normal', baseHp: 45, acts: [3],
    intentPattern: 'ai',
  },
  theGatekeeper: {
    id: 'theGatekeeper', name: 'The Gatekeeper', type: 'elite', baseHp: 110, acts: [3],
    intentPattern: 'ai',
  },
  theOverfitter: {
    id: 'theOverfitter', name: 'The Overfitter', type: 'boss', baseHp: 300, acts: [3],
    intentPattern: 'ai',
  },
};

export function createEnemy(defId: string, hpMult = 1, atkBonus = 0): EnemyInstance {
  const def = ENEMIES[defId];
  if (!def) throw new Error(`Unknown enemy: ${defId}`);
  const hp = Math.floor(def.baseHp * hpMult);
  return {
    id: uid(),
    defId,
    hp,
    maxHp: hp,
    firewall: def.baseFirewall || 0,
    statusEffects: [],
    currentIntent: getInitialIntent(defId, atkBonus),
    intentHistory: [],
    turnCounter: 0,
    customState: atkBonus > 0 ? { atkBonus } : {},
  };
}

function getInitialIntent(defId: string, atkBonus = 0): IntentType {
  const b = atkBonus;
  switch (defId) {
    case 'staleCache': return { type: 'attack', damage: 5 + b };
    case 'tokenFlood': return { type: 'attack', damage: 3 + b };
    case 'theParrot': return { type: 'attack', damage: 6 + b };
    case 'junkGenerator': return { type: 'debuff', status: 'hallucination', stacks: 2 };
    case 'promptInjector': return { type: 'debuff', status: 'confused', stacks: 3 };
    case 'confabulator': return { type: 'debuff', status: 'hallucination', stacks: 2 };
    case 'timeoutError': return { type: 'attack', damage: 4 + b };
    case 'dataSilo': return { type: 'defend', firewall: 8 };
    case 'ghostEndpoint': return { type: 'attack', damage: 10 + b };
    case 'theMonolith': return { type: 'attack', damage: 12 + b };
    case 'theSilo': return { type: 'attack', damage: 10 + b };
    case 'dataFragment': return { type: 'attack', damage: 5 + b };
    case 'theCopycat': return { type: 'attack', damage: 0 }; // mirrors player
    case 'theGatekeeper': return { type: 'attack', damage: 10 + b };
    case 'theOverfitter': return { type: 'attack', damage: 8 + b };
    default: return { type: 'attack', damage: 5 };
  }
}

export function getNextIntent(enemy: EnemyInstance): IntentType {
  const turn = enemy.turnCounter;
  const b = enemy.customState?.atkBonus || 0;

  switch (enemy.defId) {
    case 'staleCache': {
      // Attack 5, Attack 5, Buff (+2 atk), repeat — escalating
      const phase = turn % 3;
      if (phase === 2) return { type: 'buff', description: 'Powering up' };
      return { type: 'attack', damage: 5 + b + Math.floor(turn / 3) * 2 };
    }
    case 'tokenFlood': {
      // Attack 3, gains +1 every 2 turns
      return { type: 'attack', damage: 3 + b + Math.floor(turn / 2) };
    }
    case 'junkGenerator': {
      // Hallucinate, Attack 8, Confuse, repeat
      const phase = turn % 3;
      if (phase === 0) return { type: 'debuff', status: 'hallucination', stacks: 2 };
      if (phase === 1) return { type: 'attack', damage: 8 + b };
      return { type: 'debuff', status: 'confused', stacks: 1 };
    }
    case 'promptInjector': {
      // Confuse 3, then alternate Attack 12 / Hallucinate+Attack 6
      if (turn === 0) return { type: 'debuff', status: 'confused', stacks: 3 };
      return turn % 2 === 1
        ? { type: 'attack', damage: 12 + b }
        : { type: 'attackDebuff', damage: 6 + b, status: 'hallucination', stacks: 2 };
    }
    case 'confabulator': {
      // Phase 1: Hallucinate → Attack 8 → Attack+Hallucinate → repeat
      // Phase 2 (below half HP): Attack 12
      if (enemy.hp <= enemy.maxHp / 2) {
        return { type: 'attack', damage: 12 };
      }
      const phase = turn % 3;
      if (phase === 0) return { type: 'debuff', status: 'hallucination', stacks: 2 };
      if (phase === 1) return { type: 'attack', damage: 8 };
      return { type: 'attackDebuff', damage: 6, status: 'hallucination', stacks: 1 };
    }
    case 'timeoutError': {
      // Attack 4, Attack 4, Throttle, repeat
      const phase = turn % 3;
      if (phase === 2) return { type: 'debuff', status: 'throttled', stacks: 1 };
      return { type: 'attack', damage: 4 + b };
    }
    case 'dataSilo': {
      // Defend 8, Attack 6, repeat
      return turn % 2 === 0
        ? { type: 'defend', firewall: 8 }
        : { type: 'attack', damage: 6 + b };
    }
    case 'ghostEndpoint': {
      // Attack 10, go Intangible, repeat
      return turn % 2 === 0
        ? { type: 'attack', damage: 10 + b }
        : { type: 'buff', description: 'Going offline (Intangible)' };
    }
    case 'theMonolith': {
      // Attack 18 every 3 turns, otherwise Attack 8 + Defend 5
      return turn % 3 === 2
        ? { type: 'attack', damage: 18 + b }
        : { type: 'attackDebuff', damage: 8 + b, status: 'weak', stacks: 1 };
    }
    case 'theSilo': {
      // Attack 10, gains +3 each turn while fragments alive (handled in combat system)
      return { type: 'attack', damage: 10 + b };
    }
    case 'dataFragment': {
      // Attack 5, Attack 5, Throttle, repeat
      const phase = turn % 3;
      if (phase === 2) return { type: 'debuff', status: 'throttled', stacks: 1 };
      return { type: 'attack', damage: 5 + b };
    }
    case 'theCopycat': {
      // Mirrors player damage — intent shows as "unknown" until after player turn
      return { type: 'unknown' };
    }
    case 'theGatekeeper': {
      // Rotates weakness every 2 turns
      const phase = Math.floor(turn / 2) % 3;
      const dmg = 10 + b;
      if (phase === 0) return { type: 'attackDebuff', damage: dmg, status: 'vulnerable', stacks: 1 };
      if (phase === 1) return { type: 'attackDebuff', damage: dmg, status: 'weak', stacks: 1 };
      return { type: 'attack', damage: dmg + 5 };
    }
    case 'theOverfitter': {
      // Attack 8, Defend when resistant, reset every 5 turns
      if (turn % 5 === 4) return { type: 'buff', description: 'Resetting patterns' };
      return { type: 'attack', damage: 8 + b };
    }
    default:
      return { type: 'attack', damage: 5 };
  }
}

// Encounter tables
export interface Encounter {
  enemies: { defId: string; hpMult?: number; atkBonus?: number }[];
  weight: number;
}

export const ACT_ENCOUNTERS: Record<1 | 2 | 3, Encounter[]> = {
  1: [
    { enemies: [{ defId: 'staleCache' }], weight: 30 },
    { enemies: [{ defId: 'tokenFlood' }, { defId: 'tokenFlood' }], weight: 25 },
    { enemies: [{ defId: 'junkGenerator' }], weight: 20 },
    { enemies: [{ defId: 'tokenFlood' }, { defId: 'tokenFlood' }, { defId: 'tokenFlood' }], weight: 15 },
    { enemies: [{ defId: 'theParrot' }], weight: 10 },
  ],
  2: [
    { enemies: [{ defId: 'dataSilo' }], weight: 30 },
    { enemies: [{ defId: 'timeoutError' }, { defId: 'timeoutError' }], weight: 25 },
    { enemies: [{ defId: 'ghostEndpoint' }, { defId: 'tokenFlood' }], weight: 20 },
    { enemies: [{ defId: 'dataSilo' }, { defId: 'timeoutError' }], weight: 25 },
  ],
  3: [
    { enemies: [{ defId: 'theCopycat' }], weight: 40 },
    { enemies: [{ defId: 'junkGenerator', hpMult: 1.5, atkBonus: 3 }, { defId: 'junkGenerator', hpMult: 1.5, atkBonus: 3 }], weight: 30 },
    { enemies: [{ defId: 'theParrot', hpMult: 1.5, atkBonus: 3 }, { defId: 'tokenFlood', hpMult: 1.5, atkBonus: 3 }], weight: 30 },
  ],
};

export const ELITE_ENCOUNTERS: Record<1 | 2 | 3, Encounter> = {
  1: { enemies: [{ defId: 'promptInjector' }], weight: 1 },
  2: { enemies: [{ defId: 'theMonolith' }], weight: 1 },
  3: { enemies: [{ defId: 'theGatekeeper' }], weight: 1 },
};

export const BOSS_ENCOUNTERS: Record<1 | 2 | 3, Encounter> = {
  1: { enemies: [{ defId: 'confabulator' }], weight: 1 },
  2: { enemies: [{ defId: 'theSilo' }, { defId: 'dataFragment' }, { defId: 'dataFragment' }], weight: 1 },
  3: { enemies: [{ defId: 'theOverfitter' }], weight: 1 },
};
