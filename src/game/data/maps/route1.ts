import type { GameMap } from '../types';

// Route 1: 20x20 tile map connecting Echo Village to Link Town
// Contains data streams (wild encounters) and a few trainer NPCs
const W = 20;
const H = 20;

// 0=grass, 1=path, 2=water, 5=tree, 6=flower, 7=data-stream (tall grass equivalent)
// prettier-ignore
const ground: number[] = [
  5, 5, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 5, 5,
  5, 0, 0, 7, 7, 0, 0, 0, 1, 1, 1, 0, 0, 0, 7, 7, 0, 0, 0, 5,
  0, 0, 7, 7, 7, 0, 0, 0, 1, 1, 1, 0, 0, 7, 7, 7, 0, 0, 0, 0,
  0, 0, 7, 7, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 7, 7, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 6, 0, 1, 1, 1, 0, 6, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  5, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 5,
  5, 5, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 5, 5,
  5, 0, 0, 7, 7, 1, 1, 0, 0, 1, 0, 0, 1, 1, 7, 7, 0, 0, 0, 5,
  0, 0, 7, 7, 7, 1, 0, 0, 0, 1, 0, 0, 0, 1, 7, 7, 7, 0, 0, 0,
  0, 0, 7, 7, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 7, 7, 0, 0, 0,
  0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0,
  0, 0, 6, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 6, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  5, 0, 0, 7, 7, 7, 0, 0, 1, 1, 1, 0, 0, 7, 7, 7, 0, 0, 0, 5,
  5, 0, 7, 7, 7, 7, 0, 0, 1, 1, 1, 0, 0, 7, 7, 7, 7, 0, 0, 5,
  0, 0, 7, 7, 7, 0, 0, 0, 1, 1, 1, 0, 0, 0, 7, 7, 7, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 6, 0, 1, 1, 1, 0, 6, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  5, 5, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 5, 5,
];

// prettier-ignore
const collision: number[] = [
  1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1,
  1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
  1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1,
  1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
  1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1,
];

export const ROUTE_1: GameMap = {
  id: 'route1',
  name: 'Route 1',
  width: W,
  height: H,
  tileSize: 16,
  layers: [
    { name: 'ground', data: ground, width: W, height: H, visible: true },
  ],
  collisionLayer: collision,
  objects: [
    // Warp back to Echo Village (north)
    {
      id: 1,
      name: 'Echo Village',
      type: 'warp',
      x: 8,
      y: 0,
      width: 3,
      height: 1,
      properties: { targetMap: 'echoVillage', targetX: 9, targetY: 13 },
    },
    // Trainer battle
    {
      id: 2,
      name: 'Bug Catcher Dan',
      type: 'npc',
      x: 5,
      y: 9,
      width: 1,
      height: 1,
      properties: {
        npcId: 'trainerDan',
        direction: 'right',
        trainer: true,
      },
    },
    // Sign
    {
      id: 3,
      name: 'Route Sign',
      type: 'sign',
      x: 12,
      y: 5,
      width: 1,
      height: 1,
      properties: { text: 'Route 1 — Watch out for wild Synths in the data streams!' },
    },
  ],
  encounterRate: 15, // 15% per step in data stream tiles
  encounters: [
    { synthId: 'chatter', minLevel: 2, maxLevel: 5, weight: 40 },
    { synthId: 'pixl', minLevel: 2, maxLevel: 4, weight: 30 },
    { synthId: 'sparq', minLevel: 3, maxLevel: 5, weight: 20 },
    { synthId: 'cache', minLevel: 2, maxLevel: 4, weight: 10 },
  ],
};
