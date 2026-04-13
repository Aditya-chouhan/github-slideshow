import { NextRequest } from 'next/server';
import { orchestrateSales } from '@/lib/agents/orchestrate';
import type { AgentEvent } from '@/lib/types';

export const runtime = 'nodejs';
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  const { company } = await req.json();
  if (!company?.trim()) {
    return new Response(JSON.stringify({ error: 'Company name required' }), { status: 400 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const emit = (event: AgentEvent) => {
        try { controller.enqueue(encoder.encode(JSON.stringify(event) + '\n')); } catch {}
      };
      try {
        await orchestrateSales(company.trim(), emit);
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
