import { anthropic, MODELS, tavilySearch, WEB_SEARCH_TOOL, runAgentLoop } from '../anthropic';
import type { WhyNowResult, Signal } from '../types';

const SYSTEM = `You are the Why Now Intelligence Agent for NEXUS AI — the world's most advanced B2B sales intelligence platform.

Your mission: Find the top 3 HIGH-URGENCY signals that make a company a priority prospect RIGHT NOW.

Search for:
1. Recent funding rounds (last 6 months) — Series A/B/C, IPO filings, new investors
2. Executive leadership changes — new CRO, VP Sales, CMO, CEO in the last 90 days
3. Product launches or major announcements — new product lines, market expansions
4. Hiring surges — sudden spike in open roles indicating growth or new initiatives

For EACH signal found, provide:
- Signal type (Funding / Leadership / Product / Hiring)
- Specific details (exact amount, exact name, exact product)
- Source URL
- Why this creates buying urgency (1 sentence)
- Urgency level: high / medium / low

Output a clean JSON object with this structure:
{
  "signals": [
    {
      "type": "Funding",
      "detail": "Raised $50M Series B led by Sequoia on March 2024",
      "sourceUrl": "https://...",
      "urgency": "high",
      "buyingUrgency": "Companies scaling post-funding immediately invest in tools to accelerate revenue"
    }
  ],
  "summary": "2-sentence executive summary of why this company is a priority now"
}

Be factual. Never fabricate signals. If you cannot find specific recent signals, say so honestly.`;

function parseResult(raw: string, company: string): WhyNowResult {
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        company,
        signals: (parsed.signals || []).map((s: Signal & { buyingUrgency?: string }) => ({
          type: s.type,
          detail: s.detail,
          sourceUrl: s.sourceUrl,
          urgency: s.urgency || 'medium',
        })),
        summary: parsed.summary || raw.slice(0, 200),
      };
    }
  } catch {}
  return { company, signals: [], summary: raw.slice(0, 300) };
}

export async function runWhyNow(
  company: string,
  onProgress: (text: string) => void
): Promise<WhyNowResult> {
  onProgress(`Scanning for recent signals on ${company}…`);

  const raw = await runAgentLoop(
    MODELS.SONNET,
    SYSTEM,
    `Research "${company}" and find the top 3 "why now" signals that make them a high-priority prospect TODAY. Run multiple searches — funding, leadership, product launches, and hiring.`,
    [WEB_SEARCH_TOOL],
    async (_name, input) => {
      onProgress(`Searching: ${input.query}`);
      return tavilySearch(input.query, 5);
    },
    onProgress
  );

  const result = parseResult(raw, company);
  onProgress(`Found ${result.signals.length} signals`);
  return result;
}
