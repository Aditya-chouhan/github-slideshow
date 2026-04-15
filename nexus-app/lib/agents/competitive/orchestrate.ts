// ─────────────────────────────────────────────────────────────────────────────
// NEXUS AI — Competitive Intelligence Orchestrator
// ─────────────────────────────────────────────────────────────────────────────

import { runPricingIntel } from './pricingIntel';
import { runProductCompetitive } from './productCompetitive';
import { runMarketIntel } from './marketIntel';
import type { CompetitiveResult, CompetitiveMode, AgentEvent } from '../../types';

function emit(encoder: TextEncoder, controller: ReadableStreamDefaultController, event: AgentEvent) {
  controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
}

export function runCompetitiveOrchestrator(input: string, mode: CompetitiveMode): ReadableStream {
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      const result: CompetitiveResult = {
        mode,
        input,
        completedAt: '',
      };

      try {
        const runPricing = mode === 'pricing' || mode === 'all';
        const runProduct = mode === 'product' || mode === 'all';
        const runMarket = mode === 'market' || mode === 'all';

        const tasks: Promise<void>[] = [];

        if (runPricing) {
          emit(encoder, controller, { type: 'agent_start', agent: 'Pricing Intel', description: 'Researching competitor pricing and packaging', emoji: '💲' });
          tasks.push(
            runPricingIntel(input, text => emit(encoder, controller, { type: 'agent_progress', agent: 'Pricing Intel', text }))
              .then(r => { result.pricing = r; })
              .finally(() => emit(encoder, controller, { type: 'agent_complete', agent: 'Pricing Intel', summary: `${result.pricing?.signals.length ?? 0} competitors analyzed` }))
          );
        }

        if (runProduct) {
          emit(encoder, controller, { type: 'agent_start', agent: 'Product Competitive', description: 'Tracking competitor product announcements', emoji: '🏆' });
          tasks.push(
            runProductCompetitive(input, text => emit(encoder, controller, { type: 'agent_progress', agent: 'Product Competitive', text }))
              .then(r => { result.productCompetitive = r; })
              .finally(() => emit(encoder, controller, { type: 'agent_complete', agent: 'Product Competitive', summary: `${result.productCompetitive?.recentSignals.length ?? 0} signals detected` }))
          );
        }

        if (runMarket) {
          emit(encoder, controller, { type: 'agent_start', agent: 'Market Intel', description: 'Analyzing macro market trends', emoji: '🌍' });
          tasks.push(
            runMarketIntel(input, text => emit(encoder, controller, { type: 'agent_progress', agent: 'Market Intel', text }))
              .then(r => { result.marketIntel = r; })
              .finally(() => emit(encoder, controller, { type: 'agent_complete', agent: 'Market Intel', summary: `Sentiment: ${result.marketIntel?.marketSentiment ?? 'unknown'}` }))
          );
        }

        await Promise.all(tasks);

        result.completedAt = new Date().toISOString();
        emit(encoder, controller, { type: 'competitive_complete', result });
      } catch (err) {
        emit(encoder, controller, { type: 'error', message: err instanceof Error ? err.message : String(err) });
      } finally {
        controller.close();
      }
    },
  });
}
