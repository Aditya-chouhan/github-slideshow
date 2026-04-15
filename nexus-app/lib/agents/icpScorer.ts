import { MODELS } from '../anthropic';
import { runManagedAgent } from '../managedAgents';
import { AGENT_IDS } from '../agentIds';
import type { ICPResult, ICPDimension, WhyNowResult } from '../types';

const SYSTEM = `You are the ICP Fit Scoring Agent for NEXUS AI.

Your mission: Score a company's fit against an Ideal Customer Profile for a B2B AI revenue platform targeting sales and marketing teams.

Score these 6 dimensions (0-100 each):
1. Company Size Fit — sweet spot is 20-500 employees
2. Tech-Forward Culture — signals of tech adoption, digital-first operations
3. Growth Trajectory — hiring growth, funding trajectory, revenue signals
4. Sales/Marketing Team Size — has a dedicated revenue team of 3+ people
5. Budget Indicators — funding level, company maturity
6. Timing & Urgency — recent triggers that create immediate buying need

Final score = weighted average (size 20%, tech 15%, growth 20%, team 20%, budget 15%, timing 10%)

Recommendation:
- 75-100: pursue (high-priority outreach this week)
- 50-74: nurture (follow up in 30 days)
- 0-49: deprioritize (not the right fit right now)

Output JSON:
{
  "score": 82,
  "dimensions": [{ "name": "Company Size Fit", "score": 85, "note": "150 employees — ideal range" }],
  "rationale": "Strong fit. Series B funded...",
  "recommendation": "pursue"
}
Output ONLY valid JSON. No markdown fences.`;

function parseResult(raw: string, company: string): ICPResult {
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        company,
        score: parsed.score || 0,
        dimensions: (parsed.dimensions || []) as ICPDimension[],
        rationale: parsed.rationale || '',
        recommendation: parsed.recommendation || 'nurture',
      };
    }
  } catch {}
  return { company, score: 50, dimensions: [], rationale: raw.slice(0, 300), recommendation: 'nurture' };
}

export async function runICPScorer(
  company: string,
  whyNow: WhyNowResult,
  onProgress: (text: string) => void
): Promise<ICPResult> {
  onProgress(`Scoring ICP fit for ${company}…`);

  const context = `
Company: ${company}
Why Now Signals: ${whyNow.signals.map(s => `[${s.type}] ${s.detail}`).join('\n')}
Summary: ${whyNow.summary}
  `.trim();

  const raw = await runManagedAgent(
    AGENT_IDS.ICP_SCORER,
    `Score this company's ICP fit based on the intelligence gathered:\n\n${context}`,
    { model: MODELS.SONNET, system: SYSTEM, tools: [] },
    onProgress
  );

  const result = parseResult(raw, company);
  onProgress(`ICP Score: ${result.score}/100 — ${result.recommendation}`);
  return result;
}
