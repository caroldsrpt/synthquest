import { useCallback, useEffect, useRef, useState } from 'react';
import { useCombatStore } from '../../stores/combatStore';
import { useRunStore } from '../../stores/runStore';
import { CARDS } from '../../game/data/cards';
import { getNextIntent, ENEMIES } from '../../game/data/enemies';
import { getCardCost, getCardEffects, getCardName, createCardInstance } from '../../utils/cardUtils';
import { resolveCardEffects, type EffectAnimations } from '../../game/systems/effectResolver';
import { executeEnemyIntent as execEnemyIntent, processHallucinationCards, tickEnemyDebuffs, type EnemyAnimations } from '../../game/systems/enemyAI';
import { HandDisplay } from '../combat/HandDisplay';
import { EnemyDisplay } from '../combat/EnemyDisplay';
import { PlayerStatus } from '../combat/PlayerStatus';
import { CARD_TIPS } from '../../game/data/cardTips';
import { RewardOverlay } from '../combat/RewardOverlay';
import { DeckViewerOverlay } from '../shared/DeckViewerOverlay';
import { RelicBar } from '../shared/RelicBar';
import { PotionSlots } from '../combat/PotionSlots';
import { SkillCheckOverlay } from '../combat/SkillCheckOverlay';
import { ByteSpeechBubble } from '../combat/ByteSpeechBubble';
import { CARD_SKILL_CHECKS } from '../../game/data/skillChecks';
import type { SkillCheckType } from '../../game/data/skillChecks';
import { POTIONS, generatePotionDrop } from '../../game/data/potions';
import { POTION_DROP_RATE_NORMAL, POTION_DROP_RATE_ELITE, POTION_DROP_RATE_BOSS } from '../../utils/constants';
import { uid } from '../../utils/random';
import type { CardInstance } from '../../game/data/types';

