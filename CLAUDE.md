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
- **4 reusable interaction types** — drag-to-connect, slider, click-to-compare, click-toggle.

## Path Alias

Use `@/` for imports: `import { CARDS } from '@/game/data/cards'`

## Branches

- `master` — Pokemon-style version (archived, tagged `v1-pokemon-style`)
- `roguelike` — current development branch

## Plan File

Full game design: `.claude/plans/frolicking-crafting-eich.md`
