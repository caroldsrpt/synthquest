import { create } from 'zustand';
import type { CardInstance, CombatState, CombatPhase, EnemyInstance, StatusStack, CardCategory, CardDef, RelicDef } from '../game/data/types';
import { CARDS } from '../game/data/cards';
import { BASE_ENERGY, HAND_SIZE } from '../utils/constants';
import { shuffle } from '../utils/random';

interface CombatStore extends CombatState {
  // Setup
  initCombat: (deck: CardInstance[], enemies: EnemyInstance[], maxEnergy?: number, extraDraw?: number) => void;

  // Turn management
  startTurn: () => void;
  endPlayerTurn: () => void;
  setPhase: (phase: CombatPhase) => void;

  // Card play
  selectCard: (index: number | null) => void;
  setTargeting: (index: number | null) => void;
  playCard: (handIndex: number, targetEnemyId?: string) => void;
  discardHand: () => void;
  drawCards: (count: number) => void;
  exhaustCard: (handIndex: number) => void;
  addToHand: (card: CardInstance) => void;
  addToDiscard: (card: CardInstance) => void;

  // Energy
  spendEnergy: (amount: number) => boolean;
  gainEnergy: (amount: number) => void;

  // Player status
  gainFirewall: (amount: number) => void;
  takeDamage: (amount: number) => number; // returns actual damage taken
  addPlayerStatus: (status: StatusStack) => void;
  removePlayerStatus: (status: string, stacks?: number) => void;
  clearAllPlayerStatus: () => void;

  // Enemy
  updateEnemy: (id: string, updates: Partial<EnemyInstance>) => void;
  damageEnemy: (id: string, amount: number) => number; // returns actual damage
  removeEnemy: (id: string) => void;
  addEnemyStatus: (id: string, status: StatusStack) => void;

  // Tracking
  trackCardPlayed: (defId: string, category: CardCategory) => void;
  addLog: (msg: string) => void;

  // Rewards
  setRewards: (gold: number, cards: CardDef[], relic: RelicDef | null) => void;

  // Cleanup
  endCombat: () => void;
}

const INITIAL_STATE: CombatState = {
  active: false,
  turn: 0,
  energy: 0,
  maxEnergy: BASE_ENERGY,
  hand: [],
  drawPile: [],
  discardPile: [],
  exhaustPile: [],
  enemies: [],
  playerFirewall: 0,
  playerStatus: [],
  phase: 'start',
  selectedCardIndex: null,
  targetingCardIndex: null,
  log: [],
  lastCardPlayedId: null,
  lastTargetedEnemyId: null,
  totalDamageDealtThisTurn: 0,
  totalFirewallGainedThisTurn: 0,
  cardsPlayedThisTurn: [],
  categoryCountThisTurn: { text: 0, structure: 0, logic: 0, vision: 0, noise: 0 },
  goldReward: 0,
  cardRewards: [],
  relicReward: null,
};

