import { useState } from 'react';
import { COLORS } from '../../utils/constants';

const PIXEL = "'Press Start 2P', monospace";
const PX_OUTLINE = '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000';

interface PlayerStatusProps {
  integrity: number;
  maxIntegrity: number;
  firewall: number;
  energy: number;
  maxEnergy: number;
  statusEffects: { status: string; stacks: number }[];
  drawPileCount: number;
  discardPileCount: number;
  exhaustPileCount: number;
  activePowers?: { type: string; amount?: number }[];
}

/** Styled hover tooltip that appears above the hovered element */
function Tooltip({ text, visible }: { text: string; visible: boolean }) {
  if (!visible) return null;
  return (
    <div style={{
      position: 'absolute',
      bottom: '100%',
      left: '50%',
      transform: 'translateX(-50%)',
      marginBottom: 10,
      padding: '10px 14px',
      background: 'rgba(12, 8, 24, 0.97)',
      border: '2px solid #6b4fa0',
      boxShadow: '0 0 16px rgba(0,0,0,0.7)',
      fontFamily: PIXEL,
      fontSize: 8,
      color: '#c4b89a',
      lineHeight: 1.7,
      minWidth: 160,
      maxWidth: 260,
      textAlign: 'center',
      zIndex: 100,
      pointerEvents: 'none',
      whiteSpace: 'normal',
    }}>
      {text}
    </div>
  );
}

export function PlayerStatus({
  integrity, maxIntegrity, firewall, energy, maxEnergy,
  statusEffects, drawPileCount, discardPileCount, exhaustPileCount,
  activePowers = [],
}: PlayerStatusProps) {
  const hpPct = Math.max(0, (integrity / maxIntegrity) * 100);
  const hpColor = hpPct > 50 ? COLORS.hp : hpPct > 25 ? COLORS.hpMid : COLORS.hpLow;
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      fontFamily: PIXEL,
      padding: '14px 20px',
      background: 'rgba(12, 8, 24, 0.92)',
      borderTop: '3px solid #6b4fa0',
      boxShadow: 'inset 0 2px 0 #3d2d5c, 0 -4px 12px rgba(0,0,0,0.5)',
      position: 'relative',
      zIndex: 3,
    }}>
      {/* Energy orb */}
      <div
        onMouseEnter={() => setHovered('energy')}
        onMouseLeave={() => setHovered(null)}
        style={{
          width: 56,
          height: 56,
          background: COLORS.energy,
          border: '3px solid #000',
          boxShadow: `inset 0 0 0 2px ${COLORS.energy}, 0 0 8px ${COLORS.energy}44`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 14,
          fontWeight: 'bold',
          color: '#0f0f23',
          flexShrink: 0,
          position: 'relative',
          cursor: 'default',
        }}
      >
        {energy}/{maxEnergy}
        <Tooltip text="ENERGY — Spend energy to play cards. Resets each turn." visible={hovered === 'energy'} />
      </div>

      {/* HP / Firewall */}
      <div
        onMouseEnter={() => setHovered('hp')}
        onMouseLeave={() => setHovered(null)}
        style={{ flex: 1, maxWidth: 220, position: 'relative', cursor: 'default' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
          <span style={{ color: '#e0e0e0', textShadow: PX_OUTLINE }}>
            HP: {integrity}/{maxIntegrity}
          </span>
          {firewall > 0 && (
            <span style={{ color: COLORS.firewall, textShadow: PX_OUTLINE }}>
              FW: {firewall}
            </span>
          )}
        </div>
        <div style={{
          width: '100%',
          height: 10,
          background: '#1a1130',
          border: '2px solid #3d2d5c',
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
            position: 'relative',
          }} />
        </div>
        <Tooltip
          text={firewall > 0
            ? `INTEGRITY (HP) — Your health. Reach 0 and it's game over.\n\nFIREWALL — Absorbs incoming damage before HP. Resets each turn.`
            : `INTEGRITY (HP) — Your health. Reach 0 and it's game over. Play defense cards to gain Firewall (blocks damage).`}
          visible={hovered === 'hp'}
        />
      </div>

      {/* Status effects */}
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {statusEffects.map((s) => (
          <span
            key={s.status}
            onMouseEnter={() => setHovered(`status-${s.status}`)}
            onMouseLeave={() => setHovered(null)}
            style={{
              fontSize: 10,
              padding: '4px 8px',
              background: getStatusBg(s.status),
              border: `1px solid ${getStatusFg(s.status)}44`,
              color: getStatusFg(s.status),
              fontWeight: 'bold',
              textShadow: PX_OUTLINE,
              cursor: 'default',
              position: 'relative',
            }}
          >
            {getStatusLabel(s.status)} {s.stacks}
            <Tooltip text={getStatusDescription(s.status)} visible={hovered === `status-${s.status}`} />
          </span>
        ))}
      </div>

      {/* Active powers */}
      {activePowers.length > 0 && (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {activePowers.map((p, i) => (
            <span
              key={`${p.type}-${i}`}
              onMouseEnter={() => setHovered(`power-${p.type}-${i}`)}
              onMouseLeave={() => setHovered(null)}
              style={{
                fontSize: 10,
                padding: '4px 8px',
                background: '#05966922',
                border: '1px solid #10b98144',
                color: '#4ade80',
                fontWeight: 'bold',
                textShadow: PX_OUTLINE,
                cursor: 'default',
                position: 'relative',
              }}
            >
              {getPowerLabel(p.type, p.amount)}
              <Tooltip text={getPowerDescription(p.type, p.amount)} visible={hovered === `power-${p.type}-${i}`} />
            </span>
          ))}
        </div>
      )}

      {/* Pile counts */}
      <div style={{ display: 'flex', gap: 14, fontSize: 10, color: '#6b5c7a', textShadow: PX_OUTLINE }}>
        <span
          onMouseEnter={() => setHovered('draw')}
          onMouseLeave={() => setHovered(null)}
          style={{ cursor: 'default', position: 'relative' }}
        >
          Draw: {drawPileCount}
          <Tooltip text="DRAW PILE — Cards you'll draw from. When empty, your discard pile is reshuffled into it." visible={hovered === 'draw'} />
        </span>
        <span
          onMouseEnter={() => setHovered('discard')}
          onMouseLeave={() => setHovered(null)}
          style={{ cursor: 'default', position: 'relative' }}
        >
          Disc: {discardPileCount}
          <Tooltip text="DISCARD PILE — Played and discarded cards go here. Reshuffled into draw pile when it's empty." visible={hovered === 'discard'} />
        </span>
        {exhaustPileCount > 0 && (
          <span
            onMouseEnter={() => setHovered('exhaust')}
            onMouseLeave={() => setHovered(null)}
            style={{ cursor: 'default', position: 'relative' }}
          >
            Exh: {exhaustPileCount}
            <Tooltip text="EXHAUST PILE — Cards removed from play for the rest of this combat. Cannot be drawn again." visible={hovered === 'exhaust'} />
          </span>
        )}
      </div>
    </div>
  );
}

