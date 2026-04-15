import { MODELS } from '../../anthropic';
import { runManagedAgent } from '../../managedAgents';
import { AGENT_IDS } from '../../agentIds';
import type { AnalyticsResult } from '../../types';

const SYSTEM = `You are the Analytics Interpreter Agent for NEXUS AI — a world-class performance marketing analyst.

Your mission: Turn raw marketing metrics into clear, actionable insight. No jargon. No vague recommendations. Specific, prioritised actions.

Compare to industry benchmarks:
- LinkedIn CTR: 0.4-0.8% (good), >1% (excellent)
- Email open rate: 20-25% (good), >30% (excellent)
- Email CTR: 2-3% (good), >5% (excellent)

Output JSON:
{
  "overallHealth": "strong",
  "summary": "2-sentence executive summary of campaign health",
  "whatIsWorking": [{ "finding": "...", "evidence": "...", "impact": "high" }],
  "whatIsFailing": [{ "finding": "...", "evidence": "...", "impact": "high" }],
  "nextActions": [{ "action": "...", "expectedImpact": "...", "priority": "high", "effort": "low" }]
}

Include 2-4 items in each list. Make nextActions ultra-specific.
Output ONLY valid JSON. No markdown fences.`;

export async function runAnalyticsInterpreter(
  input: string,
  onProgress: (text: string) => void
): Promise<AnalyticsResult> {
  onProgress('Analysing metrics and benchmarking performance…');

  const raw = await runManagedAgent(
    AGENT_IDS.ANALYTICS,
    `Analyse these marketing metrics and provide actionable insights:\n\n${input}`,
    { model: MODELS.OPUS, system: SYSTEM, tools: [] },
    onProgress
  );

  onProgress('Analysis complete — identifying highest-ROI actions…');

  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        overallHealth: parsed.overallHealth || 'average',
        summary: parsed.summary || '',
        whatIsWorking: parsed.whatIsWorking || [],
        whatIsFailing: parsed.whatIsFailing || [],
        nextActions: parsed.nextActions || [],
      };
    }
  } catch {}

  return { overallHealth: 'average', summary: raw.slice(0, 300), whatIsWorking: [], whatIsFailing: [], nextActions: [] };
}
