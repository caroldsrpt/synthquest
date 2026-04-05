import { useCombatStore } from '@/stores/combatStore';
import { useRunStore } from '@/stores/runStore';
import { CARDS } from '@/game/data/cards';
import { getCardEffects, getCardCost, createCardInstance } from '@/utils/cardUtils';
import { CONTEXT_CAP } from '@/utils/constants';
import { randInt } from '@/utils/random';
import type { CardInstance, CardEffect } from '@/game/data/types';

function hasRelic(id: string): boolean {
  return useRunStore.getState().relics.includes(id);
}

/** Animation callbacks passed from CombatScreen */
export interface EffectAnimations {
  showPlayerAttack: () => void;
  showPlayerDefend: (amount: number) => void;
  showEnemyHit: (enemyId: string, dmg: number) => void;
  addFloat: (target: 'player' | string, text: string, color: string) => void;
}

/**
 * Resolve a single card effect. Reads/writes store state directly.
 * Animation callbacks are used for visual feedback only.
 */
export function resolveEffect(
  effect: CardEffect,
  card: CardInstance,
  anim: EffectAnimations,
  targetEnemyId?: string,
): { consumeContext: boolean } {
  const combat = useCombatStore.getState();
  const run = useRunStore.getState();
  const contextBonus = combat.playerStatus.find((s) => s.status === 'context')?.stacks || 0;
  let consumeContext = false;

  // Overfit: repeated card plays this turn deal halved damage
  const overfitStacks = combat.playerStatus.find((s) => s.status === 'overfit')?.stacks || 0;
  const priorPlays = combat.cardsPlayedThisTurn.filter((id) => id === card.defId).length;
  const isRepeatCard = overfitStacks > 0 && priorPlays > 1;

  switch (effect.type) {
    case 'damage': {
      const target = targetEnemyId || combat.enemies.find((e) => e.hp > 0)?.id;
      if (!target) break;
      let dmg = effect.amount + contextBonus;
      consumeContext = true;
      // Relic: fineTunedWeights — text cards deal +2
      const cardDef = CARDS[card.defId];
      if (hasRelic('fineTunedWeights') && cardDef?.category === 'text') dmg += 2;
      // Relic: gpuCluster — cards costing 2+ deal 25% more
      if (hasRelic('gpuCluster') && getCardCost(card) >= 2) dmg = Math.floor(dmg * 1.25);
      const enemy = combat.enemies.find((e) => e.id === target);
      if (enemy?.statusEffects.some((s) => s.status === 'vulnerable')) dmg = Math.floor(dmg * 1.5);
      if (combat.playerStatus.some((s) => s.status === 'weak')) dmg = Math.floor(dmg * 0.75);
      if (isRepeatCard) dmg = Math.floor(dmg * 0.5);
      const times = effect.times || 1;
      anim.showPlayerAttack();
      for (let i = 0; i < times; i++) useCombatStore.getState().damageEnemy(target, dmg);
      anim.showEnemyHit(target, dmg * times);
      break;
    }
    case 'damageRandom': {
      const target = targetEnemyId || combat.enemies.find((e) => e.hp > 0)?.id;
      if (!target) break;
      const dmg = randInt(effect.min, effect.max) + contextBonus;
      consumeContext = true;
      anim.showPlayerAttack();
      useCombatStore.getState().damageEnemy(target, dmg);
      anim.showEnemyHit(target, dmg);
      break;
    }
    case 'damageAll': {
      let dmg = effect.amount + contextBonus;
      consumeContext = true;
      if (combat.playerStatus.some((s) => s.status === 'weak')) dmg = Math.floor(dmg * 0.75);
      anim.showPlayerAttack();
      for (const enemy of combat.enemies) {
        if (enemy.hp > 0) {
          useCombatStore.getState().damageEnemy(enemy.id, dmg);
          anim.showEnemyHit(enemy.id, dmg);
        }
      }
      break;
    }
    case 'damagePerExhaust': {
      const dmg = combat.exhaustPile.length * effect.multiplier + contextBonus;
      consumeContext = true;
      for (const enemy of combat.enemies) {
        if (enemy.hp > 0) useCombatStore.getState().damageEnemy(enemy.id, dmg);
      }
      break;
    }
    case 'firewall':
      useCombatStore.getState().gainFirewall(effect.amount + contextBonus);
      anim.showPlayerDefend(effect.amount + contextBonus);
      consumeContext = true;
      break;
    case 'firewallFromMissingHp': {
      const missing = run.maxIntegrity - run.currentIntegrity;
      useCombatStore.getState().gainFirewall(missing + contextBonus);
      anim.showPlayerDefend(missing + contextBonus);
      consumeContext = true;
      break;
    }
    case 'draw':
      useCombatStore.getState().drawCards(effect.amount);
      break;
    case 'gainContext': {
      const current = combat.playerStatus.find((s) => s.status === 'context')?.stacks || 0;
      if (card.defId === 'benchmark' && effect.amount === 0) {
        const toAdd = Math.min(CONTEXT_CAP, current * 2) - current;
        if (toAdd > 0) useCombatStore.getState().addPlayerStatus({ status: 'context', stacks: toAdd });
      } else {
        const toAdd = Math.min(effect.amount, CONTEXT_CAP - current);
        if (toAdd > 0) useCombatStore.getState().addPlayerStatus({ status: 'context', stacks: toAdd });
      }
      break;
    }
    case 'gainGrounded': {
      let stacks = effect.amount;
      // Relic: embeddingIndex — Ground Truth gives +1 Grounded
      if (hasRelic('embeddingIndex') && card.defId === 'groundTruth') stacks += 1;
      useCombatStore.getState().addPlayerStatus({ status: 'grounded', stacks });
      break;
    }
    case 'applyStatus':
      if (effect.target === 'self') {
        useCombatStore.getState().addPlayerStatus({ status: effect.status, stacks: effect.stacks });
      } else if (targetEnemyId) {
        useCombatStore.getState().addEnemyStatus(targetEnemyId, { status: effect.status, stacks: effect.stacks });
      }
      break;
    case 'removeStatus':
      if (effect.status === 'all') useCombatStore.getState().clearAllPlayerStatus();
      else useCombatStore.getState().removePlayerStatus(effect.status, 999);
      break;
    case 'conditionalDamage': {
      const target = targetEnemyId || combat.enemies.find((e) => e.hp > 0)?.id;
      if (!target) break;
      const enemy = combat.enemies.find((e) => e.id === target);
      if (enemy && enemy.hp > enemy.maxHp * 0.5) useCombatStore.getState().damageEnemy(target, effect.amount);
      break;
    }
    case 'addRandomCards': {
      const pool = Object.values(CARDS).filter((c) => c.rarity === effect.rarity && c.id !== 'intentMirror' && c.rarity !== 'starter' && c.rarity !== 'curse');
      for (let i = 0; i < effect.count; i++) {
        if (pool.length === 0) break;
        const chosen = pool[Math.floor(Math.random() * pool.length)];
        const inst = createCardInstance(chosen.id);
        if (effect.costOverride !== undefined) inst.costOverride = effect.costOverride;
        useCombatStore.getState().addToHand(inst);
      }
      break;
    }
    case 'power_blockPerTurn':
      useCombatStore.getState().addPower({ type: 'blockPerTurn', amount: effect.amount });
      useCombatStore.getState().addLog(`Gained Power: +${effect.amount} Firewall/turn`);
      break;
    case 'power_drawPerTurn':
      useCombatStore.getState().addPower({ type: 'drawPerTurn', amount: effect.amount });
      useCombatStore.getState().addLog(`Gained Power: +${effect.amount} Draw/turn`);
      break;
    case 'power_reduceDamage':
      useCombatStore.getState().addPower({ type: 'reduceDamage', amount: effect.amount });
      useCombatStore.getState().addLog(`Gained Power: -${effect.amount} incoming damage per hit`);
      break;
    case 'power_firstCardFree':
      useCombatStore.getState().addPower({ type: 'firstCardFree' });
      useCombatStore.getState().addLog('Gained Power: First card each turn costs 0');
      break;
    case 'power_attackSplash':
      useCombatStore.getState().addPower({ type: 'attackSplash', amount: effect.amount });
      useCombatStore.getState().addLog(`Gained Power: Attacks splash ${effect.amount} damage to all enemies`);
      break;

    case 'replayLastCard': {
      const state = useCombatStore.getState();
      const played = state.cardsPlayedThisTurn;
      const lastDefId = played.length >= 1 ? played[played.length - 1] : null;
      if (!lastDefId || lastDefId === card.defId) { useCombatStore.getState().addLog('No valid card to replay.'); break; }
      const lastDef = CARDS[lastDefId];
      if (!lastDef) break;
      const replayInst = createCardInstance(lastDefId);
      replayInst.costOverride = 0;
      useCombatStore.getState().addLog(`Replaying ${lastDef.name}!`);
      for (const re of getCardEffects(replayInst)) {
        resolveEffect(re, replayInst, anim, targetEnemyId);
      }
      useCombatStore.setState((s) => ({ exhaustPile: [...s.exhaustPile, replayInst] }));
      break;
    }

    case 'playFromDraw': {
      const maxPlays = effect.maxPlays || 1;
      for (let i = 0; i < maxPlays; i++) {
        const drawState = useCombatStore.getState();
        if (drawState.drawPile.length === 0) break;
        const topCard = drawState.drawPile[0];
        const topDef = CARDS[topCard.defId];
        if (!topDef) break;
        useCombatStore.setState((s) => ({ drawPile: s.drawPile.slice(1) }));
        topCard.costOverride = 0;
        const dmgBefore = useCombatStore.getState().totalDamageDealtThisTurn;
        useCombatStore.getState().addLog(`Played ${topDef.name} from draw pile!`);
        useCombatStore.getState().trackCardPlayed(topCard.defId, topDef.category);
        const autoTarget = targetEnemyId || useCombatStore.getState().enemies.find((e) => e.hp > 0)?.id;
        for (const te of getCardEffects(topCard)) { resolveEffect(te, topCard, anim, autoTarget); }
        if (topDef.keywords?.includes('exhaust')) {
          useCombatStore.setState((s) => ({ exhaustPile: [...s.exhaustPile, topCard] }));
        } else { useCombatStore.getState().addToDiscard(topCard); }
        if (effect.onlyIfDamage) {
          const dmgAfter = useCombatStore.getState().totalDamageDealtThisTurn;
          if (dmgAfter <= dmgBefore) break;
        }
      }
      break;
    }

    case 'playFromHand': {
      const playableHand = useCombatStore.getState().hand.filter((c) => c.defId !== card.defId && c.defId !== 'hallucination');
      const toPlay = [...playableHand].sort(() => Math.random() - 0.5).slice(0, effect.count);
      for (const handCard of toPlay) {
        if (!useCombatStore.getState().hand.find((c) => c.id === handCard.id)) continue;
        const hDef = CARDS[handCard.defId];
        if (!hDef) continue;
        useCombatStore.setState((s) => ({ hand: s.hand.filter((c) => c.id !== handCard.id) }));
        handCard.costOverride = 0;
        useCombatStore.getState().addLog(`Orchestrator plays ${hDef.name}!`);
        useCombatStore.getState().trackCardPlayed(handCard.defId, hDef.category);
        const autoTarget = targetEnemyId || useCombatStore.getState().enemies.find((e) => e.hp > 0)?.id;
        for (const he of getCardEffects(handCard)) { resolveEffect(he, handCard, anim, autoTarget); }
        if (hDef.keywords?.includes('exhaust')) {
          useCombatStore.setState((s) => ({ exhaustPile: [...s.exhaustPile, handCard] }));
        } else { useCombatStore.getState().addToDiscard(handCard); }
      }
      break;
    }

    case 'scry':
      useCombatStore.getState().drawCards(1);
      useCombatStore.getState().addLog(`Scried top ${effect.amount} cards — drew 1.`);
      break;

    case 'copyEnemyIntent': {
      const enemy = targetEnemyId ? combat.enemies.find((e) => e.id === targetEnemyId) : combat.enemies.find((e) => e.hp > 0);
      if (!enemy) break;
      const mirrorInst = createCardInstance('intentMirror');
      mirrorInst.costOverride = 0;
      useCombatStore.getState().addToHand(mirrorInst);
      useCombatStore.getState().addLog('Copied enemy intent as Intent Mirror!');
      break;
    }

    case 'permanentUpgradePrompt': {
      const runState = useRunStore.getState();
      const nonUpgraded = runState.deck.filter((c) => c.defId === 'prompt' && !c.upgraded);
      if (nonUpgraded.length > 0) {
        const pick = nonUpgraded[Math.floor(Math.random() * nonUpgraded.length)];
        runState.upgradeCardInDeck(pick.id);
        useCombatStore.getState().addLog('Permanently upgraded a Prompt!');
      } else { useCombatStore.getState().addLog('No Prompts to upgrade.'); }
      break;
    }

    case 'exhaustFromHand': {
      const curHand = useCombatStore.getState().hand;
      const exhaustable = curHand
        .filter((c) => { const d = CARDS[c.defId]; return d && d.rarity !== 'curse' && c.id !== card.id; })
        .sort((a, b) => {
          const aDef = CARDS[a.defId];
          const bDef = CARDS[b.defId];
          return (aDef?.cost ?? 0) - (bDef?.cost ?? 0);
        });
      if (exhaustable.length > 0) {
        const toExhaust = exhaustable[0];
        useCombatStore.setState((s) => ({
          hand: s.hand.filter((c) => c.id !== toExhaust.id),
          exhaustPile: [...s.exhaustPile, toExhaust],
        }));
        useCombatStore.getState().addLog(`Exhausted ${CARDS[toExhaust.defId]?.name || 'a card'}.`);
      }
      break;
    }

    case 'heal':
      useRunStore.getState().heal(effect.amount);
      useCombatStore.getState().addLog(`Healed ${effect.amount} HP.`);
      break;

    case 'addTempCards':
      for (let i = 0; i < effect.count; i++) {
        const tempInst = createCardInstance(effect.cardId);
        if (effect.costOverride !== undefined) tempInst.costOverride = effect.costOverride;
        useCombatStore.getState().addToHand(tempInst);
      }
      useCombatStore.getState().addLog(`Added ${effect.count} ${CARDS[effect.cardId]?.name || 'cards'} to hand.`);
      break;
  }

  return { consumeContext: consumeContext && contextBonus > 0 };
}

/**
 * Resolve all effects for a card, handling context consumption.
 */
export function resolveCardEffects(
  effects: CardEffect[],
  card: CardInstance,
  anim: EffectAnimations,
  targetEnemyId?: string,
): void {
  let shouldConsumeContext = false;

  for (const effect of effects) {
    const result = resolveEffect(effect, card, anim, targetEnemyId);
    if (result.consumeContext) shouldConsumeContext = true;
  }

  if (shouldConsumeContext) {
    useCombatStore.getState().removePlayerStatus('context', 999);
  }
}
