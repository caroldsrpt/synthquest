import { useEffect } from 'react';
import { useGameStore } from './stores/gameStore';
import { useDialogStore } from './stores/dialogStore';
import { useBattleStore } from './stores/battleStore';
import { TitleScreen } from './components/ui/TitleScreen';
import { OverworldScreen } from './components/overworld/OverworldScreen';
import { DialogBox } from './components/ui/DialogBox';
import { BattleScreen } from './components/battle/BattleScreen';
import { MenuScreen } from './components/ui/MenuScreen';
import { ShopScreen } from './components/ui/ShopScreen';
import { VIEWPORT_WIDTH, VIEWPORT_HEIGHT } from './utils/constants';

function App() {
  const gamePhase = useGameStore((s) => s.gamePhase);
  const setGamePhase = useGameStore((s) => s.setGamePhase);
  const dialogActive = useDialogStore((s) => s.active);
  const battleActive = useBattleStore((s) => s.active);
  const shopItems = useDialogStore((s) => s.shopItems);

  // Escape key returns to overworld from menu
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && gamePhase === 'menu' && !shopItems) {
        setGamePhase('overworld');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [gamePhase, shopItems, setGamePhase]);

  return (
    <div style={{ width: VIEWPORT_WIDTH, height: VIEWPORT_HEIGHT, position: 'relative' }}>
      {gamePhase === 'title' && <TitleScreen />}

      {gamePhase === 'overworld' && (
        <>
          <OverworldScreen />
          {dialogActive && <DialogBox />}
        </>
      )}

      {gamePhase === 'battle' && battleActive && <BattleScreen />}

      {gamePhase === 'menu' && !shopItems && (
        <MenuScreen onClose={() => setGamePhase('overworld')} />
      )}

      {gamePhase === 'menu' && shopItems && <ShopScreen />}
    </div>
  );
}

export default App;
