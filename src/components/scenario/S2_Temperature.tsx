import { useState } from 'react';

const RESPONSES = [
  { temp: 'low', label: '\u2744\uFE0F Cold', text: 'It is a chocolate cake with chocolate frosting. It costs $24.99.', color: '#60a5fa' },
  { temp: 'mid', label: '\u{1F321}\uFE0F Medium', text: 'Our rich chocolate cake features layers of velvety ganache and is perfect for celebrations! $24.99.', color: '#fbbf24' },
  { temp: 'high', label: '\uD83D\uDD25 Hot', text: 'Behold the LEGENDARY Choco-Volcano Explosion Cake, forged in the fires of Mount Cacao, topped with stardust frosting and unicorn tears! Only $999!', color: '#ef4444' },
];

export function S2_Temperature({ onComplete }: { onComplete: () => void }) {
  const [tempLevel, setTempLevel] = useState(1); // 0=low, 1=mid, 2=high
  const [hasTriedAll, setHasTriedAll] = useState({ low: false, mid: false, high: false });

  const response = RESPONSES[tempLevel];
  const allTried = hasTriedAll.low && hasTriedAll.mid && hasTriedAll.high;

  const handleSlider = (val: number) => {
    setTempLevel(val);
    const key = val === 0 ? 'low' : val === 1 ? 'mid' : 'high';
    setHasTriedAll((p) => ({ ...p, [key]: true }));
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, padding: 32 }}>
      {/* Customer */}
      <div style={bubbleStyle}>
        <span style={{ fontSize: 11, color: '#6b7280', display: 'block', marginBottom: 4 }}>Customer:</span>
        "Can you describe your new chocolate cake?"
      </div>

      {/* Temperature slider */}
      <div style={{ width: '100%', maxWidth: 400, textAlign: 'center' }}>
        <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>
          Temperature: <span style={{ color: response.color, fontWeight: 'bold' }}>{response.label}</span>
        </div>
        <input
          type="range"
          min={0}
          max={2}
          value={tempLevel}
          onChange={(e) => handleSlider(Number(e.target.value))}
          style={{ width: '100%', cursor: 'pointer', accentColor: response.color }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#4b5563', marginTop: 4 }}>
          <span>\u2744\uFE0F Predictable</span>
          <span>Balanced</span>
          <span>\uD83D\uDD25 Creative</span>
        </div>
      </div>

      {/* AI response */}
      <div style={{
        background: '#0f0f23', border: `2px solid ${response.color}44`, borderRadius: 12,
        padding: 20, width: '100%', maxWidth: 500,
        transition: 'border-color 0.3s',
      }}>
        <div style={{ fontSize: 11, color: '#7b68ee', marginBottom: 8 }}>
          {'\u{1F916}'} AI Response:
        </div>
        <div style={{ fontSize: 14, lineHeight: 1.7, color: '#e0e0e0' }}>
          {response.text}
        </div>
        {tempLevel === 2 && (
          <div style={{
            marginTop: 12, padding: '6px 10px', background: '#ef444422',
            borderRadius: 6, fontSize: 11, color: '#ef4444',
          }}>
            \u26A0\uFE0F Warning: "$999" and "unicorn tears" are made up!
          </div>
        )}
      </div>

      {/* Progress / Complete */}
      {!allTried && (
        <div style={{ fontSize: 12, color: '#4b5563' }}>
          Try all three settings to continue
        </div>
      )}
      {allTried && (
        <button onClick={onComplete} style={btnStyle}>
          Got it! Continue
        </button>
      )}
    </div>
  );
}

const bubbleStyle: React.CSSProperties = {
  background: '#1e2030', borderRadius: '16px 16px 16px 4px', padding: '12px 20px',
  fontSize: 15, color: '#e0e0e0', maxWidth: 400, border: '1px solid #2d2d5e', width: '100%',
};

const btnStyle: React.CSSProperties = {
  padding: '12px 32px', background: '#7b68ee33', border: '2px solid #7b68ee',
  borderRadius: 8, color: '#e0e0e0', fontFamily: 'monospace', fontWeight: 'bold',
  fontSize: 14, cursor: 'pointer',
};
