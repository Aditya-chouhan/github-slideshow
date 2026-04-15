import Anthropic from '@anthropic-ai/sdk';

if (!process.env.ANTHROPIC_API_KEY) {
  console.error('[NEXUS] ANTHROPIC_API_KEY is not set — all agent calls will fail. Add it to your Vercel environment variables.');
}

// Singleton Anthropic client
export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Model constants
export const MODELS = {
  OPUS: 'claude-opus-4-6',     // Orchestrator + quality-critical agents
  SONNET: 'claude-sonnet-4-6', // Fast workers (research, scoring)
} as const;

// Tavily search helper
export async function tavilySearch(
  query: string,
  maxResults = 5
): Promise<string> {
  const key = process.env.TAVILY_API_KEY;
  if (!key) return `[No Tavily key — using Claude's training knowledge for: "${query}"]`;

  try {
    const res = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: key,
        query,
        search_depth: 'basic',
        max_results: maxResults,
        include_answer: true,
      }),
    });
    if (!res.ok) return `[Search failed: ${res.status}]`;
    const data = await res.json();
    const results = (data.results || []).map((r: {title:string; url:string; content:string}) => ({
      title: r.title,
      url: r.url,
      content: r.content?.slice(0, 400),
    }));
    return JSON.stringify({ answer: data.answer, results });
  } catch {
    return `[Search error for: "${query}"]`;
  }
}

// Agentic loop helper — handles tool use automatically
export type ToolHandler = (name: string, input: Record<string, string>) => Promise<string>;

export async function runAgentLoop(
  model: string,
  system: string,
  userMessage: string,
  tools: Anthropic.Tool[],
  toolHandler: ToolHandler,
  onProgress?: (text: string) => void
): Promise<string> {
  const messages: Anthropic.MessageParam[] = [
    { role: 'user', content: userMessage },
  ];

  for (let iter = 0; iter < 8; iter++) {
    const response = await anthropic.messages.create({
      model,
      max_tokens: 4096,
      system,
      tools: tools.length > 0 ? tools : undefined,
      messages,
    });

    messages.push({ role: 'assistant', content: response.content });

    if (response.stop_reason === 'tool_use') {
      const toolResults: Anthropic.ToolResultBlockParam[] = [];
      for (const block of response.content) {
        if (block.type === 'tool_use') {
          onProgress?.(`🔍 ${(block.input as Record<string,string>).query || block.name}`);
          const result = await toolHandler(block.name, block.input as Record<string, string>);
          toolResults.push({ type: 'tool_result', tool_use_id: block.id, content: result });
        }
      }
      messages.push({ role: 'user', content: toolResults });
    } else {
      // End of loop — extract text
      const text = response.content.find(b => b.type === 'text');
      return text && text.type === 'text' ? text.text : '';
    }
  }
  return '';
}

// Web search tool definition (reused across agents)
export const WEB_SEARCH_TOOL: Anthropic.Tool = {
  name: 'web_search',
  description: 'Search the web for current, real-time information about companies, people, or topics.',
  input_schema: {
    type: 'object' as const,
    properties: {
      query: { type: 'string', description: 'The search query to execute' },
    },
    required: ['query'],
  },
};
