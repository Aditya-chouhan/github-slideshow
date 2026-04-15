import { MODELS } from '../anthropic';
import { runManagedAgent } from '../managedAgents';
import { AGENT_IDS } from '../agentIds';
import type { OutreachResult, WhyNowResult, ContactResult, ICPResult } from '../types';

const SYSTEM = `You are the Outreach Writer Agent for NEXUS AI — powered by Claude Opus 4.

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
  "coldEmail": { "subject": "...", "body": "Hi [Name],\n\n..." },
  "linkedinDM": "Hi [Name], noticed [Company] just [signal]...",
  "followUpEmail": { "subject": "One more thought", "body": "..." }
}
Output ONLY valid JSON. No markdown fences.`;

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

  const raw = await runManagedAgent(
    AGENT_IDS.OUTREACH_WRITER,
    `Write compelling sales outreach using this intelligence:\n\n${context}\n\nScore your own output. If quality < 8/10, revise once.`,
    { model: MODELS.OPUS, system: SYSTEM, tools: [] },
    onProgress
  );

  onProgress('Packaging outreach results…');

  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        company,
        coldEmail: parsed.coldEmail || { subject: '', body: '' },
        linkedinDM: parsed.linkedinDM || '',
        followUpEmail: parsed.followUpEmail || { subject: '', body: '' },
        qualityScore: 85,
        iterations: 1,
      };
    }
  } catch {}

  return {
    company,
    coldEmail: { subject: `Re: ${company}`, body: raw.slice(0, 500) },
    linkedinDM: '',
    followUpEmail: { subject: 'Following up', body: '' },
    qualityScore: 70,
    iterations: 1,
  };
}
