import { useState } from 'react';

type Phase = 'intro' | 'standardize' | 'done';

const SYSTEMS = [
  { id: 'inventory', name: 'Inventory', icon: '\uD83D\uDCE6', cable: 'Custom REST v2.1' },
  { id: 'orders', name: 'Orders', icon: '\uD83D\uDCCB', cable: 'SOAP XML' },
  { id: 'payments', name: 'Payments', icon: '\uD83D\uDCB3', cable: 'GraphQL' },
  { id: 'recipes', name: 'Recipes', icon: '\uD83D\uDCD6', cable: 'Custom WebSocket' },
];

const BONUS_SYSTEM = { id: 'reviews', name: 'Reviews', icon: '\u2B50', cable: 'auto-detected' };

export function S12_MCP({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<Phase>('intro');
  const [standardized, setStandardized] = useState<string[]>([]);
  const [showBonus, setShowBonus] = useState(false);

  const handleStandardize = (id: string) => {
    if (standardized.includes(id)) return;
    const next = [...standardized, id];
    setStandardized(next);
    if (next.length >= 4) {
      setTimeout(() => {
        setShowBonus(true);
        setTimeout(() => setPhase('done'), 800);
      }, 400);
    }
  };

  return (
    <div style={containerStyle}>
      {phase === 'intro' && (
        <div style={centerCol}>
          <div style={{ fontSize: 28 }}>{'\uD83D\uDD0C'}</div>
          <h2 style={headingStyle}>The Universal Plug</h2>
          <p style={descStyle}>
            The bakery AI is connected to 4 systems, each with a
            <strong style={{ color: '#ef4444' }}> different connector type</strong>.
            Every new system needs custom code. What a mess!
          </p>
          <p style={conceptStyle}>
            <strong>MCP</strong> (Model Context Protocol) is like USB for AI —
            one universal standard that replaces all the custom connectors.
          </p>
          <button onClick={() => setPhase('standardize')} style={btnStyle}>
            Standardize the connections {'\u2192'}
          </button>
        </div>
      )}

      {(phase === 'standardize' || phase === 'done') && (
        <>
          <div style={{ fontSize: 12, color: '#6b7280', textAlign: 'center' }}>
            Click each system to replace its custom cable with MCP.
          </div>

          {/* AI in center, systems around it */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, width: '100%', justifyContent: 'center' }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: '#7b68ee22', border: '2px solid #7b68ee',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexDirection: 'column', fontSize: 10, color: '#7b68ee', fontWeight: 'bold',
            }}>
              <span style={{ fontSize: 20 }}>{'\uD83E\uDDE0'}</span>
              AI
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {SYSTEMS.map((s) => {
                const isStd = standardized.includes(s.id);
                return (
                  <div key={s.id} onClick={() => !isStd && handleStandardize(s.id)} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    cursor: isStd ? 'default' : 'pointer',
                  }}>
                    {/* Cable */}
                    <div style={{
                      width: 60, height: 3, borderRadius: 2,
                      background: isStd ? '#4ade80' : '#ef4444',
                      transition: 'background 0.3s',
                    }} />
                    <div style={{
                      padding: '6px 10px', borderRadius: 6, minWidth: 160,
                      background: isStd ? '#4ade8015' : '#1e2030',
                      border: `1px solid ${isStd ? '#4ade80' : '#ef444466'}`,
                      fontSize: 11, color: '#e0e0e0',
                      transition: 'all 0.3s',
                    }}>
                      {s.icon} {s.name}
                      <span style={{
                        fontSize: 9, marginLeft: 6,
                        color: isStd ? '#4ade80' : '#ef4444',
                      }}>
                        {isStd ? 'MCP \u2705' : s.cable}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Bonus system */}
              {showBonus && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  animation: 'fadeIn 0.5s',
                }}>
                  <div style={{ width: 60, height: 3, borderRadius: 2, background: '#4ade80' }} />
                  <div style={{
                    padding: '6px 10px', borderRadius: 6, minWidth: 160,
                    background: '#4ade8015', border: '1px solid #4ade80',
                    fontSize: 11, color: '#e0e0e0',
                  }}>
                    {BONUS_SYSTEM.icon} {BONUS_SYSTEM.name}
                    <span style={{ fontSize: 9, marginLeft: 6, color: '#4ade80' }}>
                      MCP \u2705 (auto!)
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {phase === 'done' && (
            <div style={resultBox}>
              <div style={{ fontSize: 13, color: '#e0e0e0', lineHeight: 1.7, marginBottom: 8 }}>
                {'\u2705'} All systems now use MCP! And the 5th system ({BONUS_SYSTEM.name})
                connected <strong style={{ color: '#4ade80' }}>automatically</strong> — because
                MCP is a standard, new tools just plug right in.
              </div>
              <div style={{ fontSize: 11, color: '#6b7280' }}>
                Before: 4 custom integrations. After: 1 universal protocol.
              </div>
              <button onClick={onComplete} style={{ ...btnStyle, marginTop: 12 }}>
                Continue {'\u2192'}
              </button>
            </div>
          )}
        </>
      )}

      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }`}</style>
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
