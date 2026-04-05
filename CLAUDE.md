# SynthQuest — AI Learning Roguelike

## What This Is

A Slay the Spire-style deck-building roguelike that teaches AI concepts to complete beginners through interactive scenarios. The player builds an AI assistant for "Byte's Bakery" across 3 acts, learning 18 AI concepts through hands-on puzzles.

## Stack

- **Vite + React 19 + TypeScript** — core framework
- **Zustand** — state management (stores/)
- **@dnd-kit** — drag-and-drop for scenario interactions
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
    combat/        — Combat sub-components: cards, enemies, player status
    scenario/      — Scenario sub-components: ShopDiagram, DragZone, individual scenarios (S1-S18)
    map/           — Map sub-components
    shared/        — Reusable UI: tooltips, status icons
  utils/           — Helpers: constants, random, cardUtils
```

## Key Design Decisions

- **Teaching happens in scenarios, not combat.** Scenarios are interactive puzzles where the player builds an AI system. Combat is the "game" layer where they USE what they learned.
- **One continuous story** — Byte's Bakery. Each scenario adds a capability to the same AI assistant.
- **18 concepts across 3 acts** — each concept creates the need for the next.
- **Semi-fixed maps** — scenario positions are predetermined, combat/shop/rest are random.
- **Skill checks** — timing-based mini-games on certain cards (5 types). Multiplier affects damage/block.
- **Relic system** — 15 relics, wired into effectResolver/combatStore/CombatScreen. Awarded after elite/boss.
- **Potion system** — 10 AI-themed bakery potions, 2 slots, drops after combat, available in shop.

## Key Files

- `src/game/systems/effectResolver.ts` — All card effect resolution + relic modifiers
- `src/game/systems/enemyAI.ts` — Enemy intent execution, hallucination processing, debuff ticking
- `src/game/data/skillChecks.ts` — Card-to-skill-check mapping
- `src/game/data/potions.ts` — 10 potion definitions
- `docs/research-*.md` — Design research (relics, potions, scenarios, onboarding, skill checks)

## Path Alias

Use `@/` for imports: `import { CARDS } from '@/game/data/cards'`

## Branches

- `master` — Pokemon-style version (archived, tagged `v1-pokemon-style`)
- `roguelike` — current development branch

## Plan Files

- Build plan: `.claude/plans/iridescent-enchanting-book.md`
- Original game design: `.claude/plans/frolicking-crafting-eich.md`
