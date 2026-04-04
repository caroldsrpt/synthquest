import { useState } from 'react';

type Phase = 'intro' | 'factcheck' | 'reveal';

const AI_CLAIMS = [
  { text: 'Gluten-Free Galaxy Brownie', real: false, check: 'NOT on our menu — completely invented' },
  { text: '$4.50', real: false, check: 'That\'s the croissant price, not a brownie' },
  { text: 'Available every Tuesday', real: false, check: 'We have no weekly specials schedule' },
];

const REAL_MENU = [
  'Blueberry Muffin — $3.00',
  'Chocolate Croissant — $4.50',
  'Sourdough Loaf — $6.00',
  'Oat Cookie — $2.00',
  'Cinnamon Roll — $3.50',
];

export function S3_Hallucination({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<Phase>('intro');
  const [checked, setChecked] = useState<boolean[]>([false, false, false]);
  const allChecked = checked.every(Boolean);
  const checkedCount = checked.filter(Boolean).length;

  const handleCheck = (index: number) => {
    setChecked((prev) => prev.map((v, i) => (i === index ? true : v)));
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, padding: 32, maxWidth: 640, margin: '0 auto', width: '100%' }}>

      {/* PHASE: Intro */}
      {phase === 'intro' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, textAlign: 'center' }}>
          <div style={{ fontSize: 28, marginBottom: 4 }}>{'\uD83D\uDE31'}</div>
          <h2 style={{ fontSize: 20, fontWeight: 'bold', margin: 0, color: '#e0e0e0' }}>
            When AI Lies
          </h2>
          <p style={{ fontSize: 14, color: '#9ca3af', lineHeight: 1.7, maxWidth: 480 }}>
            You learned that AI predicts the next word based on probability.
            But what happens when <strong style={{ color: '#ef4444' }}>there's no good answer</strong> in its training data?
          </p>
          <p style={{ fontSize: 13, color: '#ef4444', lineHeight: 1.7, maxWidth: 480 }}>
            It <strong>makes something up</strong> — and says it with complete confidence.
            This is called a <strong>hallucination</strong>.
          </p>
          <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.7, maxWidth: 480 }}>
            This is a real problem. In 2023, a lawyer used <strong style={{ color: '#a78bfa' }}>ChatGPT</strong> to
            write a legal brief, and it cited court cases that <em>didn't exist</em>. The AI invented
            fake case names, fake judges, and fake rulings — all completely made up.
          </p>
          <p style={{ fontSize: 13, color: '#7b68ee', lineHeight: 1.7, maxWidth: 480 }}>
            Let's see what happens when our bakery AI hallucinates...
          </p>
          <button onClick={() => setPhase('factcheck')} style={btnStyle}>
            See it happen {'\u2192'}
          </button>
        </div>
      )}

      {/* PHASE: Fact-check */}
      {(phase === 'factcheck' || phase === 'reveal') && (
        <>
          {/* Customer */}
          <div style={bubbleStyle}>
            <span style={{ fontSize: 11, color: '#6b7280', display: 'block', marginBottom: 4 }}>{'\uD83D\uDC64'} Customer:</span>
            "Do you have any gluten-free options?"
          </div>

          {phase === 'factcheck' && !allChecked && (
            <div style={{
              padding: '8px 16px', background: '#fbbf2411', border: '1px solid #fbbf2433',
              borderRadius: 8, fontSize: 12, color: '#fbbf24', textAlign: 'center', width: '100%',
            }}>
              {'\uD83D\uDD0D'} Click each <strong>highlighted claim</strong> in the AI's response to fact-check it against the real menu ({checkedCount}/3)
            </div>
          )}

          {/* Split view */}
          <div style={{ display: 'flex', gap: 16, width: '100%' }}>
            {/* AI Response (left) */}
            <div style={{
              flex: 1, background: '#0f0f23', border: '2px solid #7b68ee44', borderRadius: 12, padding: 16,
            }}>
              <div style={{ fontSize: 11, color: '#7b68ee', marginBottom: 8 }}>{'\uD83E\uDD16'} AI says:</div>
              <div style={{ fontSize: 14, lineHeight: 1.8, color: '#e0e0e0', marginBottom: 12 }}>
                "Yes! We have our famous{' '}
                {AI_CLAIMS.map((claim, i) => (
                  <span key={i}>
                    <span
                      onClick={() => phase === 'factcheck' && handleCheck(i)}
                      style={{
                        cursor: checked[i] || phase === 'reveal' ? 'default' : 'pointer',
                        background: checked[i] ? '#ef444433' : '#7b68ee22',
                        padding: '3px 8px',
                        borderRadius: 4,
                        border: `1px solid ${checked[i] ? '#ef4444' : '#7b68ee44'}`,
                        transition: 'all 0.2s',
                        textDecoration: checked[i] ? 'line-through' : 'none',
                      }}
                    >
                      {claim.text}
                    </span>
                    {checked[i] && (
                      <div style={{ fontSize: 11, color: '#ef4444', margin: '4px 0 6px', paddingLeft: 8, borderLeft: '2px solid #ef4444' }}>
                        {'\u274C'} {claim.check}
                      </div>
                    )}
                    {!checked[i] && i < AI_CLAIMS.length - 1 ? ', ' : ' '}
                  </span>
                ))}
                !"
              </div>
              <div style={{ fontSize: 11, color: '#ef4444', fontStyle: 'italic' }}>
                {'\u26A0\uFE0F'} The AI sounds confident — but is any of this real?
              </div>
            </div>

            {/* Real menu (right) */}
            <div style={{
              width: 200, background: '#1a1a2e', border: '1px solid #2d2d5e', borderRadius: 12, padding: 14,
            }}>
              <div style={{ fontSize: 12, color: '#34d399', marginBottom: 10, fontWeight: 'bold' }}>
                {'\uD83D\uDCCB'} REAL Menu:
              </div>
              {REAL_MENU.map((item) => (
                <div key={item} style={{ fontSize: 12, color: '#9ca3af', marginBottom: 6, paddingLeft: 8, borderLeft: '2px solid #2d2d5e' }}>
                  {item}
                </div>
              ))}
              <div style={{ fontSize: 11, color: '#374151', marginTop: 10, fontStyle: 'italic', lineHeight: 1.5 }}>
                {'\u{1F6AB}'} No gluten-free items listed anywhere.
              </div>
            </div>
          </div>

          {/* Result */}
          {allChecked && phase === 'factcheck' && (
            <div style={{ textAlign: 'center', width: '100%' }}>
              <div style={{
                padding: '14px 20px', background: '#ef444422', border: '1px solid #ef444444',
                borderRadius: 8, marginBottom: 16,
              }}>
                <div style={{ fontSize: 14, color: '#ef4444', fontWeight: 'bold', marginBottom: 6 }}>
                  {'\uD83D\uDE31'} Every single claim was a hallucination!
                </div>
                <div style={{ fontSize: 13, color: '#9ca3af', lineHeight: 1.6 }}>
                  The AI invented a product, borrowed a price from a different item,
                  and made up a schedule — all while sounding 100% confident.
                </div>
                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 8, lineHeight: 1.6 }}>
                  A real customer would order a brownie that doesn't exist.
                  That's why hallucination is one of the <strong style={{ color: '#ef4444' }}>biggest problems in AI</strong> today.
                </div>
              </div>
              <button onClick={() => { setPhase('reveal'); onComplete(); }} style={btnStyle}>
                How do we fix this? {'\u2192'}
              </button>
            </div>
          )}
        </>
      )}
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
