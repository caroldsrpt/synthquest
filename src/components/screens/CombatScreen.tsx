import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useCombatStore } from '../../stores/combatStore';
import { useRunStore } from '../../stores/runStore';
import { CARDS } from '../../game/data/cards';
import { getNextIntent, ENEMIES } from '../../game/data/enemies';
import { getCardCost, getCardEffects, getCardName, createCardInstance } from '../../utils/cardUtils';
import { HALLUCINATION_TRIGGER_CHANCE, HALLUCINATION_SELF_DAMAGE, CONTEXT_CAP } from '../../utils/constants';
import { randInt } from '../../utils/random';
import { HandDisplay } from '../combat/HandDisplay';
import { EnemyDisplay } from '../combat/EnemyDisplay';
import { PlayerStatus } from '../combat/PlayerStatus';
import { CardComponent } from '../combat/CardComponent';
import { CARD_TIPS } from '../../game/data/cardTips';
import type { CardInstance, CardEffect, EnemyInstance } from '../../game/data/types';

type RewardStep = 'gold' | 'cards' | 'done';

function RewardOverlay({
  goldReward,
  cardRewards,
  onFinish,
  onPickCard,
}: {
  goldReward: number;
  cardRewards: import('../../game/data/types').CardDef[];
  onFinish: () => void;
  onPickCard: (defId: string) => void;
}) {
  const [step, setStep] = useState<RewardStep>('gold');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [pickedIndex, setPickedIndex] = useState<number | null>(null);

  // Create stable CardInstance objects for rendering via CardComponent
  const rewardInstances = useMemo(
    () => cardRewards.map((def) => createCardInstance(def.id)),
    [cardRewards],
  );

  const handlePickCard = (index: number) => {
    if (pickedIndex !== null) return;
    setPickedIndex(index);
    onPickCard(cardRewards[index].id);
    // Brief delay so the player sees which card they picked before showing Continue
    setTimeout(() => setStep('done'), 400);
  };

  const handleSkip = () => {
    setStep('done');
  };

  const panelStyle: React.CSSProperties = {
    background: 'rgba(12, 8, 24, 0.95)',
    border: '3px solid #6b4fa0',
    boxShadow:
      'inset 0 0 0 2px #1a1130, inset 0 0 0 4px #3d2d5c, 0 0 40px rgba(107,79,160,0.4)',
    padding: '40px 60px',
    textAlign: 'center',
    fontFamily: "'Press Start 2P', monospace",
    maxWidth: '90vw',
  };

  const btnStyle: React.CSSProperties = {
    padding: '14px 36px',
    background: 'rgba(12, 8, 24, 0.85)',
    border: '3px solid #6b4fa0',
    boxShadow: 'inset 0 0 0 2px #1a1130, inset 0 0 0 4px #3d2d5c',
    color: '#c4b89a',
    fontFamily: "'Press Start 2P', monospace",
    fontSize: 14,
    cursor: 'pointer',
    letterSpacing: 2,
  };

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
      }}
    >
      <div style={panelStyle}>
        {/* VICTORY heading — always visible */}
        <div
          style={{
            fontSize: 28,
            fontWeight: 'bold',
            color: '#4ade80',
            textShadow:
              '-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000, 0 0 20px rgba(74,222,128,0.5)',
            marginBottom: 16,
            letterSpacing: 3,
          }}
        >
          VICTORY!
        </div>

        {/* Gold reward — always visible */}
        <div
          style={{
            fontSize: 16,
            color: '#fbbf24',
            textShadow:
              '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000',
            marginBottom: 24,
          }}
        >
          + {goldReward} Gold
        </div>

        {/* Step: gold — show button to proceed to card pick */}
        {step === 'gold' && cardRewards.length > 0 && (
          <button onClick={() => setStep('cards')} style={btnStyle}>
            Choose a Card
          </button>
        )}

        {/* Step: gold — no card rewards, go straight to map */}
        {step === 'gold' && cardRewards.length === 0 && (
          <button onClick={onFinish} style={btnStyle}>
            Continue to Map
          </button>
        )}

        {/* Step: cards — show 3 card choices */}
        {step === 'cards' && (
          <>
            <div
              style={{
                fontSize: 12,
                color: '#a882ff',
                marginBottom: 20,
                letterSpacing: 1,
              }}
            >
              Pick a card to add to your deck
            </div>

            <div
              style={{
                display: 'flex',
                gap: 24,
                justifyContent: 'center',
                marginBottom: 24,
              }}
            >
              {rewardInstances.map((inst, i) => (
                <div
                  key={inst.id}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  style={{
                    transition: 'transform 0.2s, filter 0.2s',
                    transform:
                      hoveredIndex === i
                        ? 'translateY(-12px) scale(1.08)'
                        : pickedIndex === i
                          ? 'translateY(-8px) scale(1.05)'
                          : 'none',
                    filter:
                      hoveredIndex === i
                        ? 'drop-shadow(0 0 16px #a882ff) drop-shadow(0 0 8px #6b4fa0)'
                        : pickedIndex === i
                          ? 'drop-shadow(0 0 20px #4ade80)'
                          : 'none',
                    opacity: pickedIndex !== null && pickedIndex !== i ? 0.4 : 1,
                    cursor: pickedIndex === null ? 'pointer' : 'default',
                  }}
                >
                  <CardComponent
                    card={inst}
                    index={i}
                    selected={pickedIndex === i}
                    playable={pickedIndex === null}
                    onClick={() => handlePickCard(i)}
                  />
                </div>
              ))}
            </div>

            {pickedIndex === null && (
              <button
                onClick={handleSkip}
                style={{
                  ...btnStyle,
                  fontSize: 10,
                  padding: '10px 24px',
                  border: '2px solid #3d2d5c',
                  color: '#6b7280',
                }}
              >
                Skip
              </button>
            )}
          </>
        )}

        {/* Step: done — show continue */}
        {step === 'done' && (
          <>
            {pickedIndex !== null && (
              <div
                style={{
                  fontSize: 11,
                  color: '#4ade80',
                  marginBottom: 20,
                  letterSpacing: 1,
                }}
              >
                Added {cardRewards[pickedIndex]?.name || 'card'} to your deck!
              </div>
            )}
            <button onClick={onFinish} style={btnStyle}>
              Continue to Map
            </button>
          </>
        )}
      </div>
    </div>
  );
}

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

    const effects = getCardEffects(card);
    const name = getCardName(card);
    combat.addLog(`Played ${name}`);
    combat.trackCardPlayed(card.defId, def.category);

    // Resolve effects
    for (const effect of effects) {
      resolveEffect(effect, card, targetEnemyId);
    }

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

    // Overfit: repeated card plays this turn deal halved damage
    const overfitStacks = state.playerStatus.find((s) => s.status === 'overfit')?.stacks || 0;
    const priorPlays = state.cardsPlayedThisTurn.filter((id) => id === card.defId).length;
    const isRepeatCard = overfitStacks > 0 && priorPlays > 1;

    switch (effect.type) {
      case 'damage': {
        const target = targetEnemyId || state.enemies.find((e) => e.hp > 0)?.id;
        if (!target) break;
        let dmg = effect.amount + contextBonus;
        consumeContext = true;
        const enemy = state.enemies.find((e) => e.id === target);
        if (enemy?.statusEffects.some((s) => s.status === 'vulnerable')) dmg = Math.floor(dmg * 1.5);
        if (state.playerStatus.some((s) => s.status === 'weak')) dmg = Math.floor(dmg * 0.75);
        if (isRepeatCard) dmg = Math.floor(dmg * 0.5);
        const times = effect.times || 1;
        showPlayerAttack();
        for (let i = 0; i < times; i++) combat.damageEnemy(target, dmg);
        showEnemyHit(target, dmg * times);
        break;
      }
      case 'damageRandom': {
        const target = targetEnemyId || state.enemies.find((e) => e.hp > 0)?.id;
        if (!target) break;
        const dmg = randInt(effect.min, effect.max) + contextBonus;
        consumeContext = true;
        showPlayerAttack();
        combat.damageEnemy(target, dmg);
        showEnemyHit(target, dmg);
        break;
      }
      case 'damageAll': {
        let dmg = effect.amount + contextBonus;
        consumeContext = true;
        if (state.playerStatus.some((s) => s.status === 'weak')) dmg = Math.floor(dmg * 0.75);
        showPlayerAttack();
        for (const enemy of state.enemies) {
          if (enemy.hp > 0) {
            combat.damageEnemy(enemy.id, dmg);
            showEnemyHit(enemy.id, dmg);
          }
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
        showPlayerDefend(effect.amount + contextBonus);
        consumeContext = true;
        break;
      case 'firewallFromMissingHp': {
        const missing = run.maxIntegrity - run.currentIntegrity;
        combat.gainFirewall(missing + contextBonus);
        showPlayerDefend(missing + contextBonus);
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
        const pool = Object.values(CARDS).filter((c) => c.rarity === effect.rarity && c.id !== 'intentMirror' && c.rarity !== 'starter' && c.rarity !== 'curse');
        for (let i = 0; i < effect.count; i++) {
          if (pool.length === 0) break;
          const chosen = pool[Math.floor(Math.random() * pool.length)];
          const inst = createCardInstance(chosen.id);
          if (effect.costOverride !== undefined) inst.costOverride = effect.costOverride;
          combat.addToHand(inst);
        }
        break;
      }
      case 'power_blockPerTurn':
        combat.addPower({ type: 'blockPerTurn', amount: effect.amount });
        combat.addLog(`Gained Power: +${effect.amount} Firewall/turn`);
        break;
      case 'power_drawPerTurn':
        combat.addPower({ type: 'drawPerTurn', amount: effect.amount });
        combat.addLog(`Gained Power: +${effect.amount} Draw/turn`);
        break;
      case 'power_reduceDamage':
        combat.addPower({ type: 'reduceDamage', amount: effect.amount });
        combat.addLog(`Gained Power: -${effect.amount} incoming damage per hit`);
        break;
      case 'power_firstCardFree':
        combat.addPower({ type: 'firstCardFree' });
        combat.addLog('Gained Power: First card each turn costs 0');
        break;
      case 'power_attackSplash':
        combat.addPower({ type: 'attackSplash', amount: effect.amount });
        combat.addLog(`Gained Power: Attacks splash ${effect.amount} damage to all enemies`);
        break;

      case 'replayLastCard': {
        const played = state.cardsPlayedThisTurn;
        const lastDefId = played.length >= 1 ? played[played.length - 1] : null;
        if (!lastDefId || lastDefId === card.defId) { combat.addLog('No valid card to replay.'); break; }
        const lastDef = CARDS[lastDefId];
        if (!lastDef) break;
        const replayInst = createCardInstance(lastDefId);
        replayInst.costOverride = 0;
        combat.addLog(`Replaying ${lastDef.name}!`);
        for (const re of getCardEffects(replayInst)) {
          resolveEffect(re, replayInst, targetEnemyId);
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
          combat.addLog(`Played ${topDef.name} from draw pile!`);
          combat.trackCardPlayed(topCard.defId, topDef.category);
          const autoTarget = targetEnemyId || useCombatStore.getState().enemies.find((e) => e.hp > 0)?.id;
          for (const te of getCardEffects(topCard)) { resolveEffect(te, topCard, autoTarget); }
          if (topDef.keywords?.includes('exhaust')) {
            useCombatStore.setState((s) => ({ exhaustPile: [...s.exhaustPile, topCard] }));
          } else { combat.addToDiscard(topCard); }
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
          combat.addLog(`Orchestrator plays ${hDef.name}!`);
          combat.trackCardPlayed(handCard.defId, hDef.category);
          const autoTarget = targetEnemyId || useCombatStore.getState().enemies.find((e) => e.hp > 0)?.id;
          for (const he of getCardEffects(handCard)) { resolveEffect(he, handCard, autoTarget); }
          if (hDef.keywords?.includes('exhaust')) {
            useCombatStore.setState((s) => ({ exhaustPile: [...s.exhaustPile, handCard] }));
          } else { combat.addToDiscard(handCard); }
        }
        break;
      }

      case 'scry':
        combat.drawCards(1);
        combat.addLog(`Scried top ${effect.amount} cards — drew 1.`);
        break;

      case 'copyEnemyIntent': {
        const enemy = targetEnemyId ? state.enemies.find((e) => e.id === targetEnemyId) : state.enemies.find((e) => e.hp > 0);
        if (!enemy) break;
        const mirrorInst = createCardInstance('intentMirror');
        mirrorInst.costOverride = 0;
        combat.addToHand(mirrorInst);
        combat.addLog(`Copied enemy intent as Intent Mirror!`);
        break;
      }

      case 'permanentUpgradePrompt': {
        const runState = useRunStore.getState();
        const nonUpgraded = runState.deck.filter((c) => c.defId === 'prompt' && !c.upgraded);
        if (nonUpgraded.length > 0) {
          const pick = nonUpgraded[Math.floor(Math.random() * nonUpgraded.length)];
          runState.upgradeCardInDeck(pick.id);
          combat.addLog('Permanently upgraded a Prompt!');
        } else { combat.addLog('No Prompts to upgrade.'); }
        break;
      }

      case 'exhaustFromHand': {
        const curHand = useCombatStore.getState().hand;
        const exhaustable = curHand
          .filter((c) => { const d = CARDS[c.defId]; return d && d.rarity !== 'curse' && c.id !== card.id; })
          .sort((a, b) => getCardCost(a) - getCardCost(b));
        if (exhaustable.length > 0) {
          const toExhaust = exhaustable[0];
          useCombatStore.setState((s) => ({
            hand: s.hand.filter((c) => c.id !== toExhaust.id),
            exhaustPile: [...s.exhaustPile, toExhaust],
          }));
          combat.addLog(`Exhausted ${CARDS[toExhaust.defId]?.name || 'a card'}.`);
        }
        break;
      }

      case 'heal':
        run.heal(effect.amount);
        combat.addLog(`Healed ${effect.amount} HP.`);
        break;

      case 'addTempCards':
        for (let i = 0; i < effect.count; i++) {
          const tempInst = createCardInstance(effect.cardId);
          if (effect.costOverride !== undefined) tempInst.costOverride = effect.costOverride;
          combat.addToHand(tempInst);
        }
        combat.addLog(`Added ${effect.count} ${CARDS[effect.cardId]?.name || 'cards'} to hand.`);
        break;
    }

    if (consumeContext && contextBonus > 0) {
      combat.removePlayerStatus('context', 999);
    }
  }, [combat, run]);

  const handleEndTurn = useCallback(async () => {
    if (combat.phase !== 'playerTurn') return;

    // Hallucination curse cards deal damage BEFORE discarding hand
    const preDiscardHand = useCombatStore.getState().hand;
    const halCards = preDiscardHand.filter((c) => c.defId === 'hallucination');
    for (const halCard of halCards) {
      const grounded = useCombatStore.getState().playerStatus.find((s) => s.status === 'grounded');
      if (grounded && grounded.stacks > 0) {
        combat.removePlayerStatus('grounded', 1);
        combat.addLog('Grounded absorbed a Hallucination card!');
      } else {
        run.takeDamage(HALLUCINATION_SELF_DAMAGE);
        showPlayerHit(HALLUCINATION_SELF_DAMAGE);
        combat.addLog(`Hallucination card dealt ${HALLUCINATION_SELF_DAMAGE} damage!`);
      }
      // Exhaust the hallucination card after it triggers
      useCombatStore.setState((s) => ({
        hand: s.hand.filter((c) => c.id !== halCard.id),
        exhaustPile: [...s.exhaustPile, halCard],
      }));
    }

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

    if (useRunStore.getState().currentIntegrity <= 0) {
      combat.endCombat();
      return;
    }

    // Enemy phase
    combat.setPhase('enemyTurn');
    setMessage('Enemy turn...');

    await new Promise((r) => setTimeout(r, 800));

    // Execute enemy intents
    for (const enemy of useCombatStore.getState().enemies.filter((e) => e.hp > 0)) {
      const intent = enemy.currentIntent;
      executeEnemyIntent(enemy);
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

    // Calculate total reduceDamage from active powers
    const reduceAmount = useCombatStore.getState().activePowers
      .filter((p) => p.type === 'reduceDamage')
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    switch (intent.type) {
      case 'attack':
      case 'attackMulti': {
        let dmg = intent.damage;
        if (enemy.statusEffects.some((s) => s.status === 'weak')) dmg = Math.floor(dmg * 0.75);
        if (reduceAmount > 0) dmg = Math.max(0, dmg - reduceAmount);
        const hits = intent.type === 'attackMulti' ? (intent.times || 1) : 1;
        setEnemyHit(enemy.id);
        setTimeout(() => setEnemyHit(null), 300);
        let totalDmg = 0;
        for (let i = 0; i < hits; i++) {
          const actual = combat.takeDamage(dmg);
          run.takeDamage(actual);
          totalDmg += actual;
        }
        showPlayerHit(totalDmg);
        setMessage(`${name} attacks for ${dmg}${hits > 1 ? ` x${hits}` : ''}!`);
        combat.addLog(`${name} attacks for ${dmg}${hits > 1 ? ` x${hits}` : ''}`);
        break;
      }
      case 'attackDebuff': {
        let dmg = intent.damage;
        if (enemy.statusEffects.some((s) => s.status === 'weak')) dmg = Math.floor(dmg * 0.75);
        if (reduceAmount > 0) dmg = Math.max(0, dmg - reduceAmount);
        setEnemyHit(enemy.id);
        setTimeout(() => setEnemyHit(null), 300);
        const actual = combat.takeDamage(dmg);
        run.takeDamage(actual);
        showPlayerHit(actual);
        setTimeout(() => showPlayerDebuffed(intent.status), 400);
        if (intent.status === 'hallucination') {
          for (let i = 0; i < intent.stacks; i++) {
            combat.shuffleIntoDraw(createCardInstance('hallucination'));
          }
          setMessage(`${name} attacks for ${dmg} + shuffles ${intent.stacks} ${curseName} card${intent.stacks > 1 ? 's' : ''} into your deck!`);
        } else {
          combat.addPlayerStatus({ status: intent.status, stacks: intent.stacks });
          setMessage(`${name} attacks for ${dmg} + ${getDebuffDescription(intent.status, intent.stacks)}`);
        }
        combat.addLog(`${name} attacks for ${dmg} + ${intent.status}`);
        break;
      }
      case 'defend':
        combat.updateEnemy(enemy.id, { firewall: enemy.firewall + intent.firewall });
        addFloat(enemy.id, `+${intent.firewall} FW`, '#60a5fa');
        setMessage(`${name} gains ${intent.firewall} Firewall`);
        combat.addLog(`${name} gains ${intent.firewall} Firewall`);
        break;
      case 'buff':
        if (enemy.defId === 'ghostEndpoint') {
          combat.addEnemyStatus(enemy.id, { status: 'intangible', stacks: 1 });
        }
        addFloat(enemy.id, 'BUFF', '#fbbf24');
        setMessage(`${name} buffs itself!`);
        combat.addLog(`${name} buffs itself`);
        break;
      case 'debuff':
        if (intent.status === 'hallucination') {
          // Shuffle curse cards into draw pile
          for (let i = 0; i < intent.stacks; i++) {
            combat.shuffleIntoDraw(createCardInstance('hallucination'));
          }
          showPlayerDebuffed(curseName);
          setMessage(`${name} shuffles ${intent.stacks} ${curseName} card${intent.stacks > 1 ? 's' : ''} into your deck! (${curseDesc})`);
          combat.addLog(`${name} adds ${intent.stacks} ${curseName} cards`);
        } else {
          combat.addPlayerStatus({ status: intent.status, stacks: intent.stacks });
          showPlayerDebuffed(intent.status);
          setMessage(`${name} applies ${getDebuffDescription(intent.status, intent.stacks)}`);
          combat.addLog(`${name} applies ${intent.status}`);
        }
        break;
    }
  }, [combat, run]);

  function getDebuffDescription(status: string, stacks: number): string {
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

