import { useState } from 'react';

type Phase = 'intro' | 'search' | 'result' | 'done';

const ALL_RECIPES = [
  { id: 'r1', name: 'Chocolate Lava Cake', tags: ['chocolate', 'dessert'], relevant: false },
  { id: 'r2', name: 'Blueberry Muffins', tags: ['fruit', 'breakfast'], relevant: true },
  { id: 'r3', name: 'Sourdough Bread', tags: ['bread', 'classic'], relevant: false },
  { id: 'r4', name: 'Strawberry Tart', tags: ['fruit', 'dessert'], relevant: true },
  { id: 'r5', name: 'Banana Bread', tags: ['fruit', 'bread'], relevant: true },
];

export function S7_RAG({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<Phase>('intro');
  const [searchActive, setSearchActive] = useState(false);
  const [filtered, setFiltered] = useState<string[]>([]);

  const handleSearch = () => {
    setSearchActive(true);
    setTimeout(() => {
      setFiltered(ALL_RECIPES.filter((r) => r.relevant).map((r) => r.id));
      setTimeout(() => setPhase('result'), 600);
    }, 800);
  };

  return (
    <div style={containerStyle}>
      {phase === 'intro' && (
        <div style={centerCol}>
          <div style={{ fontSize: 28 }}>{'\uD83D\uDDC4\uFE0F'}</div>
          <h2 style={headingStyle}>The Overflow</h2>
          <p style={descStyle}>
            The bakery now has <strong style={{ color: '#ef4444' }}>hundreds of recipes</strong> in
            its database. Sending them ALL to the AI every time wastes tokens and confuses it.
          </p>
          <p style={conceptStyle}>
            <strong>RAG</strong> (Retrieval-Augmented Generation) means <strong>searching first</strong>,
            then only sending relevant results to the AI.
          </p>
          <button onClick={() => setPhase('search')} style={btnStyle}>
            See the problem {'\u2192'}
          </button>
        </div>
      )}

      {(phase === 'search' || phase === 'result') && (
        <>
          <div style={{ fontSize: 12, color: '#6b7280', textAlign: 'center', marginBottom: 8 }}>
            {'\uD83D\uDC64'} Customer asks: "What fruit pastries do you have?"
          </div>

          <div style={{ display: 'flex', gap: 16, width: '100%', alignItems: 'flex-start' }}>
            {/* Recipe cabinet */}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 6, fontWeight: 'bold' }}>
                {'\uD83D\uDDC4\uFE0F'} Recipe Cabinet ({ALL_RECIPES.length} recipes):
              </div>
              {ALL_RECIPES.map((r) => {
                const isRelevant = filtered.includes(r.id);
                const dimmed = searchActive && !isRelevant;
                return (
                  <div key={r.id} style={{
                    padding: '8px 10px', marginBottom: 4,
                    background: isRelevant ? '#4ade8018' : '#1e2030',
                    border: `1px solid ${isRelevant ? '#4ade8055' : dimmed ? '#1e203066' : '#2d2d5e'}`,
                    borderRadius: 6, fontSize: 12, color: dimmed ? '#374151' : '#e0e0e0',
                    transition: 'all 0.4s',
                    opacity: dimmed ? 0.4 : 1,
                  }}>
                    {isRelevant && '\u2705 '}{r.name}
                    <span style={{ fontSize: 10, color: '#6b7280', marginLeft: 6 }}>
                      [{r.tags.join(', ')}]
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Search funnel */}
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', minWidth: 100, gap: 8,
            }}>
              <div style={{
                fontSize: 32,
                opacity: searchActive ? 1 : 0.3,
                transition: 'all 0.3s',
                cursor: phase === 'search' && !searchActive ? 'pointer' : 'default',
              }}
                onClick={() => phase === 'search' && !searchActive && handleSearch()}
              >
                {'\uD83D\uDD0D'}
              </div>
              {phase === 'search' && !searchActive && (
                <button onClick={handleSearch} style={{ ...btnSmall, background: '#34d39922', borderColor: '#34d399', color: '#34d399' }}>
                  Search: "fruit"
                </button>
              )}
              {searchActive && (
                <div style={{ fontSize: 10, color: '#34d399', textAlign: 'center' }}>
                  Filtering...{'\n'}3 of 5 match
                </div>
              )}
            </div>
          </div>

          {phase === 'result' && (
            <div style={resultBox}>
              <div style={{ fontSize: 12, color: '#4ade80', marginBottom: 6 }}>{'\uD83E\uDD16'} AI (with RAG):</div>
              <div style={{ fontSize: 13, color: '#e0e0e0', lineHeight: 1.7 }}>
                "We have three fruit pastries: Blueberry Muffins, Strawberry Tart, and Banana Bread!"
              </div>
              <div style={{ fontSize: 11, color: '#34d399', marginTop: 8 }}>
                {'\u2705'} Only 3 relevant recipes were sent to the AI — not all 5.
                Faster, cheaper, and more accurate!
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

const containerStyle: React.CSSProperties = {
  flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
  gap: 16, padding: '16px 24px', overflow: 'auto', maxWidth: 600, margin: '0 auto', width: '100%',
};
const centerCol: React.CSSProperties = { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, textAlign: 'center', marginTop: 12 };
const headingStyle: React.CSSProperties = { fontSize: 20, fontWeight: 'bold', margin: 0, color: '#e0e0e0' };
const descStyle: React.CSSProperties = { fontSize: 13, color: '#9ca3af', lineHeight: 1.7, maxWidth: 460 };
const conceptStyle: React.CSSProperties = { fontSize: 13, color: '#7b68ee', lineHeight: 1.7, maxWidth: 460 };
const btnStyle: React.CSSProperties = { padding: '12px 28px', background: '#7b68ee33', border: '2px solid #7b68ee', borderRadius: 8, color: '#e0e0e0', fontFamily: 'monospace', fontWeight: 'bold', fontSize: 14, cursor: 'pointer' };
const btnSmall: React.CSSProperties = { padding: '6px 12px', background: '#7b68ee22', border: '1px solid #7b68ee', borderRadius: 6, color: '#e0e0e0', fontFamily: 'monospace', fontSize: 11, cursor: 'pointer' };
const resultBox: React.CSSProperties = { background: '#4ade8010', border: '1px solid #4ade8033', borderRadius: 10, padding: 16, width: '100%', textAlign: 'center' };
