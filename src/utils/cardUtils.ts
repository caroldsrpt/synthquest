import { CARDS, getCardPool, getStarterDeckIds } from '../game/data/cards';
import type { CardInstance, CardDef, CardRarity, CardEffect } from '../game/data/types';
import { uid, shuffle, weightedPick } from './random';
import { REWARD_WEIGHTS } from './constants';

export function createCardInstance(defId: string, upgraded = false): CardInstance {
  return { id: uid(), defId, upgraded };
}

export function createStarterDeck(): CardInstance[] {
  return getStarterDeckIds().map((id) => createCardInstance(id));
}

export function getCardDef(card: CardInstance): CardDef {
  return CARDS[card.defId];
}

export function getCardEffects(card: CardInstance): CardEffect[] {
  const def = CARDS[card.defId];
  if (!def) return [];
  if (card.upgraded && def.upgraded?.effects) return def.upgraded.effects;
  return def.effects;
}

export function getCardCost(card: CardInstance): number {
  if (card.costOverride !== undefined) return card.costOverride;
  const def = CARDS[card.defId];
  if (!def) return 0;
  if (card.upgraded && def.upgraded?.cost !== undefined) return def.upgraded.cost;
  return def.cost;
}

export function getCardDescription(card: CardInstance): string {
  const def = CARDS[card.defId];
  if (!def) return '';
  if (card.upgraded && def.upgraded?.description) return def.upgraded.description;
  return def.description;
}

export function getCardName(card: CardInstance): string {
  const def = CARDS[card.defId];
  if (!def) return '???';
  return card.upgraded ? `${def.name}+` : def.name;
}

export function hasKeyword(card: CardInstance, keyword: string): boolean {
  const def = CARDS[card.defId];
  return def?.keywords?.includes(keyword as CardDef['keywords'] extends (infer U)[] ? U : never) || false;
}

// Generate card rewards for a combat
export function generateCardRewards(
  act: 1 | 2 | 3,
  combatType: 'normal' | 'elite' | 'boss',
  count = 3
): CardDef[] {
  const pool = getCardPool(act);
  const weights = REWARD_WEIGHTS[combatType];
  const result: CardDef[] = [];

  for (let i = 0; i < count; i++) {
    // Roll rarity
    const rarity = weightedPick<CardRarity>(
      ['common', 'uncommon', 'rare'],
      [weights.common, weights.uncommon, weights.rare]
    );

    // Pick a card of that rarity
    const candidates = pool.filter(
      (c) => c.rarity === rarity && !result.some((r) => r.id === c.id)
    );

    if (candidates.length > 0) {
      const card = candidates[Math.floor(Math.random() * candidates.length)];
      result.push(card);
    } else {
      // Fallback to any available card
      const fallback = pool.filter((c) => !result.some((r) => r.id === c.id));
      if (fallback.length > 0) {
        result.push(fallback[Math.floor(Math.random() * fallback.length)]);
      }
    }
  }

  return result;
}

export function shuffleDeck(cards: CardInstance[]): CardInstance[] {
  return shuffle(cards);
}
