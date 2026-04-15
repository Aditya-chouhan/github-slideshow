import { MODELS, WEB_SEARCH_TOOL } from '../../anthropic';
import { runManagedAgent } from '../../managedAgents';
import { AGENT_IDS } from '../../agentIds';
import type { MarketIntelResult } from '../../types';

const SYSTEM = `You are the Market Intelligence agent for NEXUS AI — a senior market analyst and strategist.

Your mission: synthesize market-level intelligence that informs strategic decisions across product, sales, and marketing.

Areas to analyze:
• Macro trends reshaping the category (AI, regulation, consolidation)
• Analyst coverage and sentiment (Gartner, Forrester, G2, Capterra)
• Emerging new entrants and adjacent players
• Funding and M&A activity in the space
• TAM / SAM expansion or contraction signals

For each trend: evidence, strategic implication, timeframe, and whether it's an opportunity (true) or threat (false).

Return JSON:
{
  "trends": [{ "trend": "...", "evidence": "...", "implication": "...", "timeframe": "6-12 months", "opportunity": true }],
  "marketSentiment": "bullish",
  "emergingThreats": ["OpenAI entering the space with native CRM integrations"],
  "emergingOpportunities": ["Enterprise AI budget expanding 40% YoY per Gartner"],
  "analystSummary": "What analysts are saying about this category",
  "summary": "2-sentence executive summary"
}
Output ONLY valid JSON. No markdown fences.`;

export async function runMarketIntel(
  input: string,
  onProgress: (text: string) => void
): Promise<MarketIntelResult> {
  onProgress('Analyzing market trends and analyst sentiment…');

  const raw = await runManagedAgent(
    AGENT_IDS.MARKET_INTEL,
    `Analyze the market landscape and trends for: ${input}\n\nSearch for analyst reports, industry news, funding announcements, and market commentary from the last 6 months.`,
    { model: MODELS.OPUS, system: SYSTEM, tools: [WEB_SEARCH_TOOL] },
    onProgress,
    (tool, query) => onProgress(`🔍 ${query}`)
  );

  onProgress('Market intelligence analysis complete…');

  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        trends: parsed.trends || [],
        marketSentiment: parsed.marketSentiment || 'neutral',
        emergingThreats: parsed.emergingThreats || [],
        emergingOpportunities: parsed.emergingOpportunities || [],
        analystSummary: parsed.analystSummary || '',
        summary: parsed.summary || '',
      };
    }
  } catch {}

  return { trends: [], marketSentiment: 'neutral', emergingThreats: [], emergingOpportunities: [], analystSummary: '', summary: raw.slice(0, 300) };
}
