import { useState, useEffect, useRef } from 'react';

const WORDS = ['We', 'have', 'blueberry', 'muffins,', 'chocolate', 'croissants,', 'and', 'fresh', 'sourdough', 'bread', 'baked', 'daily!'];
const PROBS = [
  [{ word: 'We', pct: 92 }, { word: 'Our', pct: 6 }, { word: 'The', pct: 2 }],
  [{ word: 'have', pct: 85 }, { word: 'offer', pct: 10 }, { word: 'sell', pct: 5 }],
  [{ word: 'blueberry', pct: 70 }, { word: 'chocolate', pct: 22 }, { word: 'dragon', pct: 8 }],
  [{ word: 'muffins,', pct: 88 }, { word: 'scones,', pct: 10 }, { word: 'explosions,', pct: 2 }],
  [{ word: 'chocolate', pct: 75 }, { word: 'vanilla', pct: 20 }, { word: 'cosmic', pct: 5 }],
  [{ word: 'croissants,', pct: 80 }, { word: 'cookies,', pct: 15 }, { word: 'dragons,', pct: 5 }],
  [{ word: 'and', pct: 95 }, { word: 'plus', pct: 4 }, { word: 'with', pct: 1 }],
  [{ word: 'fresh', pct: 78 }, { word: 'warm', pct: 18 }, { word: 'ancient', pct: 4 }],
  [{ word: 'sourdough', pct: 65 }, { word: 'rye', pct: 25 }, { word: 'lava', pct: 10 }],
  [{ word: 'bread', pct: 82 }, { word: 'loaves', pct: 15 }, { word: 'bricks', pct: 3 }],
  [{ word: 'baked', pct: 88 }, { word: 'made', pct: 10 }, { word: 'forged', pct: 2 }],
  [{ word: 'daily!', pct: 90 }, { word: 'fresh!', pct: 8 }, { word: 'weekly!', pct: 2 }],
];

export function S1_TextGeneration({ onComplete }: { onComplete: () => void }) {
  const [generating, setGenerating] = useState(false);
  const [wordIndex, setWordIndex] = useState(-1);
  const [done, setDone] = useState(false);
  const timer = useRef<number>(0);

  const startGenerate = () => {
    setGenerating(true);
    setWordIndex(0);
  };

  useEffect(() => {
    if (!generating || wordIndex < 0) return;
    if (wordIndex >= WORDS.length) {
      setDone(true);
      setGenerating(false);
      return;
    }
    timer.current = window.setTimeout(() => setWordIndex((i) => i + 1), 350);
    return () => clearTimeout(timer.current);
  }, [generating, wordIndex]);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, padding: '20px 32px', overflow: 'auto' }}>
      {/* Customer bubble */}
      <div style={{
        background: '#1e2030', borderRadius: '16px 16px 16px 4px', padding: '12px 20px',
        fontSize: 15, color: '#e0e0e0', maxWidth: 400, border: '1px solid #2d2d5e',
      }}>
        <span style={{ fontSize: 11, color: '#6b7280', display: 'block', marginBottom: 4 }}>Customer:</span>
        "What muffins do you have?"
      </div>

      {/* AI response area */}
      <div style={{
        background: '#0f0f23', border: '2px solid #7b68ee44', borderRadius: 12,
        padding: 20, minHeight: 120, width: '100%', maxWidth: 500,
      }}>
        <div style={{ fontSize: 11, color: '#7b68ee', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 14 }}>{'\u{1F916}'}</span> AI Response:
        </div>

        {!generating && wordIndex < 0 && (
          <div style={{ color: '#374151', fontSize: 13, fontStyle: 'italic' }}>
            Waiting for input...
          </div>
        )}

        {/* Generated words */}
        <div style={{ fontSize: 16, lineHeight: 1.8, minHeight: 50 }}>
          {WORDS.slice(0, Math.max(0, wordIndex)).map((word, i) => (
            <span key={i} style={{
              color: '#e0e0e0',
              marginRight: 6,
              animation: i === wordIndex - 1 ? 'fadeIn 0.2s' : undefined,
            }}>
              {word}
            </span>
          ))}
          {generating && <span style={{ color: '#7b68ee', animation: 'blink 0.5s infinite' }}>|</span>}
        </div>

        {/* Probability display for current word */}
        {generating && wordIndex >= 0 && wordIndex < PROBS.length && (
          <div style={{ marginTop: 16, padding: '10px 12px', background: '#1a1a2e', borderRadius: 8, border: '1px solid #2d2d5e' }}>
            <div style={{ fontSize: 10, color: '#6b7280', marginBottom: 6 }}>
              Predicting next word:
            </div>
            {PROBS[wordIndex].map((p, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                <div style={{
                  width: `${p.pct * 2}px`, height: 14, borderRadius: 3,
                  background: i === 0 ? '#7b68ee' : i === 1 ? '#4b5563' : '#2d2d5e',
                  transition: 'width 0.3s',
                  display: 'flex', alignItems: 'center', paddingLeft: 6,
                  fontSize: 10, color: '#fff', minWidth: 60,
                }}>
                  {p.word}
                </div>
                <span style={{ fontSize: 10, color: '#6b7280' }}>{p.pct}%</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Generate button or Complete */}
      {!generating && !done && (
        <button onClick={startGenerate} style={btnStyle}>
          {'\u25B6'} Generate Response
        </button>
      )}
      {done && (
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 12 }}>
            The AI predicted each word one at a time, picking the most likely option.
          </p>
          <button onClick={onComplete} style={btnStyle}>
            Got it! Continue
          </button>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0; } }
      `}</style>
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  padding: '12px 32px', background: '#7b68ee33', border: '2px solid #7b68ee',
  borderRadius: 8, color: '#e0e0e0', fontFamily: 'monospace', fontWeight: 'bold',
  fontSize: 14, cursor: 'pointer', letterSpacing: 1,
};
