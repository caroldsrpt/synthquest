import { useRunStore } from './stores/runStore';
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

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
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
  );
}

export default App;
