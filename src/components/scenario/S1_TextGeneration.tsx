import { useState, useEffect, useRef } from 'react';

type Phase = 'intro' | 'generate' | 'explain' | 'second' | 'done';

const WORDS = ['We', 'have', 'blueberry', 'muffins,', 'chocolate', 'croissants,', 'and', 'fresh', 'sourdough', 'bread!'];
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
  [{ word: 'bread!', pct: 82 }, { word: 'loaves!', pct: 15 }, { word: 'bricks!', pct: 3 }],
];

export function S1_TextGeneration({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<Phase>('intro');
  const [wordIndex, setWordIndex] = useState(-1);
  const [showingProbs, setShowingProbs] = useState(false);
  const [pausedAtWord, setPausedAtWord] = useState(-1);
  const timer = useRef<number>(0);

  const PAUSE_AT = [2, 5]; // word indices where we pause to show probabilities

  // Auto-advance word generation
  useEffect(() => {
    if (phase !== 'generate') return;
    if (wordIndex < 0) return;
    if (showingProbs) return; // Don't advance while showing probability picker

    if (wordIndex >= WORDS.length) {
      setPhase('explain');
      return;
    }

    // Check if we should pause here
    if (PAUSE_AT.includes(wordIndex) && pausedAtWord !== wordIndex) {
      setPausedAtWord(wordIndex);
      setShowingProbs(true);
      return;
    }

    timer.current = window.setTimeout(() => {
      setWordIndex((i) => i + 1);
    }, 500);
    return () => clearTimeout(timer.current);
  }, [phase, wordIndex, showingProbs, pausedAtWord]);

  const handlePickWord = () => {
    setShowingProbs(false);
    // Advance to next word after a brief delay
    setTimeout(() => setWordIndex((i) => i + 1), 100);
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '16px 24px', overflow: 'auto', maxWidth: 640, margin: '0 auto', width: '100%' }}>

      {/* PHASE: Intro */}
      {phase === 'intro' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, textAlign: 'center', marginTop: 20 }}>
          <div style={{ fontSize: 32, marginBottom: 4 }}>{'\uD83E\uDDC1'}</div>
          <h2 style={{ fontSize: 20, fontWeight: 'bold', margin: 0, color: '#e0e0e0' }}>
            Welcome to Byte's Bakery!
          </h2>
          <p style={{ fontSize: 14, color: '#9ca3af', lineHeight: 1.7, maxWidth: 450 }}>
            The bakery needs an AI assistant to help answer customer questions.
            But before we build one, let's understand how AI actually works.
          </p>
          <p style={{ fontSize: 13, color: '#7b68ee', lineHeight: 1.7, maxWidth: 450 }}>
            Here's the key thing: <strong>AI doesn't "know" anything.</strong> It predicts
            the most likely next word, one word at a time — like autocomplete on your phone,
            but much more powerful.
          </p>
          <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.7, maxWidth: 450 }}>
            Let's see it in action. A customer is about to ask a question.
          </p>
          <button onClick={() => { setPhase('generate'); setWordIndex(0); }} style={btnStyle}>
            See how it works {'\u2192'}
          </button>
        </div>
      )}

      {/* PHASE: Generate */}
      {(phase === 'generate' || phase === 'explain') && (
        <>
          {/* Customer question */}
          <div style={bubbleStyle}>
            <span style={{ fontSize: 11, color: '#6b7280', display: 'block', marginBottom: 4 }}>{'\uD83D\uDC64'} Customer:</span>
            "What do you have today?"
          </div>

          {/* AI response building word by word */}
          <div style={{
            background: '#0f0f23', border: '2px solid #7b68ee44', borderRadius: 12,
            padding: 16, width: '100%',
          }}>
            <div style={{ fontSize: 11, color: '#7b68ee', marginBottom: 8 }}>
              {'\uD83E\uDD16'} AI is generating a response word by word:
            </div>

            <div style={{ fontSize: 16, lineHeight: 2, minHeight: 30, wordWrap: 'break-word' }}>
              {WORDS.slice(0, Math.max(0, wordIndex)).map((word, i) => (
                <span key={i} style={{
                  color: '#e0e0e0',
                  marginRight: 6,
                  background: i === wordIndex - 1 ? '#7b68ee33' : 'transparent',
                  padding: '2px 4px', borderRadius: 4,
                }}>
                  {word}
                </span>
              ))}
              {phase === 'generate' && (
                <span style={{ color: '#7b68ee', animation: 'blink 0.5s infinite' }}>|</span>
              )}
            </div>
          </div>

          {/* Probability picker (paused) */}
          {showingProbs && wordIndex < PROBS.length && (
            <div style={{
              background: '#1a1a2e', border: '2px solid #fbbf2444', borderRadius: 12,
              padding: 16, width: '100%',
            }}>
              <div style={{ fontSize: 12, color: '#fbbf24', marginBottom: 8, fontWeight: 'bold' }}>
                {'\u{1F914}'} Which word should come next?
              </div>
              <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 10 }}>
                The AI calculates probabilities for every possible next word, then picks one:
              </div>
              {PROBS[wordIndex].map((p, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6,
                }}>
                  <div style={{
                    flex: 1, height: 28, background: '#0f0f23', borderRadius: 6,
                    overflow: 'hidden', position: 'relative',
                  }}>
                    <div style={{
                      width: `${p.pct}%`, height: '100%', borderRadius: 6,
                      background: i === 0 ? '#7b68ee' : i === 1 ? '#4b556366' : '#2d2d5e44',
                      display: 'flex', alignItems: 'center', paddingLeft: 10,
                      fontSize: 13, color: '#fff', fontWeight: i === 0 ? 'bold' : 'normal',
                    }}>
                      "{p.word}"
                    </div>
                  </div>
                  <span style={{ fontSize: 12, color: '#6b7280', minWidth: 40, textAlign: 'right' }}>
                    {p.pct}%
                  </span>
                </div>
              ))}
              <div style={{ fontSize: 11, color: '#6b7280', marginTop: 8, fontStyle: 'italic' }}>
                It picks "{PROBS[wordIndex][0].word}" because it's the most likely.
                {wordIndex === 2 && ' Notice "dragon" has an 8% chance — the AI doesn\'t know what\'s real!'}
              </div>
              <button onClick={handlePickWord} style={{ ...btnSmall, marginTop: 10 }}>
                Pick the top word and continue {'\u2192'}
              </button>
            </div>
          )}
        </>
      )}

      {/* PHASE: Explain */}
      {phase === 'explain' && (
        <div style={{
          background: '#1a1a2e', border: '1px solid #2d2d5e', borderRadius: 12,
          padding: 16, width: '100%', textAlign: 'center',
        }}>
          <div style={{ fontSize: 14, color: '#e0e0e0', lineHeight: 1.7, marginBottom: 12 }}>
            {'\u2705'} The AI generated a complete response — <strong>one word at a time</strong>.
          </div>
          <div style={{ fontSize: 13, color: '#9ca3af', lineHeight: 1.7, marginBottom: 12 }}>
            It didn't "understand" the question. It calculated which word was most likely
            to come next, over and over. That's all it does.
          </div>
          <div style={{ fontSize: 13, color: '#fbbf24', lineHeight: 1.7, marginBottom: 16 }}>
            This worked great here — but what happens when the AI doesn't have
            real data to predict from? {'\uD83E\uDD14'}
          </div>
          <button onClick={onComplete} style={btnStyle}>
            I get it — let's keep building! {'\u2192'}
          </button>
        </div>
      )}

      <style>{`
        @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0; } }
      `}</style>
    </div>
  );
}

const bubbleStyle: React.CSSProperties = {
  background: '#1e2030', borderRadius: '16px 16px 16px 4px', padding: '12px 20px',
  fontSize: 15, color: '#e0e0e0', border: '1px solid #2d2d5e', width: '100%',
};

const btnStyle: React.CSSProperties = {
  padding: '12px 28px', background: '#7b68ee33', border: '2px solid #7b68ee',
  borderRadius: 8, color: '#e0e0e0', fontFamily: 'monospace', fontWeight: 'bold',
  fontSize: 14, cursor: 'pointer',
};

const btnSmall: React.CSSProperties = {
  padding: '8px 16px', background: '#fbbf2422', border: '1px solid #fbbf24',
  borderRadius: 6, color: '#fbbf24', fontFamily: 'monospace', fontWeight: 'bold',
  fontSize: 12, cursor: 'pointer',
};
