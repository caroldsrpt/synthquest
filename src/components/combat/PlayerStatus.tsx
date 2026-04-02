import { COLORS } from '../../utils/constants';

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
}

export function PlayerStatus({
  integrity, maxIntegrity, firewall, energy, maxEnergy,
  statusEffects, drawPileCount, discardPileCount, exhaustPileCount,
}: PlayerStatusProps) {
  const hpPct = Math.max(0, (integrity / maxIntegrity) * 100);
  const hpColor = hpPct > 50 ? COLORS.hp : hpPct > 25 ? COLORS.hpMid : COLORS.hpLow;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontFamily: 'monospace', padding: '8px 16px' }}>
      {/* Energy orb */}
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: `radial-gradient(circle at 35% 35%, ${COLORS.energy}, ${COLORS.energy}88)`,
          border: `3px solid ${COLORS.energy}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 20,
          fontWeight: 'bold',
          color: '#0f0f23',
        }}
      >
        {energy}/{maxEnergy}
      </div>

      {/* HP / Firewall */}
      <div style={{ flex: 1, maxWidth: 200 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 2 }}>
          <span style={{ color: '#e0e0e0' }}>
            Integrity: {integrity}/{maxIntegrity}
          </span>
          {firewall > 0 && (
            <span style={{ color: COLORS.firewall }}>
              {'\u26E8'} {firewall}
            </span>
          )}
        </div>
        <div style={{ width: '100%', height: 12, background: '#1f2937', borderRadius: 6, overflow: 'hidden', border: '1px solid #374151' }}>
          {firewall > 0 && (
            <div
              style={{
                position: 'absolute',
                width: `${Math.min(100, (firewall / maxIntegrity) * 100 + hpPct)}%`,
                height: 12,
                background: COLORS.firewall,
                borderRadius: 6,
                opacity: 0.5,
              }}
            />
          )}
          <div
            style={{
              width: `${hpPct}%`,
              height: '100%',
              background: hpColor,
              borderRadius: 6,
              transition: 'width 0.3s',
              position: 'relative',
            }}
          />
        </div>
      </div>

      {/* Status effects */}
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {statusEffects.map((s) => (
          <span
            key={s.status}
            style={{
              fontSize: 10,
              padding: '2px 6px',
              borderRadius: 4,
              background: getStatusBg(s.status),
              color: getStatusFg(s.status),
              fontWeight: 'bold',
            }}
          >
            {getStatusLabel(s.status)} {s.stacks}
          </span>
        ))}
      </div>

      {/* Pile counts */}
      <div style={{ display: 'flex', gap: 10, fontSize: 11, color: '#6b7280' }}>
        <span title="Draw pile">Draw: {drawPileCount}</span>
        <span title="Discard pile">Disc: {discardPileCount}</span>
        {exhaustPileCount > 0 && <span title="Exhaust pile">Exh: {exhaustPileCount}</span>}
      </div>
    </div>
  );
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
    case 'hallucination': return 'HAL';
    case 'grounded': return 'GND';
    case 'context': return 'CTX';
    case 'vulnerable': return 'VLN';
    case 'weak': return 'WEK';
    case 'throttled': return 'THR';
    case 'confused': return 'CON';
    case 'overfit': return 'OVF';
    default: return status.slice(0, 3).toUpperCase();
  }
}
