import { useState } from 'react';

type Phase = 'intro' | 'loop' | 'done';

const STEPS = [
  { phase: 'Plan', icon: '\uD83D\uDCDD', text: 'Need: 3-tier cake, fondant, delivery by Saturday. Steps: check inventory, prep schedule, assign baker.' },
  { phase: 'Act', icon: '\u26A1', text: 'Checking inventory... Fondant: 2kg (need 3kg). Placing restock order via Inventory API.' },
  { phase: 'Observe', icon: '\uD83D\uDC41\uFE0F', text: 'Restock ETA: Thursday. Baker schedule: Maria available Friday. But delivery van booked Friday...' },
  { phase: 'Adjust', icon: '\uD83D\uDD04', text: 'Conflict detected! Moving baking to Thursday evening, delivery to Saturday morning. Updating schedule...' },
];

const LOOP2 = [
  { phase: 'Plan', icon: '\uD83D\uDCDD', text: 'Revised plan: bake Thursday PM, decorate Friday, deliver Saturday AM.' },
  { phase: 'Act', icon: '\u26A1', text: 'Confirming Maria for Thursday. Reserving delivery van for Saturday 8AM.' },
  { phase: 'Observe', icon: '\uD83D\uDC41\uFE0F', text: 'All confirmed! Thursday bake, Friday decorate, Saturday deliver. No conflicts.' },
  { phase: 'Adjust', icon: '\uD83D\uDD04', text: 'Plan is solid. Sending confirmation to customer with timeline.' },
];

const LOOP3_FINAL = { phase: 'Complete', icon: '\u2705', text: 'Wedding cake order confirmed and scheduled! Customer notified with delivery window.' };

export function S10_AIAgents({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<Phase>('intro');
  const [loopNum, setLoopNum] = useState(1);
  const [stepIdx, setStepIdx] = useState(0);
  const [showFinal, setShowFinal] = useState(false);

  const currentSteps = loopNum === 1 ? STEPS : LOOP2;
  const currentStep = currentSteps[stepIdx];

  const handleNext = () => {
    if (stepIdx < currentSteps.length - 1) {
      setStepIdx(stepIdx + 1);
    } else if (loopNum === 1) {
      setLoopNum(2);
      setStepIdx(0);
    } else {
      setShowFinal(true);
      setPhase('done');
    }
  };

  return (
    <div style={containerStyle}>
      {phase === 'intro' && (
        <div style={centerCol}>
          <div style={{ fontSize: 28 }}>{'\uD83C\uDF82'}</div>
          <h2 style={headingStyle}>The Complex Order</h2>
          <p style={descStyle}>
            A customer wants a <strong style={{ color: '#f472b6' }}>3-tier wedding cake</strong> delivered
            by Saturday. This isn't a simple question — it requires planning, checking, and adapting.
          </p>
          <p style={conceptStyle}>
            An <strong>AI Agent</strong> doesn't just respond once. It loops:
            <strong> Plan {'\u2192'} Act {'\u2192'} Observe {'\u2192'} Adjust</strong>, repeating
            until the task is complete.
          </p>
          <button onClick={() => setPhase('loop')} style={btnStyle}>
            Start the Agent {'\u2192'}
          </button>
        </div>
      )}

      {(phase === 'loop' || phase === 'done') && (
        <>
          {/* Loop indicator */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{
              padding: '4px 10px', borderRadius: 12,
              background: '#7b68ee22', border: '1px solid #7b68ee',
              fontSize: 11, color: '#7b68ee', fontWeight: 'bold',
            }}>
              Loop {loopNum}/2 {showFinal && '+ Done'}
            </div>
          </div>

          {/* Circular diagram */}
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
            {['Plan', 'Act', 'Observe', 'Adjust'].map((name, i) => {
              const isActive = !showFinal && currentStep?.phase === name;
              const isPast = !showFinal && currentSteps.findIndex((s) => s.phase === name) < stepIdx;
              return (
                <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{
                    padding: '6px 12px', borderRadius: 8,
                    background: isActive ? '#7b68ee33' : isPast ? '#4ade8015' : '#1e2030',
                    border: `1.5px solid ${isActive ? '#7b68ee' : isPast ? '#4ade80' : '#2d2d5e'}`,
                    fontSize: 11, color: isActive ? '#7b68ee' : isPast ? '#4ade80' : '#6b7280',
                    fontWeight: isActive ? 'bold' : 'normal',
                    transition: 'all 0.3s',
                  }}>
                    {name} {isPast && '\u2713'}
                  </div>
                  {i < 3 && <span style={{ color: '#374151', fontSize: 12 }}>{'\u2192'}</span>}
                </div>
              );
            })}
          </div>

          {/* Current step detail */}
          {!showFinal && currentStep && (
            <div style={{
              background: '#0f0f23', border: '1.5px solid #7b68ee44', borderRadius: 10,
              padding: 16, width: '100%',
            }}>
              <div style={{ fontSize: 13, color: '#7b68ee', marginBottom: 6, fontWeight: 'bold' }}>
                {currentStep.icon} {currentStep.phase}
              </div>
              <div style={{ fontSize: 13, color: '#e0e0e0', lineHeight: 1.7 }}>
                {currentStep.text}
              </div>
            </div>
          )}

          {!showFinal && (
            <button onClick={handleNext} style={btnStyle}>
              {stepIdx < currentSteps.length - 1 ? 'Next step' : loopNum === 1 ? 'Start Loop 2' : 'Complete!'} {'\u2192'}
            </button>
          )}

          {showFinal && (
            <div style={resultBox}>
              <div style={{ fontSize: 16, marginBottom: 8 }}>{LOOP3_FINAL.icon}</div>
              <div style={{ fontSize: 13, color: '#e0e0e0', lineHeight: 1.7, marginBottom: 8 }}>
                {LOOP3_FINAL.text}
              </div>
              <div style={{ fontSize: 11, color: '#4ade80', lineHeight: 1.6 }}>
                The agent completed 2 loops: it planned, hit a conflict, adjusted, and confirmed.
                A regular chatbot would have just said "sure!" without checking anything.
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
