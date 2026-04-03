import { useState, useEffect } from 'react';

const MESSAGES = [
  { from: 'customer', text: "Hi! I'm Sarah." },
  { from: 'ai', text: "Hello Sarah! Welcome to Byte's Bakery!" },
  { from: 'customer', text: "I'm lactose intolerant, so I need dairy-free options." },
  { from: 'ai', text: "Noted! I'll keep that in mind for recommendations." },
  { from: 'customer', text: "I'm planning my daughter's 8th birthday next Saturday." },
  { from: 'ai', text: "How exciting! We have great options for kids' parties." },
  { from: 'customer', text: "She loves chocolate and her favorite color is purple." },
  { from: 'ai', text: "Purple chocolate theme — I have some ideas!" },
  { from: 'customer', text: "We'll need enough for about 15 kids." },
  { from: 'ai', text: "Got it, feeding 15 hungry kids!" },
  { from: 'customer', text: "So based on everything I told you, what do you recommend?" },
];

const FORGOTTEN_RESPONSE = "I'd be happy to help! Could you remind me — do you have any dietary restrictions? And how many people is this for?";
const FIXED_RESPONSE = "Based on your requirements: dairy-free, for Sarah's daughter's 8th birthday, purple & chocolate theme, 15 kids — I recommend our Chocolate Fudge Cake (large, dairy-free version) with purple frosting! $35, serves 16.";

const CONTEXT_MAX = 6; // messages that fit in context

export function S6_ContextWindow({ onComplete }: { onComplete: () => void }) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [phase, setPhase] = useState<'chatting' | 'forgot' | 'fix' | 'fixed'>('chatting');
  const [summarized, setSummarized] = useState(false);

  // Auto-advance messages
  useEffect(() => {
    if (phase !== 'chatting') return;
    if (messageIndex >= MESSAGES.length) {
      setPhase('forgot');
      return;
    }
    const timer = setTimeout(() => setMessageIndex((i) => i + 1), 1200);
    return () => clearTimeout(timer);
  }, [messageIndex, phase]);

  const visibleMessages = MESSAGES.slice(0, messageIndex);
  const memoryUsed = Math.min(messageIndex, CONTEXT_MAX);
  const memoryPct = (memoryUsed / CONTEXT_MAX) * 100;
  const overflow = messageIndex > CONTEXT_MAX;

  return (
    <div style={{ flex: 1, display: 'flex', gap: 20, padding: 24, overflow: 'hidden' }}>
      {/* Chat area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Chat messages */}
        <div style={{
          flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 6,
          padding: '12px 0',
        }}>
          {visibleMessages.map((msg, i) => {
            const faded = overflow && i < messageIndex - CONTEXT_MAX;
            return (
              <div
                key={i}
                style={{
                  alignSelf: msg.from === 'customer' ? 'flex-start' : 'flex-end',
                  background: msg.from === 'customer' ? '#1e2030' : '#7b68ee22',
                  border: `1px solid ${msg.from === 'customer' ? '#2d2d5e' : '#7b68ee44'}`,
                  borderRadius: msg.from === 'customer' ? '12px 12px 12px 4px' : '12px 12px 4px 12px',
                  padding: '8px 14px',
                  maxWidth: '75%',
                  fontSize: 13,
                  color: faded ? '#374151' : '#e0e0e0',
                  opacity: faded ? 0.4 : 1,
                  textDecoration: faded ? 'line-through' : 'none',
                  transition: 'opacity 0.5s',
                }}
              >
                {msg.text}
                {faded && <span style={{ fontSize: 9, color: '#ef4444', marginLeft: 6 }}>forgotten</span>}
              </div>
            );
          })}

          {/* AI forgotten response */}
          {phase === 'forgot' && (
            <div style={{
              alignSelf: 'flex-end',
              background: '#ef444422', border: '1px solid #ef444444', borderRadius: '12px 12px 4px 12px',
              padding: '8px 14px', maxWidth: '75%', fontSize: 13, color: '#ef4444',
            }}>
              {FORGOTTEN_RESPONSE}
              <div style={{ fontSize: 10, marginTop: 4, color: '#ef4444' }}>
                \u26A0\uFE0F It forgot your name, dietary needs, and party details!
              </div>
            </div>
          )}

          {/* Fixed response */}
          {phase === 'fixed' && (
            <div style={{
              alignSelf: 'flex-end',
              background: '#4ade8022', border: '1px solid #4ade8044', borderRadius: '12px 12px 4px 12px',
              padding: '8px 14px', maxWidth: '75%', fontSize: 13, color: '#4ade80',
            }}>
              {FIXED_RESPONSE}
              <div style={{ fontSize: 10, marginTop: 4 }}>
                \u2705 Remembered everything by summarizing!
              </div>
            </div>
          )}
        </div>

        {/* Fix controls */}
        {phase === 'forgot' && (
          <div style={{ textAlign: 'center', padding: 12 }}>
            <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>
              The AI's "memory" overflowed. Drag the Summarize tool to fix it:
            </p>
            <button
              onClick={() => { setSummarized(true); setPhase('fix'); setTimeout(() => setPhase('fixed'), 1000); }}
              style={{
                padding: '10px 20px', background: '#fbbf2422', border: '2px solid #fbbf24',
                borderRadius: 8, color: '#fbbf24', fontFamily: 'monospace', fontWeight: 'bold',
                fontSize: 13, cursor: 'pointer',
              }}
            >
              {'\uD83D\uDCDD'} Apply Summarize
            </button>
          </div>
        )}
        {phase === 'fix' && (
          <div style={{ textAlign: 'center', padding: 12, color: '#fbbf24', fontSize: 13 }}>
            Compressing conversation into key points...
          </div>
        )}
        {phase === 'fixed' && (
          <div style={{ textAlign: 'center', padding: 12 }}>
            <button onClick={onComplete} style={btnStyle}>Got it! Continue</button>
          </div>
        )}
      </div>

      {/* Memory meter (right side) */}
      <div style={{ width: 120, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <div style={{ fontSize: 11, color: '#6b7280', textAlign: 'center' }}>
          Context Window
        </div>
        <div style={{
          width: 40, height: 200, background: '#1f2937', borderRadius: 8, border: '1px solid #374151',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', bottom: 0, width: '100%',
            height: `${memoryPct}%`,
            background: overflow ? '#ef4444' : memoryPct > 70 ? '#fbbf24' : '#4ade80',
            transition: 'all 0.5s',
            borderRadius: '0 0 8px 8px',
          }} />
        </div>
        <div style={{ fontSize: 10, color: overflow ? '#ef4444' : '#6b7280', textAlign: 'center' }}>
          {overflow ? 'OVERFLOW!' : `${memoryUsed}/${CONTEXT_MAX}`}
        </div>
        {summarized && (
          <div style={{ fontSize: 10, color: '#4ade80', textAlign: 'center' }}>
            {'\u2705'} Summarized!
          </div>
        )}
      </div>
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  padding: '12px 32px', background: '#7b68ee33', border: '2px solid #7b68ee',
  borderRadius: 8, color: '#e0e0e0', fontFamily: 'monospace', fontWeight: 'bold',
  fontSize: 14, cursor: 'pointer',
};
