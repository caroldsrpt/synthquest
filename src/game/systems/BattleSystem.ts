import type { SynthInstance, Move, StatusEffect, SynthStats } from '../data/types';
import { MOVES } from '../data/moves';
import { SYNTH_SPECIES } from '../data/synths';
import { getTypeEffectiveness, getEffectivenessLabel } from '../../utils/typeChart';

export interface TurnResult {
  messages: string[];
  playerSynth: SynthInstance;
  opponentSynth: SynthInstance;
  playerFainted: boolean;
  opponentFainted: boolean;
}

function getName(synth: SynthInstance): string {
  return synth.nickname || SYNTH_SPECIES[synth.speciesId]?.name || synth.speciesId;
}

function getStatStage(stages: number): number {
  // Pokemon-style stat stage multiplier: -6 to +6
  if (stages >= 0) return (2 + stages) / 2;
  return 2 / (2 - stages);
}

function applyStatModifier(
  synth: SynthInstance,
  stat: keyof SynthStats,
  _stages: number
): { synth: SynthInstance; message: string } {
  // We track stat stages separately in a simple way: modify the actual stat
  // For MVP, just apply a percentage boost/debuff
  const mult = _stages > 0 ? 1.5 : 0.67;
  const newStats = { ...synth.stats };
  newStats[stat] = Math.max(1, Math.floor(newStats[stat] * mult));
  const name = getName(synth);
  const statNames: Record<string, string> = {
    output: 'Output', clarity: 'Clarity', memory: 'Memory', speed: 'Speed', confidence: 'Confidence'
  };
  const direction = _stages > 0 ? 'rose' : 'fell';
  return {
    synth: { ...synth, stats: newStats },
    message: `${name}'s ${statNames[stat]} ${direction}!`,
  };
}

function hasStatus(synth: SynthInstance, effect: StatusEffect): boolean {
  return synth.statusEffects.some((s) => s.effect === effect);
}

function addStatus(
  synth: SynthInstance,
  effect: StatusEffect,
  duration: number
): SynthInstance {
  // Don't stack, refresh duration
  if (effect === 'grounded') {
    // Grounded also cures hallucinating
    return {
      ...synth,
      statusEffects: [
        ...synth.statusEffects.filter((s) => s.effect !== 'hallucinating' && s.effect !== 'grounded'),
        { effect, turnsLeft: duration },
      ],
    };
  }
  if (hasStatus(synth, effect)) {
    return {
      ...synth,
      statusEffects: synth.statusEffects.map((s) =>
        s.effect === effect ? { ...s, turnsLeft: duration } : s
      ),
    };
  }
  return {
    ...synth,
    statusEffects: [...synth.statusEffects, { effect, turnsLeft: duration }],
  };
}

function tickStatusEffects(synth: SynthInstance): { synth: SynthInstance; messages: string[] } {
  const messages: string[] = [];
  const name = getName(synth);
  let updated = { ...synth };

  updated.statusEffects = updated.statusEffects
    .map((s) => ({ ...s, turnsLeft: s.turnsLeft - 1 }))
    .filter((s) => {
      if (s.turnsLeft <= 0) {
        messages.push(`${name} is no longer ${s.effect}!`);
        return false;
      }
      return true;
    });

  return { synth: updated, messages };
}

function calculateDamage(
  attacker: SynthInstance,
  defender: SynthInstance,
  move: Move
): { damage: number; effectiveness: number } {
  if (move.power === 0) return { damage: 0, effectiveness: 1 };

  const defenderTypes = SYNTH_SPECIES[defender.speciesId]?.types || [];
  const effectiveness = getTypeEffectiveness(move.type, defenderTypes);

  // damage = (attacker.output * move.power / defender.clarity) * typeModifier * random
  const baseDamage = (attacker.stats.output * move.power) / Math.max(1, defender.stats.clarity);
  const randomMult = 0.85 + Math.random() * 0.15;
  const damage = Math.max(1, Math.floor(baseDamage * effectiveness * randomMult * 0.15));

  return { damage, effectiveness };
}

