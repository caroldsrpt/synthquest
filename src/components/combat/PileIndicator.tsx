const PIXEL = "'Press Start 2P', monospace";
const PX = '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000';

interface PileIndicatorProps {
  type: 'draw' | 'discard';
  count: number;
}

export function PileIndicator({ type, count }: PileIndicatorProps) {
  const color = type === 'draw' ? '#60a5fa' : '#9ca3af';
  const label = type === 'draw' ? 'DRAW' : 'DISC';

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 2,
      opacity: 0.7,
    }}>
      {/* Stack icon — 3 overlapping card shapes */}
      <div style={{ position: 'relative', width: 24, height: 28 }}>
        {[2, 1, 0].map(i => (
          <div key={i} style={{
            position: 'absolute',
            left: i * 2,
            top: i * 2,
            width: 18,
            height: 24,
            background: i === 0 ? 'rgba(12, 8, 24, 0.9)' : 'rgba(12, 8, 24, 0.5)',
            border: `1px solid ${i === 0 ? color : '#3d2d5c'}`,
            borderRadius: 2,
          }} />
        ))}
        {/* Count on top card */}
        <div style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: 18,
          height: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: PIXEL,
          fontSize: 8,
          fontWeight: 'bold',
          color,
          textShadow: PX,
          zIndex: 1,
        }}>
          {count}
        </div>
      </div>
      {/* Label */}
      <div style={{
        fontFamily: PIXEL,
        fontSize: 6,
        color: '#4b5563',
        textShadow: PX,
        letterSpacing: 1,
      }}>
        {label}
      </div>
    </div>
  );
}
