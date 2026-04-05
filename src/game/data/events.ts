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
  // === ACT 2 Events ===
  apiRateLimit: {
    id: 'apiRateLimit',
    name: 'API Rate Limit',
    description: 'The bakery\'s API provider sends a warning: you\'re approaching your request limit. You could optimize your calls or pay for a higher tier.',
    act: 2,
    choices: [
      {
        label: 'Optimize (free)',
        description: 'Remove a random card from your deck.',
        effect: [{ type: 'removeRandomNonStarterCard' }],
      },
      {
        label: 'Pay for higher tier',
        description: 'Lose 40 gold, gain +1 max energy for the rest of the act.',
        effect: [{ type: 'gold', amount: -40 }, { type: 'tempMaxEnergy', amount: 1, combats: 3 }],
      },
    ],
  },
  vendorLockIn: {
    id: 'vendorLockIn',
    name: 'Vendor Lock-In',
    description: 'A smooth-talking salesperson offers you a "premium AI suite." Great features, but switching later will be painful.',
    act: 2,
    choices: [
      {
        label: 'Accept the deal',
        description: 'Gain 2 random uncommon cards, but add 1 curse card.',
        effect: [
          { type: 'addRandomCard', rarity: 'uncommon' },
          { type: 'addRandomCard', rarity: 'uncommon' },
          { type: 'addCard', cardId: 'hallucination' },
        ],
      },
      {
        label: 'Stay independent',
        description: 'Gain 50 gold.',
        effect: [{ type: 'gold', amount: 50 }],
      },
    ],
  },
  dataMigration: {
    id: 'dataMigration',
    name: 'Data Migration',
    description: 'Time to move the bakery\'s data to a new system. The migration could be smooth — or it could be a disaster.',
    act: 2,
    choices: [
      {
        label: 'Careful migration',
        description: 'Heal 20% of max HP. Safe but slow.',
        effect: [{ type: 'heal', percent: 0.2 }],
      },
      {
        label: 'Quick and dirty',
        description: 'Upgrade a random card, but take 8 damage.',
        effect: [{ type: 'upgradeRandomCard' }, { type: 'loseIntegrity', amount: 8 }],
      },
    ],
  },

  // === ACT 3 Events ===
  aiAudit: {
    id: 'aiAudit',
    name: 'The AI Audit',
    description: 'A regulatory body wants to audit your AI systems. Compliance is optional but the consequences of failing could be severe.',
    act: 3,
    choices: [
      {
        label: 'Full compliance',
        description: 'Lose 60 gold, but gain 2 Grounded stacks permanently (via a card).',
        effect: [
          { type: 'gold', amount: -60 },
          { type: 'addCard', cardId: 'groundTruth' },
        ],
      },
      {
        label: 'Skip the audit',
        description: 'Keep your gold, but add 2 curse cards.',
        effect: [
          { type: 'addCard', cardId: 'hallucination' },
          { type: 'addCard', cardId: 'hallucination' },
        ],
      },
    ],
  },
  modelCollapse: {
    id: 'modelCollapse',
    name: 'Model Collapse',
    description: 'Your AI has been training on its own outputs and is starting to degrade. The outputs are getting weirder by the hour.',
    act: 3,
    choices: [
      {
        label: 'Reset and retrain',
        description: 'Remove 2 random non-starter cards. Fresh start.',
        effect: [
          { type: 'removeRandomNonStarterCard' },
          { type: 'removeRandomNonStarterCard' },
        ],
      },
      {
        label: 'Embrace the chaos',
        description: 'Gain a random rare card and a curse card.',
        effect: [
          { type: 'addRandomCard', rarity: 'rare' },
          { type: 'addCard', cardId: 'hallucination' },
        ],
      },
    ],
  },
  emergencyRollback: {
    id: 'emergencyRollback',
    name: 'Emergency Rollback',
    description: 'Something went wrong in production. You can roll back to a stable version or try to hotfix the issue.',
    act: 3,
    choices: [
      {
        label: 'Roll back',
        description: 'Heal to full HP.',
        effect: [{ type: 'heal', percent: 1.0 }],
      },
      {
        label: 'Hotfix',
        description: 'Gain 80 gold, but take 15 damage.',
        effect: [{ type: 'gold', amount: 80 }, { type: 'loseIntegrity', amount: 15 }],
      },
    ],
  },
};

/** Get all events valid for a given act (events from that act or earlier) */
export function getEventsForAct(act: 1 | 2 | 3): EventDef[] {
  return Object.values(EVENTS).filter((e) => e.act <= act);
}
