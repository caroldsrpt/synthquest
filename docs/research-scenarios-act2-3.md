# Act 2+3 Scenario Puzzle Designs (S7-S18)

## ACT 2: The Integration Hub

### S7: RAG (Retrieval-Augmented Generation)
**Metaphor:** 500-recipe filing cabinet too big for context window. Search funnel pulls only relevant recipes.
**Puzzle:** Drag "Search" magnifying glass into funnel slot. Click search on query "espresso pairing" — watch 3 of 5 tagged recipe cards filter through into context window. Others stay behind.
**Interaction:** Drag-to-slot (@dnd-kit)
**Connects to:** S4 (grounding), S6 (context window)

### S8: APIs & Integration
**Metaphor:** AI can talk but can't check systems. APIs are phone lines to kitchen/inventory/schedule.
**Puzzle:** Drag cables to connect AI to 3 service boxes (Inventory, Orders, Schedule). Customer question replays with AI's visible thought process using all 3 systems.
**Interaction:** Drag-to-slot (@dnd-kit)

### S9: Tool Use
**Metaphor:** Smart baker picks the right appliance for each task.
**Puzzle:** Phase 1: manually drag 3 requests to correct tools (Calculator, Image Search, Hours). Phase 2: toggle "Let AI Choose" — watch AI auto-route, including picking 2 tools for 1 ambiguous request.
**Interaction:** Drag-to-slot then click-to-toggle

### S10: AI Agents
**Metaphor:** Wedding cake order needs multi-step plan-act-observe-adjust loops.
**Puzzle:** Circular diagram (Plan > Act > Observe > Adjust). Click "Start Agent" — watch 3 loops: calendar conflict > adjust date, pricing over budget > adjust options, confirm booking. Click "Continue" between loops.
**Interaction:** Watch-and-advance (guided/cinematic)

### S11: MCP (Model Context Protocol)
**Metaphor:** Standard power outlets replacing tangled custom cables.
**Puzzle:** AI connected to 4 systems via tangled cables with different connector shapes. Click each to standardize to MCP rectangle. 5th system auto-connects. 6th appears and connects with one click.
**Interaction:** Click-to-toggle

### S12: Fine-Tuning
**Metaphor:** Culinary school vs reading a recipe each time.
**Puzzle:** Drag 5 training examples (input/output in Byte's voice) onto AI brain. Progress bar fills. Click "Fine-Tune." Before/after comparison of generic vs personality-rich responses.
**Interaction:** Drag-to-slot (@dnd-kit)

---

## ACT 3: The Orchestration Layer

### S13: Multimodal AI
**Metaphor:** AI that can see, hear, and read — not just text.
**Puzzle:** AI brain with 4 ports (TEXT lit, IMAGE/AUDIO/VIDEO grayed). 4 incoming requests with modality icons. Click ports to activate. Blocked requests turn green as matching ports activate.
**Interaction:** Click-to-toggle

### S14: AI Ethics & Bias
**Metaphor:** AI trained on one neighborhood's data recommends croissants to everyone.
**Puzzle:** 6 customer recommendations — identify 3 as "Biased" (language-based price tier, name-based pricing, name-based preferences). Then drag 3 fix rules onto AI. Re-run shows fair results.
**Interaction:** Click-to-label + drag-to-slot

### S15: Embeddings & Similarity
**Metaphor:** Flavor map — meaning as position on a 2D scatter plot.
**Puzzle:** 2D plot (Light<>Rich, Cool<>Warm). Drag 8 bakery items to correct positions. Customer query "warm and comforting" appears as star — 3 closest items highlight as recommendations.
**Interaction:** Spatial placement (@dnd-kit)

### S16: Evaluation & Benchmarks
**Metaphor:** Food safety score vs customer reviews vs repeat rate.
**Puzzle:** Compare 2 models across 3 tabs: Benchmark (A wins 95% vs 82%), Customer Rating (B wins 4.5 vs 2.5 stars), Real-World Impact (B wins 34% vs 12% repeat). Player picks overall winner (B).
**Interaction:** Click-to-toggle tabs + click-to-label

### S17: AI Safety & Alignment
**Metaphor:** Protect against recipe theft, trolls, and allergen misinformation.
**Puzzle:** Build 3 concentric rings: Core Principles (drag 3 rules), Detection (label 3 attack types: prompt injection, info extraction, jailbreak), Response (pick safe response for each).
**Interaction:** Drag-to-slot + click-to-label

### S18: AI Orchestration
**Metaphor:** Head chef coordinating 5 specialist AIs for a corporate event.
**Puzzle:** Drag 5 specialists into slots (Menu Planner, Pricing, Design, Logistics, Quality). Click "Run" — request splits into subtasks routed to specialists. Quality Reviewer catches error, sends back for revision. Final proposal assembles.
**Interaction:** Drag-to-slot + watch-and-advance

---

## Reusable Interaction Patterns

1. **Drag-to-slot** (existing @dnd-kit): S7, S8, S12, S14, S17, S18
2. **Click-to-toggle/activate**: S9, S11, S13, S16
3. **Click-to-label/judge**: S14, S16, S17
4. **Spatial placement** (new, uses @dnd-kit): S15
5. **Watch-and-advance** (cinematic): S10

## Data Updates Required

Current `scenarios.ts` has different concept assignments for S9-S18. Need to remap to match this design. `knowledgeEntries.ts` Act 2+3 entries also need updating.
