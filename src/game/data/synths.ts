import type { SynthSpecies } from './types';

export const SYNTH_SPECIES: Record<string, SynthSpecies> = {
  // === LINE 1: CHATBOT (LLM → Agent → Orchestrator) ===
  chatter: {
    id: 'chatter',
    name: 'Chatter',
    description: 'A small creature that can only talk. Full of words, short on action.',
    types: ['text'],
    baseStats: { output: 55, clarity: 30, memory: 45, speed: 50, confidence: 40 },
    learnset: [
      { level: 1, moveId: 'promptBlast' },
      { level: 1, moveId: 'autocomplete' },
      { level: 8, moveId: 'summarize' },
      { level: 12, moveId: 'verboseOutput' },
    ],
    evolution: { into: 'acton', condition: { type: 'hasMove', moveType: 'logic' } },
    captureRate: 200,
  },
  acton: {
    id: 'acton',
    name: 'Acton',
    description: 'Now it can DO things, not just talk about them. A true agent.',
    types: ['text', 'logic'],
    baseStats: { output: 65, clarity: 50, memory: 60, speed: 65, confidence: 55 },
    learnset: [
      { level: 1, moveId: 'promptBlast' },
      { level: 1, moveId: 'debugScan' },
      { level: 20, moveId: 'planAhead' },
      { level: 24, moveId: 'apiCall' },
      { level: 30, moveId: 'chainOfThought' },
    ],
    evolution: undefined, // NEXUS is post-MVP
    captureRate: 75,
  },

  // === LINE 2: DATABASE ===
  cache: {
    id: 'cache',
    name: 'Cache',
    description: 'Remembers everything but takes its sweet time. A living memory bank.',
    types: ['structure'],
    baseStats: { output: 30, clarity: 55, memory: 80, speed: 20, confidence: 50 },
    learnset: [
      { level: 1, moveId: 'structuredQuery' },
      { level: 5, moveId: 'retrievalShield' },
      { level: 14, moveId: 'groundTruth' },
      { level: 20, moveId: 'indexSlam' },
    ],
    evolution: {
      into: 'vaultix',
      condition: { type: 'hasStat', stat: 'memory', min: 100 },
    },
    captureRate: 150,
  },
  vaultix: {
    id: 'vaultix',
    name: 'Vaultix',
    description: 'An organized fortress of knowledge. Practically unhackable.',
    types: ['structure'],
    baseStats: { output: 45, clarity: 85, memory: 120, speed: 25, confidence: 65 },
    learnset: [
      { level: 1, moveId: 'structuredQuery' },
      { level: 1, moveId: 'retrievalShield' },
      { level: 1, moveId: 'groundTruth' },
      { level: 25, moveId: 'indexSlam' },
      { level: 30, moveId: 'citeSource' },
    ],
    captureRate: 45,
  },

  // === LINE 3: SEARCH / RAG ===
  fetchr: {
    id: 'fetchr',
    name: 'Fetchr',
    description: 'Always searching, always finding. Fast but scattered.',
    types: ['logic'],
    baseStats: { output: 40, clarity: 35, memory: 40, speed: 70, confidence: 50 },
    learnset: [
      { level: 1, moveId: 'keywordHunt' },
      { level: 1, moveId: 'webScrape' },
      { level: 10, moveId: 'debugScan' },
      { level: 15, moveId: 'planAhead' },
    ],
    evolution: {
      into: 'ragnar',
      condition: { type: 'partyHasType', synthType: 'structure' },
    },
    captureRate: 160,
  },
  ragnar: {
    id: 'ragnar',
    name: 'Ragnar',
    description: 'Retrieves AND grounds. The ultimate antidote to hallucination.',
    types: ['logic', 'structure'],
    baseStats: { output: 55, clarity: 65, memory: 60, speed: 75, confidence: 70 },
    learnset: [
      { level: 1, moveId: 'keywordHunt' },
      { level: 1, moveId: 'groundTruth' },
      { level: 22, moveId: 'retrievalShield' },
      { level: 26, moveId: 'citeSource' },
      { level: 30, moveId: 'chainOfThought' },
    ],
    captureRate: 60,
  },

  // === LINE 4: CREATIVE ===
  sparq: {
    id: 'sparq',
    name: 'Sparq',
    description: 'Bursting with chaotic creative energy. Beautiful and dangerous.',
    types: ['noise'],
    baseStats: { output: 65, clarity: 25, memory: 40, speed: 55, confidence: 35 },
    learnset: [
      { level: 1, moveId: 'wildGenerate' },
      { level: 1, moveId: 'brainstorm' },
      { level: 10, moveId: 'hallucinate' },
      { level: 18, moveId: 'temperatureSurge' },
    ],
    evolution: {
      into: 'visionary',
      condition: { type: 'statusCount', status: 'hallucinating', count: 10 },
    },
    captureRate: 140,
  },
  visionary: {
    id: 'visionary',
    name: 'Visionary',
    description: 'Learned to channel chaos into art. Creative AND controlled.',
    types: ['noise', 'vision'],
    baseStats: { output: 80, clarity: 45, memory: 55, speed: 70, confidence: 50 },
    learnset: [
      { level: 1, moveId: 'wildGenerate' },
      { level: 1, moveId: 'patternMatch' },
      { level: 24, moveId: 'temperatureSurge' },
      { level: 28, moveId: 'classify' },
    ],
    captureRate: 50,
  },

  // === LINE 5: MULTIMODAL ===
  pixl: {
    id: 'pixl',
    name: 'Pixl',
    description: 'Sees the world clearly but struggles to describe it.',
    types: ['vision'],
    baseStats: { output: 35, clarity: 55, memory: 45, speed: 40, confidence: 55 },
    learnset: [
      { level: 1, moveId: 'scan' },
      { level: 1, moveId: 'patternMatch' },
      { level: 12, moveId: 'classify' },
    ],
    evolution: undefined, // OMNIUS is post-MVP (needs text+vision move)
    captureRate: 155,
  },
};
