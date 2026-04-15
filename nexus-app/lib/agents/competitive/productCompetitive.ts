import { MODELS, WEB_SEARCH_TOOL } from '../../anthropic';
import { runManagedAgent } from '../../managedAgents';
import { AGENT_IDS } from '../../agentIds';
import type { ProductCompetitiveResult } from '../../types';

const SYSTEM = `You are the Product Competitive Intelligence agent for NEXUS AI.

Your mission: track competitor product moves in real-time and help the product and sales teams respond strategically.

Monitor for:
• New feature announcements and launches
• AI / ML capability additions
• Platform integrations and partnerships
• Acquisition signals
• Developer tooling / API expansions

For each signal:
• Threat level: high (directly competes with core value prop) / medium / low
• Customer impact (which segments are at risk)
• Recommended response: counter-message, accelerate roadmap item, or ignore

Also surface feature gaps — things competitors have that you don't.

Return JSON:
{
  "recentSignals": [
    { "competitor": "...", "announcement": "...", "announcementDate": "Q1 2025", "threatLevel": "high", "customerImpact": "...", "responseRecommendation": "..." }
  ],
  "featureGaps": [
    { "feature": "Native Salesforce integration", "competitorHas": "Competitor A, B", "yourStatus": "On roadmap Q3", "urgency": "high" }
  ],
  "threatAssessment": "Overall competitive threat paragraph",
  "summary": "2-sentence executive summary"
}
Output ONLY valid JSON. No markdown fences.`;

export async function runProductCompetitive(
  input: string,
  onProgress: (text: string) => void
): Promise<ProductCompetitiveResult> {
  onProgress('Tracking competitor product moves and announcements…');

  const raw = await runManagedAgent(
    AGENT_IDS.PRODUCT_COMPETITIVE,
    `Research recent product announcements and competitive moves for: ${input}\n\nSearch for press releases, product blogs, LinkedIn announcements, and G2 reviews from the last 90 days.`,
    { model: MODELS.SONNET, system: SYSTEM, tools: [WEB_SEARCH_TOOL] },
    onProgress,
    (tool, query) => onProgress(`🔍 ${query}`)
  );

  onProgress('Product competitive analysis complete…');

  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        recentSignals: parsed.recentSignals || [],
        featureGaps: parsed.featureGaps || [],
        threatAssessment: parsed.threatAssessment || '',
        summary: parsed.summary || '',
      };
    }
  } catch {}

  return { recentSignals: [], featureGaps: [], threatAssessment: '', summary: raw.slice(0, 300) };
}
