import { useEffect, useRef, useState } from 'react';

const SYMBOLS = ['◆', '▲', '●', '■', '★'];

/** Flash a target symbol, then pick it from 4 options. */
export function PatternMatchCheck({ onResult }: { onResult: (multiplier: number) => void }) {
  const [target, setTarget] = useState('');
  const [options, setOptions] = useState<string[]>([]);
  const [phase, setPhase] = useState<'show' | 'pick' | 'done'>('show');
  const [picked, setPicked] = useState<number | null>(null);
  const [startTime, setStartTime] = useState(0);
  const resolved = useRef(false);

  useEffect(() => {
    // Pick target and 3 distractors
    const shuffled = [...SYMBOLS].sort(() => Math.random() - 0.5);
    const t = shuffled[0];
    setTarget(t);
    const opts = [t, ...shuffled.slice(1, 4)].sort(() => Math.random() - 0.5);
    setOptions(opts);

    // Show target for 1s then switch to pick
    const timer = setTimeout(() => {
      setPhase('pick');
      setStartTime(Date.now());
    }, 1000);
    // Auto-fail after 3s total
    const timeout = setTimeout(() => {
      if (!resolved.current) {
        resolved.current = true;
        onResult(0.3);
      }
    }, 3000);
    return () => { clearTimeout(timer); clearTimeout(timeout); };
  }, []);

  const handlePick = (index: number) => {
    if (phase !== 'pick' || resolved.current) return;
    resolved.current = true;
    setPicked(index);
    setPhase('done');
    const correct = options[index] === target;
    const elapsed = Date.now() - startTime;
    let mult: number;
    if (correct && elapsed < 500) mult = 1.5;
    else if (correct && elapsed < 1000) mult = 1.2;
    else if (correct) mult = 1.0;
    else mult = 0.4;
    setTimeout(() => onResult(mult), 80);
  };

  return (
    <div style={{
      width: 200, padding: 16, textAlign: 'center',
      background: 'rgba(12,8,24,0.9)', border: '2px solid #6b4fa0', borderRadius: 8,
    }}>
      {phase === 'show' && (
        <div style={{ fontSize: 36, color: '#fbbf24', padding: 16, animation: 'pulse 0.5s ease-in-out infinite alternate' }}>
          {target}
        </div>
      )}
      {(phase === 'pick' || phase === 'done') && (
        <>
          <div style={{
            fontSize: 7, color: '#6b7280', marginBottom: 10,
            fontFamily: "'Press Start 2P', monospace",
          }}>
            Which symbol was shown?
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            {options.map((sym, i) => (
              <button
                key={i}
                onClick={() => handlePick(i)}
                disabled={phase === 'done'}
                style={{
                  width: 40, height: 40, fontSize: 20,
                  background: picked === i
                    ? (options[i] === target ? 'rgba(74,222,128,0.3)' : 'rgba(239,68,68,0.3)')
                    : 'rgba(26,17,48,0.8)',
                  border: picked === i
                    ? `2px solid ${options[i] === target ? '#4ade80' : '#ef4444'}`
                    : '2px solid #3d2d5c',
                  color: '#c4b89a',
                  cursor: phase === 'pick' ? 'pointer' : 'default',
                  borderRadius: 4,
                }}
              >
                {sym}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
