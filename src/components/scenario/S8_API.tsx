import { useState } from 'react';

type Phase = 'intro' | 'connect' | 'result';

const SERVICES = [
  { id: 'orders', name: 'Order System', icon: '\uD83D\uDCCB', desc: 'Track customer orders' },
  { id: 'inventory', name: 'Inventory', icon: '\uD83D\uDCE6', desc: 'Check stock levels' },
  { id: 'payments', name: 'Payments', icon: '\uD83D\uDCB3', desc: 'Process transactions' },
];

export function S8_API({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<Phase>('intro');
  const [connected, setConnected] = useState<string[]>([]);
  const [showAnswer, setShowAnswer] = useState(false);

  const handleConnect = (id: string) => {
    if (connected.includes(id)) return;
    const next = [...connected, id];
    setConnected(next);
    if (next.length >= 3) {
      setTimeout(() => setPhase('result'), 500);
    }
  };

  return (
    <div style={containerStyle}>
      {phase === 'intro' && (
        <div style={centerCol}>
          <div style={{ fontSize: 28 }}>{'\uD83C\uDFE2'}</div>
          <h2 style={headingStyle}>The Other Building</h2>
          <p style={descStyle}>
            The AI can answer questions, but it can't <strong style={{ color: '#f472b6' }}>do anything</strong> in
            the real world yet. It needs to connect to the bakery's actual systems.
          </p>
          <p style={conceptStyle}>
            An <strong>API</strong> (Application Programming Interface) is like a messenger between two programs.
            One sends a REQUEST, the other sends back a RESPONSE.
          </p>
          <button onClick={() => setPhase('connect')} style={btnStyle}>
            Connect the systems {'\u2192'}
          </button>
        </div>
      )}

      {(phase === 'connect' || phase === 'result') && (
        <>
          <div style={{ fontSize: 12, color: '#6b7280', textAlign: 'center' }}>
            Click each service to connect it to the AI via an API cable.
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 24, width: '100%', justifyContent: 'center' }}>
            {/* AI Brain */}
            <div style={{
              width: 90, height: 90, borderRadius: '50%',
              background: '#7b68ee22', border: '2px solid #7b68ee',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexDirection: 'column', fontSize: 10, color: '#7b68ee', fontWeight: 'bold',
            }}>
              <span style={{ fontSize: 24 }}>{'\uD83E\uDDE0'}</span>
              AI
            </div>

            {/* Cables area */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {SERVICES.map((s) => {
                const isConn = connected.includes(s.id);
                return (
                  <div key={s.id} style={{
                    width: 80, height: 3,
                    background: isConn ? '#4ade80' : '#374151',
                    borderRadius: 2,
                    transition: 'background 0.3s',
                    boxShadow: isConn ? '0 0 6px #4ade8066' : 'none',
                  }} />
                );
              })}
            </div>

            {/* Services */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {SERVICES.map((s) => {
                const isConn = connected.includes(s.id);
                return (
                  <div key={s.id} onClick={() => phase === 'connect' && handleConnect(s.id)} style={{
                    padding: '10px 14px',
                    background: isConn ? '#4ade8015' : '#1e2030',
                    border: `1.5px solid ${isConn ? '#4ade80' : '#60a5fa55'}`,
                    borderRadius: 8, cursor: phase === 'connect' && !isConn ? 'pointer' : 'default',
                    transition: 'all 0.3s',
                    minWidth: 140,
                  }}>
                    <div style={{ fontSize: 13, color: '#e0e0e0' }}>
                      {s.icon} {s.name} {isConn && '\u2705'}
                    </div>
                    <div style={{ fontSize: 10, color: '#6b7280' }}>{s.desc}</div>
                    {!isConn && phase === 'connect' && (
                      <div style={{ fontSize: 10, color: '#60a5fa', marginTop: 2 }}>Click to connect</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {phase === 'result' && !showAnswer && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 12, color: '#4ade80', marginBottom: 8 }}>
                {'\uD83D\uDD0C'} All 3 APIs connected!
              </div>
              <button onClick={() => setShowAnswer(true)} style={btnStyle}>
                Ask the AI to check an order
              </button>
            </div>
          )}

          {showAnswer && (
            <div style={resultBox}>
              <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>{'\uD83D\uDC64'} "Is order #142 ready?"</div>
              <div style={{ fontSize: 10, color: '#60a5fa', margin: '4px 0' }}>
                {'\u2192'} AI sends REQUEST to Order System API...{'\n'}
                {'\u2190'} API sends RESPONSE: Order #142 — 2x Muffins, Status: Baking
              </div>
              <div style={{ fontSize: 13, color: '#e0e0e0', marginTop: 8, lineHeight: 1.6 }}>
                {'\uD83E\uDD16'} "Order #142 (2 Blueberry Muffins) is still baking. It should be ready in about 10 minutes!"
              </div>
              <div style={{ fontSize: 11, color: '#4ade80', marginTop: 8 }}>
                {'\u2705'} The AI didn't guess — it asked the real system via API!
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
