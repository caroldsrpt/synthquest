import { create } from 'zustand';
import type { SynthInstance, BattleAction } from '../game/data/types';

export type BattlePhase =
  | 'intro'         // "Wild Chatter appeared!"
  | 'select'        // Player choosing action
  | 'animating'     // Turn resolving
  | 'message'       // Showing battle message
  | 'switch'        // Player choosing which synth to switch to
  | 'capture'       // Capture animation
  | 'xp'            // XP gain display
  | 'levelup'       // Level up display
  | 'ended';        // Battle over

interface BattleStore {
  active: boolean;
  type: 'wild' | 'trainer';

  // Combatants
  playerSynth: SynthInstance | null;
  playerPartyIndex: number;
  opponentSynth: SynthInstance | null;
  opponentParty: SynthInstance[];
  opponentPartyIndex: number;
  opponentName: string;

  // Battle state
  phase: BattlePhase;
  turn: number;
  log: string[];
  currentMessage: string;
  messageQueue: string[];

  // Player action
  playerAction: BattleAction | null;

  // Results
  xpGained: number;
  captured: boolean;

  // Actions
  startWildBattle: (playerSynth: SynthInstance, playerPartyIndex: number, wildSynth: SynthInstance) => void;
  startTrainerBattle: (playerSynth: SynthInstance, playerPartyIndex: number, opponentParty: SynthInstance[], opponentName: string) => void;
  setPhase: (phase: BattlePhase) => void;
  setPlayerAction: (action: BattleAction) => void;
  updatePlayerSynth: (synth: SynthInstance) => void;
  updateOpponentSynth: (synth: SynthInstance) => void;
  pushMessage: (msg: string) => void;
  nextMessage: () => boolean; // returns true if more messages
  setXpGained: (xp: number) => void;
  setCaptured: (captured: boolean) => void;
  incrementTurn: () => void;
  nextOpponentSynth: () => SynthInstance | null;
  endBattle: () => void;
}

export const useBattleStore = create<BattleStore>((set, get) => ({
  active: false,
  type: 'wild',
  playerSynth: null,
  playerPartyIndex: 0,
  opponentSynth: null,
  opponentParty: [],
  opponentPartyIndex: 0,
  opponentName: 'Wild',
  phase: 'intro',
  turn: 1,
  log: [],
  currentMessage: '',
  messageQueue: [],
  playerAction: null,
  xpGained: 0,
  captured: false,

  startWildBattle: (playerSynth, playerPartyIndex, wildSynth) => {
    set({
      active: true,
      type: 'wild',
      playerSynth: { ...playerSynth },
      playerPartyIndex,
      opponentSynth: { ...wildSynth },
      opponentParty: [wildSynth],
      opponentPartyIndex: 0,
      opponentName: 'Wild',
      phase: 'intro',
      turn: 1,
      log: [],
      currentMessage: `A wild ${wildSynth.nickname || wildSynth.speciesId} appeared!`,
      messageQueue: [],
      playerAction: null,
      xpGained: 0,
      captured: false,
    });
  },

  startTrainerBattle: (playerSynth, playerPartyIndex, opponentParty, opponentName) => {
    set({
      active: true,
      type: 'trainer',
      playerSynth: { ...playerSynth },
      playerPartyIndex,
      opponentSynth: { ...opponentParty[0] },
      opponentParty: opponentParty.map((s) => ({ ...s })),
      opponentPartyIndex: 0,
      opponentName,
      phase: 'intro',
      turn: 1,
      log: [],
      currentMessage: `${opponentName} wants to battle!`,
      messageQueue: [],
      playerAction: null,
      xpGained: 0,
      captured: false,
    });
  },

  setPhase: (phase) => set({ phase }),

  setPlayerAction: (action) => set({ playerAction: action }),

  updatePlayerSynth: (synth) => set({ playerSynth: { ...synth } }),

  updateOpponentSynth: (synth) => set({ opponentSynth: { ...synth } }),

  pushMessage: (msg) =>
    set((s) => ({
      messageQueue: [...s.messageQueue, msg],
      log: [...s.log, msg],
    })),

  nextMessage: () => {
    const { messageQueue } = get();
    if (messageQueue.length === 0) return false;
    const [next, ...rest] = messageQueue;
    set({ currentMessage: next, messageQueue: rest });
    return true;
  },

  setXpGained: (xp) => set({ xpGained: xp }),
  setCaptured: (captured) => set({ captured }),
  incrementTurn: () => set((s) => ({ turn: s.turn + 1 })),

  nextOpponentSynth: () => {
    const { opponentParty, opponentPartyIndex } = get();
    for (let i = opponentPartyIndex + 1; i < opponentParty.length; i++) {
      if (opponentParty[i].currentMemory > 0) {
        set({ opponentPartyIndex: i, opponentSynth: { ...opponentParty[i] } });
        return opponentParty[i];
      }
    }
    return null;
  },

  endBattle: () =>
    set({
      active: false,
      playerSynth: null,
      opponentSynth: null,
      opponentParty: [],
      phase: 'ended',
      currentMessage: '',
      messageQueue: [],
    }),
}));
