import { useEffect } from 'react';
import { useRunStore } from '../../stores/runStore';
import { useMetaStore } from '../../stores/metaStore';

export function TitleScreen() {
  const startNewRun = useRunStore((s) => s.startNewRun);
  const meta = useMetaStore();

  useEffect(() => {
    meta.load();
  }, []);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: 'linear-gradient(180deg, #0f0f23 0%, #1a1a3e 40%, #2d1b4e 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'monospace',
        color: '#e0e0e0',
        border: '2px solid #333',
        borderRadius: 4,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Particles */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.3 }}>
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: 4,
              height: 4,
              background: ['#7b68ee', '#a78bfa', '#60a5fa', '#34d399', '#f472b6'][i % 5],
              borderRadius: '50%',
              left: `${(i * 37) % 100}%`,
              top: `${(i * 53) % 100}%`,
              animation: `float ${3 + (i % 3)}s ease-in-out infinite alternate`,
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>

      {/* Title */}
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
        <h1
          style={{
            fontSize: 52,
            fontWeight: 'bold',
            margin: 0,
            background: 'linear-gradient(135deg, #7b68ee, #a78bfa, #60a5fa)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: -1,
          }}
        >
          SynthQuest
        </h1>
        <p style={{ fontSize: 14, color: '#9ca3af', marginTop: 4 }}>
          Build an AI system. Save the digital world.
        </p>
        <p style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>
          A deck-building roguelike
        </p>
      </div>

      {/* Buttons */}
      <div style={{ marginTop: 48, display: 'flex', flexDirection: 'column', gap: 12, position: 'relative', zIndex: 1 }}>
        <button onClick={startNewRun} style={buttonStyle}>
          New Run
        </button>
        <button
          onClick={() => useRunStore.getState().setScreen('knowledgeBase')}
          style={{ ...buttonStyle, background: 'rgba(255,255,255,0.05)' }}
        >
          Knowledge Base ({meta.knowledgeUnlocked.length})
        </button>
      </div>

      {/* Stats */}
      {meta.totalRuns > 0 && (
        <div style={{ position: 'absolute', bottom: 40, fontSize: 11, color: '#4b5563', textAlign: 'center' }}>
          Runs: {meta.totalRuns} | Wins: {meta.wins} | Best Act: {meta.bestAct}
        </div>
      )}

      {/* Controls hint */}
      <p style={{ position: 'absolute', bottom: 16, fontSize: 11, color: '#374151' }}>
        Click cards to play | Click enemies to target
      </p>

      <style>{`
        @keyframes float {
          from { transform: translateY(0px) scale(1); opacity: 0.3; }
          to { transform: translateY(-20px) scale(1.5); opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}

const buttonStyle: React.CSSProperties = {
  padding: '12px 48px',
  fontSize: 16,
  fontFamily: 'monospace',
  fontWeight: 'bold',
  color: '#e0e0e0',
  background: 'rgba(123, 104, 238, 0.2)',
  border: '2px solid rgba(123, 104, 238, 0.5)',
  borderRadius: 8,
  cursor: 'pointer',
  letterSpacing: 1,
};
