import { useCallback, useEffect, useState } from 'react';
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
  const [message, setMessage] = useState<string | null>(null);

  // Auto-start first turn
  useEffect(() => {
    if (combat.active && combat.phase === 'start') {
      setMessage(combat.enemies.length > 0
        ? `${ENEMIES[combat.enemies[0].defId]?.name || 'Enemy'} appeared!`
        : 'Combat started!');
      const timer = setTimeout(() => {
        combat.startTurn();
        setMessage(null);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [combat.active, combat.phase]);

  const handleSelectCard = useCallback((index: number) => {
    if (combat.phase !== 'playerTurn') return;
    const card = combat.hand[index];
    if (!card) return;
    const def = CARDS[card.defId];
    if (!def) return;
    const cost = getCardCost(card);
    if (cost > combat.energy) return;

    if (def.target === 'singleEnemy') {
      combat.setTargeting(index);
    } else {
      playCard(index);
    }
  }, [combat.phase, combat.hand, combat.energy]);

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
    combat.trackCardPlayed(card.defId, def.category);

    // Resolve effects
    for (const effect of effects) {
      resolveEffect(effect, card, targetEnemyId);
    }

    // Remove from hand
    combat.playCard(handIndex, targetEnemyId);

    // Handle exhaust vs discard
    if (def.keywords?.includes('exhaust')) {
      useCombatStore.setState((s) => ({
        exhaustPile: [...s.exhaustPile, card],
      }));
    } else {
      combat.addToDiscard(card);
    }

    // Check if all enemies dead
    const state = useCombatStore.getState();
    if (state.enemies.every((e) => e.hp <= 0)) {
      setMessage('Victory!');
      combat.setPhase('reward');
    }
  }, [combat]);

  const resolveEffect = useCallback((effect: CardEffect, card: CardInstance, targetEnemyId?: string) => {
    const state = useCombatStore.getState();
    const contextBonus = state.playerStatus.find((s) => s.status === 'context')?.stacks || 0;
    let consumeContext = false;

    switch (effect.type) {
      case 'damage': {
        const target = targetEnemyId || state.enemies.find((e) => e.hp > 0)?.id;
        if (!target) break;
        let dmg = effect.amount + contextBonus;
        consumeContext = true;
        const enemy = state.enemies.find((e) => e.id === target);
        if (enemy?.statusEffects.some((s) => s.status === 'vulnerable')) dmg = Math.floor(dmg * 1.5);
        if (state.playerStatus.some((s) => s.status === 'weak')) dmg = Math.floor(dmg * 0.75);
        const times = effect.times || 1;
        for (let i = 0; i < times; i++) combat.damageEnemy(target, dmg);
        break;
      }
      case 'damageRandom': {
        const target = targetEnemyId || state.enemies.find((e) => e.hp > 0)?.id;
        if (!target) break;
        const dmg = randInt(effect.min, effect.max) + contextBonus;
        consumeContext = true;
        combat.damageEnemy(target, dmg);
        break;
      }
      case 'damageAll': {
        let dmg = effect.amount + contextBonus;
        consumeContext = true;
        if (state.playerStatus.some((s) => s.status === 'weak')) dmg = Math.floor(dmg * 0.75);
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
      case 'firewall':
        combat.gainFirewall(effect.amount + contextBonus);
        consumeContext = true;
        break;
      case 'firewallFromMissingHp': {
        const missing = run.maxIntegrity - run.currentIntegrity;
        combat.gainFirewall(missing + contextBonus);
        consumeContext = true;
        break;
      }
      case 'draw':
        combat.drawCards(effect.amount);
        break;
      case 'gainContext': {
        const current = state.playerStatus.find((s) => s.status === 'context')?.stacks || 0;
        if (card.defId === 'benchmark' && effect.amount === 0) {
          const toAdd = Math.min(CONTEXT_CAP, current * 2) - current;
          if (toAdd > 0) combat.addPlayerStatus({ status: 'context', stacks: toAdd });
        } else {
          const toAdd = Math.min(effect.amount, CONTEXT_CAP - current);
          if (toAdd > 0) combat.addPlayerStatus({ status: 'context', stacks: toAdd });
        }
        break;
      }
      case 'gainGrounded':
        combat.addPlayerStatus({ status: 'grounded', stacks: effect.amount });
        break;
      case 'applyStatus':
        if (effect.target === 'self') {
          combat.addPlayerStatus({ status: effect.status, stacks: effect.stacks });
        } else if (targetEnemyId) {
          combat.addEnemyStatus(targetEnemyId, { status: effect.status, stacks: effect.stacks });
        }
        break;
      case 'removeStatus':
        if (effect.status === 'all') combat.clearAllPlayerStatus();
        else combat.removePlayerStatus(effect.status, 999);
        break;
      case 'conditionalDamage': {
        const target = targetEnemyId || state.enemies.find((e) => e.hp > 0)?.id;
        if (!target) break;
        const enemy = state.enemies.find((e) => e.id === target);
        if (enemy && enemy.hp > enemy.maxHp * 0.5) combat.damageEnemy(target, effect.amount);
        break;
      }
      case 'addRandomCards': {
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
    }

    if (consumeContext && contextBonus > 0) {
      combat.removePlayerStatus('context', 999);
    }
  }, [combat, run]);

  const handleEndTurn = useCallback(async () => {
    if (combat.phase !== 'playerTurn') return;

    // Discard hand (keep retain cards)
    const retained: CardInstance[] = [];
    const discarded: CardInstance[] = [];
    for (const card of useCombatStore.getState().hand) {
      const def = CARDS[card.defId];
      if (def?.keywords?.includes('retain')) retained.push(card);
      else discarded.push(card);
    }
    useCombatStore.setState((s) => ({
      hand: retained,
      discardPile: [...s.discardPile, ...discarded],
    }));

    // Hallucination self-damage
    const halStacks = useCombatStore.getState().playerStatus.find((s) => s.status === 'hallucination')?.stacks || 0;
    for (let i = 0; i < halStacks; i++) {
      if (Math.random() < HALLUCINATION_TRIGGER_CHANCE) {
        const grounded = useCombatStore.getState().playerStatus.find((s) => s.status === 'grounded');
        if (grounded && grounded.stacks > 0) {
          combat.removePlayerStatus('grounded', 1);
          combat.addLog('Grounded absorbed hallucination!');
        } else {
          run.takeDamage(HALLUCINATION_SELF_DAMAGE);
          combat.addLog(`Hallucination dealt ${HALLUCINATION_SELF_DAMAGE} to you!`);
        }
      }
    }

    // Tick player debuffs
    for (const status of ['vulnerable', 'weak', 'confused', 'overfit'] as const) {
      combat.removePlayerStatus(status, 1);
    }

    if (useRunStore.getState().currentIntegrity <= 0) {
      combat.endCombat();
      return;
    }

    // Enemy phase
    combat.setPhase('enemyTurn');
    setMessage('Enemy turn...');

    await new Promise((r) => setTimeout(r, 500));

    // Execute enemy intents
    for (const enemy of useCombatStore.getState().enemies.filter((e) => e.hp > 0)) {
      executeEnemyIntent(enemy);
      await new Promise((r) => setTimeout(r, 300));
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
        if (s && s.stacks > 0) combat.addEnemyStatus(enemy.id, { status, stacks: -1 });
      }
      // Enemy hallucination
      const eHal = enemy.statusEffects.find((s) => s.status === 'hallucination');
      if (eHal) {
        for (let i = 0; i < eHal.stacks; i++) {
          if (Math.random() < HALLUCINATION_TRIGGER_CHANCE) {
            combat.damageEnemy(enemy.id, HALLUCINATION_SELF_DAMAGE);
          }
        }
      }
    }

    // Check all enemies dead
    if (useCombatStore.getState().enemies.every((e) => e.hp <= 0)) {
      setMessage('Victory!');
      combat.setPhase('reward');
      return;
    }

    if (useRunStore.getState().currentIntegrity <= 0) {
      combat.endCombat();
      return;
    }

    // Next player turn
    setMessage(null);
    combat.startTurn();
  }, [combat, run]);

  const executeEnemyIntent = useCallback((enemy: EnemyInstance) => {
    const intent = enemy.currentIntent;
    const def = ENEMIES[enemy.defId];
    const name = def?.name || 'Enemy';

    switch (intent.type) {
      case 'attack': {
        let dmg = intent.damage;
        if (enemy.statusEffects.some((s) => s.status === 'weak')) dmg = Math.floor(dmg * 0.75);
        const actual = combat.takeDamage(dmg);
        run.takeDamage(actual);
        setMessage(`${name} attacks for ${dmg}!`);
        combat.addLog(`${name} attacks for ${dmg}`);
        break;
      }
      case 'attackDebuff': {
        let dmg = intent.damage;
        if (enemy.statusEffects.some((s) => s.status === 'weak')) dmg = Math.floor(dmg * 0.75);
        const actual = combat.takeDamage(dmg);
        run.takeDamage(actual);
        combat.addPlayerStatus({ status: intent.status, stacks: intent.stacks });
        setMessage(`${name} attacks for ${dmg} + ${intent.status}!`);
        combat.addLog(`${name} attacks for ${dmg} + ${intent.status}`);
        break;
      }
      case 'defend':
        combat.updateEnemy(enemy.id, { firewall: enemy.firewall + intent.firewall });
        setMessage(`${name} gains ${intent.firewall} Firewall`);
        combat.addLog(`${name} gains ${intent.firewall} Firewall`);
        break;
      case 'buff':
        if (enemy.defId === 'ghostEndpoint') {
          combat.addEnemyStatus(enemy.id, { status: 'intangible', stacks: 1 });
        }
        setMessage(`${name} buffs itself!`);
        combat.addLog(`${name} buffs itself`);
        break;
      case 'debuff':
        combat.addPlayerStatus({ status: intent.status, stacks: intent.stacks });
        setMessage(`${name} applies ${intent.stacks} ${intent.status}!`);
        combat.addLog(`${name} applies ${intent.status}`);
        break;
    }
  }, [combat, run]);

  if (!combat.active) return null;

  const isTargeting = combat.targetingCardIndex !== null;
  const showHand = combat.phase === 'playerTurn';

  return (
    <div style={{
      width: '100%', height: '100%',
      background: '#08060e',
      display: 'flex', flexDirection: 'column',
      fontFamily: "'Press Start 2P', monospace", color: '#e0e0e0',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Combat background */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'url(/sprites/combat-bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        imageRendering: 'pixelated',
        opacity: 0.35,
      }} />
      {/* Darken bottom for cards readability */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to bottom, transparent 50%, rgba(8,6,14,0.8) 75%, #08060e 100%)',
        pointerEvents: 'none',
      }} />

      {/* Header */}
      <div style={{
        position: 'relative', zIndex: 2,
        padding: '12px 20px', fontSize: 12,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'rgba(12, 8, 24, 0.9)',
        borderBottom: '3px solid #6b4fa0',
        boxShadow: 'inset 0 -2px 0 #3d2d5c',
        letterSpacing: 1,
      }}>
        <span style={{ color: '#c4b89a' }}>Act {run.act} | Turn {combat.turn}</span>
        <span style={{ color: '#8a7a66', fontSize: 11 }}>{combat.log[combat.log.length - 1] || ''}</span>
      </div>

      {/* Battle area: player left, enemies right */}
      <div
        style={{
          flex: 1, display: 'flex', alignItems: 'flex-end',
          justifyContent: 'center',
          padding: '0 0 24px',
          position: 'relative',
        }}
        onClick={() => isTargeting && combat.setTargeting(null)}
      >
        {/* Player character — Byte */}
        <div style={{
          position: 'absolute',
          left: '18%',
          bottom: '10%',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
          zIndex: 2,
        }}>
          <img
            src="/sprites/byte.png"
            alt="Byte"
            style={{
              width: 320,
              height: 320,
              imageRendering: 'pixelated',
              animation: 'byteIdle 3s ease-in-out infinite',
            }}
          />
        </div>

        {/* Enemies */}
        <div style={{
          position: 'absolute',
          right: '12%',
          bottom: '10%',
          display: 'flex', gap: 32, alignItems: 'flex-end',
          zIndex: 2,
        }}>
          {combat.enemies.map((enemy) => (
            <EnemyDisplay
              key={enemy.id}
              enemy={enemy}
              targeting={isTargeting}
              onClick={handleTargetEnemy}
            />
          ))}
        </div>

        {/* Center message overlay */}
        {message && (
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            padding: '10px 24px', background: 'rgba(0,0,0,0.85)',
            border: '1px solid #7b68ee44', borderRadius: 8,
            fontSize: 16, fontWeight: 'bold', color: '#e0e0e0',
            pointerEvents: 'none', zIndex: 20,
          }}>
            {message}
          </div>
        )}
      </div>

      {/* Player status */}
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

      {/* Hand + controls area */}
      <div style={{
        borderTop: '2px solid #2d2d5e',
        background: 'rgba(15, 15, 35, 0.9)',
        padding: '10px 0 8px',
        minHeight: showHand ? 230 : 80,
      }}>
        {showHand && (
          <HandDisplay
            hand={combat.hand}
            energy={combat.energy}
            selectedIndex={combat.targetingCardIndex ?? combat.selectedCardIndex}
            onSelectCard={handleSelectCard}
          />
        )}

        {combat.phase === 'start' && (
          <div style={{ textAlign: 'center', padding: 20, color: '#6b7280', fontSize: 14 }}>
            Preparing battle...
          </div>
        )}

        {combat.phase === 'enemyTurn' && (
          <div style={{ textAlign: 'center', padding: 20, color: '#ef4444', fontSize: 14 }}>
            {'\u2694\uFE0F'} Enemy turn...
          </div>
        )}

        {combat.phase === 'reward' && (
          <div style={{ textAlign: 'center', padding: 16 }}>
            <div style={{ fontSize: 20, fontWeight: 'bold', color: COLORS.hp, marginBottom: 4 }}>
              {'\u2705'} Victory!
            </div>
            <div style={{ fontSize: 13, color: COLORS.gold, marginBottom: 12 }}>
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
              Continue to Map
            </button>
          </div>
        )}
      </div>

      {/* End Turn button */}
      {combat.phase === 'playerTurn' && (
        <button
          onClick={handleEndTurn}
          style={{
            position: 'absolute', right: 20, bottom: 240,
            padding: '12px 24px',
            background: 'rgba(12, 8, 24, 0.85)',
            border: '3px solid #6b4fa0',
            boxShadow: 'inset 0 0 0 2px #1a1130, inset 0 0 0 4px #3d2d5c, 0 0 12px rgba(107,79,160,0.3)',
            color: '#c4b89a', fontFamily: "'Press Start 2P', monospace",
            fontSize: 10, cursor: 'pointer', letterSpacing: 2,
            zIndex: 10,
          }}
        >
          END TURN
        </button>
      )}

      {/* Targeting hint */}
      {isTargeting && (
        <div style={{
          position: 'absolute', top: 50, left: '50%', transform: 'translateX(-50%)',
          padding: '6px 16px',
          background: 'rgba(12, 8, 24, 0.9)',
          border: '2px solid #a882ff',
          fontFamily: "'Press Start 2P', monospace",
          fontSize: 8, color: '#a882ff', fontWeight: 'bold', zIndex: 30,
          letterSpacing: 1,
        }}>
          Click enemy to target | Click elsewhere to cancel
        </div>
      )}

      <style>{`
        @keyframes byteIdle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
      `}</style>
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  padding: '10px 32px', background: 'rgba(12,8,24,0.85)', border: '3px solid #6b4fa0',
  color: '#c4b89a', fontFamily: "'Press Start 2P', monospace",
  fontSize: 10, cursor: 'pointer', letterSpacing: 1,
};