function getStatusDescription(status: string): string {
  switch (status) {
    case 'hallucination': return 'HALLUCINATION — Curse cards in your deck. Deal 3 damage when in your hand at end of turn. Grounded blocks it.';
    case 'grounded': return 'GROUNDED — Absorbs hallucination curse triggers. Each trigger removes 1 stack.';
    case 'context': return 'CONTEXT — Adds bonus damage or firewall to your next card that deals damage or gives firewall. Consumed after use.';
    case 'vulnerable': return 'VULNERABLE — Take 50% more damage from attacks. Reduces by 1 each turn.';
    case 'weak': return 'WEAK — Deal 25% less damage with attacks. Reduces by 1 each turn.';
    case 'throttled': return 'THROTTLED — Lose this much energy at the start of next turn.';
    case 'confused': return 'CONFUSED — Each stack randomizes 1 card cost (0-3) when drawn.';
    case 'overfit': return 'OVERFIT — Playing the same card twice in a turn halves its damage.';
    default: return status;
  }
}

function getStatusBg(status: string): string {
  switch (status) {
    case 'hallucination': return '#7c3aed33';
    case 'grounded': return '#05966933';
    case 'context': return '#fbbf2433';
    case 'vulnerable': return '#f9731633';
    case 'weak': return '#60a5fa33';
    case 'throttled': return '#ef444433';
    case 'confused': return '#a78bfa33';
    case 'overfit': return '#f4728633';
    default: return '#37415133';
  }
}

function getStatusFg(status: string): string {
  switch (status) {
    case 'hallucination': return '#a78bfa';
    case 'grounded': return '#10b981';
    case 'context': return '#fbbf24';
    case 'vulnerable': return '#f97316';
    case 'weak': return '#60a5fa';
    case 'throttled': return '#ef4444';
    case 'confused': return '#c084fc';
    case 'overfit': return '#f472b6';
    default: return '#6b7280';
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'hallucination': return 'Hallucination';
    case 'grounded': return 'Grounded';
    case 'context': return 'Context';
    case 'vulnerable': return 'Vulnerable';
    case 'weak': return 'Weak';
    case 'throttled': return 'Throttled';
    case 'confused': return 'Confused';
    case 'overfit': return 'Overfit';
    default: return status;
  }
}

function getPowerLabel(type: string, amount?: number): string {
  switch (type) {
    case 'blockPerTurn': return `+${amount} FW/turn`;
    case 'drawPerTurn': return `+${amount} Draw/turn`;
    case 'reduceDamage': return `-${amount} Dmg taken`;
    case 'firstCardFree': return '1st card free';
    case 'attackSplash': return `Splash ${amount}`;
    default: return type;
  }
}

function getPowerDescription(type: string, amount?: number): string {
  switch (type) {
    case 'blockPerTurn': return `MONITORING — Gain ${amount} Firewall at the start of each turn.`;
    case 'drawPerTurn': return `AUTO-COMPLETE — Draw ${amount} additional card${amount !== 1 ? 's' : ''} at the start of each turn.`;
    case 'reduceDamage': return `RATE LIMITER — Enemies deal ${amount} less damage per hit.`;
    case 'firstCardFree': return 'BATCH PROCESSING — The first card you play each turn costs 0 energy.';
    case 'attackSplash': return `ENSEMBLE MODEL — When you play an Attack, deal ${amount} damage to ALL enemies.`;
    default: return '';
  }
}
