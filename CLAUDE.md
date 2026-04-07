# SynthQuest — AI Learning Roguelike

## What This Is

A Slay the Spire-style deck-building roguelike that teaches AI concepts to complete beginners through interactive scenarios. The player builds an AI assistant for "Byte's Bakery" across 3 acts, learning 18 AI concepts through hands-on puzzles.

## Stack

- **Vite + React 19 + TypeScript** — core framework
- **Zustand** — state management (stores/)
- **@dnd-kit** — drag-and-drop for scenario interactions
- **Puppeteer** — automated playtesting (dev dep, uses Edge)
- **Howler.js** — sound effects (deferred)
- **Vercel** — deployment

## Architecture

```
src/
  game/data/       — Static definitions: cards, enemies, relics, scenarios
  game/systems/    — Game logic: combat resolution, map generation, enemy AI
  stores/          — Zustand stores: runStore (run state), combatStore (combat), metaStore (persistent)
  components/
    screens/       — Full-screen views: TitleScreen, MapScreen, CombatScreen, ScenarioScreen, etc.
    combat/        — Combat sub-components: cards, enemies, overlays, skill checks
    scenario/      — Scenario sub-components: individual scenarios (S1-S18)
    map/           — Map sub-components
    shared/        — Reusable UI: tooltips, status icons, deck viewer, relic bar
  utils/           — Helpers: constants, random, cardUtils, statusHelpers
```

## Combat Layout System (960x600 canvas)

**Fixed pixel budget — zones must sum to exactly 600px:**

| Zone | Height | Purpose |
|------|--------|---------|
| Header | 28px | Act/Turn, HP icon, Gold icon, Relics, Deck button |
| Battle Arena | 432px | Byte sprite, enemies, intents, messages, ByteOverlays |
| Hand Tray | 140px | Card fan (overlapping, StS-style), energy orb, draw/discard piles |

**No status bar** — eliminated in session 4. Info distributed:
- HP/Gold → header bar (icon + number)
- Energy → large orb in bottom-left of hand tray
- Firewall → shield overlay on Byte's right side
- Buffs/debuffs → icon row under Byte's HP bar
- Draw/discard piles → corner indicators in hand tray

**Card fan**: Cards overlap with rotation arc, bottom-clipped by viewport. Hover lifts card fully visible. Defined by constants: `CARD_W=90, CARD_H=126, CARD_VISIBLE_H=80, CARD_FAN_OVERLAP=26, CARD_HOVER_LIFT=90`.

**Sprite sizes**: `BYTE_SPRITE_SIZE=128`, enemies 96/112/140 (normal/elite/boss).

## Key Design Decisions

- **Teaching happens in scenarios, not combat.** Combat is the "game" layer.
- **One continuous story** — Byte's Bakery.
- **18 concepts across 3 acts** — each concept creates the need for the next.
- **Semi-fixed maps** — scenario positions predetermined, combat/shop/rest random.
- **Skill checks** — 5 timing-based mini-games on certain cards. Full-screen overlay (z-index 200).
- **Relic system** — 15 relics, wired into effectResolver/combatStore.
- **Potion system** — 10 AI-themed potions, 2 slots.
- **"Firewall" not "Block"** — AI-themed name for the block mechanic.
- **"Glitch" pre-S3, "Hallucination" post-S3** — curse mechanic renamed after the concept is taught.
- **Dev store exposure** — `window.__runStore/__combatStore/__metaStore` available in dev mode for playtesting.

## Key Files

- `src/utils/constants.ts` — All layout constants, colors, game balance numbers
- `src/utils/statusHelpers.ts` — Shared buff/debuff helper functions
- `src/game/systems/effectResolver.ts` — Card effect resolution + relic modifiers
- `src/game/systems/enemyAI.ts` — Enemy intent execution, hallucination processing
- `src/components/combat/ByteOverlays.tsx` — HP bar, firewall shield, buff/debuff icons near Byte
- `src/components/combat/PileIndicator.tsx` — Draw/discard pile corner indicators
- `src/components/combat/HandDisplay.tsx` — Card fan layout with hover-to-lift
- `src/components/combat/CardComponent.tsx` — Card rendering (normal 90x126, wide 120x168, small 80x112)
- `src/components/combat/RewardOverlay.tsx` — Post-combat reward card selection
- `src/components/combat/SkillCheckOverlay.tsx` — Skill check container (z-index 200)
- `src/components/combat/skillchecks/` — 5 individual skill check mini-games

## Playtesting

Puppeteer available for automated visual testing:
```bash
# Stores exposed on window in dev mode for programmatic navigation
# Use Edge as browser (Chromium has GPU issues in this env)
# See playtest script patterns in memory file
```

## Path Alias

Use `@/` for imports: `import { CARDS } from '@/game/data/cards'`

## Branches

- `master` — Pokemon-style version (archived, tagged `v1-pokemon-style`)
- `roguelike` — current development branch
