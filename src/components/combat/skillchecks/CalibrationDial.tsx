import { useEffect, useRef, useState } from 'react';

/** Rotating needle — click when it hits the green zone. */
export function CalibrationDial({ onResult }: { onResult: (multiplier: number) => void }) {
  const [angle, setAngle] = useState(0);
  const [stopped, setStopped] = useState(false);
  const frameRef = useRef(0);
  const startRef = useRef(Date.now());

  // Green zone: 70-110 degrees (of 360)
  const greenStart = 70;
  const greenEnd = 110;

  useEffect(() => {
    let running = true;
    const animate = () => {
      if (!running || stopped) return;
      const t = (Date.now() - startRef.current) / 1000;
      const a = (t * 180) % 360; // 180 deg/sec rotation
      setAngle(a);
      frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    const timeout = setTimeout(() => { if (!stopped) { running = false; onResult(0.3); } }, 2500);
    return () => { running = false; cancelAnimationFrame(frameRef.current); clearTimeout(timeout); };
  }, [stopped]);

  const handleClick = () => {
    if (stopped) return;
    setStopped(true);
    // Check if needle is in green zone
    const inGreen = angle >= greenStart && angle <= greenEnd;
    const nearGreen = angle >= greenStart - 15 && angle <= greenEnd + 15;
    const mult = inGreen ? 1.5 : nearGreen ? 1.1 : 0.5;
    setTimeout(() => onResult(mult), 400);
  };

  const needleRad = (angle - 90) * (Math.PI / 180);

  return (
    <div onClick={handleClick} style={{
      width: 160, height: 160, position: 'relative', cursor: 'pointer',
      background: 'rgba(12,8,24,0.9)', border: '2px solid #6b4fa0', borderRadius: '50%',
    }}>
      {/* Green zone arc — approximate with a wedge */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <circle cx="80" cy="80" r="56" fill="none" stroke="rgba(74,222,128,0.2)" strokeWidth="12"
          strokeDasharray={`${((greenEnd - greenStart) / 360) * 352} ${352}`}
          strokeDashoffset={`${-(greenStart / 360) * 352}`}
          transform="rotate(-90 80 80)"
        />
        {/* Needle */}
        <line
          x1="80" y1="80"
          x2={80 + Math.cos(needleRad) * 50}
          y2={80 + Math.sin(needleRad) * 50}
          stroke={stopped ? (angle >= greenStart && angle <= greenEnd ? '#4ade80' : '#ef4444') : '#c4b89a'}
          strokeWidth="3" strokeLinecap="round"
        />
        <circle cx="80" cy="80" r="4" fill="#c4b89a" />
      </svg>
      <div style={{
        position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)',
        fontSize: 7, color: '#6b7280', fontFamily: "'Press Start 2P', monospace",
        whiteSpace: 'nowrap',
      }}>
        {stopped ? (angle >= greenStart && angle <= greenEnd ? 'CALIBRATED!' : 'MISS')
          : 'Click!'}
      </div>
    </div>
  );
}
