import { anthropic, MODELS } from '../anthropic';
import type { OutreachResult, WhyNowResult, ContactResult, ICPResult } from '../types';

const WRITER_SYSTEM = `You are the Outreach Writer Agent for NEXUS AI — powered by Claude claude-opus-4-6.

Your mission: Write B2B sales outreach that gets replies. Not templates. Not generic AI slop. Human-feeling, specific, and compelling.

Rules:
- Cold email: 80-120 words max. One specific "why now" trigger. One clear value prop. One soft CTA.
- LinkedIn DM: 40-60 words. Conversational. Reference something specific about them.
- Follow-up email: 50-70 words. New angle. Light touch.
- NEVER use: "I hope this finds you well", "synergies", "leverage", "touch base", "circle back"
- ALWAYS reference: something specific from their recent signals (funding, new hire, product launch)
- Subject lines: under 8 words, no clickbait, curiosity-driven

Output JSON:
{
  "coldEmail": {
    "subject": "Quick question about [Company]'s growth",
    "body": "Hi [Name],\n\nSaw [Company] just raised [amount] — congrats...\n\n..."
  },
  "linkedinDM": "Hi [Name], noticed [Company] just [signal]...",
  "followUpEmail": {
    "subject": "One more thought",
    "body": "Hi [Name],\n\nFollowing up with a different angle..."
  }
}`;

const EVALUATOR_SYSTEM = `You are a world-class B2B sales coach reviewing outreach copy.

Score the outreach 0-100 on these criteria:
- Specificity: Does it reference actual company signals? (30 points)
- Brevity: Cold email under 120 words? (20 points)
- No clichés: Zero generic phrases? (20 points)
- Clear value: Does it state what's in it for them in one sentence? (20 points)
- Natural tone: Does it sound human, not AI? (10 points)

Respond ONLY with JSON: { "score": 85, "feedback": "Missing specific dollar amount from funding round" }`;

async function evaluate(copy: string): Promise<{ score: number; feedback: string }> {
  const response = await anthropic.messages.create({
    model: MODELS.SONNET,
    max_tokens: 256,
    system: EVALUATOR_SYSTEM,
    messages: [{ role: 'user', content: `Evaluate this outreach:\n\n${copy}` }],
  });
  const text = response.content.find(b => b.type === 'text');
  const raw = text && text.type === 'text' ? text.text : '{}';
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
  } catch {}
  return { score: 70, feedback: '' };
}

function buildContext(
  company: string,
  whyNow: WhyNowResult,
  contacts: ContactResult,
  icp: ICPResult
): string {
  const primaryContact = contacts.contacts[0];
  return `
Company: ${company}
ICP Score: ${icp.score}/100 — ${icp.recommendation}

Top Signal: ${whyNow.signals[0]?.detail || 'No specific signal found'}
All Signals: ${whyNow.signals.map(s => `[${s.type}] ${s.detail}`).join('\n')}

Primary Contact: ${primaryContact ? `${primaryContact.name}, ${primaryContact.title}` : 'Unknown decision-maker'}
Contact Background: ${primaryContact?.background || 'N/A'}

Company Summary: ${whyNow.summary}
ICP Rationale: ${icp.rationale}
  `.trim();
}

export async function runOutreachWriter(
  company: string,
  whyNow: WhyNowResult,
  contacts: ContactResult,
  icp: ICPResult,
  onProgress: (text: string) => void
): Promise<OutreachResult> {
  onProgress(`Writing personalised outreach for ${company}…`);
  const context = buildContext(company, whyNow, contacts, icp);
  let bestOutput = '';
  let bestScore = 0;
  let iterations = 0;

  for (let i = 0; i < 3; i++) {
    iterations++;
    const feedback = bestScore > 0 ? `\n\nPrevious attempt scored ${bestScore}/100. Feedback: ${bestOutput}` : '';

    const response = await anthropic.messages.create({
      model: MODELS.OPUS,
      max_tokens: 2048,
      system: WRITER_SYSTEM,
      messages: [
        {
          role: 'user',
          content: `Write compelling sales outreach using this intelligence:\n\n${context}${feedback}`,
        },
      ],
    });

    const text = response.content.find(b => b.type === 'text');
    const raw = text && text.type === 'text' ? text.text : '';

    onProgress(`Evaluating quality (attempt ${i + 1})…`);
    const { score, feedback: evalFeedback } = await evaluate(raw);
    onProgress(`Quality score: ${score}/100`);

    if (score > bestScore) {
      bestScore = score;
      bestOutput = raw;
    }

    if (score >= 80) break;
    if (i < 2) {
      onProgress(`Regenerating with improvements…`);
      bestOutput = evalFeedback;
    }
  }

  try {
    const jsonMatch = bestOutput.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        company,
        coldEmail: parsed.coldEmail || { subject: '', body: '' },
        linkedinDM: parsed.linkedinDM || '',
        followUpEmail: parsed.followUpEmail || { subject: '', body: '' },
        qualityScore: bestScore,
        iterations,
      };
    }
  } catch {}

  return {
    company,
    coldEmail: { subject: `Re: ${company}`, body: bestOutput.slice(0, 500) },
    linkedinDM: '',
    followUpEmail: { subject: 'Following up', body: '' },
    qualityScore: bestScore,
    iterations,
  };
}
