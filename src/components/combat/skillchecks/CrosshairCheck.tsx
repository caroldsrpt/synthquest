import { useEffect, useRef, useState } from 'react';

/** Erratic moving crosshair — click when aligned with center target. */
export function CrosshairCheck({ onResult }: { onResult: (multiplier: number) => void }) {
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [clicked, setClicked] = useState(false);
  const frameRef = useRef(0);
  const startRef = useRef(Date.now());

  useEffect(() => {
    let running = true;
    const animate = () => {
      if (!running || clicked) return;
      const t = (Date.now() - startRef.current) / 1000;
      // Erratic movement using overlapping sine waves
      const x = 50 + Math.sin(t * 3.7) * 30 + Math.sin(t * 7.1) * 15;
      const y = 50 + Math.cos(t * 4.3) * 25 + Math.cos(t * 6.8) * 12;
      setPos({ x, y });
      frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    // Auto-fail after 2.5s
    const timeout = setTimeout(() => { if (!clicked) { running = false; onResult(0.3); } }, 2500);
    return () => { running = false; cancelAnimationFrame(frameRef.current); clearTimeout(timeout); };
  }, [clicked]);

  const handleClick = () => {
    if (clicked) return;
    setClicked(true);
    // Distance from center (50,50) — max ~45
    const dist = Math.sqrt((pos.x - 50) ** 2 + (pos.y - 50) ** 2);
    const mult = dist < 8 ? 1.5 : dist < 18 ? 1.2 : dist < 30 ? 1.0 : dist < 40 ? 0.7 : 0.4;
    setTimeout(() => onResult(mult), 400);
  };

  return (
    <div onClick={handleClick} style={{
      width: 200, height: 200, position: 'relative', cursor: 'crosshair',
      background: 'rgba(12,8,24,0.9)', border: '2px solid #6b4fa0', borderRadius: 8,
    }}>
      {/* Target center */}
      <div style={{
        position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)',
        width: 16, height: 16, borderRadius: '50%',
        border: '2px solid #4ade80', opacity: 0.6,
      }} />
      <div style={{
        position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)',
        width: 36, height: 36, borderRadius: '50%',
        border: '1px solid rgba(74,222,128,0.3)',
      }} />
      {/* Crosshair */}
      <div style={{
        position: 'absolute',
        left: `${pos.x}%`, top: `${pos.y}%`,
        transform: 'translate(-50%,-50%)',
        width: 12, height: 12, borderRadius: '50%',
        background: clicked ? '#4ade80' : '#ef4444',
        boxShadow: `0 0 8px ${clicked ? '#4ade80' : '#ef4444'}`,
        transition: clicked ? 'background 0.2s' : 'none',
      }} />
    </div>
  );
}
