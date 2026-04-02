import { useState } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { LIBRARY_NOTES } from '../../game/data/libraryNotes';
import { VIEWPORT_WIDTH, VIEWPORT_HEIGHT, COLORS } from '../../utils/constants';

export function LibraryScreen({ onClose }: { onClose: () => void }) {
  const unlockedNotes = useGameStore((s) => s.player.libraryNotes);
  const [selectedId, setSelectedId] = useState<string | null>(
    unlockedNotes.length > 0 ? unlockedNotes[0] : null
  );

  const allNotes = Object.values(LIBRARY_NOTES);
  const selectedNote = selectedId ? LIBRARY_NOTES[selectedId] : null;

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
      {/* Note list */}
      <div style={{ width: 200, borderRight: '2px solid #2d2d5e', padding: '12px 0', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '0 12px 8px', fontSize: 14, fontWeight: 'bold', color: '#7b68ee', borderBottom: '1px solid #2d2d5e', marginBottom: 8 }}>
          LIBRARY
        </div>
        <div style={{ fontSize: 10, color: '#6b7280', padding: '0 12px 8px' }}>
          {unlockedNotes.length}/{allNotes.length} discovered
        </div>

        <div style={{ flex: 1, overflow: 'auto' }}>
          {allNotes.map((note) => {
            const unlocked = unlockedNotes.includes(note.id);
            const isSelected = selectedId === note.id;
            return (
              <button
                key={note.id}
                onClick={() => unlocked && setSelectedId(note.id)}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '8px 12px',
                  background: isSelected ? 'rgba(123, 104, 238, 0.2)' : 'transparent',
                  border: 'none',
                  borderLeft: isSelected ? '3px solid #7b68ee' : '3px solid transparent',
                  color: unlocked ? '#e0e0e0' : '#374151',
                  fontFamily: 'monospace',
                  cursor: unlocked ? 'pointer' : 'default',
                  textAlign: 'left',
                  fontSize: 12,
                }}
              >
                <div style={{ fontWeight: 'bold' }}>
                  {unlocked ? note.title : '???'}
                </div>
                <div style={{ fontSize: 10, color: unlocked ? '#6b7280' : '#1f2937' }}>
                  {note.region}
                </div>
              </button>
            );
          })}
        </div>

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

      {/* Note content */}
      <div style={{ flex: 1, padding: 20, overflow: 'auto' }}>
        {selectedNote ? (
          <>
            <div style={{ marginBottom: 16 }}>
              <h2 style={{ fontSize: 20, fontWeight: 'bold', margin: 0, color: '#e0e0e0' }}>
                {selectedNote.title}
              </h2>
              <div
                style={{
                  display: 'inline-block',
                  marginTop: 6,
                  fontSize: 11,
                  padding: '3px 10px',
                  borderRadius: 4,
                  background: `${COLORS.accent}22`,
                  color: COLORS.accent,
                  fontWeight: 'bold',
                }}
              >
                {selectedNote.concept}
              </div>
            </div>
            <div
              style={{
                fontSize: 13,
                lineHeight: 1.7,
                color: '#d1d5db',
                whiteSpace: 'pre-wrap',
              }}
            >
              {selectedNote.content}
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#4b5563' }}>
            {unlockedNotes.length === 0
              ? 'No notes discovered yet. Explore the world to learn!'
              : 'Select a note to read.'}
          </div>
        )}
      </div>
    </div>
  );
}
