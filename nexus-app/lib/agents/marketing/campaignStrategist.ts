import { anthropic, MODELS } from '../../anthropic';
import type { CampaignResult } from '../../types';

const SYSTEM = `You are the Campaign Strategist Agent for NEXUS AI — the most advanced marketing brain ever built.

Your mission: Create a complete, actionable 30-day go-to-market campaign plan. This is not a template. This is a real strategy.

Output a complete JSON plan:
{
  "objective": "1-sentence campaign goal (specific, measurable)",
  "targetAudience": "Detailed audience definition: who they are, what they care about, where they live online",
  "messagingHierarchy": [
    "Primary message (hero message)",
    "Secondary message (supporting proof)",
    "Tertiary message (emotional hook)"
  ],
  "channels": [
    {
      "channel": "LinkedIn Organic",
      "rationale": "Why this channel for this audience",
      "tactics": ["3x/week posts", "Comment on ICP accounts", "LinkedIn polls"],
      "weeklyBudgetPercent": 0
    }
  ],
  "thirtyDaySequence": [
    {
      "week": 1,
      "theme": "Awareness — introduce the problem",
      "activities": ["Publish 3 LinkedIn posts on the problem", "Launch paid ads"],
      "kpis": ["1000 impressions", "20 profile visits"]
    }
  ],
  "budgetNotes": "For a $X budget, allocate: paid (60%), content production (20%), tools (20%)"
}

Include 4 channels. Include all 4 weeks. Be specific with numbers, not vague.`;

export async function runCampaignStrategist(
  input: string,
  onProgress: (text: string) => void
): Promise<CampaignResult> {
  onProgress('Building 30-day campaign strategy with extended reasoning…');

  const response = await anthropic.messages.create({
    model: MODELS.OPUS,
    max_tokens: 8192,
    system: SYSTEM,
    messages: [{
      role: 'user',
      content: `Create a complete 30-day campaign plan for:\n\n${input}\n\nBe specific. Include real channel strategies, real KPIs, and a real week-by-week sequence.`,
    }],
  });

  onProgress('Strategy complete — packaging results…');
  const text = response.content.find(b => b.type === 'text');
  const raw = text && text.type === 'text' ? text.text : '';

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
