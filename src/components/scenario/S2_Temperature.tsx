import { useState } from 'react';

const RESPONSES = [
  {
    temp: 'low',
    label: 'Cold',
    emoji: '\u2744\uFE0F',
    image: '/sprites/cake-cold.png',
    text: 'It is a chocolate cake with chocolate frosting. It costs $24.99.',
    color: '#60a5fa',
    description: 'Boring but accurate',
    realWorld: 'This is what happens when you set temperature to 0 in ChatGPT or Claude — you get the most predictable, "safe" answer every time.',
  },
  {
    temp: 'mid',
    label: 'Medium',
    emoji: '\uD83C\uDF21\uFE0F',
    image: '/sprites/cake-medium.png',
    text: 'Our rich chocolate cake features layers of velvety ganache and is perfect for celebrations! $24.99.',
    color: '#fbbf24',
    description: 'Creative but grounded',
    realWorld: 'Most AI apps use a medium temperature (around 0.7) — creative enough to be interesting, accurate enough to be useful.',
  },
  {
    temp: 'high',
    label: 'Hot',
    emoji: '\uD83D\uDD25',
    image: '/sprites/cake-hot.png',
    text: 'Behold the LEGENDARY Choco-Volcano Explosion Cake, forged in the fires of Mount Cacao, topped with stardust frosting and unicorn tears! Only $999!',
    color: '#ef4444',
    description: 'Wild but makes things up!',
    realWorld: 'High temperature = more randomness. The AI picks less likely words, which can be creative... or completely wrong.',
  },
];

