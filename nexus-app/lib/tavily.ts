const TAVILY_API_URL = "https://api.tavily.com/search";

export interface TavilyResult {
  title: string;
  url: string;
  content: string;
  score: number;
  published_date?: string;
}

export interface TavilyResponse {
  results: TavilyResult[];
  query: string;
}

export async function tavilySearch(
  query: string,
  options: {
    maxResults?: number;
    searchDepth?: "basic" | "advanced";
    includeAnswer?: boolean;
    days?: number;
  } = {}
): Promise<TavilyResponse> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) throw new Error("TAVILY_API_KEY is not set");

  const body = {
    api_key: apiKey,
    query,
    max_results: options.maxResults ?? 5,
    search_depth: options.searchDepth ?? "advanced",
    include_answer: options.includeAnswer ?? false,
    ...(options.days ? { days: options.days } : {}),
  };

  const response = await fetch(TAVILY_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Tavily API error: ${response.status} — ${err}`);
  }

  return response.json() as Promise<TavilyResponse>;
}

export function formatResults(results: TavilyResult[]): string {
  if (results.length === 0) return "No results found.";
  return results
    .map(
      (r, i) =>
        `[${i + 1}] ${r.title}\nURL: ${r.url}\n${r.published_date ? `Date: ${r.published_date}\n` : ""}${r.content}`
    )
    .join("\n\n---\n\n");
}