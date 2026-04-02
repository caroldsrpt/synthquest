export interface LibraryNote {
  id: string;
  title: string;
  concept: string;
  content: string;
  region: string;
}

export const LIBRARY_NOTES: Record<string, LibraryNote> = {
  // Region 1: Echo Village
  whatIsLLM: {
    id: 'whatIsLLM',
    title: 'The Talker',
    concept: 'Large Language Model (LLM)',
    content:
      'Your Chatter is what scholars call a "Large Language Model" — an AI that generates text by predicting the next word based on patterns it learned from massive amounts of data.\n\nLLMs are incredible at conversation, writing, and understanding language. But on their own, they can only TALK. They can\'t take real actions in the world — they just generate text.\n\nThat\'s why your Chatter couldn\'t open that door or fix that bridge. Words alone don\'t change reality.',
    region: 'Echo Village',
  },
  whatIsTraining: {
    id: 'whatIsTraining',
    title: 'How They Learn',
    concept: 'Training',
    content:
      'Synths don\'t learn the way you do. They were "trained" — fed enormous amounts of text and data, learning patterns from billions of examples.\n\nWhen your Chatter speaks, it\'s not thinking. It\'s predicting what word comes next based on patterns it absorbed during training. It\'s like a musician who practiced so many songs that they can improvise — but they\'re remixing patterns, not truly creating from scratch.',
    region: 'Echo Village',
  },

  // Region 2: Link Town
  whatIsAPI: {
    id: 'whatIsAPI',
    title: 'The Connector',
    concept: 'API (Application Programming Interface)',
    content:
      'Those Link Stones? They\'re what tech people call "APIs" — Application Programming Interfaces.\n\nAn API is a standardized way for two systems to talk to each other. When your Synth uses a Link Stone to check the weather, it\'s making an "API call" — sending a request to a weather service and getting data back.\n\nAPIs are everywhere. Every time you check the weather on your phone, send a message, or make a payment, APIs are connecting different systems behind the scenes.',
    region: 'Link Town',
  },
  whatIsAgent: {
    id: 'whatIsAgent',
    title: 'The Doer',
    concept: 'AI Agent',
    content:
      'When your Chatter evolved into Acton, something fundamental changed. It went from an LLM (can only talk) to an AGENT (can take action).\n\nAn AI Agent is an LLM that has been given tools — the ability to search the web, run code, check databases, make API calls. It can plan a sequence of steps and execute them.\n\nThe difference? Ask an LLM to book a flight and it\'ll write you a nice paragraph about flights. Ask an Agent and it\'ll actually search, compare prices, and book one.',
    region: 'Link Town',
  },

  // Region 3: Memory Lake
  whatIsDatabase: {
    id: 'whatIsDatabase',
    title: 'The Memory Bank',
    concept: 'Database',
    content:
      'Memory Crystals connect to a vast organized store of information — what we call a "database."\n\nWithout a database, an AI only remembers what\'s in the current conversation. Close the chat? Everything is forgotten. Every conversation starts fresh.\n\nWith a database, information persists. Your Synth can remember past battles, your preferences, accumulated knowledge. It\'s the difference between a goldfish and an elephant.',
    region: 'Memory Lake',
  },
  whatIsHallucination: {
    id: 'whatIsHallucination',
    title: 'Confident Nonsense',
    concept: 'Hallucination',
    content:
      'The Fog makes Synths "hallucinate" — they generate confident, plausible-sounding information that is completely wrong.\n\nThis happens because LLMs don\'t actually "know" things. They predict likely-sounding text. Sometimes the most likely-sounding response is completely made up.\n\nAn AI might confidently cite a research paper that doesn\'t exist, or give you directions to a restaurant that closed years ago. It\'s not lying — it doesn\'t know the difference between true and false. It just knows what sounds right.',
    region: 'Memory Lake',
  },
  whatIsRAG: {
    id: 'whatIsRAG',
    title: 'The Anchor',
    concept: 'RAG (Retrieval-Augmented Generation)',
    content:
      'Ground Truth is the antidote to hallucination. In the real world, it\'s called "RAG" — Retrieval-Augmented Generation.\n\nInstead of just generating text from memory, a RAG system first SEARCHES a knowledge base for relevant, verified facts. Then it generates its response based on what it actually found.\n\nIt\'s like the difference between answering a test from memory (might hallucinate) vs. being allowed to look up answers in a textbook first (grounded in truth).',
    region: 'Memory Lake',
  },
};
