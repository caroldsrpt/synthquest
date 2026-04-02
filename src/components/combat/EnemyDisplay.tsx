import type { EnemyInstance } from '../../game/data/types';
import { ENEMIES } from '../../game/data/enemies';
import { COLORS } from '../../utils/constants';

interface EnemyDisplayProps {
  enemy: EnemyInstance;
  targeting: boolean;
  onClick: (id: string) => void;
}

export function EnemyDisplay({ enemy, targeting, onClick }: EnemyDisplayProps) {
  const def = ENEMIES[enemy.defId];
  if (!def) return null;

  const hpPct = Math.max(0, enemy.hp / enemy.maxHp * 100);
  const isDead = enemy.hp <= 0;
  const intentIcon = getIntentIcon(enemy.currentIntent);
  const intentColor = getIntentColor(enemy.currentIntent);

  return (
    <div
      onClick={() => targeting && !isDead && onClick(enemy.id)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        cursor: targeting && !isDead ? 'crosshair' : 'default',
        opacity: isDead ? 0.3 : 1,
        transition: 'all 0.2s',
        transform: targeting && !isDead ? 'scale(1.05)' : 'none',
        filter: targeting && !isDead ? `drop-shadow(0 0 8px ${COLORS.accent})` : 'none',
        minWidth: 90,
      }}
    >
      {/* Intent */}
      {!isDead && (
        <div
          style={{
            fontSize: 12,
            padding: '3px 8px',
            borderRadius: 4,
            background: `${intentColor}22`,
            border: `1px solid ${intentColor}44`,
            color: intentColor,
            fontFamily: 'monospace',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <span>{intentIcon}</span>
          <span>{getIntentText(enemy.currentIntent)}</span>
        </div>
      )}

      {/* Enemy body */}
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: def.type === 'boss' ? 8 : '50%',
          background: def.type === 'boss'
            ? 'linear-gradient(135deg, #7c3aed, #dc2626)'
            : def.type === 'elite'
            ? 'linear-gradient(135deg, #f59e0b, #ef4444)'
            : 'linear-gradient(135deg, #6b7280, #4b5563)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: def.type === 'boss' ? 24 : 18,
          fontWeight: 'bold',
          color: '#fff',
          fontFamily: 'monospace',
          border: `2px solid ${targeting && !isDead ? '#fff' : 'transparent'}`,
        }}
      >
        {def.name.slice(0, 2).toUpperCase()}
      </div>

      {/* Name */}
      <div style={{ fontSize: 11, fontWeight: 'bold', color: '#e0e0e0', fontFamily: 'monospace', textAlign: 'center' }}>
        {def.name}
      </div>

      {/* HP bar */}
      <div style={{ width: 80 }}>
        {enemy.firewall > 0 && (
          <div style={{ fontSize: 10, color: COLORS.firewall, textAlign: 'center', marginBottom: 2, fontFamily: 'monospace' }}>
            {'\u26E8'} {enemy.firewall}
          </div>
        )}
        <div style={{ width: '100%', height: 8, background: '#1f2937', borderRadius: 4, overflow: 'hidden', border: '1px solid #374151' }}>
          <div
            style={{
              width: `${hpPct}%`,
              height: '100%',
              background: hpPct > 50 ? COLORS.hp : hpPct > 25 ? COLORS.hpMid : COLORS.hpLow,
              borderRadius: 4,
              transition: 'width 0.3s',
            }}
          />
        </div>
        <div style={{ fontSize: 10, color: '#6b7280', textAlign: 'center', marginTop: 1, fontFamily: 'monospace' }}>
          {enemy.hp}/{enemy.maxHp}
        </div>
      </div>

      {/* Status effects */}
      {enemy.statusEffects.length > 0 && (
        <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: 'center' }}>
          {enemy.statusEffects.map((s) => (
            <span
              key={s.status}
              style={{
                fontSize: 9,
                padding: '1px 4px',
                borderRadius: 3,
                background: getStatusColor(s.status) + '33',
                color: getStatusColor(s.status),
                fontFamily: 'monospace',
                fontWeight: 'bold',
              }}
            >
              {s.status.slice(0, 3).toUpperCase()} {s.stacks}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function getIntentIcon(intent: EnemyInstance['currentIntent']): string {
  switch (intent.type) {
    case 'attack': return '\u2694';
    case 'attackMulti': return '\u2694\u2694';
    case 'defend': return '\u26E8';
    case 'buff': return '\u2B06';
    case 'debuff': return '\u2620';
    case 'attackDebuff': return '\u2694\u2620';
    case 'unknown': return '?';
  }
}

function getIntentColor(intent: EnemyInstance['currentIntent']): string {
  switch (intent.type) {
    case 'attack':
    case 'attackMulti': return '#ef4444';
    case 'defend': return '#60a5fa';
    case 'buff': return '#fbbf24';
    case 'debuff': return '#a78bfa';
    case 'attackDebuff': return '#f97316';
    case 'unknown': return '#6b7280';
  }
}

function getIntentText(intent: EnemyInstance['currentIntent']): string {
  switch (intent.type) {
    case 'attack': return `${intent.damage}`;
    case 'attackMulti': return `${intent.damage}x${intent.times}`;
    case 'defend': return `${intent.firewall}`;
    case 'buff': return 'Buff';
    case 'debuff': return intent.status.slice(0, 4);
    case 'attackDebuff': return `${intent.damage}+${intent.status.slice(0, 3)}`;
    case 'unknown': return '???';
  }
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'hallucination': return '#a78bfa';
    case 'vulnerable': return '#f97316';
    case 'weak': return '#60a5fa';
    case 'intangible': return '#e0e0e0';
    default: return '#6b7280';
  }
}
