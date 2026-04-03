import { useState } from 'react';

const AI_CLAIMS = [
  { text: 'Gluten-Free Galaxy Brownie', real: false, check: 'NOT FOUND on menu' },
  { text: '$4.50', real: false, check: 'No item at this price' },
  { text: 'Available every Tuesday', real: false, check: 'No schedule exists' },
];

const REAL_MENU = [
  'Blueberry Muffin — $3.00',
  'Chocolate Croissant — $4.50',
  'Sourdough Loaf — $6.00',
  'Oat Cookie — $2.00',
  'Cinnamon Roll — $3.50',
];

export function S3_Hallucination({ onComplete }: { onComplete: () => void }) {
  const [checked, setChecked] = useState<boolean[]>([false, false, false]);
  const allChecked = checked.every(Boolean);

  const handleCheck = (index: number) => {
    setChecked((prev) => prev.map((v, i) => (i === index ? true : v)));
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, padding: 32 }}>
      {/* Customer */}
      <div style={bubbleStyle}>
        <span style={{ fontSize: 11, color: '#6b7280', display: 'block', marginBottom: 4 }}>Customer:</span>
        "Do you have any gluten-free options?"
      </div>

      {/* Split view */}
      <div style={{ display: 'flex', gap: 16, width: '100%', maxWidth: 600 }}>
        {/* AI Response (left) */}
        <div style={{
          flex: 1, background: '#0f0f23', border: '2px solid #7b68ee44', borderRadius: 12, padding: 16,
        }}>
          <div style={{ fontSize: 11, color: '#7b68ee', marginBottom: 8 }}>{'\u{1F916}'} AI says:</div>
          <div style={{ fontSize: 14, lineHeight: 1.7, color: '#e0e0e0', marginBottom: 12 }}>
            "Yes! We have our famous{' '}
            {AI_CLAIMS.map((claim, i) => (
              <span key={i}>
                <span
                  onClick={() => handleCheck(i)}
                  style={{
                    cursor: checked[i] ? 'default' : 'pointer',
                    background: checked[i] ? '#ef444433' : '#7b68ee22',
                    padding: '2px 6px',
                    borderRadius: 4,
                    border: `1px solid ${checked[i] ? '#ef4444' : '#7b68ee44'}`,
                    transition: 'all 0.2s',
                    textDecoration: checked[i] ? 'line-through' : 'none',
                  }}
                >
                  {claim.text}
                </span>
                {checked[i] && (
                  <span style={{ fontSize: 10, color: '#ef4444', marginLeft: 4 }}>
                    \u274C {claim.check}
                  </span>
                )}
                {i < AI_CLAIMS.length - 1 ? ', ' : ''}
              </span>
            ))}
            !"
          </div>
          <div style={{ fontSize: 10, color: '#4b5563' }}>
            Click each highlighted claim to fact-check it
          </div>
        </div>

        {/* Real menu (right) */}
        <div style={{
          width: 180, background: '#1a1a2e', border: '1px solid #2d2d5e', borderRadius: 12, padding: 12,
        }}>
          <div style={{ fontSize: 11, color: '#34d399', marginBottom: 8, fontWeight: 'bold' }}>
            {'\u{1F4CB}'} REAL Menu:
          </div>
          {REAL_MENU.map((item) => (
            <div key={item} style={{ fontSize: 11, color: '#9ca3af', marginBottom: 4, paddingLeft: 8, borderLeft: '2px solid #2d2d5e' }}>
              {item}
            </div>
          ))}
          <div style={{ fontSize: 10, color: '#374151', marginTop: 8, fontStyle: 'italic' }}>
            No gluten-free items listed.
          </div>
        </div>
      </div>

      {/* Result */}
      {allChecked && (
        <div style={{ textAlign: 'center' }}>
          <div style={{
            padding: '10px 20px', background: '#ef444422', border: '1px solid #ef444444',
            borderRadius: 8, fontSize: 13, color: '#ef4444', marginBottom: 16,
          }}>
            {'\uD83D\uDE20'} The customer ordered a brownie that doesn't exist!
            <br />
            <span style={{ fontSize: 11, color: '#9ca3af' }}>The AI made up every detail with complete confidence.</span>
          </div>
          <button onClick={onComplete} style={btnStyle}>
            How do we fix this?
          </button>
        </div>
      )}
    </div>
  );
}

const bubbleStyle: React.CSSProperties = {
  background: '#1e2030', borderRadius: '16px 16px 16px 4px', padding: '12px 20px',
  fontSize: 15, color: '#e0e0e0', maxWidth: 500, border: '1px solid #2d2d5e', width: '100%',
};

const btnStyle: React.CSSProperties = {
  padding: '12px 32px', background: '#7b68ee33', border: '2px solid #7b68ee',
  borderRadius: 8, color: '#e0e0e0', fontFamily: 'monospace', fontWeight: 'bold',
  fontSize: 14, cursor: 'pointer',
};
