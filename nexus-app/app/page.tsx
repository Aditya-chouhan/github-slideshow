import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'NEXUS Brain — Enterprise AI Platform' };

const TERMINALS = [
  {
    id: 'brain',
    name: 'Master Brain',
    description: 'Ask any business question in plain English. The Brain routes it to the right agents and synthesizes an executive answer.',
    colorClass: 'from-indigo-500 via-purple-500 to-pink-500',
    borderClass: 'border-indigo-500/40 hover:border-indigo-400/70',
    badgeClass: 'bg-indigo-900/60 text-indigo-200',
    agents: [
      { name: 'Master Brain Orchestrator', desc: 'Routes any question to the right agents', emoji: '🧠' },
      { name: 'Executive Intelligence', desc: 'Synthesizes cross-functional insights', emoji: '👔' },
    ],
    href: '/brain', cta: 'Launch Brain →', tagline: 'Ask anything. Get an executive brief.',
    featured: true,
  },
  {
    id: 'sales',
    name: 'Sales Terminal',
    description: 'Research any company and get ready-to-send personalised outreach in 90 seconds.',
    colorClass: 'from-indigo-500 to-purple-600',
    borderClass: 'border-indigo-500/30 hover:border-indigo-500/60',
    badgeClass: 'bg-indigo-900/50 text-indigo-300',
    agents: [
      { name: 'Why Now Engine', desc: 'Funding, hiring & news signals', emoji: '⚡' },
      { name: 'Contact Intelligence', desc: 'Decision-maker identification', emoji: '👤' },
      { name: 'ICP Fit Scorer', desc: '6-dimension prospect scoring', emoji: '🎯' },
      { name: 'Outreach Writer', desc: 'Self-evaluating copy (Opus 4)', emoji: '✍️' },
    ],
    href: '/sales', cta: 'Launch Sales Terminal →', tagline: 'Type a company name. Get a full brief + emails.',
    featured: false,
  },
  {
    id: 'marketing',
    name: 'Marketing Terminal',
    description: 'Create campaigns, content, SEO strategies, and personalised copy — powered by your Sales data.',
    colorClass: 'from-pink-500 to-rose-600',
    borderClass: 'border-pink-500/30 hover:border-pink-500/60',
    badgeClass: 'bg-pink-900/50 text-pink-300',
    agents: [
      { name: 'Content Writer', desc: 'LinkedIn, email, Twitter, ads', emoji: '✍️' },
      { name: 'Campaign Strategist', desc: '30-day full campaign plan', emoji: '📋' },
      { name: 'SEO Agent', desc: 'Keywords, gaps & content outline', emoji: '🔍' },
      { name: 'Personalization Agent', desc: 'ABM using Sales intelligence', emoji: '🎯' },
      { name: 'Analytics Interpreter', desc: 'Metrics → highest-ROI actions', emoji: '📊' },
    ],
    href: '/marketing', cta: 'Launch Marketing Terminal →', tagline: 'Choose a mode. Get professional output.',
    featured: false,
  },
  {
    id: 'revenue',
    name: 'Revenue Operations',
    description: 'Monitor churn risk, find expansion opportunities, and track revenue health metrics in real-time.',
    colorClass: 'from-green-500 to-emerald-600',
    borderClass: 'border-green-500/30 hover:border-green-500/60',
    badgeClass: 'bg-green-900/50 text-green-300',
    agents: [
      { name: 'Churn Predictor', desc: 'AI-powered churn risk scoring', emoji: '🚨' },
      { name: 'Expansion Intelligence', desc: 'Upsell & cross-sell signals', emoji: '📈' },
      { name: 'Revenue Health Monitor', desc: 'NRR, GRR, CAC, LTV tracking', emoji: '💰' },
    ],
    href: '/revenue', cta: 'Launch Revenue Ops →', tagline: 'Predict churn. Find expansion. Monitor health.',
    featured: false,
  },
  {
    id: 'competitive',
    name: 'Competitive Intel',
    description: 'Track competitor pricing, product moves, and market trends. Stay ahead of every competitive threat.',
    colorClass: 'from-purple-500 to-violet-600',
    borderClass: 'border-purple-500/30 hover:border-purple-500/60',
    badgeClass: 'bg-purple-900/50 text-purple-300',
    agents: [
      { name: 'Pricing Intelligence', desc: 'Competitor pricing & packaging', emoji: '💲' },
      { name: 'Product Competitive', desc: 'Feature announcements & threats', emoji: '🏆' },
      { name: 'Market Intelligence', desc: 'Trends, analyst sentiment & M&A', emoji: '🌍' },
    ],
    href: '/competitive', cta: 'Launch Competitive Intel →', tagline: 'Know every move before it happens.',
    featured: false,
  },
  {
    id: 'finance',
    name: 'Finance Terminal',
    description: 'Build ARR forecasts, optimize spending, and get CFO-level financial intelligence.',
    colorClass: 'from-cyan-500 to-blue-600',
    borderClass: 'border-cyan-500/30 hover:border-cyan-500/60',
    badgeClass: 'bg-cyan-900/50 text-cyan-300',
    agents: [
      { name: 'Financial Forecasting', desc: '3-scenario ARR projections', emoji: '📉' },
      { name: 'Spend Intelligence', desc: 'Waste detection & optimization', emoji: '💳' },
    ],
    href: '/finance', cta: 'Launch Finance Terminal →', tagline: 'Forecast, optimize, and plan with confidence.',
    featured: false,
  },
];

