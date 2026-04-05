# Skill Check Mini-Game System

Inspired by Slots and Daggers' timing mechanics. Skill checks are a **spice mechanic** — short interactive moments on certain cards that break up normal combat rhythm and reinforce AI concepts.

## Design Principles

- NOT on every card — only special/notable cards where it adds flavor
- 2-3 seconds each, quick and punchy
- Better execution = more value from the card (not pass/fail, a spectrum)
- Show up every few turns — exciting, not tedious
- Different check types for different AI concepts
- Playtest and adjust frequency/difficulty

## Skill Check Types

### 1. Grounding Crosshair (Hallucination/Noise cards)
- Erratic moving target on a small board, player clicks to lock
- Nail center = full effect, edge = partial, miss = weak/backfire
- Grounded status effect slows the crosshair (easier to hit)
- **Teaches:** Unverified AI outputs are unreliable and hard to pin down

### 2. Temperature Slider (Text Generation cards)
- Fill meter with a sweet spot zone, click to stop
- Too low = weak but safe, sweet spot = full value, too high = powerful but risky (could overshoot)
- **Teaches:** Temperature tradeoff between creativity and reliability

### 3. Pattern Match (Logic/Classification cards)
- Quick flash of 3-4 symbols, pick the matching one
- Faster response = bonus damage/block
- **Teaches:** Pattern recognition is core to what AI does

### 4. Calibration Dial (Structure/Precision cards)
- Rotating dial/needle, click when it hits the green zone
- Upgraded/grounded cards have bigger green zones
- **Teaches:** Calibration and precision matter in AI systems

### 5. Batch Timing (Multi-hit/Combo cards)
- Rhythm game style — hit 3-4 beats in sequence
- Each successful beat = one damage/effect instance
- **Teaches:** Batch processing, sequential execution

## Integration Notes

- Skill checks appear as a brief overlay during card resolution
- Normal cards resolve instantly as usual — no change
- Cards with skill checks should be visually marked (icon/shimmer on card)
- Results feed into damage/block calculation before applying
- Consider: upgraded cards could have easier skill checks (bigger windows, slower movement)
- Consider: certain relics could modify skill check difficulty

## Open Questions (for playtesting)

- Exact frequency: every 3-4 turns? Only on rare/uncommon cards?
- Should players be able to opt out (auto-resolve at median value)?
- Accessibility: slower/easier mode toggle?
- Does this work on mobile if we ever go there?
- Which existing cards get skill checks vs only new cards?
