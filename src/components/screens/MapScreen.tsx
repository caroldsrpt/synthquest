import { useEffect, useRef, useState } from 'react';
import { useRunStore } from '../../stores/runStore';
import { useCombatStore } from '../../stores/combatStore';
import { DeckViewerOverlay } from '../shared/DeckViewerOverlay';
import { RelicBar } from '../shared/RelicBar';
import { generateMap } from '../../game/systems/MapGenerator';
import { createEnemy, ACT_ENCOUNTERS, ELITE_ENCOUNTERS, BOSS_ENCOUNTERS } from '../../game/data/enemies';
import { weightedPick, randInt } from '../../utils/random';
import { COMBAT_GOLD_MIN, COMBAT_GOLD_MAX, ELITE_GOLD_MIN, ELITE_GOLD_MAX, BOSS_GOLD_MIN, BOSS_GOLD_MAX } from '../../utils/constants';
import { generateCardRewards } from '../../utils/cardUtils';
import { getRelicsByRarity } from '../../game/data/relics';
import { SCENARIOS } from '../../game/data/scenarios';
import { getEventsForAct } from '../../game/data/events';
import type { MapNode } from '../../game/data/types';

const PIXEL = "'Press Start 2P', monospace";

const PX_OUTLINE = [
  '-1px -1px 0 #000', ' 1px -1px 0 #000',
  '-1px  1px 0 #000', ' 1px  1px 0 #000',
  ' 0   -1px 0 #000', ' 0    1px 0 #000',
  '-1px  0   0 #000', ' 1px  0   0 #000',
].join(', ');

const NODE_ICONS: Record<string, string> = {
  combat: '\u2694\uFE0F', elite: '\uD83D\uDC80', event: '\u2753',
  shop: '\uD83D\uDCB0', rest: '\u2764\uFE0F', boss: '\u2B50',
  scenario: '\uD83D\uDCA1',
};

const NODE_COLORS: Record<string, string> = {
  combat: '#9ca3af', elite: '#f59e0b', event: '#a78bfa',
  shop: '#34d399', rest: '#60a5fa', boss: '#ef4444',
  scenario: '#fbbf24',
};

const NODE_LABELS: Record<string, string> = {
  combat: 'Combat', elite: 'Elite', event: 'Event',
  shop: 'Shop', rest: 'Rest', boss: 'BOSS', scenario: 'Lesson',
};

const ACT_NAMES: Record<number, string> = {
  1: 'The Prompt Lab',
  2: 'The Integration Hub',
  3: 'The Orchestration Layer',
};

function getNodeLabel(node: MapNode): string {
  if (node.type === 'scenario' && node.scenarioId) {
    const s = SCENARIOS[node.scenarioId];
    return s ? s.title : 'Lesson';
  }
  return NODE_LABELS[node.type] || node.type;
}

