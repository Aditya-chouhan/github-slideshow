import { NextRequest } from "next/server";
import { runPipeline } from "@/lib/agents/orchestrate";
import type { AgentEvent, ProspectInput } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(req: NextRequest) {
  let input: ProspectInput;
  try {
    input = (await req.json()) as ProspectInput;
  } catch {
    return new Response("Invalid JSON body", { status: 400 });
  }

  if (!input.company || !input.contactName || !input.contactRole || !input.yourProduct || !input.yourName || !input.yourCompany) {
    return new Response("Missing required fields", { status: 400 });
  }

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      function emit(event: AgentEvent) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      }
      try {
        await runPipeline(input, emit);
      } catch (err) {
        const errEvent: AgentEvent = { type: "pipeline_error", agent: "memory", message: `Pipeline failed: ${(err as Error).message}`, timestamp: Date.now() };
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(errEvent)}\n\n`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache, no-transform", Connection: "keep-alive" },
  });
}