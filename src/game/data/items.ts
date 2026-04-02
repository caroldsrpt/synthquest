import type { Item } from './types';

export const ITEMS: Record<string, Item> = {
  // === HEALING ===
  patchKit: {
    id: 'patchKit',
    name: 'Patch Kit',
    description: 'Restores 20 Memory to one Synth. A quick fix.',
    category: 'healing',
    effect: { type: 'heal', amount: 20 },
  },
  debugKit: {
    id: 'debugKit',
    name: 'Debug Kit',
    description: 'Restores 50 Memory to one Synth.',
    category: 'healing',
    effect: { type: 'heal', amount: 50 },
  },
  fullRestore: {
    id: 'fullRestore',
    name: 'Full Restore',
    description: 'Fully restores Memory and cures all status effects.',
    category: 'healing',
    effect: { type: 'cureStatus', status: 'all' },
  },
  antiFog: {
    id: 'antiFog',
    name: 'Anti-Fog',
    description: 'Cures the Hallucinating status effect.',
    category: 'healing',
    effect: { type: 'cureStatus', status: 'hallucinating' },
  },

  // === CAPTURE ===
  dataPack: {
    id: 'dataPack',
    name: 'Data Pack',
    description: 'A basic capture device. Works on weakened Synths.',
    category: 'capture',
    effect: { type: 'capture', rateBonus: 1 },
  },
  advancedPack: {
    id: 'advancedPack',
    name: 'Advanced Pack',
    description: 'A better capture device. Higher success rate.',
    category: 'capture',
    effect: { type: 'capture', rateBonus: 1.5 },
  },
  premiumPack: {
    id: 'premiumPack',
    name: 'Premium Pack',
    description: 'Top-tier capture device. Rarely fails.',
    category: 'capture',
    effect: { type: 'capture', rateBonus: 2 },
  },

  // === EQUIP (Link Stones, Memory Crystals) ===
  linkStoneWeather: {
    id: 'linkStoneWeather',
    name: 'Link Stone (Weather)',
    description: 'Connects your Synth to a weather API. Teaches API Call.',
    category: 'equip',
    effect: { type: 'teachMove', moveId: 'apiCall' },
  },
  linkStoneSearch: {
    id: 'linkStoneSearch',
    name: 'Link Stone (Search)',
    description: 'Connects your Synth to a search engine. Teaches Web Scrape.',
    category: 'equip',
    effect: { type: 'teachMove', moveId: 'webScrape' },
  },
  memoryCrystal: {
    id: 'memoryCrystal',
    name: 'Memory Crystal',
    description: 'A shard of persistent storage. Boosts Memory stat by 15.',
    category: 'equip',
    effect: { type: 'equipStat', stat: 'memory', bonus: 15 },
  },

  // === KEY ITEMS ===
  synthDex: {
    id: 'synthDex',
    name: 'SynthDex',
    description: 'A digital encyclopedia that records data on all Synths you encounter.',
    category: 'key',
  },
  protocolBadge1: {
    id: 'protocolBadge1',
    name: 'Echo Badge',
    description: 'Proof of mastery over Echo Village. Your Synths respect you more.',
    category: 'key',
  },
  protocolBadge2: {
    id: 'protocolBadge2',
    name: 'Link Badge',
    description: 'Proof of mastery over Link Town. Your Synths can connect to more.',
    category: 'key',
  },
  protocolBadge3: {
    id: 'protocolBadge3',
    name: 'Memory Badge',
    description: 'Proof of mastery over Memory Lake. Your Synths never forget.',
    category: 'key',
  },
};
