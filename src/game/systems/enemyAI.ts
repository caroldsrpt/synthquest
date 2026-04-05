import { useCombatStore } from '@/stores/combatStore';
import { useRunStore } from '@/stores/runStore';
import { ENEMIES } from '@/game/data/enemies';
import { createCardInstance } from '@/utils/cardUtils';
import { HALLUCINATION_TRIGGER_CHANCE, HALLUCINATION_SELF_DAMAGE } from '@/utils/constants';
import type { EnemyInstance } from '@/game/data/types';

/** Animation callbacks passed from CombatScreen */
export interface EnemyAnimations {
  setMessage: (msg: string) => void;
  setEnemyHit: (id: string | null) => void;
  showPlayerHit: (dmg: number) => void;
  showPlayerDebuffed: (name: string) => void;
  addFloat: (target: 'player' | string, text: string, color: string) => void;
}

export function getDebuffDescription(status: string, stacks: number): string {
  switch (status) {
    case 'hallucination': return `Hallucination x${stacks}! (Shuffles ${stacks} curse card${stacks > 1 ? 's' : ''} into your deck — deals 3 damage when in hand)`;
    case 'confused': return `Confused x${stacks}! (Each stack randomizes 1 card's energy cost at start of turn)`;
    case 'vulnerable': return `Vulnerable x${stacks}! (Take 50% more damage)`;
    case 'weak': return `Weak x${stacks}! (Deal 25% less damage)`;
    case 'throttled': return `Throttled x${stacks}! (Reduced energy)`;
    case 'overfit': return `Overfit x${stacks}! (Playing the same card twice halves its damage)`;
    default: return `${status} x${stacks}`;
  }
}

/**
 * Execute a single enemy's intent: apply damage, debuffs, buffs, etc.
 */
export function executeEnemyIntent(
  enemy: EnemyInstance,
  anim: EnemyAnimations,
  curseName: string,
  curseDesc: string,
): void {
  const combat = useCombatStore.getState();
  const intent = enemy.currentIntent;
  const def = ENEMIES[enemy.defId];
  const name = def?.name || 'Enemy';

  // Calculate total reduceDamage from active powers
  const reduceAmount = combat.activePowers
    .filter((p) => p.type === 'reduceDamage')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  switch (intent.type) {
    case 'attack':
    case 'attackMulti': {
      let dmg = intent.damage;
      if (enemy.statusEffects.some((s) => s.status === 'weak')) dmg = Math.floor(dmg * 0.75);
      if (reduceAmount > 0) dmg = Math.max(0, dmg - reduceAmount);
      const hits = intent.type === 'attackMulti' ? (intent.times || 1) : 1;
      anim.setEnemyHit(enemy.id);
      setTimeout(() => anim.setEnemyHit(null), 300);
      let totalDmg = 0;
      for (let i = 0; i < hits; i++) {
        const actual = useCombatStore.getState().takeDamage(dmg);
        useRunStore.getState().takeDamage(actual);
        totalDmg += actual;
      }
      anim.showPlayerHit(totalDmg);
      anim.setMessage(`${name} attacks for ${dmg}${hits > 1 ? ` x${hits}` : ''}!`);
      useCombatStore.getState().addLog(`${name} attacks for ${dmg}${hits > 1 ? ` x${hits}` : ''}`);
      break;
    }
    case 'attackDebuff': {
      let dmg = intent.damage;
      if (enemy.statusEffects.some((s) => s.status === 'weak')) dmg = Math.floor(dmg * 0.75);
      if (reduceAmount > 0) dmg = Math.max(0, dmg - reduceAmount);
      anim.setEnemyHit(enemy.id);
      setTimeout(() => anim.setEnemyHit(null), 300);
      const actual = useCombatStore.getState().takeDamage(dmg);
      useRunStore.getState().takeDamage(actual);
      anim.showPlayerHit(actual);
      setTimeout(() => anim.showPlayerDebuffed(intent.status), 400);
      if (intent.status === 'hallucination') {
        for (let i = 0; i < intent.stacks; i++) {
          useCombatStore.getState().shuffleIntoDraw(createCardInstance('hallucination'));
        }
        anim.setMessage(`${name} attacks for ${dmg} + shuffles ${intent.stacks} ${curseName} card${intent.stacks > 1 ? 's' : ''} into your deck!`);
      } else {
        useCombatStore.getState().addPlayerStatus({ status: intent.status, stacks: intent.stacks });
        anim.setMessage(`${name} attacks for ${dmg} + ${getDebuffDescription(intent.status, intent.stacks)}`);
      }
      useCombatStore.getState().addLog(`${name} attacks for ${dmg} + ${intent.status}`);
      break;
    }
    case 'defend':
      useCombatStore.getState().updateEnemy(enemy.id, { firewall: enemy.firewall + intent.firewall });
      anim.addFloat(enemy.id, `+${intent.firewall} FW`, '#60a5fa');
      anim.setMessage(`${name} gains ${intent.firewall} Firewall`);
      useCombatStore.getState().addLog(`${name} gains ${intent.firewall} Firewall`);
      break;
    case 'buff':
      if (enemy.defId === 'ghostEndpoint') {
        useCombatStore.getState().addEnemyStatus(enemy.id, { status: 'intangible', stacks: 1 });
      }
      anim.addFloat(enemy.id, 'BUFF', '#fbbf24');
      anim.setMessage(`${name} buffs itself!`);
      useCombatStore.getState().addLog(`${name} buffs itself`);
      break;
    case 'debuff':
      if (intent.status === 'hallucination') {
        for (let i = 0; i < intent.stacks; i++) {
          useCombatStore.getState().shuffleIntoDraw(createCardInstance('hallucination'));
        }
        anim.showPlayerDebuffed(curseName);
        anim.setMessage(`${name} shuffles ${intent.stacks} ${curseName} card${intent.stacks > 1 ? 's' : ''} into your deck! (${curseDesc})`);
        useCombatStore.getState().addLog(`${name} adds ${intent.stacks} ${curseName} cards`);
      } else {
        useCombatStore.getState().addPlayerStatus({ status: intent.status, stacks: intent.stacks });
        anim.showPlayerDebuffed(intent.status);
        anim.setMessage(`${name} applies ${getDebuffDescription(intent.status, intent.stacks)}`);
        useCombatStore.getState().addLog(`${name} applies ${intent.status}`);
      }
      break;
  }
}

