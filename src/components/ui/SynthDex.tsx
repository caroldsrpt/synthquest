import { useState } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { SYNTH_SPECIES } from '../../game/data/synths';
import { COLORS, VIEWPORT_WIDTH, VIEWPORT_HEIGHT } from '../../utils/constants';

export function SynthDex({ onClose }: { onClose: () => void }) {
  const party = useGameStore((s) => s.party);
  const pcStorage = useGameStore((s) => s.pcStorage);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // All species the player has seen (in party or PC)
  const seenSpecies = new Set([
    ...party.map((s) => s.speciesId),
    ...pcStorage.map((s) => s.speciesId),
  ]);

  const allSpecies = Object.values(SYNTH_SPECIES);
  const selected = selectedId ? SYNTH_SPECIES[selectedId] : null;

  return (
    <div style={{
      width: VIEWPORT_WIDTH, height: VIEWPORT_HEIGHT,
      background: 'linear-gradient(180deg, #0f0f23 0%, #1a1a3e 100%)',
      display: 'flex', fontFamily: 'monospace', color: '#e0e0e0',
      border: '2px solid #333', borderRadius: 4, overflow: 'hidden',
    }}>
      {/* Species list */}
      <div style={{ width: 200, borderRight: '2px solid #2d2d5e', padding: '12px 0', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '0 12px 8px', fontSize: 14, fontWeight: 'bold', color: '#7b68ee', borderBottom: '1px solid #2d2d5e', marginBottom: 8 }}>
          SYNTHDEX
        </div>
        <div style={{ fontSize: 10, color: '#6b7280', padding: '0 12px 8px' }}>
          {seenSpecies.size}/{allSpecies.length} discovered
        </div>
        <div style={{ flex: 1, overflow: 'auto' }}>
          {allSpecies.map((species) => {
            const seen = seenSpecies.has(species.id);
            const isSelected = selectedId === species.id;
            return (
              <button
                key={species.id}
                onClick={() => seen && setSelectedId(species.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  width: '100%', padding: '6px 12px',
                  background: isSelected ? 'rgba(123, 104, 238, 0.2)' : 'transparent',
                  border: 'none',
                  borderLeft: isSelected ? '3px solid #7b68ee' : '3px solid transparent',
                  color: seen ? '#e0e0e0' : '#374151',
                  fontFamily: 'monospace', cursor: seen ? 'pointer' : 'default', textAlign: 'left',
                }}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%',
                  background: seen ? COLORS.types[species.types[0]] : '#1f2937',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 'bold', flexShrink: 0,
                }}>
                  {seen ? species.name.slice(0, 2) : '?'}
                </div>
                <div style={{ fontSize: 12 }}>
                  {seen ? species.name : '???'}
                </div>
              </button>
            );
          })}
        </div>
        <button onClick={onClose} style={{
          margin: '8px 12px', padding: '8px', background: 'rgba(255,255,255,0.05)',
          border: '1px solid #374151', borderRadius: 6, color: '#9ca3af',
          fontFamily: 'monospace', cursor: 'pointer', fontSize: 12,
        }}>
          [X] Close
        </button>
      </div>

      {/* Detail pane */}
      <div style={{ flex: 1, padding: 20, overflow: 'auto' }}>
        {selected ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: `radial-gradient(circle at 35% 35%, ${COLORS.types[selected.types[0]]}, ${COLORS.types[selected.types[0]]}88)`,
                border: `3px solid ${COLORS.types[selected.types[0]]}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 24, fontWeight: 'bold',
              }}>
                {selected.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 'bold' }}>{selected.name}</div>
                <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                  {selected.types.map((t) => (
                    <span key={t} style={{
                      fontSize: 11, padding: '2px 8px', borderRadius: 4,
                      background: `${COLORS.types[t]}33`, color: COLORS.types[t],
                      fontWeight: 'bold', textTransform: 'uppercase',
                    }}>{t}</span>
                  ))}
                </div>
              </div>
            </div>

            <p style={{ fontSize: 13, color: '#9ca3af', lineHeight: 1.6, marginBottom: 16 }}>
              {selected.description}
            </p>

            <div style={{ fontSize: 12, fontWeight: 'bold', color: '#7b68ee', marginBottom: 8 }}>BASE STATS</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {Object.entries(selected.baseStats).map(([stat, val]) => (
                <div key={stat}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 2 }}>
                    <span style={{ color: '#9ca3af', textTransform: 'capitalize' }}>{stat}</span>
                    <span style={{ color: '#6b7280' }}>{val}</span>
                  </div>
                  <div style={{ width: '100%', height: 6, background: '#1f2937', borderRadius: 3 }}>
                    <div style={{
                      width: `${Math.min(100, (val / 120) * 100)}%`, height: '100%',
                      background: COLORS.types[selected.types[0]], borderRadius: 3,
                    }} />
                  </div>
                </div>
              ))}
            </div>

            {selected.evolution && (
              <div style={{ marginTop: 16, padding: '10px 12px', background: 'rgba(123, 104, 238, 0.1)', border: '1px solid rgba(123, 104, 238, 0.3)', borderRadius: 8 }}>
                <div style={{ fontSize: 11, color: '#7b68ee', fontWeight: 'bold' }}>EVOLUTION</div>
                <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>
                  Evolves into {SYNTH_SPECIES[selected.evolution.into]?.name || selected.evolution.into}
                  {selected.evolution.condition.type === 'hasMove' && ` (learn a ${selected.evolution.condition.moveType}-type move)`}
                  {selected.evolution.condition.type === 'hasStat' && ` (${selected.evolution.condition.stat} reaches ${selected.evolution.condition.min})`}
                  {selected.evolution.condition.type === 'partyHasType' && ` (have a ${selected.evolution.condition.synthType}-type in party)`}
                  {selected.evolution.condition.type === 'statusCount' && ` (experience ${selected.evolution.condition.status} ${selected.evolution.condition.count} times)`}
                  {selected.evolution.condition.type === 'level' && ` (reach level ${selected.evolution.condition.level})`}
                </div>
              </div>
            )}
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#4b5563' }}>
            Select a Synth to view its data.
          </div>
        )}
      </div>
    </div>
  );
}
