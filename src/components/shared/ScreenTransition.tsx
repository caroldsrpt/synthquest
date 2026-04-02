import { useEffect, useState } from 'react';
import { VIEWPORT_WIDTH, VIEWPORT_HEIGHT } from '../../utils/constants';

interface ScreenTransitionProps {
  active: boolean;
  type?: 'battle' | 'fade' | 'warp';
  onComplete?: () => void;
}

export function ScreenTransition({ active, type = 'fade', onComplete }: ScreenTransitionProps) {
  const [phase, setPhase] = useState<'idle' | 'in' | 'hold' | 'out'>('idle');

  useEffect(() => {
    if (!active) {
      setPhase('idle');
      return;
    }

    setPhase('in');
    const holdTimer = setTimeout(() => setPhase('hold'), type === 'battle' ? 400 : 300);
    const outTimer = setTimeout(() => {
      setPhase('out');
      onComplete?.();
    }, type === 'battle' ? 700 : 500);
    const doneTimer = setTimeout(() => setPhase('idle'), type === 'battle' ? 1100 : 800);

    return () => {
      clearTimeout(holdTimer);
      clearTimeout(outTimer);
      clearTimeout(doneTimer);
    };
  }, [active, type, onComplete]);

  if (phase === 'idle') return null;

  if (type === 'battle') {
    return (
      <div
        style={{
          position: 'absolute',
          inset: 0,
          width: VIEWPORT_WIDTH,
          height: VIEWPORT_HEIGHT,
          zIndex: 100,
          pointerEvents: 'none',
        }}
      >
        {/* Flash effect */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: '#fff',
            opacity: phase === 'in' ? 1 : phase === 'hold' ? 0.8 : 0,
            transition: 'opacity 0.15s',
            animation: phase === 'in' ? 'battleFlash 0.4s ease-in-out' : undefined,
          }}
        />
        {/* Closing bars */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: VIEWPORT_WIDTH,
            height: phase === 'hold' || phase === 'out' ? VIEWPORT_HEIGHT / 2 : 0,
            background: '#0f0f23',
            transition: 'height 0.3s ease-in',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: VIEWPORT_WIDTH,
            height: phase === 'hold' || phase === 'out' ? VIEWPORT_HEIGHT / 2 : 0,
            background: '#0f0f23',
            transition: 'height 0.3s ease-in',
          }}
        />
        <style>{`
          @keyframes battleFlash {
            0% { opacity: 0; }
            25% { opacity: 1; }
            50% { opacity: 0.3; }
            75% { opacity: 1; }
            100% { opacity: 0.8; }
          }
        `}</style>
      </div>
    );
  }

  // Simple fade
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        width: VIEWPORT_WIDTH,
        height: VIEWPORT_HEIGHT,
        background: '#0f0f23',
        opacity: phase === 'in' || phase === 'hold' ? 1 : 0,
        transition: 'opacity 0.3s',
        zIndex: 100,
        pointerEvents: 'none',
      }}
    />
  );
}
