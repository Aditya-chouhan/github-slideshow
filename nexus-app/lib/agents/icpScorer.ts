import { reason, extractJSON } from "../claude";
import type { AccountIntelligence, Signal } from "../types";

interface ICPResult {
  fit: "strong" | "moderate" | "weak";
  score: number;
  reasons: string[];
  redFlags: string[];
  recommendation: string;
}

export async function runICPScorer(
  input: {
    company: string;
    companyOverview: string;
    signals: Signal[];
    contact: { name: string; role: string; background: string; likelyPriorities: string[] };
    yourProduct: string;
    yourCompany: string;
  },
  onProgress: (msg: string) => void
): Promise<{ icpFit: AccountIntelligence["icpFit"]; icpReason: string }> {
  onProgress(`ICP Scorer evaluating ${input.company} fit for ${input.yourProduct}...`);

  const systemPrompt = `You are the ICP Scorer for NEXUS AI.
Give an honest, direct verdict on whether this account is worth pursuing.
You are ruthlessly honest. Don't say moderate when you mean weak to be nice.
Strong = you'd bet money they convert. Moderate = worth a shot. Weak = stop and use time elsewhere.`;

  const prompt = `
Company: ${input.company}
What we sell: ${input.yourProduct} (from ${input.yourCompany})

Company overview: ${input.companyOverview}

Signals found:
${input.signals.map(s => `- [${s.relevance}] ${s.title}: ${s.summary}`).join("\n")}

Contact: ${input.contact.name} (${input.contact.role})
Background: ${input.contact.background}
Priorities: ${input.contact.likelyPriorities.join(", ")}

Score this account's ICP fit. Return JSON:
{
  "fit": "strong|moderate|weak",
  "score": 0-100,
  "reasons": ["reason 1", "reason 2", "reason 3"],
  "redFlags": ["red flag 1 if any"],
  "recommendation": "1-sentence recommendation"
}`;

  const raw = await reason(systemPrompt, prompt, 800);
  const result = extractJSON<ICPResult>(raw);

  onProgress(`ICP Score: ${result.score}/100 (${result.fit.toUpperCase()} fit)`);

  return {
    icpFit: result.fit,
    icpReason: `Score ${result.score}/100: ${result.reasons.join(" | ")}${result.redFlags.length ? ` ⚠ ${result.redFlags.join(", ")}` : ""}`,
  };
}