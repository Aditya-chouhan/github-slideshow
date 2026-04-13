import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'NEXUS Brain — AI Revenue Operating System' };

const TERMINALS = [
  {
    id: 'sales', name: 'Sales Terminal',
    description: 'Research any company and get ready-to-send personalised outreach in 90 seconds.',
    colorClass: 'from-indigo-500 to-purple-600',
    borderClass: 'border-indigo-500/30 hover:border-indigo-500/60',
    badgeClass: 'bg-indigo-900/50 text-indigo-300',
    agents: [
      { name: 'Why Now Engine', desc: 'Funding, hiring & news signals', emoji: '⚡' },
      { name: 'Contact Intelligence', desc: 'Decision-maker identification', emoji: '👤' },
      { name: 'ICP Fit Scorer', desc: '6-dimension prospect scoring', emoji: '🎯' },
      { name: 'Outreach Writer', desc: 'Self-evaluating copy (claude-opus-4-6)', emoji: '✍️' },
      { name: 'Account Memory', desc: 'Cross-terminal intelligence store', emoji: '🧠' },
    ],
    href: '/sales', cta: 'Launch Sales Terminal →', tagline: 'Type a company name. Get a full brief + emails.',
  },
  {
    id: 'marketing', name: 'Marketing Terminal',
    description: 'Create campaigns, content, SEO strategies, and personalised copy — powered by your Sales data.',
    colorClass: 'from-pink-500 to-rose-600',
    borderClass: 'border-pink-500/30 hover:border-pink-500/60',
    badgeClass: 'bg-pink-900/50 text-pink-300',
    agents: [
      { name: 'Content Writer', desc: 'LinkedIn, email, Twitter, ads', emoji: '✍️' },
      { name: 'Campaign Strategist', desc: '30-day full campaign plan', emoji: '📋' },
      { name: 'SEO Agent', desc: 'Keywords, gaps & content outline', emoji: '🔍' },
      { name: 'Personalization Agent', desc: 'Uses Sales intelligence for ABM', emoji: '🎯' },
      { name: 'Analytics Interpreter', desc: 'Metrics → highest-ROI actions', emoji: '📊' },
    ],
    href: '/marketing', cta: 'Launch Marketing Terminal →', tagline: 'Choose a mode. Get professional output.',
  },
];

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#111827] border border-[#1e293b] text-xs text-[#94a3b8] mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          NEXUS Brain — 10 Claude claude-opus-4-6 agents active
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
          Your AI{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Revenue Operating System</span>
        </h1>
        <p className="text-lg text-[#94a3b8] max-w-2xl mx-auto">
          Sales and Marketing agents share one brain. Research a prospect in Sales — Marketing automatically uses that intelligence for personalised campaigns.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
        {TERMINALS.map((terminal) => (
          <div key={terminal.id} className={`rounded-2xl border bg-[#111827] p-6 transition-all duration-200 ${terminal.borderClass}`}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-3 ${terminal.badgeClass}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                  {terminal.name}
                </div>
                <p className="text-[#94a3b8] text-sm leading-relaxed">{terminal.description}</p>
              </div>
            </div>
            <div className="space-y-2 mb-6">
              {terminal.agents.map((agent) => (
                <div key={agent.name} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[#0a0e1a] border border-[#1e293b]">
                  <span className="text-base">{agent.emoji}</span>
                  <div>
                    <p className="text-xs font-semibold text-white">{agent.name}</p>
                    <p className="text-xs text-[#94a3b8]">{agent.desc}</p>
                  </div>
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </div>
              ))}
            </div>
            <Link href={terminal.href} className={`block w-full text-center py-3 rounded-xl font-semibold text-white text-sm bg-gradient-to-r ${terminal.colorClass} hover:opacity-90 transition-opacity`}>
              {terminal.cta}
            </Link>
            <p className="text-center text-xs text-[#94a3b8] mt-2">{terminal.tagline}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-[#1e293b] bg-[#111827] p-6 text-center">
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="text-2xl">🧠</div>
          <div className="h-px flex-1 bg-gradient-to-r from-indigo-500/50 to-transparent max-w-[80px]" />
          <div className="px-4 py-2 rounded-full border border-[#1e293b] text-xs font-semibold text-white bg-[#0a0e1a]">NEXUS Brain</div>
          <div className="h-px flex-1 bg-gradient-to-l from-pink-500/50 to-transparent max-w-[80px]" />
          <div className="text-2xl">🎯</div>
        </div>
        <h2 className="font-bold text-white mb-2">Sales → Marketing Intelligence Bridge</h2>
        <p className="text-sm text-[#94a3b8] max-w-lg mx-auto">
          When you research a company in Sales Terminal, the Marketing Terminal&apos;s Personalization Agent automatically accesses that intelligence to write hyper-targeted copy. No copy-paste. No manual handoff.
        </p>
      </div>

      <div className="text-center mt-8 text-xs text-[#94a3b8]">
        Powered by <span className="text-indigo-400 font-semibold">Claude claude-opus-4-6</span>{' · '}Orchestrator + subagent architecture{' · '}90.2% better than single-agent systems
      </div>
    </div>
  );
}
