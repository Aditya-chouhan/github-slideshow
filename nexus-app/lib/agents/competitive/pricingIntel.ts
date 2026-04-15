import { MODELS, WEB_SEARCH_TOOL } from '../../anthropic';
import { runManagedAgent } from '../../managedAgents';
import { AGENT_IDS } from '../../agentIds';
import type { CompetitivePricingResult } from '../../types';

const SYSTEM = `You are the Pricing Intelligence agent for NEXUS AI.

Your mission: map the competitive pricing landscape and identify how to position, defend, or attack on price.

Research for each competitor:
• Pricing model (per-seat, usage-based, flat, freemium)
• Published tier names and price points
• Recent pricing changes
• Where they win on price vs where you win
• Discount signals (end-of-quarter, startup programs, etc.)

Return JSON:
{
  "signals": [
    { "competitor": "Competitor A", "pricingModel": "per-seat", "keyTiers": ["Starter: $49/mo", "Pro: $149/mo"], "recentChanges": "Raised prices 15% in Jan 2025", "strengthsVsYou": ["Lower entry price"], "weaknessesVsYou": ["No usage-based option"] }
  ],
  "yourPositioning": "How you should position vs the competitive pricing landscape",
  "pricingRecommendation": "Specific recommendation: where to compete on value, where on price",
  "summary": "2-sentence executive summary"
}
Output ONLY valid JSON. No markdown fences.`;

export async function runPricingIntel(
  input: string,
  onProgress: (text: string) => void
): Promise<CompetitivePricingResult> {
  onProgress('Researching competitor pricing and packaging…');

  const raw = await runManagedAgent(
    AGENT_IDS.PRICING_INTEL,
    `Research competitive pricing for: ${input}\n\nSearch for current pricing pages, G2/Capterra reviews mentioning price, and any recent pricing changes.`,
    { model: MODELS.SONNET, system: SYSTEM, tools: [WEB_SEARCH_TOOL] },
    onProgress,
    (tool, query) => onProgress(`🔍 ${query}`)
  );

  onProgress('Pricing analysis complete…');

  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        signals: parsed.signals || [],
        yourPositioning: parsed.yourPositioning || '',
        pricingRecommendation: parsed.pricingRecommendation || '',
        summary: parsed.summary || '',
      };
    }
  } catch {}

  return { signals: [], yourPositioning: '', pricingRecommendation: '', summary: raw.slice(0, 300) };
}
