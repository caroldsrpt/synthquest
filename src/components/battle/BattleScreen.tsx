import { useCallback, useEffect, useState } from 'react';
import { useBattleStore } from '../../stores/battleStore';
import { useGameStore } from '../../stores/gameStore';
import { MOVES } from '../../game/data/moves';
import { SYNTH_SPECIES } from '../../game/data/synths';
import { ITEMS } from '../../game/data/items';
import { COLORS, VIEWPORT_WIDTH, VIEWPORT_HEIGHT } from '../../utils/constants';
import {
  resolveTurn,
  chooseOpponentMove,
  calculateCaptureRate,
  calculateXP,
} from '../../game/systems/BattleSystem';
import { xpForLevel, calculateStats, getMovesForLevel } from '../../utils/synth';

function SynthSprite({ speciesId, isPlayer, fainted }: { speciesId: string; isPlayer: boolean; fainted: boolean }) {
  const species = SYNTH_SPECIES[speciesId];
  const typeColor = species ? COLORS.types[species.types[0]] : '#888';

  return (
    <div
      style={{
        width: 96,
        height: 96,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.3s',
        opacity: fainted ? 0.3 : 1,
        transform: fainted ? 'translateY(20px)' : isPlayer ? 'scaleX(-1)' : 'none',
      }}
    >
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          background: `radial-gradient(circle at 35% 35%, ${typeColor}, ${typeColor}88)`,
          border: `3px solid ${typeColor}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 28,
          fontWeight: 'bold',
          color: '#fff',
          textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
          fontFamily: 'monospace',
          transform: isPlayer ? 'scaleX(-1)' : 'none',
        }}
      >
        {(species?.name || '?').slice(0, 2).toUpperCase()}
      </div>
    </div>
  );
}

function HPBar({ current, max, label, level, name, statusEffects }: {
  current: number; max: number; label?: string; level: number; name: string;
  statusEffects: { effect: string; turnsLeft: number }[];
}) {
  const pct = Math.max(0, Math.min(100, (current / max) * 100));
  const barColor = pct > 50 ? COLORS.hp : pct > 20 ? '#fbbf24' : COLORS.hpLow;

  return (
    <div style={{ minWidth: 200 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 2 }}>
        <span style={{ fontWeight: 'bold', fontSize: 14 }}>{name}</span>
        <span style={{ fontSize: 11, color: '#9ca3af' }}>Lv.{level}</span>
      </div>
      <div
        style={{
          width: '100%',
          height: 10,
          background: '#1f2937',
          borderRadius: 5,
          overflow: 'hidden',
          border: '1px solid #374151',
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            background: barColor,
            borderRadius: 5,
            transition: 'width 0.5s ease',
          }}
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
        <span style={{ fontSize: 10, color: '#6b7280' }}>
          {current}/{max}
        </span>
        <div style={{ display: 'flex', gap: 4 }}>
          {statusEffects.map((s) => (
            <span
              key={s.effect}
              style={{
                fontSize: 9,
                padding: '1px 4px',
                borderRadius: 3,
                background: s.effect === 'grounded' ? '#059669' : '#7c3aed',
                color: '#fff',
                fontWeight: 'bold',
              }}
            >
              {s.effect.slice(0, 3).toUpperCase()}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function BattleScreen() {
  const battle = useBattleStore();
  const gameStore = useGameStore();
  const [selectedMove, setSelectedMove] = useState(0);
  const [subMenu, setSubMenu] = useState<'main' | 'fight' | 'bag' | 'switch'>('main');
  const [shakePlayer, setShakePlayer] = useState(false);
  const [shakeOpponent, setShakeOpponent] = useState(false);
  const [animating, setAnimating] = useState(false);

  const playerSpecies = battle.playerSynth ? SYNTH_SPECIES[battle.playerSynth.speciesId] : null;
  const opponentSpecies = battle.opponentSynth ? SYNTH_SPECIES[battle.opponentSynth.speciesId] : null;
  const playerName = battle.playerSynth?.nickname || playerSpecies?.name || '???';
  const opponentName = battle.opponentSynth?.nickname || opponentSpecies?.name || '???';

  const handleFight = useCallback(async (moveIndex: number) => {
    if (!battle.playerSynth || !battle.opponentSynth || animating) return;

    setAnimating(true);
    battle.setPhase('animating');

    const opponentMoveIdx = chooseOpponentMove(battle.opponentSynth);
    const result = resolveTurn(
      battle.playerSynth,
      battle.opponentSynth,
      moveIndex,
      opponentMoveIdx
    );

    // Play through messages
    for (const msg of result.messages) {
      battle.updatePlayerSynth(result.playerSynth);
      battle.updateOpponentSynth(result.opponentSynth);

      // Trigger shake effects based on message
      if (msg.includes('dealt') && msg.includes('damage')) {
        if (result.playerSynth.stats.speed >= result.opponentSynth.stats.speed) {
          setShakeOpponent(true);
          setTimeout(() => setShakeOpponent(false), 300);
        } else {
          setShakePlayer(true);
          setTimeout(() => setShakePlayer(false), 300);
        }
      }

      battle.pushMessage(msg);
      battle.nextMessage();
      battle.setPhase('message');
      await new Promise((r) => setTimeout(r, 800));
    }

    // Check faint
    if (result.opponentFainted) {
      battle.pushMessage(`${opponentName} fainted!`);
      battle.nextMessage();
      await new Promise((r) => setTimeout(r, 1000));

      // Check for more opponent synths (trainer battle)
      if (battle.type === 'trainer') {
        const next = battle.nextOpponentSynth();
        if (next) {
          const nextSpecies = SYNTH_SPECIES[next.speciesId];
          battle.pushMessage(`${battle.opponentName} sent out ${nextSpecies?.name || next.speciesId}!`);
          battle.nextMessage();
          await new Promise((r) => setTimeout(r, 1000));
          battle.setPhase('select');
          setSubMenu('main');
          setAnimating(false);
          return;
        }
      }

      // XP gain
      const xp = calculateXP(battle.opponentSynth!);
      battle.setXpGained(xp);
      battle.pushMessage(`Gained ${xp} XP!`);
      battle.nextMessage();
      await new Promise((r) => setTimeout(r, 1000));

      // Apply XP to party synth
      const party = gameStore.party;
      const partyIdx = battle.playerPartyIndex;
      if (party[partyIdx]) {
        let updatedSynth = { ...result.playerSynth, xp: result.playerSynth.xp + xp };
        const needed = xpForLevel(updatedSynth.level);

        if (updatedSynth.xp >= needed) {
          updatedSynth.level++;
          updatedSynth.xp -= needed;
          updatedSynth.stats = calculateStats(updatedSynth.speciesId, updatedSynth.level);
          updatedSynth.currentMemory = Math.min(updatedSynth.currentMemory + 10, updatedSynth.stats.memory);

          // Check for new moves
          const allMoves = getMovesForLevel(updatedSynth.speciesId, updatedSynth.level);
          const currentMoveIds = updatedSynth.moves.map((m) => m.moveId);
          const newMoves = allMoves.filter((id) => !currentMoveIds.includes(id));
          for (const moveId of newMoves) {
            if (updatedSynth.moves.length < 4) {
              updatedSynth.moves.push({ moveId, currentPP: MOVES[moveId]?.pp || 10 });
              battle.pushMessage(`${playerName} learned ${MOVES[moveId]?.name || moveId}!`);
              battle.nextMessage();
              await new Promise((r) => setTimeout(r, 1000));
            }
          }

          battle.pushMessage(`${playerName} grew to level ${updatedSynth.level}!`);
          battle.nextMessage();
          await new Promise((r) => setTimeout(r, 1200));
        }

        battle.updatePlayerSynth(updatedSynth);
        gameStore.updatePartySynth(partyIdx, updatedSynth);
      }

      // Trainer reward
      if (battle.type === 'trainer') {
        // reward money handled externally
      }

      battle.setPhase('ended');
      await new Promise((r) => setTimeout(r, 500));
      battle.endBattle();
      gameStore.setGamePhase('overworld');
    } else if (result.playerFainted) {
      battle.pushMessage(`${playerName} fainted!`);
      battle.nextMessage();
      await new Promise((r) => setTimeout(r, 1000));

      // Check for more party synths
      const aliveSynth = gameStore.party.findIndex(
        (s, i) => i !== battle.playerPartyIndex && s.currentMemory > 0
      );
      if (aliveSynth >= 0) {
        battle.pushMessage('Send out another Synth!');
        battle.nextMessage();
        battle.setPhase('switch');
        setSubMenu('switch');
      } else {
        battle.pushMessage('All your Synths fainted! You blacked out...');
        battle.nextMessage();
        await new Promise((r) => setTimeout(r, 1500));
        // Heal and return to last town
        gameStore.healParty();
        battle.endBattle();
        gameStore.setGamePhase('overworld');
      }
    } else {
      battle.setPhase('select');
      setSubMenu('main');
    }

    setAnimating(false);
    battle.incrementTurn();
  }, [battle, gameStore, animating, playerName, opponentName]);

  const handleCapture = useCallback(async () => {
    if (!battle.opponentSynth || battle.type !== 'wild' || animating) return;

    const hasDataPack = (gameStore.inventory['dataPack'] || 0) > 0;
    if (!hasDataPack) {
      battle.pushMessage("You don't have any Data Packs!");
      battle.nextMessage();
      return;
    }

    setAnimating(true);
    gameStore.removeItem('dataPack');
    battle.pushMessage(`You threw a Data Pack!`);
    battle.nextMessage();
    battle.setPhase('message');
    await new Promise((r) => setTimeout(r, 1000));

    const captured = calculateCaptureRate(battle.opponentSynth, 1);
    if (captured) {
      battle.setCaptured(true);
      const species = SYNTH_SPECIES[battle.opponentSynth.speciesId];
      battle.pushMessage(`Gotcha! ${species?.name || 'Synth'} was captured!`);
      battle.nextMessage();
      await new Promise((r) => setTimeout(r, 1200));

      // Add to party
      const added = gameStore.addToParty({ ...battle.opponentSynth });
      if (!added) {
        battle.pushMessage(`${species?.name} was sent to PC storage. (Party full)`);
        battle.nextMessage();
        await new Promise((r) => setTimeout(r, 1000));
      }

      battle.endBattle();
      gameStore.setGamePhase('overworld');
    } else {
      battle.pushMessage('Oh no! It broke free!');
      battle.nextMessage();
      await new Promise((r) => setTimeout(r, 800));

      // Opponent gets a free turn
      const opponentMoveIdx = chooseOpponentMove(battle.opponentSynth);
      const result = resolveTurn(
        battle.playerSynth!,
        battle.opponentSynth,
        0, // doesn't matter, player didn't attack
        opponentMoveIdx
      );
      // Only apply opponent's attack
      battle.updatePlayerSynth(result.playerSynth);
      battle.updateOpponentSynth(result.opponentSynth);

      battle.setPhase('select');
      setSubMenu('main');
    }

    setAnimating(false);
  }, [battle, gameStore, animating]);

  const handleFlee = useCallback(async () => {
    if (battle.type !== 'wild' || animating) return;
    setAnimating(true);

    // 75% flee chance
    if (Math.random() < 0.75) {
      battle.pushMessage('Got away safely!');
      battle.nextMessage();
      await new Promise((r) => setTimeout(r, 800));
      battle.endBattle();
      gameStore.setGamePhase('overworld');
    } else {
      battle.pushMessage("Can't escape!");
      battle.nextMessage();
      await new Promise((r) => setTimeout(r, 600));

      // Opponent attacks
      if (battle.opponentSynth) {
        const opMoveIdx = chooseOpponentMove(battle.opponentSynth);
        const result = resolveTurn(battle.playerSynth!, battle.opponentSynth, 0, opMoveIdx);
        battle.updatePlayerSynth(result.playerSynth);
        battle.updateOpponentSynth(result.opponentSynth);
        for (const msg of result.messages.slice(result.messages.length / 2)) {
          battle.pushMessage(msg);
          battle.nextMessage();
          await new Promise((r) => setTimeout(r, 600));
        }
      }

      battle.setPhase('select');
      setSubMenu('main');
    }

    setAnimating(false);
  }, [battle, gameStore, animating]);

  const handleSwitchSynth = useCallback((index: number) => {
    const synth = gameStore.party[index];
    if (!synth || synth.currentMemory <= 0 || index === battle.playerPartyIndex) return;

    // Update the fainted synth in party
    if (battle.playerSynth) {
      gameStore.updatePartySynth(battle.playerPartyIndex, battle.playerSynth);
    }

    const species = SYNTH_SPECIES[synth.speciesId];
    battle.updatePlayerSynth(synth);
    useBattleStore.setState({ playerPartyIndex: index });
    battle.pushMessage(`Go, ${synth.nickname || species?.name || synth.speciesId}!`);
    battle.nextMessage();
    battle.setPhase('select');
    setSubMenu('main');
  }, [battle, gameStore]);

  // Keyboard controls for menus
  useEffect(() => {
    if (battle.phase !== 'select' || animating) return;

    const onKey = (e: KeyboardEvent) => {
      if (subMenu === 'fight') {
        const moves = battle.playerSynth?.moves || [];
        if (e.key === 'ArrowUp' || e.key === 'w') {
          setSelectedMove((p) => Math.max(0, p - 1));
        } else if (e.key === 'ArrowDown' || e.key === 's') {
          setSelectedMove((p) => Math.min(moves.length - 1, p + 1));
        } else if (e.key === 'z' || e.key === 'Z' || e.key === 'Enter') {
          handleFight(selectedMove);
        } else if (e.key === 'x' || e.key === 'X' || e.key === 'Escape') {
          setSubMenu('main');
        }
      } else if (subMenu === 'main') {
        // Main menu: Fight, Bag, Switch, Flee
        if (e.key === 'z' || e.key === 'Z' || e.key === 'Enter') {
          setSubMenu('fight');
          setSelectedMove(0);
        }
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [battle.phase, subMenu, selectedMove, animating, handleFight, battle.playerSynth?.moves]);

  // Handle intro phase auto-advance
  useEffect(() => {
    if (battle.phase === 'intro') {
      const timer = setTimeout(() => battle.setPhase('select'), 1500);
      return () => clearTimeout(timer);
    }
  }, [battle.phase, battle]);

  if (!battle.active || !battle.playerSynth || !battle.opponentSynth) return null;

  return (
    <div
      style={{
        width: VIEWPORT_WIDTH,
        height: VIEWPORT_HEIGHT,
        background: 'linear-gradient(180deg, #1e1b4b 0%, #312e81 40%, #1e1b4b 100%)',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'monospace',
        color: '#e0e0e0',
        border: '2px solid #333',
        borderRadius: 4,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Battle field */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '12px 16px',
        }}
      >
        {/* Opponent side */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <HPBar
            current={battle.opponentSynth.currentMemory}
            max={battle.opponentSynth.stats.memory}
            level={battle.opponentSynth.level}
            name={`${battle.opponentName !== 'Wild' ? battle.opponentName + "'s " : ''}${opponentName}`}
            statusEffects={battle.opponentSynth.statusEffects}
          />
          <div style={{
            transform: shakeOpponent ? 'translateX(5px)' : 'none',
            transition: 'transform 0.1s',
          }}>
            <SynthSprite
              speciesId={battle.opponentSynth.speciesId}
              isPlayer={false}
              fainted={battle.opponentSynth.currentMemory <= 0}
            />
          </div>
        </div>

        {/* Player side */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div style={{
            transform: shakePlayer ? 'translateX(-5px)' : 'none',
            transition: 'transform 0.1s',
          }}>
            <SynthSprite
              speciesId={battle.playerSynth.speciesId}
              isPlayer={true}
              fainted={battle.playerSynth.currentMemory <= 0}
            />
          </div>
          <HPBar
            current={battle.playerSynth.currentMemory}
            max={battle.playerSynth.stats.memory}
            level={battle.playerSynth.level}
            name={playerName}
            statusEffects={battle.playerSynth.statusEffects}
          />
        </div>
      </div>

      {/* Message / Menu area */}
      <div
        style={{
          height: 160,
          background: 'rgba(15, 15, 35, 0.95)',
          borderTop: '2px solid #7b68ee',
          padding: '8px 12px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Message display during intro/animating/message phases */}
        {(battle.phase === 'intro' || battle.phase === 'message' || battle.phase === 'animating') && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', fontSize: 15, padding: '0 4px' }}>
            {battle.currentMessage}
          </div>
        )}

        {/* Main action menu */}
        {battle.phase === 'select' && subMenu === 'main' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, flex: 1 }}>
            <MenuButton label="FIGHT" onClick={() => { setSubMenu('fight'); setSelectedMove(0); }} color="#ef4444" />
            <MenuButton label="BAG" onClick={() => setSubMenu('bag')} color="#f59e0b" />
            <MenuButton label="SYNTHS" onClick={() => setSubMenu('switch')} color="#10b981" />
            <MenuButton
              label="FLEE"
              onClick={handleFlee}
              color="#6b7280"
              disabled={battle.type === 'trainer'}
            />
          </div>
        )}

        {/* Move selection */}
        {battle.phase === 'select' && subMenu === 'fight' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, flex: 1 }}>
              {battle.playerSynth.moves.map((m, i) => {
                const move = MOVES[m.moveId];
                if (!move) return null;
                const typeColor = COLORS.types[move.type] || '#888';
                return (
                  <button
                    key={m.moveId}
                    onClick={() => handleFight(i)}
                    style={{
                      background: selectedMove === i ? `${typeColor}33` : 'rgba(255,255,255,0.05)',
                      border: `2px solid ${selectedMove === i ? typeColor : '#374151'}`,
                      borderRadius: 6,
                      color: '#e0e0e0',
                      fontFamily: 'monospace',
                      cursor: 'pointer',
                      padding: '6px 8px',
                      textAlign: 'left',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2,
                    }}
                    onMouseEnter={() => setSelectedMove(i)}
                  >
                    <div style={{ fontWeight: 'bold', fontSize: 13 }}>{move.name}</div>
                    <div style={{ fontSize: 10, display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: typeColor, textTransform: 'uppercase' }}>{move.type}</span>
                      <span style={{ color: '#9ca3af' }}>PP {m.currentPP}/{move.pp}</span>
                    </div>
                    <div style={{ fontSize: 10, color: '#6b7280' }}>
                      {move.power > 0 ? `PWR ${move.power}` : 'Status'} | ACC {move.accuracy}
                    </div>
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setSubMenu('main')}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid #374151',
                borderRadius: 4,
                color: '#9ca3af',
                fontFamily: 'monospace',
                cursor: 'pointer',
                padding: '4px 8px',
                fontSize: 11,
              }}
            >
              [X] Back
            </button>
          </div>
        )}

        {/* Bag / Capture */}
        {battle.phase === 'select' && subMenu === 'bag' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
            <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>BAG</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {battle.type === 'wild' && (
                <button
                  onClick={handleCapture}
                  style={{
                    ...itemBtnStyle,
                    opacity: (gameStore.inventory['dataPack'] || 0) > 0 ? 1 : 0.4,
                  }}
                >
                  Data Pack x{gameStore.inventory['dataPack'] || 0}
                </button>
              )}
              {Object.entries(gameStore.inventory)
                .filter(([id, count]) => count > 0 && ITEMS[id]?.category === 'healing')
                .map(([id, count]) => (
                  <button
                    key={id}
                    onClick={async () => {
                      const item = ITEMS[id];
                      if (!item?.effect || !battle.playerSynth) return;
                      setAnimating(true);
                      gameStore.removeItem(id);
                      if (item.effect.type === 'heal') {
                        const healed = Math.min(
                          battle.playerSynth.stats.memory,
                          battle.playerSynth.currentMemory + item.effect.amount
                        );
                        battle.updatePlayerSynth({ ...battle.playerSynth, currentMemory: healed });
                        battle.pushMessage(`Used ${item.name}! Restored ${item.effect.amount} Memory.`);
                      } else if (item.effect.type === 'cureStatus') {
                        const cured = {
                          ...battle.playerSynth,
                          statusEffects: item.effect.status === 'all'
                            ? []
                            : battle.playerSynth.statusEffects.filter((s) => s.effect !== item.effect!.type),
                          currentMemory: item.effect.status === 'all'
                            ? battle.playerSynth.stats.memory
                            : battle.playerSynth.currentMemory,
                        };
                        battle.updatePlayerSynth(cured);
                        battle.pushMessage(`Used ${item.name}!`);
                      }
                      battle.nextMessage();
                      battle.setPhase('message');
                      await new Promise((r) => setTimeout(r, 800));

                      // Opponent turn
                      if (battle.opponentSynth && battle.opponentSynth.currentMemory > 0) {
                        const opMoveIdx = chooseOpponentMove(battle.opponentSynth);
                        const result = resolveTurn(
                          battle.playerSynth!,
                          battle.opponentSynth,
                          -1,
                          opMoveIdx
                        );
                        battle.updateOpponentSynth(result.opponentSynth);
                        // Only show opponent's moves
                        for (const msg of result.messages) {
                          battle.pushMessage(msg);
                          battle.nextMessage();
                          await new Promise((r) => setTimeout(r, 600));
                        }
                      }

                      battle.setPhase('select');
                      setSubMenu('main');
                      setAnimating(false);
                    }}
                    style={itemBtnStyle}
                  >
                    {ITEMS[id]?.name} x{count}
                  </button>
                ))}
            </div>
            <button onClick={() => setSubMenu('main')} style={backBtnStyle}>[X] Back</button>
          </div>
        )}

        {/* Switch Synth */}
        {(battle.phase === 'select' || battle.phase === 'switch') && subMenu === 'switch' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
            <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>CHOOSE A SYNTH</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {gameStore.party.map((synth, i) => {
                const sp = SYNTH_SPECIES[synth.speciesId];
                const isActive = i === battle.playerPartyIndex;
                const fainted = synth.currentMemory <= 0;
                return (
                  <button
                    key={synth.id}
                    onClick={() => handleSwitchSynth(i)}
                    disabled={isActive || fainted}
                    style={{
                      ...itemBtnStyle,
                      opacity: isActive || fainted ? 0.4 : 1,
                      borderColor: isActive ? '#7b68ee' : '#374151',
                    }}
                  >
                    {synth.nickname || sp?.name} Lv.{synth.level}
                    <span style={{ fontSize: 10, color: '#6b7280', marginLeft: 6 }}>
                      {synth.currentMemory}/{synth.stats.memory}
                    </span>
                    {isActive && <span style={{ fontSize: 10, color: '#7b68ee', marginLeft: 4 }}>(Active)</span>}
                    {fainted && <span style={{ fontSize: 10, color: '#ef4444', marginLeft: 4 }}>(Fainted)</span>}
                  </button>
                );
              })}
            </div>
            {battle.phase !== 'switch' && (
              <button onClick={() => setSubMenu('main')} style={backBtnStyle}>[X] Back</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function MenuButton({ label, onClick, color, disabled }: {
  label: string; onClick: () => void; color: string; disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: disabled ? 'rgba(255,255,255,0.03)' : `${color}22`,
        border: `2px solid ${disabled ? '#374151' : color}`,
        borderRadius: 8,
        color: disabled ? '#4b5563' : '#e0e0e0',
        fontFamily: 'monospace',
        fontWeight: 'bold',
        fontSize: 16,
        cursor: disabled ? 'default' : 'pointer',
        letterSpacing: 1,
      }}
    >
      {label}
    </button>
  );
}

const itemBtnStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid #374151',
  borderRadius: 6,
  color: '#e0e0e0',
  fontFamily: 'monospace',
  cursor: 'pointer',
  padding: '6px 12px',
  fontSize: 12,
};

const backBtnStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid #374151',
  borderRadius: 4,
  color: '#9ca3af',
  fontFamily: 'monospace',
  cursor: 'pointer',
  padding: '4px 8px',
  fontSize: 11,
  marginTop: 'auto',
};
