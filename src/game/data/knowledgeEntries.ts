export interface KnowledgeEntry {
  id: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  realWorldExample: string;
  category: 'basics' | 'integration' | 'advanced';
  scenarioId: string;
}

export const KNOWLEDGE_ENTRIES: KnowledgeEntry[] = [
  // === Act 1: Basics ===
  {
    id: 'Large Language Model (LLM)',
    title: 'Text Generation (LLMs)',
    shortDescription: 'How AI predicts the next word to generate text.',
    fullDescription:
      'Large Language Models work by predicting the most likely next word in a sequence, based on patterns learned from massive amounts of text. They don\'t "understand" language — they\'re incredibly sophisticated pattern matchers that produce coherent text one token at a time.',
    realWorldExample:
      'When you type in ChatGPT and it streams a response word by word, each word is the model\'s best prediction of what should come next given everything before it.',
    category: 'basics',
    scenarioId: 's1_textGeneration',
  },
  {
    id: 'Temperature',
    title: 'Temperature',
    shortDescription: 'Controls randomness and creativity in AI output.',
    fullDescription:
      'Temperature is a number (usually 0 to 2) that controls how "random" the AI\'s word choices are. At 0, it always picks the most likely word — safe but repetitive. At higher values, it considers less likely words, producing more creative but potentially nonsensical output.',
    realWorldExample:
      'A customer service chatbot uses temperature 0 for consistent, factual answers. A creative writing tool uses temperature 0.8+ so every story feels different.',
    category: 'basics',
    scenarioId: 's2_temperature',
  },
  {
    id: 'Hallucination',
    title: 'Hallucination',
    shortDescription: 'When AI confidently makes things up.',
    fullDescription:
      'Hallucination is when an AI generates information that sounds confident and plausible but is completely fabricated. The model has no concept of truth — it only knows what "sounds right" based on patterns. This is one of the biggest challenges in deploying AI systems.',
    realWorldExample:
      'Ask an AI for a citation and it might invent a real-sounding paper with fake authors, a fake journal, and a fake DOI — all with perfect formatting.',
    category: 'basics',
    scenarioId: 's3_hallucination',
  },
  {
    id: 'Database / Grounding',
    title: 'Grounding / Database',
    shortDescription: 'Connecting AI to real, verified data sources.',
    fullDescription:
      'Grounding means giving an AI access to a source of truth — a database, document, or API — so it can verify its answers against real data instead of guessing. This dramatically reduces hallucination and makes AI outputs trustworthy for real business use.',
    realWorldExample:
      'A restaurant chatbot connected to the actual menu database can give accurate prices and availability instead of guessing what items exist.',
    category: 'basics',
    scenarioId: 's4_grounding',
  },
  {
    id: 'Prompt Engineering',
    title: 'Prompt Engineering',
    shortDescription: 'Crafting better instructions to get better AI output.',
    fullDescription:
      'Prompt engineering is the practice of carefully structuring your input to an AI to get the best possible output. Small changes in wording, adding context, specifying format, or giving the AI a role can dramatically change the quality and relevance of responses.',
    realWorldExample:
      'Instead of "Write about dogs," a prompt engineer writes: "You are a veterinarian. Write a 200-word guide for first-time puppy owners covering vaccinations, diet, and exercise. Use bullet points."',
    category: 'basics',
    scenarioId: 's5_promptEng',
  },
  {
    id: 'Context Window',
    title: 'Context Window',
    shortDescription: "AI's limited memory for conversation and input.",
    fullDescription:
      'The context window is the maximum amount of text an AI can "see" at once — both your input and its output combined. Once the conversation exceeds this limit, the AI loses access to earlier messages. It\'s like a whiteboard that can only hold so much before old notes get erased.',
    realWorldExample:
      'When ChatGPT "forgets" something you said 30 messages ago, it\'s because that message has fallen outside the context window. Models range from 4K tokens (a few pages) to 1M+ tokens (several books).',
    category: 'basics',
    scenarioId: 's6_contextWindow',
  },

  // === Act 2: Integration ===
  {
    id: 'RAG (Retrieval-Augmented Generation)',
    title: 'RAG (Retrieval-Augmented Generation)',
    shortDescription: 'Search first, then generate — AI powered by your data.',
    fullDescription:
      'RAG is a two-step process: first, search a knowledge base for relevant information, then feed only that relevant context to the AI for generating a response. Instead of cramming everything into the prompt, RAG retrieves just what\'s needed — making AI accurate and efficient with large datasets.',
    realWorldExample:
      'When you upload a PDF to ChatGPT and ask questions about it, it uses RAG — searching the document for relevant sections rather than trying to memorize the entire thing.',
    category: 'integration',
    scenarioId: 's7_rag',
  },
  {
    id: 'API (Application Programming Interface)',
    title: 'APIs',
    shortDescription: 'How AI connects to and communicates with other software.',
    fullDescription:
      'An API (Application Programming Interface) is a structured way for two programs to talk to each other. One sends a request in a specific format, the other sends back a response. APIs let AI systems interact with the real world — checking inventory, placing orders, sending emails.',
    realWorldExample:
      'When you ask Siri to order an Uber, your phone sends an API request to Uber\'s servers with your location. Uber\'s API responds with driver info and ETA.',
    category: 'integration',
    scenarioId: 's8_api',
  },
  {
    id: 'Tool Use',
    title: 'Tool Use',
    shortDescription: 'AI that can decide which external tools to invoke.',
    fullDescription:
      'Tool use (or function calling) lets an AI decide which external tools to invoke based on the user\'s request. The AI reads the question, picks the right tool (calculator, search engine, database), formats the input, and interprets the result — all automatically.',
    realWorldExample:
      'When you ask Claude "What\'s the weather in Tokyo?", it recognizes this needs a weather tool, calls the weather API with "Tokyo" as the parameter, and presents the result in natural language.',
    category: 'integration',
    scenarioId: 's9_toolUse',
  },
  {
    id: 'AI Agent',
    title: 'AI Agents',
    shortDescription: 'Autonomous AI that plans, acts, and adapts.',
    fullDescription:
      'An AI agent is a system that can independently plan a sequence of actions, execute them, observe the results, and adjust its approach. Unlike a simple chatbot that responds once, an agent loops: think, act, observe, repeat — until the task is complete.',
    realWorldExample:
      'Devin (an AI software engineer) can read a bug report, search the codebase, write a fix, run tests, and submit a pull request — all autonomously through multiple plan-act-observe cycles.',
    category: 'integration',
    scenarioId: 's10_agent',
  },
  {
    id: 'Few-Shot Learning',
    title: 'Few-Shot Learning',
    shortDescription: 'Teaching AI by showing it a few examples.',
    fullDescription:
      'Few-shot learning means giving an AI 2-5 examples of the input/output pattern you want before asking it to perform the task. Instead of writing complex rules, you show it what "good" looks like. The AI picks up the pattern and applies it to new inputs.',
    realWorldExample:
      'To get an AI to classify customer emails, you show it 3 examples: "Where\'s my order?" -> Shipping, "This arrived broken" -> Returns, "Do you sell hats?" -> Sales. Now it can classify thousands more.',
    category: 'integration',
    scenarioId: 's11_fewShot',
  },
  {
    id: 'MCP (Model Context Protocol)',
    title: 'MCP (Model Context Protocol)',
    shortDescription: 'A universal standard for connecting AI to tools.',
    fullDescription:
      'MCP is an open protocol that standardizes how AI models connect to external tools and data sources. Before MCP, every AI + tool combination needed custom integration code. MCP provides a universal "plug" — like how USB replaced dozens of proprietary connectors.',
    realWorldExample:
      'With MCP, Claude can connect to your GitHub, Slack, and database through standard MCP servers. Any AI that supports MCP can use the same servers — no custom code per AI model.',
    category: 'integration',
    scenarioId: 's12_mcp',
  },

  // === Act 3: Advanced ===
  {
    id: 'Multimodal AI',
    title: 'Multimodal AI',
    shortDescription: 'AI that processes text, images, audio, and video.',
    fullDescription:
      'Multimodal AI can understand and generate multiple types of data — text, images, audio, and video — rather than being limited to just one. Each input type is a "modality". Modern models like GPT-4o and Gemini can see images, hear speech, and read text all at once.',
    realWorldExample:
      'Take a photo of a restaurant menu in Japanese, show it to GPT-4o, and it can read the text from the image, translate it to English, and even estimate prices — combining vision and language understanding.',
    category: 'advanced',
    scenarioId: 's13_multimodal',
  },
  {
    id: 'AI Ethics & Bias',
    title: 'AI Ethics & Bias',
    shortDescription: 'Identifying and correcting unfair patterns in AI.',
    fullDescription:
      'AI systems learn from human-generated data, which contains historical biases around race, gender, age, and more. Ethical AI development means actively testing for these biases, measuring fairness across groups, and building corrections into the system — not just hoping the AI "figures it out".',
    realWorldExample:
      'Amazon built an AI hiring tool that penalized resumes containing the word "women\'s" (e.g., "women\'s chess club") because it learned from 10 years of male-dominated hiring data. They had to scrap it entirely.',
    category: 'advanced',
    scenarioId: 's14_ethics',
  },
  {
    id: 'Automation',
    title: 'Automation',
    shortDescription: 'AI-powered tasks that run on their own.',
    fullDescription:
      'Automation means designing a workflow once and having it execute automatically based on triggers — a new email arrives, a form is submitted, a time is reached. Combined with AI, automations can handle tasks that previously required human judgment, like categorizing support tickets or generating reports.',
    realWorldExample:
      'An n8n workflow triggers when a customer submits a complaint form. AI classifies urgency, drafts a response, routes high-priority issues to a human, and auto-responds to simple ones — all without anyone clicking a button.',
    category: 'advanced',
    scenarioId: 's15_automation',
  },
  {
    id: 'Fine-Tuning',
    title: 'Fine-Tuning',
    shortDescription: 'Permanently customizing an AI model with your data.',
    fullDescription:
      'Fine-tuning takes a pre-trained AI model and trains it further on your specific data, permanently changing its behavior. Unlike prompt engineering (temporary instructions) or RAG (runtime context), fine-tuning bakes knowledge into the model\'s weights. It\'s expensive but creates a specialist.',
    realWorldExample:
      'A legal firm fine-tunes a model on 10 years of their contract reviews. The resulting model understands their specific terminology, clause preferences, and risk thresholds — without needing any of that in the prompt.',
    category: 'advanced',
    scenarioId: 's16_fineTuning',
  },
  {
    id: 'AI Safety',
    title: 'AI Safety',
    shortDescription: 'Protecting AI systems from misuse and harmful outputs.',
    fullDescription:
      'AI safety encompasses multiple layers of protection: defining core principles the AI must follow, detecting and blocking adversarial attacks like prompt injection, and ensuring safe fallback responses when the AI encounters uncertain or dangerous requests. Defense in depth is the key principle.',
    realWorldExample:
      'Claude has constitutional AI principles, input filtering for prompt injection, output filtering for harmful content, and graceful refusal responses — multiple independent safety layers working together.',
    category: 'advanced',
    scenarioId: 's17_safety',
  },
  {
    id: 'Orchestration',
    title: 'Orchestration',
    shortDescription: 'Coordinating multiple AI systems working together.',
    fullDescription:
      'Orchestration is when a central "manager" AI delegates subtasks to specialized AI systems, collects their results, and combines them into a final output. Each specialist is optimized for one thing — the orchestrator coordinates the team.',
    realWorldExample:
      'A content pipeline: the orchestrator receives "write a blog post about React." It delegates research to a search agent, writing to a creative agent, SEO optimization to an analytics agent, and image generation to DALL-E — then assembles the final post.',
    category: 'advanced',
    scenarioId: 's18_orchestration',
  },
];

// Look up entry by concept ID (matches scenario.concept)
export function getKnowledgeEntry(conceptId: string): KnowledgeEntry | undefined {
  return KNOWLEDGE_ENTRIES.find((e) => e.id === conceptId);
}

// Get entries by category
export function getEntriesByCategory(category: KnowledgeEntry['category']): KnowledgeEntry[] {
  return KNOWLEDGE_ENTRIES.filter((e) => e.category === category);
}