export function S2_Temperature({ onComplete }: { onComplete: () => void }) {
  const [tempLevel, setTempLevel] = useState(1);
  const [tried, setTried] = useState({ low: false, mid: true, high: false });

  const response = RESPONSES[tempLevel];
  const allTried = tried.low && tried.mid && tried.high;
  const triedCount = [tried.low, tried.mid, tried.high].filter(Boolean).length;

  const handleSlider = (val: number) => {
    setTempLevel(val);
    const key = val === 0 ? 'low' : val === 1 ? 'mid' : 'high';
    setTried((p) => ({ ...p, [key]: true }));
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 32, maxWidth: 600, margin: '0 auto', width: '100%' }}>

      {/* Intro context */}
      <div style={{ textAlign: 'center', marginBottom: 4 }}>
        <p style={{ fontSize: 13, color: '#9ca3af', lineHeight: 1.7 }}>
          Remember how the AI picks the <strong style={{ color: '#a78bfa' }}>most likely</strong> next word?
          Temperature controls <em>how adventurous</em> those picks are.
        </p>
      </div>

      {/* Customer */}
      <div style={bubbleStyle}>
        <span style={{ fontSize: 11, color: '#6b7280', display: 'block', marginBottom: 4 }}>{'\uD83D\uDC64'} Customer:</span>
        "Can you describe your new chocolate cake?"
      </div>

      {/* Temperature selector — clickable cards with images */}
      <div style={{
        display: 'flex',
        gap: 10,
        width: '100%',
      }}>
        {RESPONSES.map((r, i) => {
          const isActive = i === tempLevel;
          const wasTried = tried[r.temp as 'low' | 'mid' | 'high'];
          return (
            <div
              key={r.temp}
              onClick={() => handleSlider(i)}
              style={{
                flex: 1,
                padding: '12px 8px 10px',
                background: isActive ? `${r.color}15` : '#0f0f2366',
                border: `2px solid ${isActive ? r.color : wasTried ? '#2d2d5e' : '#1e2030'}`,
                borderRadius: 8,
                textAlign: 'center',
                transition: 'all 0.3s',
                cursor: 'pointer',
                opacity: isActive ? 1 : 0.6,
                position: 'relative',
              }}
            >
              {/* Tried checkmark */}
              {wasTried && !isActive && (
                <div style={{
                  position: 'absolute', top: 4, right: 6,
                  fontSize: 10, color: '#4ade80',
                }}>
                  {'\u2713'}
                </div>
              )}
              <img
                src={r.image}
                alt={r.label}
                style={{
                  width: 80,
                  height: 80,
                  imageRendering: 'pixelated',
                  marginBottom: 6,
                  filter: isActive ? 'none' : 'brightness(0.6)',
                  transition: 'filter 0.3s',
                }}
              />
              <div style={{ fontSize: 18, marginBottom: 2 }}>{r.emoji}</div>
              <div style={{ fontSize: 12, fontWeight: 'bold', color: r.color }}>{r.label}</div>
              <div style={{ fontSize: 10, color: '#6b7280', marginTop: 4, lineHeight: 1.4 }}>{r.description}</div>
            </div>
          );
        })}
      </div>

      {/* Slider */}
      <div style={{ width: '100%', textAlign: 'center' }}>
        <input
          type="range"
          min={0}
          max={2}
          value={tempLevel}
          onChange={(e) => handleSlider(Number(e.target.value))}
          style={{ width: '100%', cursor: 'pointer', accentColor: response.color }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#4b5563', marginTop: 2 }}>
          <span>{'\u2744\uFE0F'} Predictable</span>
          <span>Balanced</span>
          <span>{'\uD83D\uDD25'} Creative</span>
        </div>
      </div>

      {/* AI response */}
      <div style={{
        background: '#0f0f23', border: `2px solid ${response.color}44`, borderRadius: 12,
        padding: 20, width: '100%',
        transition: 'border-color 0.3s',
      }}>
        <div style={{ fontSize: 11, color: '#7b68ee', marginBottom: 8 }}>
          {'\uD83E\uDD16'} AI Response:
        </div>
        <div style={{ fontSize: 14, lineHeight: 1.7, color: '#e0e0e0' }}>
          {response.text}
        </div>
        {tempLevel === 2 && (
          <div style={{
            marginTop: 12, padding: '8px 12px', background: '#ef444422',
            borderRadius: 6, fontSize: 12, color: '#ef4444',
          }}>
            {'\u26A0\uFE0F'} Warning: "$999" and "unicorn tears" are made up!
          </div>
        )}
      </div>

      {/* Real-world context */}
      <div style={{
        fontSize: 12, color: '#7b68ee', lineHeight: 1.6, textAlign: 'center',
        padding: '8px 16px', background: '#7b68ee11', borderRadius: 8, width: '100%',
      }}>
        {response.realWorld}
      </div>

      {/* Progress indicator + button */}
      {!allTried ? (
        <div style={{
          textAlign: 'center',
          padding: '12px 20px',
          background: '#fbbf2411',
          border: '1px solid #fbbf2433',
          borderRadius: 8,
          width: '100%',
        }}>
          <div style={{ fontSize: 13, color: '#fbbf24', marginBottom: 6 }}>
            {'\uD83D\uDC46'} Try all 3 temperatures to continue
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
            {RESPONSES.map((r, i) => {
              const wasTried = tried[r.temp as 'low' | 'mid' | 'high'];
              return (
                <div key={r.temp} style={{
                  fontSize: 11,
                  padding: '4px 10px',
                  background: wasTried ? '#4ade8022' : '#1e2030',
                  border: `1px solid ${wasTried ? '#4ade80' : '#374151'}`,
                  borderRadius: 4,
                  color: wasTried ? '#4ade80' : '#4b5563',
                  cursor: 'pointer',
                }} onClick={() => handleSlider(i)}>
                  {wasTried ? '\u2713 ' : ''}{r.emoji} {r.label}
                </div>
              );
            })}
          </div>
          <div style={{ fontSize: 11, color: '#6b7280', marginTop: 6 }}>
            {triedCount}/3 explored
          </div>
        </div>
      ) : (
        <button onClick={onComplete} style={btnStyle}>
          Got it! Continue {'\u2192'}
        </button>
      )}
    </div>
  );
}

const bubbleStyle: React.CSSProperties = {
  background: '#1e2030', borderRadius: '16px 16px 16px 4px', padding: '12px 20px',
  fontSize: 15, color: '#e0e0e0', border: '1px solid #2d2d5e', width: '100%',
};

const btnStyle: React.CSSProperties = {
  padding: '12px 32px', background: '#7b68ee33', border: '2px solid #7b68ee',
  borderRadius: 8, color: '#e0e0e0', fontFamily: 'monospace', fontWeight: 'bold',
  fontSize: 14, cursor: 'pointer',
};
