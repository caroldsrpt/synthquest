import { useState } from 'react';

type Phase = 'intro' | 'train' | 'compare' | 'done';

const TRAINING_DATA = [
  { id: 't1', input: 'Customer: "How long to bake?"', output: 'Sourdough: 45min at 450F, Muffins: 22min at 375F, Croissants: 18min at 400F' },
  { id: 't2', input: 'Customer: "Is this done?"', output: 'Check: golden crust, hollow sound when tapped, internal temp 200F for bread' },
  { id: 't3', input: 'Customer: "My dough won\'t rise"', output: 'Check yeast freshness, water temp (105-115F), draft-free spot, give 1-2 hours' },
  { id: 't4', input: 'Customer: "Frosting is melting"', output: 'Too warm. Refrigerate cake 15min, use Swiss meringue buttercream for hot days' },
  { id: 't5', input: 'Customer: "Cookies are flat"', output: 'Chill dough 30min, check butter temp (cold!), don\'t overmix, add 1tbsp flour' },
];

export function S16_FineTuning({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<Phase>('intro');
  const [trained, setTrained] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);

  const handleTrain = (id: string) => {
    if (trained.includes(id)) return;
    const next = [...trained, id];
    setTrained(next);
    const pct = (next.length / TRAINING_DATA.length) * 100;
    setProgress(pct);
    if (next.length >= TRAINING_DATA.length) {
      setTimeout(() => setPhase('compare'), 600);
    }
  };

  return (
    <div style={containerStyle}>
      {phase === 'intro' && (
        <div style={centerCol}>
          <div style={{ fontSize: 28 }}>{'\uD83E\uDDE0'}</div>
          <h2 style={headingStyle}>The Permanent Lesson</h2>
          <p style={descStyle}>
            Prompt engineering gives temporary instructions. RAG provides runtime context.
            But what if we could <strong style={{ color: '#a78bfa' }}>permanently teach</strong> the
            AI our bakery's expertise?
          </p>
          <p style={conceptStyle}>
            <strong>Fine-tuning</strong> trains the AI on your specific data, baking knowledge
            directly into its weights. It becomes a specialist.
          </p>
          <button onClick={() => setPhase('train')} style={btnStyle}>
            Start training {'\u2192'}
          </button>
        </div>
      )}

      {phase === 'train' && (
        <>
          {/* Progress bar */}
          <div style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#6b7280', marginBottom: 4 }}>
              <span>Training Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div style={{ width: '100%', height: 12, background: '#0f0f23', borderRadius: 6, overflow: 'hidden' }}>
              <div style={{
                width: `${progress}%`, height: '100%', borderRadius: 6,
                background: 'linear-gradient(90deg, #7b68ee, #a78bfa)',
                transition: 'width 0.5s ease',
              }} />
            </div>
          </div>

          {/* AI brain target */}
          <div style={{ textAlign: 'center', fontSize: 10, color: '#6b7280' }}>
            Click each training example to feed it to the AI:
          </div>

          {/* Training cards */}
          {TRAINING_DATA.map((t) => {
            const isDone = trained.includes(t.id);
            return (
              <div key={t.id} onClick={() => handleTrain(t.id)} style={{
                padding: '8px 10px', width: '100%', borderRadius: 6,
                background: isDone ? '#7b68ee15' : '#1e2030',
                border: `1px solid ${isDone ? '#7b68ee44' : '#2d2d5e'}`,
                cursor: isDone ? 'default' : 'pointer',
                opacity: isDone ? 0.5 : 1,
                transition: 'all 0.3s',
              }}>
                <div style={{ fontSize: 11, color: '#9ca3af' }}>{t.input}</div>
                <div style={{ fontSize: 11, color: '#e0e0e0', marginTop: 2 }}>
                  {'\u2192'} {t.output}
                </div>
                {isDone && <span style={{ fontSize: 10, color: '#7b68ee' }}>{'\u2713'} Learned</span>}
                {!isDone && <span style={{ fontSize: 10, color: '#60a5fa' }}>Click to train</span>}
              </div>
            );
          })}
        </>
      )}

      {(phase === 'compare' || phase === 'done') && (
        <>
          <div style={{ fontSize: 13, color: '#4ade80', textAlign: 'center', fontWeight: 'bold' }}>
            {'\u2705'} Training Complete! Before vs After:
          </div>

          <div style={{ display: 'flex', gap: 12, width: '100%' }}>
            {/* Before */}
            <div style={{
              flex: 1, padding: 12, borderRadius: 8,
              background: '#ef444418', border: '1px solid #ef444444',
            }}>
              <div style={{ fontSize: 10, color: '#ef4444', marginBottom: 6, fontWeight: 'bold' }}>BEFORE (base model):</div>
              <div style={{ fontSize: 11, color: '#6b7280' }}>
                {'\uD83D\uDC64'} "My cookies are coming out flat"
              </div>
              <div style={{ fontSize: 11, color: '#e0e0e0', marginTop: 4 }}>
                {'\uD83E\uDD16'} "I'm sorry to hear that. There could be many reasons. Try checking your recipe again."
              </div>
              <div style={{ fontSize: 9, color: '#ef4444', marginTop: 4 }}>Vague, unhelpful</div>
            </div>

            {/* After */}
            <div style={{
              flex: 1, padding: 12, borderRadius: 8,
              background: '#4ade8018', border: '1px solid #4ade8044',
            }}>
              <div style={{ fontSize: 10, color: '#4ade80', marginBottom: 6, fontWeight: 'bold' }}>AFTER (fine-tuned):</div>
              <div style={{ fontSize: 11, color: '#6b7280' }}>
                {'\uD83D\uDC64'} "My cookies are coming out flat"
              </div>
              <div style={{ fontSize: 11, color: '#e0e0e0', marginTop: 4 }}>
                {'\uD83E\uDD16'} "Chill the dough for 30 minutes, make sure your butter is cold (not melted!), avoid overmixing, and add 1 tablespoon of flour."
              </div>
              <div style={{ fontSize: 9, color: '#4ade80', marginTop: 4 }}>Specific, actionable, expert</div>
            </div>
          </div>

          <button onClick={() => { setPhase('done'); onComplete(); }} style={btnStyle}>
            Continue {'\u2192'}
          </button>
        </>
      )}
    </div>
  );
}

const containerStyle: React.CSSProperties = { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, padding: '12px 24px', overflow: 'auto', maxWidth: 600, margin: '0 auto', width: '100%' };
const centerCol: React.CSSProperties = { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, textAlign: 'center', marginTop: 12 };
const headingStyle: React.CSSProperties = { fontSize: 20, fontWeight: 'bold', margin: 0, color: '#e0e0e0' };
const descStyle: React.CSSProperties = { fontSize: 13, color: '#9ca3af', lineHeight: 1.7, maxWidth: 460 };
const conceptStyle: React.CSSProperties = { fontSize: 13, color: '#7b68ee', lineHeight: 1.7, maxWidth: 460 };
const btnStyle: React.CSSProperties = { padding: '12px 28px', background: '#7b68ee33', border: '2px solid #7b68ee', borderRadius: 8, color: '#e0e0e0', fontFamily: 'monospace', fontWeight: 'bold', fontSize: 14, cursor: 'pointer' };
