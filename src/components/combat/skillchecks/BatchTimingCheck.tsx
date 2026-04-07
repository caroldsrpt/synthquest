import { useEffect, useRef, useState } from 'react';

/** Hit 3 beats in sequence — rhythm game style. */
export function BatchTimingCheck({ onResult }: { onResult: (multiplier: number) => void }) {
  const [beats] = useState(() => [1000, 1800, 2600]); // ms when beats arrive
  const [activeBeat, setActiveBeat] = useState(-1);
  const [hits, setHits] = useState(0);
  const [done, setDone] = useState(false);
  const hitsRef = useRef(0);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    // Activate each beat in sequence
    beats.forEach((ms, i) => {
      timers.push(setTimeout(() => setActiveBeat(i), ms));
      // Deactivate after 400ms window
      timers.push(setTimeout(() => {
        setActiveBeat((current) => current === i ? -1 : current);
      }, ms + 400));
    });
    // Finish after all beats
    timers.push(setTimeout(() => {
      setDone(true);
      const h = hitsRef.current;
      const mult = h === 3 ? 1.5 : h === 2 ? 1.2 : h === 1 ? 0.8 : 0.4;
      setTimeout(() => onResult(mult), 350);
    }, 3600));
    return () => timers.forEach(clearTimeout);
  }, []);

  const handleBeatClick = (index: number) => {
    if (done || activeBeat !== index) return;
    setHits((prev) => prev + 1);
    hitsRef.current += 1;
    setActiveBeat(-1);
  };

  return (
    <div style={{
      width: 220, padding: 16, textAlign: 'center',
      background: 'rgba(12,8,24,0.9)', border: '2px solid #6b4fa0', borderRadius: 8,
    }}>
      <div style={{
        fontSize: 7, color: '#6b7280', marginBottom: 12,
        fontFamily: "'Press Start 2P', monospace",
      }}>
        Hit the beats!
      </div>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        {beats.map((_, i) => (
          <button
            key={i}
            onClick={() => handleBeatClick(i)}
            style={{
              width: 50, height: 50, borderRadius: 8,
              background: activeBeat === i
                ? 'rgba(251,191,36,0.4)'
                : 'rgba(26,17,48,0.8)',
              border: activeBeat === i
                ? '3px solid #fbbf24'
                : '2px solid #3d2d5c',
              color: '#c4b89a',
              fontSize: 16,
              cursor: activeBeat === i ? 'pointer' : 'default',
              transition: 'all 0.1s',
              boxShadow: activeBeat === i ? '0 0 12px rgba(251,191,36,0.5)' : 'none',
            }}
          >
            {i + 1}
          </button>
        ))}
      </div>
      <div style={{
        fontSize: 7, color: '#8a7a66', marginTop: 10,
        fontFamily: "'Press Start 2P', monospace",
      }}>
        {done ? `${hitsRef.current}/3 hits!` : `${hits}/3`}
      </div>
    </div>
  );
}
