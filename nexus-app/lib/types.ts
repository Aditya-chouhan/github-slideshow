export interface ProspectInput {
  company: string;
  website?: string;
  contactName: string;
  contactRole: string;
  contactLinkedIn?: string;
  yourProduct: string;
  yourName: string;
  yourCompany: string;
}

export interface Signal {
  type: "funding" | "hiring" | "product" | "leadership" | "news" | "intent" | "social";
  title: string;
  summary: string;
  relevance: "high" | "medium" | "low";
  source?: string;
  date?: string;
}

export interface ContactIntel {
  name: string;
  role: string;
  background: string;
  recentActivity: string;
  likelyPriorities: string[];
  bestAngle: string;
}

export interface AccountIntelligence {
  company: string;
  website?: string;
  companyOverview: string;
  signals: Signal[];
  whyNowSummary: string;
  contact: ContactIntel;
  icpFit: "strong" | "moderate" | "weak";
  icpReason: string;
}

export interface OutreachVariants {
  coldEmail: {
    subject: string;
    body: string;
    reasoning: string;
  };
  linkedInDM: {
    message: string;
    reasoning: string;
  };
  linkedInConnect: {
    note: string;
    reasoning: string;
  };
  _meta?: {
    qualityScore: number;
    attempts: number;
    evaluationFeedback?: string;
  };
}

export interface AccountRecord {
  id: string;
  createdAt: string;
  updatedAt: string;
  input: ProspectInput;
  intelligence: AccountIntelligence;
  outreach: OutreachVariants;
  status: "researched" | "contacted" | "replied" | "meeting" | "closed" | "not-fit";
  notes: string;
}

export type AgentEventType =
  | "agent_start"
  | "agent_progress"
  | "agent_complete"
  | "agent_error"
  | "pipeline_complete"
  | "pipeline_error";

export interface AgentEvent {
  type: AgentEventType;
  agent: AgentName;
  message: string;
  data?: Partial<AccountIntelligence & { outreach: OutreachVariants }>;
  timestamp: number;
}

export type AgentName =
  | "why-now"
  | "contact-research"
  | "icp-scorer"
  | "outreach-writer"
  | "memory";