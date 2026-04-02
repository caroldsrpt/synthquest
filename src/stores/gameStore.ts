import { create } from 'zustand';
import type { Direction, PlayerState, SynthInstance } from '../game/data/types';

interface GameStore {
  // Player state
  player: PlayerState;
  party: SynthInstance[];
  pcStorage: SynthInstance[]; // stored synths not in party

  // Inventory
  inventory: Record<string, number>; // itemId -> count

  // Game state
  gamePhase: 'overworld' | 'battle' | 'dialog' | 'menu' | 'title';
  paused: boolean;

  // Actions
  setPosition: (x: number, y: number) => void;
  setDirection: (dir: Direction) => void;
  setMap: (mapId: string) => void;
  setGamePhase: (phase: GameStore['gamePhase']) => void;
  setPaused: (paused: boolean) => void;
  setFlag: (flag: string, value: boolean) => void;
  addMoney: (amount: number) => void;
  addItem: (itemId: string, count?: number) => void;
  removeItem: (itemId: string, count?: number) => boolean;
  addToParty: (synth: SynthInstance) => boolean;
  removeFromParty: (index: number) => SynthInstance | null;
  updatePartySynth: (index: number, synth: SynthInstance) => void;
  healParty: () => void;
  unlockLibraryNote: (noteId: string) => void;
  addBadge: (badgeId: string) => void;
  setRank: (rank: number, title: string) => void;

  // Save/Load
  saveGame: () => void;
  loadGame: () => boolean;
}

const INITIAL_PLAYER: PlayerState = {
  name: 'Player',
  rank: 1,
  rankTitle: 'Novice',
  badges: [],
  flags: {},
  currentMapId: 'echoVillage',
  position: { x: 7, y: 8 },
  direction: 'down',
  money: 500,
  playtime: 0,
  libraryNotes: [],
};

export const useGameStore = create<GameStore>((set, get) => ({
  player: { ...INITIAL_PLAYER },
  party: [],
  pcStorage: [],
  inventory: {
    dataPack: 5,
    patchKit: 3,
  },
  gamePhase: 'title',
  paused: false,

  setPosition: (x, y) =>
    set((s) => ({ player: { ...s.player, position: { x, y } } })),

  setDirection: (dir) =>
    set((s) => ({ player: { ...s.player, direction: dir } })),

  setMap: (mapId) =>
    set((s) => ({ player: { ...s.player, currentMapId: mapId } })),

  setGamePhase: (phase) => set({ gamePhase: phase }),

  setPaused: (paused) => set({ paused }),

  setFlag: (flag, value) =>
    set((s) => ({
      player: { ...s.player, flags: { ...s.player.flags, [flag]: value } },
    })),

  addMoney: (amount) =>
    set((s) => ({
      player: { ...s.player, money: Math.max(0, s.player.money + amount) },
    })),

  addItem: (itemId, count = 1) =>
    set((s) => ({
      inventory: {
        ...s.inventory,
        [itemId]: (s.inventory[itemId] || 0) + count,
      },
    })),

  removeItem: (itemId, count = 1) => {
    const current = get().inventory[itemId] || 0;
    if (current < count) return false;
    set((s) => ({
      inventory: {
        ...s.inventory,
        [itemId]: current - count,
      },
    }));
    return true;
  },

  addToParty: (synth) => {
    const { party, player } = get();
    const maxSize = [1, 2, 3, 4, 5, 6][player.rank - 1] || 6;
    if (party.length >= maxSize) {
      // Send to PC storage
      set((s) => ({ pcStorage: [...s.pcStorage, synth] }));
      return false;
    }
    set((s) => ({ party: [...s.party, synth] }));
    return true;
  },

  removeFromParty: (index) => {
    const { party } = get();
    if (index < 0 || index >= party.length || party.length <= 1) return null;
    const removed = party[index];
    set((s) => ({ party: s.party.filter((_, i) => i !== index) }));
    return removed;
  },

  updatePartySynth: (index, synth) =>
    set((s) => ({
      party: s.party.map((p, i) => (i === index ? synth : p)),
    })),

  healParty: () =>
    set((s) => ({
      party: s.party.map((synth) => ({
        ...synth,
        currentMemory: synth.stats.memory,
        statusEffects: [],
        moves: synth.moves.map((m) => ({ ...m, currentPP: m.currentPP })), // TODO: restore PP from move data
      })),
    })),

  unlockLibraryNote: (noteId) =>
    set((s) => ({
      player: {
        ...s.player,
        libraryNotes: s.player.libraryNotes.includes(noteId)
          ? s.player.libraryNotes
          : [...s.player.libraryNotes, noteId],
      },
    })),

  addBadge: (badgeId) =>
    set((s) => ({
      player: {
        ...s.player,
        badges: [...s.player.badges, badgeId],
      },
    })),

  setRank: (rank, title) =>
    set((s) => ({
      player: { ...s.player, rank, rankTitle: title },
    })),

  saveGame: () => {
    const { player, party, pcStorage, inventory } = get();
    const save = { player, party, pcStorage, inventory, version: 1 };
    localStorage.setItem('synthquest-save', JSON.stringify(save));
  },

  loadGame: () => {
    const raw = localStorage.getItem('synthquest-save');
    if (!raw) return false;
    try {
      const save = JSON.parse(raw);
      set({
        player: save.player,
        party: save.party,
        pcStorage: save.pcStorage || [],
        inventory: save.inventory,
        gamePhase: 'overworld',
      });
      return true;
    } catch {
      return false;
    }
  },
}));
