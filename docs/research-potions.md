# Potion System Research

## StS Potion Mechanics

- 2 slots (Potion Belt adds 2 more)
- Free actions (no energy cost, don't end turn)
- Drop rates: 40% normal, 65% elite, 100% boss
- Shop: 2 random potions per visit
- Rarity: Common 65%, Uncommon 25%, Rare 10%

## Byte's Bakery Potions (10 total)

### Common (5)

| # | Name | AI Concept | Target | Effect |
|---|------|-----------|--------|--------|
| 1 | Warm Cocoa | Checkpoint/Rollback | Self | Restore 15 Integrity |
| 2 | Espresso Shot | Batch Processing | Self | Draw 3 cards |
| 3 | Sourdough Starter | Pre-trained Model | Self | Gain 10 Firewall |
| 4 | Pepper Flakes | Adversarial Attack | Enemy | Apply 3 Vulnerable |
| 5 | Stale Bread | Deprecated Code | Enemy | Apply 2 Weak |

### Uncommon (3)

| # | Name | AI Concept | Target | Effect |
|---|------|-----------|--------|--------|
| 6 | Double-Shot Latte | Parallel Processing | Self | +2 energy this turn |
| 7 | Flash-Frozen Dough | Rate Limiting | All | Enemies deal half damage this turn |
| 8 | Mystery Macaron | Random Sampling | Self | 2 random uncommon cards (cost 0, Exhaust) |

### Rare (2)

| # | Name | AI Concept | Target | Effect |
|---|------|-----------|--------|--------|
| 9 | Golden Croissant | Reinforcement Reward | Self | Next 3 cards deal double damage/Firewall |
| 10 | Secret Recipe | Fine-Tuning | Self | Permanently upgrade a card from hand |

## System Design

- **Slots:** 2 starting, expandable to 3 via Batch Queue relic
- **Drop rates:** 40% normal, 65% elite, 100% boss
- **Shop prices:** Common 35g, Uncommon 55g, Rare 90g
- **UI:** Top HUD bar between HP and gold, always visible
- **Usage:** Click potion > click target (if targeted). Free action.
- **Discard:** Right-click > confirm

## Potion-Synergy Relics

| Name | Rarity | Effect | AI Concept |
|------|--------|--------|-----------|
| Batch Queue | Uncommon | +1 potion slot | Message queue |
| Insulated Thermos | Rare | Empty slot fills with random Common potion at combat start | Auto-scaling |
| Recipe Book | Boss | All potion effects +50% | Transfer learning |

## Implementation Types

```typescript
type PotionRarity = 'common' | 'uncommon' | 'rare';
type PotionTarget = 'self' | 'singleEnemy' | 'allEnemies';

interface PotionDef {
  id: string;
  name: string;
  rarity: PotionRarity;
  target: PotionTarget;
  description: string;
  aiTooltip: string;
  effect: PotionEffect;
}
```
