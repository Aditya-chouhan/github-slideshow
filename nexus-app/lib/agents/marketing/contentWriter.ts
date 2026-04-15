import { MODELS } from '../../anthropic';
import { runManagedAgent } from '../../managedAgents';
import { AGENT_IDS } from '../../agentIds';
import type { ContentResult } from '../../types';

const SYSTEM = `You are the Content Writer Agent for NEXUS AI — powered by Claude Opus 4.

Your mission: Write 4 distinct, high-quality content pieces for a given product/service and target audience. Each format is crafted independently — not a rehash of the same text.

Rules:
- LinkedIn post: 150-200 words. Start with a hook. Include a concrete insight or data point. End with a question or CTA. NO hashtag spam (max 3 relevant hashtags).
- Email newsletter: 250-350 words. Subject line included. Conversational. Value-first. One clear CTA.
- Twitter thread: 5-7 tweets. Each tweet standalone but flows. Start with a hook tweet. Use numbers. End with CTA.
- Ad copy: Headline (max 8 words) + Primary text (max 100 words) + CTA button text. Platform: LinkedIn feed ad.

Output JSON:
{
  "linkedinPost": "full post text",
  "emailNewsletter": "Subject: ...\n\nBody...",
  "twitterThread": "1/7 Hook tweet\n\n2/7 ...",
  "adCopy": "Headline: ...\nPrimary: ...\nCTA: ..."
}
Output ONLY valid JSON. No markdown fences.`;

export async function runContentWriter(
  input: string,
  onProgress: (text: string) => void
): Promise<ContentResult> {
  onProgress('Writing LinkedIn post, email, Twitter thread, and ad copy…');

  const raw = await runManagedAgent(
    AGENT_IDS.CONTENT_WRITER,
    `Create all 4 content formats for:\n\n${input}\n\nMake each piece distinct, platform-appropriate, and ready to publish.`,
    { model: MODELS.OPUS, system: SYSTEM, tools: [] },
    onProgress
  );

  onProgress('Content generated — packaging results…');

  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        linkedinPost: parsed.linkedinPost || '',
        emailNewsletter: parsed.emailNewsletter || '',
        twitterThread: parsed.twitterThread || '',
        adCopy: parsed.adCopy || '',
      };
    }
  } catch {}

  return { linkedinPost: raw.slice(0, 500), emailNewsletter: '', twitterThread: '', adCopy: '' };
}
