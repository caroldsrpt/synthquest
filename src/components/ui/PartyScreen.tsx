import { useState } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { SYNTH_SPECIES } from '../../game/data/synths';
import { MOVES } from '../../game/data/moves';
import { COLORS, VIEWPORT_WIDTH, VIEWPORT_HEIGHT } from '../../utils/constants';
import { xpForLevel } from '../../utils/synth';

export function PartyScreen({ onClose }: { onClose: () => void }) {
  const party = useGameStore((s) => s.party);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selected = party[selectedIndex];
  const species = selected ? SYNTH_SPECIES[selected.speciesId] : null;

  return (
    <div
      style={{
        width: VIEWPORT_WIDTH,
        height: VIEWPORT_HEIGHT,
        background: 'linear-gradient(180deg, #0f0f23 0%, #1a1a3e 100%)',
        display: 'flex',
        fontFamily: 'monospace',
        color: '#e0e0e0',
        border: '2px solid #333',
        borderRadius: 4,
        overflow: 'hidden',
      }}
    >
      {/* Party list */}
      <div style={{ width: 200, borderRight: '2px solid #2d2d5e', padding: '12px 0', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '0 12px 8px', fontSize: 14, fontWeight: 'bold', color: '#7b68ee', borderBottom: '1px solid #2d2d5e', marginBottom: 8 }}>
          PARTY
        </div>
        {party.map((synth, i) => {
          const sp = SYNTH_SPECIES[synth.speciesId];
          const hpPct = synth.currentMemory / synth.stats.memory;
          const isSelected = i === selectedIndex;
          return (
            <button
              key={synth.id}
              onClick={() => setSelectedIndex(i)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 12px',
                background: isSelected ? 'rgba(123, 104, 238, 0.2)' : 'transparent',
                border: 'none',
                borderLeft: isSelected ? '3px solid #7b68ee' : '3px solid transparent',
                color: '#e0e0e0',
                fontFamily: 'monospace',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: sp ? COLORS.types[sp.types[0]] : '#888',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 'bold',
                  flexShrink: 0,
                }}
              >
                {(sp?.name || '?').slice(0, 2)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {synth.nickname || sp?.name}
                </div>
                <div style={{ fontSize: 10, color: '#6b7280' }}>Lv.{synth.level}</div>
                <div style={{ width: '100%', height: 4, background: '#1f2937', borderRadius: 2, marginTop: 2 }}>
                  <div
                    style={{
                      width: `${hpPct * 100}%`,
                      height: '100%',
                      background: hpPct > 0.5 ? COLORS.hp : hpPct > 0.2 ? '#fbbf24' : COLORS.hpLow,
                      borderRadius: 2,
                    }}
                  />
                </div>
              </div>
            </button>
          );
        })}
        <div style={{ flex: 1 }} />
        <button
          onClick={onClose}
          style={{
            margin: '8px 12px',
            padding: '8px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid #374151',
            borderRadius: 6,
            color: '#9ca3af',
            fontFamily: 'monospace',
            cursor: 'pointer',
            fontSize: 12,
          }}
        >
          [X] Close
        </button>
      </div>

      {/* Selected synth detail */}
      {selected && species && (
        <div style={{ flex: 1, padding: 16, display: 'flex', flexDirection: 'column', gap: 12, overflow: 'auto' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: `radial-gradient(circle at 35% 35%, ${COLORS.types[species.types[0]]}, ${COLORS.types[species.types[0]]}88)`,
                border: `3px solid ${COLORS.types[species.types[0]]}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
                fontWeight: 'bold',
              }}
            >
              {species.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 'bold' }}>{selected.nickname || species.name}</div>
              <div style={{ display: 'flex', gap: 6, marginTop: 2 }}>
                {species.types.map((t) => (
                  <span
                    key={t}
                    style={{
                      fontSize: 10,
                      padding: '2px 8px',
                      borderRadius: 4,
                      background: `${COLORS.types[t]}33`,
                      color: COLORS.types[t],
                      fontWeight: 'bold',
                      textTransform: 'uppercase',
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
              <div style={{ fontSize: 11, color: '#6b7280', marginTop: 4 }}>{species.description}</div>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            <StatBar label="Memory (HP)" value={selected.currentMemory} max={selected.stats.memory} color={COLORS.hp} />
            <StatBar label="XP" value={selected.xp} max={xpForLevel(selected.level)} color={COLORS.xp} />
            <StatBar label="Output" value={selected.stats.output} max={150} color={COLORS.types.text} />
            <StatBar label="Clarity" value={selected.stats.clarity} max={150} color={COLORS.types.structure} />
            <StatBar label="Speed" value={selected.stats.speed} max={150} color={COLORS.types.logic} />
            <StatBar label="Confidence" value={selected.stats.confidence} max={150} color={COLORS.types.vision} />
          </div>

          {/* Moves */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 'bold', color: '#7b68ee', marginBottom: 6 }}>MOVES</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {selected.moves.map((m) => {
                const move = MOVES[m.moveId];
                if (!move) return null;
                return (
                  <div
                    key={m.moveId}
                    style={{
                      background: `${COLORS.types[move.type]}11`,
                      border: `1px solid ${COLORS.types[move.type]}44`,
                      borderRadius: 6,
                      padding: '6px 8px',
                    }}
                  >
                    <div style={{ fontSize: 12, fontWeight: 'bold' }}>{move.name}</div>
                    <div style={{ fontSize: 10, color: COLORS.types[move.type], textTransform: 'uppercase' }}>{move.type}</div>
                    <div style={{ fontSize: 10, color: '#6b7280' }}>
                      {move.power > 0 ? `PWR ${move.power}` : 'Status'} | PP {m.currentPP}/{move.pp}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Status effects */}
          {selected.statusEffects.length > 0 && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 'bold', color: '#7b68ee', marginBottom: 4 }}>STATUS</div>
              <div style={{ display: 'flex', gap: 6 }}>
                {selected.statusEffects.map((s) => (
                  <span
                    key={s.effect}
                    style={{
                      fontSize: 11,
                      padding: '2px 8px',
                      borderRadius: 4,
                      background: s.effect === 'grounded' ? '#05966933' : '#7c3aed33',
                      color: s.effect === 'grounded' ? '#10b981' : '#a78bfa',
                    }}
                  >
                    {s.effect} ({s.turnsLeft} turns)
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 2 }}>
        <span style={{ color: '#9ca3af' }}>{label}</span>
        <span style={{ color: '#6b7280' }}>{value}{max < 200 ? `/${max}` : ''}</span>
      </div>
      <div style={{ width: '100%', height: 6, background: '#1f2937', borderRadius: 3 }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 3, transition: 'width 0.3s' }} />
      </div>
    </div>
  );
}
