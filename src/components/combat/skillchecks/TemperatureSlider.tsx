import { useEffect, useRef, useState, useCallback } from 'react';

/** Oscillating fill meter — stop in the sweet spot zone. */
export function TemperatureSlider({ onResult }: { onResult: (multiplier: number) => void }) {
  const [displayValue, setDisplayValue] = useState(0);
  const [stopped, setStopped] = useState(false);
  const [frozenValue, setFrozenValue] = useState<number | null>(null);
  const valueRef = useRef(0);
  const frameRef = useRef(0);
  const startRef = useRef(Date.now());
  const stoppedRef = useRef(false); // ← ref so animation loop can see it immediately

  const sweetMin = 60;
  const sweetMax = 75;

  useEffect(() => {
    stoppedRef.current = false; // reset on mount (StrictMode remounts)
    startRef.current = Date.now();
    const animate = () => {
      if (stoppedRef.current) return;
      const t = (Date.now() - startRef.current) / 1000;
      const v = (Math.sin(t * 2.5) + 1) * 50;
      valueRef.current = v;
      setDisplayValue(v);
      frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    const timeout = setTimeout(() => {
      if (!stoppedRef.current) {
        stoppedRef.current = true;
        cancelAnimationFrame(frameRef.current);
        onResult(0.4);
      }
    }, 4000);
    return () => { stoppedRef.current = true; cancelAnimationFrame(frameRef.current); clearTimeout(timeout); };
  }, []);

  const handleStop = useCallback(() => {
    if (stoppedRef.current) return;
    stoppedRef.current = true; // stop animation loop IMMEDIATELY
    cancelAnimationFrame(frameRef.current); // cancel any pending frame

    const v = valueRef.current;
    setStopped(true);
    setFrozenValue(v);
    setDisplayValue(v);

    let mult: number;
    if (v >= sweetMin && v <= sweetMax) mult = 1.5;
    else if (v >= sweetMin - 10 && v <= sweetMax + 10) mult = 1.2;
    else if (v > 90) mult = 0.5;
    else if (v >= 30) mult = 1.0;
    else mult = 0.6;

    setTimeout(() => onResult(mult), 1000);
  }, [onResult]);

  const showValue = frozenValue !== null ? frozenValue : displayValue;

  const resultLabel = !stopped ? 'Click anywhere to stop!'
    : showValue >= sweetMin && showValue <= sweetMax ? 'PERFECT!'
    : showValue > 90 ? 'TOO HOT!'
    : showValue >= sweetMin - 10 && showValue <= sweetMax + 10 ? 'GOOD'
    : 'OK';

  const resultColor = !stopped ? '#6b7280'
    : showValue >= sweetMin && showValue <= sweetMax ? '#4ade80'
    : showValue > 90 ? '#ef4444'
    : '#fbbf24';

  return (
    <div
      onClick={handleStop}
      onMouseDown={handleStop}
      onTouchStart={handleStop}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: stopped ? 'default' : 'pointer',
        userSelect: 'none',
      }}
    >
      <div style={{
        width: 240, padding: '12px 16px',
        background: 'rgba(12,8,24,0.95)', border: '2px solid #6b4fa0', borderRadius: 8,
        pointerEvents: 'none',
      }}>
        <div style={{
          width: '100%', height: 24, background: '#1a1130', borderRadius: 4,
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Sweet spot zone */}
          <div style={{
            position: 'absolute', left: `${sweetMin}%`, width: `${sweetMax - sweetMin}%`,
            height: '100%', background: 'rgba(74,222,128,0.2)',
            borderLeft: '2px solid #4ade80', borderRight: '2px solid #4ade80',
          }} />
          {/* Fill bar */}
          <div style={{
            width: `${showValue}%`, height: '100%',
            background: showValue > 90 ? '#ef4444'
              : showValue >= sweetMin && showValue <= sweetMax ? '#4ade80'
              : '#fbbf24',
            borderRadius: 4,
          }} />
          {/* Stop marker */}
          {stopped && frozenValue !== null && (
            <div style={{
              position: 'absolute', left: `${frozenValue}%`, top: -2,
              width: 3, height: 28, background: '#fff',
              boxShadow: '0 0 8px #fff', transform: 'translateX(-1px)',
            }} />
          )}
        </div>
        <div style={{
          fontSize: 8, textAlign: 'center', marginTop: 8,
          fontFamily: "'Press Start 2P', monospace",
          fontWeight: 'bold', color: resultColor,
        }}>
          {resultLabel}
        </div>
      </div>
    </div>
  );
}
