'use client';

import { useState, useCallback } from 'react';
import MarketingPipeline from '@/components/MarketingPipeline';
import MarketingPanel from '@/components/MarketingPanel';
import AccountMemory from '@/components/AccountMemory';
import type { AgentEvent, MarketingMode, MarketingResult, AccountRecord } from '@/lib/types';

const MODES = [
  { id: 'content' as MarketingMode, label: 'Content Writer', emoji: '\u270d\ufe0f', placeholder: 'Describe your product/service and target audience', description: 'Generates LinkedIn post, email newsletter, Twitter thread, and ad copy' },
  { id: 'campaign' as MarketingMode, label: 'Campaign Strategist', emoji: '\ud83d\udccb', placeholder: 'Describe your product, audience, goal, and rough budget', description: 'Creates a complete 30-day campaign plan with channels, messaging, and weekly sequence' },
  { id: 'seo' as MarketingMode, label: 'SEO Agent', emoji: '\ud83d\udd0d', placeholder: 'Enter a topic, keyword, or competitor URL to analyse', description: 'Finds keyword opportunities, content gaps, and writes a full SEO-optimised article outline' },
  { id: 'personalization' as MarketingMode, label: 'Personalization', emoji: '\ud83c\udfaf', placeholder: 'Enter a company name (uses Sales Terminal data if available)', description: 'Writes hyper-personalised copy using Sales intelligence from NEXUS Brain' },
  { id: 'analytics' as MarketingMode, label: 'Analytics', emoji: '\ud83d\udcca', placeholder: 'Paste your metrics (impressions, clicks, conversions, spend, etc.)', description: 'Interprets your metrics and identifies the highest-ROI next actions' },
];

export default function MarketingTerminal() {
  const [mode, setMode] = useState<MarketingMode>('content');
  const [input, setInput] = useState('');
  const [running, setRunning] = useState(false);
  const [events, setEvents] = useState<AgentEvent[]>([]);
  const [result, setResult] = useState<MarketingResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const currentMode = MODES.find(m => m.id === mode)!;

  const handleSelectAccount = (account: AccountRecord) => { setMode('personalization'); setInput(account.company); };

  const run = useCallback(async () => {
    if (!input.trim() || running) return;
    setRunning(true); setEvents([]); setResult(null); setError(null);
    try {
      const response = await fetch('/api/marketing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, input: input.trim() }),
      });
      if (!response.ok) throw new Error(`API error ${response.status}`);
      if (!response.body) throw new Error('No response body');
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const lines = decoder.decode(value, { stream: true }).split('\n').filter(l => l.trim());
        for (const line of lines) {
          try {
            const event = JSON.parse(line) as AgentEvent;
            setEvents(prev => [...prev, event]);
            if (event.type === 'marketing_complete') setResult(event.result);
            if (event.type === 'error') setError(event.message);
          } catch {}
        }
      }
    } catch (err) {
      if (err instanceof Error) setError(err.message);
    } finally { setRunning(false); }
  }, [mode, input, running]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2.5 h-2.5 rounded-full bg-pink-400 animate-pulse" />
          <span className="text-xs font-semibold text-pink-400 uppercase tracking-wider">Marketing Terminal</span>
        </div>
        <h1 className="text-2xl font-bold text-white">AI Marketing Intelligence</h1>
        <p className="text-[#94a3b8] text-sm mt-1">5 specialised agents. Content, campaigns, SEO, personalisation, and analytics — all powered by Claude claude-opus-4-6.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-5">
          <div className="flex flex-wrap gap-2">
            {MODES.map(m => (
              <button key={m.id} onClick={() => { setMode(m.id); setResult(null); setEvents([]); setError(null); }} disabled={running}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all border ${
                  mode === m.id ? 'bg-pink-600 text-white border-pink-500' : 'bg-[#111827] text-[#94a3b8] border-[#1e293b] hover:text-white hover:border-pink-500/30'
                } disabled:opacity-50`}>
                {m.emoji} {m.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-[#94a3b8]">{currentMode.description}</p>
          <div className="space-y-3">
            <textarea value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) && run()}
              placeholder={currentMode.placeholder} disabled={running} rows={4}
              className="w-full px-4 py-3 rounded-xl bg-[#111827] border border-[#1e293b] text-white placeholder-[#475569] text-sm focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 disabled:opacity-50 resize-none" />
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#475569]">⌘+Enter to run</span>
              <button onClick={run} disabled={running || !input.trim()}
                className="px-6 py-2.5 rounded-xl font-semibold text-white text-sm bg-gradient-to-r from-pink-500 to-rose-600 hover:opacity-90 disabled:opacity-40 transition-opacity">
                {running ? <span className="flex items-center gap-2"><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Running…</span> : `Run ${currentMode.emoji} ${currentMode.label} →`}
              </button>
            </div>
          </div>
          {(events.length > 0 || running) && <MarketingPipeline events={events} running={running} />}
          {error && <div className="rounded-xl border border-red-800 bg-red-950/30 px-4 py-3 text-sm text-red-400">Error: {error}</div>}
          {result && <MarketingPanel result={result} />}
          {events.length === 0 && !running && !result && (
            <div className="rounded-2xl border border-dashed border-[#1e293b] p-12 text-center">
              <div className="text-3xl mb-3">{currentMode.emoji}</div>
              <p className="text-[#94a3b8] text-sm">{currentMode.description}</p>
              <p className="text-xs text-[#475569] mt-1">Fill in the field above and click Run</p>
            </div>
          )}
        </div>
        <div className="space-y-6">
          <div className="rounded-2xl border border-indigo-900/50 bg-indigo-950/20 p-5">
            <div className="flex items-center gap-2 mb-2"><span>🧠</span><h3 className="font-semibold text-white text-sm">Sales → Marketing Bridge</h3></div>
            <p className="text-xs text-[#94a3b8] mb-3">Click any account below to use Sales intelligence for the Personalization agent.</p>
            <AccountMemory onSelectAccount={handleSelectAccount} />
          </div>
          <div className="rounded-2xl border border-[#1e293b] bg-[#111827] p-5">
            <h3 className="font-semibold text-white text-sm mb-3">5 Agents</h3>
            <div className="space-y-3">
              {MODES.map(m => (
                <div key={m.id} className="flex gap-2"><span className="text-base shrink-0">{m.emoji}</span><div><p className="text-xs font-semibold text-white">{m.label}</p><p className="text-xs text-[#94a3b8]">{m.description}</p></div></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
