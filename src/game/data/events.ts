import type { EventDef } from './types';

export const EVENTS: Record<string, EventDef> = {
  openSourceModel: {
    id: 'openSourceModel',
    name: 'The Open Source Model',
    description:
      'You stumble upon a glowing repository in the bakery\'s back office — an open-source AI model, free for anyone to download. Its capabilities are immense, but the README has a few... suspicious gaps.',
    act: 1,
    choices: [
      {
        label: 'Download it',
        description: 'Gain a random rare card, but add 2 Glitch curse cards to your deck.',
        effect: [
          { type: 'addRandomCard', rarity: 'rare' },
          { type: 'addCard', cardId: 'hallucination' },
          { type: 'addCard', cardId: 'hallucination' },
        ],
      },
      {
        label: 'Pass',
        description: 'Better safe than sorry. Walk away.',
        effect: [],
      },
    ],
  },

  trainingData: {
    id: 'trainingData',
    name: 'The Training Data',
    description:
      'Hidden beneath a stack of flour bags, you find a pristine collection of curated training data — labeled, cleaned, and perfectly formatted. A data scientist\'s dream.',
    act: 1,
    choices: [
      {
        label: 'Study it',
        description: 'Remove a random non-starter card from your deck.',
        effect: [{ type: 'removeRandomNonStarterCard' }],
      },
      {
        label: 'Sell it',
        description: 'Gain 50 gold.',
        effect: [{ type: 'gold', amount: 50 }],
      },
    ],
  },

  overloadedServer: {
    id: 'overloadedServer',
    name: 'The Overloaded Server',
    description:
      'The bakery\'s main oven — actually a repurposed GPU server — is glowing red-hot. Smoke curls from the vents. It\'s processing too many orders at once and something has to give.',
    act: 1,
    choices: [
      {
        label: 'Push through',
        description: 'Gain 30 gold, but lose 15 Integrity.',
        effect: [
          { type: 'gold', amount: 30 },
          { type: 'loseIntegrity', amount: 15 },
        ],
      },
      {
        label: 'Shut it down',
        description: 'Heal 20 Integrity.',
        effect: [{ type: 'heal', percent: 0.3 }],
      },
      {
        label: 'Optimize it',
        description: 'Gain +1 max energy for the next 2 combats.',
        effect: [{ type: 'tempMaxEnergy', amount: 1, combats: 2 }],
      },
    ],
  },

  betaTester: {
    id: 'betaTester',
    name: 'The Beta Tester',
    description:
      'A curious customer leans over the counter. "I heard you\'re building an AI assistant. Mind if I give it a spin? I\'ll give you honest feedback — every bug I find makes it stronger."',
    act: 1,
    choices: [
      {
        label: 'Let them test it',
        description: 'Upgrade a random card in your deck.',
        effect: [{ type: 'upgradeRandomCard' }],
      },
      {
        label: 'Not ready yet',
        description: 'Gain 25 gold.',
        effect: [{ type: 'gold', amount: 25 }],
      },
    ],
  },

  dataBreach: {
    id: 'dataBreach',
    name: 'The Data Breach',
    description:
      'ALERT: UNAUTHORIZED ACCESS DETECTED. The bakery\'s customer database has been compromised. Order histories, flavor preferences, secret recipes — all exposed. You need to act fast.',
    act: 1,
    choices: [
      {
        label: 'Patch it',
        description: 'Lose 30 gold, but gain a Ground Truth card.',
        effect: [
          { type: 'gold', amount: -30 },
          { type: 'addCard', cardId: 'groundTruth' },
        ],
      },
      {
        label: 'Ignore it',
        description: 'Add 3 Glitch curse cards to your deck. Ignorance has a price.',
        effect: [
          { type: 'addCard', cardId: 'hallucination' },
          { type: 'addCard', cardId: 'hallucination' },
          { type: 'addCard', cardId: 'hallucination' },
        ],
      },
    ],
  },
};

/** Get all events valid for a given act (events from that act or earlier) */
export function getEventsForAct(act: 1 | 2 | 3): EventDef[] {
  return Object.values(EVENTS).filter((e) => e.act <= act);
}
