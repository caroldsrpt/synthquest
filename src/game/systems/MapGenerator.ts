import type { MapNode, MapNodeType } from '../data/types';
import { uid, randInt } from '../../utils/random';
import { ACT_ENCOUNTERS, ELITE_ENCOUNTERS, BOSS_ENCOUNTERS } from '../data/enemies';
import { weightedPick } from '../../utils/random';

// Clean 3-lane map, 8 rows
const ROWS = 8;

export function generateMap(act: 1 | 2 | 3): MapNode[][] {
  const map: MapNode[][] = [];

  // Define structure: [row] = array of {col, type}
  // 3 lanes: left (0), center (1), right (2)
  const layout = generateLayout();

  for (let row = 0; row < layout.length; row++) {
    const nodes: MapNode[] = layout[row].map(({ col, type }) => ({
      id: uid(),
      row,
      col,
      type,
      connections: [],
      visited: false,
      enemies: (type === 'combat' || type === 'elite' || type === 'boss')
        ? getEncounterEnemyIds(act, type as 'combat' | 'elite' | 'boss')
        : undefined,
    }));
    map.push(nodes);
  }

  // Connect: each node connects to the closest node(s) in the next row
  for (let row = 0; row < map.length - 1; row++) {
    const curr = map[row];
    const next = map[row + 1];

    for (const node of curr) {
      // Find closest node(s) in next row by column distance
      const sorted = [...next].sort((a, b) =>
        Math.abs(a.col - node.col) - Math.abs(b.col - node.col)
      );

      // Always connect to closest
      node.connections.push(sorted[0].id);

      // Connect to second closest if it's adjacent (distance <= 1)
      if (sorted.length > 1 && Math.abs(sorted[1].col - node.col) <= 1) {
        if (Math.random() < 0.4) {
          node.connections.push(sorted[1].id);
        }
      }
    }

    // Ensure every next-row node is reachable
    for (const nextNode of next) {
      const hasIncoming = curr.some((n) => n.connections.includes(nextNode.id));
      if (!hasIncoming) {
        const closest = [...curr].sort((a, b) =>
          Math.abs(a.col - nextNode.col) - Math.abs(b.col - nextNode.col)
        )[0];
        closest.connections.push(nextNode.id);
      }
    }

    // Deduplicate
    for (const node of curr) {
      node.connections = [...new Set(node.connections)];
    }
  }

  return map;
}

function generateLayout(): { col: number; type: MapNodeType }[][] {
  return [
    // Row 0: single start combat
    [{ col: 1, type: 'combat' }],

    // Row 1: branch to 2-3
    randInt(0, 1) === 0
      ? [{ col: 0, type: 'combat' }, { col: 2, type: 'combat' }]
      : [{ col: 0, type: 'combat' }, { col: 1, type: 'event' }, { col: 2, type: 'combat' }],

    // Row 2: 2-3 nodes, events possible
    generateMidRow([0.6, 0.25, 0.1, 0.05], 2),

    // Row 3: 2-3 nodes, shop/elite can appear
    generateMidRow([0.45, 0.2, 0.15, 0.1, 0.1], 3),

    // Row 4: 2-3 nodes
    generateMidRow([0.5, 0.2, 0.1, 0.1, 0.1], 4),

    // Row 5: 2 nodes, converging
    generateMidRow([0.5, 0.2, 0.15, 0.1, 0.05], 2),

    // Row 6: rest before boss
    [{ col: 1, type: 'rest' as MapNodeType }],

    // Row 7: boss
    [{ col: 1, type: 'boss' as MapNodeType }],
  ];
}

function generateMidRow(
  weights: number[], // [combat, event, shop, elite, rest]
  minNodes: number
): { col: number; type: MapNodeType }[] {
  const types: MapNodeType[] = ['combat', 'event', 'shop', 'elite', 'rest'];
  const count = randInt(minNodes, 3);
  const cols = count === 1 ? [1] : count === 2 ? [0, 2] : [0, 1, 2];

  return cols.map((col) => ({
    col,
    type: weightedPick(types, weights),
  }));
}

function getEncounterEnemyIds(act: 1 | 2 | 3, nodeType: 'combat' | 'elite' | 'boss'): string[] {
  if (nodeType === 'boss') return BOSS_ENCOUNTERS[act].enemies.map((e) => e.defId);
  if (nodeType === 'elite') return ELITE_ENCOUNTERS[act].enemies.map((e) => e.defId);
  const encounters = ACT_ENCOUNTERS[act];
  const enc = weightedPick(encounters, encounters.map((e) => e.weight));
  return enc.enemies.map((e) => e.defId);
}
