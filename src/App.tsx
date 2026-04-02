import { useRunStore } from './stores/runStore';
import { TitleScreen } from './components/screens/TitleScreen';
import { MapScreen } from './components/screens/MapScreen';
import { CombatScreen } from './components/screens/CombatScreen';
import { RestScreen } from './components/screens/RestScreen';
import { GameOverScreen, VictoryScreen } from './components/screens/GameOverScreen';

function App() {
  const screen = useRunStore((s) => s.screen);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      {screen === 'title' && <TitleScreen />}
      {screen === 'map' && <MapScreen />}
      {screen === 'combat' && <CombatScreen />}
      {screen === 'rest' && <RestScreen />}
      {screen === 'gameOver' && <GameOverScreen />}
      {screen === 'victory' && <VictoryScreen />}
      {screen === 'event' && <PlaceholderScreen label="Event" />}
      {screen === 'shop' && <PlaceholderScreen label="Shop" />}
      {screen === 'knowledgeBase' && <PlaceholderScreen label="Knowledge Base" />}
    </div>
  );
}

function PlaceholderScreen({ label }: { label: string }) {
  const setScreen = useRunStore((s) => s.setScreen);
  return (
    <div style={{ ...fullScreen, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: 20, marginBottom: 16 }}>{label} (Coming Soon)</div>
      <button
        onClick={() => setScreen('map')}
        style={{
          padding: '10px 24px', background: 'rgba(123, 104, 238, 0.2)',
          border: '2px solid #7b68ee', borderRadius: 8, color: '#e0e0e0',
          fontFamily: 'monospace', cursor: 'pointer',
        }}
      >
        Back to Map
      </button>
    </div>
  );
}

export const fullScreen: React.CSSProperties = {
  width: '100%', height: '100%',
  background: '#0c0c1a', fontFamily: 'monospace', color: '#e0e0e0',
};

export default App;
