import { tavilySearch, formatResults } from "../tavily";
import { reason, extractJSON } from "../claude";
import type { ContactIntel } from "../types";

export async function runContactResearch(
  contactName: string,
  contactRole: string,
  company: string,
  contactLinkedIn: string | undefined,
  yourProduct: string,
  onProgress: (msg: string) => void
): Promise<ContactIntel> {
  onProgress(`Researching ${contactName} — scanning LinkedIn activity, articles, talks, and career history...`);

  const [profileResults, activityResults, companyRoleResults] = await Promise.all([
    tavilySearch(
      `"${contactName}" "${company}" ${contactRole} LinkedIn background experience`,
      { maxResults: 4, searchDepth: "advanced" }
    ),
    tavilySearch(
      `"${contactName}" site:linkedin.com OR podcast OR interview OR article OR talk OR keynote`,
      { maxResults: 4, searchDepth: "advanced", days: 365 }
    ),
    tavilySearch(
      `"${contactName}" "${company}" announcement OR initiative OR project OR strategy 2024 OR 2025`,
      { maxResults: 3, searchDepth: "advanced", days: 365 }
    ),
  ]);

  onProgress(`Research complete for ${contactName} — synthesising intelligence...`);

  const context = `
PROFILE & BACKGROUND:
${formatResults(profileResults.results)}

RECENT ACTIVITY (posts, interviews, articles):
${formatResults(activityResults.results)}

COMPANY ROLE CONTEXT:
${formatResults(companyRoleResults.results)}
`;

  const systemPrompt = `You are the Contact Research Agent for NEXUS AI.
Build a precise psychological and professional profile so outreach can be deeply personalized.
Look for career trajectory, recent statements, specific projects, communication style, and the one angle that makes THEM specifically want to talk.`;

  const prompt = `Contact: ${contactName}
Role: ${contactRole}
Company: ${company}
${contactLinkedIn ? `LinkedIn: ${contactLinkedIn}` : ""}
What we sell: ${yourProduct}

Research data:
${context}

Return JSON:
{
  "name": "${contactName}",
  "role": "${contactRole}",
  "background": "2-3 sentences on career background",
  "recentActivity": "What they've been publicly active about",
  "likelyPriorities": ["priority 1", "priority 2", "priority 3"],
  "bestAngle": "The single most specific angle to use in outreach"
}`;

  const raw = await reason(systemPrompt, prompt, 1200);
  const result = extractJSON<ContactIntel>(raw);

  onProgress(`Contact intelligence built for ${contactName}: ${result.likelyPriorities.length} priorities identified.`);

  return result;
}