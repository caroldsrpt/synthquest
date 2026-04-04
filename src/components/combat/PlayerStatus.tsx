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

export function PlayerStatus({
  integrity, maxIntegrity, firewall, energy, maxEnergy,
  statusEffects, drawPileCount, discardPileCount, exhaustPileCount,
  activePowers = [],
}: PlayerStatusProps) {
  const hpPct = Math.max(0, (integrity / maxIntegrity) * 100);
  const hpColor = hpPct > 50 ? COLORS.hp : hpPct > 25 ? COLORS.hpMid : COLORS.hpLow;

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
      <div style={{
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
      }}>
        {energy}/{maxEnergy}
      </div>

      {/* HP / Firewall */}
      <div style={{ flex: 1, maxWidth: 220 }}>
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
      </div>

      {/* Status effects */}
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {statusEffects.map((s) => (
          <span
            key={s.status}
            title={getStatusDescription(s.status)}
            style={{
              fontSize: 10,
              padding: '4px 8px',
              background: getStatusBg(s.status),
              border: `1px solid ${getStatusFg(s.status)}44`,
              color: getStatusFg(s.status),
              fontWeight: 'bold',
              textShadow: PX_OUTLINE,
            }}
          >
            {getStatusLabel(s.status)} {s.stacks}
          </span>
        ))}
      </div>

      {/* Active powers */}
      {activePowers.length > 0 && (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {activePowers.map((p, i) => (
            <span
              key={`${p.type}-${i}`}
              title={getPowerDescription(p.type, p.amount)}
              style={{
                fontSize: 10,
                padding: '4px 8px',
                background: '#05966922',
                border: '1px solid #10b98144',
                color: '#4ade80',
                fontWeight: 'bold',
                textShadow: PX_OUTLINE,
              }}
            >
              {getPowerLabel(p.type, p.amount)}
            </span>
          ))}
        </div>
      )}

      {/* Pile counts */}
      <div style={{ display: 'flex', gap: 14, fontSize: 10, color: '#6b5c7a', textShadow: PX_OUTLINE }}>
        <span>Draw: {drawPileCount}</span>
        <span>Disc: {discardPileCount}</span>
        {exhaustPileCount > 0 && <span>Exh: {exhaustPileCount}</span>}
      </div>
    </div>
  );
}

function getStatusDescription(status: string): string {
  switch (status) {
    case 'hallucination': return 'Each stack has a 30% chance of dealing 3 damage to you at end of turn. Grounded blocks it.';
    case 'grounded': return 'Absorbs hallucination triggers. Each trigger removes 1 stack.';
    case 'context': return 'Adds bonus damage/firewall to your next card. Consumed after use.';
    case 'vulnerable': return 'Take 50% more damage. Wears off by 1 each turn.';
    case 'weak': return 'Deal 25% less damage. Wears off by 1 each turn.';
    case 'throttled': return 'Reduced energy next turn.';
    case 'confused': return 'Random card costs are shuffled.';
    case 'overfit': return 'Your cards become less effective over time.';
    default: return '';
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
    case 'blockPerTurn': return `Gain ${amount} Firewall at the start of each turn.`;
    case 'drawPerTurn': return `Draw ${amount} additional card${amount !== 1 ? 's' : ''} at the start of each turn.`;
    case 'reduceDamage': return `Enemies deal ${amount} less damage per hit.`;
    case 'firstCardFree': return 'The first card you play each turn costs 0 energy.';
    case 'attackSplash': return `When you play an Attack, deal ${amount} damage to ALL enemies.`;
    default: return '';
  }
}
