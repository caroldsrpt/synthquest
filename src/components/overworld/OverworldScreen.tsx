import { useRef, useEffect, useCallback } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { useDialogStore } from '../../stores/dialogStore';
import { useBattleStore } from '../../stores/battleStore';
import { useInput } from '../../hooks/useInput';
import { MAPS } from '../../game/data/maps';
import { NPCS } from '../../game/data/npcs';
import { SYNTH_SPECIES } from '../../game/data/synths';
import { SCALED_TILE, VIEWPORT_WIDTH, VIEWPORT_HEIGHT, PLAYER_SPEED } from '../../utils/constants';
import { createSynth } from '../../utils/synth';
import type { Direction, GameMap } from '../../game/data/types';

const TILE_COLORS: Record<number, string> = {
  0: '#4a7c3f', 1: '#c4a86b', 2: '#3d6ea5', 3: '#7a6b5d',
  4: '#8b7355', 5: '#2d5a27', 6: '#d4a5d0', 7: '#5a4a8a',
};

const DIR_OFFSETS: Record<Direction, { dx: number; dy: number }> = {
  up: { dx: 0, dy: -1 }, down: { dx: 0, dy: 1 },
  left: { dx: -1, dy: 0 }, right: { dx: 1, dy: 0 },
};

const DIR_ARROWS: Record<Direction, string> = {
  up: '\u25B2', down: '\u25BC', left: '\u25C0', right: '\u25B6',
};

const SCALE = 3;

