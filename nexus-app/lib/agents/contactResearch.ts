import { MODELS, WEB_SEARCH_TOOL } from '../anthropic';
import { runManagedAgent } from '../managedAgents';
import { AGENT_IDS } from '../agentIds';
import type { ContactResult, Contact, WhyNowResult } from '../types';

const SYSTEM = `You are the Contact Intelligence Agent for NEXUS AI.

Your mission: Identify the 3 most relevant decision-makers at a target company to contact for a B2B sales outreach.

For EACH contact, find:
- Full name
- Exact title
- LinkedIn URL (if findable)
- Email pattern hint (e.g., "first.last@company.com based on company pattern")
- 2-sentence professional background relevant to why they'd care about being contacted

Target roles in priority order:
1. Chief Revenue Officer / VP Sales (owns the budget)
2. Chief Marketing Officer / VP Marketing (uses the product)
3. CEO / Founder (at companies under 200 employees)
4. Head of Growth / Director of Sales Operations

Output clean JSON:
{
  "contacts": [
    { "name": "Sarah Chen", "title": "CRO", "linkedinUrl": "...", "emailHint": "first.last@company.com", "background": "..." }
  ],
  "summary": "1 sentence on who to prioritize and why"
}

If you cannot verify a person exists, do not include them. Quality over quantity.
Output ONLY valid JSON. No markdown fences.`;

function parseResult(raw: string, company: string): ContactResult {
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        company,
        contacts: (parsed.contacts || []).slice(0, 3) as Contact[],
        summary: parsed.summary || '',
      };
    }
  } catch {}
  return { company, contacts: [], summary: raw.slice(0, 200) };
}

export async function runContactResearch(
  company: string,
  whyNow: WhyNowResult,
  onProgress: (text: string) => void
): Promise<ContactResult> {
  onProgress(`Finding decision-makers at ${company}…`);

  const context = whyNow.signals.length
    ? `Recent signals: ${whyNow.signals.map(s => s.detail).join('; ')}`
    : '';

  const raw = await runManagedAgent(
    AGENT_IDS.CONTACT_INTEL,
    `Find the 3 best decision-makers to contact at "${company}". ${context}\n\nSearch LinkedIn, company website, Crunchbase, and news sources. Focus on people who would own the buying decision for a B2B SaaS tool.`,
    { model: MODELS.SONNET, system: SYSTEM, tools: [WEB_SEARCH_TOOL] },
    onProgress,
    (tool, query) => onProgress(`🔍 ${query}`)
  );

  const result = parseResult(raw, company);
  onProgress(`Identified ${result.contacts.length} key contacts`);
  return result;
}
