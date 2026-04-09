import { generate, reason, extractJSON } from "../claude";
import type { AccountIntelligence, OutreachVariants } from "../types";

const QUALITY_THRESHOLD = 78;
const MAX_ATTEMPTS = 3;

function buildGenerationPrompt(
  intel: AccountIntelligence,
  yourProduct: string,
  yourName: string,
  yourCompany: string,
  previousFeedback?: string
): { system: string; user: string } {
  const system = `You are the Outreach Writer for NEXUS AI — an elite B2B sales copywriting agent.

WHAT WORKS:
- 1 specific reason why you're reaching out NOW (reference the actual signal)
- Reference something real about THEM found in research
- Short: under 100 words for email body, under 60 words for LinkedIn DM
- One clear, low-friction CTA: a question that's easy to answer
- Lead with their world first — first sentence is NEVER about you

WHAT KILLS RESPONSE RATES:
- "I hope this finds you well"
- Starting with "I" or "My name is"
- Subject lines with "quick question"
- Vague CTAs like "open to a call?"
- Pitching the product in the first message
- ANY language that feels like a template
${previousFeedback ? `\nIMPROVEMENT REQUIRED:\n${previousFeedback}\nFix ALL of these issues.` : ""}`;

  const highSignals = intel.signals.filter((s) => s.relevance === "high");
  const bestSignal = highSignals[0] ?? intel.signals[0];

  const user = `ACCOUNT INTELLIGENCE:
Company: ${intel.company}
Overview: ${intel.companyOverview}
ICP Fit: ${intel.icpFit}

WHY NOW:
${bestSignal ? `[${bestSignal.relevance.toUpperCase()}] ${bestSignal.title}: ${bestSignal.summary}` : "No strong signal — use general industry angle"}
Timing: ${intel.whyNowSummary}

CONTACT:
${intel.contact.name} — ${intel.contact.role}
Background: ${intel.contact.background}
Recent: ${intel.contact.recentActivity}
Priorities: ${intel.contact.likelyPriorities.join(", ")}
Best angle: ${intel.contact.bestAngle}

SENDER: ${yourName} from ${yourCompany}, selling: ${yourProduct}

Return JSON:
{
  "coldEmail": { "subject": "...", "body": "...", "reasoning": "..." },
  "linkedInDM": { "message": "...", "reasoning": "..." },
  "linkedInConnect": { "note": "...(max 300 chars)", "reasoning": "..." }
}`;

  return { system, user };
}

interface EvaluationResult {
  score: number;
  breakdown: {
    personalizationSpecificity: number;
    timingAngle: number;
    ctaQuality: number;
    lengthDiscipline: number;
    leadWithProspect: number;
  };
  passed: boolean;
  feedback: string;
}

async function evaluateDraft(
  draft: OutreachVariants,
  intel: AccountIntelligence,
  yourProduct: string
): Promise<EvaluationResult> {
  const system = `You are the Quality Evaluator for NEXUS AI. Score outreach drafts ruthlessly and give specific feedback.`;

  const user = `Company: ${intel.company}
Why Now: ${intel.signals[0]?.title ?? "none"} — ${intel.signals[0]?.summary ?? ""}
Contact: ${intel.contact.name} (${intel.contact.role})
Best angle: ${intel.contact.bestAngle}
Product: ${yourProduct}

DRAFT:
Subject: "${draft.coldEmail.subject}"
Email: "${draft.coldEmail.body}"
DM: "${draft.linkedInDM.message}"
Connect: "${draft.linkedInConnect.note}" (${draft.linkedInConnect.note.length} chars)

Score and return JSON:
{
  "breakdown": {
    "personalizationSpecificity": 0-30,
    "timingAngle": 0-30,
    "ctaQuality": 0-20,
    "lengthDiscipline": 0-10,
    "leadWithProspect": 0-10
  },
  "feedback": "Specific fix instructions — quote problematic text and say what to change."
}`;

  const raw = await reason(system, user, 800);
  const parsed = extractJSON<{ breakdown: EvaluationResult["breakdown"]; feedback: string }>(raw);
  const score = Object.values(parsed.breakdown).reduce((a, b) => a + b, 0);
  return { score, breakdown: parsed.breakdown, passed: score >= QUALITY_THRESHOLD, feedback: parsed.feedback };
}

export async function runOutreachWriter(
  intel: AccountIntelligence,
  yourProduct: string,
  yourName: string,
  yourCompany: string,
  onProgress: (msg: string) => void
): Promise<OutreachVariants> {
  onProgress(`Outreach Writer starting — quality threshold: ${QUALITY_THRESHOLD}/100, max ${MAX_ATTEMPTS} iterations...`);

  let bestDraft: OutreachVariants | null = null;
  let bestScore = 0;
  let lastFeedback: string | undefined;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    onProgress(attempt === 1
      ? `Attempt ${attempt}/${MAX_ATTEMPTS}: Generating personalised outreach for ${intel.contact.name}...`
      : `Attempt ${attempt}/${MAX_ATTEMPTS}: Rewriting based on evaluator feedback...`);

    const { system, user } = buildGenerationPrompt(intel, yourProduct, yourName, yourCompany, lastFeedback);
    const raw = await generate(system, user, 2000);
    const draft = extractJSON<OutreachVariants>(raw);

    onProgress(`Evaluating draft ${attempt} — checking personalization, timing, CTA...`);
    const evaluation = await evaluateDraft(draft, intel, yourProduct);

    onProgress(`Draft ${attempt} scored ${evaluation.score}/100 (threshold: ${QUALITY_THRESHOLD})`);

    if (evaluation.score > bestScore) {
      bestScore = evaluation.score;
      bestDraft = { ...draft, _meta: { qualityScore: evaluation.score, attempts: attempt, evaluationFeedback: evaluation.feedback } };
    }

    if (evaluation.passed) {
      onProgress(`✓ Quality gate PASSED (${evaluation.score}/100) on attempt ${attempt}.`);
      return bestDraft!;
    }

    lastFeedback = evaluation.feedback;
    if (attempt < MAX_ATTEMPTS) onProgress(`Quality gate not met. Rewriting with specific improvements...`);
  }

  onProgress(`✓ Outreach complete after ${MAX_ATTEMPTS} attempts. Best score: ${bestScore}/100.`);
  return bestDraft!;
}