export function MapScreen() {
  const run = useRunStore();
  const [showDeck, setShowDeck] = useState(false);

  useEffect(() => {
    if (run.map.length === 0) {
      const map = generateMap(run.act);
      run.setMap(map);
    }
  }, [run.act, run.map.length]);

  const canVisit = (node: MapNode): boolean => {
    if (node.visited) return false;
    if (run.visitedNodeIds.length === 0) return node.row === 0;
    const lastVisitedId = run.visitedNodeIds[run.visitedNodeIds.length - 1];
    for (const row of run.map) {
      for (const n of row) {
        if (n.id === lastVisitedId && n.connections.includes(node.id)) return true;
      }
    }
    return false;
  };

  const handleClick = (node: MapNode) => {
    if (!canVisit(node)) return;
    run.visitNode(node.id);
    run.setCurrentNode(node.id);

    if (node.type === 'combat' || node.type === 'elite' || node.type === 'boss') {
      let enc;
      if (node.type === 'boss') enc = BOSS_ENCOUNTERS[run.act];
      else if (node.type === 'elite') enc = ELITE_ENCOUNTERS[run.act];
      else {
        const encs = ACT_ENCOUNTERS[run.act];
        enc = weightedPick(encs, encs.map((e) => e.weight));
      }
      const enemies = enc.enemies.map((e) => createEnemy(e.defId, e.hpMult, e.atkBonus));
      const gold = node.type === 'boss' ? randInt(BOSS_GOLD_MIN, BOSS_GOLD_MAX)
        : node.type === 'elite' ? randInt(ELITE_GOLD_MIN, ELITE_GOLD_MAX)
        : randInt(COMBAT_GOLD_MIN, COMBAT_GOLD_MAX);
      useCombatStore.getState().initCombat([...run.deck], enemies, run.getMaxEnergy());
      // Generate relic reward for elite/boss fights
      let relicReward = null;
      if (node.type === 'elite' || node.type === 'boss') {
        const owned = run.relics;
        const pool = node.type === 'boss'
          ? getRelicsByRarity('boss').concat(getRelicsByRarity('rare'))
          : getRelicsByRarity('uncommon').concat(getRelicsByRarity('common'));
        const available = pool.filter((r) => !owned.includes(r.id));
        if (available.length > 0) {
          relicReward = available[Math.floor(Math.random() * available.length)];
        }
      }
      useCombatStore.getState().setRewards(gold, generateCardRewards(run.act, node.type === 'boss' ? 'boss' : node.type === 'elite' ? 'elite' : 'normal'), relicReward);
      run.setScreen('combat');
    } else if (node.type === 'scenario' && node.scenarioId) {
      run.setCurrentScenario(node.scenarioId);
      run.setScreen('scenario');
    } else if (node.type === 'event') {
      const pool = getEventsForAct(run.act);
      const picked = pool[Math.floor(Math.random() * pool.length)];
      run.setCurrentEvent(picked.id);
      run.setScreen('event');
    } else {
      run.setScreen(node.type as 'rest' | 'shop');
    }
  };

  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 960, h: 600 });
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setDims({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    setDims({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  if (run.map.length === 0) return null;

  const headerH = 52;
  const legendH = 36;
  const padY = 24;
  const mapH = dims.h - headerH - legendH - padY * 2;
  const mapW = dims.w;
  // Use more horizontal space — spread lanes across 60% of width
  const gridW = mapW * 0.6;
  const colW = gridW / 3;
  const startX = (mapW - gridW) / 2;
  // Cap vertical spacing so nodes aren't too spread on tall screens
  const rowGap = Math.min(mapH / Math.max(run.map.length - 1, 1), 80);
  const totalMapH = rowGap * (run.map.length - 1);
  const mapOffsetY = (mapH - totalMapH) / 2; // center vertically if capped
  const maxRow = run.map.length - 1;

  // FLIPPED: row 0 at bottom, boss at top
  const getX = (col: number) => startX + col * colW + colW / 2;
  const getY = (row: number) => headerH + padY + mapOffsetY + rowGap * (maxRow - row);

  return (
    <div ref={containerRef} style={{
      width: '100%', height: '100%',
      position: 'relative', overflow: 'hidden',
      background: '#0c0a14',
    }}>
      {/* Parchment background */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'url(/sprites/map-bg.png)',
        backgroundSize: 'cover',
        imageRendering: 'pixelated',
        opacity: 0.3,
      }} />

      {/* Header — RPG panel style */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        height: headerH,
        padding: '0 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(12, 8, 24, 0.9)',
        borderBottom: '3px solid #6b4fa0',
        boxShadow: 'inset 0 -2px 0 #3d2d5c, 0 4px 12px rgba(0,0,0,0.5)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{
            fontFamily: PIXEL,
            fontSize: 12,
            color: '#c4b89a',
            textShadow: PX_OUTLINE,
            letterSpacing: 1,
          }}>
            Act {run.act}: {ACT_NAMES[run.act]}
          </span>
          <RelicBar relicIds={run.relics} />
        </div>
        <div style={{ display: 'flex', gap: 20, fontFamily: PIXEL, fontSize: 9 }}>
          <span style={{ color: '#fbbf24', textShadow: PX_OUTLINE }}>
            {run.gold}g
          </span>
          <span style={{
            color: run.currentIntegrity > run.maxIntegrity * 0.5 ? '#4ade80' : '#ef4444',
            textShadow: PX_OUTLINE,
          }}>
            ♥ {run.currentIntegrity}/{run.maxIntegrity}
          </span>
          <span
            onClick={() => setShowDeck(true)}
            style={{ color: '#8a7a66', textShadow: PX_OUTLINE, cursor: 'pointer', textDecoration: 'underline', textDecorationColor: '#3d2d5c' }}
          >
            {run.deck.length} cards
          </span>
        </div>
      </div>

      {/* SVG connections */}
      <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}>
        {run.map.map((row) =>
          row.map((node) =>
            node.connections.map((tid) => {
              const nextRow = run.map[node.row + 1];
              if (!nextRow) return null;
              const target = nextRow.find((n) => n.id === tid);
              if (!target) return null;
              const x1 = getX(node.col);
              const y1 = getY(node.row);
              const x2 = getX(target.col);
              const y2 = getY(target.row);
              const active = node.visited && canVisit(target);
              const visited = node.visited && target.visited;
              return (
                <line
                  key={`${node.id}-${tid}`}
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke={visited ? 'rgba(168,130,255,0.2)' : active ? '#a882ff' : 'rgba(100,80,140,0.15)'}
                  strokeWidth={active ? 3 : 2}
                  strokeDasharray={active || visited ? '' : '4 6'}
                />
              );
            })
          )
        )}
      </svg>

      {/* Nodes */}
      {run.map.map((row) =>
        row.map((node) => {
          const x = getX(node.col);
          const y = getY(node.row);
          const clickable = canVisit(node);
          const color = NODE_COLORS[node.type];
          const size = node.type === 'boss' ? 64 : 52;

          return (
            <div
              key={node.id}
              onClick={() => handleClick(node)}
              style={{
                position: 'absolute',
                left: x - size / 2,
                top: y - size / 2,
                width: size,
                height: size,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: clickable ? 'pointer' : 'default',
                zIndex: clickable ? 10 : 2,
                // Pixel art style: hard edges, no border-radius
                background: node.visited
                  ? 'rgba(20,16,30,0.8)'
                  : clickable
                  ? `rgba(0,0,0,0.6)`
                  : 'rgba(20,16,30,0.5)',
                border: node.visited
                  ? '2px solid #252535'
                  : clickable
                  ? `3px solid ${color}`
                  : '2px solid rgba(100,80,140,0.2)',
                boxShadow: clickable
                  ? `0 0 12px ${color}66, inset 0 0 8px ${color}22`
                  : 'none',
                transition: 'all 0.2s',
                animation: clickable ? 'nodePulse 2s ease-in-out infinite' : 'none',
              }}
            >
              <span style={{
                fontSize: node.type === 'boss' ? 28 : 22,
                filter: node.visited ? 'grayscale(1) opacity(0.3)' : clickable ? 'none' : 'grayscale(1) opacity(0.25)',
              }}>
                {NODE_ICONS[node.type]}
              </span>

              {clickable && (
                <span style={{
                  position: 'absolute',
                  top: size + 4,
                  fontFamily: PIXEL,
                  fontSize: 8,
                  color,
                  textShadow: PX_OUTLINE,
                  whiteSpace: 'nowrap',
                  letterSpacing: 1,
                }}>
                  {getNodeLabel(node)}
                </span>
              )}
            </div>
          );
        })
      )}

      {/* Legend — RPG panel style */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: legendH,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        background: 'rgba(12, 8, 24, 0.9)',
        borderTop: '3px solid #6b4fa0',
        boxShadow: 'inset 0 2px 0 #3d2d5c, 0 -4px 12px rgba(0,0,0,0.5)',
        zIndex: 2,
        fontFamily: PIXEL,
        fontSize: 7,
      }}>
        {Object.entries(NODE_ICONS).map(([type, icon]) => (
          <span key={type} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 12 }}>{icon}</span>
            <span style={{ color: NODE_COLORS[type], textShadow: PX_OUTLINE, letterSpacing: 1 }}>
              {type}
            </span>
          </span>
        ))}
      </div>

      <style>{`
        @keyframes nodePulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
      `}</style>

      {showDeck && (
        <DeckViewerOverlay
          cards={run.deck}
          title="Your Deck"
          onClose={() => setShowDeck(false)}
        />
      )}
    </div>
  );
}
