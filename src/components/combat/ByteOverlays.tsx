import { useState } from 'react';
import { BYTE_SPRITE_SIZE, COLORS } from '@/utils/constants';
import {
  getStatusBg, getStatusFg, getStatusLabel, getStatusDescription,
  getPowerLabel, getPowerDescription, isDebuff,
} from '@/utils/statusHelpers';

const PIXEL = "'Press Start 2P', monospace";
const PX = '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000';

// Short emoji/symbol per status for the icon
const STATUS_ICON: Record<string, string> = {
  hallucination: '👻',
  grounded: '⚓',
  context: '📎',
  vulnerable: '💥',
  weak: '⬇',
  throttled: '🔒',
  confused: '❓',
  overfit: '🔁',
};

const POWER_ICON: Record<string, string> = {
  blockPerTurn: '🛡',
  drawPerTurn: '📥',
  reduceDamage: '🧱',
  firstCardFree: '⚡',
  attackSplash: '💫',
};

interface ByteOverlaysProps {
  integrity: number;
  maxIntegrity: number;
  firewall: number;
  statusEffects: { status: string; stacks: number }[];
  activePowers: { type: string; amount?: number }[];
}

export function ByteOverlays({ integrity, maxIntegrity, firewall, statusEffects, activePowers }: ByteOverlaysProps) {
  const [hoveredTooltip, setHoveredTooltip] = useState<string | null>(null);
  const hpPct = Math.max(0, (integrity / maxIntegrity) * 100);
  const hpColor = hpPct > 50 ? COLORS.hp : hpPct > 25 ? COLORS.hpMid : COLORS.hpLow;

  const allIcons = [
    ...statusEffects.map(s => ({
      key: s.status,
      icon: STATUS_ICON[s.status] || '?',
      stacks: s.stacks,
      bg: getStatusBg(s.status),
      border: getStatusFg(s.status),
      tooltip: getStatusDescription(s.status),
      isDebuff: isDebuff(s.status),
    })),
    ...activePowers.map((p, i) => ({
      key: `power-${p.type}-${i}`,
      icon: POWER_ICON[p.type] || '✦',
      stacks: p.amount || 0,
      bg: '#05966922',
      border: '#4ade80',
      tooltip: getPowerDescription(p.type, p.amount),
      isDebuff: false,
    })),
  ];

  return (
    <>
      {/* Firewall shield — right side of Byte, like a shield blocking */}
      {firewall > 0 && (
        <div style={{
          position: 'absolute',
          top: '35%',
          right: -12,
          width: 36,
          height: 40,
          zIndex: 5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}>
          <svg width="36" height="40" viewBox="0 0 36 40" style={{ position: 'absolute' }}>
            <path
              d="M18 2 L2 10 L2 22 Q2 36 18 38 Q34 36 34 22 L34 10 Z"
              fill="rgba(96, 165, 250, 0.35)"
              stroke="#60a5fa"
              strokeWidth="2"
            />
          </svg>
          <span style={{
            fontFamily: PIXEL,
            fontSize: 12,
            fontWeight: 'bold',
            color: '#fff',
            textShadow: PX,
            zIndex: 1,
          }}>
            {firewall}
          </span>
        </div>
      )}

      {/* HP bar — under sprite */}
      <div style={{
        position: 'absolute',
        bottom: -16,
        left: '50%',
        transform: 'translateX(-50%)',
        width: BYTE_SPRITE_SIZE,
        zIndex: 3,
      }}>
        <div style={{
          width: '100%',
          height: 6,
          background: '#1a1130',
          border: '1px solid #3d2d5c',
          overflow: 'hidden',
          position: 'relative',
        }}>
          {firewall > 0 && (
            <div style={{
              position: 'absolute',
              width: `${Math.min(100, (firewall / maxIntegrity) * 100 + hpPct)}%`,
              height: '100%',
              background: COLORS.firewall,
              opacity: 0.4,
            }} />
          )}
          <div style={{
            width: `${hpPct}%`,
            height: '100%',
            background: hpColor,
            transition: 'width 0.3s',
          }} />
        </div>
        <div style={{
          fontFamily: PIXEL,
          fontSize: 7,
          color: '#6b5c7a',
          textAlign: 'center',
          textShadow: PX,
          marginTop: 1,
        }}>
          {integrity}/{maxIntegrity}
        </div>
      </div>

      {/* Buff/debuff icons — row UNDER the HP bar (StS style) */}
      {allIcons.length > 0 && (
        <div style={{
          position: 'absolute',
          bottom: -38,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 2,
          zIndex: 3,
        }}>
          {allIcons.map(item => (
            <div
              key={item.key}
              onMouseEnter={() => setHoveredTooltip(item.tooltip)}
              onMouseLeave={() => setHoveredTooltip(null)}
              style={{
                width: 18,
                height: 18,
                background: item.bg,
                border: `1px solid ${item.border}55`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                cursor: 'default',
                borderRadius: 2,
              }}
            >
              <span style={{ fontSize: 10, lineHeight: 1 }}>{item.icon}</span>
              {/* Stack count — bottom-right corner */}
              {item.stacks > 0 && (
                <span style={{
                  position: 'absolute',
                  bottom: -2,
                  right: -2,
                  fontFamily: PIXEL,
                  fontSize: 6,
                  fontWeight: 'bold',
                  color: item.border,
                  textShadow: PX,
                  lineHeight: 1,
                }}>
                  {item.stacks}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tooltip — appears above Byte when hovering a buff/debuff icon */}
      {hoveredTooltip && (
        <div style={{
          position: 'absolute',
          top: -20,
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '6px 10px',
          background: 'rgba(12, 8, 24, 0.97)',
          border: '2px solid #6b4fa0',
          boxShadow: '0 0 12px rgba(0,0,0,0.7)',
          fontFamily: PIXEL,
          fontSize: 7,
          color: '#c4b89a',
          lineHeight: 1.6,
          maxWidth: 220,
          textAlign: 'center',
          zIndex: 100,
          pointerEvents: 'none',
          whiteSpace: 'normal',
        }}>
          {hoveredTooltip}
        </div>
      )}
    </>
  );
}
