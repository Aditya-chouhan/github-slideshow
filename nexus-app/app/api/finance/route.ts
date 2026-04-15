import { NextRequest } from 'next/server';
import { runFinanceOrchestrator } from '@/lib/agents/finance/orchestrate';
import type { FinanceMode } from '@/lib/types';

export const runtime = 'nodejs';
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  const { input, mode = 'all' } = await req.json() as { input: string; mode?: FinanceMode };

  if (!input?.trim()) {
    return new Response(JSON.stringify({ error: 'input is required' }), { status: 400 });
  }

  const stream = runFinanceOrchestrator(input.trim(), mode);

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
