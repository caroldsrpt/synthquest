import { create } from 'zustand';
import type { MetaState } from '../game/data/types';

interface MetaStore extends MetaState {
  unlockKnowledge: (conceptId: string) => void;
  hasKnowledge: (conceptId: string) => boolean;
  recordRun: (act: number, won: boolean) => void;
  recordCardSeen: (cardId: string) => void;
  save: () => void;
  load: () => void;
}

const INITIAL_META: MetaState = {
  knowledgeUnlocked: [],
  totalRuns: 0,
  bestAct: 0,
  wins: 0,
  cardsSeenIds: [],
};

export const useMetaStore = create<MetaStore>((set, get) => ({
  ...INITIAL_META,

  unlockKnowledge: (conceptId) => {
    if (get().knowledgeUnlocked.includes(conceptId)) return;
    set((s) => ({
      knowledgeUnlocked: [...s.knowledgeUnlocked, conceptId],
    }));
    get().save();
  },

  hasKnowledge: (conceptId) => get().knowledgeUnlocked.includes(conceptId),

  recordRun: (act, won) => {
    set((s) => ({
      totalRuns: s.totalRuns + 1,
      bestAct: Math.max(s.bestAct, act),
      wins: won ? s.wins + 1 : s.wins,
    }));
    get().save();
  },

  recordCardSeen: (cardId) => {
    if (get().cardsSeenIds.includes(cardId)) return;
    set((s) => ({ cardsSeenIds: [...s.cardsSeenIds, cardId] }));
  },

  save: () => {
    const { knowledgeUnlocked, totalRuns, bestAct, wins, cardsSeenIds } = get();
    localStorage.setItem('synthquest-meta', JSON.stringify({
      knowledgeUnlocked, totalRuns, bestAct, wins, cardsSeenIds,
    }));
  },

  load: () => {
    const raw = localStorage.getItem('synthquest-meta');
    if (!raw) return;
    try {
      const data = JSON.parse(raw);
      set(data);
    } catch { /* ignore corrupt data */ }
  },
}));