export const useCombatStore = create<CombatStore>((set, get) => ({
  ...INITIAL_STATE,

  initCombat: (deck, enemies, maxEnergy = BASE_ENERGY) => {
    set({
      ...INITIAL_STATE,
      active: true,
      maxEnergy,
      drawPile: shuffle([...deck]),
      enemies,
      phase: 'start',
    });
  },

  startTurn: () => {
    const state = get();
    let energy = state.maxEnergy;

    // Apply Throttled
    const throttled = state.playerStatus.find((s) => s.status === 'throttled');
    if (throttled) {
      energy = Math.max(0, energy - throttled.stacks);
    }

    set({
      turn: state.turn + 1,
      energy,
      playerFirewall: 0,
      phase: 'playerTurn',
      selectedCardIndex: null,
      targetingCardIndex: null,
      totalDamageDealtThisTurn: 0,
      totalFirewallGainedThisTurn: 0,
      cardsPlayedThisTurn: [],
      categoryCountThisTurn: { text: 0, structure: 0, logic: 0, vision: 0, noise: 0 },
      lastCardPlayedId: null,
      // Remove throttled after applying
      playerStatus: state.playerStatus.filter((s) => s.status !== 'throttled'),
    });

    // Draw cards
    const drawCount = HAND_SIZE;
    get().drawCards(drawCount);
  },

  endPlayerTurn: () => {
    set({ phase: 'enemyTurn', selectedCardIndex: null, targetingCardIndex: null });
  },

  setPhase: (phase) => set({ phase }),

  selectCard: (index) => set({ selectedCardIndex: index, targetingCardIndex: null }),

  setTargeting: (index) => set({ targetingCardIndex: index }),

  playCard: (handIndex, targetEnemyId) => {
    const state = get();
    const card = state.hand[handIndex];
    if (!card) return;

    const newHand = state.hand.filter((_, i) => i !== handIndex);
    set({ hand: newHand, selectedCardIndex: null, targetingCardIndex: null });

    if (targetEnemyId) {
      set({ lastTargetedEnemyId: targetEnemyId });
    }
    set({ lastCardPlayedId: card.defId });
  },

  discardHand: () => {
    const state = get();
    // Keep cards with retain keyword
    // CARDS imported at top of file
    const retained: CardInstance[] = [];
    const discarded: CardInstance[] = [];

    for (const card of state.hand) {
      const def = CARDS[card.defId];
      if (def?.keywords?.includes('retain')) {
        retained.push(card);
      } else {
        discarded.push(card);
      }
    }

    set({
      hand: retained,
      discardPile: [...state.discardPile, ...discarded],
    });
  },

  drawCards: (count) => {
    const state = get();
    let draw = [...state.drawPile];
    let discard = [...state.discardPile];
    const hand = [...state.hand];

    for (let i = 0; i < count; i++) {
      if (draw.length === 0) {
        if (discard.length === 0) break;
        draw = shuffle(discard);
        discard = [];
      }
      hand.push(draw.shift()!);
    }

    set({ hand, drawPile: draw, discardPile: discard });
  },

  exhaustCard: (handIndex) => {
    const state = get();
    const card = state.hand[handIndex];
    if (!card) return;
    set({
      hand: state.hand.filter((_, i) => i !== handIndex),
      exhaustPile: [...state.exhaustPile, card],
    });
  },

  addToHand: (card) => set((s) => ({ hand: [...s.hand, card] })),

  addToDiscard: (card) => set((s) => ({ discardPile: [...s.discardPile, card] })),

  spendEnergy: (amount) => {
    const state = get();
    if (state.energy < amount) return false;
    set({ energy: state.energy - amount });
    return true;
  },

  gainEnergy: (amount) => set((s) => ({ energy: s.energy + amount })),

  gainFirewall: (amount) => set((s) => ({
    playerFirewall: s.playerFirewall + amount,
    totalFirewallGainedThisTurn: s.totalFirewallGainedThisTurn + amount,
  })),

  takeDamage: (amount) => {
    const state = get();
    let remaining = amount;

    // Firewall absorbs first
    if (state.playerFirewall > 0) {
      const absorbed = Math.min(state.playerFirewall, remaining);
      remaining -= absorbed;
      set({ playerFirewall: state.playerFirewall - absorbed });
    }

    return remaining; // Integrity damage handled by runStore
  },

  addPlayerStatus: ({ status, stacks }) => {
    set((s) => {
      const existing = s.playerStatus.find((e) => e.status === status);
      if (existing) {
        return {
          playerStatus: s.playerStatus.map((e) =>
            e.status === status ? { ...e, stacks: e.stacks + stacks } : e
          ),
        };
      }
      return { playerStatus: [...s.playerStatus, { status, stacks }] };
    });
  },

  removePlayerStatus: (status, stacks = 1) => {
    set((s) => ({
      playerStatus: s.playerStatus
        .map((e) => (e.status === status ? { ...e, stacks: e.stacks - stacks } : e))
        .filter((e) => e.stacks > 0),
    }));
  },

  clearAllPlayerStatus: () => set({ playerStatus: [] }),

  updateEnemy: (id, updates) => set((s) => ({
    enemies: s.enemies.map((e) => (e.id === id ? { ...e, ...updates } : e)),
  })),

  damageEnemy: (id, amount) => {
    const state = get();
    const enemy = state.enemies.find((e) => e.id === id);
    if (!enemy) return 0;

    // Check intangible
    const isIntangible = enemy.statusEffects.some((s) => s.status === 'intangible');
    const actual = isIntangible ? Math.min(1, amount) : amount;

    let remaining = actual;

    // Firewall on enemy
    if (enemy.firewall > 0) {
      const absorbed = Math.min(enemy.firewall, remaining);
      remaining -= absorbed;
      get().updateEnemy(id, { firewall: enemy.firewall - absorbed });
    }

    if (remaining > 0) {
      get().updateEnemy(id, { hp: Math.max(0, enemy.hp - remaining) });
    }

    set((s) => ({ totalDamageDealtThisTurn: s.totalDamageDealtThisTurn + actual }));
    return actual;
  },

  removeEnemy: (id) => set((s) => ({
    enemies: s.enemies.filter((e) => e.id !== id),
  })),

  addEnemyStatus: (id, { status, stacks }) => {
    set((s) => ({
      enemies: s.enemies.map((e) => {
        if (e.id !== id) return e;
        const existing = e.statusEffects.find((s) => s.status === status);
        if (existing) {
          return {
            ...e,
            statusEffects: e.statusEffects.map((s) =>
              s.status === status ? { ...s, stacks: s.stacks + stacks } : s
            ),
          };
        }
        return { ...e, statusEffects: [...e.statusEffects, { status, stacks }] };
      }),
    }));
  },

  trackCardPlayed: (defId, category) => {
    set((s) => ({
      cardsPlayedThisTurn: [...s.cardsPlayedThisTurn, defId],
      categoryCountThisTurn: {
        ...s.categoryCountThisTurn,
        [category]: (s.categoryCountThisTurn[category] || 0) + 1,
      },
    }));
  },

  addLog: (msg) => set((s) => ({ log: [...s.log, msg] })),

  setRewards: (gold, cards, relic) => set({ goldReward: gold, cardRewards: cards, relicReward: relic }),

  endCombat: () => set({ ...INITIAL_STATE }),
}));
