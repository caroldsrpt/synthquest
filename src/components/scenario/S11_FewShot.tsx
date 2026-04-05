import { useState } from 'react';

type Phase = 'intro' | 'build' | 'done';

const EXAMPLES = [
  { id: 'ex1', input: '"Do you have cake?"', output: '"Yes! We have Chocolate Lava Cake ($5.50) and Carrot Cake ($4.75). Want to order?"', label: 'Friendly + prices + upsell' },
  { id: 'ex2', input: '"Any vegan stuff?"', output: '"Great question! Our Oat Cookies and Banana Bread are both vegan. The Oat Cookies are our best seller!"', label: 'Enthusiastic + recommendation' },
  { id: 'ex3', input: '"What\'s cheap?"', output: '"Our best value items: Oat Cookie ($2.00), Blueberry Muffin ($3.00), and Banana Bread ($3.50). All freshly baked!"', label: 'Helpful + sorted by price' },
];

const AI_RESPONSES = [
  { examples: 0, text: '"We have various baked goods available for purchase."', quality: 'Generic', color: '#ef4444' },
  { examples: 1, text: '"Yes! We have several options. Would you like to hear about them?"', quality: 'Better', color: '#fbbf24' },
  { examples: 2, text: '"Absolutely! Our Chocolate Croissant ($4.50) is amazing today. Want to try one?"', quality: 'Good', color: '#60a5fa' },
  { examples: 3, text: '"Of course! Our fresh Sourdough Loaf ($6.00) just came out of the oven, and our Blueberry Muffins ($3.00) are a customer favorite. Shall I set one aside for you?"', quality: 'Excellent', color: '#4ade80' },
];

export function S11_FewShot({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<Phase>('intro');
  const [addedExamples, setAddedExamples] = useState<string[]>([]);

  const response = AI_RESPONSES[addedExamples.length];

  const handleAddExample = (id: string) => {
    if (addedExamples.includes(id)) return;
    const next = [...addedExamples, id];
    setAddedExamples(next);
    if (next.length >= 3) {
      setTimeout(() => setPhase('done'), 600);
    }
  };

  return (
    <div style={containerStyle}>
      {phase === 'intro' && (
        <div style={centerCol}>
          <div style={{ fontSize: 28 }}>{'\uD83C\uDFAF'}</div>
          <h2 style={headingStyle}>Show Don't Tell</h2>
          <p style={descStyle}>
            Writing rules for how the AI should respond is hard. What tone? What format?
            What details to include?
          </p>
          <p style={conceptStyle}>
            <strong>Few-Shot Learning</strong>: instead of writing rules, show the AI
            2-3 <strong>examples</strong> of ideal responses. It learns the pattern instantly.
          </p>
          <button onClick={() => setPhase('build')} style={btnStyle}>
            Try it {'\u2192'}
          </button>
        </div>
      )}

      {(phase === 'build' || phase === 'done') && (
        <>
          {/* AI response preview */}
          <div style={{
            background: '#0f0f23', border: `1.5px solid ${response.color}44`,
            borderRadius: 10, padding: 14, width: '100%',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: '#6b7280' }}>{'\uD83E\uDD16'} AI response to: "What do you recommend?"</span>
              <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 8, background: `${response.color}22`, color: response.color, fontWeight: 'bold' }}>
                {response.quality}
              </span>
            </div>
            <div style={{ fontSize: 13, color: '#e0e0e0', lineHeight: 1.7 }}>
              {response.text}
            </div>
          </div>

          {/* Examples tray */}
          <div style={{
            background: '#1a1a2e', border: '1.5px solid #fbbf2444', borderRadius: 10,
            padding: 14, width: '100%',
          }}>
            <div style={{ fontSize: 11, color: '#fbbf24', marginBottom: 8, fontWeight: 'bold' }}>
              {'\uD83D\uDCDA'} Examples Tray ({addedExamples.length}/3):
            </div>

            {EXAMPLES.map((ex) => {
              const added = addedExamples.includes(ex.id);
              return (
                <div key={ex.id} onClick={() => !added && handleAddExample(ex.id)} style={{
                  padding: '8px 10px', marginBottom: 6,
                  background: added ? '#fbbf2415' : '#0f0f23',
                  border: `1px solid ${added ? '#fbbf2444' : '#2d2d5e'}`,
                  borderRadius: 6,
                  cursor: added ? 'default' : 'pointer',
                  opacity: added ? 0.7 : 1,
                }}>
                  <div style={{ fontSize: 11, color: '#9ca3af' }}>
                    {'\uD83D\uDC64'} {ex.input}
                  </div>
                  <div style={{ fontSize: 11, color: '#e0e0e0', marginTop: 2 }}>
                    {'\uD83E\uDD16'} {ex.output}
                  </div>
                  <div style={{ fontSize: 10, color: '#fbbf24', marginTop: 2, fontStyle: 'italic' }}>
                    Pattern: {ex.label} {added && '\u2705'}
                  </div>
                  {!added && (
                    <div style={{ fontSize: 10, color: '#60a5fa', marginTop: 2 }}>Click to add example</div>
                  )}
                </div>
              );
            })}
          </div>

          {phase === 'done' && (
            <div style={resultBox}>
              <div style={{ fontSize: 13, color: '#e0e0e0', lineHeight: 1.7 }}>
                {'\u2705'} With just 3 examples, the AI learned to be friendly, include prices,
                and make recommendations — no complex rules needed!
              </div>
              <button onClick={onComplete} style={{ ...btnStyle, marginTop: 12 }}>
                Continue {'\u2192'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

const containerStyle: React.CSSProperties = { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '16px 24px', overflow: 'auto', maxWidth: 600, margin: '0 auto', width: '100%' };
const centerCol: React.CSSProperties = { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, textAlign: 'center', marginTop: 12 };
const headingStyle: React.CSSProperties = { fontSize: 20, fontWeight: 'bold', margin: 0, color: '#e0e0e0' };
const descStyle: React.CSSProperties = { fontSize: 13, color: '#9ca3af', lineHeight: 1.7, maxWidth: 460 };
const conceptStyle: React.CSSProperties = { fontSize: 13, color: '#7b68ee', lineHeight: 1.7, maxWidth: 460 };
const btnStyle: React.CSSProperties = { padding: '12px 28px', background: '#7b68ee33', border: '2px solid #7b68ee', borderRadius: 8, color: '#e0e0e0', fontFamily: 'monospace', fontWeight: 'bold', fontSize: 14, cursor: 'pointer' };
const resultBox: React.CSSProperties = { background: '#4ade8010', border: '1px solid #4ade8033', borderRadius: 10, padding: 16, width: '100%', textAlign: 'center' };