export function CombatScreen() {
  const combat = useCombatStore();
  const run = useRunStore();
  const [message, setMessage] = useState<string | null>(null);
  type BytePose = 'idle' | 'attack' | 'hurt' | 'defend' | 'debuffed';
  const [bytePose, setBytePose] = useState<BytePose>('idle');
  const [enemyHit, setEnemyHit] = useState<string | null>(null);
  const [floats, setFloats] = useState<{ target: 'player' | string; text: string; color: string; id: number }[]>([]);
  const floatIdRef = useRef(0);

  // First-draw card tip system
  const [activeTip, setActiveTip] = useState<string | null>(null);
  const [showDeck, setShowDeck] = useState(false);
  const [pendingSkillCheck, setPendingSkillCheck] = useState<{
    checkType: SkillCheckType;
    handIndex: number;
    targetEnemyId?: string;
  } | null>(null);
  const tipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Check for first-draw tips whenever hand changes during playerTurn
  useEffect(() => {
    if (combat.phase !== 'playerTurn' || combat.hand.length === 0) return;
    const shownTips = useRunStore.getState().shownCardTips;
    for (const card of combat.hand) {
      const tip = CARD_TIPS[card.defId];
      if (tip && !shownTips.includes(card.defId)) {
        setActiveTip(tip);
        run.markCardTipShown(card.defId);
        // Auto-dismiss after 4 seconds
        if (tipTimerRef.current) clearTimeout(tipTimerRef.current);
        tipTimerRef.current = setTimeout(() => setActiveTip(null), 4000);
        break; // Only show one tip at a time
      }
    }
  }, [combat.phase, combat.hand]);

  // Cleanup tip timer on unmount
  useEffect(() => {
    return () => {
      if (tipTimerRef.current) clearTimeout(tipTimerRef.current);
    };
  }, []);

  const dismissTip = useCallback(() => {
    setActiveTip(null);
    if (tipTimerRef.current) {
      clearTimeout(tipTimerRef.current);
      tipTimerRef.current = null;
    }
  }, []);

  const addFloat = (target: 'player' | string, text: string, color: string) => {
    floatIdRef.current++;
    const f = { target, text, color, id: floatIdRef.current };
    setFloats((prev) => [...prev, f]);
    setTimeout(() => setFloats((prev) => prev.filter((x) => x.id !== f.id)), 900);
  };

  const showPlayerHit = (dmg: number) => {
    setBytePose('hurt');
    addFloat('player', `-${dmg}`, '#ef4444');
    setTimeout(() => setBytePose('idle'), 600);
  };

  const showPlayerDebuffed = (name: string) => {
    setBytePose('debuffed');
    addFloat('player', `+${name}`, '#a78bfa');
    setTimeout(() => setBytePose('idle'), 600);
  };

  const showPlayerDefend = (amount: number) => {
    setBytePose('defend');
    addFloat('player', `+${amount} FW`, '#60a5fa');
    setTimeout(() => setBytePose('idle'), 600);
  };

  const showEnemyHit = (enemyId: string, dmg: number) => {
    setEnemyHit(enemyId);
    addFloat(enemyId, `-${dmg}`, '#ef4444');
    setTimeout(() => setEnemyHit(null), 400);
  };

  const showPlayerAttack = () => {
    setBytePose('attack');
    setTimeout(() => setBytePose('idle'), 400);
  };

  const BYTE_SPRITES: Record<BytePose, string> = {
    idle: '/sprites/byte.png',
    attack: '/sprites/byte-attack.png',
    hurt: '/sprites/byte-hurt.png',
    defend: '/sprites/byte-defend.png',
    debuffed: '/sprites/byte-hurt.png',
  };

  // Use "Glitch" before S3 teaches hallucination, "Hallucination" after
  const hasLearnedHallucination = run.completedScenarios?.includes('s3_hallucination') ?? false;
  const curseName = hasLearnedHallucination ? 'Hallucination' : 'Glitch';
  const curseDesc = hasLearnedHallucination
    ? 'Deals 3 damage when in hand at end of turn'
    : 'Corrupts your hand — deals 3 damage at end of turn';

  // Apply relic effects at start of turn
  const applyRelicTurnStart = useCallback(() => {
    const r = useRunStore.getState();
    const c = useCombatStore.getState();
    // apiKey: add API Call card to hand on turn 1
    if (r.relics.includes('apiKey') && c.turn === 1) {
      const inst = createCardInstance('apiCall');
      inst.costOverride = 0;
      useCombatStore.getState().addToHand(inst);
    }
    // rubberDuck: +1 Context each turn
    if (r.relics.includes('rubberDuck')) {
      useCombatStore.getState().addPlayerStatus({ status: 'context', stacks: 1 });
    }
    // safetyFilter: +2 Grounded on turn 1
    if (r.relics.includes('safetyFilter') && c.turn === 1) {
      useCombatStore.getState().addPlayerStatus({ status: 'grounded', stacks: 2 });
    }
  }, []);

  // Use a potion (free action, no energy cost)
  const handleUsePotion = useCallback((potionId: string) => {
    if (combat.phase !== 'playerTurn') return;
    const potion = run.potions.find((p) => p.id === potionId);
    if (!potion) return;
    const def = POTIONS[potion.defId];
    if (!def) return;

    // Resolve potion effect
    switch (potion.defId) {
      case 'warmCocoa':
        run.heal(15);
        addFloat('player', '+15 HP', '#4ade80');
        break;
      case 'espressoShot':
        combat.drawCards(3);
        break;
      case 'sourdoughStarter':
        combat.gainFirewall(10);
        showPlayerDefend(10);
        break;
      case 'pepperFlakes': {
        const target = useCombatStore.getState().enemies.find((e) => e.hp > 0);
        if (target) combat.addEnemyStatus(target.id, { status: 'vulnerable', stacks: 3 });
        break;
      }
      case 'staleBread': {
        const target = useCombatStore.getState().enemies.find((e) => e.hp > 0);
        if (target) combat.addEnemyStatus(target.id, { status: 'weak', stacks: 2 });
        break;
      }
      case 'doubleShotLatte':
        combat.gainEnergy(2);
        break;
      case 'flashFrozenDough':
        // Halve enemy damage handled via a temporary status — use weak as approximation
        for (const e of useCombatStore.getState().enemies) {
          if (e.hp > 0) combat.addEnemyStatus(e.id, { status: 'weak', stacks: 2 });
        }
        break;
      case 'mysteryMacaron': {
        const pool = Object.values(CARDS).filter((c) => c.rarity === 'uncommon');
        for (let i = 0; i < 2; i++) {
          if (pool.length === 0) break;
          const chosen = pool[Math.floor(Math.random() * pool.length)];
          const inst = createCardInstance(chosen.id);
          inst.costOverride = 0;
          combat.addToHand(inst);
        }
        break;
      }
      case 'goldenCroissant':
        // Simplified: gain 3 stacks of context (amplifies next 3 effects)
        combat.addPlayerStatus({ status: 'context', stacks: 3 });
        break;
      case 'secretRecipe': {
        const runState = useRunStore.getState();
        const nonUpgraded = runState.deck.filter((c) => !c.upgraded && CARDS[c.defId]?.rarity !== 'starter');
        if (nonUpgraded.length > 0) {
          const pick = nonUpgraded[Math.floor(Math.random() * nonUpgraded.length)];
          runState.upgradeCardInDeck(pick.id);
        }
        break;
      }
    }

    combat.addLog(`Used ${def.name}`);
    run.removePotion(potionId);
  }, [combat, run]);

  // Handle skill check completion — resolve the pending card with multiplier
  const handleSkillCheckResult = useCallback((multiplier: number) => {
    if (!pendingSkillCheck) return;
    const { handIndex, targetEnemyId } = pendingSkillCheck;
    const card = combat.hand[handIndex];
    if (!card) { setPendingSkillCheck(null); return; }
    const def = CARDS[card.defId];
    if (!def) { setPendingSkillCheck(null); return; }

    const effects = getCardEffects(card);
    const name = getCardName(card);
    combat.addLog(`Played ${name} (${Math.round(multiplier * 100)}% power)`);
    combat.trackCardPlayed(card.defId, def.category);

    // Apply multiplier to damage/block effects
    const scaledEffects = effects.map((e) => {
      if (e.type === 'damage') return { ...e, amount: Math.floor(e.amount * multiplier) };
      if (e.type === 'damageAll') return { ...e, amount: Math.floor(e.amount * multiplier) };
      if (e.type === 'firewall') return { ...e, amount: Math.floor(e.amount * multiplier) };
      return e;
    });

    const anim: EffectAnimations = { showPlayerAttack, showPlayerDefend, showEnemyHit, addFloat };
    resolveCardEffects(scaledEffects, card, anim, targetEnemyId);

    // Continue with normal post-play flow
    const isAttackCard = effects.some((e) =>
      e.type === 'damage' || e.type === 'damageRandom' || e.type === 'damageAll'
      || e.type === 'conditionalDamage' || e.type === 'damagePerExhaust'
    );
    if (isAttackCard) {
      const splashState = useCombatStore.getState();
      for (const power of splashState.activePowers) {
        if (power.type === 'attackSplash' && power.amount) {
          for (const enemy of splashState.enemies) {
            if (enemy.hp > 0 && enemy.id !== targetEnemyId) {
              combat.damageEnemy(enemy.id, power.amount);
              showEnemyHit(enemy.id, power.amount);
            }
          }
        }
      }
    }

    combat.playCard(handIndex, targetEnemyId);
    if (def.keywords?.includes('exhaust') || def.keywords?.includes('power')) {
      useCombatStore.setState((s) => ({ exhaustPile: [...s.exhaustPile, card] }));
    } else {
      combat.addToDiscard(card);
    }

    // Relic: orchestrationHub
    if (useRunStore.getState().relics.includes('orchestrationHub')) {
      const cats = useCombatStore.getState().categoryCountThisTurn;
      const uniqueCats = Object.values(cats).filter((c) => c > 0).length;
      if (uniqueCats >= 3) {
        for (const e of useCombatStore.getState().enemies) {
          if (e.hp > 0) { useCombatStore.getState().damageEnemy(e.id, 5); showEnemyHit(e.id, 5); }
        }
      }
    }

    const state = useCombatStore.getState();
    if (state.enemies.every((e) => e.hp <= 0)) {
      setMessage('Victory!');
      combat.setPhase('reward');
    }

    setPendingSkillCheck(null);
  }, [combat, pendingSkillCheck]);

  // Auto-start first turn
  useEffect(() => {
    if (combat.active && combat.phase === 'start') {
      setMessage(combat.enemies.length > 0
        ? `${ENEMIES[combat.enemies[0].defId]?.name || 'Enemy'} appeared!`
        : 'Combat started!');
      const timer = setTimeout(() => {
        combat.startTurn();
        applyRelicTurnStart();
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
    // Curse cards can't be played
    if (def.category === 'curse') return;

    // firstCardFree power: first card played each turn costs 0
    const state = useCombatStore.getState();
    const hasFirstCardFree = state.activePowers.some((p) => p.type === 'firstCardFree');
    const isFirstCard = state.cardsPlayedThisTurn.length === 0;
    const cost = (hasFirstCardFree && isFirstCard) ? 0 : getCardCost(card);
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

    // firstCardFree power: first card played each turn costs 0
    const prePlayState = useCombatStore.getState();
    const hasFirstCardFree = prePlayState.activePowers.some((p) => p.type === 'firstCardFree');
    const isFirstCard = prePlayState.cardsPlayedThisTurn.length === 0;
    const cost = (hasFirstCardFree && isFirstCard) ? 0 : getCardCost(card);
    if (!combat.spendEnergy(cost)) return;

    // Check for skill check before resolving
    const checkType = CARD_SKILL_CHECKS[card.defId];
    if (checkType && !pendingSkillCheck) {
      // Show skill check overlay — will resolve effects on completion
      setPendingSkillCheck({ checkType, handIndex, targetEnemyId });
      // Energy already spent, but don't resolve yet
      return;
    }

    const effects = getCardEffects(card);
    const name = getCardName(card);
    combat.addLog(`Played ${name}`);
    combat.trackCardPlayed(card.defId, def.category);

    // Resolve effects (apply skill check multiplier if active)
    const anim: EffectAnimations = { showPlayerAttack, showPlayerDefend, showEnemyHit, addFloat };
    resolveCardEffects(effects, card, anim, targetEnemyId);

    // attackSplash power: when playing an attack card, deal X damage to all OTHER enemies
    const isAttackCard = effects.some((e) =>
      e.type === 'damage' || e.type === 'damageRandom' || e.type === 'damageAll'
      || e.type === 'conditionalDamage' || e.type === 'damagePerExhaust'
    );
    if (isAttackCard) {
      const splashState = useCombatStore.getState();
      for (const power of splashState.activePowers) {
        if (power.type === 'attackSplash' && power.amount) {
          for (const enemy of splashState.enemies) {
            if (enemy.hp > 0 && enemy.id !== targetEnemyId) {
              combat.damageEnemy(enemy.id, power.amount);
              showEnemyHit(enemy.id, power.amount);
            }
          }
        }
      }
    }

    // Remove from hand
    combat.playCard(handIndex, targetEnemyId);

    // Handle exhaust vs discard (power cards always exhaust)
    if (def.keywords?.includes('exhaust') || def.keywords?.includes('power')) {
      useCombatStore.setState((s) => ({
        exhaustPile: [...s.exhaustPile, card],
      }));
    } else {
      combat.addToDiscard(card);
    }

    // Relic: orchestrationHub — 3+ different categories this turn = 5 AoE damage
    if (useRunStore.getState().relics.includes('orchestrationHub')) {
      const cats = useCombatStore.getState().categoryCountThisTurn;
      const uniqueCats = Object.values(cats).filter((c) => c > 0).length;
      if (uniqueCats >= 3) {
        for (const e of useCombatStore.getState().enemies) {
          if (e.hp > 0) {
            useCombatStore.getState().damageEnemy(e.id, 5);
            showEnemyHit(e.id, 5);
          }
        }
        combat.addLog('Orchestration Hub triggers! 5 damage to all enemies.');
      }
    }

    // Check if all enemies dead
    const state = useCombatStore.getState();
    if (state.enemies.every((e) => e.hp <= 0)) {
      setMessage('Victory!');
      combat.setPhase('reward');
    }
  }, [combat]);

  const handleEndTurn = useCallback(async () => {
    if (combat.phase !== 'playerTurn') return;

    // Hallucination curse cards deal damage BEFORE discarding hand
    processHallucinationCards(showPlayerHit);

    // NOW discard hand (keep retain cards)
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

    // Tick player debuffs
    for (const status of ['vulnerable', 'weak', 'confused', 'overfit'] as const) {
      combat.removePlayerStatus(status, 1);
    }
    // Relic: rateLimiter — remove 1 Throttled stack at end of turn
    if (useRunStore.getState().relics.includes('rateLimiter')) {
      combat.removePlayerStatus('throttled', 1);
    }

    if (useRunStore.getState().currentIntegrity <= 0) {
      combat.endCombat();
      return;
    }

    // Enemy phase
    combat.setPhase('enemyTurn');
    setMessage('Enemy turn...');

    await new Promise((r) => setTimeout(r, 800));

    // Execute enemy intents
    const enemyAnim: EnemyAnimations = { setMessage, setEnemyHit, showPlayerHit, showPlayerDebuffed, addFloat };
    for (const enemy of useCombatStore.getState().enemies.filter((e) => e.hp > 0)) {
      const intent = enemy.currentIntent;
      execEnemyIntent(enemy, enemyAnim, curseName, curseDesc);
      // Debuffs and attackDebuffs need more reading time
      const isDebuff = intent.type === 'debuff' || intent.type === 'attackDebuff';
      await new Promise((r) => setTimeout(r, isDebuff ? 2500 : 1200));
    }

    // Advance enemy intents
    for (const enemy of useCombatStore.getState().enemies.filter((e) => e.hp > 0)) {
      const nextIntent = getNextIntent({ ...enemy, turnCounter: enemy.turnCounter + 1 });
      combat.updateEnemy(enemy.id, {
        currentIntent: nextIntent,
        turnCounter: enemy.turnCounter + 1,
      });
    }

    // Relic: webhook — if any enemy intends to buff, gain 5 Firewall
    if (useRunStore.getState().relics.includes('webhook')) {
      const nextEnemies = useCombatStore.getState().enemies.filter((e) => e.hp > 0);
      if (nextEnemies.some((e) => e.currentIntent.type === 'buff')) {
        useCombatStore.getState().gainFirewall(5);
        showPlayerDefend(5);
        combat.addLog('Webhook triggers! +5 Firewall (enemy buffing).');
      }
    }

    // Tick enemy debuffs
    tickEnemyDebuffs();

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
    applyRelicTurnStart();
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ color: '#c4b89a' }}>Act {run.act} | Turn {combat.turn}</span>
          <RelicBar relicIds={run.relics} />
        </div>
        <span style={{ color: '#8a7a66', fontSize: 11 }}>{combat.log[combat.log.length - 1] || ''}</span>
        <button
          onClick={() => setShowDeck(true)}
          title="View your deck"
          style={{
            padding: '4px 12px',
            background: 'rgba(12, 8, 24, 0.8)',
            border: '2px solid #6b4fa0',
            color: '#c4b89a',
            fontFamily: "'Press Start 2P', monospace",
            fontSize: 8,
            cursor: 'pointer',
            letterSpacing: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <span style={{ fontSize: 12 }}>🃏</span> DECK ({run.deck.length})
        </button>
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
            src={BYTE_SPRITES[bytePose]}
            alt="Byte"
            style={{
              width: 320,
              height: 320,
              imageRendering: 'pixelated',
              animation: bytePose === 'hurt'
                ? 'playerShake 0.4s ease-in-out'
                : bytePose === 'attack'
                ? 'playerLunge 0.3s ease-in-out'
                : bytePose === 'defend'
                ? 'playerDefendPulse 0.5s ease-in-out'
                : bytePose === 'debuffed'
                ? 'playerDebuff 0.5s ease-in-out'
                : 'byteIdle 3s ease-in-out infinite',
              filter: bytePose === 'hurt' ? 'brightness(1.5) saturate(0.5)' : 'none',
              transition: 'filter 0.15s',
            }}
          />
          <ByteSpeechBubble />
          {/* Floating text on player */}
          {floats.filter((f) => f.target === 'player').map((f) => (
            <div key={f.id} style={{
              position: 'absolute',
              top: '25%',
              left: '50%',
              transform: 'translateX(-50%)',
              fontFamily: "'Press Start 2P', monospace",
              fontSize: 20,
              color: f.color,
              textShadow: '-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000',
              animation: 'dmgFloat 0.8s ease-out forwards',
              pointerEvents: 'none',
              zIndex: 20,
              whiteSpace: 'nowrap',
            }}>
              {f.text}
            </div>
          ))}
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
              isHit={enemyHit === enemy.id}
              floats={floats.filter((f) => f.target === enemy.id)}
              hallucinationLabel={curseName}
            />
          ))}
        </div>

        {/* Center message overlay */}
        {message && (
          <div style={{
            position: 'absolute', top: '40%', left: '50%',
            transform: 'translate(-50%, -50%)',
            padding: '16px 32px',
            maxWidth: '70%',
            background: 'rgba(12, 8, 24, 0.92)',
            border: '3px solid #6b4fa0',
            boxShadow: 'inset 0 0 0 2px #1a1130, inset 0 0 0 4px #3d2d5c, 0 0 20px rgba(0,0,0,0.5)',
            fontFamily: "'Press Start 2P', monospace",
            fontSize: 13, fontWeight: 'bold', color: '#e0e0e0',
            textAlign: 'center',
            lineHeight: 1.6,
            pointerEvents: 'none', zIndex: 20,
            textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000',
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
        activePowers={combat.activePowers}
      />

      {/* Potion slots */}
      <div style={{ position: 'absolute', right: 20, top: 56, zIndex: 10 }}>
        <PotionSlots
          potions={run.potions}
          maxSlots={run.maxPotionSlots}
          canUse={combat.phase === 'playerTurn'}
          onUse={handleUsePotion}
          onDiscard={(id) => run.removePotion(id)}
        />
      </div>

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

        {combat.phase === 'reward' && null}
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

      {/* Victory overlay — center screen */}
      {combat.phase === 'reward' && (
        <RewardOverlay
          goldReward={combat.goldReward}
          cardRewards={combat.cardRewards}
          onFinish={() => {
            run.addGold(combat.goldReward);
            const runState = useRunStore.getState();
            const currentNode = runState.map.flat().find((n) => n.id === runState.currentNodeId);
            // Potion drop
            const dropRate = currentNode?.type === 'boss' ? POTION_DROP_RATE_BOSS
              : currentNode?.type === 'elite' ? POTION_DROP_RATE_ELITE
              : POTION_DROP_RATE_NORMAL;
            if (Math.random() < dropRate) {
              const potionDef = generatePotionDrop();
              if (potionDef) {
                runState.addPotion({ id: uid(), defId: potionDef.id });
              }
            }
            combat.endCombat();
            if (currentNode?.type === 'boss' && runState.act < 3) {
              runState.advanceAct();
            } else if (currentNode?.type === 'boss' && runState.act >= 3) {
              runState.setScreen('victory');
            } else {
              run.setScreen('map');
            }
          }}
          onPickCard={(defId) => {
            const inst = createCardInstance(defId);
            run.addCardToDeck(inst);
          }}
          relicReward={combat.relicReward}
          onPickRelic={(relicId) => {
            run.addRelic(relicId);
          }}
        />
      )}

      {/* First-draw card tip tooltip */}
      {activeTip && (
        <div
          onClick={dismissTip}
          style={{
            position: 'absolute',
            bottom: showHand ? 250 : 100,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 40,
            background: 'rgba(12, 8, 24, 0.95)',
            border: '3px solid #6b4fa0',
            boxShadow:
              'inset 0 0 0 2px #1a1130, inset 0 0 0 4px #3d2d5c, 0 0 30px rgba(107,79,160,0.5)',
            padding: '16px 24px 12px',
            maxWidth: 480,
            textAlign: 'center',
            cursor: 'pointer',
            animation: 'tipFadeIn 0.3s ease-out',
          }}
        >
          <div
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: 11,
              color: '#a882ff',
              marginBottom: 8,
              letterSpacing: 1,
            }}
          >
            {activeTip.split(':')[0]}
          </div>
          <div
            style={{
              fontFamily: 'monospace',
              fontSize: 13,
              color: '#c4b89a',
              lineHeight: 1.5,
              marginBottom: 10,
            }}
          >
            {activeTip.includes(':') ? activeTip.slice(activeTip.indexOf(':') + 1).trim() : activeTip}
          </div>
          <div
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: 7,
              color: '#6b7280',
              letterSpacing: 1,
            }}
          >
            CLICK TO DISMISS
          </div>
        </div>
      )}

      {showDeck && (
        <DeckViewerOverlay
          cards={run.deck}
          title="Your Deck"
          onClose={() => setShowDeck(false)}
        />
      )}

      {/* Skill check overlay */}
      {pendingSkillCheck && (
        <SkillCheckOverlay
          checkType={pendingSkillCheck.checkType}
          onResult={handleSkillCheckResult}
        />
      )}

      <style>{`
        @keyframes tipFadeIn {
          0% { opacity: 0; transform: translateX(-50%) translateY(10px); }
          100% { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes byteIdle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        @keyframes playerShake {
          0%, 100% { transform: translateX(0); }
          15% { transform: translateX(-12px); }
          30% { transform: translateX(10px); }
          45% { transform: translateX(-8px); }
          60% { transform: translateX(6px); }
          75% { transform: translateX(-3px); }
        }
        @keyframes playerLunge {
          0%, 100% { transform: translateX(0); }
          40% { transform: translateX(40px); }
        }
        @keyframes dmgFloat {
          0% { opacity: 1; transform: translateX(-50%) translateY(0); }
          100% { opacity: 0; transform: translateX(-50%) translateY(-40px); }
        }
        @keyframes playerDefendPulse {
          0% { transform: scale(1); filter: brightness(1); }
          30% { transform: scale(1.05); filter: brightness(1.3) drop-shadow(0 0 20px #60a5fa); }
          100% { transform: scale(1); filter: brightness(1); }
        }
        @keyframes playerDebuff {
          0% { filter: brightness(1); }
          25% { filter: brightness(0.6) hue-rotate(60deg); }
          50% { filter: brightness(1.2) hue-rotate(30deg); }
          100% { filter: brightness(1) hue-rotate(0deg); }
        }
      `}</style>
    </div>
  );
}

