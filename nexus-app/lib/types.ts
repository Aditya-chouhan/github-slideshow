// ─────────────────────────────────────────────────────────────────────────────
// NEXUS AI — Shared TypeScript interfaces
// ─────────────────────────────────────────────────────────────────────────────

// ── Sales ─────────────────────────────────────────────────────────────────────

export interface Signal {
  type: string;
  detail: string;
  sourceUrl?: string;
  urgency: 'high' | 'medium' | 'low';
}

export interface WhyNowResult {
  company: string;
  signals: Signal[];
  summary: string;
}

export interface Contact {
  name: string;
  title: string;
  linkedinUrl?: string;
  background: string;
  emailHint?: string;
}

export interface ContactResult {
  company: string;
  contacts: Contact[];
  summary: string;
}

export interface ICPDimension {
  name: string;
  score: number;
  note: string;
}

export interface ICPResult {
  company: string;
  score: number;
  rationale: string;
  dimensions: ICPDimension[];
  recommendation: 'pursue' | 'deprioritize' | 'nurture';
}

export interface OutreachResult {
  company: string;
  coldEmail: { subject: string; body: string };
  linkedinDM: string;
  followUpEmail: { subject: string; body: string };
  qualityScore: number;
  iterations: number;
}

export interface SalesResult {
  company: string;
  whyNow: WhyNowResult;
  contacts: ContactResult;
  icp: ICPResult;
  outreach: OutreachResult;
  accountId: string;
  completedAt: string;
}

export interface AccountRecord {
  id: string;
  company: string;
  createdAt: string;
  icpScore: number;
  recommendation: string;
  signals: Signal[];
  contacts: Contact[];
  outreach: OutreachResult;
}

// ── Marketing ─────────────────────────────────────────────────────────────────

export interface ContentResult {
  linkedinPost: string;
  emailNewsletter: string;
  twitterThread: string;
  adCopy: string;
}

export interface ChannelPlan {
  channel: string;
  rationale: string;
  tactics: string[];
  weeklyBudgetPercent: number;
}

export interface WeekPlan {
  week: number;
  theme: string;
  activities: string[];
  kpis: string[];
}

export interface CampaignResult {
  objective: string;
  targetAudience: string;
  messagingHierarchy: string[];
  channels: ChannelPlan[];
  thirtyDaySequence: WeekPlan[];
  budgetNotes: string;
}

export interface KeywordOpportunity {
  keyword: string;
  intent: 'informational' | 'commercial' | 'transactional';
  difficulty: 'low' | 'medium' | 'high';
  opportunity: string;
}

export interface OutlineSection {
  h2: string;
  keyPoints: string[];
}

export interface SEOResult {
  topic: string;
  keywords: KeywordOpportunity[];
  contentGaps: string[];
  outline: {
    title: string;
    metaDescription: string;
    h1: string;
    sections: OutlineSection[];
  };
}

export interface PersonalizationResult {
  company: string;
  linkedinPost: string;
  coldEmail: { subject: string; body: string };
  adCopy: string;
  personalizationRationale: string;
}

export interface Insight {
  finding: string;
  evidence: string;
  impact: 'high' | 'medium' | 'low';
}

export interface RecommendedAction {
  action: string;
  expectedImpact: string;
  priority: 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
}

export interface AnalyticsResult {
  overallHealth: 'strong' | 'average' | 'underperforming';
  summary: string;
  whatIsWorking: Insight[];
  whatIsFailing: Insight[];
  nextActions: RecommendedAction[];
}

export type MarketingMode = 'content' | 'campaign' | 'seo' | 'personalization' | 'analytics';

export interface MarketingResult {
  mode: MarketingMode;
  input: string;
  content?: ContentResult;
  campaign?: CampaignResult;
  seo?: SEOResult;
  personalization?: PersonalizationResult;
  analytics?: AnalyticsResult;
  completedAt: string;
}

// ── Revenue Operations ────────────────────────────────────────────────────────

export interface ChurnRisk {
  accountName: string;
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
  signals: string[];
  interventionRecommendation: string;
  churnProbability: number;
}

export interface ChurnResult {
  atRiskAccounts: ChurnRisk[];
  overallRiskLevel: 'critical' | 'high' | 'medium' | 'low';
  summary: string;
  immediateActions: string[];
}

export interface ExpansionOpportunity {
  accountName: string;
  opportunityType: 'upsell' | 'cross-sell' | 'expansion';
  estimatedARR: string;
  rationale: string;
  recommendedApproach: string;
  priority: 'high' | 'medium' | 'low';
}

export interface ExpansionResult {
  opportunities: ExpansionOpportunity[];
  totalPipelineEstimate: string;
  topPriorityAccount: string;
  summary: string;
}

export interface RevenueMetric {
  name: string;
  value: string;
  benchmark: string;
  trend: 'up' | 'down' | 'flat';
  status: 'healthy' | 'warning' | 'critical';
  note: string;
}

export interface RevenueHealthResult {
  metrics: RevenueMetric[];
  overallHealth: 'strong' | 'average' | 'at-risk';
  summary: string;
  alerts: string[];
  topRecommendations: string[];
}

