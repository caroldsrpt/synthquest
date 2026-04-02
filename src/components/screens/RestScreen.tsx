import { useState } from 'react';
import { useRunStore } from '../../stores/runStore';
import { REST_HEAL_PERCENT } from '../../utils/constants';
import { CardComponent } from '../combat/CardComponent';

export function RestScreen() {
  const run = useRunStore();
  const [mode, setMode] = useState<'choose' | 'upgrade' | 'done'>('choose');
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  const healAmount = Math.floor(run.maxIntegrity * REST_HEAL_PERCENT);

  const handleHeal = () => {
    run.healPercent(REST_HEAL_PERCENT);
    setMode('done');
  };

  const handleUpgradeMode = () => {
    setMode('upgrade');
  };

  const handleUpgradeCard = () => {
    if (!selectedCardId) return;
    run.upgradeCardInDeck(selectedCardId);
    setMode('done');
  };

  const handleContinue = () => {
    run.setScreen('map');
  };

  return (
    <div style={{
      width: '100%', height: '100%',
      background: 'linear-gradient(180deg, #0f0f23 0%, #1a1a2e 100%)',
      fontFamily: 'monospace', color: '#e0e0e0',
      border: '2px solid #333', borderRadius: 4,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{ fontSize: 24, marginBottom: 8 }}>{'\u2668'}</div>
      <h2 style={{ fontSize: 20, fontWeight: 'bold', margin: '0 0 4px', color: '#60a5fa' }}>Rest Site</h2>
      <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 24 }}>
        HP: {run.currentIntegrity}/{run.maxIntegrity}
      </p>

      {mode === 'choose' && (
        <div style={{ display: 'flex', gap: 16 }}>
          <button onClick={handleHeal} style={optionBtn}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{'\u2764'}</div>
            <div style={{ fontWeight: 'bold', marginBottom: 4 }}>Rest</div>
            <div style={{ fontSize: 11, color: '#6b7280' }}>Heal {healAmount} Integrity</div>
          </button>
          <button onClick={handleUpgradeMode} style={optionBtn}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{'\u2B06'}</div>
            <div style={{ fontWeight: 'bold', marginBottom: 4 }}>Upgrade</div>
            <div style={{ fontSize: 11, color: '#6b7280' }}>Upgrade 1 card</div>
          </button>
        </div>
      )}

      {mode === 'upgrade' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, maxWidth: '100%' }}>
          <p style={{ fontSize: 12, color: '#9ca3af' }}>Choose a card to upgrade:</p>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center', maxHeight: 350, overflow: 'auto' }}>
            {run.deck.filter((c) => !c.upgraded).map((card) => (
              <div
                key={card.id}
                onClick={() => setSelectedCardId(card.id)}
                style={{
                  border: selectedCardId === card.id ? '2px solid #fbbf24' : '2px solid transparent',
                  borderRadius: 10,
                  padding: 2,
                  cursor: 'pointer',
                }}
              >
                <CardComponent
                  card={card}
                  index={0}
                  selected={selectedCardId === card.id}
                  playable={true}
                  onClick={() => setSelectedCardId(card.id)}
                  small
                />
              </div>
            ))}
          </div>
          {selectedCardId && (
            <button onClick={handleUpgradeCard} style={confirmBtn}>
              Upgrade
            </button>
          )}
          <button onClick={() => setMode('choose')} style={{ ...confirmBtn, background: 'rgba(255,255,255,0.05)', borderColor: '#374151' }}>
            Back
          </button>
        </div>
      )}

      {mode === 'done' && (
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: '#4ade80', marginBottom: 16 }}>
            {selectedCardId ? 'Card upgraded!' : `Healed ${healAmount} Integrity!`}
          </p>
          <button onClick={handleContinue} style={confirmBtn}>Continue</button>
        </div>
      )}
    </div>
  );
}

const optionBtn: React.CSSProperties = {
  padding: '24px 32px',
  background: 'rgba(255,255,255,0.03)',
  border: '2px solid #2d2d5e',
  borderRadius: 12,
  color: '#e0e0e0',
  fontFamily: 'monospace',
  cursor: 'pointer',
  textAlign: 'center',
  minWidth: 160,
};

const confirmBtn: React.CSSProperties = {
  padding: '10px 32px',
  background: 'rgba(123, 104, 238, 0.2)',
  border: '2px solid #7b68ee',
  borderRadius: 8,
  color: '#e0e0e0',
  fontFamily: 'monospace',
  fontWeight: 'bold',
  cursor: 'pointer',
};
