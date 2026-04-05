import type { MapNode, MapNodeType } from '../data/types';
import { uid } from '../../utils/random';
import { ACT_ENCOUNTERS, ELITE_ENCOUNTERS, BOSS_ENCOUNTERS } from '../data/enemies';
import { weightedPick } from '../../utils/random';

// Semi-fixed map: scenario positions are predetermined, other nodes are random
// 10 rows per act, 3 lanes max

interface RowDef {
  nodes: { col: number; type: MapNodeType; scenarioId?: string }[];
}

// Fixed map skeletons per act
const ACT_LAYOUTS: Record<1 | 2 | 3, RowDef[]> = {
  1: [
    { nodes: [{ col: 1, type: 'scenario', scenarioId: 's1_textGeneration' }] },
    { nodes: [{ col: 2, type: 'combat' }] },
    { nodes: [{ col: 0, type: 'scenario', scenarioId: 's2_temperature' }] },
    { nodes: [{ col: 2, type: 'combat' }] },
    { nodes: [{ col: 1, type: 'scenario', scenarioId: 's3_hallucination' }] },
    { nodes: [{ col: 0, type: 'scenario', scenarioId: 's4_grounding' }] },
    { nodes: [{ col: 2, type: 'event' }] },
    { nodes: [{ col: 1, type: 'elite' }] },
    { nodes: [{ col: 1, type: 'scenario', scenarioId: 's5_promptEng' }] },
    { nodes: [{ col: 0, type: 'scenario', scenarioId: 's6_contextWindow' }] },
    { nodes: [{ col: 2, type: 'shop' }] },
    { nodes: [{ col: 0, type: 'event' }] },
    { nodes: [{ col: 1, type: 'rest' }] },
    { nodes: [{ col: 1, type: 'boss' }] },
  ],
  2: [
    { nodes: [{ col: 1, type: 'scenario', scenarioId: 's7_rag' }] },
    { nodes: [{ col: 0, type: 'combat' }] },
    { nodes: [{ col: 2, type: 'scenario', scenarioId: 's8_api' }] },
    { nodes: [{ col: 0, type: 'scenario', scenarioId: 's9_toolUse' }] },
    { nodes: [{ col: 1, type: 'combat' }] },
    { nodes: [{ col: 2, type: 'scenario', scenarioId: 's10_agent' }] },
    { nodes: [{ col: 0, type: 'event' }] },
    { nodes: [{ col: 1, type: 'elite' }] },
    { nodes: [{ col: 1, type: 'scenario', scenarioId: 's11_fewShot' }] },
    { nodes: [{ col: 2, type: 'scenario', scenarioId: 's12_mcp' }] },
    { nodes: [{ col: 0, type: 'shop' }] },
    { nodes: [{ col: 1, type: 'event' }] },
    { nodes: [{ col: 1, type: 'rest' }] },
    { nodes: [{ col: 1, type: 'boss' }] },
  ],
  3: [
    { nodes: [{ col: 1, type: 'scenario', scenarioId: 's13_multimodal' }] },
    { nodes: [{ col: 2, type: 'combat' }] },
    { nodes: [{ col: 0, type: 'scenario', scenarioId: 's14_ethics' }] },
    { nodes: [{ col: 2, type: 'scenario', scenarioId: 's15_automation' }] },
    { nodes: [{ col: 1, type: 'event' }] },
    { nodes: [{ col: 2, type: 'elite' }] },
    { nodes: [{ col: 0, type: 'scenario', scenarioId: 's16_fineTuning' }] },
    { nodes: [{ col: 2, type: 'combat' }] },
    { nodes: [{ col: 1, type: 'scenario', scenarioId: 's17_safety' }] },
    { nodes: [{ col: 0, type: 'scenario', scenarioId: 's18_orchestration' }] },
    { nodes: [{ col: 2, type: 'shop' }] },
    { nodes: [{ col: 0, type: 'event' }] },
    { nodes: [{ col: 1, type: 'rest' }] },
    { nodes: [{ col: 1, type: 'boss' }] },
  ],
};

export function generateMap(act: 1 | 2 | 3): MapNode[][] {
  const layout = ACT_LAYOUTS[act];
  const map: MapNode[][] = [];

  // Create nodes from layout
  for (let row = 0; row < layout.length; row++) {
    const nodes: MapNode[] = layout[row].nodes.map((def) => ({
      id: uid(),
      row,
      col: def.col,
      type: def.type,
      connections: [],
      visited: false,
      scenarioId: def.scenarioId,
      enemies: (def.type === 'combat' || def.type === 'elite' || def.type === 'boss')
        ? getEncounterEnemyIds(act, def.type as 'combat' | 'elite' | 'boss')
        : undefined,
    }));
    map.push(nodes);
  }

  // Connect rows
  for (let row = 0; row < map.length - 1; row++) {
    const curr = map[row];
    const next = map[row + 1];

    if (next.length === 1) {
      // All → single
      for (const node of curr) node.connections.push(next[0].id);
    } else if (curr.length === 1) {
      // Single → all
      for (const n of next) curr[0].connections.push(n.id);
    } else {
      // Multi → multi: connect by closest column, no crossing
      const connected = new Set<number>();
      for (let i = 0; i < curr.length; i++) {
        const sorted = [...next].sort((a, b) =>
          Math.abs(a.col - curr[i].col) - Math.abs(b.col - curr[i].col)
        );
        curr[i].connections.push(sorted[0].id);
        connected.add(next.indexOf(sorted[0]));

        // Add second connection sometimes
        if (sorted.length > 1 && Math.abs(sorted[1].col - curr[i].col) <= 1 && Math.random() < 0.35) {
          curr[i].connections.push(sorted[1].id);
          connected.add(next.indexOf(sorted[1]));
        }
      }
      // Ensure all next nodes are reachable
      for (let j = 0; j < next.length; j++) {
        if (!connected.has(j)) {
          const nearest = [...curr].sort((a, b) =>
            Math.abs(a.col - next[j].col) - Math.abs(b.col - next[j].col)
          )[0];
          nearest.connections.push(next[j].id);
        }
      }
      // Deduplicate
      for (const node of curr) node.connections = [...new Set(node.connections)];
    }
  }

  return map;
}

function getEncounterEnemyIds(act: 1 | 2 | 3, nodeType: 'combat' | 'elite' | 'boss'): string[] {
  if (nodeType === 'boss') return BOSS_ENCOUNTERS[act].enemies.map((e) => e.defId);
  if (nodeType === 'elite') return ELITE_ENCOUNTERS[act].enemies.map((e) => e.defId);
  const encounters = ACT_ENCOUNTERS[act];
  const enc = weightedPick(encounters, encounters.map((e) => e.weight));
  return enc.enemies.map((e) => e.defId);
}
