// ─────────────────────────────────────────────────────────────────────────────
// NEXUS AI — Finance Orchestrator
// ─────────────────────────────────────────────────────────────────────────────

import { runFinancialForecasting } from './financialForecasting';
import { runSpendIntel } from './spendIntel';
import type { FinanceResult, FinanceMode, AgentEvent } from '../../types';

function emit(encoder: TextEncoder, controller: ReadableStreamDefaultController, event: AgentEvent) {
  controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
}

export function runFinanceOrchestrator(input: string, mode: FinanceMode): ReadableStream {
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      const result: FinanceResult = {
        mode,
        input,
        completedAt: '',
      };

      try {
        if (mode === 'forecast' || mode === 'all') {
          emit(encoder, controller, { type: 'agent_start', agent: 'Financial Forecasting', description: 'Building 3-scenario ARR forecast', emoji: '📉' });
          result.forecast = await runFinancialForecasting(
            input,
            text => emit(encoder, controller, { type: 'agent_progress', agent: 'Financial Forecasting', text })
          );
          emit(encoder, controller, { type: 'agent_complete', agent: 'Financial Forecasting', summary: `${result.forecast.scenarios.length} scenarios built` });
        }

        if (mode === 'spend' || mode === 'all') {
          emit(encoder, controller, { type: 'agent_start', agent: 'Spend Intelligence', description: 'Analyzing spend and finding savings', emoji: '💳' });
          result.spend = await runSpendIntel(
            input,
            text => emit(encoder, controller, { type: 'agent_progress', agent: 'Spend Intelligence', text })
          );
          emit(encoder, controller, { type: 'agent_complete', agent: 'Spend Intelligence', summary: `Savings potential: ${result.spend.annualizedSavingsPotential}` });
        }

        result.completedAt = new Date().toISOString();
        emit(encoder, controller, { type: 'finance_complete', result });
      } catch (err) {
        emit(encoder, controller, { type: 'error', message: err instanceof Error ? err.message : String(err) });
      } finally {
        controller.close();
      }
    },
  });
}