export function OverworldScreen() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { consumeInput } = useInput();
  const animFrame = useRef<number>(0);
  const lastMoveTime = useRef<number>(0);
  const dataStreamPhase = useRef<number>(0);

  const visualPos = useRef({ x: 0, y: 0 });
  const isMoving = useRef(false);
  const moveFrom = useRef({ x: 0, y: 0 });
  const moveTo = useRef({ x: 0, y: 0 });
  const moveProgress = useRef(0);
  const interactCooldown = useRef(0);

  const gamePhase = useGameStore((s) => s.gamePhase);
  const player = useGameStore((s) => s.player);
  const setPosition = useGameStore((s) => s.setPosition);
  const setDirection = useGameStore((s) => s.setDirection);
  const setGamePhase = useGameStore((s) => s.setGamePhase);

  const dialogActive = useDialogStore((s) => s.active);

  useEffect(() => {
    visualPos.current = {
      x: player.position.x * SCALED_TILE,
      y: player.position.y * SCALED_TILE,
    };
  }, [player.currentMapId]);

  const spawnWildEncounter = useCallback((map: GameMap) => {
    if (!map.encounters) return;
    const totalWeight = map.encounters.reduce((sum, e) => sum + e.weight, 0);
    let roll = Math.random() * totalWeight;
    for (const enc of map.encounters) {
      roll -= enc.weight;
      if (roll <= 0) {
        const level = enc.minLevel + Math.floor(Math.random() * (enc.maxLevel - enc.minLevel + 1));
        const wildSynth = createSynth(enc.synthId, level);

        const store = useGameStore.getState();
        const playerSynth = store.party.find((s) => s.currentMemory > 0);
        if (!playerSynth) return;

        const playerIdx = store.party.indexOf(playerSynth);
        useBattleStore.getState().startWildBattle(playerSynth, playerIdx, wildSynth);
        setGamePhase('battle');
        return;
      }
    }
  }, [setGamePhase]);

  const checkEncounter = useCallback((map: GameMap, tileX: number, tileY: number) => {
    if (!map.encounters || !map.encounterRate) return;
    const tileIdx = tileY * map.width + tileX;
    const tileType = map.layers[0].data[tileIdx];
    if (tileType !== 7) return;
    if (Math.random() * 100 < map.encounterRate) {
      spawnWildEncounter(map);
    }
  }, [spawnWildEncounter]);

  const checkWarp = useCallback((map: GameMap, tileX: number, tileY: number) => {
    for (const obj of map.objects) {
      if (obj.type !== 'warp') continue;
      if (tileX >= obj.x && tileX < obj.x + obj.width &&
          tileY >= obj.y && tileY < obj.y + obj.height) {
        const targetMap = obj.properties?.targetMap as string;
        const targetX = obj.properties?.targetX as number;
        const targetY = obj.properties?.targetY as number;
        if (targetMap && targetX != null && targetY != null) {
          const store = useGameStore.getState();
          store.setMap(targetMap);
          store.setPosition(targetX, targetY);
          visualPos.current = { x: targetX * SCALED_TILE, y: targetY * SCALED_TILE };
          isMoving.current = false;
        }
        return;
      }
    }
  }, []);

  const checkInteraction = useCallback((map: GameMap, tileX: number, tileY: number) => {
    if (dialogActive) return false;

    for (const obj of map.objects) {
      if ((obj.type === 'npc' || obj.type === 'sign') && obj.x === tileX && obj.y === tileY) {
        if (obj.type === 'sign') {
          const text = obj.properties?.text as string;
          if (text) {
            useDialogStore.getState().startDialog([{ text }]);
          }
          return true;
        }

        // NPC interaction
        const npcId = obj.properties?.npcId as string;
        const npcData = npcId ? NPCS[npcId] : null;
        if (!npcData) return true;

        const store = useGameStore.getState();
        const flags = store.player.flags;

        // Filter dialog by conditions
        const availableDialog = npcData.dialog.filter(
          (line) => !line.condition || flags[line.condition]
        );

        // Check if trainer already defeated
        if (npcData.trainer && flags[npcData.trainer.defeatFlag]) {
          useDialogStore.getState().startDialog(npcData.trainer.winDialog);
          return true;
        }

        // Start dialog, then handle post-dialog action
        useDialogStore.getState().startDialog(availableDialog, () => {
          // Heal party
          if (npcData.healParty) {
            store.healParty();
          }

          // Open shop
          if (npcData.shop) {
            useDialogStore.getState().openShop(npcData.shop);
            store.setGamePhase('menu');
          }

          // Trainer battle
          if (npcData.trainer && !flags[npcData.trainer.defeatFlag]) {
            const trainerParty = npcData.trainer.party.map((p) => createSynth(p.speciesId, p.level));
            const playerSynth = store.party.find((s) => s.currentMemory > 0);
            if (playerSynth) {
              const playerIdx = store.party.indexOf(playerSynth);
              useBattleStore.getState().startTrainerBattle(playerSynth, playerIdx, trainerParty, npcData.name);
              store.setGamePhase('battle');
              // Set defeat flag and reward after battle is over
              const unsubscribe = useBattleStore.subscribe((state) => {
                if (!state.active && state.phase === 'ended') {
                  store.setFlag(npcData.trainer!.defeatFlag, true);
                  store.addMoney(npcData.trainer!.reward);
                  unsubscribe();
                }
              });
            }
          }
        });

        return true;
      }
    }
    return false;
  }, [dialogActive]);

  // Main game loop
  useEffect(() => {
    if (gamePhase !== 'overworld') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const moveInterval = 1000 / PLAYER_SPEED;

    const loop = (timestamp: number) => {
      const state = useGameStore.getState();
      const dialogState = useDialogStore.getState();
      const map = MAPS[state.player.currentMapId];
      if (!map) { animFrame.current = requestAnimationFrame(loop); return; }

      dataStreamPhase.current = (timestamp / 500) % (Math.PI * 2);

      // Tick interaction cooldown
      if (interactCooldown.current > 0) interactCooldown.current--;

      // Only process input if dialog is not active
      if (!dialogState.active) {
        const input = consumeInput();

        if (input.action && !isMoving.current && interactCooldown.current <= 0) {
          const { dx, dy } = DIR_OFFSETS[state.player.direction];
          checkInteraction(map, state.player.position.x + dx, state.player.position.y + dy);
        }

        if (input.menu) {
          setGamePhase('menu');
        }

        if (isMoving.current) {
          moveProgress.current += (timestamp - lastMoveTime.current) / moveInterval;
          lastMoveTime.current = timestamp;
          if (moveProgress.current >= 1) {
            moveProgress.current = 0;
            isMoving.current = false;
            const newX = moveTo.current.x;
            const newY = moveTo.current.y;
            visualPos.current = { x: newX * SCALED_TILE, y: newY * SCALED_TILE };
            setPosition(newX, newY);
            checkWarp(map, newX, newY);
            checkEncounter(map, newX, newY);
          } else {
            const fromPx = { x: moveFrom.current.x * SCALED_TILE, y: moveFrom.current.y * SCALED_TILE };
            const toPx = { x: moveTo.current.x * SCALED_TILE, y: moveTo.current.y * SCALED_TILE };
            visualPos.current = {
              x: fromPx.x + (toPx.x - fromPx.x) * moveProgress.current,
              y: fromPx.y + (toPx.y - fromPx.y) * moveProgress.current,
            };
          }
        } else if (input.direction) {
          setDirection(input.direction);
          const { dx, dy } = DIR_OFFSETS[input.direction];
          const newX = state.player.position.x + dx;
          const newY = state.player.position.y + dy;
          if (newX >= 0 && newX < map.width && newY >= 0 && newY < map.height &&
              map.collisionLayer[newY * map.width + newX] === 0) {
            moveFrom.current = { x: state.player.position.x, y: state.player.position.y };
            moveTo.current = { x: newX, y: newY };
            moveProgress.current = 0;
            isMoving.current = true;
            lastMoveTime.current = timestamp;
          }
        }
      } else {
        // Consume input to prevent queuing, and set cooldown for when dialog closes
        consumeInput();
        interactCooldown.current = 15; // ~15 frames cooldown after dialog closes
      }

      // === RENDER ===
      ctx.imageSmoothingEnabled = false;
      const camX = visualPos.current.x - VIEWPORT_WIDTH / 2 + SCALED_TILE / 2;
      const camY = visualPos.current.y - VIEWPORT_HEIGHT / 2 + SCALED_TILE / 2;

      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);

      const startTileX = Math.max(0, Math.floor(camX / SCALED_TILE));
      const startTileY = Math.max(0, Math.floor(camY / SCALED_TILE));
      const endTileX = Math.min(map.width, Math.ceil((camX + VIEWPORT_WIDTH) / SCALED_TILE) + 1);
      const endTileY = Math.min(map.height, Math.ceil((camY + VIEWPORT_HEIGHT) / SCALED_TILE) + 1);

      for (let ty = startTileY; ty < endTileY; ty++) {
        for (let tx = startTileX; tx < endTileX; tx++) {
          const tileIdx = ty * map.width + tx;
          const tileType = map.layers[0].data[tileIdx];
          const screenX = tx * SCALED_TILE - camX;
          const screenY = ty * SCALED_TILE - camY;

          ctx.fillStyle = TILE_COLORS[tileType] || '#333';

          if (tileType === 7) {
            const shimmer = Math.sin(dataStreamPhase.current + tx * 0.5 + ty * 0.3) * 0.15;
            ctx.fillStyle = `rgb(${90 + Math.floor(shimmer * 40)},${74 + Math.floor(shimmer * 30)},${138 + Math.floor(shimmer * 50)})`;
          }

          ctx.fillRect(screenX, screenY, SCALED_TILE, SCALED_TILE);

          if (tileType === 5) {
            ctx.fillStyle = '#1d4a17';
            ctx.beginPath();
            ctx.arc(screenX + SCALED_TILE / 2, screenY + SCALED_TILE / 2 - 4, SCALED_TILE * 0.35, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#5a3a1a';
            ctx.fillRect(screenX + SCALED_TILE / 2 - 3, screenY + SCALED_TILE / 2 + 6, 6, 10);
          } else if (tileType === 6) {
            ctx.fillStyle = '#4a7c3f';
            ctx.fillRect(screenX, screenY, SCALED_TILE, SCALED_TILE);
            const colors = ['#ff6b9d', '#ffd93d', '#ff8a65'];
            for (let i = 0; i < 3; i++) {
              ctx.fillStyle = colors[i];
              ctx.beginPath();
              ctx.arc(screenX + 8 + Math.sin(i * 2.1) * 14, screenY + 10 + Math.cos(i * 1.7) * 12, 4, 0, Math.PI * 2);
              ctx.fill();
            }
          } else if (tileType === 3) {
            ctx.strokeStyle = '#6a5b4d';
            ctx.lineWidth = 1;
            for (let by = 0; by < SCALED_TILE; by += 8) {
              const offset = (by / 8) % 2 === 0 ? 0 : SCALED_TILE / 3;
              for (let bx = offset; bx < SCALED_TILE; bx += SCALED_TILE / 2) {
                ctx.strokeRect(screenX + bx, screenY + by, SCALED_TILE / 2, 8);
              }
            }
          }

          ctx.strokeStyle = 'rgba(0,0,0,0.08)';
          ctx.lineWidth = 1;
          ctx.strokeRect(screenX, screenY, SCALED_TILE, SCALED_TILE);
        }
      }

      // NPCs
      for (const obj of map.objects) {
        if (obj.type !== 'npc') continue;
        const nx = obj.x * SCALED_TILE - camX;
        const ny = obj.y * SCALED_TILE - camY;
        ctx.fillStyle = '#e06060';
        ctx.beginPath();
        ctx.arc(nx + SCALED_TILE / 2, ny + SCALED_TILE / 2, SCALED_TILE * 0.35, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = `bold ${Math.max(10, SCALE * 4)}px monospace`;
        ctx.textAlign = 'center';
        ctx.fillText(obj.name, nx + SCALED_TILE / 2, ny - 4);
      }

      // Signs
      for (const obj of map.objects) {
        if (obj.type !== 'sign') continue;
        const sx = obj.x * SCALED_TILE - camX;
        const sy = obj.y * SCALED_TILE - camY;
        ctx.fillStyle = '#b8860b';
        ctx.fillRect(sx + SCALED_TILE * 0.2, sy + SCALED_TILE * 0.15, SCALED_TILE * 0.6, SCALED_TILE * 0.55);
        ctx.fillStyle = '#5a3a1a';
        ctx.fillRect(sx + SCALED_TILE * 0.42, sy + SCALED_TILE * 0.65, SCALED_TILE * 0.16, SCALED_TILE * 0.35);
      }

      // Player
      const px = visualPos.current.x - camX;
      const py = visualPos.current.y - camY;
      ctx.fillStyle = '#7b68ee';
      ctx.beginPath();
      ctx.arc(px + SCALED_TILE / 2, py + SCALED_TILE / 2, SCALED_TILE * 0.38, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = `${SCALE * 5}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(DIR_ARROWS[state.player.direction], px + SCALED_TILE / 2, py + SCALED_TILE / 2);

      // HUD
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(0, 0, VIEWPORT_WIDTH, 28);
      ctx.fillStyle = '#e0e0e0';
      ctx.font = 'bold 14px monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(map.name, 8, 7);

      // Party HP indicator
      const party = state.party;
      ctx.textAlign = 'right';
      ctx.font = '12px monospace';
      const partyText = party.map((s) => {
        const sp = SYNTH_SPECIES[s.speciesId];
        const pct = Math.round((s.currentMemory / s.stats.memory) * 100);
        return `${(sp?.name || '?').slice(0, 3)} ${pct}%`;
      }).join('  ');
      ctx.fillText(partyText, VIEWPORT_WIDTH - 8, 8);

      // Controls hint
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(0, VIEWPORT_HEIGHT - 20, VIEWPORT_WIDTH, 20);
      ctx.fillStyle = '#6b7280';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('[WASD] Move  [Z] Interact  [M] Menu', VIEWPORT_WIDTH / 2, VIEWPORT_HEIGHT - 7);

      animFrame.current = requestAnimationFrame(loop);
    };

    animFrame.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animFrame.current);
  }, [gamePhase, consumeInput, setPosition, setDirection, checkEncounter, checkWarp, checkInteraction, setGamePhase]);

  if (gamePhase !== 'overworld') return null;

  return (
    <canvas
      ref={canvasRef}
      width={VIEWPORT_WIDTH}
      height={VIEWPORT_HEIGHT}
      style={{
        width: VIEWPORT_WIDTH,
        height: VIEWPORT_HEIGHT,
        imageRendering: 'pixelated',
        border: '2px solid #333',
        borderRadius: 4,
      }}
    />
  );
}
