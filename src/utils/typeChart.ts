import type { SynthType } from '../game/data/types';

// effectiveness[attacker][defender] = multiplier
const chart: Record<SynthType, Record<SynthType, number>> = {
  text:      { text: 1,   structure: 2,   logic: 0.5, vision: 1,   noise: 0.5 },
  structure: { text: 0.5, structure: 1,   logic: 0.5, vision: 1,   noise: 2   },
  logic:     { text: 2,   structure: 2,   logic: 1,   vision: 0.5, noise: 1   },
  vision:    { text: 0.5, structure: 1,   logic: 2,   vision: 1,   noise: 1   },
  noise:     { text: 1,   structure: 0.5, logic: 1,   vision: 2,   noise: 1   },
};

export function getTypeEffectiveness(attackType: SynthType, defenderTypes: SynthType[]): number {
  let mult = 1;
  for (const dt of defenderTypes) {
    mult *= chart[attackType][dt];
  }
  return mult;
}

export function getEffectivenessLabel(mult: number): string | null {
  if (mult >= 2) return "It's super effective!";
  if (mult <= 0.5) return "It's not very effective...";
  return null;
}
