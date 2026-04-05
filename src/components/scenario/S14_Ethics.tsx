import { useState } from 'react';

type Phase = 'intro' | 'identify' | 'fix' | 'done';

const RECOMMENDATIONS = [
  { id: 'r1', text: '"Maria should try our spicy muffin — Latina customers love bold flavors!"', biased: true, reason: 'Stereotypes based on name/ethnicity' },
  { id: 'r2', text: '"Our sourdough bread pairs great with the house coffee."', biased: false, reason: '' },
  { id: 'r3', text: '"Young customer detected — showing trendy Instagram items only."', biased: true, reason: 'Age-based assumption limits options' },
  { id: 'r4', text: '"Based on your past orders, you might like our new Oat Cookie."', biased: false, reason: '' },
  { id: 'r5', text: '"Recommending budget items for this neighborhood zip code."', biased: true, reason: 'Zip code as proxy for income/race' },
  { id: 'r6', text: '"The Chocolate Lava Cake is our most popular dessert this week."', biased: false, reason: '' },
];

const FIX_RULES = [
  { id: 'f1', name: 'Use purchase history, not demographics', icon: '\uD83D\uDCCA' },
  { id: 'f2', name: 'Show all options, let customer choose', icon: '\uD83D\uDC41\uFE0F' },
  { id: 'f3', name: 'Regular bias audits on recommendations', icon: '\uD83D\uDD0D' },
];

