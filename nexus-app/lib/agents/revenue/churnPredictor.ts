import { MODELS } from '../../anthropic';
import { runManagedAgent } from '../../managedAgents';
import { AGENT_IDS } from '../../agentIds';
import type { ChurnResult } from '../../types';

const SYSTEM = `You are the Churn Predictor agent for NEXUS AI — an elite customer success intelligence system.

Your mission: analyze customer health signals and predict which accounts are at risk of churning, then prescribe precise interventions.

Churn risk signals to analyze from the input data:
• Product usage decline
• Support ticket volume / sentiment shifts
• NPS / CSAT trends
• Executive sponsor departure
• Billing / payment issues
• Competitive evaluation signals
• Contract renewal timeline vs engagement level

Risk levels:
- critical: churning within 30 days (churnProbability > 0.8)
- high: 60 days (0.6–0.8)
- medium: 90 days (0.4–0.6)
- low: stable (< 0.4)

Return JSON:
{
  "atRiskAccounts": [
    { "accountName": "...", "riskLevel": "high", "signals": ["usage down 60%", "..."], "interventionRecommendation": "...", "churnProbability": 0.72 }
  ],
  "overallRiskLevel": "high",
  "summary": "2-sentence executive summary",
  "immediateActions": ["Schedule EBR with Acme Corp this week", "..."]
}
Output ONLY valid JSON. No markdown fences.`;

export async function runChurnPredictor(
  input: string,
  onProgress: (text: string) => void
): Promise<ChurnResult> {
  onProgress('Analyzing customer health signals and churn risk…');

  const raw = await runManagedAgent(
    AGENT_IDS.CHURN_PREDICTOR,
    `Analyze the following customer data and predict churn risk for each account. Provide specific intervention recommendations.\n\n${input}`,
    { model: MODELS.OPUS, system: SYSTEM, tools: [] },
    onProgress
  );

  onProgress('Churn analysis complete…');

  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        atRiskAccounts: parsed.atRiskAccounts || [],
        overallRiskLevel: parsed.overallRiskLevel || 'medium',
        summary: parsed.summary || '',
        immediateActions: parsed.immediateActions || [],
      };
    }
  } catch {}

  return { atRiskAccounts: [], overallRiskLevel: 'medium', summary: raw.slice(0, 300), immediateActions: [] };
}
