// ─────────────────────────────────────────────────────────────────────────────
// NEXUS AI — Managed Agent Session Runner
//
// When MANAGED_AGENTS_ENABLED=true → calls Claude Managed Agents Sessions API
// Otherwise → falls back to direct anthropic.messages.create() with local prompts
//
// This lets the app work in demo mode without Console setup,
// and in full Managed Agent mode once setup-agents.ts has been run.
// ─────────────────────────────────────────────────────────────────────────────

import Anthropic from '@anthropic-ai/sdk';
import { anthropic, MODELS } from './anthropic';
import { AGENT_IDS } from './agentIds';

const MANAGED_ENABLED = process.env.MANAGED_AGENTS_ENABLED === 'true';

export interface ManagedSessionOptions {
  agentId: string;
  message: string;
  onProgress?: (text: string) => void;
  onToolCall?: (tool: string, query: string) => void;
  /** Local fallback: model + system prompt used when MANAGED_AGENTS_ENABLED is not set */
  fallback: {
    model: string;
    system: string;
    tools?: Anthropic.Tool[];
  };
}

// ── Sessions API (Managed Agents) ─────────────────────────────────────────────

async function runViaSession(opts: ManagedSessionOptions): Promise<string> {
  const client = anthropic as unknown as {
    beta: {
      sessions: {
        create(params: { agent: string; environment_id?: string }): Promise<{ id: string }>;
        events: {
          stream(sessionId: string): Promise<AsyncIterable<{ type: string; content?: Array<{ type: string; text?: string }>; name?: string; input?: Record<string, string> }>>;
          send(sessionId: string, params: { events: Array<{ type: string; content: Array<{ type: string; text: string }> }> }): Promise<void>;
        };
      };
    };
  };

  const session = await client.beta.sessions.create({
    agent: opts.agentId,
    environment_id: AGENT_IDS.ENV_ID || undefined,
  });

  const stream = await client.beta.sessions.events.stream(session.id);

  await client.beta.sessions.events.send(session.id, {
    events: [{ type: 'user.message', content: [{ type: 'text', text: opts.message }] }],
  });

  let fullText = '';
  for await (const event of stream) {
    if (event.type === 'agent.message' && event.content) {
      for (const block of event.content) {
        if (block.type === 'text' && block.text) {
          opts.onProgress?.(block.text);
          fullText += block.text;
        }
      }
    } else if (event.type === 'agent.tool_use' && event.name) {
      const query = event.input?.query ?? event.name;
      opts.onProgress?.(`🔍 ${query}`);
      opts.onToolCall?.(event.name, query);
    } else if (event.type === 'session.status_idle') {
      break;
    }
  }
  return fullText;
}

// ── Direct Fallback (no Managed Agent setup needed) ───────────────────────────

async function runViaDirect(opts: ManagedSessionOptions): Promise<string> {
  const { model, system, tools = [] } = opts.fallback;

  if (tools.length > 0) {
    // Agentic loop with tool use
    const { tavilySearch } = await import('./anthropic');
    const messages: Anthropic.MessageParam[] = [{ role: 'user', content: opts.message }];

    for (let iter = 0; iter < 8; iter++) {
      const response = await anthropic.messages.create({
        model,
        max_tokens: 4096,
        system,
        tools,
        messages,
      });

      messages.push({ role: 'assistant', content: response.content });

      if (response.stop_reason === 'tool_use') {
        const toolResults: Anthropic.ToolResultBlockParam[] = [];
        for (const block of response.content) {
          if (block.type === 'tool_use') {
            const query = (block.input as Record<string, string>).query ?? block.name;
            opts.onProgress?.(`🔍 ${query}`);
            opts.onToolCall?.(block.name, query);
            const result = await tavilySearch(query, 5);
            toolResults.push({ type: 'tool_result', tool_use_id: block.id, content: result });
          }
        }
        messages.push({ role: 'user', content: toolResults });
      } else {
        const text = response.content.find(b => b.type === 'text');
        return text && text.type === 'text' ? text.text : '';
      }
    }
    return '';
  }

  // Simple single-turn call
  const response = await anthropic.messages.create({
    model,
    max_tokens: 4096,
    system,
    messages: [{ role: 'user', content: opts.message }],
  });
  const text = response.content.find(b => b.type === 'text');
  return text && text.type === 'text' ? text.text : '';
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Run a managed agent session. Uses Managed Agents Sessions API when
 * MANAGED_AGENTS_ENABLED=true and agentId is set. Otherwise falls back
 * to direct anthropic.messages.create() with the local system prompt.
 */
export async function runManagedSession(opts: ManagedSessionOptions): Promise<string> {
  if (MANAGED_ENABLED && opts.agentId) {
    try {
      return await runViaSession(opts);
    } catch (err) {
      // If Sessions API fails (e.g. SDK version doesn't support it), fall back
      const msg = err instanceof Error ? err.message : String(err);
      if (!msg.includes('beta.sessions')) {
        throw err; // Re-throw non-SDK errors
      }
      // Fall through to direct mode
    }
  }
  return runViaDirect(opts);
}

/**
 * Convenience wrapper — most agent files use this.
 * Requires the agent's fallback config to be provided separately.
 */
export async function runManagedAgent(
  agentId: string,
  message: string,
  fallback: ManagedSessionOptions['fallback'],
  onProgress: (text: string) => void,
  onToolCall?: (tool: string, query: string) => void
): Promise<string> {
  return runManagedSession({ agentId, message, fallback, onProgress, onToolCall });
}

// Re-export for convenience
export { MODELS };
