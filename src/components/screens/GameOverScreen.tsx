import { useRunStore } from '../../stores/runStore';
import { useMetaStore } from '../../stores/metaStore';
import { COLORS } from '../../utils/constants';

export function GameOverScreen() {
  const run = useRunStore();
  const meta = useMetaStore();

  const handleRetry = () => {
    meta.recordRun(run.act, false);
    run.setScreen('title');
  };

  return (
    <div style={{
      width: '100%', height: '100%',
      background: 'linear-gradient(180deg, #1a0a0a 0%, #0f0f23 100%)',
      fontFamily: 'monospace', color: '#e0e0e0',
      border: '2px solid #333', borderRadius: 4,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    }}>
      <h1 style={{ fontSize: 36, color: COLORS.hpLow, margin: '0 0 8px', fontWeight: 'bold' }}>
        SYSTEM FAILURE
      </h1>
      <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 24 }}>
        Your system's integrity reached zero.
      </p>
      <div style={{ display: 'flex', gap: 24, marginBottom: 32, fontSize: 13, color: '#9ca3af' }}>
        <div>Act: {run.act}</div>
        <div>Floor: {run.floor}</div>
        <div>Cards: {run.deck.length}</div>
        <div>Relics: {run.relics.length}</div>
      </div>
      <p style={{ fontSize: 12, color: '#a78bfa', maxWidth: 500, textAlign: 'center', marginBottom: 32, lineHeight: 1.6 }}>
        Every failed run teaches something. Try a different strategy next time.
      </p>
      <button onClick={handleRetry} style={{
        padding: '12px 48px', fontSize: 16, fontFamily: 'monospace', fontWeight: 'bold',
        color: '#e0e0e0', background: 'rgba(123, 104, 238, 0.2)',
        border: '2px solid rgba(123, 104, 238, 0.5)', borderRadius: 8, cursor: 'pointer',
      }}>
        Try Again
      </button>
    </div>
  );
}

export function VictoryScreen() {
  const run = useRunStore();
  const meta = useMetaStore();

  const handleNewRun = () => {
    meta.recordRun(3, true);
    run.setScreen('title');
  };

  return (
    <div style={{
      width: '100%', height: '100%',
      background: 'linear-gradient(180deg, #0f2310 0%, #0f0f23 100%)',
      fontFamily: 'monospace', color: '#e0e0e0',
      border: '2px solid #333', borderRadius: 4,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    }}>
      <h1 style={{ fontSize: 36, color: COLORS.hp, margin: '0 0 8px', fontWeight: 'bold' }}>
        SYSTEM ONLINE
      </h1>
      <p style={{ fontSize: 14, color: '#9ca3af', marginBottom: 24 }}>
        You built a complete AI system from nothing.
      </p>
      <p style={{ fontSize: 12, color: '#a78bfa', maxWidth: 500, textAlign: 'center', marginBottom: 32, lineHeight: 1.6 }}>
        LLM to Agent to Orchestrator. That progression is exactly how real AI systems are built. You did it.
      </p>
      <div style={{ display: 'flex', gap: 24, marginBottom: 32, fontSize: 13, color: '#9ca3af' }}>
        <div>Cards: {run.deck.length}</div>
        <div>Relics: {run.relics.length}</div>
        <div>Gold: {run.gold}</div>
      </div>
      <button onClick={handleNewRun} style={{
        padding: '12px 48px', fontSize: 16, fontFamily: 'monospace', fontWeight: 'bold',
        color: '#e0e0e0', background: 'rgba(74, 222, 128, 0.2)',
        border: '2px solid rgba(74, 222, 128, 0.5)', borderRadius: 8, cursor: 'pointer',
      }}>
        New Run
      </button>
    </div>
  );
}