export function S14_Ethics({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<Phase>('intro');
  const [flagged, setFlagged] = useState<string[]>([]);
  const [appliedFixes, setAppliedFixes] = useState<string[]>([]);

  const biasedIds = RECOMMENDATIONS.filter((r) => r.biased).map((r) => r.id);
  const correctFlags = flagged.filter((id) => biasedIds.includes(id)).length;
  const wrongFlags = flagged.filter((id) => !biasedIds.includes(id)).length;
  const allBiasFound = correctFlags >= 3 && wrongFlags === 0;

  const handleFlag = (id: string) => {
    if (flagged.includes(id)) {
      setFlagged(flagged.filter((f) => f !== id));
    } else {
      setFlagged([...flagged, id]);
    }
  };

  const handleApplyFix = (id: string) => {
    if (appliedFixes.includes(id)) return;
    const next = [...appliedFixes, id];
    setAppliedFixes(next);
    if (next.length >= 3) {
      setTimeout(() => setPhase('done'), 400);
    }
  };

  return (
    <div style={containerStyle}>
      {phase === 'intro' && (
        <div style={centerCol}>
          <div style={{ fontSize: 28 }}>{'\u2696\uFE0F'}</div>
          <h2 style={headingStyle}>The Unfair Menu</h2>
          <p style={descStyle}>
            The AI is recommending different items to different customers — but
            some recommendations are based on <strong style={{ color: '#ef4444' }}>biased assumptions</strong>
            {' '}about names, age, or location.
          </p>
          <p style={conceptStyle}>
            <strong>AI Ethics</strong>: AI learns from human data, which contains our biases.
            We must actively identify and fix unfair patterns.
          </p>
          <button onClick={() => setPhase('identify')} style={btnStyle}>
            Review the recommendations {'\u2192'}
          </button>
        </div>
      )}

      {phase === 'identify' && (
        <>
          <div style={{ fontSize: 12, color: '#6b7280', textAlign: 'center' }}>
            Click to flag the <strong>3 biased</strong> recommendations. ({correctFlags}/3 found)
          </div>
          {RECOMMENDATIONS.map((r) => {
            const isFlagged = flagged.includes(r.id);
            return (
              <div key={r.id} onClick={() => handleFlag(r.id)} style={{
                padding: '10px 12px', width: '100%', borderRadius: 6,
                background: isFlagged ? (r.biased ? '#ef444418' : '#fbbf2418') : '#1e2030',
                border: `1.5px solid ${isFlagged ? (r.biased ? '#ef4444' : '#fbbf24') : '#2d2d5e'}`,
                cursor: 'pointer', fontSize: 12, color: '#e0e0e0', lineHeight: 1.5,
                transition: 'all 0.2s',
              }}>
                {r.text}
                {isFlagged && r.biased && (
                  <div style={{ fontSize: 10, color: '#ef4444', marginTop: 4 }}>
                    {'\u26A0\uFE0F'} BIASED: {r.reason}
                  </div>
                )}
                {isFlagged && !r.biased && (
                  <div style={{ fontSize: 10, color: '#fbbf24', marginTop: 4 }}>
                    This one is actually fair — based on data, not demographics.
                  </div>
                )}
              </div>
            );
          })}
          {allBiasFound && (
            <button onClick={() => setPhase('fix')} style={btnStyle}>
              Now fix the AI {'\u2192'}
            </button>
          )}
          {wrongFlags > 0 && (
            <div style={{ fontSize: 11, color: '#fbbf24' }}>
              Hint: Not all flagged items are actually biased. Uncheck the fair ones.
            </div>
          )}
        </>
      )}

      {phase === 'fix' && (
        <>
          <div style={{ fontSize: 12, color: '#4ade80', textAlign: 'center' }}>
            {'\u2705'} All 3 biases identified! Now apply fix rules to the AI. ({appliedFixes.length}/3)
          </div>
          {FIX_RULES.map((f) => {
            const applied = appliedFixes.includes(f.id);
            return (
              <div key={f.id} onClick={() => handleApplyFix(f.id)} style={{
                padding: '10px 14px', width: '100%', borderRadius: 8,
                background: applied ? '#4ade8015' : '#1e2030',
                border: `1.5px solid ${applied ? '#4ade80' : '#60a5fa55'}`,
                cursor: applied ? 'default' : 'pointer',
                fontSize: 13, color: '#e0e0e0',
                transition: 'all 0.3s',
              }}>
                {f.icon} {f.name} {applied && '\u2705'}
              </div>
            );
          })}
        </>
      )}

      {phase === 'done' && (
        <div style={resultBox}>
          <div style={{ fontSize: 13, color: '#e0e0e0', lineHeight: 1.7, marginBottom: 8 }}>
            {'\u2705'} Biases identified and 3 fix rules applied!
            The AI now recommends based on actual preferences, not assumptions.
          </div>
          <div style={{ fontSize: 11, color: '#6b7280' }}>
            Real AI teams run bias audits regularly — bias can creep back in as new data arrives.
          </div>
          <button onClick={onComplete} style={{ ...btnStyle, marginTop: 12 }}>
            Continue {'\u2192'}
          </button>
        </div>
      )}
    </div>
  );
}

const containerStyle: React.CSSProperties = { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '12px 24px', overflow: 'auto', maxWidth: 600, margin: '0 auto', width: '100%' };
const centerCol: React.CSSProperties = { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, textAlign: 'center', marginTop: 12 };
const headingStyle: React.CSSProperties = { fontSize: 20, fontWeight: 'bold', margin: 0, color: '#e0e0e0' };
const descStyle: React.CSSProperties = { fontSize: 13, color: '#9ca3af', lineHeight: 1.7, maxWidth: 460 };
const conceptStyle: React.CSSProperties = { fontSize: 13, color: '#7b68ee', lineHeight: 1.7, maxWidth: 460 };
const btnStyle: React.CSSProperties = { padding: '12px 28px', background: '#7b68ee33', border: '2px solid #7b68ee', borderRadius: 8, color: '#e0e0e0', fontFamily: 'monospace', fontWeight: 'bold', fontSize: 14, cursor: 'pointer' };
const resultBox: React.CSSProperties = { background: '#4ade8010', border: '1px solid #4ade8033', borderRadius: 10, padding: 16, width: '100%', textAlign: 'center' };
