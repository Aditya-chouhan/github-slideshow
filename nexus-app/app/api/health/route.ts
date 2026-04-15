import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  const agentKeys = [
    'NEXUS_AGENT_WHY_NOW', 'NEXUS_AGENT_CONTACT_INTEL', 'NEXUS_AGENT_ICP_SCORER',
    'NEXUS_AGENT_OUTREACH_WRITER', 'NEXUS_AGENT_CONTENT_WRITER', 'NEXUS_AGENT_CAMPAIGN_STRATEGIST',
    'NEXUS_AGENT_SEO_KEYWORD', 'NEXUS_AGENT_PERSONALIZATION', 'NEXUS_AGENT_ANALYTICS',
    'NEXUS_AGENT_CHURN_PREDICTOR', 'NEXUS_AGENT_EXPANSION_INTEL', 'NEXUS_AGENT_REVENUE_HEALTH',
    'NEXUS_AGENT_PRICING_INTEL', 'NEXUS_AGENT_PRODUCT_COMPETITIVE', 'NEXUS_AGENT_MARKET_INTEL',
    'NEXUS_AGENT_FINANCIAL_FORECASTING', 'NEXUS_AGENT_SPEND_INTEL',
    'NEXUS_AGENT_EXECUTIVE_INTEL', 'NEXUS_AGENT_MASTER_BRAIN',
  ];

  const agentCount = agentKeys.filter(k => !!process.env[k]).length;

  return NextResponse.json({
    ok: true,
    env: {
      ANTHROPIC_API_KEY: !!process.env.ANTHROPIC_API_KEY,
      TAVILY_API_KEY: !!process.env.TAVILY_API_KEY,
      MANAGED_AGENTS_ENABLED: process.env.MANAGED_AGENTS_ENABLED ?? 'not set',
      agents_configured: `${agentCount}/${agentKeys.length}`,
    },
  });
}
