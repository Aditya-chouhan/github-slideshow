// ─────────────────────────────────────────────────────────────────────────────
// NEXUS AI — Managed Agent ID Registry
// All 19 agent IDs read from environment variables (set by scripts/setup-agents.ts)
// ─────────────────────────────────────────────────────────────────────────────

export const AGENT_IDS = {
  // ── Sales Agents ─────────────────────────────────────────────────────────
  WHY_NOW:          process.env.NEXUS_AGENT_WHY_NOW          ?? '',
  CONTACT_INTEL:    process.env.NEXUS_AGENT_CONTACT_INTEL    ?? '',
  ICP_SCORER:       process.env.NEXUS_AGENT_ICP_SCORER       ?? '',
  OUTREACH_WRITER:  process.env.NEXUS_AGENT_OUTREACH_WRITER  ?? '',

  // ── Marketing Agents ─────────────────────────────────────────────────────
  CONTENT_WRITER:       process.env.NEXUS_AGENT_CONTENT_WRITER       ?? '',
  CAMPAIGN_STRATEGIST:  process.env.NEXUS_AGENT_CAMPAIGN_STRATEGIST  ?? '',
  SEO_KEYWORD:          process.env.NEXUS_AGENT_SEO_KEYWORD          ?? '',
  PERSONALIZATION:      process.env.NEXUS_AGENT_PERSONALIZATION      ?? '',
  ANALYTICS:            process.env.NEXUS_AGENT_ANALYTICS            ?? '',

  // ── Revenue Ops Agents ───────────────────────────────────────────────────
  CHURN_PREDICTOR:  process.env.NEXUS_AGENT_CHURN_PREDICTOR  ?? '',
  EXPANSION_INTEL:  process.env.NEXUS_AGENT_EXPANSION_INTEL  ?? '',
  REVENUE_HEALTH:   process.env.NEXUS_AGENT_REVENUE_HEALTH   ?? '',

  // ── Competitive Intelligence Agents ─────────────────────────────────────
  PRICING_INTEL:        process.env.NEXUS_AGENT_PRICING_INTEL        ?? '',
  PRODUCT_COMPETITIVE:  process.env.NEXUS_AGENT_PRODUCT_COMPETITIVE  ?? '',
  MARKET_INTEL:         process.env.NEXUS_AGENT_MARKET_INTEL         ?? '',

  // ── Finance Agents ───────────────────────────────────────────────────────
  FINANCIAL_FORECASTING: process.env.NEXUS_AGENT_FINANCIAL_FORECASTING ?? '',
  SPEND_INTEL:           process.env.NEXUS_AGENT_SPEND_INTEL           ?? '',

  // ── Executive Agent ──────────────────────────────────────────────────────
  EXECUTIVE_INTEL: process.env.NEXUS_AGENT_EXECUTIVE_INTEL ?? '',

  // ── Master Brain ─────────────────────────────────────────────────────────
  MASTER_BRAIN: process.env.NEXUS_AGENT_MASTER_BRAIN ?? '',

  // ── Shared Environment ───────────────────────────────────────────────────
  ENV_ID: process.env.NEXUS_ENVIRONMENT_ID ?? '',
} as const;

export type AgentKey = keyof typeof AGENT_IDS;
