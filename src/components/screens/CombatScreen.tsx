import { useCallback, useEffect } from 'react';
import { useCombatStore } from '../../stores/combatStore';
import { useRunStore } from '../../stores/runStore';
import { CARDS } from '../../game/data/cards';
import { getNextIntent, ENEMIES } from '../../game/data/enemies';
import { getCardCost, getCardEffects, getCardName, createCardInstance } from '../../utils/cardUtils';
import { COLORS, HALLUCINATION_TRIGGER_CHANCE, HALLUCINATION_SELF_DAMAGE, CONTEXT_CAP } from '../../utils/constants';
import { randInt } from '../../utils/random';
import { HandDisplay } from '../combat/HandDisplay';
import { EnemyDisplay } from '../combat/EnemyDisplay';
import { PlayerStatus } from '../combat/PlayerStatus';
import type { CardInstance, CardEffect, EnemyInstance } from '../../game/data/types';

export function CombatScreen() {
  const combat = useCombatStore();
  const run = useRunStore();

  // Start turn when entering playerTurn phase
  useEffect(() => {
    if (combat.active && combat.phase === 'start') {
      combat.startTurn();
    }
  }, [combat.active, combat.phase]);

  const handleSelectCard = useCallback((index: number) => {
    const card = combat.hand[index];
    if (!card) return;
    const def = CARDS[card.defId];
    if (!def) return;
    const cost = getCardCost(card);

    if (cost > combat.energy) return;

    if (def.target === 'singleEnemy') {
      // Enter targeting mode
      combat.setTargeting(index);
    } else {
      // Play immediately
      playCard(index);
    }
  }, [combat]);

  const handleTargetEnemy = useCallback((enemyId: string) => {
    if (combat.targetingCardIndex === null) return;
    playCard(combat.targetingCardIndex, enemyId);
  }, [combat.targetingCardIndex]);

  const playCard = useCallback((handIndex: number, targetEnemyId?: string) => {
    const card = combat.hand[handIndex];
    if (!card) return;
    const def = CARDS[card.defId];
    if (!def) return;
    const cost = getCardCost(card);

    if (!combat.spendEnergy(cost)) return;

    const effects = getCardEffects(card);
    const name = getCardName(card);
    combat.addLog(`Played ${name}`);

    // Track
    combat.trackCardPlayed(card.defId, def.category);

    // Resolve effects
    for (const effect of effects) {
      resolveEffect(effect, card, targetEnemyId);
    }

    // Move card
    combat.playCard(handIndex, targetEnemyId);
    if (def.keywords?.includes('exhaust')) {
      combat.addToDiscard(card); // playCard already removed from hand
      // Move from discard to exhaust
      const state = useCombatStore.getState();
      const discIdx = state.discardPile.findIndex((c) => c.id === card.id);
      if (discIdx >= 0) {
        const pile = [...state.discardPile];
        pile.splice(discIdx, 1);
        useCombatStore.setState({
          discardPile: pile,
          exhaustPile: [...state.exhaustPile, card],
        });
      }
    } else {
      combat.addToDiscard(card);
    }

    // Check enemies dead
    checkEnemiesDead();
  }, [combat]);

  const resolveEffect = useCallback((effect: CardEffect, card: CardInstance, targetEnemyId?: string) => {
    const state = useCombatStore.getState();

    // Apply Context bonus to damage/firewall
    const contextBonus = state.playerStatus.find((s) => s.status === 'context')?.stacks || 0;
    let consumeContext = false;

    switch (effect.type) {
      case 'damage': {
        const target = targetEnemyId || state.enemies.find((e) => e.hp > 0)?.id;
        if (!target) break;
        let dmg = effect.amount + contextBonus;
        consumeContext = true;

        // Vulnerable check
        const enemy = state.enemies.find((e) => e.id === target);
        if (enemy?.statusEffects.some((s) => s.status === 'vulnerable')) {
          dmg = Math.floor(dmg * 1.5);
        }
        // Weak check (player)
        if (state.playerStatus.some((s) => s.status === 'weak')) {
          dmg = Math.floor(dmg * 0.75);
        }

        const times = effect.times || 1;
        for (let i = 0; i < times; i++) {
          combat.damageEnemy(target, dmg);
        }
        break;
      }
      case 'damageRandom': {
        const target = targetEnemyId || state.enemies.find((e) => e.hp > 0)?.id;
        if (!target) break;
        let dmg = randInt(effect.min, effect.max) + contextBonus;
        consumeContext = true;
        combat.damageEnemy(target, dmg);
        break;
      }
      case 'damageAll': {
        let dmg = effect.amount + contextBonus;
        consumeContext = true;
        if (state.playerStatus.some((s) => s.status === 'weak')) {
          dmg = Math.floor(dmg * 0.75);
        }
        for (const enemy of state.enemies) {
          if (enemy.hp > 0) combat.damageEnemy(enemy.id, dmg);
        }
        break;
      }
      case 'damagePerExhaust': {
        const dmg = state.exhaustPile.length * effect.multiplier + contextBonus;
        consumeContext = true;
        for (const enemy of state.enemies) {
          if (enemy.hp > 0) combat.damageEnemy(enemy.id, dmg);
        }
        break;
      }
      case 'firewall': {
        combat.gainFirewall(effect.amount + contextBonus);
        consumeContext = true;
        break;
      }
      case 'firewallFromMissingHp': {
        const missing = run.maxIntegrity - run.currentIntegrity;
        combat.gainFirewall(missing + contextBonus);
        consumeContext = true;
        break;
      }
      case 'draw': {
        combat.drawCards(effect.amount);
        break;
      }
      case 'gainContext': {
        const current = state.playerStatus.find((s) => s.status === 'context')?.stacks || 0;
        // Benchmark: double current
        if (effect.amount === 0 && card.defId === 'benchmark') {
          const doubled = Math.min(CONTEXT_CAP, current * 2);
          const toAdd = doubled - current;
          if (toAdd > 0) combat.addPlayerStatus({ status: 'context', stacks: toAdd });
        } else {
          const toAdd = Math.min(effect.amount, CONTEXT_CAP - current);
          if (toAdd > 0) combat.addPlayerStatus({ status: 'context', stacks: toAdd });
        }
        break;
      }
      case 'gainGrounded': {
        combat.addPlayerStatus({ status: 'grounded', stacks: effect.amount });
        break;
      }
      case 'applyStatus': {
        if (effect.target === 'self') {
          combat.addPlayerStatus({ status: effect.status, stacks: effect.stacks });
        } else if (targetEnemyId) {
          combat.addEnemyStatus(targetEnemyId, { status: effect.status, stacks: effect.stacks });
        }
        break;
      }
      case 'removeStatus': {
        if (effect.status === 'all') {
          combat.clearAllPlayerStatus();
        } else {
          combat.removePlayerStatus(effect.status, 999);
        }
        break;
      }
      case 'conditionalDamage': {
        const target = targetEnemyId || state.enemies.find((e) => e.hp > 0)?.id;
        if (!target) break;
        const enemy = state.enemies.find((e) => e.id === target);
        if (enemy && enemy.hp > enemy.maxHp * 0.5) {
          combat.damageEnemy(target, effect.amount);
        }
        break;
      }
      case 'addRandomCards': {
        // Add random cards to hand
        const pool = Object.values(CARDS).filter((c) => c.rarity === effect.rarity && c.id !== 'intentMirror');
        for (let i = 0; i < effect.count; i++) {
          if (pool.length === 0) break;
          const chosen = pool[Math.floor(Math.random() * pool.length)];
          const inst = createCardInstance(chosen.id);
          if (effect.costOverride !== undefined) inst.costOverride = effect.costOverride;
          combat.addToHand(inst);
        }
        break;
      }
      default:
        break;
    }

    // Consume context after first damage/firewall effect
    if (consumeContext && contextBonus > 0) {
      combat.removePlayerStatus('context', 999);
    }
  }, [combat, run]);

  const checkEnemiesDead = useCallback(() => {
    const state = useCombatStore.getState();
    const allDead = state.enemies.every((e) => e.hp <= 0);
    if (allDead) {
      combat.setPhase('reward');
    }
  }, [combat]);

  const handleEndTurn = useCallback(() => {
    if (combat.phase !== 'playerTurn') return;

    // Discard hand (except retain)
    const cardDefs = CARDS;
    const retained: CardInstance[] = [];
    const discarded: CardInstance[] = [];
    for (const card of combat.hand) {
      const def = cardDefs[card.defId];
      if (def?.keywords?.includes('retain')) {
        retained.push(card);
      } else {
        discarded.push(card);
      }
    }
    useCombatStore.setState({
      hand: retained,
      discardPile: [...useCombatStore.getState().discardPile, ...discarded],
    });

    // Trigger hallucination self-damage
    const halStacks = combat.playerStatus.find((s) => s.status === 'hallucination')?.stacks || 0;
    for (let i = 0; i < halStacks; i++) {
      if (Math.random() < HALLUCINATION_TRIGGER_CHANCE) {
        const grounded = useCombatStore.getState().playerStatus.find((s) => s.status === 'grounded');
        if (grounded && grounded.stacks > 0) {
          combat.removePlayerStatus('grounded', 1);
          combat.addLog('Grounded absorbed a hallucination!');
        } else {
          run.takeDamage(HALLUCINATION_SELF_DAMAGE);
          combat.addLog(`Hallucination dealt ${HALLUCINATION_SELF_DAMAGE} to yourself!`);
        }
      }
    }

    // Tick player debuffs
    for (const status of ['vulnerable', 'weak', 'confused', 'overfit']) {
      combat.removePlayerStatus(status, 1);
    }

    // Check player death
    if (run.currentIntegrity <= 0) {
      combat.endCombat();
      return;
    }

    // Enemy phase
    combat.setPhase('enemyTurn');

    // Execute enemy intents
    setTimeout(() => {
      const enemies = useCombatStore.getState().enemies.filter((e) => e.hp > 0);
      for (const enemy of enemies) {
        executeEnemyIntent(enemy);
      }

      // Advance enemy intents
      for (const enemy of useCombatStore.getState().enemies.filter((e) => e.hp > 0)) {
        const nextIntent = getNextIntent({ ...enemy, turnCounter: enemy.turnCounter + 1 });
        combat.updateEnemy(enemy.id, {
          currentIntent: nextIntent,
          turnCounter: enemy.turnCounter + 1,
        });
      }

      // Tick enemy debuffs
      for (const enemy of useCombatStore.getState().enemies) {
        for (const status of ['vulnerable', 'weak'] as const) {
          const s = enemy.statusEffects.find((e) => e.status === status);
          if (s && s.stacks > 0) {
            combat.addEnemyStatus(enemy.id, { status, stacks: -1 });
          }
        }
        // Hallucination self-damage on enemies
        const eHal = enemy.statusEffects.find((s) => s.status === 'hallucination');
        if (eHal) {
          for (let i = 0; i < eHal.stacks; i++) {
            if (Math.random() < HALLUCINATION_TRIGGER_CHANCE) {
              combat.damageEnemy(enemy.id, HALLUCINATION_SELF_DAMAGE);
            }
          }
        }
      }

      // Check enemies dead after their own hallucination damage
      checkEnemiesDead();

      // Check player death
      if (useRunStore.getState().currentIntegrity <= 0) {
        combat.endCombat();
        return;
      }

      // Start next turn
      combat.setPhase('start');
    }, 600);
  }, [combat, run, checkEnemiesDead]);

  const executeEnemyIntent = useCallback((enemy: EnemyInstance) => {
    const intent = enemy.currentIntent;
    const def = ENEMIES[enemy.defId];

    switch (intent.type) {
      case 'attack': {
        let dmg = intent.damage;
        // Check enemy weak
        if (enemy.statusEffects.some((s) => s.status === 'weak')) {
          dmg = Math.floor(dmg * 0.75);
        }
        const actual = combat.takeDamage(dmg);
        run.takeDamage(actual);
        combat.addLog(`${def?.name || 'Enemy'} attacks for ${dmg}`);
        break;
      }
      case 'attackDebuff': {
        let dmg = intent.damage;
        if (enemy.statusEffects.some((s) => s.status === 'weak')) {
          dmg = Math.floor(dmg * 0.75);
        }
        const actual = combat.takeDamage(dmg);
        run.takeDamage(actual);
        combat.addPlayerStatus({ status: intent.status, stacks: intent.stacks });
        combat.addLog(`${def?.name} attacks for ${dmg} and applies ${intent.status}`);
        break;
      }
      case 'defend': {
        combat.updateEnemy(enemy.id, { firewall: enemy.firewall + intent.firewall });
        combat.addLog(`${def?.name} gains ${intent.firewall} Firewall`);
        break;
      }
      case 'buff': {
        // Ghost Endpoint intangible
        if (enemy.defId === 'ghostEndpoint') {
          combat.addEnemyStatus(enemy.id, { status: 'intangible', stacks: 1 });
        }
        combat.addLog(`${def?.name} buffs itself`);
        break;
      }
      case 'debuff': {
        combat.addPlayerStatus({ status: intent.status, stacks: intent.stacks });
        combat.addLog(`${def?.name} applies ${intent.stacks} ${intent.status}`);
        break;
      }
      default:
        break;
    }
  }, [combat, run]);

  if (!combat.active) return null;

  const isTargeting = combat.targetingCardIndex !== null;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: 'linear-gradient(180deg, #1e1b4b 0%, #0f0f23 100%)',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'monospace',
        color: '#e0e0e0',
        border: '2px solid #333',
        borderRadius: 4,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Top: Act/Turn info */}
      <div style={{ padding: '6px 16px', fontSize: 11, color: '#6b7280', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #2d2d5e' }}>
        <span>Act {run.act} | Turn {combat.turn}</span>
        <span>{combat.log[combat.log.length - 1] || ''}</span>
      </div>

      {/* Enemy area */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 24,
          padding: '16px',
        }}
        onClick={() => isTargeting && combat.setTargeting(null)}
      >
        {combat.enemies.map((enemy) => (
          <EnemyDisplay
            key={enemy.id}
            enemy={enemy}
            targeting={isTargeting}
            onClick={handleTargetEnemy}
          />
        ))}
      </div>

      {/* Player status bar */}
      <PlayerStatus
        integrity={run.currentIntegrity}
        maxIntegrity={run.maxIntegrity}
        firewall={combat.playerFirewall}
        energy={combat.energy}
        maxEnergy={combat.maxEnergy}
        statusEffects={combat.playerStatus}
        drawPileCount={combat.drawPile.length}
        discardPileCount={combat.discardPile.length}
        exhaustPileCount={combat.exhaustPile.length}
      />

      {/* Hand area */}
      <div style={{ borderTop: '2px solid #2d2d5e', background: 'rgba(15, 15, 35, 0.8)', padding: '8px 0' }}>
        {combat.phase === 'playerTurn' && (
          <HandDisplay
            hand={combat.hand}
            energy={combat.energy}
            selectedIndex={combat.targetingCardIndex ?? combat.selectedCardIndex}
            onSelectCard={handleSelectCard}
          />
        )}

        {combat.phase === 'enemyTurn' && (
          <div style={{ textAlign: 'center', padding: 20, color: '#6b7280', fontSize: 14 }}>
            Enemy turn...
          </div>
        )}

        {combat.phase === 'reward' && (
          <div style={{ textAlign: 'center', padding: 20 }}>
            <div style={{ fontSize: 18, fontWeight: 'bold', color: COLORS.hp, marginBottom: 8 }}>
              Victory!
            </div>
            <div style={{ fontSize: 13, color: '#9ca3af', marginBottom: 12 }}>
              +{combat.goldReward} Gold
            </div>
            <button
              onClick={() => {
                run.addGold(combat.goldReward);
                combat.endCombat();
                run.setScreen('map');
              }}
              style={btnStyle}
            >
              Continue
            </button>
          </div>
        )}
      </div>

      {/* End Turn button */}
      {combat.phase === 'playerTurn' && (
        <button
          onClick={handleEndTurn}
          style={{
            position: 'absolute',
            right: 16,
            bottom: 230,
            padding: '10px 20px',
            background: 'rgba(123, 104, 238, 0.3)',
            border: '2px solid #7b68ee',
            borderRadius: 8,
            color: '#e0e0e0',
            fontFamily: 'monospace',
            fontWeight: 'bold',
            fontSize: 13,
            cursor: 'pointer',
            letterSpacing: 1,
          }}
        >
          END TURN
        </button>
      )}

      {/* Targeting overlay hint */}
      {isTargeting && (
        <div style={{
          position: 'absolute', top: 40, left: '50%', transform: 'translateX(-50%)',
          padding: '4px 12px', background: 'rgba(123, 104, 238, 0.8)', borderRadius: 4,
          fontSize: 12, color: '#fff', fontWeight: 'bold',
        }}>
          Click an enemy to target | Right-click to cancel
        </div>
      )}
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  padding: '10px 32px',
  background: 'rgba(123, 104, 238, 0.2)',
  border: '2px solid #7b68ee',
  borderRadius: 8,
  color: '#e0e0e0',
  fontFamily: 'monospace',
  fontWeight: 'bold',
  fontSize: 14,
  cursor: 'pointer',
};
