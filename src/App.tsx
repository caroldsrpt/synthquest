import { useRunStore } from './stores/runStore';
import { useViewportScale } from './hooks/useViewportScale';
import { VIEWPORT_WIDTH, VIEWPORT_HEIGHT } from './utils/constants';
import { TitleScreen } from './components/screens/TitleScreen';
import { MapScreen } from './components/screens/MapScreen';
import { CombatScreen } from './components/screens/CombatScreen';
import { RestScreen } from './components/screens/RestScreen';
import { ScenarioScreen } from './components/screens/ScenarioScreen';
import { GameOverScreen, VictoryScreen } from './components/screens/GameOverScreen';
import { ShopScreen } from './components/screens/ShopScreen';
import { EventScreen } from './components/screens/EventScreen';
import { KnowledgeBaseScreen } from './components/screens/KnowledgeBaseScreen';

function App() {
  const screen = useRunStore((s) => s.screen);
  const scale = useViewportScale();

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      background: '#0a0a0a',
    }}>
      <div style={{
        width: VIEWPORT_WIDTH,
        height: VIEWPORT_HEIGHT,
        minWidth: VIEWPORT_WIDTH,
        minHeight: VIEWPORT_HEIGHT,
        maxWidth: VIEWPORT_WIDTH,
        maxHeight: VIEWPORT_HEIGHT,
        position: 'relative',
        overflow: 'hidden',
        transform: `scale(${scale})`,
        transformOrigin: 'center center',
      }}>
        {screen === 'title' && <TitleScreen />}
        {screen === 'map' && <MapScreen />}
        {screen === 'combat' && <CombatScreen />}
        {screen === 'rest' && <RestScreen />}
        {screen === 'scenario' && <ScenarioScreen />}
        {screen === 'gameOver' && <GameOverScreen />}
        {screen === 'victory' && <VictoryScreen />}
        {screen === 'event' && <EventScreen />}
        {screen === 'shop' && <ShopScreen />}
        {screen === 'knowledgeBase' && <KnowledgeBaseScreen />}
      </div>
    </div>
  );
}

export default App;
