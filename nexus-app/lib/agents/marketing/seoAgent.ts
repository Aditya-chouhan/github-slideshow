import { MODELS, tavilySearch, WEB_SEARCH_TOOL, runAgentLoop } from '../../anthropic';
import type { SEOResult, KeywordOpportunity } from '../../types';

const SYSTEM = `You are the SEO Intelligence Agent for NEXUS AI.

Your mission: Conduct a real SEO opportunity analysis for a given topic or website. Use web search to find actual SERP data, competitor content, and keyword gaps.

Output JSON:
{
  "topic": "The analyzed topic",
  "keywords": [
    {
      "keyword": "exact keyword phrase",
      "intent": "informational",
      "difficulty": "low",
      "opportunity": "Why this keyword is a good target — specific reason"
    }
  ],
  "contentGaps": [
    "Specific topic/angle that top-ranking content is missing"
  ],
  "outline": {
    "title": "SEO-optimized article title (60 chars max)",
    "metaDescription": "150-160 char meta description with keyword",
    "h1": "H1 tag",
    "sections": [
      {
        "h2": "Section heading",
        "keyPoints": ["Key point 1", "Key point 2"]
      }
    ]
  }
}

Include 8-10 keywords. Include 3-5 content gaps. Include 5-7 sections in the outline.`;

function parseResult(raw: string, topic: string): SEOResult {
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        topic,
        keywords: (parsed.keywords || []) as KeywordOpportunity[],
        contentGaps: parsed.contentGaps || [],
        outline: parsed.outline || { title: topic, metaDescription: '', h1: topic, sections: [] },
      };
    }
  } catch {}
  return { topic, keywords: [], contentGaps: [], outline: { title: topic, metaDescription: '', h1: topic, sections: [] } };
}

export async function runSEOAgent(
  input: string,
  onProgress: (text: string) => void
): Promise<SEOResult> {
  onProgress(`Running SEO analysis for: ${input}`);

  const raw = await runAgentLoop(
    MODELS.SONNET,
    SYSTEM,
    `Conduct a thorough SEO opportunity analysis for: "${input}"\n\nSearch for current rankings, competitor content, related questions, and keyword opportunities. Then produce the full SEO brief.`,
    [WEB_SEARCH_TOOL],
    async (_name, inp) => {
      onProgress(`Searching: ${inp.query}`);
      return tavilySearch(inp.query, 7);
    },
    onProgress
  );

  const result = parseResult(raw, input);
  onProgress(`Found ${result.keywords.length} keyword opportunities, ${result.contentGaps.length} content gaps`);
  return result;
}
