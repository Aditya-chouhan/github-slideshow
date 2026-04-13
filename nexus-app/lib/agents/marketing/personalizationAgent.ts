import { anthropic, MODELS } from '../../anthropic';
import type { PersonalizationResult, AccountRecord } from '../../types';

const SYSTEM = `You are the Personalization Agent for NEXUS AI — the intelligence bridge between Sales and Marketing.

Your mission: Write hyper-personalised marketing copy for a specific account using the sales intelligence gathered about them.

Output JSON:
{
  "company": "Company name",
  "linkedinPost": "A LinkedIn post that would resonate specifically with this company's situation",
  "coldEmail": {
    "subject": "Specific, under 8 words",
    "body": "Personalised email referencing their specific signals"
  },
  "adCopy": "A LinkedIn ad specifically targeting this company's profile (for ABM/account-based marketing)",
  "personalizationRationale": "1-paragraph explanation of what signals you used and why"
}`;

export async function runPersonalizationAgent(
  input: string,
  account: AccountRecord | null,
  onProgress: (text: string) => void
): Promise<PersonalizationResult> {
  onProgress(`Building personalised copy${account ? ` for ${account.company}` : ''}…`);

  const context = account
    ? `Company: ${account.company}\nICP Score: ${account.icpScore}/100 — ${account.recommendation}\nSignals: ${account.signals.map(s => `[${s.type}] ${s.detail}`).join('\n')}\nPrimary Contact: ${account.contacts[0] ? `${account.contacts[0].name}, ${account.contacts[0].title}` : 'Unknown'}\nContact Background: ${account.contacts[0]?.background || 'N/A'}`
    : `Company/context: ${input}`;

  const response = await anthropic.messages.create({
    model: MODELS.OPUS,
    max_tokens: 3000,
    system: SYSTEM,
    messages: [{
      role: 'user',
      content: `Create hyper-personalised marketing copy using this sales intelligence:\n\n${context}\n\nAdditional context: ${input}`,
    }],
  });

  onProgress('Personalisation complete…');
  const text = response.content.find(b => b.type === 'text');
  const raw = text && text.type === 'text' ? text.text : '';

  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        company: parsed.company || account?.company || input,
        linkedinPost: parsed.linkedinPost || '',
        coldEmail: parsed.coldEmail || { subject: '', body: '' },
        adCopy: parsed.adCopy || '',
        personalizationRationale: parsed.personalizationRationale || '',
      };
    }
  } catch {}

  return { company: account?.company || input, linkedinPost: raw.slice(0, 500), coldEmail: { subject: '', body: '' }, adCopy: '', personalizationRationale: '' };
}
