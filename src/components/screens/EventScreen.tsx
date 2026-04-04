import { useState } from 'react';
import { useRunStore } from '../../stores/runStore';
import { EVENTS } from '../../game/data/events';
import { CARDS } from '../../game/data/cards';
import { createCardInstance } from '../../utils/cardUtils';
import type { EventEffect } from '../../game/data/types';

const PIXEL = "'Press Start 2P', monospace";

const PX_OUTLINE = [
  '-1px -1px 0 #000', ' 1px -1px 0 #000',
  '-1px  1px 0 #000', ' 1px  1px 0 #000',
  ' 0   -1px 0 #000', ' 0    1px 0 #000',
  '-1px  0   0 #000', ' 1px  0   0 #000',
].join(', ');

export function EventScreen() {
  const run = useRunStore();
  const [chosenIndex, setChosenIndex] = useState<number | null>(null);
  const [resultLines, setResultLines] = useState<string[]>([]);

  const event = run.currentEventId ? EVENTS[run.currentEventId] : null;

  if (!event) {
    return (
      <div style={containerStyle}>
        <div style={{ fontFamily: PIXEL, color: '#c4b89a', fontSize: 14 }}>
          No event found.
        </div>
        <button onClick={() => run.setScreen('map')} style={btnStyle}>
          Back to Map
        </button>
      </div>
    );
  }

  const handleChoose = (index: number) => {
    if (chosenIndex !== null) return;
    setChosenIndex(index);

    const choice = event.choices[index];
    const lines: string[] = [];

    for (const effect of choice.effect) {
      const line = applyEffect(effect, run);
      if (line) lines.push(line);
    }

    if (lines.length === 0) {
      lines.push('Nothing happens.');
    }

    setResultLines(lines);
  };

  const handleContinue = () => {
    run.setCurrentEvent(null);
    run.setScreen('map');
  };

  return (
    <div style={containerStyle}>
      {/* Panel */}
      <div style={panelStyle}>
        {/* Title */}
        <div style={{
          fontFamily: PIXEL,
          fontSize: 18,
          color: '#a78bfa',
          textShadow: PX_OUTLINE,
          marginBottom: 24,
          letterSpacing: 2,
        }}>
          {event.name}
        </div>

        {/* Description */}
        <div style={{
          fontFamily: PIXEL,
          fontSize: 10,
          color: '#c4b89a',
          lineHeight: '22px',
          maxWidth: 560,
          marginBottom: 32,
          textAlign: 'left',
        }}>
          {event.description}
        </div>

        {/* Choices */}
        {chosenIndex === null ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 560 }}>
            {event.choices.map((choice, i) => (
              <button
                key={i}
                onClick={() => handleChoose(i)}
                style={choiceBtnStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#a78bfa';
                  e.currentTarget.style.boxShadow = '0 0 16px rgba(167,139,250,0.3), inset 0 0 8px rgba(167,139,250,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#6b4fa0';
                  e.currentTarget.style.boxShadow = 'inset 0 0 0 2px #1a1130, inset 0 0 0 4px #3d2d5c';
                }}
              >
                <div style={{
                  fontFamily: PIXEL,
                  fontSize: 11,
                  color: '#e0d8c8',
                  marginBottom: 6,
                }}>
                  {choice.label}
                </div>
                <div style={{
                  fontFamily: PIXEL,
                  fontSize: 8,
                  color: '#8a7a66',
                  lineHeight: '16px',
                }}>
                  {choice.description}
                </div>
              </button>
            ))}
          </div>
        ) : (
          /* Result */
          <div style={{ width: '100%', maxWidth: 560 }}>
            <div style={{
              fontFamily: PIXEL,
              fontSize: 12,
              color: '#a78bfa',
              marginBottom: 16,
            }}>
              You chose: {event.choices[chosenIndex].label}
            </div>

            <div style={{
              background: 'rgba(107,79,160,0.1)',
              border: '2px solid #3d2d5c',
              padding: '16px 20px',
              marginBottom: 24,
            }}>
              {resultLines.map((line, i) => (
                <div key={i} style={{
                  fontFamily: PIXEL,
                  fontSize: 9,
                  color: getLineColor(line),
                  lineHeight: '20px',
                  marginBottom: i < resultLines.length - 1 ? 6 : 0,
                }}>
                  {line}
                </div>
              ))}
            </div>

            <button onClick={handleContinue} style={btnStyle}>
              Continue
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/** Determine color for result text based on content */
function getLineColor(line: string): string {
  if (line.includes('Gained') || line.includes('Healed') || line.includes('Upgraded') || line.includes('Removed')) {
    return '#4ade80'; // green for positive
  }
  if (line.includes('Lost') || line.includes('Added') && line.includes('Glitch')) {
    return '#ef4444'; // red for negative
  }
  if (line.includes('Added')) {
    return '#60a5fa'; // blue for card additions
  }
  return '#c4b89a'; // neutral
}

/** Apply a single event effect and return a description string */
function applyEffect(effect: EventEffect, run: ReturnType<typeof useRunStore.getState>): string {
  switch (effect.type) {
    case 'addCard': {
      const def = CARDS[effect.cardId];
      if (!def) return '';
      run.addCardToDeck(createCardInstance(effect.cardId));
      const isCurse = def.rarity === 'curse';
      return isCurse
        ? `Added ${def.name} (curse) to your deck.`
        : `Added ${def.name} to your deck.`;
    }

    case 'addRandomCard': {
      const pool = Object.values(CARDS).filter((c) => {
        if (effect.rarity && c.rarity !== effect.rarity) return false;
        if (effect.category && c.category !== effect.category) return false;
        if (c.rarity === 'starter' || c.rarity === 'curse') return false;
        return true;
      });
      if (pool.length === 0) return 'No eligible cards found.';
      const picked = pool[Math.floor(Math.random() * pool.length)];
      run.addCardToDeck(createCardInstance(picked.id));
      return `Gained ${picked.name}!`;
    }

    case 'removeCard': {
      // Player picks — for events we do random non-starter removal
      const eligible = run.deck.filter((c) => {
        const def = CARDS[c.defId];
        return def && def.rarity !== 'starter';
      });
      if (eligible.length === 0) return 'No removable cards in deck.';
      const target = eligible[Math.floor(Math.random() * eligible.length)];
      const def = CARDS[target.defId];
      run.removeCardFromDeck(target.id);
      return `Removed ${def?.name ?? target.defId} from your deck.`;
    }

    case 'removeRandomNonStarterCard': {
      const eligible = run.deck.filter((c) => {
        const def = CARDS[c.defId];
        return def && def.rarity !== 'starter';
      });
      if (eligible.length === 0) return 'No non-starter cards to remove.';
      const target = eligible[Math.floor(Math.random() * eligible.length)];
      const def = CARDS[target.defId];
      run.removeCardFromDeck(target.id);
      return `Removed ${def?.name ?? target.defId} from your deck.`;
    }

    case 'gold': {
      if (effect.amount >= 0) {
        run.addGold(effect.amount);
        return `Gained ${effect.amount} gold.`;
      } else {
        const loss = Math.abs(effect.amount);
        const had = run.gold;
        if (had < loss) {
          // Spend what we can
          run.spendGold(had);
          return `Lost ${had} gold (couldn't afford full ${loss}).`;
        }
        run.spendGold(loss);
        return `Lost ${loss} gold.`;
      }
    }

    case 'loseIntegrity': {
      run.takeDamage(effect.amount);
      return `Lost ${effect.amount} Integrity.`;
    }

    case 'heal': {
      const amount = Math.floor(run.maxIntegrity * effect.percent);
      run.heal(amount);
      return `Healed ${amount} Integrity.`;
    }

    case 'maxIntegrity': {
      run.modifyMaxIntegrity(effect.amount);
      return effect.amount > 0
        ? `Gained ${effect.amount} max Integrity.`
        : `Lost ${Math.abs(effect.amount)} max Integrity.`;
    }

    case 'tempMaxEnergy': {
      // Store in run state for combat to consume
      useRunStore.setState({
        tempMaxEnergy: { amount: effect.amount, combatsLeft: effect.combats },
      });
      return `Gained +${effect.amount} max energy for the next ${effect.combats} combats.`;
    }

    case 'startNextCombatWith': {
      const existing = useRunStore.getState().nextCombatStatus ?? [];
      useRunStore.setState({
        nextCombatStatus: [...existing, { status: effect.status, stacks: effect.stacks }],
      });
      return `Next combat: start with ${effect.stacks} ${effect.status}.`;
    }

    case 'startNextCombatWithFirewall': {
      useRunStore.setState({
        nextCombatFirewall: { amount: effect.amount, combatsLeft: effect.combats },
      });
      return `Start next ${effect.combats} combats with ${effect.amount} Firewall.`;
    }

    case 'upgradeRandomCard': {
      const upgradeable = run.deck.filter((c) => !c.upgraded);
      if (upgradeable.length === 0) return 'No cards to upgrade.';
      const target = upgradeable[Math.floor(Math.random() * upgradeable.length)];
      const def = CARDS[target.defId];
      run.upgradeCardInDeck(target.id);
      return `Upgraded ${def?.name ?? target.defId}!`;
    }

    case 'exhaustRandomCards': {
      // This doesn't make sense outside combat — skip for events
      return '';
    }

    default:
      return '';
  }
}

// === Styles ===

const containerStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  background: '#0c0a14',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  overflow: 'hidden',
};

