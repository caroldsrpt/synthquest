import { useState, useEffect } from 'react';

type Phase = 'intro' | 'assign' | 'running' | 'review' | 'done';

const SPECIALISTS = [
  { id: 'menu', name: 'Menu Expert', icon: '\uD83D\uDCD6', desc: 'Knows every recipe and ingredient' },
  { id: 'orders', name: 'Order Manager', icon: '\uD83D\uDCCB', desc: 'Handles scheduling and logistics' },
  { id: 'baker', name: 'Baking Coach', icon: '\uD83D\uDC69\u200D\uD83C\uDF73', desc: 'Expert baking instructions' },
  { id: 'service', name: 'Customer Service', icon: '\uD83D\uDCAC', desc: 'Friendly, professional responses' },
  { id: 'quality', name: 'Quality Check', icon: '\u2705', desc: 'Reviews output for errors' },
];

const SLOTS = [
  { id: 'slot1', label: 'Research', needed: 'menu' },
  { id: 'slot2', label: 'Planning', needed: 'orders' },
  { id: 'slot3', label: 'Instructions', needed: 'baker' },
  { id: 'slot4', label: 'Response', needed: 'service' },
  { id: 'slot5', label: 'Review', needed: 'quality' },
];

const RUN_STEPS = [
  { agent: 'Menu Expert', text: 'Found: 3-tier vanilla with buttercream, serves 50, needs 2 days prep' },
  { agent: 'Order Manager', text: 'Scheduled: prep starts Wednesday, delivery Friday 10AM, van reserved' },
  { agent: 'Baking Coach', text: 'Instructions: 3 separate tiers, dowel support, fondant finish, chill overnight' },
  { agent: 'Customer Service', text: 'Draft: "Great news! Your wedding cake is confirmed for Friday..."' },
  { agent: 'Quality Check', text: '\u26A0\uFE0F ERROR: Draft says "Friday" but customer asked for Saturday delivery!' },
];

