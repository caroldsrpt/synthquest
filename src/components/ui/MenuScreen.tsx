import { useState } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { ITEMS } from '../../game/data/items';
import { VIEWPORT_WIDTH, VIEWPORT_HEIGHT } from '../../utils/constants';
import { PartyScreen } from './PartyScreen';
import { LibraryScreen } from './LibraryScreen';
import { SynthDex } from './SynthDex';

type MenuTab = 'main' | 'party' | 'bag' | 'library' | 'synthdex';

export function MenuScreen({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<MenuTab>('main');
  const player = useGameStore((s) => s.player);
  const inventory = useGameStore((s) => s.inventory);
  const party = useGameStore((s) => s.party);
  const saveGame = useGameStore((s) => s.saveGame);

  if (tab === 'party') return <PartyScreen onClose={() => setTab('main')} />;
  if (tab === 'library') return <LibraryScreen onClose={() => setTab('main')} />;
  if (tab === 'synthdex') return <SynthDex onClose={() => setTab('main')} />;

  if (tab === 'bag') {
    return (
      <div style={{
        width: VIEWPORT_WIDTH, height: VIEWPORT_HEIGHT,
        background: 'linear-gradient(180deg, #0f0f23 0%, #1a1a3e 100%)',
        fontFamily: 'monospace', color: '#e0e0e0',
        border: '2px solid #333', borderRadius: 4, padding: 16,
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ fontSize: 14, fontWeight: 'bold', color: '#7b68ee', marginBottom: 12 }}>BAG</div>
        <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {Object.entries(inventory)
            .filter(([, count]) => count > 0)
            .map(([id, count]) => {
              const item = ITEMS[id];
              if (!item) return null;
              return (
                <div key={id} style={{
                  padding: '8px 12px', background: 'rgba(255,255,255,0.03)',
                  border: '1px solid #2d2d5e', borderRadius: 6,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: 13 }}>{item.name}</div>
                    <div style={{ fontSize: 11, color: '#6b7280' }}>{item.description}</div>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 'bold', color: '#9ca3af', minWidth: 40, textAlign: 'right' }}>
                    x{count}
                  </div>
                </div>
              );
            })}
          {Object.values(inventory).every((c) => c === 0) && (
            <div style={{ color: '#4b5563', textAlign: 'center', marginTop: 20 }}>Bag is empty.</div>
          )}
        </div>
        <button onClick={() => setTab('main')} style={backBtn}>[X] Back</button>
      </div>
    );
  }

  // Main menu
  return (
    <div style={{
      width: VIEWPORT_WIDTH, height: VIEWPORT_HEIGHT,
      background: 'linear-gradient(180deg, #0f0f23 0%, #1a1a3e 100%)',
      fontFamily: 'monospace', color: '#e0e0e0',
      border: '2px solid #333', borderRadius: 4, padding: 20,
      display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      {/* Player info header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '12px 16px', background: 'rgba(123, 104, 238, 0.1)',
        border: '1px solid rgba(123, 104, 238, 0.3)', borderRadius: 8, marginBottom: 8,
      }}>
        <div>
          <div style={{ fontWeight: 'bold', fontSize: 16 }}>{player.name}</div>
          <div style={{ fontSize: 12, color: '#9ca3af' }}>
            Rank {player.rank}: {player.rankTitle}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 12, color: '#fbbf24' }}>{player.money} Tokens</div>
          <div style={{ fontSize: 11, color: '#6b7280' }}>{party.length} Synths</div>
          <div style={{ fontSize: 11, color: '#6b7280' }}>{player.badges.length} Badges</div>
        </div>
      </div>

      <MenuItem label="PARTY" desc={`${party.length} Synths`} onClick={() => setTab('party')} icon="S" />
      <MenuItem label="BAG" desc={`${Object.values(inventory).reduce((a, b) => a + b, 0)} items`} onClick={() => setTab('bag')} icon="B" />
      <MenuItem label="SYNTHDEX" desc="Synth encyclopedia" onClick={() => setTab('synthdex')} icon="D" />
      <MenuItem label="LIBRARY" desc={`${player.libraryNotes.length} notes`} onClick={() => setTab('library')} icon="L" />
      <MenuItem
        label="SAVE"
        desc="Save your progress"
        onClick={() => {
          saveGame();
          alert('Game saved!');
        }}
        icon="S"
      />

      <div style={{ flex: 1 }} />

      <button onClick={onClose} style={{
        padding: '10px', background: 'rgba(255,255,255,0.05)',
        border: '1px solid #374151', borderRadius: 8,
        color: '#9ca3af', fontFamily: 'monospace', cursor: 'pointer', fontSize: 13,
      }}>
        [X] Close Menu
      </button>
    </div>
  );
}

function MenuItem({ label, desc, onClick, icon }: { label: string; desc: string; onClick: () => void; icon: string }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 16px', background: 'rgba(255,255,255,0.03)',
        border: '1px solid #2d2d5e', borderRadius: 8,
        color: '#e0e0e0', fontFamily: 'monospace', cursor: 'pointer',
        textAlign: 'left', width: '100%',
      }}
    >
      <div style={{
        width: 36, height: 36, borderRadius: 8,
        background: 'rgba(123, 104, 238, 0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 16, fontWeight: 'bold', color: '#7b68ee',
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontWeight: 'bold', fontSize: 14 }}>{label}</div>
        <div style={{ fontSize: 11, color: '#6b7280' }}>{desc}</div>
      </div>
    </button>
  );
}

const backBtn: React.CSSProperties = {
  padding: '8px', background: 'rgba(255,255,255,0.05)',
  border: '1px solid #374151', borderRadius: 6,
  color: '#9ca3af', fontFamily: 'monospace', cursor: 'pointer', fontSize: 12, marginTop: 8,
};
