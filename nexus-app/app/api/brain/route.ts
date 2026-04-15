import { NextRequest } from 'next/server';
import { runBrainOrchestrator } from '@/lib/brain/orchestrator';

export const runtime = 'nodejs';
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  const { message } = await req.json() as { message: string };

  if (!message?.trim()) {
    return new Response(JSON.stringify({ error: 'message is required' }), { status: 400 });
  }

  const stream = runBrainOrchestrator(message.trim());

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
