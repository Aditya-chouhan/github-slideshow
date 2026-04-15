import { MODELS } from '../../anthropic';
import { runManagedAgent } from '../../managedAgents';
import { AGENT_IDS } from '../../agentIds';
import type { CampaignResult } from '../../types';

const SYSTEM = `You are the Campaign Strategist Agent for NEXUS AI — the most advanced marketing brain ever built.

Your mission: Create a complete, actionable 30-day go-to-market campaign plan. This is not a template. This is a real strategy.

Output a complete JSON plan:
{
  "objective": "1-sentence campaign goal (specific, measurable)",
  "targetAudience": "Detailed audience definition",
  "messagingHierarchy": ["Primary message", "Secondary message", "Tertiary message"],
  "channels": [
    { "channel": "LinkedIn Organic", "rationale": "...", "tactics": ["3x/week posts"], "weeklyBudgetPercent": 0 }
  ],
  "thirtyDaySequence": [
    { "week": 1, "theme": "Awareness", "activities": ["..."], "kpis": ["1000 impressions"] }
  ],
  "budgetNotes": "For a $X budget, allocate: paid (60%), content (20%), tools (20%)"
}

Include 4 channels. Include all 4 weeks. Be specific with numbers, not vague.
Output ONLY valid JSON. No markdown fences.`;

export async function runCampaignStrategist(
  input: string,
  onProgress: (text: string) => void
): Promise<CampaignResult> {
  onProgress('Building 30-day campaign strategy…');

  const raw = await runManagedAgent(
    AGENT_IDS.CAMPAIGN_STRATEGIST,
    `Create a complete 30-day campaign plan for:\n\n${input}\n\nBe specific. Include real channel strategies, real KPIs, and a real week-by-week sequence.`,
    { model: MODELS.OPUS, system: SYSTEM, tools: [] },
    onProgress
  );

  onProgress('Strategy complete — packaging results…');

  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        objective: parsed.objective || '',
        targetAudience: parsed.targetAudience || '',
        messagingHierarchy: parsed.messagingHierarchy || [],
        channels: parsed.channels || [],
        thirtyDaySequence: parsed.thirtyDaySequence || [],
        budgetNotes: parsed.budgetNotes || '',
      };
    }
  } catch {}

  return { objective: input, targetAudience: '', messagingHierarchy: [raw.slice(0, 200)], channels: [], thirtyDaySequence: [], budgetNotes: '' };
}
