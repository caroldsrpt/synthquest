import { useState } from 'react';

const MENU_ITEMS = [
  { id: 'muffin', name: 'Blueberry Muffin', price: '$3.00' },
  { id: 'croissant', name: 'Chocolate Croissant', price: '$4.50' },
  { id: 'sourdough', name: 'Sourdough Loaf', price: '$6.00' },
  { id: 'cookie', name: 'Oat Cookie', price: '$2.00' },
];

type Phase = 'intro' | 'build' | 'test' | 'done';

export function S4_Grounding({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<Phase>('intro');
  const [dbItems, setDbItems] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);

  const handleAddItem = (id: string) => {
    if (dbItems.includes(id)) return;
    const next = [...dbItems, id];
    setDbItems(next);
    if (next.length >= 3) {
      setTimeout(() => setPhase('test'), 500);
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, padding: 32, maxWidth: 600, margin: '0 auto', width: '100%' }}>

      {/* PHASE: Intro */}
      {phase === 'intro' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, textAlign: 'center' }}>
          <div style={{ fontSize: 28, marginBottom: 4 }}>{'\uD83D\uDDC4\uFE0F'}</div>
          <h2 style={{ fontSize: 20, fontWeight: 'bold', margin: 0, color: '#e0e0e0' }}>
            The Filing Cabinet
          </h2>
          <p style={{ fontSize: 14, color: '#9ca3af', lineHeight: 1.7, maxWidth: 460 }}>
            In the last lesson, the AI made up a brownie that doesn't exist.
            That's called a <strong style={{ color: '#ef4444' }}>hallucination</strong> —
            the AI confidently says something false.
          </p>
          <p style={{ fontSize: 13, color: '#7b68ee', lineHeight: 1.7, maxWidth: 460 }}>
            The fix? Give the AI <strong>real data</strong> to check against.
            This is called <strong>grounding</strong> — like giving someone a filing cabinet
            full of facts instead of asking them to guess.
          </p>
          <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.7, maxWidth: 460 }}>
            Real AI apps like <strong style={{ color: '#a78bfa' }}>ChatGPT plugins</strong> and{' '}
            <strong style={{ color: '#a78bfa' }}>Google's Gemini</strong> do this — they connect
            to databases, documents, and APIs so the AI answers from facts, not imagination.
          </p>
          <button onClick={() => setPhase('build')} style={btnStyle}>
            Build our database {'\u2192'}
          </button>
        </div>
      )}

      {/* PHASE: Build database */}
      {(phase === 'build' || phase === 'test' || phase === 'done') && (
        <>
          {/* Customer */}
          <div style={bubbleStyle}>
            <span style={{ fontSize: 11, color: '#6b7280', display: 'block', marginBottom: 4 }}>{'\uD83D\uDC64'} Customer:</span>
            "Do you have any gluten-free options?"
          </div>

          {phase === 'build' && (
            <p style={{ fontSize: 12, color: '#60a5fa', textAlign: 'center' }}>
              {'\uD83D\uDC47'} Click at least 3 menu items to add them to the database
            </p>
          )}

          <div style={{ display: 'flex', gap: 20, width: '100%', alignItems: 'flex-start' }}>
            {/* Menu items */}
            <div style={{ width: 200 }}>
              <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8, fontWeight: 'bold' }}>
                {'\uD83C\uDF70'} Bakery Menu:
              </div>
              {MENU_ITEMS.map((item) => {
                const inDb = dbItems.includes(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => !inDb && phase === 'build' && handleAddItem(item.id)}
                    style={{
                      padding: '10px 12px', marginBottom: 6,
                      background: inDb ? '#4ade8011' : '#1e2030',
                      border: `1px solid ${inDb ? '#4ade8044' : '#60a5fa44'}`,
                      borderRadius: 6,
                      cursor: inDb || phase !== 'build' ? 'default' : 'pointer',
                      opacity: inDb ? 0.5 : 1,
                      fontSize: 13, color: '#e0e0e0',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ fontWeight: 'bold' }}>{item.name}</div>
                    <div style={{ fontSize: 11, color: '#6b7280' }}>{item.price}</div>
                    {!inDb && phase === 'build' && (
                      <div style={{ fontSize: 10, color: '#60a5fa', marginTop: 2 }}>
                        Click to add {'\u2192'}
                      </div>
                    )}
                    {inDb && (
                      <div style={{ fontSize: 10, color: '#4ade80', marginTop: 2 }}>
                        {'\u2705'} In database
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Database box */}
            <div style={{
              flex: 1, minHeight: 160,
              background: '#0f0f23',
              border: `2px solid ${phase !== 'build' ? '#4ade80' : '#60a5fa44'}`,
              borderRadius: 12, padding: 16,
              transition: 'border-color 0.5s',
            }}>
              <div style={{ fontSize: 12, color: phase !== 'build' ? '#4ade80' : '#60a5fa', marginBottom: 8, fontWeight: 'bold' }}>
                {'\uD83D\uDDC4\uFE0F'} Menu Database {phase !== 'build' ? '\u2705' : ''}
              </div>
              {dbItems.length === 0 && (
                <div style={{ color: '#374151', fontSize: 12, fontStyle: 'italic' }}>
                  Empty — add menu items from the left
                </div>
              )}
              {dbItems.map((id) => {
                const item = MENU_ITEMS.find((m) => m.id === id)!;
                return (
                  <div key={id} style={{
                    padding: '6px 10px', marginBottom: 4,
                    background: '#1a1a2e', borderRadius: 4,
                    fontSize: 12, color: '#60a5fa',
                    animation: 'fadeIn 0.3s',
                  }}>
                    {item.name} — {item.price}
                  </div>
                );
              })}

              {phase === 'test' && !showResult && (
                <div style={{ marginTop: 16, textAlign: 'center' }}>
                  <div style={{ fontSize: 12, color: '#4ade80', marginBottom: 8 }}>
                    {'\uD83D\uDD0C'} Database connected to AI!
                  </div>
                  <button onClick={() => { setShowResult(true); setPhase('done'); }} style={{
                    ...btnStyle, padding: '8px 20px', fontSize: 12,
                  }}>
                    Ask the same question again
                  </button>
                </div>
              )}

              {showResult && (
                <div style={{
                  marginTop: 12, padding: '12px 14px',
                  background: '#4ade8015', border: '1px solid #4ade8033', borderRadius: 8,
                }}>
                  <div style={{ fontSize: 12, color: '#4ade80', marginBottom: 6 }}>{'\uD83E\uDD16'} AI (grounded):</div>
                  <div style={{ fontSize: 14, color: '#e0e0e0', lineHeight: 1.7 }}>
                    "Looking at our menu... I don't see any gluten-free options currently available.
                    Our items are: {dbItems.map((id) => MENU_ITEMS.find((m) => m.id === id)?.name).join(', ')}.
                    Would you like me to suggest something else?"
                  </div>
                  <div style={{ fontSize: 12, color: '#4ade80', marginTop: 10, lineHeight: 1.6 }}>
                    {'\u2705'} Honest answer based on real data — no hallucination!
                    The AI checked the database instead of guessing.
                  </div>
                </div>
              )}
            </div>
          </div>

          {phase === 'done' && showResult && (
            <button onClick={onComplete} style={btnStyle}>
              Continue {'\u2192'}
            </button>
          )}
        </>
      )}

      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }`}</style>
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
