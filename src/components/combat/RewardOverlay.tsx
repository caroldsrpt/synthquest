import { useMemo, useState } from 'react';
import { CardComponent } from './CardComponent';
import { createCardInstance } from '@/utils/cardUtils';
import type { CardDef, RelicDef } from '@/game/data/types';

type RewardStep = 'gold' | 'relic' | 'cards' | 'done';

export function RewardOverlay({
  goldReward,
  cardRewards,
  relicReward,
  onFinish,
  onPickCard,
  onPickRelic,
}: {
  goldReward: number;
  cardRewards: CardDef[];
  relicReward?: RelicDef | null;
  onFinish: () => void;
  onPickCard: (defId: string) => void;
  onPickRelic?: (relicId: string) => void;
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
    maxWidth: 864,
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

        {/* Step: gold — proceed to relic or cards */}
        {step === 'gold' && (
          <button onClick={() => {
            if (relicReward) setStep('relic');
            else if (cardRewards.length > 0) setStep('cards');
            else onFinish();
          }} style={btnStyle}>
            {relicReward ? 'View Relic' : cardRewards.length > 0 ? 'Choose a Card' : 'Continue to Map'}
          </button>
        )}

        {/* Step: relic — show relic reward */}
        {step === 'relic' && relicReward && (
          <>
            <div style={{
              padding: '16px 24px',
              border: '2px solid #fbbf24',
              background: 'rgba(251, 191, 36, 0.1)',
              marginBottom: 20,
            }}>
              <div style={{ fontSize: 12, color: '#fbbf24', marginBottom: 8, letterSpacing: 1 }}>
                {relicReward.name}
              </div>
              <div style={{ fontSize: 9, color: '#c4b89a', lineHeight: 1.6 }}>
                {relicReward.description}
              </div>
              <div style={{ fontSize: 7, color: '#6b7280', marginTop: 6, fontStyle: 'italic' }}>
                {relicReward.aiConcept}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
              <button onClick={() => {
                onPickRelic?.(relicReward.id);
                if (cardRewards.length > 0) setStep('cards');
                else setStep('done');
              }} style={btnStyle}>
                Take Relic
              </button>
              <button onClick={() => {
                if (cardRewards.length > 0) setStep('cards');
                else setStep('done');
              }} style={{ ...btnStyle, fontSize: 10, border: '2px solid #3d2d5c', color: '#6b7280' }}>
                Skip
              </button>
            </div>
          </>
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
