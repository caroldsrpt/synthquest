import type { GameMap } from '../types';

// Echo Village: 20x15 tile map
// The starter town where the player begins their journey
// Legend: 0=grass, 1=path, 2=water, 3=wall, 4=door, 5=tree, 6=flower, 7=data-stream
const W = 20;
const H = 15;

// prettier-ignore
const ground: number[] = [
  5, 5, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 5, 5,
  5, 0, 0, 6, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 6, 0, 0, 0, 0, 5,
  0, 0, 0, 0, 0, 3, 3, 3, 3, 1, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0,
  0, 0, 6, 0, 0, 3, 4, 4, 4, 4, 4, 4, 4, 3, 0, 0, 6, 0, 0, 0,
  0, 0, 0, 0, 0, 3, 4, 4, 4, 4, 4, 4, 4, 3, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 3, 3, 3, 3, 1, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0,
  0, 6, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 6, 0, 0,
  0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0,
  0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0,
  0, 0, 3, 3, 3, 3, 0, 0, 0, 1, 0, 0, 0, 3, 3, 3, 3, 0, 0, 0,
  0, 0, 3, 4, 4, 3, 0, 0, 0, 1, 0, 0, 0, 3, 4, 4, 3, 0, 0, 0,
  0, 0, 3, 3, 1, 3, 0, 6, 0, 1, 0, 6, 0, 3, 3, 1, 3, 0, 0, 0,
  0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0,
  5, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 5,
  5, 5, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 5, 5,
];

// Collision: 1 = solid (trees, walls, water), 0 = walkable
// prettier-ignore
const collision: number[] = [
  1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1,
  1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
  0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0,
  0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0,
  0, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
  1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1,
];

export const ECHO_VILLAGE: GameMap = {
  id: 'echoVillage',
  name: 'Echo Village',
  width: W,
  height: H,
  tileSize: 16,
  layers: [
    {
      name: 'ground',
      data: ground,
      width: W,
      height: H,
      visible: true,
    },
  ],
  collisionLayer: collision,
  objects: [
    // Elder NPC (in front of the big building)
    {
      id: 1,
      name: 'Elder Sage',
      type: 'npc',
      x: 9,
      y: 6,
      width: 1,
      height: 1,
      properties: { npcId: 'elderSage', direction: 'down' },
    },
    // Synth Center NPC (left building)
    {
      id: 2,
      name: 'Nurse',
      type: 'npc',
      x: 4,
      y: 12,
      width: 1,
      height: 1,
      properties: { npcId: 'nurse', direction: 'up' },
    },
    // Shop NPC (right building)
    {
      id: 3,
      name: 'Shopkeeper',
      type: 'npc',
      x: 15,
      y: 12,
      width: 1,
      height: 1,
      properties: { npcId: 'shopkeeper', direction: 'up' },
    },
    // Sign
    {
      id: 4,
      name: 'Village Sign',
      type: 'sign',
      x: 10,
      y: 7,
      width: 1,
      height: 1,
      properties: { text: 'Welcome to Echo Village - Where Every Synth Finds Its Voice' },
    },
    // Warp to Route 1 (south exit)
    {
      id: 5,
      name: 'Route 1 Exit',
      type: 'warp',
      x: 9,
      y: 14,
      width: 3,
      height: 1,
      properties: { targetMap: 'route1', targetX: 9, targetY: 0 },
    },
  ],
};
