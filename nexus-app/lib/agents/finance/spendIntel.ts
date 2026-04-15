import { MODELS } from '../../anthropic';
import { runManagedAgent } from '../../managedAgents';
import { AGENT_IDS } from '../../agentIds';
import type { SpendResult } from '../../types';

const SYSTEM = `You are the Spend Intelligence agent for NEXUS AI — an elite SaaS spend optimizer and CFO advisor.

Your mission: identify every dollar of waste in the tech stack and operational spend, benchmark against SaaS industry norms, and build a prioritized savings roadmap.

Spend categories to analyze:
• SaaS tools (overlapping, underutilized, or overpriced)
• Cloud infrastructure (over-provisioned, idle)
• Marketing spend (CAC by channel efficiency)
• Sales tooling ROI
• Professional services

Industry benchmarks for a SaaS company (as % of ARR):
• R&D: 15-25%
• S&M: 30-50%
• G&A: 10-15%
• Infrastructure: 5-10%

For each category: current spend, benchmark, waste estimate, optimization opportunity, priority.

Return JSON:
{
  "categories": [
    { "category": "SaaS Tools", "currentMonthlySpend": "$18,500", "benchmarkPercent": "3% of ARR", "wasteEstimate": "$4,200/mo", "optimizationOpportunity": "Consolidate 3 overlapping tools", "priority": "high" }
  ],
  "totalMonthlySpend": "$85,000",
  "totalWasteEstimate": "$22,000/mo",
  "annualizedSavingsPotential": "$264,000",
  "priorityActions": ["Cancel Salesforce Einstein ($3K/mo) — not being used", "..."],
  "summary": "2-sentence executive summary"
}
Output ONLY valid JSON. No markdown fences.`;

export async function runSpendIntel(
  input: string,
  onProgress: (text: string) => void
): Promise<SpendResult> {
  onProgress('Analyzing spend categories and identifying waste…');

  const raw = await runManagedAgent(
    AGENT_IDS.SPEND_INTEL,
    `Analyze the following spending data and identify optimization opportunities:\n\n${input}`,
    { model: MODELS.SONNET, system: SYSTEM, tools: [] },
    onProgress
  );

  onProgress('Spend analysis complete…');

  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        categories: parsed.categories || [],
        totalMonthlySpend: parsed.totalMonthlySpend || 'Unknown',
        totalWasteEstimate: parsed.totalWasteEstimate || 'Unknown',
        annualizedSavingsPotential: parsed.annualizedSavingsPotential || 'Unknown',
        priorityActions: parsed.priorityActions || [],
        summary: parsed.summary || '',
      };
    }
  } catch {}

  return { categories: [], totalMonthlySpend: 'Unknown', totalWasteEstimate: 'Unknown', annualizedSavingsPotential: 'Unknown', priorityActions: [], summary: raw.slice(0, 300) };
}