const panelStyle: React.CSSProperties = {
  background: 'rgba(12, 8, 24, 0.95)',
  border: '3px solid #6b4fa0',
  boxShadow: 'inset 0 0 0 2px #1a1130, inset 0 0 0 4px #3d2d5c, 0 0 40px rgba(107,79,160,0.4)',
  padding: '40px 48px',
  maxWidth: '90vw',
  maxHeight: '90vh',
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
};

const btnStyle: React.CSSProperties = {
  padding: '14px 36px',
  background: 'rgba(12, 8, 24, 0.85)',
  border: '3px solid #6b4fa0',
  boxShadow: 'inset 0 0 0 2px #1a1130, inset 0 0 0 4px #3d2d5c',
  color: '#c4b89a',
  fontFamily: "'Press Start 2P', monospace",
  fontSize: 12,
  cursor: 'pointer',
  letterSpacing: 2,
};

const choiceBtnStyle: React.CSSProperties = {
  padding: '16px 20px',
  background: 'rgba(12, 8, 24, 0.85)',
  border: '3px solid #6b4fa0',
  boxShadow: 'inset 0 0 0 2px #1a1130, inset 0 0 0 4px #3d2d5c',
  cursor: 'pointer',
  textAlign: 'left',
  transition: 'all 0.2s',
};
