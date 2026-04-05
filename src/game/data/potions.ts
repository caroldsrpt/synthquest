import type { PotionDef, PotionRarity } from './types';

export const POTIONS: Record<string, PotionDef> = {
  warmCocoa: {
    id: 'warmCocoa', name: 'Warm Cocoa', rarity: 'common', target: 'self',
    description: 'Restore 15 Integrity.',
    aiTooltip: 'Like loading a saved checkpoint — restoring your system to a known good state.',
  },
  espressoShot: {
    id: 'espressoShot', name: 'Espresso Shot', rarity: 'common', target: 'self',
    description: 'Draw 3 cards.',
    aiTooltip: 'Batch processing — handling multiple tasks in one go.',
  },
  sourdoughStarter: {
    id: 'sourdoughStarter', name: 'Sourdough Starter', rarity: 'common', target: 'self',
    description: 'Gain 10 Firewall.',
    aiTooltip: 'A pre-trained model — it already knows the basics so you don\'t start from zero.',
  },
  pepperFlakes: {
    id: 'pepperFlakes', name: 'Pepper Flakes', rarity: 'common', target: 'singleEnemy',
    description: 'Apply 3 Vulnerable to an enemy.',
    aiTooltip: 'An adversarial attack — exploiting a weakness in the system.',
  },
  staleBread: {
    id: 'staleBread', name: 'Stale Bread', rarity: 'common', target: 'singleEnemy',
    description: 'Apply 2 Weak to an enemy.',
    aiTooltip: 'Deprecated code — it still runs, but it\'s weaker than it used to be.',
  },
  doubleShotLatte: {
    id: 'doubleShotLatte', name: 'Double-Shot Latte', rarity: 'uncommon', target: 'self',
    description: 'Gain 2 energy this turn.',
    aiTooltip: 'Parallel processing — running two tasks at the same time.',
  },
  flashFrozenDough: {
    id: 'flashFrozenDough', name: 'Flash-Frozen Dough', rarity: 'uncommon', target: 'allEnemies',
    description: 'All enemies deal half damage this turn.',
    aiTooltip: 'Rate limiting — capping how much can happen at once to prevent overload.',
  },
  mysteryMacaron: {
    id: 'mysteryMacaron', name: 'Mystery Macaron', rarity: 'uncommon', target: 'self',
    description: 'Add 2 random uncommon cards to hand (cost 0, Exhaust).',
    aiTooltip: 'Random sampling — picking items at random from a dataset.',
  },
  goldenCroissant: {
    id: 'goldenCroissant', name: 'Golden Croissant', rarity: 'rare', target: 'self',
    description: 'Your next 3 cards deal double damage or give double Firewall.',
    aiTooltip: 'A reinforcement learning reward — when you do something right, the payoff is amplified.',
  },
  secretRecipe: {
    id: 'secretRecipe', name: 'Secret Recipe', rarity: 'rare', target: 'self',
    description: 'Permanently upgrade a random non-upgraded card in your deck.',
    aiTooltip: 'Fine-tuning — taking a general model and specializing it for one specific task.',
  },
};

export function getPotionsByRarity(rarity: PotionRarity): PotionDef[] {
  return Object.values(POTIONS).filter((p) => p.rarity === rarity);
}

export function generatePotionDrop(): PotionDef | null {
  const roll = Math.random();
  let rarity: PotionRarity;
  if (roll < 0.65) rarity = 'common';
  else if (roll < 0.90) rarity = 'uncommon';
  else rarity = 'rare';

  const pool = getPotionsByRarity(rarity);
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}
