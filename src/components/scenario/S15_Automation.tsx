import { useState, useEffect } from 'react';

type Phase = 'intro' | 'build' | 'running' | 'done';

const BLOCKS = [
  { id: 'trigger', name: 'New Order', icon: '\uD83D\uDCE8', type: 'trigger', color: '#fbbf24' },
  { id: 'action1', name: 'Check Inventory', icon: '\uD83D\uDCE6', type: 'action', color: '#60a5fa' },
  { id: 'action2', name: 'Prep Instructions', icon: '\uD83D\uDCDD', type: 'action', color: '#60a5fa' },
  { id: 'action3', name: 'Notify Baker', icon: '\uD83D\uDC69\u200D\uD83C\uDF73', type: 'action', color: '#60a5fa' },
];

export function S15_Automation({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<Phase>('intro');
  const [connected, setConnected] = useState<string[]>(['trigger']);
  const [runStep, setRunStep] = useState(-1);

  const allConnected = connected.length >= BLOCKS.length;

  const handleConnect = (id: string) => {
    if (connected.includes(id)) return;
    // Must connect in order
    const blockIndex = BLOCKS.findIndex((b) => b.id === id);
    if (blockIndex === connected.length) {
      setConnected([...connected, id]);
    }
  };

  const handleActivate = () => {
    setPhase('running');
    setRunStep(0);
  };

  useEffect(() => {
    if (phase !== 'running') return;
    if (runStep >= BLOCKS.length) {
      setPhase('done');
      return;
    }
    const timer = setTimeout(() => setRunStep((s) => s + 1), 800);
    return () => clearTimeout(timer);
  }, [phase, runStep]);

  return (
    <div style={containerStyle}>
      {phase === 'intro' && (
        <div style={centerCol}>
          <div style={{ fontSize: 28 }}>{'\u2699\uFE0F'}</div>
          <h2 style={headingStyle}>The Morning Routine</h2>
          <p style={descStyle}>
            Every morning, someone has to manually check new orders, look up inventory,
            write prep instructions, and notify the baker. <strong style={{ color: '#ef4444' }}>Every. Single. Day.</strong>
          </p>
          <p style={conceptStyle}>
            <strong>Automation</strong> means building a workflow once and letting it run
            automatically. A trigger fires, and the steps execute without human intervention.
          </p>
          <button onClick={() => setPhase('build')} style={btnStyle}>
            Build the workflow {'\u2192'}
          </button>
        </div>
      )}

      {(phase === 'build' || phase === 'running' || phase === 'done') && (
        <>
          {phase === 'build' && (
            <div style={{ fontSize: 12, color: '#6b7280', textAlign: 'center' }}>
              Click blocks in order to connect them into a workflow chain.
            </div>
          )}

          {/* Workflow chain */}
          <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
            {BLOCKS.map((b, i) => {
              const isConnected = connected.includes(b.id);
              const isRunning = phase === 'running' && runStep === i;
              const isComplete = phase === 'running' ? runStep > i : phase === 'done';

              return (
                <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div onClick={() => phase === 'build' && handleConnect(b.id)} style={{
                    padding: '10px 12px', borderRadius: 8, minWidth: 90, textAlign: 'center',
                    background: isRunning ? `${b.color}33` : isComplete ? '#4ade8015' : isConnected ? `${b.color}15` : '#0f0f23',
                    border: `2px solid ${isRunning ? b.color : isComplete ? '#4ade80' : isConnected ? `${b.color}66` : '#374151'}`,
                    cursor: phase === 'build' && !isConnected ? 'pointer' : 'default',
                    opacity: isConnected || isComplete ? 1 : 0.4,
                    transition: 'all 0.3s',
                    boxShadow: isRunning ? `0 0 12px ${b.color}44` : 'none',
                  }}>
                    <div style={{ fontSize: 18 }}>{b.icon}</div>
                    <div style={{ fontSize: 9, color: isComplete ? '#4ade80' : b.color, fontWeight: 'bold', marginTop: 2 }}>
                      {b.name}
                    </div>
                    {isComplete && <div style={{ fontSize: 9, color: '#4ade80' }}>{'\u2713'}</div>}
                  </div>
                  {i < BLOCKS.length - 1 && (
                    <div style={{
                      color: isConnected && connected.includes(BLOCKS[i + 1]?.id) ? '#4b5563' : '#1e2030',
                      fontSize: 14, transition: 'color 0.3s',
                    }}>
                      {'\u2192'}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {phase === 'build' && allConnected && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 12, color: '#4ade80', marginBottom: 8 }}>
                {'\u2705'} Workflow connected! Ready to activate.
              </div>
              <button onClick={handleActivate} style={{ ...btnStyle, background: '#fbbf2422', borderColor: '#fbbf24', color: '#fbbf24' }}>
                {'\u26A1'} Activate Workflow
              </button>
            </div>
          )}

          {phase === 'running' && runStep < BLOCKS.length && (
            <div style={{ fontSize: 12, color: '#fbbf24', textAlign: 'center' }}>
              {'\u26A1'} Running step {runStep + 1}/{BLOCKS.length}: {BLOCKS[runStep]?.name}...
            </div>
          )}

          {phase === 'done' && (
            <div style={resultBox}>
              <div style={{ fontSize: 13, color: '#e0e0e0', lineHeight: 1.7, marginBottom: 8 }}>
                {'\u2705'} Workflow executed automatically! New order {'\u2192'} inventory checked {'\u2192'}
                prep instructions generated {'\u2192'} baker notified.
              </div>
              <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 8 }}>
                This will run every time a new order comes in — no human needed.
                Tools like n8n, Zapier, and Make build these visually.
              </div>
              <button onClick={onComplete} style={btnStyle}>
                Continue {'\u2192'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

const containerStyle: React.CSSProperties = { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '16px 24px', overflow: 'auto', maxWidth: 640, margin: '0 auto', width: '100%' };
const centerCol: React.CSSProperties = { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, textAlign: 'center', marginTop: 12 };
const headingStyle: React.CSSProperties = { fontSize: 20, fontWeight: 'bold', margin: 0, color: '#e0e0e0' };
const descStyle: React.CSSProperties = { fontSize: 13, color: '#9ca3af', lineHeight: 1.7, maxWidth: 460 };
const conceptStyle: React.CSSProperties = { fontSize: 13, color: '#7b68ee', lineHeight: 1.7, maxWidth: 460 };
const btnStyle: React.CSSProperties = { padding: '12px 28px', background: '#7b68ee33', border: '2px solid #7b68ee', borderRadius: 8, color: '#e0e0e0', fontFamily: 'monospace', fontWeight: 'bold', fontSize: 14, cursor: 'pointer' };
const resultBox: React.CSSProperties = { background: '#4ade8010', border: '1px solid #4ade8033', borderRadius: 10, padding: 16, width: '100%', textAlign: 'center' };
