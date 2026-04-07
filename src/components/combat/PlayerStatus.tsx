import { useState } from 'react';
import { COLORS } from '../../utils/constants';

const PIXEL = "'Press Start 2P', monospace";
const PX = '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000';

interface PlayerStatusProps {
  integrity: number;
  maxIntegrity: number;
  energy: number;
  maxEnergy: number;
  exhaustPileCount: number;
}

export function PlayerStatus({
  integrity, maxIntegrity, energy, maxEnergy, exhaustPileCount,
}: PlayerStatusProps) {
  const hpPct = Math.max(0, (integrity / maxIntegrity) * 100);
  const hpColor = hpPct > 50 ? COLORS.hp : hpPct > 25 ? COLORS.hpMid : COLORS.hpLow;
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      fontFamily: PIXEL,
      padding: '4px 12px',
      background: 'rgba(12, 8, 24, 0.92)',
      borderTop: '2px solid #6b4fa0',
      boxShadow: 'inset 0 1px 0 #3d2d5c, 0 -2px 8px rgba(0,0,0,0.5)',
      position: 'relative',
      zIndex: 3,
    }}>
      {/* Energy orb */}
      <div
        onMouseEnter={() => setHovered('energy')}
        onMouseLeave={() => setHovered(null)}
        style={{
          width: 32,
          height: 32,
          background: COLORS.energy,
          border: '2px solid #000',
          boxShadow: `inset 0 0 0 1px ${COLORS.energy}, 0 0 6px ${COLORS.energy}44`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 11,
          fontWeight: 'bold',
          color: '#0f0f23',
          flexShrink: 0,
          position: 'relative',
          cursor: 'default',
        }}
      >
        {energy}/{maxEnergy}
        {hovered === 'energy' && (
          <div style={{
            position: 'absolute', bottom: '100%', left: '50%',
            transform: 'translateX(-50%)', marginBottom: 8,
            padding: '6px 10px', background: 'rgba(12, 8, 24, 0.97)',
            border: '2px solid #6b4fa0', fontFamily: PIXEL, fontSize: 7,
            color: '#c4b89a', lineHeight: 1.6, minWidth: 140, textAlign: 'center',
            zIndex: 100, pointerEvents: 'none', whiteSpace: 'normal',
          }}>
            ENERGY — Spend to play cards. Resets each turn.
          </div>
        )}
      </div>

      {/* HP bar — clean and prominent */}
      <div
        onMouseEnter={() => setHovered('hp')}
        onMouseLeave={() => setHovered(null)}
        style={{ flex: 1, maxWidth: 300, position: 'relative', cursor: 'default' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, marginBottom: 2 }}>
          <span style={{ color: '#e0e0e0', textShadow: PX }}>
            HP: {integrity}/{maxIntegrity}
          </span>
        </div>
        <div style={{
          width: '100%',
          height: 12,
          background: '#1a1130',
          border: '2px solid #3d2d5c',
          overflow: 'hidden',
        }}>
          <div style={{
            width: `${hpPct}%`,
            height: '100%',
            background: hpColor,
            transition: 'width 0.3s',
          }} />
        </div>
        {hovered === 'hp' && (
          <div style={{
            position: 'absolute', bottom: '100%', left: '50%',
            transform: 'translateX(-50%)', marginBottom: 8,
            padding: '6px 10px', background: 'rgba(12, 8, 24, 0.97)',
            border: '2px solid #6b4fa0', fontFamily: PIXEL, fontSize: 7,
            color: '#c4b89a', lineHeight: 1.6, minWidth: 160, textAlign: 'center',
            zIndex: 100, pointerEvents: 'none', whiteSpace: 'normal',
          }}>
            INTEGRITY — Your health. Reach 0 and it's game over.
          </div>
        )}
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Exhaust count (only if > 0) */}
      {exhaustPileCount > 0 && (
        <div
          onMouseEnter={() => setHovered('exhaust')}
          onMouseLeave={() => setHovered(null)}
          style={{ fontSize: 8, color: '#6b5c7a', textShadow: PX, cursor: 'default', position: 'relative' }}
        >
          EXH: {exhaustPileCount}
          {hovered === 'exhaust' && (
            <div style={{
              position: 'absolute', bottom: '100%', left: '50%',
              transform: 'translateX(-50%)', marginBottom: 8,
              padding: '6px 10px', background: 'rgba(12, 8, 24, 0.97)',
              border: '2px solid #6b4fa0', fontFamily: PIXEL, fontSize: 7,
              color: '#c4b89a', lineHeight: 1.6, minWidth: 160, textAlign: 'center',
              zIndex: 100, pointerEvents: 'none', whiteSpace: 'normal',
            }}>
              EXHAUST — Cards removed from play this combat.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