export function S18_Orchestration({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<Phase>('intro');
  const [assigned, setAssigned] = useState<Record<string, string>>({});
  const [selectedSpecialist, setSelectedSpecialist] = useState<string | null>(null);
  const [runStep, setRunStep] = useState(-1);
  const [showFixed, setShowFixed] = useState(false);

  const allAssigned = Object.keys(assigned).length >= SLOTS.length;

  const handleAssignToSlot = (slotId: string) => {
    if (!selectedSpecialist || assigned[slotId]) return;
    setAssigned((prev) => ({ ...prev, [slotId]: selectedSpecialist }));
    setSelectedSpecialist(null);
  };

  const handleRun = () => {
    setPhase('running');
    setRunStep(0);
  };

  useEffect(() => {
    if (phase !== 'running') return;
    if (runStep >= RUN_STEPS.length) {
      setPhase('review');
      return;
    }
    const timer = setTimeout(() => setRunStep((s) => s + 1), 1000);
    return () => clearTimeout(timer);
  }, [phase, runStep]);

  return (
    <div style={containerStyle}>
      {phase === 'intro' && (
        <div style={centerCol}>
          <div style={{ fontSize: 28 }}>{'\uD83D\uDC65'}</div>
          <h2 style={headingStyle}>The Team</h2>
          <p style={descStyle}>
            One AI trying to do everything is like one person running an entire bakery.
            What if we had a <strong style={{ color: '#ef4444' }}>team of specialists</strong>,
            each expert at one thing?
          </p>
          <p style={conceptStyle}>
            <strong>Orchestration</strong>: one manager AI delegates tasks to specialist AIs,
            collects their results, and a quality checker catches errors.
          </p>
          <button onClick={() => setPhase('assign')} style={btnStyle}>
            Assemble the team {'\u2192'}
          </button>
        </div>
      )}

      {phase === 'assign' && (
        <>
          <div style={{ fontSize: 11, color: '#6b7280', textAlign: 'center' }}>
            Click a specialist, then click a slot to assign them:
          </div>

          {/* Orchestrator node */}
          <div style={{
            padding: '8px 16px', borderRadius: 8,
            background: '#ef444422', border: '2px solid #ef4444',
            fontSize: 12, color: '#ef4444', fontWeight: 'bold', textAlign: 'center',
          }}>
            {'\uD83C\uDFAF'} Orchestrator (Manager)
          </div>

          {/* Slots */}
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
            {SLOTS.map((slot) => {
              const assignedSpec = assigned[slot.id];
              const spec = SPECIALISTS.find((s) => s.id === assignedSpec);
              return (
                <div key={slot.id} onClick={() => handleAssignToSlot(slot.id)} style={{
                  padding: '8px 10px', borderRadius: 6, minWidth: 90, textAlign: 'center',
                  background: spec ? '#4ade8015' : '#0f0f23',
                  border: `1.5px solid ${spec ? '#4ade80' : selectedSpecialist ? '#60a5fa' : '#374151'}`,
                  cursor: selectedSpecialist && !spec ? 'pointer' : 'default',
                }}>
                  <div style={{ fontSize: 9, color: '#6b7280' }}>{slot.label}</div>
                  {spec ? (
                    <div style={{ fontSize: 11, color: '#4ade80' }}>{spec.icon} {spec.name}</div>
                  ) : (
                    <div style={{ fontSize: 10, color: '#374151' }}>Empty</div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Specialist cards */}
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
            {SPECIALISTS.map((s) => {
              const isAssigned = Object.values(assigned).includes(s.id);
              const isSelected = selectedSpecialist === s.id;
              return (
                <div key={s.id} onClick={() => !isAssigned && setSelectedSpecialist(s.id)} style={{
                  padding: '6px 8px', borderRadius: 6, minWidth: 80, textAlign: 'center',
                  background: isSelected ? '#60a5fa22' : '#1e2030',
                  border: `1px solid ${isSelected ? '#60a5fa' : isAssigned ? '#374151' : '#2d2d5e'}`,
                  cursor: isAssigned ? 'default' : 'pointer',
                  opacity: isAssigned ? 0.3 : 1,
                }}>
                  <div style={{ fontSize: 14 }}>{s.icon}</div>
                  <div style={{ fontSize: 8, color: '#e0e0e0' }}>{s.name}</div>
                </div>
              );
            })}
          </div>

          {allAssigned && (
            <button onClick={handleRun} style={{ ...btnStyle, background: '#ef444422', borderColor: '#ef4444', color: '#ef4444' }}>
              {'\uD83C\uDFAF'} Run Orchestrator
            </button>
          )}
        </>
      )}

      {(phase === 'running' || phase === 'review' || phase === 'done') && (
        <>
          <div style={{
            padding: '6px 14px', borderRadius: 8,
            background: '#ef444422', border: '1px solid #ef4444',
            fontSize: 11, color: '#ef4444', fontWeight: 'bold',
          }}>
            {'\uD83C\uDFAF'} Orchestrator dispatching tasks...
          </div>

          {RUN_STEPS.map((step, i) => (
            <div key={i} style={{
              padding: '8px 10px', width: '100%', borderRadius: 6,
              background: i === 4 && runStep > i ? '#fbbf2415' : '#1e2030',
              border: `1px solid ${i === 4 && runStep > i ? '#fbbf24' : '#2d2d5e'}`,
              opacity: runStep > i ? 1 : 0.2,
              transition: 'all 0.4s',
            }}>
              <div style={{ fontSize: 10, color: i === 4 ? '#fbbf24' : '#60a5fa', fontWeight: 'bold' }}>
                {step.agent}:
              </div>
              <div style={{ fontSize: 11, color: '#e0e0e0' }}>{step.text}</div>
            </div>
          ))}

          {phase === 'review' && !showFixed && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 12, color: '#fbbf24', marginBottom: 8 }}>
                {'\u26A0\uFE0F'} Quality Check caught an error! The date was wrong.
              </div>
              <button onClick={() => { setShowFixed(true); setTimeout(() => setPhase('done'), 400); }} style={btnStyle}>
                Fix and re-send {'\u2192'}
              </button>
            </div>
          )}

          {showFixed && (
            <div style={{
              padding: '8px 10px', width: '100%', borderRadius: 6,
              background: '#4ade8015', border: '1px solid #4ade8044',
            }}>
              <div style={{ fontSize: 10, color: '#4ade80', fontWeight: 'bold' }}>Customer Service (corrected):</div>
              <div style={{ fontSize: 11, color: '#e0e0e0' }}>
                "Great news! Your 3-tier vanilla wedding cake is confirmed for <strong>Saturday</strong> delivery at 10AM!"
              </div>
            </div>
          )}

          {phase === 'done' && (
            <div style={resultBox}>
              <div style={{ fontSize: 13, color: '#e0e0e0', lineHeight: 1.7, marginBottom: 8 }}>
                {'\u2705'} 5 specialists coordinated by 1 orchestrator. The quality check caught
                a real error that would have upset the customer!
              </div>
              <div style={{ fontSize: 11, color: '#6b7280' }}>
                This is how companies like OpenAI and Anthropic build complex AI products —
                many specialized models working as a team.
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

const containerStyle: React.CSSProperties = { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '10px 24px', overflow: 'auto', maxWidth: 600, margin: '0 auto', width: '100%' };
const centerCol: React.CSSProperties = { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, textAlign: 'center', marginTop: 12 };
const headingStyle: React.CSSProperties = { fontSize: 20, fontWeight: 'bold', margin: 0, color: '#e0e0e0' };
const descStyle: React.CSSProperties = { fontSize: 13, color: '#9ca3af', lineHeight: 1.7, maxWidth: 460 };
const conceptStyle: React.CSSProperties = { fontSize: 13, color: '#7b68ee', lineHeight: 1.7, maxWidth: 460 };
const btnStyle: React.CSSProperties = { padding: '12px 28px', background: '#7b68ee33', border: '2px solid #7b68ee', borderRadius: 8, color: '#e0e0e0', fontFamily: 'monospace', fontWeight: 'bold', fontSize: 14, cursor: 'pointer' };
const resultBox: React.CSSProperties = { background: '#4ade8010', border: '1px solid #4ade8033', borderRadius: 10, padding: 16, width: '100%', textAlign: 'center' };
