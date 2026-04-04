import { create } from 'zustand';
import type { RunState, GameScreen, CardInstance, MapNode } from '../game/data/types';
import { generateMap } from '../game/systems/MapGenerator';
import { BASE_INTEGRITY, STARTING_GOLD, BASE_ENERGY, HAND_SIZE } from '../utils/constants';
import { createStarterDeck } from '../utils/cardUtils';
import { useCombatStore } from './combatStore';

interface RunStore extends RunState {
  screen: GameScreen;

  // Run lifecycle
  startNewRun: () => void;
  setScreen: (screen: GameScreen) => void;
  endRun: (won: boolean) => void;

  // Integrity
  takeDamage: (amount: number) => void;
  heal: (amount: number) => void;
  healPercent: (percent: number) => void;
  modifyMaxIntegrity: (amount: number) => void;

  // Gold
  addGold: (amount: number) => void;
  spendGold: (amount: number) => boolean;

  // Deck
  addCardToDeck: (card: CardInstance) => void;
  removeCardFromDeck: (cardId: string) => void;
  upgradeCardInDeck: (cardId: string) => void;

  // Relics
  addRelic: (relicId: string) => void;
  hasRelic: (relicId: string) => boolean;

  // Map
  setMap: (map: MapNode[][]) => void;
  visitNode: (nodeId: string) => void;
  setCurrentNode: (nodeId: string | null) => void;

  // Act progression
  advanceAct: () => void;

  // Teaching
  markTeachingShown: (triggerId: string) => void;
  hasTeachingShown: (triggerId: string) => boolean;

  // Scenarios
  completeScenario: (scenarioId: string) => void;
  hasCompletedScenario: (scenarioId: string) => boolean;
  markCardTipShown: (cardId: string) => void;
  currentScenarioId: string | null;
  setCurrentScenario: (id: string | null) => void;

  // Events
  currentEventId: string | null;
  setCurrentEvent: (id: string | null) => void;

  // Getters
  getMaxEnergy: () => number;
  getDrawCount: () => number;
}

const INITIAL_RUN: RunState = {
  active: false,
  act: 1,
  floor: 0,
  maxIntegrity: BASE_INTEGRITY,
  currentIntegrity: BASE_INTEGRITY,
  gold: STARTING_GOLD,
  deck: [],
  relics: [],
  map: [],
  currentNodeId: null,
  visitedNodeIds: [],
  cardRemovalCount: 0,
  teachingTriggersShown: [],
  completedScenarios: [],
  shownCardTips: [],
};

export const useRunStore = create<RunStore>((set, get) => ({
  ...INITIAL_RUN,
  screen: 'title',

  startNewRun: () => {
    set({
      ...INITIAL_RUN,
      active: true,
      deck: createStarterDeck(),
      map: generateMap(1),
      screen: 'map',
    });
  },

  setScreen: (screen) => set({ screen }),

  endRun: (won) => {
    set({ active: false, screen: won ? 'victory' : 'gameOver' });
  },

  takeDamage: (amount) => {
    const newHp = Math.max(0, get().currentIntegrity - amount);
    set({ currentIntegrity: newHp });
    if (newHp <= 0) {
      // Snapshot combat state for the Game Over screen
      const combatState = useCombatStore.getState();
      set({
        active: false,
        screen: 'gameOver',
        deathContext: {
          enemyDefIds: combatState.enemies.map((e) => e.defId),
          turnsSurvived: combatState.turn,
          cardsInDeck: get().deck.length,
        },
      });
    }
  },

  heal: (amount) => {
    set((s) => ({
      currentIntegrity: Math.min(s.maxIntegrity, s.currentIntegrity + amount),
    }));
  },

  healPercent: (percent) => {
    const amount = Math.floor(get().maxIntegrity * percent);
    get().heal(amount);
  },

  modifyMaxIntegrity: (amount) => {
    set((s) => ({
      maxIntegrity: Math.max(1, s.maxIntegrity + amount),
      currentIntegrity: amount > 0
        ? Math.min(s.maxIntegrity + amount, s.currentIntegrity + amount)
        : Math.min(s.maxIntegrity + amount, s.currentIntegrity),
    }));
  },

  addGold: (amount) => set((s) => ({ gold: s.gold + amount })),

  spendGold: (amount) => {
    if (get().gold < amount) return false;
    set((s) => ({ gold: s.gold - amount }));
    return true;
  },

  addCardToDeck: (card) => set((s) => ({ deck: [...s.deck, card] })),

  removeCardFromDeck: (cardId) => {
    set((s) => {
      const idx = s.deck.findIndex((c) => c.id === cardId);
      if (idx === -1) return {};
      return {
        deck: s.deck.filter((_, i) => i !== idx),
        cardRemovalCount: s.cardRemovalCount + 1,
      };
    });
  },

  upgradeCardInDeck: (cardId) => {
    set((s) => ({
      deck: s.deck.map((c) => (c.id === cardId ? { ...c, upgraded: true } : c)),
    }));
  },

  addRelic: (relicId) => set((s) => ({ relics: [...s.relics, relicId] })),

  hasRelic: (relicId) => get().relics.includes(relicId),

  setMap: (map) => set({ map }),

  visitNode: (nodeId) => {
    set((s) => ({
      visitedNodeIds: [...s.visitedNodeIds, nodeId],
      floor: s.floor + 1,
      map: s.map.map((row) =>
        row.map((node) => node.id === nodeId ? { ...node, visited: true } : node)
      ),
    }));
  },

  setCurrentNode: (nodeId) => set({ currentNodeId: nodeId }),

  advanceAct: () => {
    const currentAct = get().act;
    if (currentAct >= 3) {
      get().endRun(true);
      return;
    }
    const nextAct = (currentAct + 1) as 1 | 2 | 3;
    set({
      act: nextAct,
      map: generateMap(nextAct),
      currentNodeId: null,
      visitedNodeIds: [],
      floor: 0,
      screen: 'map' as const,
    });
  },

  markTeachingShown: (triggerId) => {
    set((s) => ({
      teachingTriggersShown: [...s.teachingTriggersShown, triggerId],
    }));
  },

  hasTeachingShown: (triggerId) => get().teachingTriggersShown.includes(triggerId),

  // Events
  currentEventId: null,
  setCurrentEvent: (id) => set({ currentEventId: id }),

  // Scenarios
  currentScenarioId: null,
  setCurrentScenario: (id) => set({ currentScenarioId: id }),

  completeScenario: (scenarioId) => {
    set((s) => ({
      completedScenarios: s.completedScenarios.includes(scenarioId)
        ? s.completedScenarios
        : [...s.completedScenarios, scenarioId],
    }));
  },

  hasCompletedScenario: (scenarioId) => get().completedScenarios.includes(scenarioId),

  markCardTipShown: (cardId: string) => set((s) => ({
    shownCardTips: s.shownCardTips.includes(cardId) ? s.shownCardTips : [...s.shownCardTips, cardId],
  })),

  getMaxEnergy: () => {
    const state = get();
    let energy = BASE_ENERGY;
    if (state.relics.includes('loadBalancer')) energy += 1;
    return energy;
  },

  getDrawCount: () => {
    const state = get();
    let draw = HAND_SIZE;
    if (state.relics.includes('tokenCounter')) draw += 1;
    return draw;
  },
}));
