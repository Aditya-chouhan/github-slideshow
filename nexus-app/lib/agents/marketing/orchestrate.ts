import { runContentWriter } from './contentWriter';
import { runCampaignStrategist } from './campaignStrategist';
import { runSEOAgent } from './seoAgent';
import { runPersonalizationAgent } from './personalizationAgent';
import { runAnalyticsInterpreter } from './analyticsInterpreter';
import { getAccountByCompany } from '../accountMemory';
import type { AgentEvent, MarketingMode, MarketingResult } from '../../types';

const AGENT_META: Record<MarketingMode, { name: string; description: string; emoji: string }> = {
  content: { name: 'Content Writer', description: 'Creating 4 content formats', emoji: '✍️' },
  campaign: { name: 'Campaign Strategist', description: 'Building 30-day campaign plan', emoji: '📋' },
  seo: { name: 'SEO Agent', description: 'Analysing keyword opportunities', emoji: '🔍' },
  personalization: { name: 'Personalization Agent', description: 'Personalising from Sales intelligence', emoji: '🎯' },
  analytics: { name: 'Analytics Interpreter', description: 'Turning metrics into insights', emoji: '📊' },
};

export async function orchestrateMarketing(
  mode: MarketingMode,
  input: string,
  emit: (event: AgentEvent) => void
): Promise<MarketingResult> {
  const meta = AGENT_META[mode];
  emit({ type: 'agent_start', agent: meta.name, description: meta.description, emoji: meta.emoji });

  const result: MarketingResult = { mode, input, completedAt: new Date().toISOString() };

  switch (mode) {
    case 'content': {
      result.content = await runContentWriter(input, (text) => emit({ type: 'agent_progress', agent: meta.name, text }));
      emit({ type: 'agent_complete', agent: meta.name, summary: '4 content formats ready' });
      break;
    }
    case 'campaign': {
      const campaign = await runCampaignStrategist(input, (text) => emit({ type: 'agent_progress', agent: meta.name, text }));
      result.campaign = campaign;
      emit({ type: 'agent_complete', agent: meta.name, summary: `${campaign.channels.length} channels, ${campaign.thirtyDaySequence.length} weeks planned` });
      break;
    }
    case 'seo': {
      const seo = await runSEOAgent(input, (text) => emit({ type: 'agent_progress', agent: meta.name, text }));
      result.seo = seo;
      emit({ type: 'agent_complete', agent: meta.name, summary: `${seo.keywords.length} keywords, ${seo.contentGaps.length} gaps identified` });
      break;
    }
    case 'personalization': {
      const account = getAccountByCompany(input);
      if (account) emit({ type: 'agent_progress', agent: meta.name, text: `✅ Found Sales intelligence for ${account.company} — applying to copy` });
      const personalization = await runPersonalizationAgent(input, account ?? null, (text) => emit({ type: 'agent_progress', agent: meta.name, text }));
      result.personalization = personalization;
      emit({ type: 'agent_complete', agent: meta.name, summary: `Personalised for ${personalization.company}` });
      break;
    }
    case 'analytics': {
      const analytics = await runAnalyticsInterpreter(input, (text) => emit({ type: 'agent_progress', agent: meta.name, text }));
      result.analytics = analytics;
      emit({ type: 'agent_complete', agent: meta.name, summary: `Health: ${analytics.overallHealth} · ${analytics.nextActions.length} actions recommended` });
      break;
    }
  }

  emit({ type: 'marketing_complete', result });
  return result;
}
