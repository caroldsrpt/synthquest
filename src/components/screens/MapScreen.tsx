import { useEffect, useRef, useState } from 'react';
import { useRunStore } from '../../stores/runStore';
import { useCombatStore } from '../../stores/combatStore';
import { generateMap } from '../../game/systems/MapGenerator';
import { createEnemy, ACT_ENCOUNTERS, ELITE_ENCOUNTERS, BOSS_ENCOUNTERS } from '../../game/data/enemies';
import { weightedPick, randInt } from '../../utils/random';
import { COLORS, COMBAT_GOLD_MIN, COMBAT_GOLD_MAX, ELITE_GOLD_MIN, ELITE_GOLD_MAX, BOSS_GOLD_MIN, BOSS_GOLD_MAX } from '../../utils/constants';
import { generateCardRewards } from '../../utils/cardUtils';
import type { MapNode } from '../../game/data/types';

const NODE_ICONS: Record<string, string> = {
  combat: '\u2694\uFE0F', elite: '\uD83D\uDC80', event: '\u2753',
  shop: '\uD83D\uDCB0', rest: '\u2764\uFE0F', boss: '\u2B50',
};

const NODE_COLORS: Record<string, string> = {
  combat: '#9ca3af', elite: '#f59e0b', event: '#a78bfa',
  shop: '#34d399', rest: '#60a5fa', boss: '#ef4444',
};

const NODE_LABELS: Record<string, string> = {
  combat: 'Combat', elite: 'Elite', event: 'Event',
  shop: 'Shop', rest: 'Rest', boss: 'BOSS',
};

export function MapScreen() {
  const run = useRunStore();

  useEffect(() => {
    if (run.map.length === 0) run.setMap(generateMap(run.act));
  }, [run.act, run.map.length]);

  const canVisit = (node: MapNode): boolean => {
    if (node.visited) return false;
    if (run.visitedNodeIds.length === 0) return node.row === 0;
    return run.map.some((row) =>
      row.some((n) => n.visited && n.connections.includes(node.id))
    );
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
      useCombatStore.getState().setRewards(gold, generateCardRewards(run.act, node.type === 'boss' ? 'boss' : node.type === 'elite' ? 'elite' : 'normal'), null);
      run.setScreen('combat');
    } else {
      run.setScreen(node.type as 'rest' | 'shop' | 'event');
    }
  };

  // Measure container
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

  const headerH = 48;
  const legendH = 40;
  const padY = 30;
  const mapH = dims.h - headerH - legendH - padY * 2;
  const mapW = dims.w;
  const colW = Math.min(250, mapW / 4);
  const gridW = colW * 3;
  const startX = (mapW - gridW) / 2;
  const rowGap = mapH / Math.max(run.map.length - 1, 1);
  const getX = (col: number) => startX + col * colW + colW / 2;
  const getY = (row: number) => headerH + padY + rowGap * row;

  return (
    <div ref={containerRef} style={{
      width: '100%', height: '100%',
      background: '#0c0c1a', fontFamily: 'monospace', color: '#e0e0e0',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        height: headerH, padding: '0 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid #1e2030',
      }}>
        <span style={{ fontWeight: 'bold', fontSize: 16, color: COLORS.accent }}>
          Act {run.act}: {['', 'The Prompt Lab', 'The Integration Hub', 'The Orchestration Layer'][run.act]}
        </span>
        <div style={{ display: 'flex', gap: 24, fontSize: 13 }}>
          <span style={{ color: COLORS.gold }}>{run.gold}g</span>
          <span style={{ color: run.currentIntegrity > run.maxIntegrity * 0.5 ? COLORS.hp : COLORS.hpLow }}>
            {'\u2665'} {run.currentIntegrity}/{run.maxIntegrity}
          </span>
          <span style={{ color: '#555' }}>{run.deck.length} cards</span>
        </div>
      </div>

      {/* SVG connections layer */}
      <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
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
                  stroke={visited ? '#7b68ee44' : active ? '#7b68ee' : '#161825'}
                  strokeWidth={active ? 3 : 1.5}
                  strokeDasharray={active || visited ? '' : '5 8'}
                />
              );
            })
          )
        )}
      </svg>

      {/* Node layer (DOM) */}
      {run.map.map((row) =>
        row.map((node) => {
          const x = getX(node.col);
          const y = getY(node.row);
          const clickable = canVisit(node);
          const color = NODE_COLORS[node.type];
          const size = node.type === 'boss' ? 52 : 42;

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
                borderRadius: '50%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: clickable ? 'pointer' : 'default',
                background: node.visited
                  ? '#1a1a2e'
                  : clickable
                  ? `radial-gradient(circle, ${color}44 0%, ${color}11 70%)`
                  : '#111520',
                border: `2px solid ${node.visited ? '#252535' : clickable ? color : '#181c28'}`,
                boxShadow: clickable ? `0 0 16px ${color}55, 0 0 4px ${color}33` : 'none',
                transition: 'all 0.2s',
                zIndex: clickable ? 10 : 1,
                animation: clickable ? 'nodePulse 2s ease-in-out infinite' : 'none',
              }}
            >
              <span style={{
                fontSize: node.type === 'boss' ? 22 : 18,
                filter: node.visited ? 'grayscale(1) opacity(0.3)' : clickable ? 'none' : 'grayscale(1) opacity(0.2)',
              }}>
                {NODE_ICONS[node.type]}
              </span>

              {/* Label below for clickable nodes */}
              {clickable && (
                <span style={{
                  position: 'absolute',
                  top: size + 4,
                  fontSize: 10,
                  color,
                  fontWeight: 'bold',
                  whiteSpace: 'nowrap',
                  textShadow: '0 0 8px #000',
                }}>
                  {NODE_LABELS[node.type]}
                </span>
              )}
            </div>
          );
        })
      )}

      {/* Legend */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: legendH,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20,
        borderTop: '1px solid #1e2030', background: '#0c0c1a',
        fontSize: 11, color: '#555',
      }}>
        {Object.entries(NODE_ICONS).map(([type, icon]) => (
          <span key={type} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 13 }}>{icon}</span>
            <span style={{ color: NODE_COLORS[type] }}>{type}</span>
          </span>
        ))}
      </div>

      <style>{`
        @keyframes nodePulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
      `}</style>
    </div>
  );
}
