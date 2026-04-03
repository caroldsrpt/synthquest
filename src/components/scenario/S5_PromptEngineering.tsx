import { useState } from 'react';

const MODIFIERS = [
  { id: 'specific', label: '+ Be Specific', icon: '\uD83C\uDFAF', desc: '"What cakes..." → "What chocolate cakes..."' },
  { id: 'context', label: '+ Add Context', icon: '\uD83D\uDCDD', desc: '"...for a birthday party of 12 people"' },
  { id: 'constraints', label: '+ Set Constraints', icon: '\u{1F6E1}\uFE0F', desc: '"...with a dairy-free option, under $50"' },
];

const RESPONSES = [
  { mods: 0, quality: 'Terrible', color: '#ef4444', prompt: '"cake"', response: 'We have cake.', rating: 1 },
  { mods: 1, quality: 'Basic', color: '#f59e0b', prompt: '"What chocolate cakes do you have?"', response: 'We have chocolate cake and chocolate fudge cake.', rating: 2 },
  { mods: 2, quality: 'Good', color: '#fbbf24', prompt: '"What chocolate cakes do you have for a birthday party of 12?"', response: 'For 12 people, I\'d recommend our Chocolate Fudge Cake (large, serves 12-15, $28) or our Chocolate Layer Cake (serves 10-14, $32).', rating: 3 },
  { mods: 3, quality: 'Excellent', color: '#4ade80', prompt: '"What chocolate cakes do you have for a birthday party of 12, with a dairy-free option, under $50?"', response: 'Great news! For 12 people under $50 with dairy-free options:\n\n1. Chocolate Fudge Cake (large) — $28, serves 12-15\n2. Dark Chocolate Vegan Cake — $35, dairy-free, serves 12\n\nBoth include "Happy Birthday" decoration. The vegan option is our most popular dairy-free choice!', rating: 5 },
];

export function S5_PromptEngineering({ onComplete }: { onComplete: () => void }) {
  const [appliedMods, setAppliedMods] = useState<string[]>([]);

  const handleApplyMod = (id: string) => {
    if (appliedMods.includes(id)) return;
    setAppliedMods((p) => [...p, id]);
  };

  const responseIdx = Math.min(appliedMods.length, RESPONSES.length - 1);
  const response = RESPONSES[responseIdx];
  const allApplied = appliedMods.length >= MODIFIERS.length;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 }}>
      {/* Starting question */}
      <div style={{ fontSize: 12, color: '#6b7280', textAlign: 'center' }}>
        The customer wants to ask about cakes. Let's improve their question:
      </div>

      {/* Current prompt */}
      <div style={{
        background: '#1e2030', border: `2px solid ${response.color}44`, borderRadius: 12,
        padding: '12px 20px', width: '100%', maxWidth: 500, transition: 'border-color 0.3s',
      }}>
        <div style={{ fontSize: 10, color: '#6b7280', marginBottom: 4 }}>Current prompt:</div>
        <div style={{ fontSize: 14, color: '#e0e0e0', fontStyle: 'italic' }}>
          {response.prompt}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
          <span style={{ fontSize: 11, color: response.color, fontWeight: 'bold' }}>Quality: {response.quality}</span>
          <span style={{ color: response.color }}>{'★'.repeat(response.rating)}{'☆'.repeat(5 - response.rating)}</span>
        </div>
      </div>

      {/* Modifier tiles */}
      <div style={{ display: 'flex', gap: 10 }}>
        {MODIFIERS.map((mod) => {
          const applied = appliedMods.includes(mod.id);
          return (
            <div
              key={mod.id}
              onClick={() => handleApplyMod(mod.id)}
              style={{
                padding: '10px 14px', borderRadius: 8,
                background: applied ? '#4ade8022' : '#1e2030',
                border: `2px solid ${applied ? '#4ade80' : '#7b68ee'}`,
                cursor: applied ? 'default' : 'pointer',
                opacity: applied ? 0.5 : 1,
                textAlign: 'center', minWidth: 120,
                transition: 'all 0.2s',
              }}
            >
              <div style={{ fontSize: 20, marginBottom: 4 }}>{mod.icon}</div>
              <div style={{ fontSize: 11, fontWeight: 'bold', color: '#e0e0e0' }}>{mod.label}</div>
              <div style={{ fontSize: 9, color: '#6b7280', marginTop: 2 }}>{mod.desc}</div>
            </div>
          );
        })}
      </div>

      {/* AI response */}
      <div style={{
        background: '#0f0f23', border: '2px solid #7b68ee44', borderRadius: 12,
        padding: 16, width: '100%', maxWidth: 500,
      }}>
        <div style={{ fontSize: 11, color: '#7b68ee', marginBottom: 8 }}>{'\u{1F916}'} AI Response:</div>
        <div style={{ fontSize: 13, color: '#e0e0e0', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
          {response.response}
        </div>
      </div>

      {allApplied && (
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 12, color: '#4ade80', marginBottom: 12 }}>
            Same AI, same data — but a much better answer just by asking better!
          </p>
          <button onClick={onComplete} style={btnStyle}>Got it! Continue</button>
        </div>
      )}
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  padding: '12px 32px', background: '#7b68ee33', border: '2px solid #7b68ee',
  borderRadius: 8, color: '#e0e0e0', fontFamily: 'monospace', fontWeight: 'bold',
  fontSize: 14, cursor: 'pointer',
};