export default function HomePage() {
  const [brainTerminal, ...otherTerminals] = TERMINALS;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      {/* Hero */}
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#111827] border border-[#1e293b] text-xs text-[#94a3b8] mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          NEXUS Brain — 19 Claude Managed Agents active
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
          Your Enterprise{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">AI Brain</span>
        </h1>
        <p className="text-lg text-[#94a3b8] max-w-2xl mx-auto">
          19 specialized AI agents across Sales, Marketing, Revenue Ops, Competitive Intel, and Finance — all controlled by one Master Brain.
        </p>
      </div>

      {/* Brain — featured full-width */}
      <div className={`rounded-2xl border bg-gradient-to-br from-[#0d1023] to-[#111827] p-8 mb-8 transition-all duration-200 ${brainTerminal.borderClass}`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-3 ${brainTerminal.badgeClass}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              {brainTerminal.name}
            </div>
            <p className="text-[#94a3b8] text-sm leading-relaxed max-w-lg">{brainTerminal.description}</p>
          </div>
          <Link href={brainTerminal.href} className={`shrink-0 px-8 py-3 rounded-xl font-bold text-white text-sm bg-gradient-to-r ${brainTerminal.colorClass} hover:opacity-90 transition-opacity`}>
            {brainTerminal.cta}
          </Link>
        </div>
      </div>

      {/* Other terminals — grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {otherTerminals.map((terminal) => (
          <div key={terminal.id} className={`rounded-2xl border bg-[#111827] p-5 transition-all duration-200 flex flex-col ${terminal.borderClass}`}>
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-3 self-start ${terminal.badgeClass}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              {terminal.name}
            </div>
            <p className="text-[#94a3b8] text-xs leading-relaxed mb-4">{terminal.description}</p>
            <div className="space-y-1.5 mb-5 flex-1">
              {terminal.agents.map((agent) => (
                <div key={agent.name} className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg bg-[#0a0e1a] border border-[#1e293b]">
                  <span className="text-sm">{agent.emoji}</span>
                  <div>
                    <p className="text-xs font-semibold text-white leading-tight">{agent.name}</p>
                    <p className="text-xs text-[#64748b]">{agent.desc}</p>
                  </div>
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </div>
              ))}
            </div>
            <Link href={terminal.href} className={`block w-full text-center py-2.5 rounded-xl font-semibold text-white text-sm bg-gradient-to-r ${terminal.colorClass} hover:opacity-90 transition-opacity`}>
              {terminal.cta}
            </Link>
          </div>
        ))}
      </div>

      {/* Footer stat */}
      <div className="text-center mt-10 text-xs text-[#94a3b8]">
        Powered by <span className="text-indigo-400 font-semibold">Claude Opus 4 & Sonnet 4</span>
        {' · '}19 Claude Managed Agents
        {' · '}Parallel orchestration
        {' · '}Stream-first architecture
      </div>
    </div>
  );
}
