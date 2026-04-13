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

// ── Streaming events ───────────────────────────────────────────────────────────

export type AgentEvent =
  | { type: 'agent_start'; agent: string; description: string; emoji: string }
  | { type: 'agent_progress'; agent: string; text: string }
  | { type: 'agent_tool_call'; agent: string; tool: string; query: string }
  | { type: 'agent_complete'; agent: string; summary: string }
  | { type: 'pipeline_complete'; result: SalesResult }
  | { type: 'marketing_complete'; result: MarketingResult }
  | { type: 'error'; message: string };