export type RevenueMode = 'churn' | 'expansion' | 'health' | 'all';

export interface RevenueResult {
  mode: RevenueMode;
  input: string;
  churn?: ChurnResult;
  expansion?: ExpansionResult;
  revenueHealth?: RevenueHealthResult;
  completedAt: string;
}

// ── Competitive Intelligence ──────────────────────────────────────────────────

export interface PricingSignal {
  competitor: string;
  pricingModel: string;
  keyTiers: string[];
  recentChanges: string;
  strengthsVsYou: string[];
  weaknessesVsYou: string[];
}

export interface CompetitivePricingResult {
  signals: PricingSignal[];
  yourPositioning: string;
  pricingRecommendation: string;
  summary: string;
}

export interface ProductSignal {
  competitor: string;
  announcement: string;
  announcementDate: string;
  threatLevel: 'high' | 'medium' | 'low';
  customerImpact: string;
  responseRecommendation: string;
}

export interface FeatureGap {
  feature: string;
  competitorHas: string;
  yourStatus: string;
  urgency: 'high' | 'medium' | 'low';
}

export interface ProductCompetitiveResult {
  recentSignals: ProductSignal[];
  featureGaps: FeatureGap[];
  threatAssessment: string;
  summary: string;
}

export interface MarketTrend {
  trend: string;
  evidence: string;
  implication: string;
  timeframe: string;
  opportunity: boolean;
}

export interface MarketIntelResult {
  trends: MarketTrend[];
  marketSentiment: 'bullish' | 'neutral' | 'bearish';
  emergingThreats: string[];
  emergingOpportunities: string[];
  analystSummary: string;
  summary: string;
}

export type CompetitiveMode = 'pricing' | 'product' | 'market' | 'all';

export interface CompetitiveResult {
  mode: CompetitiveMode;
  input: string;
  pricing?: CompetitivePricingResult;
  productCompetitive?: ProductCompetitiveResult;
  marketIntel?: MarketIntelResult;
  completedAt: string;
}

// ── Finance ───────────────────────────────────────────────────────────────────

export interface ForecastScenario {
  name: 'base' | 'optimistic' | 'pessimistic';
  endOfYearARR: string;
  growthRate: string;
  keyAssumptions: string[];
  risks: string[];
}

export interface MonthlyProjection {
  month: string;
  newARR: string;
  churnedARR: string;
  netARR: string;
  cumulativeARR: string;
}

export interface ForecastResult {
  scenarios: ForecastScenario[];
  monthlyProjections: MonthlyProjection[];
  recommendation: string;
  keyRisks: string[];
  summary: string;
}

export interface SpendCategory {
  category: string;
  currentMonthlySpend: string;
  benchmarkPercent: string;
  wasteEstimate: string;
  optimizationOpportunity: string;
  priority: 'high' | 'medium' | 'low';
}

export interface SpendResult {
  categories: SpendCategory[];
  totalMonthlySpend: string;
  totalWasteEstimate: string;
  annualizedSavingsPotential: string;
  priorityActions: string[];
  summary: string;
}

export type FinanceMode = 'forecast' | 'spend' | 'all';

export interface FinanceResult {
  mode: FinanceMode;
  input: string;
  forecast?: ForecastResult;
  spend?: SpendResult;
  completedAt: string;
}

// ── Master Brain ──────────────────────────────────────────────────────────────

export interface BrainAgentCall {
  agentKey: string;
  agentName: string;
  input: string;
}

export interface BrainRoutingPlan {
  agents: BrainAgentCall[];
  rationale: string;
  parallel: boolean;
}

export interface BrainAgentResult {
  agentKey: string;
  agentName: string;
  output: string;
  success: boolean;
  error?: string;
}

export interface BrainResult {
  userMessage: string;
  plan: BrainRoutingPlan;
  agentResults: BrainAgentResult[];
  synthesis: string;
  completedAt: string;
}

// ── Streaming events ───────────────────────────────────────────────────────────

export type AgentEvent =
  // Core events (all terminals)
  | { type: 'agent_start';    agent: string; description: string; emoji: string }
  | { type: 'agent_progress'; agent: string; text: string }
  | { type: 'agent_tool_call'; agent: string; tool: string; query: string }
  | { type: 'agent_complete'; agent: string; summary: string }

  // Terminal completions
  | { type: 'pipeline_complete';    result: SalesResult }
  | { type: 'marketing_complete';   result: MarketingResult }
  | { type: 'revenue_complete';     result: RevenueResult }
  | { type: 'competitive_complete'; result: CompetitiveResult }
  | { type: 'finance_complete';     result: FinanceResult }

  // Brain-specific events
  | { type: 'brain_routing';       plan: BrainRoutingPlan }
  | { type: 'brain_agent_start';   agentKey: string; agentName: string }
  | { type: 'brain_agent_done';    agentKey: string; agentName: string; success: boolean }
  | { type: 'brain_synthesis';     text: string }
  | { type: 'brain_complete';      result: BrainResult }

  // Error
  | { type: 'error'; message: string };
