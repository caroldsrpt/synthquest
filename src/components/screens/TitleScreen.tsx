import { useEffect, useState } from 'react';
import { useRunStore } from '../../stores/runStore';
import { useMetaStore } from '../../stores/metaStore';

const PIXEL = "'Press Start 2P', monospace";

// Hard 2px pixel outline on all text for readability
const PX_OUTLINE = [
  '-2px -2px 0 #000', ' 2px -2px 0 #000',
  '-2px  2px 0 #000', ' 2px  2px 0 #000',
  ' 0   -2px 0 #000', ' 0    2px 0 #000',
  '-2px  0   0 #000', ' 2px  0   0 #000',
].join(', ');

export function TitleScreen() {
  const startNewRun = useRunStore((s) => s.startNewRun);
  const meta = useMetaStore();
  const [ready, setReady] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    meta.load();
    requestAnimationFrame(() => setReady(true));
  }, []);

  return (
    <div style={{
      width: '100%',
      height: '100%',
      position: 'relative',
      overflow: 'hidden',
      background: '#0c0a14',
    }}>
      {/* Full-screen title scene */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'url(/sprites/title-bg.png)',
        backgroundSize: 'contain',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        imageRendering: 'pixelated',
        opacity: ready ? 1 : 0,
        transition: 'opacity 1.5s ease',
      }} />

      {/* Subtle vignette for depth */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.5) 100%)',
        pointerEvents: 'none',
      }} />

      {/* ===== Title text — upper third ===== */}
      <div style={{
        position: 'absolute',
        top: '8%',
        left: 0,
        right: 0,
        textAlign: 'center',
        zIndex: 1,
        opacity: ready ? 1 : 0,
        transform: ready ? 'none' : 'translateY(-10px)',
        transition: 'opacity 0.8s ease 0.6s, transform 0.8s ease 0.6s',
      }}>
        <h1 style={{
          fontFamily: PIXEL,
          fontSize: 'clamp(24px, 5vw, 48px)',
          color: '#f0e6d3',
          textShadow: PX_OUTLINE + ', 0 0 40px rgba(168,130,255,0.5)',
          letterSpacing: 6,
          margin: 0,
        }}>
          BYTE'S BAKERY
        </h1>
        <p style={{
          fontFamily: PIXEL,
          fontSize: 'clamp(6px, 1.2vw, 10px)',
          color: '#c4b89a',
          textShadow: PX_OUTLINE,
          letterSpacing: 4,
          marginTop: 8,
        }}>
          A DECK-BUILDING ADVENTURE
        </p>
      </div>

      {/* ===== Menu — bottom area ===== */}
      <div style={{
        position: 'absolute',
        bottom: '8%',
        left: 0,
        right: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
        zIndex: 1,
        opacity: ready ? 1 : 0,
        transform: ready ? 'none' : 'translateY(10px)',
        transition: 'opacity 0.8s ease 0.8s, transform 0.8s ease 0.8s',
      }}>
        {/* RPG-style panel behind buttons */}
        <div style={{
          background: 'rgba(12, 8, 24, 0.85)',
          border: '3px solid #6b4fa0',
          boxShadow: 'inset 0 0 0 2px #1a1130, inset 0 0 0 4px #3d2d5c, 0 0 0 2px #000',
          padding: '20px 32px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 14,
        }}>
          <MenuButton
            label="New Run"
            active={hovered === 'new'}
            onHover={(h) => setHovered(h ? 'new' : null)}
            onClick={startNewRun}
            primary
          />
          <MenuButton
            label={`Knowledge Base${meta.knowledgeUnlocked.length > 0 ? ` (${meta.knowledgeUnlocked.length})` : ''}`}
            active={hovered === 'kb'}
            onHover={(h) => setHovered(h ? 'kb' : null)}
            onClick={() => useRunStore.getState().setScreen('knowledgeBase')}
          />
        </div>

        {/* Run stats below panel */}
        {meta.totalRuns > 0 && (
          <p style={{
            fontFamily: PIXEL,
            fontSize: 7,
            color: '#5a4f6a',
            textShadow: PX_OUTLINE,
            letterSpacing: 1,
            marginTop: 4,
          }}>
            Runs: {meta.totalRuns} &bull; Wins: {meta.wins} &bull; Best Act: {meta.bestAct}
          </p>
        )}
      </div>
    </div>
  );
}

function MenuButton({ label, active, onHover, onClick, primary }: {
  label: string;
  active: boolean;
  onHover: (h: boolean) => void;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      style={{
        background: 'none',
        border: 'none',
        padding: '6px 12px',
        fontFamily: PIXEL,
        fontSize: primary ? 14 : 10,
        color: active
          ? '#fff'
          : primary ? '#c4b89a' : '#8a7a66',
        textShadow: active
          ? PX_OUTLINE + ', 0 0 16px rgba(168,130,255,0.6)'
          : PX_OUTLINE,
        cursor: 'pointer',
        transition: 'color 0.15s ease',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        letterSpacing: 2,
      }}
    >
      <span style={{
        opacity: active ? 1 : 0,
        transition: 'opacity 0.15s ease',
        fontSize: primary ? 10 : 8,
      }}>
        ▶
      </span>
      {label}
    </button>
  );
}
