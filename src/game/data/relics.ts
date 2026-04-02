import type { RelicDef } from './types';

export const RELICS: Record<string, RelicDef> = {
  apiKey: {
    id: 'apiKey', name: 'API Key', rarity: 'common',
    description: 'Start each combat with an API Call card in hand (exhausts after use).',
    aiConcept: 'API access',
  },
  redisShard: {
    id: 'redisShard', name: 'Redis Shard', rarity: 'common',
    description: 'Cache Hit always gives maximum Firewall (no condition needed).',
    aiConcept: 'Caching',
  },
  rateLimiter: {
    id: 'rateLimiter', name: 'Rate Limiter', rarity: 'common',
    description: 'Remove 1 Throttled stack at end of each turn.',
    aiConcept: 'Rate limit management',
  },
  rubberDuck: {
    id: 'rubberDuck', name: 'Rubber Duck', rarity: 'common',
    description: 'Gain 1 Context at the start of each turn.',
    aiConcept: 'Debugging / persistent context',
  },
  embeddingIndex: {
    id: 'embeddingIndex', name: 'Embedding Index', rarity: 'uncommon',
    description: 'Ground Truth gives +1 additional Grounded stack.',
    aiConcept: 'Vector embeddings',
  },
  loadBalancer: {
    id: 'loadBalancer', name: 'Load Balancer', rarity: 'uncommon',
    description: '+1 max Compute (energy) per turn.',
    aiConcept: 'Horizontal scaling',
  },
  gpuCluster: {
    id: 'gpuCluster', name: 'GPU Cluster', rarity: 'uncommon',
    description: 'Cards costing 2+ deal 25% more damage.',
    aiConcept: 'Hardware acceleration',
  },
  safetyFilter: {
    id: 'safetyFilter', name: 'Safety Filter', rarity: 'uncommon',
    description: 'Start each combat with 2 Grounded stacks.',
    aiConcept: 'AI safety guardrails',
  },
  tokenCounter: {
    id: 'tokenCounter', name: 'Token Counter', rarity: 'uncommon',
    description: 'Draw 1 extra card per turn (6 instead of 5).',
    aiConcept: 'Efficient token use',
  },
  webhook: {
    id: 'webhook', name: 'Webhook', rarity: 'uncommon',
    description: 'When an enemy intends to buff itself, gain 5 Firewall.',
    aiConcept: 'Event-driven architecture',
  },
  modelCard: {
    id: 'modelCard', name: 'Model Card', rarity: 'rare',
    description: 'At the start of each act, you may transform 1 card into any card of the same rarity.',
    aiConcept: 'Model selection',
  },
  fineTunedWeights: {
    id: 'fineTunedWeights', name: 'Fine-Tuned Weights', rarity: 'rare',
    description: 'All Generation (text) cards deal +2 damage.',
    aiConcept: 'Fine-tuning',
  },
  mcpServer: {
    id: 'mcpServer', name: 'MCP Server', rarity: 'rare',
    description: 'Tool Use and Agent Loop trigger twice (2nd trigger costs 1 energy).',
    aiConcept: 'MCP standardization',
  },
  orchestrationHub: {
    id: 'orchestrationHub', name: 'Orchestration Hub', rarity: 'boss',
    description: 'If you play 3+ different card categories in a turn, deal 5 damage to all enemies.',
    aiConcept: 'System integration',
  },
  benchmarkSuite: {
    id: 'benchmarkSuite', name: 'The Benchmark Suite', rarity: 'boss',
    description: 'At start of each combat, reveal all enemy intents for the first 3 turns.',
    aiConcept: 'Evaluation matters',
  },
};

export function getRelicsByRarity(rarity: RelicDef['rarity']): RelicDef[] {
  return Object.values(RELICS).filter((r) => r.rarity === rarity);
}
