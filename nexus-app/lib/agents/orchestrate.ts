import { randomUUID } from 'crypto';
import { runWhyNow } from './whyNow';
import { runContactResearch } from './contactResearch';
import { runICPScorer } from './icpScorer';
import { runOutreachWriter } from './outreachWriter';
import { saveAccount } from './accountMemory';
import type { AgentEvent, SalesResult } from '../types';

export async function orchestrateSales(
  company: string,
  emit: (event: AgentEvent) => void
): Promise<SalesResult> {
  emit({ type: 'agent_start', agent: 'Why Now Engine', description: 'Finding urgent buying signals', emoji: '⚡' });
  const whyNow = await runWhyNow(company, (text) =>
    emit({ type: 'agent_progress', agent: 'Why Now Engine', text })
  );
  emit({ type: 'agent_complete', agent: 'Why Now Engine', summary: `${whyNow.signals.length} signals found` });

  emit({ type: 'agent_start', agent: 'Contact Intelligence', description: 'Identifying decision-makers', emoji: '👤' });
  const contacts = await runContactResearch(company, whyNow, (text) =>
    emit({ type: 'agent_progress', agent: 'Contact Intelligence', text })
  );
  emit({ type: 'agent_complete', agent: 'Contact Intelligence', summary: `${contacts.contacts.length} contacts found` });

  emit({ type: 'agent_start', agent: 'ICP Fit Scorer', description: 'Scoring prospect fit', emoji: '🎯' });
  const icp = await runICPScorer(company, whyNow, (text) =>
    emit({ type: 'agent_progress', agent: 'ICP Fit Scorer', text })
  );
  emit({ type: 'agent_complete', agent: 'ICP Fit Scorer', summary: `Score: ${icp.score}/100 — ${icp.recommendation}` });

  emit({ type: 'agent_start', agent: 'Outreach Writer', description: 'Writing personalised copy (Claude claude-opus-4-6)', emoji: '✍️' });
  const outreach = await runOutreachWriter(company, whyNow, contacts, icp, (text) =>
    emit({ type: 'agent_progress', agent: 'Outreach Writer', text })
  );
  emit({ type: 'agent_complete', agent: 'Outreach Writer', summary: `Quality score: ${outreach.qualityScore}/100 (${outreach.iterations} pass${outreach.iterations > 1 ? 'es' : ''})` });

  emit({ type: 'agent_start', agent: 'Account Memory', description: 'Saving intelligence to NEXUS Brain', emoji: '🧠' });
  const accountId = randomUUID();
  const result: SalesResult = {
    company,
    whyNow,
    contacts,
    icp,
    outreach,
    accountId,
    completedAt: new Date().toISOString(),
  };
  saveAccount(result);
  emit({ type: 'agent_complete', agent: 'Account Memory', summary: `Saved to NEXUS Brain` });

  emit({ type: 'pipeline_complete', result });
  return result;
}
