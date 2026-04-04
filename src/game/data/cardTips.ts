/**
 * First-draw tooltip tips for scenario reward cards.
 * Shown once per run the first time a player draws a card earned from a scenario.
 */
export const CARD_TIPS: Record<string, string> = {
  // === Act 1 ===
  prompt:
    'Prompt: The basic building block of AI — give it instructions, get output. Simple but effective.',
  temperatureZero:
    'Temperature Zero: Low temperature = predictable output. This card always deals exactly 7 damage — no randomness.',
  hallucinateData:
    'Hallucinate Data: High risk, high reward. Lots of Firewall, but adds Hallucination curse cards — just like an AI making things up.',
  groundTruth:
    'Ground Truth: Grounding prevents hallucination damage. Real data beats made-up data.',
  systemPrompt:
    'System Prompt: The hidden instructions that shape AI behavior. Sets up your Context for bigger plays.',
  summarize:
    'Summarize: AI can compress information. Draw more cards = more options each turn.',

  // === Act 2 ===
  databaseQuery:
    'Database Query: RAG in action — retrieve just the data you need. Firewall + Context in one card.',
  apiCall:
    'API Call: One program talking to another. Damage + draw = the AI reaching out and bringing something back.',
  webSearch:
    'Web Search: Sometimes the AI needs to look things up. Draw cards and gain Context — fresh info for better decisions.',
  toolUse:
    'Tool Use: The AI picks the right tool for the job. Plays the top card of your draw pile automatically.',
  fewShotExample:
    'Few-Shot Example: Show the AI what you want instead of explaining it. Replay your last card — learning by example.',
  inputValidation:
    'Input Validation: Check the input before the AI sees it. Firewall + cleanse Confused — blocking bad data at the door.',

  // === Act 3 ===
  agentLoop:
    'Agent Loop: An AI agent that plans, acts, and repeats. Plays cards from your draw pile in a chain — as long as they deal damage.',
  planAhead:
    'Plan Ahead: Agentic workflows are about designing the steps. Look ahead in your draw pile and pick the best card.',
  retryLogic:
    'Retry Logic: Automation means trying again when things fail. Hits twice if the enemy is still above half HP.',
  orchestrator:
    'Orchestrator: One manager AI delegates to specialists. Plays 3 random cards from your hand — a whole team in one move.',
  mcpConnect:
    'MCP Connect: A universal standard for AI-to-tool connections. Copy the enemy\'s intent — plug into anything.',
  fineTune:
    'Fine-Tune: Permanently teach the AI with your data. Massive damage + permanently upgrades a Prompt in your deck.',
};
