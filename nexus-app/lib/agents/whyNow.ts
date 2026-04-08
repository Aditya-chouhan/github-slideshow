import { tavilySearch, formatResults } from "../tavily";
import { reason, extractJSON } from "../claude";
import type { Signal } from "../types";

interface WhyNowResult {
  companyOverview: string;
  signals: Signal[];
  whyNowSummary: string;
  bestTimingAngle: string;
  searchWaves: 1 | 2;
}

export async function runWhyNowEngine(
  company: string,
  website: string | undefined,
  yourProduct: string,
  onProgress: (msg: string) => void
): Promise<WhyNowResult> {
  onProgress(`Why Now Engine analyzing ${company} — Wave 1 (4 parallel searches)...`);

  const [fundingResults, hiringResults, newsResults, overviewResults] = await Promise.all([
    tavilySearch(`${company} funding announcement investment rounds 2024 2025`, {
      maxResults: 5,
      searchDepth: "advanced",
      days: 365,
    }),
    tavilySearch(`${company} hiring jobs openings careers expansion`, {
      maxResults: 4,
      searchDepth: "advanced",
      days: 180,
    }),
    tavilySearch(`${company} news announcement product launch press release 2024 2025`, {
      maxResults: 5,
      searchDepth: "advanced",
      days: 365,
    }),
    tavilySearch(`${company} company overview business strategy market`, {
      maxResults: 3,
      searchDepth: "advanced",
    }),
  ]);

  const allSignals = [
    ...fundingResults.results.slice(0, 2),
    ...hiringResults.results.slice(0, 2),
    ...newsResults.results.slice(0, 2),
  ];

  const hasHighRelevance = allSignals.some(
    (r) => r.content.toLowerCase().includes("growth") || r.content.toLowerCase().includes("expansion")
  );

  let finalSignals = allSignals;
  let searchWaves: 1 | 2 = 1;

  if (!hasHighRelevance) {
    onProgress(`Low signal quality — running Wave 2 (3 additional searches)...`);
    const [jobsResults, techResults, industryResults] = await Promise.all([
      tavilySearch(`"${company}" job postings openings LinkedIn`, { maxResults: 3, searchDepth: "advanced" }),
      tavilySearch(`${company} technology stack infrastructure`, { maxResults: 3, searchDepth: "advanced" }),
      tavilySearch(`${company} industry analysis market report`, { maxResults: 3, searchDepth: "advanced" }),
    ]);
    finalSignals = Array.from(
      new Map([...finalSignals, ...jobsResults.results, ...techResults.results, ...industryResults.results].map((s) => [s.url, s])).values()
    ).slice(0, 8);
    searchWaves = 2;
  }

  onProgress(`Synthesizing ${finalSignals.length} signals into intelligence brief...`);

  const context = `
${finalSignals.map((r, i) => `[${i + 1}] ${r.title}\n${r.content.slice(0, 300)}`).join("\n\n")}
`;

  const systemPrompt = `You are the Why Now Engine for NEXUS AI.
Analyze search results and identify the SPECIFIC MOMENT in this company's lifecycle when they would be most receptive to ${yourProduct}.
Be ruthlessly honest about signal quality.`;

  const prompt = `Company: ${company}${website ? `\nWebsite: ${website}` : ""}
Our product: ${yourProduct}

Search results:
${context}

Return JSON:
{
  "companyOverview": "1-2 sentence company description",
  "signals": [
    {"type": "funding|hiring|news|intent", "title": "...", "summary": "...", "relevance": "high|medium|low", "source": "..."}
  ],
  "whyNowSummary": "Why THIS company at THIS moment",
  "bestTimingAngle": "The conversation hook"
}`;

  const raw = await reason(systemPrompt, prompt, 1500);
  const result = extractJSON<Omit<WhyNowResult, "searchWaves">>(raw);

  return { ...result, searchWaves };
}