/**
 * Process hallucination curse cards in hand at end of turn.
 * Returns true if player died.
 */
export function processHallucinationCards(
  showPlayerHit: (dmg: number) => void,
): void {
  const hand = useCombatStore.getState().hand;
  const halCards = hand.filter((c) => c.defId === 'hallucination');
  for (const halCard of halCards) {
    const grounded = useCombatStore.getState().playerStatus.find((s) => s.status === 'grounded');
    if (grounded && grounded.stacks > 0) {
      useCombatStore.getState().removePlayerStatus('grounded', 1);
      useCombatStore.getState().addLog('Grounded absorbed a Hallucination card!');
    } else {
      useRunStore.getState().takeDamage(HALLUCINATION_SELF_DAMAGE);
      showPlayerHit(HALLUCINATION_SELF_DAMAGE);
      useCombatStore.getState().addLog(`Hallucination card dealt ${HALLUCINATION_SELF_DAMAGE} damage!`);
    }
    // Exhaust the hallucination card after it triggers
    useCombatStore.setState((s) => ({
      hand: s.hand.filter((c) => c.id !== halCard.id),
      exhaustPile: [...s.exhaustPile, halCard],
    }));
  }
}

/**
 * Tick down enemy debuffs and trigger enemy hallucination damage.
 */
export function tickEnemyDebuffs(): void {
  const combat = useCombatStore.getState();
  for (const enemy of combat.enemies) {
    for (const status of ['vulnerable', 'weak'] as const) {
      const s = enemy.statusEffects.find((e) => e.status === status);
      if (s && s.stacks > 0) useCombatStore.getState().addEnemyStatus(enemy.id, { status, stacks: -1 });
    }
    // Enemy hallucination
    const eHal = enemy.statusEffects.find((s) => s.status === 'hallucination');
    if (eHal) {
      for (let i = 0; i < eHal.stacks; i++) {
        if (Math.random() < HALLUCINATION_TRIGGER_CHANCE) {
          useCombatStore.getState().damageEnemy(enemy.id, HALLUCINATION_SELF_DAMAGE);
        }
      }
    }
  }
}
