import type { EnemyInstance } from '../../game/data/types';
import { ENEMIES } from '../../game/data/enemies';
import { COLORS } from '../../utils/constants';

const PIXEL = "'Press Start 2P', monospace";

const PX_OUTLINE_SM = [
  '-1px -1px 0 #000', ' 1px -1px 0 #000',
  '-1px  1px 0 #000', ' 1px  1px 0 #000',
  ' 0   -1px 0 #000', ' 0    1px 0 #000',
  '-1px  0   0 #000', ' 1px  0   0 #000',
].join(', ');

// Map enemy IDs to sprite files
const ENEMY_SPRITES: Record<string, string> = {
  staleCache: '/sprites/enemies/staleCache.png',
  tokenFlood: '/sprites/enemies/tokenFlood.png',
  theParrot: '/sprites/enemies/theParrot.png',
  junkGenerator: '/sprites/enemies/junkGenerator.png',
  confabulator: '/sprites/enemies/confabulator.png',
  promptInjector: '/sprites/enemies/staleCache.png', // reuse until we generate more
  // Act 2+3 can reuse or get their own later
};

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
  const sprite = ENEMY_SPRITES[enemy.defId];
  const spriteSize = def.type === 'boss' ? 320 : def.type === 'elite' ? 256 : 224;

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
        transform: targeting && !isDead ? 'scale(1.08)' : 'none',
        filter: targeting && !isDead ? `drop-shadow(0 0 12px #fff)` : 'none',
        minWidth: 100,
      }}
    >
      {/* Intent */}
      {!isDead && (
        <div style={{
          fontFamily: PIXEL,
          fontSize: 12,
          padding: '6px 12px',
          background: `${intentColor}22`,
          border: `2px solid ${intentColor}44`,
          color: intentColor,
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          textShadow: PX_OUTLINE_SM,
        }}>
          <span>{intentIcon}</span>
          <span>{getIntentText(enemy.currentIntent)}</span>
        </div>
      )}

      {/* Enemy sprite */}
      {sprite ? (
        <img
          src={sprite}
          alt={def.name}
          style={{
            width: spriteSize,
            height: spriteSize,
            imageRendering: 'pixelated',
            animation: isDead ? 'none' : 'enemyIdle 2s ease-in-out infinite',
          }}
        />
      ) : (
        <div style={{
          width: spriteSize,
          height: spriteSize,
          background: def.type === 'boss'
            ? 'linear-gradient(135deg, #7c3aed, #dc2626)'
            : def.type === 'elite'
            ? 'linear-gradient(135deg, #f59e0b, #ef4444)'
            : 'linear-gradient(135deg, #6b7280, #4b5563)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 24,
          fontWeight: 'bold',
          color: '#fff',
          fontFamily: PIXEL,
          border: `2px solid ${targeting && !isDead ? '#fff' : '#333'}`,
        }}>
          {def.name.slice(0, 2).toUpperCase()}
        </div>
      )}

      {/* Name */}
      <div style={{
        fontFamily: PIXEL,
        fontSize: 12,
        fontWeight: 'bold',
        color: def.type === 'boss' ? '#ef4444' : def.type === 'elite' ? '#f59e0b' : '#c4b89a',
        textShadow: PX_OUTLINE_SM,
        textAlign: 'center',
        letterSpacing: 0.5,
      }}>
        {def.name}
      </div>

      {/* HP bar */}
      <div style={{ width: 160 }}>
        {enemy.firewall > 0 && (
          <div style={{
            fontFamily: PIXEL,
            fontSize: 10,
            color: COLORS.firewall,
            textAlign: 'center',
            marginBottom: 2,
            textShadow: PX_OUTLINE_SM,
          }}>
            FW {enemy.firewall}
          </div>
        )}
        <div style={{
          width: '100%',
          height: 8,
          background: '#1a1130',
          border: '2px solid #3d2d5c',
          overflow: 'hidden',
        }}>
          <div style={{
            width: `${hpPct}%`,
            height: '100%',
            background: hpPct > 50 ? '#4ade80' : hpPct > 25 ? '#fbbf24' : '#ef4444',
            transition: 'width 0.3s',
          }} />
        </div>
        <div style={{
          fontFamily: PIXEL,
          fontSize: 10,
          color: '#6b5c7a',
          textAlign: 'center',
          marginTop: 1,
          textShadow: PX_OUTLINE_SM,
        }}>
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
                fontFamily: PIXEL,
                fontSize: 10,
                padding: '3px 6px',
                background: getStatusColor(s.status) + '33',
                border: `1px solid ${getStatusColor(s.status)}44`,
                color: getStatusColor(s.status),
                fontWeight: 'bold',
                textShadow: PX_OUTLINE_SM,
              }}
            >
              {s.status.slice(0, 3).toUpperCase()} {s.stacks}
            </span>
          ))}
        </div>
      )}

      <style>{`
        @keyframes enemyIdle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>
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
