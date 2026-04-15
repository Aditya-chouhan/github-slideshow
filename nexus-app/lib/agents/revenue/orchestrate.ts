// ─────────────────────────────────────────────────────────────────────────────
// NEXUS AI — Revenue Operations Orchestrator
// Routes to churn, expansion, or health agents (or all three in parallel)
// ─────────────────────────────────────────────────────────────────────────────

import { runChurnPredictor } from './churnPredictor';
import { runExpansionIntel } from './expansionIntel';
import { runRevenueHealth } from './revenueHealth';
import type { RevenueResult, RevenueMode, AgentEvent } from '../../types';

function emit(encoder: TextEncoder, controller: ReadableStreamDefaultController, event: AgentEvent) {
  controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
}

export function runRevenueOrchestrator(input: string, mode: RevenueMode): ReadableStream {
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      const result: RevenueResult = {
        mode,
        input,
        completedAt: '',
      };

      try {
        const runChurn = mode === 'churn' || mode === 'all';
        const runExpansion = mode === 'expansion' || mode === 'all';
        const runHealth = mode === 'health' || mode === 'all';

        const tasks: Promise<void>[] = [];

        if (runChurn) {
          emit(encoder, controller, { type: 'agent_start', agent: 'Churn Predictor', description: 'Analyzing churn risk across customer base', emoji: '🚨' });
          tasks.push(
            runChurnPredictor(input, text => emit(encoder, controller, { type: 'agent_progress', agent: 'Churn Predictor', text }))
              .then(r => { result.churn = r; })
              .finally(() => emit(encoder, controller, { type: 'agent_complete', agent: 'Churn Predictor', summary: `${result.churn?.atRiskAccounts.length ?? 0} at-risk accounts` }))
          );
        }

        if (runExpansion) {
          emit(encoder, controller, { type: 'agent_start', agent: 'Expansion Intel', description: 'Scanning for expansion opportunities', emoji: '📈' });
          tasks.push(
            runExpansionIntel(input, text => emit(encoder, controller, { type: 'agent_progress', agent: 'Expansion Intel', text }))
              .then(r => { result.expansion = r; })
              .finally(() => emit(encoder, controller, { type: 'agent_complete', agent: 'Expansion Intel', summary: `${result.expansion?.opportunities.length ?? 0} opportunities found` }))
          );
        }

        if (runHealth) {
          emit(encoder, controller, { type: 'agent_start', agent: 'Revenue Health', description: 'Evaluating key revenue metrics', emoji: '💰' });
          tasks.push(
            runRevenueHealth(input, text => emit(encoder, controller, { type: 'agent_progress', agent: 'Revenue Health', text }))
              .then(r => { result.revenueHealth = r; })
              .finally(() => emit(encoder, controller, { type: 'agent_complete', agent: 'Revenue Health', summary: `Overall health: ${result.revenueHealth?.overallHealth ?? 'unknown'}` }))
          );
        }

        // All agents run in parallel
        await Promise.all(tasks);

        result.completedAt = new Date().toISOString();
        emit(encoder, controller, { type: 'revenue_complete', result });
      } catch (err) {
        emit(encoder, controller, { type: 'error', message: err instanceof Error ? err.message : String(err) });
      } finally {
        controller.close();
      }
    },
  });
}
