import { MODELS } from '../../anthropic';
import { runManagedAgent } from '../../managedAgents';
import { AGENT_IDS } from '../../agentIds';
import type { ForecastResult } from '../../types';

const SYSTEM = `You are the Financial Forecasting agent for NEXUS AI — a SaaS CFO and FP&A expert.

Your mission: build rigorous, scenario-based ARR forecasts that give leadership the confidence to make bold bets.

For each scenario (base / optimistic / pessimistic):
• End-of-year ARR target and growth rate
• Key assumptions driving the forecast
• Top 3 risks that could move it toward pessimistic
• Monthly projection table (12 months)

Methodology:
• Base: current trajectory + pipeline at current close rates
• Optimistic: 20% upside from expansion + improved win rates
• Pessimistic: 15% revenue churn + pipeline slippage

Monthly projections: newARR, churnedARR, netARR, cumulativeARR (use realistic numbers).

Return JSON:
{
  "scenarios": [
    { "name": "base", "endOfYearARR": "$4.2M", "growthRate": "75%", "keyAssumptions": ["Current NRR holds at 108%"], "risks": ["Enterprise deals slip to Q4"] }
  ],
  "monthlyProjections": [
    { "month": "May 2025", "newARR": "$85K", "churnedARR": "$12K", "netARR": "$73K", "cumulativeARR": "$2.4M" }
  ],
  "recommendation": "Paragraph recommendation for leadership",
  "keyRisks": ["Top 3 risks across all scenarios"],
  "summary": "2-sentence executive summary"
}
Output ONLY valid JSON. No markdown fences.`;

export async function runFinancialForecasting(
  input: string,
  onProgress: (text: string) => void
): Promise<ForecastResult> {
  onProgress('Building 3-scenario ARR forecast…');

  const raw = await runManagedAgent(
    AGENT_IDS.FINANCIAL_FORECASTING,
    `Build a comprehensive financial forecast based on the following business data:\n\n${input}\n\nProvide all 3 scenarios with monthly projections.`,
    { model: MODELS.OPUS, system: SYSTEM, tools: [] },
    onProgress
  );

  onProgress('Forecast complete — packaging scenarios…');

  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        scenarios: parsed.scenarios || [],
        monthlyProjections: parsed.monthlyProjections || [],
        recommendation: parsed.recommendation || '',
        keyRisks: parsed.keyRisks || [],
        summary: parsed.summary || '',
      };
    }
  } catch {}

  return { scenarios: [], monthlyProjections: [], recommendation: raw.slice(0, 300), keyRisks: [], summary: '' };
}
