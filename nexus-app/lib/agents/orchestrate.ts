import { v4 as uuidv4 } from "uuid";
import { runWhyNowEngine } from "./whyNow";
import { runContactResearch } from "./contactResearch";
import { runICPScorer } from "./icpScorer";
import { runOutreachWriter } from "./outreachWriter";
import { saveAccount, isDuplicate } from "../memory";
import type { ProspectInput, AccountRecord, AgentEvent, AgentName } from "../types";

export async function runPipeline(
  input: ProspectInput,
  emit: (event: AgentEvent) => void
): Promise<AccountRecord> {
  const id = uuidv4();
  const now = new Date().toISOString();

  function send(agent: AgentName, type: AgentEvent["type"], message: string, data?: AgentEvent["data"]) {
    emit({ type, agent, message, data, timestamp: Date.now() });
  }

  const existing = isDuplicate(input.company, input.contactName);
  if (existing) {
    send("memory", "agent_progress", `⚠ ${input.contactName} at ${input.company} already in memory. Returning existing intelligence.`);
    return existing;
  }

  send("why-now", "agent_start", `Starting Why Now Engine for ${input.company}...`);
  let whyNowResult;
  try {
    whyNowResult = await runWhyNowEngine(input.company, input.website, input.yourProduct, (msg) => send("why-now", "agent_progress", msg));
    send("why-now", "agent_complete", `✓ ${whyNowResult.signals.length} signals found.`, { signals: whyNowResult.signals, whyNowSummary: whyNowResult.whyNowSummary, companyOverview: whyNowResult.companyOverview });
  } catch (err) {
    send("why-now", "agent_error", `Why Now Engine error: ${(err as Error).message}`);
    throw err;
  }

  send("contact-research", "agent_start", `Researching ${input.contactName} (${input.contactRole})...`);
  let contactIntel;
  try {
    contactIntel = await runContactResearch(input.contactName, input.contactRole, input.company, input.contactLinkedIn, input.yourProduct, (msg) => send("contact-research", "agent_progress", msg));
    send("contact-research", "agent_complete", `✓ Contact profile built.`, { contact: contactIntel });
  } catch (err) {
    send("contact-research", "agent_error", `Contact Research error: ${(err as Error).message}`);
    throw err;
  }

  const partialIntel = { company: input.company, website: input.website, companyOverview: whyNowResult.companyOverview, signals: whyNowResult.signals, whyNowSummary: whyNowResult.whyNowSummary, contact: contactIntel };

  send("icp-scorer", "agent_start", `Scoring ICP fit for ${input.company}...`);
  let icpResult;
  try {
    icpResult = await runICPScorer({ company: input.company, companyOverview: whyNowResult.companyOverview, signals: whyNowResult.signals, contact: contactIntel, yourProduct: input.yourProduct, yourCompany: input.yourCompany }, (msg) => send("icp-scorer", "agent_progress", msg));
    send("icp-scorer", "agent_complete", `✓ ICP fit: ${icpResult.icpFit.toUpperCase()}`, { icpFit: icpResult.icpFit, icpReason: icpResult.icpReason });
  } catch (err) {
    send("icp-scorer", "agent_error", `ICP Scorer error: ${(err as Error).message}`);
    throw err;
  }

  const fullIntel = { ...partialIntel, ...icpResult };

  send("outreach-writer", "agent_start", `Writing personalised outreach for ${input.contactName}...`);
  let outreach;
  try {
    outreach = await runOutreachWriter(fullIntel, input.yourProduct, input.yourName, input.yourCompany, (msg) => send("outreach-writer", "agent_progress", msg));
    send("outreach-writer", "agent_complete", `✓ Email, LinkedIn DM, and connection note ready.`, { outreach });
  } catch (err) {
    send("outreach-writer", "agent_error", `Outreach Writer error: ${(err as Error).message}`);
    throw err;
  }

  send("memory", "agent_start", `Saving account intelligence...`);
  const record: AccountRecord = { id, createdAt: now, updatedAt: now, input, intelligence: fullIntel, outreach, status: "researched", notes: "" };

  try {
    saveAccount(record);
    send("memory", "agent_complete", `✓ ${input.company} saved to account memory.`);
  } catch (err) {
    send("memory", "agent_error", `Memory save error: ${(err as Error).message}`);
  }

  send("memory", "pipeline_complete", `Pipeline complete. Intelligence brief and 3 outreach variants ready for ${input.contactName} at ${input.company}.`, { outreach, ...fullIntel });
  return record;
}