function executeMove(
  attacker: SynthInstance,
  defender: SynthInstance,
  moveIndex: number,
  isPlayer: boolean
): { attacker: SynthInstance; defender: SynthInstance; messages: string[] } {
  const messages: string[] = [];
  const moveSlot = attacker.moves[moveIndex];
  if (!moveSlot || moveSlot.currentPP <= 0) {
    messages.push(`${getName(attacker)} has no moves left!`);
    return { attacker, defender, messages };
  }

  const move = MOVES[moveSlot.moveId];
  if (!move) {
    messages.push(`${getName(attacker)} tried an unknown move!`);
    return { attacker, defender, messages };
  }

  // Deduct PP
  let updatedAttacker = {
    ...attacker,
    moves: attacker.moves.map((m, i) =>
      i === moveIndex ? { ...m, currentPP: m.currentPP - 1 } : m
    ),
  };

  messages.push(`${getName(attacker)} used ${move.name}!`);

  // Check hallucination: 40% chance to hit self
  if (hasStatus(attacker, 'hallucinating') && !hasStatus(attacker, 'grounded')) {
    if (Math.random() < 0.4) {
      messages.push(`${getName(attacker)} is hallucinating and hurt itself!`);
      const selfDamage = Math.max(1, Math.floor(attacker.stats.output * 0.1));
      updatedAttacker = {
        ...updatedAttacker,
        currentMemory: Math.max(0, updatedAttacker.currentMemory - selfDamage),
      };
      return { attacker: updatedAttacker, defender, messages };
    }
  }

  // Check overfit: locked into same move (handled at selection level)

  // Accuracy check
  const accMod = attacker.stats.confidence / 50; // base 50 = 1.0x
  const hitChance = move.accuracy * Math.min(1.5, accMod);
  if (Math.random() * 100 > hitChance) {
    messages.push(`${getName(attacker)}'s attack missed!`);
    return { attacker: updatedAttacker, defender, messages };
  }

  let updatedDefender = { ...defender };

  // Deal damage
  if (move.power > 0) {
    const { damage, effectiveness } = calculateDamage(updatedAttacker, updatedDefender, move);
    updatedDefender = {
      ...updatedDefender,
      currentMemory: Math.max(0, updatedDefender.currentMemory - damage),
    };
    messages.push(`It dealt ${damage} damage!`);

    const effectLabel = getEffectivenessLabel(effectiveness);
    if (effectLabel) messages.push(effectLabel);
  }

  // Apply status effect
  if (move.statusEffect) {
    const { target, effect, chance, duration } = move.statusEffect;
    if (Math.random() * 100 < chance) {
      if (target === 'opponent') {
        if (hasStatus(updatedDefender, 'grounded') && effect === 'hallucinating') {
          messages.push(`${getName(updatedDefender)} is grounded — hallucination has no effect!`);
        } else {
          updatedDefender = addStatus(updatedDefender, effect, duration);
          messages.push(`${getName(updatedDefender)} is now ${effect}!`);
        }
      } else {
        updatedAttacker = addStatus(updatedAttacker, effect, duration);
        if (effect === 'grounded') {
          messages.push(`${getName(updatedAttacker)} is grounded in truth!`);
        } else {
          messages.push(`${getName(updatedAttacker)} is now ${effect}!`);
        }
      }
    }
  }

  // Apply stat modifier
  if (move.statModifier) {
    const { target, stat, stages } = move.statModifier;
    if (target === 'self') {
      const result = applyStatModifier(updatedAttacker, stat, stages);
      updatedAttacker = result.synth;
      messages.push(result.message);
    } else {
      const result = applyStatModifier(updatedDefender, stat, stages);
      updatedDefender = result.synth;
      messages.push(result.message);
    }
  }

  return { attacker: updatedAttacker, defender: updatedDefender, messages };
}

export function resolveTurn(
  playerSynth: SynthInstance,
  opponentSynth: SynthInstance,
  playerMoveIndex: number,
  opponentMoveIndex: number
): TurnResult {
  const messages: string[] = [];
  let pSynth = { ...playerSynth };
  let oSynth = { ...opponentSynth };

  // Determine order by speed (player wins ties)
  const playerFirst = pSynth.stats.speed >= oSynth.stats.speed;

  const [firstIsPlayer, first, second] = playerFirst
    ? [true, { synth: pSynth, moveIdx: playerMoveIndex }, { synth: oSynth, moveIdx: opponentMoveIndex }]
    : [false, { synth: oSynth, moveIdx: opponentMoveIndex }, { synth: pSynth, moveIdx: playerMoveIndex }];

  // First attack
  const result1 = executeMove(
    first.synth,
    second.synth,
    first.moveIdx,
    firstIsPlayer
  );

  if (firstIsPlayer) {
    pSynth = result1.attacker;
    oSynth = result1.defender;
  } else {
    oSynth = result1.attacker;
    pSynth = result1.defender;
  }
  messages.push(...result1.messages);

  // Check if second combatant fainted
  if (pSynth.currentMemory > 0 && oSynth.currentMemory > 0) {
    // Second attack
    const result2 = executeMove(
      firstIsPlayer ? oSynth : pSynth,
      firstIsPlayer ? pSynth : oSynth,
      second.moveIdx,
      !firstIsPlayer
    );

    if (firstIsPlayer) {
      oSynth = result2.attacker;
      pSynth = result2.defender;
    } else {
      pSynth = result2.attacker;
      oSynth = result2.defender;
    }
    messages.push(...result2.messages);
  }

  // Tick status effects
  if (pSynth.currentMemory > 0) {
    const pTick = tickStatusEffects(pSynth);
    pSynth = pTick.synth;
    messages.push(...pTick.messages);
  }
  if (oSynth.currentMemory > 0) {
    const oTick = tickStatusEffects(oSynth);
    oSynth = oTick.synth;
    messages.push(...oTick.messages);
  }

  return {
    messages,
    playerSynth: pSynth,
    opponentSynth: oSynth,
    playerFainted: pSynth.currentMemory <= 0,
    opponentFainted: oSynth.currentMemory <= 0,
  };
}

export function chooseOpponentMove(synth: SynthInstance): number {
  // Simple AI: pick a random available move
  const available = synth.moves
    .map((m, i) => ({ ...m, index: i }))
    .filter((m) => m.currentPP > 0);

  if (available.length === 0) return 0;
  return available[Math.floor(Math.random() * available.length)].index;
}

export function calculateCaptureRate(
  synth: SynthInstance,
  rateBonus: number
): boolean {
  const species = SYNTH_SPECIES[synth.speciesId];
  if (!species) return false;

  // Capture formula: (captureRate * rateBonus * (1 - currentHP%)) / 255
  const hpPercent = synth.currentMemory / synth.stats.memory;
  const rate = species.captureRate * rateBonus * (1 - hpPercent * 0.5);
  const chance = Math.min(0.95, rate / 255);

  return Math.random() < chance;
}

export function calculateXP(defeated: SynthInstance): number {
  return Math.floor(defeated.level * 15 + 20);
}
