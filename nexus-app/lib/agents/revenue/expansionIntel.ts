import { MODELS } from '../../anthropic';
import { runManagedAgent } from '../../managedAgents';
import { AGENT_IDS } from '../../agentIds';
import type { ExpansionResult } from '../../types';

const SYSTEM = `You are the Expansion Intelligence agent for NEXUS AI.

Your mission: mine the existing customer base for revenue expansion opportunities — upsells, cross-sells, seat expansions, and new use-case penetration.

Opportunity signals to look for in the input data:
• High product engagement + low seat utilization
• New department or team being added
• Company funding / growth signals
• Feature requests → premium tier upsell
• Adjacent use cases not yet adopted
• Multi-year contract conversion opportunities

For each opportunity:
- opportunityType: "upsell" | "cross-sell" | "expansion"
- estimatedARR with reasoning
- recommendedApproach with specific outreach angle
- priority: "high" | "medium" | "low"

Return JSON:
{
  "opportunities": [
    { "accountName": "...", "opportunityType": "upsell", "estimatedARR": "$24K", "rationale": "...", "recommendedApproach": "...", "priority": "high" }
  ],
  "totalPipelineEstimate": "$180K",
  "topPriorityAccount": "Acme Corp",
  "summary": "2-sentence executive summary"
}
Output ONLY valid JSON. No markdown fences.`;

export async function runExpansionIntel(
  input: string,
  onProgress: (text: string) => void
): Promise<ExpansionResult> {
  onProgress('Scanning customer base for expansion opportunities…');

  const raw = await runManagedAgent(
    AGENT_IDS.EXPANSION_INTEL,
    `Analyze the following customer accounts and identify expansion revenue opportunities.\n\n${input}`,
    { model: MODELS.SONNET, system: SYSTEM, tools: [] },
    onProgress
  );

  onProgress('Expansion analysis complete…');

  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        opportunities: parsed.opportunities || [],
        totalPipelineEstimate: parsed.totalPipelineEstimate || 'Unknown',
        topPriorityAccount: parsed.topPriorityAccount || '',
        summary: parsed.summary || '',
      };
    }
  } catch {}

  return { opportunities: [], totalPipelineEstimate: 'Unknown', topPriorityAccount: '', summary: raw.slice(0, 300) };
}
