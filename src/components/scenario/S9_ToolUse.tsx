import { useState } from 'react';

type Phase = 'intro' | 'manual' | 'auto' | 'done';

const REQUESTS = [
  { id: 'r1', text: '"How many croissants are left?"', correctTool: 'inventory', icon: '\uD83D\uDCE6' },
  { id: 'r2', text: '"Find me a muffin recipe"', correctTool: 'search', icon: '\uD83D\uDD0D' },
  { id: 'r3', text: '"Place order for 12 cookies"', correctTool: 'orders', icon: '\uD83D\uDCCB' },
];

const TOOLS = [
  { id: 'inventory', name: 'Inventory Check', icon: '\uD83D\uDCE6' },
  { id: 'search', name: 'Recipe Search', icon: '\uD83D\uDD0D' },
  { id: 'orders', name: 'Order System', icon: '\uD83D\uDCCB' },
];

export function S9_ToolUse({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<Phase>('intro');
  const [matches, setMatches] = useState<Record<string, string>>({});
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [autoStep, setAutoStep] = useState(0);

  const allMatched = REQUESTS.every((r) => matches[r.id] === r.correctTool);
  const matchCount = REQUESTS.filter((r) => matches[r.id] === r.correctTool).length;

  const handleToolClick = (toolId: string) => {
    if (!selectedRequest) return;
    const req = REQUESTS.find((r) => r.id === selectedRequest);
    if (req && toolId === req.correctTool) {
      setMatches((prev) => ({ ...prev, [selectedRequest]: toolId }));
    }
    setSelectedRequest(null);
  };

  const handleAutoMode = () => {
    setPhase('auto');
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setAutoStep(step);
      if (step >= 3) {
        clearInterval(interval);
        setTimeout(() => setPhase('done'), 600);
      }
    }, 900);
  };

  return (
    <div style={containerStyle}>
      {phase === 'intro' && (
        <div style={centerCol}>
          <div style={{ fontSize: 28 }}>{'\uD83D\uDEE4\uFE0F'}</div>
          <h2 style={headingStyle}>The Smart Router</h2>
          <p style={descStyle}>
            The AI is connected to multiple tools now. But who decides
            <strong style={{ color: '#fbbf24' }}> which tool to use </strong>for each request?
          </p>
          <p style={conceptStyle}>
            <strong>Tool Use</strong> means the AI reads the request and automatically
            picks the right tool — like a smart assistant who knows when to use a calculator vs a search engine.
          </p>
          <button onClick={() => setPhase('manual')} style={btnStyle}>
            Try routing manually {'\u2192'}
          </button>
        </div>
      )}

      {phase === 'manual' && (
        <>
          <div style={{ fontSize: 12, color: '#6b7280', textAlign: 'center' }}>
            Click a request, then click the correct tool to match them. ({matchCount}/3)
          </div>

          <div style={{ display: 'flex', gap: 20, width: '100%' }}>
            {/* Requests */}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: '#fbbf24', marginBottom: 6, fontWeight: 'bold' }}>
                Customer Requests:
              </div>
              {REQUESTS.map((r) => {
                const matched = matches[r.id] === r.correctTool;
                const selected = selectedRequest === r.id;
                return (
                  <div key={r.id} onClick={() => !matched && setSelectedRequest(r.id)} style={{
                    padding: '8px 10px', marginBottom: 6,
                    background: matched ? '#4ade8015' : selected ? '#fbbf2422' : '#1e2030',
                    border: `1.5px solid ${matched ? '#4ade80' : selected ? '#fbbf24' : '#2d2d5e'}`,
                    borderRadius: 6, fontSize: 12, color: matched ? '#4ade80' : '#e0e0e0',
                    cursor: matched ? 'default' : 'pointer',
                  }}>
                    {r.icon} {r.text} {matched && '\u2705'}
                  </div>
                );
              })}
            </div>

            {/* Tools */}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: '#60a5fa', marginBottom: 6, fontWeight: 'bold' }}>
                Available Tools:
              </div>
              {TOOLS.map((t) => (
                <div key={t.id} onClick={() => handleToolClick(t.id)} style={{
                  padding: '8px 10px', marginBottom: 6,
                  background: '#1e2030',
                  border: `1.5px solid ${selectedRequest ? '#60a5fa' : '#2d2d5e'}`,
                  borderRadius: 6, fontSize: 12, color: '#e0e0e0',
                  cursor: selectedRequest ? 'pointer' : 'default',
                }}>
                  {t.icon} {t.name}
                </div>
              ))}
            </div>
          </div>

          {allMatched && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 12, color: '#4ade80', marginBottom: 8 }}>
                {'\u2705'} All correctly matched! But doing this manually is tedious...
              </div>
              <button onClick={handleAutoMode} style={{ ...btnStyle, background: '#fbbf2422', borderColor: '#fbbf24', color: '#fbbf24' }}>
                Toggle "Let AI Choose" {'\u2192'}
              </button>
            </div>
          )}
        </>
      )}

      {(phase === 'auto' || phase === 'done') && (
        <>
          <div style={{
            padding: '8px 16px', background: '#fbbf2422', border: '1px solid #fbbf24',
            borderRadius: 6, fontSize: 12, color: '#fbbf24', fontWeight: 'bold',
          }}>
            {'\u26A1'} AI Auto-Routing: ON
          </div>
          {REQUESTS.map((r, i) => (
            <div key={r.id} style={{
              display: 'flex', alignItems: 'center', gap: 10, width: '100%',
              opacity: autoStep > i ? 1 : 0.3, transition: 'opacity 0.4s',
            }}>
              <div style={{ flex: 1, fontSize: 12, color: '#e0e0e0' }}>{r.icon} {r.text}</div>
              <div style={{ fontSize: 11, color: '#fbbf24' }}>{'\u2192'}</div>
              <div style={{ fontSize: 12, color: '#60a5fa' }}>
                {TOOLS.find((t) => t.id === r.correctTool)?.icon} {TOOLS.find((t) => t.id === r.correctTool)?.name}
              </div>
              {autoStep > i && <span style={{ color: '#4ade80', fontSize: 12 }}>{'\u2705'}</span>}
            </div>
          ))}

          {phase === 'done' && (
            <div style={resultBox}>
              <div style={{ fontSize: 13, color: '#e0e0e0', lineHeight: 1.7 }}>
                The AI analyzed each request and automatically chose the right tool.
                No human routing needed!
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
