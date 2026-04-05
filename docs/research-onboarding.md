# Onboarding Research

## Key Lessons from Other Roguelikes

**StS:** Starting deck IS the tutorial. Constraints teach. First fight (Jaw Worm) is nearly impossible to lose. Neow's blessing gives agency before fight 1.

**Balatro:** Bridge from known (poker) to unknown (joker economy). First blind is trivially easy. Jokers introduced AFTER first success. Scoring animation teaches more than tooltips.

**Inscryption:** Narrative disguises tutorial. Talking card (Stoat) is diegetic hint system. Cabin exploration between fights = cognitive breathing room. Death is progression, not failure.

**Monster Train:** Brief contextual tooltips OK when mechanics are non-obvious. Popups attached to immediate actions only. Never explain something player won't use for 5 minutes.

## "Delayed Recognition" Technique

1. Give player a card that embodies an AI concept
2. Let them use it 3-4 times across fights
3. Name the concept in a later Scenario
4. Player: "Oh! I was already doing that!"

Much more effective than concept-first teaching.

## Recommended Starting Deck (7 cards)

| Card | Cost | Effect | Hidden AI Concept |
|------|------|--------|-------------------|
| Whisk (x3) | 1 | Deal 5 damage | — (basic attack) |
| Prep Station (x2) | 1 | Gain 5 block | — (basic defense) |
| Taste Test (x1) | 1 | Deal 3 dmg. If enemy is "Sour": deal 6 | Pattern Recognition |
| Preheat (x1) | 0 | Apply 1 "Sour" to enemy. Draw 1 | Data Labeling |

**Why 7 not 10:** Beginners see nearly full deck each turn. Less anxiety about unseen cards.

## First 5 Minutes Flow

**Screen 1 — New Game (0:00-0:15):** Brief 3-4 line narrative intro. No character select.

**Screen 2 — Map (0:15-0:30):** First 3 nodes linear (Combat > Event > Scenario). Byte speech bubble: "Our first customer!"

**Screen 3 — First Combat (0:30-2:00):** "The Impatient Customer" (20 HP, hits for 5-8). Nearly impossible to lose. Micro-hints from Byte as speech bubbles (not popups), fade after 3s. Card reward after: always offer "Sort the Sprinkles" (Classification concept, unnamed).

**Screen 4 — Event (2:00-2:45):** "A Surprise Delivery" — choose between +10 max HP or random card. Palate cleanser.

**Screen 5 — First Scenario (2:45-4:30):** "The Lunch Rush" — drag 6 customers into Sweet/Savory groups. Simple sorting = Classification. If player has "Sort the Sprinkles": delayed recognition payoff.

**Screen 6 — Map Opens (4:30-5:00):** Map branches for first time. Onboarding complete.

## Design Rules

- Relics: DON'T introduce until after Act 1 boss or first shop (node 5-6)
- Death in Act 1: gentle, offer small persistent bonus for next run
- Byte's commentary: 1 per node max, under 15 words, skippable
- First 3 nodes: linear. Then branch.
- Front-load 2-3 concept cards in Act 1 rewards before the naming Scenario
