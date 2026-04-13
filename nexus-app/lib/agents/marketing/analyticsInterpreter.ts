import { anthropic, MODELS } from '../../anthropic';
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
  "whatIsWorking": [
    { "finding": "...", "evidence": "...", "impact": "high" }
  ],
  "whatIsFailing": [
    { "finding": "...", "evidence": "...", "impact": "high" }
  ],
  "nextActions": [
    { "action": "...", "expectedImpact": "...", "priority": "high", "effort": "low" }
  ]
}

Include 2-4 items in each list. Make nextActions ultra-specific.`;

export async function runAnalyticsInterpreter(
  input: string,
  onProgress: (text: string) => void
): Promise<AnalyticsResult> {
  onProgress('Analysing metrics and benchmarking performance…');

  const response = await anthropic.messages.create({
    model: MODELS.OPUS,
    max_tokens: 3000,
    system: SYSTEM,
    messages: [{ role: 'user', content: `Analyse these marketing metrics and provide actionable insights:\n\n${input}` }],
  });

  onProgress('Analysis complete — identifying highest-ROI actions…');
  const text = response.content.find(b => b.type === 'text');
  const raw = text && text.type === 'text' ? text.text : '';

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
