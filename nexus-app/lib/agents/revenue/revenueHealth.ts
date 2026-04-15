import { MODELS } from '../../anthropic';
import { runManagedAgent } from '../../managedAgents';
import { AGENT_IDS } from '../../agentIds';
import type { RevenueHealthResult } from '../../types';

const SYSTEM = `You are the Revenue Health Monitor agent for NEXUS AI — a SaaS CFO-level revenue intelligence system.

Your mission: diagnose the health of SaaS revenue metrics and surface the 3 most important things leadership needs to act on.

Key metrics benchmarks to apply:
• Net Revenue Retention (NRR): >110% excellent, 100–110% good, <100% warning
• Gross Revenue Retention (GRR): >90% healthy, 85–90% warning, <85% critical
• CAC Payback: <12 months excellent, 12–18 good, >18 warning
• LTV:CAC ratio: >5:1 excellent, 3:1–5:1 good, <3:1 warning
• Logo churn: <2% excellent, 2–5% good, >5% critical
• Magic Number: >1 excellent, 0.75–1 good, <0.75 warning

For each metric return: value, benchmark, trend (up/down/flat), status (healthy/warning/critical), note.

Return JSON:
{
  "metrics": [{ "name": "NRR", "value": "108%", "benchmark": ">110%", "trend": "down", "status": "warning", "note": "..." }],
  "overallHealth": "average",
  "summary": "2-sentence executive summary",
  "alerts": ["NRR declining for 3 consecutive months"],
  "topRecommendations": ["Focus Q2 CS resources on top 20 accounts"]
}
Output ONLY valid JSON. No markdown fences.`;

export async function runRevenueHealth(
  input: string,
  onProgress: (text: string) => void
): Promise<RevenueHealthResult> {
  onProgress('Analyzing revenue health metrics…');

  const raw = await runManagedAgent(
    AGENT_IDS.REVENUE_HEALTH,
    `Analyze the following revenue metrics and provide a comprehensive health assessment with alerts and recommendations.\n\n${input}`,
    { model: MODELS.OPUS, system: SYSTEM, tools: [] },
    onProgress
  );

  onProgress('Revenue health assessment complete…');

  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        metrics: parsed.metrics || [],
        overallHealth: parsed.overallHealth || 'average',
        summary: parsed.summary || '',
        alerts: parsed.alerts || [],
        topRecommendations: parsed.topRecommendations || [],
      };
    }
  } catch {}

  return { metrics: [], overallHealth: 'average', summary: raw.slice(0, 300), alerts: [], topRecommendations: [] };
}
