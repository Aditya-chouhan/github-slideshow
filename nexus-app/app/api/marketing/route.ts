import { NextRequest } from 'next/server';
import { orchestrateMarketing } from '@/lib/agents/marketing/orchestrate';
import type { AgentEvent, MarketingMode } from '@/lib/types';

export const runtime = 'nodejs';
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  const { mode, input } = await req.json();
  if (!input?.trim()) {
    return new Response(JSON.stringify({ error: 'Input required' }), { status: 400 });
  }
  const validModes: MarketingMode[] = ['content', 'campaign', 'seo', 'personalization', 'analytics'];
  if (!validModes.includes(mode)) {
    return new Response(JSON.stringify({ error: 'Invalid mode' }), { status: 400 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const emit = (event: AgentEvent) => {
        try { controller.enqueue(encoder.encode(JSON.stringify(event) + '\n')); } catch {}
      };
      try {
        await orchestrateMarketing(mode as MarketingMode, input.trim(), emit);
      } catch (error) {
        emit({ type: 'error', message: error instanceof Error ? error.message : 'Unknown error' });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/x-ndjson',
      'Cache-Control': 'no-cache, no-store',
      'X-Accel-Buffering': 'no',
    },
  });
}
