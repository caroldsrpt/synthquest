# Relic Design Research

## StS Relic Design Patterns

Three archetypes of build-around relics:

1. **Value Amplifiers** — Make a specific action more rewarding (Kunai: every 3 attacks = +1 Dex)
2. **Cost Restructurers** — Change what you pay (Snecko Eye: randomize costs, +2 draw)
3. **Engine Enablers** — Create feedback loops (Dead Branch: exhaust = random card)

**What makes relics exciting:** They change how you draft. They have visible dramatic moments. They create tension/risk. They synergize across categories.

**What makes relics forgettable:** Flat stat bonuses, rare triggers, effects that don't change play pattern.

## Designed Relics for Byte's Bakery

### BOSS RELICS (pick 1 of 3 after boss)

| # | Name | AI Concept | Effect |
|---|------|-----------|--------|
| 1 | Transformer Oven | Attention mechanism | Last card drawn gets +1 dmg/block per other card in hand. Draw 1 fewer. |
| 2 | Sourdough Starter | Transfer learning | Start combat with 2 free "Pretrained" cards (cost 0, exhaust). Playing matching category cards gets +2. Starting deck costs +1 for first 2 turns. |
| 3 | Overfit Frosting Nozzle | Overfitting | First card's category gets +50% dmg/block. Other categories get -25%. |
| 4 | Proof Basket | Ensemble methods | Play 3 different categories in a turn = "Consensus": 4 block + 4 AoE damage + draw 1. |

### RARE RELICS (elite rewards, large chests)

| # | Name | AI Concept | Effect |
|---|------|-----------|--------|
| 5 | Hallucination Sprinkles | Hallucination | Start of turn: generate 1 random Hallucination card (shows fake effect, real effect varies). |
| 6 | Gradient Whisk | Gradient descent | Kill chain: each kill gives +1 bonus damage (max +4). Non-lethal attack resets to +0. |
| 7 | Token Tray | Tokenization | Start of combat: 2+ cost cards split into 2 Token copies, each cost 1 with half effects. |

### UNCOMMON RELICS (elite rewards, medium chests)

| # | Name | AI Concept | Effect |
|---|------|-----------|--------|
| 8 | Feedback Frosting Bag | Reinforcement learning | Kill or perfect block = 1 Reward Token. 3 tokens = upgrade random card in hand (this combat). |
| 9 | Batch Bowl | Batch processing | Every 4th card played each turn has effects doubled. |
| 10 | Recipe Book | Training data | Start of combat: choose 1 category for +1 to all values. Noise cards reduce bonus by 1. |
| 11 | Piping Tip Set | Feature extraction | Play 2 same-category in a row: 2nd gets +3. 3 in a row: +5. 4: +8. Resets on different category. |

### COMMON RELICS

| # | Name | AI Concept | Effect |
|---|------|-----------|--------|
| 12 | Cooling Rack | Learning rate decay | 1st card/turn: +3. 2nd: +2. 3rd: +1. 4th+: +0. |
| 13 | Mise en Place Tray | Data preprocessing | Start of combat: remove all Curses and Noise cards for this combat only. |
| 14 | Measuring Cups | Quantization | Odd damage rounds down to even, but card costs 1 less (min 0). |
| 15 | The Timer | Inference timeout | +1 energy/turn. Can only play 5 cards/turn. |

### SHOP RELIC

| # | Name | AI Concept | Effect |
|---|------|-----------|--------|
| 16 | Temperature Dial | Temperature parameter | Each turn choose: Low (exact values, +2 block), Medium (+/-15% variance, +1 draw), High (+/-40% variance, +2 draw, +1 energy). Cost: 250g. |

## Tier Distribution (target ~30-40 relics at launch)

| Tier | Count | Source |
|------|-------|--------|
| Starter | 1 | Game start |
| Common | 5-6 | Floor rewards, small chests |
| Uncommon | 6-8 | Elite rewards, medium chests, events |
| Rare | 4-5 | Elite rewards (low chance), large chests |
| Boss | 4-5 | Boss kill (pick 1 of 3) |
| Shop | 2-3 | Shop only (200-350g) |
| Event | 2-3 | Specific narrative events |

Target: 11-14 relics per run, 2-3 "build-around" + rest support.

## Anti-Synergy Rules

**Hard conflicts (never offer together):**
- Overfit Frosting Nozzle vs Proof Basket (mono vs multi category)
- Mise en Place Tray vs Hallucination Sprinkles (removes vs generates Noise)
- The Timer vs Batch Bowl (limits vs rewards many plays)

## Relic Offering Algorithm

1. Always include 1 that synergizes with player's most-played category
2. Always include 1 that pushes toward a different strategy
3. Third is random
4. Never offer two mutually exclusive relics together
