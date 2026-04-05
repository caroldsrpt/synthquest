import { useEffect, useRef, useState } from 'react';

/** Oscillating fill meter — stop in the sweet spot zone. */
export function TemperatureSlider({ onResult }: { onResult: (multiplier: number) => void }) {
  const [value, setValue] = useState(0);
  const [stopped, setStopped] = useState(false);
  const frameRef = useRef(0);
  const startRef = useRef(Date.now());

  // Sweet spot: 60-75%
  const sweetMin = 60;
  const sweetMax = 75;

  useEffect(() => {
    let running = true;
    const animate = () => {
      if (!running || stopped) return;
      const t = (Date.now() - startRef.current) / 1000;
      // Oscillate 0-100 with varying speed
      const v = (Math.sin(t * 2.5) + 1) * 50;
      setValue(v);
      frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    const timeout = setTimeout(() => { if (!stopped) { running = false; onResult(0.4); } }, 2500);
    return () => { running = false; cancelAnimationFrame(frameRef.current); clearTimeout(timeout); };
  }, [stopped]);

  const handleClick = () => {
    if (stopped) return;
    setStopped(true);
    let mult: number;
    if (value >= sweetMin && value <= sweetMax) mult = 1.5;
    else if (value >= sweetMin - 10 && value <= sweetMax + 10) mult = 1.2;
    else if (value >= 30 && value <= 90) mult = 1.0;
    else mult = 0.6;
    // Too high = risky
    if (value > 90) mult = 0.5;
    setTimeout(() => onResult(mult), 80);
  };

  return (
    <div onClick={handleClick} style={{
      width: 200, height: 60, position: 'relative', cursor: 'pointer',
      background: 'rgba(12,8,24,0.9)', border: '2px solid #6b4fa0', borderRadius: 8,
      padding: 8,
    }}>
      {/* Track */}
      <div style={{
        width: '100%', height: 20, background: '#1a1130', borderRadius: 4,
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Sweet spot zone */}
        <div style={{
          position: 'absolute', left: `${sweetMin}%`, width: `${sweetMax - sweetMin}%`,
          height: '100%', background: 'rgba(74,222,128,0.2)', borderLeft: '1px solid #4ade80', borderRight: '1px solid #4ade80',
        }} />
        {/* Fill */}
        <div style={{
          width: `${value}%`, height: '100%',
          background: value > 90 ? '#ef4444' : value >= sweetMin && value <= sweetMax ? '#4ade80' : '#fbbf24',
          borderRadius: 4, transition: stopped ? 'background 0.2s' : 'none',
        }} />
      </div>
      <div style={{
        fontSize: 7, color: '#6b7280', textAlign: 'center', marginTop: 6,
        fontFamily: "'Press Start 2P', monospace",
      }}>
        {stopped ? (value >= sweetMin && value <= sweetMax ? 'PERFECT!' : value > 90 ? 'TOO HOT!' : 'OK')
          : 'Click to stop!'}
      </div>
    </div>
  );
}
