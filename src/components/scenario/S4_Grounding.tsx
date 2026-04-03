import { useState } from 'react';

const MENU_ITEMS = [
  { id: 'muffin', name: 'Blueberry Muffin', price: '$3.00' },
  { id: 'croissant', name: 'Chocolate Croissant', price: '$4.50' },
  { id: 'sourdough', name: 'Sourdough Loaf', price: '$6.00' },
  { id: 'cookie', name: 'Oat Cookie', price: '$2.00' },
];

export function S4_Grounding({ onComplete }: { onComplete: () => void }) {
  const [dbItems, setDbItems] = useState<string[]>([]);
  const [connected, setConnected] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const handleDragItem = (id: string) => {
    if (dbItems.includes(id)) return;
    const next = [...dbItems, id];
    setDbItems(next);
    if (next.length >= 3 && !connected) {
      setTimeout(() => setConnected(true), 400);
    }
  };

  const handleTestIt = () => setShowResult(true);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, padding: 32 }}>
      {/* Customer (same as S3) */}
      <div style={bubbleStyle}>
        <span style={{ fontSize: 11, color: '#6b7280', display: 'block', marginBottom: 4 }}>Customer:</span>
        "Do you have any gluten-free options?"
      </div>

      <div style={{ display: 'flex', gap: 20, width: '100%', maxWidth: 600, alignItems: 'flex-start' }}>
        {/* Menu items to drag */}
        <div style={{ width: 180 }}>
          <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 8 }}>Menu items:</div>
          {MENU_ITEMS.map((item) => {
            const inDb = dbItems.includes(item.id);
            return (
              <div
                key={item.id}
                onClick={() => handleDragItem(item.id)}
                style={{
                  padding: '8px 12px', marginBottom: 6,
                  background: inDb ? '#1a1a2e' : '#1e2030',
                  border: `1px solid ${inDb ? '#374151' : '#60a5fa'}`,
                  borderRadius: 6, cursor: inDb ? 'default' : 'pointer',
                  opacity: inDb ? 0.4 : 1,
                  fontSize: 12, color: '#e0e0e0',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ fontWeight: 'bold' }}>{item.name}</div>
                <div style={{ fontSize: 10, color: '#6b7280' }}>{item.price}</div>
                {!inDb && <div style={{ fontSize: 9, color: '#60a5fa', marginTop: 2 }}>Click to add to database \u2192</div>}
              </div>
            );
          })}
        </div>

        {/* Database box */}
        <div style={{
          flex: 1, minHeight: 160,
          background: '#0f0f23',
          border: `2px solid ${connected ? '#4ade80' : '#60a5fa44'}`,
          borderRadius: 12, padding: 16,
          transition: 'border-color 0.5s',
        }}>
          <div style={{ fontSize: 11, color: connected ? '#4ade80' : '#60a5fa', marginBottom: 8, fontWeight: 'bold' }}>
            {'\uD83D\uDDC4\uFE0F'} Menu Database {connected && '\u2714\uFE0F'}
          </div>
          {dbItems.length === 0 && (
            <div style={{ color: '#374151', fontSize: 12, fontStyle: 'italic' }}>
              Empty — click menu items to add them here
            </div>
          )}
          {dbItems.map((id) => {
            const item = MENU_ITEMS.find((m) => m.id === id)!;
            return (
              <div key={id} style={{
                padding: '4px 8px', marginBottom: 4,
                background: '#1a1a2e', borderRadius: 4,
                fontSize: 11, color: '#60a5fa',
                animation: 'fadeIn 0.3s',
              }}>
                {item.name} — {item.price}
              </div>
            );
          })}

          {connected && !showResult && (
            <div style={{ marginTop: 12, textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: '#4ade80', marginBottom: 8 }}>
                {'\u{1F50C}'} Database connected to AI!
              </div>
              <button onClick={handleTestIt} style={{
                ...btnStyle, padding: '8px 20px', fontSize: 12,
              }}>
                Test it — ask the same question
              </button>
            </div>
          )}

          {showResult && (
            <div style={{
              marginTop: 12, padding: '10px 12px',
              background: '#4ade8022', border: '1px solid #4ade8044', borderRadius: 8,
            }}>
              <div style={{ fontSize: 11, color: '#4ade80', marginBottom: 4 }}>{'\u{1F916}'} AI (grounded):</div>
              <div style={{ fontSize: 13, color: '#e0e0e0', lineHeight: 1.6 }}>
                "Looking at our menu... I don't see any gluten-free options currently available.
                Our items are: {dbItems.map((id) => MENU_ITEMS.find((m) => m.id === id)?.name).join(', ')}.
                Would you like me to suggest something else?"
              </div>
              <div style={{ fontSize: 10, color: '#4ade80', marginTop: 8 }}>
                {'\u2705'} Honest answer based on real data — no hallucination!
              </div>
            </div>
          )}
        </div>
      </div>

      {showResult && (
        <button onClick={onComplete} style={btnStyle}>
          Got it! Continue
        </button>
      )}

      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }`}</style>
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
