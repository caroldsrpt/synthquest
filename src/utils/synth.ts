import { SYNTH_SPECIES } from '../game/data/synths';
import { MOVES } from '../game/data/moves';
import type { SynthInstance, SynthStats } from '../game/data/types';

let nextId = 1;

export function calculateStats(speciesId: string, level: number): SynthStats {
  const species = SYNTH_SPECIES[speciesId];
  if (!species) throw new Error(`Unknown species: ${speciesId}`);

  // Simple stat formula: base + (base * level * 0.02)
  const scale = (base: number) => Math.floor(base + base * level * 0.02);

  return {
    output: scale(species.baseStats.output),
    clarity: scale(species.baseStats.clarity),
    memory: scale(species.baseStats.memory) + level * 2, // HP grows faster
    speed: scale(species.baseStats.speed),
    confidence: scale(species.baseStats.confidence),
  };
}

export function getMovesForLevel(speciesId: string, level: number): string[] {
  const species = SYNTH_SPECIES[speciesId];
  if (!species) return [];

  // Get all moves learned up to this level, take last 4
  const learned = species.learnset
    .filter((m) => m.level <= level)
    .map((m) => m.moveId);

  return learned.slice(-4); // max 4 moves
}

export function createSynth(speciesId: string, level: number): SynthInstance {
  const stats = calculateStats(speciesId, level);
  const moveIds = getMovesForLevel(speciesId, level);

  return {
    id: `synth_${nextId++}_${Date.now()}`,
    speciesId,
    level,
    xp: 0,
    stats,
    currentMemory: stats.memory,
    moves: moveIds.map((moveId) => ({
      moveId,
      currentPP: MOVES[moveId]?.pp ?? 10,
    })),
    statusEffects: [],
  };
}

export function xpForLevel(level: number): number {
  return Math.floor(50 * Math.pow(1.2, level - 1));
}
