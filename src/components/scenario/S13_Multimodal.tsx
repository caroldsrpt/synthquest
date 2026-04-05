import { useState } from 'react';

type Phase = 'intro' | 'activate' | 'done';

const PORTS = [
  { id: 'text', name: 'TEXT', icon: '\uD83D\uDCDD', active: true },
  { id: 'image', name: 'IMAGE', icon: '\uD83D\uDDBC\uFE0F', active: false },
  { id: 'audio', name: 'AUDIO', icon: '\uD83C\uDF99\uFE0F', active: false },
  { id: 'video', name: 'VIDEO', icon: '\uD83C\uDFA5', active: false },
];

const REQUESTS = [
  { id: 'q1', text: '"What flavor is this?"', modality: 'image', icon: '\uD83D\uDDBC\uFE0F', detail: '(customer sends a photo of a cake)' },
  { id: 'q2', text: '"Read back my order"', modality: 'audio', icon: '\uD83C\uDF99\uFE0F', detail: '(customer wants voice response)' },
  { id: 'q3', text: '"Show me how to frost this"', modality: 'video', icon: '\uD83C\uDFA5', detail: '(customer wants a tutorial clip)' },
  { id: 'q4', text: '"What\'s on the menu?"', modality: 'text', icon: '\uD83D\uDCDD', detail: '(plain text question)' },
];

export function S13_Multimodal({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<Phase>('intro');
  const [activePorts, setActivePorts] = useState<string[]>(['text']);

  const handleActivate = (id: string) => {
    if (activePorts.includes(id)) return;
    const next = [...activePorts, id];
    setActivePorts(next);
    if (next.length >= 4) {
      setTimeout(() => setPhase('done'), 500);
    }
  };

  return (
    <div style={containerStyle}>
      {phase === 'intro' && (
        <div style={centerCol}>
          <div style={{ fontSize: 28 }}>{'\uD83E\uDDE0'}</div>
          <h2 style={headingStyle}>Beyond Text</h2>
          <p style={descStyle}>
            Our AI can read and write text. But customers are sending
            <strong style={{ color: '#f472b6' }}> photos, voice messages, and video requests</strong>.
            The AI can't handle any of those yet.
          </p>
          <p style={conceptStyle}>
            <strong>Multimodal AI</strong> can process multiple types of input —
            text, images, audio, and video. Each type is called a "modality".
          </p>
          <button onClick={() => setPhase('activate')} style={btnStyle}>
            Activate the ports {'\u2192'}
          </button>
        </div>
      )}

      {(phase === 'activate' || phase === 'done') && (
        <>
          {/* AI Brain with ports */}
          <div style={{ textAlign: 'center', marginBottom: 4 }}>
            <div style={{ fontSize: 10, color: '#6b7280', marginBottom: 8 }}>
              Click grayed-out ports to activate them:
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              {PORTS.map((p) => {
                const isActive = activePorts.includes(p.id);
                return (
                  <div key={p.id} onClick={() => handleActivate(p.id)} style={{
                    padding: '10px 14px', borderRadius: 8,
                    background: isActive ? '#7b68ee22' : '#0f0f23',
                    border: `2px solid ${isActive ? '#7b68ee' : '#374151'}`,
                    cursor: isActive ? 'default' : 'pointer',
                    opacity: isActive ? 1 : 0.4,
                    transition: 'all 0.3s',
                    minWidth: 70, textAlign: 'center',
                  }}>
                    <div style={{ fontSize: 20 }}>{p.icon}</div>
                    <div style={{
                      fontSize: 9, fontWeight: 'bold', marginTop: 4,
                      color: isActive ? '#7b68ee' : '#374151',
                    }}>
                      {p.name}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Requests */}
          <div style={{ width: '100%' }}>
            <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 6, fontWeight: 'bold' }}>
              Incoming Requests:
            </div>
            {REQUESTS.map((r) => {
              const canHandle = activePorts.includes(r.modality);
              return (
                <div key={r.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px',
                  marginBottom: 4, borderRadius: 6,
                  background: canHandle ? '#4ade8010' : '#1e2030',
                  border: `1px solid ${canHandle ? '#4ade8044' : '#2d2d5e'}`,
                  transition: 'all 0.3s',
                }}>
                  <span style={{ fontSize: 14 }}>{r.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: '#e0e0e0' }}>{r.text}</div>
                    <div style={{ fontSize: 10, color: '#6b7280' }}>{r.detail}</div>
                  </div>
                  <span style={{ fontSize: 12, color: canHandle ? '#4ade80' : '#ef4444' }}>
                    {canHandle ? '\u2705' : '\u274C'}
                  </span>
                </div>
              );
            })}
          </div>

          {phase === 'done' && (
            <div style={resultBox}>
              <div style={{ fontSize: 13, color: '#e0e0e0', lineHeight: 1.7, marginBottom: 8 }}>
                {'\u2705'} All 4 modalities active! The AI can now see photos, hear audio,
                understand video, AND read text — all at once.
              </div>
              <div style={{ fontSize: 11, color: '#6b7280' }}>
                Models like GPT-4o and Gemini are multimodal — they handle all these input types natively.
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
